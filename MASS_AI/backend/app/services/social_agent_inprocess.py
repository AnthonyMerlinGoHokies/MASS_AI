import time
from urllib.parse import urlparse

# -------------------------------------------------------------------
# Social profile enrichment for Lead objects --- under construction
# -------------------------------------------------------------------

# Insert into ResearchAgentService.__init__ (or add these two lines if __init__ already exists)
# self._social_cache = {}  # simple in-memory cache: key -> (timestamp, payload)
# self._social_cache_ttl = 24 * 3600  # cache social lookups for 24 hours

async def _research_social_profiles(self, lead) -> Optional[dict]:
    """
    Populate lead social profiles: contact_twitter, contact_github, contact_medium.
    Strategy:
      1) If email present: run Hunter email_verifier (best-effort) to get a partial verification signal
      2) Serper site:twitter.com / site:github.com / site:medium.com queries for "First Last" + company
      3) For each candidate URL, run quick heuristics to verify (full-name match, company presence in snippet or url)
      4) Compute confidence% per field (0-100)
      5) Cache results in-memory for TTL to avoid repeated queries
    Returns:
      dict of discovered profiles & confidences, or None if nothing found.
    Side-effect:
      sets lead.contact_twitter, lead.contact_github, lead.contact_published_content
      adds runtime metadata at lead.research_metadata["social_profiles"]
    """
    # Simple safety checks
    first = (lead.contact_first_name or "").strip()
    last = (lead.contact_last_name or "").strip()
    full_name = f"{first} {last}".strip()
    company = (lead.contact_company or "").strip()

    if not full_name and not lead.contact_email:
        return None

    # initialize cache store if not present
    if not hasattr(self, "_social_cache"):
        self._social_cache = {}
        self._social_cache_ttl = 24 * 3600

    cache_key = None
    if lead.contact_email:
        cache_key = f"social|email:{lead.contact_email.lower()}"
    else:
        cache_key = f"social|name:{full_name.lower()}|company:{company.lower()}"

    # Check cache
    now = time.time()
    cached = self._social_cache.get(cache_key)
    if cached:
        ts, payload = cached
        if now - ts < self._social_cache_ttl:
            # populate lead fields from cached payload
            _apply_social_payload_to_lead(lead, payload)
            return payload

    # Prepare result structure
    payload = {
        "twitter": None,
        "github": None,
        "medium": None,
        "evidence": {},  # per-source evidence/snippet
        "confidences": {},  # per-field confidence 0-100
        "sources": [],  # list of sources used
    }

    # Helper: record candidate
    def _record(field, url, source, snippet, confidence_score):
        if not url:
            return
        payload["evidence"].setdefault(field, []).append({"url": url, "source": source, "snippet": snippet})
        # keep best confidence per field
        prev = payload["confidences"].get(field, 0.0)
        payload["confidences"][field] = max(prev, confidence_score)
        payload["sources"].append(source)
        # set canonical field values
        if field == "twitter" and not payload["twitter"]:
            payload["twitter"] = url
        if field == "github" and not payload["github"]:
            payload["github"] = url
        if field == "medium" and not payload["medium"]:
            payload["medium"] = url

    # Attempt 0: verify email if present (Hunter email_verifier gives deliverability)
    try:
        if lead.contact_email and hasattr(self, "hunter"):
            try:
                hv = self.hunter.email_verifier(lead.contact_email)
                # FakeHunter returns {"result":"deliverable"} in tests; real Hunter returns more structured JSON
                deliverable = False
                if isinstance(hv, dict):
                    # different possible shapes:
                    # {"result":"deliverable"} OR { "data": { "result": "deliverable" } }
                    if hv.get("result") == "deliverable":
                        deliverable = True
                    elif hv.get("data", {}).get("result") == "deliverable":
                        deliverable = True

                if deliverable:
                    # email deliverable increases trust in any profile tied to this email (but does not provide social)
                    payload.setdefault("email_verified", True)
                    # record a baseline confidence that email is valid
                    payload["confidences"]["email_verified"] = 60.0
                    payload["sources"].append("hunter_email_verify")
            except Exception as e:
                logger.debug(f"[SocialAgent] Hunter email verifier error: {e}")
    except Exception:
        # hunter not present or fails; continue with web fallback
        pass

    # Small delay between search calls to be polite and avoid throttle
    async def _sleep_brief():
        try:
            await asyncio.sleep(0.15)
        except Exception:
            pass

    # Helper: check if url appears to contain name/company tokens
    def _heuristic_score_for_url(url, snippet=""):
        score = 0.0
        parsed = ""
        try:
            parsed = urlparse(url).path.lower()
        except Exception:
            parsed = url.lower()

        # name tokens found in path increases score
        name_tokens = [tok for tok in (first, last) if tok]
        name_matches = sum(1 for tok in name_tokens if tok and tok.lower() in parsed)
        if name_matches >= 2:
            score += 0.45
        elif name_matches == 1:
            score += 0.25

        # company domain in url or snippet increases score
        if company:
            if company.lower().replace(" ", "") in parsed or company.lower() in (snippet or "").lower():
                score += 0.25

        # path length and presence of username-like structure increases score
        if "/" in parsed and len(parsed.strip("/")) < 60:
            score += 0.05

        # cap to 0..1
        return max(0.0, min(1.0, score))

    # Source strategy A: Apollo People (if available) - attempt to use apollo results (higher confidence)
    try:
        # try to use an Apollo client if available on the instance
        if hasattr(self, "apollo"):
            # If apollo client has search_people and lead has company domain, attempt a people search by name
            try:
                # Build a simple SimpleCompany like structure if domain exists
                from ..schemas.company import SimpleCompany
                sc = SimpleCompany(name=company or None, domain=(None if not company else None))
                # We will only call Apollo if method exists and is async
                if hasattr(self.apollo, "search_people"):
                    # search_people expects a SimpleCompany and optional personas
                    ap_res = await self.apollo.search_people(sc, personas=None, max_leads=5)
                    # ap_res is list of people dicts; find match by name/email
                    if isinstance(ap_res, list):
                        for p in ap_res:
                            # try to find twitter/github fields in returned person dict
                            # Common Apollo field names: "twitter", "twitter_url", "linkedin_url", "github"
                            tw = p.get("twitter") or p.get("twitter_url") or p.get("twitter_handle")
                            gh = p.get("github") or p.get("github_url")
                            # If apollo returns email and matches lead.email, boost confidence
                            ap_email = p.get("email")
                            match_by_email = (ap_email and lead.contact_email and ap_email.lower() == lead.contact_email.lower())
                            if tw:
                                conf = 0.9 if match_by_email else 0.8
                                _record("twitter", tw, "apollo", str(p)[:300], conf * 100.0)
                            if gh:
                                conf = 0.9 if match_by_email else 0.8
                                _record("github", gh, "apollo", str(p)[:300], conf * 100.0)
            except Exception as e:
                # Don't fail entire flow if Apollo call breaks
                logger.debug(f"[SocialAgent] Apollo people lookup failed: {e}")
        await _sleep_brief()
    except Exception:
        pass

    # Source strategy B: Serper site:twitter.com search
    try:
        if full_name:
            q = f'site:twitter.com "{full_name}" {company or ""}'
        elif lead.contact_email:
            # try searching by email local part
            local = lead.contact_email.split("@", 1)[0]
            q = f'site:twitter.com "{local}" {company or ""}'
        else:
            q = None

        if q:
            result = self.serper.search(q)
            await _sleep_brief()
            if result and "organic" in result:
                for item in result["organic"][:4]:
                    url = item.get("link") or item.get("url") or ""
                    snippet = (item.get("snippet") or "") + " " + (item.get("title") or "")
                    if not url:
                        continue
                    # Filter explicit twitter urls (ignore share.twitter.com etc.)
                    if "twitter.com" in url and "/status/" not in url:
                        # heuristic scoring
                        h = _heuristic_score_for_url(url, snippet)
                        # base confidence for serper exact match
                        conf = 0.7 * h + (0.1 if "profile" in url.lower() else 0.0)
                        _record("twitter", url, "serper", snippet[:400], conf * 100.0)
                        # prefer earliest high-confidence match
                        if payload["confidences"].get("twitter", 0) >= 85:
                            break
    except Exception as e:
        logger.debug(f"[SocialAgent] Serper twitter search failed: {e}")

    # Source strategy C: Serper site:github.com search
    try:
        q = None
        if full_name:
            q = f'site:github.com "{full_name}" {company or ""}'
        elif lead.contact_email:
            local = lead.contact_email.split("@", 1)[0]
            q = f'site:github.com "{local}" {company or ""}'
        if q:
            result = self.serper.search(q)
            await _sleep_brief()
            if result and "organic" in result:
                for item in result["organic"][:4]:
                    url = item.get("link") or item.get("url") or ""
                    snippet = (item.get("snippet") or "") + " " + (item.get("title") or "")
                    if not url:
                        continue
                    if "github.com" in url:
                        h = _heuristic_score_for_url(url, snippet)
                        conf = 0.65 * h + 0.1
                        _record("github", url, "serper", snippet[:400], conf * 100.0)
                        if payload["confidences"].get("github", 0) >= 85:
                            break
    except Exception as e:
        logger.debug(f"[SocialAgent] Serper github search failed: {e}")

    # Source strategy D: Serper site:medium.com / youtube / blog -> published content
    try:
        q = None
        if full_name:
            q = f'"{full_name}" {company or ""} (article OR blog OR talk OR medium.com OR youtube.com)'
        elif lead.contact_email:
            local = lead.contact_email.split("@", 1)[0]
            q = f'"{local}" {company or ""} (article OR blog OR talk OR medium.com OR youtube.com)'

        if q:
            result = self.serper.search(q)
            await _sleep_brief()
            if result and "organic" in result:
                content_items = []
                for item in result["organic"][:6]:
                    link = item.get("link") or item.get("url") or ""
                    title = item.get("title") or ""
                    snippet = item.get("snippet") or ""
                    if any(domain in (link or "") for domain in ["medium.com", "youtube.com", "blog", "speakerdeck.com"]):
                        content_items.append({"link": link, "title": title[:200], "snippet": snippet[:300]})
                        # record medium as published content if medium link found
                        if "medium.com" in (link or ""):
                            _record("medium", link, "serper", snippet[:400], 0.6 * 100.0)
                if content_items:
                    # store a joined snippet as recent activity/published content
                    published = "; ".join([c["title"] for c in content_items][:3])
                    # place into lead.contact_published_content only if empty or low confidence exists
                    prev = getattr(lead, "contact_published_content", None)
                    if not prev:
                        lead.contact_published_content = published
    except Exception as e:
        logger.debug(f"[SocialAgent] Serper published content search failed: {e}")

    # Final verification & confidence tuning:
    # - If email verified and username present in URL path -> boost confidence
    # - If same username appears across multiple sources -> boost
    try:
        # boost if email verified and username included in URL path
        if payload.get("twitter") and payload.get("confidences", {}).get("email_verified"):
            try:
                if lead.contact_email:
                    local = lead.contact_email.split("@", 1)[0].lower()
                    if local and local in payload["twitter"].lower():
                        payload["confidences"]["twitter"] = max(payload["confidences"].get("twitter", 0), 90.0)
            except Exception:
                pass

        # cross-source username matching (e.g., twitter username equals github path)
        try:
            def _username_from_url(u):
                if not u:
                    return None
                p = urlparse(u)
                path = p.path.strip("/").lower()
                # first segment often username
                if "/" in path:
                    return path.split("/")[0]
                return path or None

            tw_user = _username_from_url(payload.get("twitter"))
            gh_user = _username_from_url(payload.get("github"))
            if tw_user and gh_user and tw_user == gh_user:
                # raise both confidences
                payload["confidences"]["twitter"] = max(payload["confidences"].get("twitter", 0), 92.0)
                payload["confidences"]["github"] = max(payload["confidences"].get("github", 0), 92.0)
        except Exception:
            pass

        # write values to lead object with final confidence annotations
        if payload.get("twitter"):
            lead.contact_twitter = payload["twitter"]
        if payload.get("github"):
            lead.contact_github = payload["github"] if hasattr(lead, "contact_github") else None
        # contact_github is not in your schema yet - store in research_metadata if not present
        if not hasattr(lead, "contact_github") and payload.get("github"):
            # store it in runtime metadata so schema remains unchanged
            research_meta = getattr(lead, "research_metadata", {}) or {}
            research_meta["contact_github"] = payload["github"]
            research_meta.setdefault("social_confidences", {})
            research_meta["social_confidences"].update({
                "twitter": payload["confidences"].get("twitter", 0),
                "github": payload["confidences"].get("github", 0),
                "medium": payload["confidences"].get("medium", 0),
            })
            setattr(lead, "research_metadata", research_meta)
        else:
            # if schema has attribute, set a parallel confidences structure
            research_meta = getattr(lead, "research_metadata", {}) or {}
            research_meta.setdefault("social_confidences", {})
            research_meta["social_confidences"].update({
                "twitter": payload["confidences"].get("twitter", 0),
                "github": payload["confidences"].get("github", 0),
                "medium": payload["confidences"].get("medium", 0),
            })
            setattr(lead, "research_metadata", research_meta)

    except Exception as e:
        logger.debug(f"[SocialAgent] Error while finalizing social profile payload: {e}")

    # Cache the payload
    try:
        self._social_cache[cache_key] = (now, payload)
    except Exception:
        pass

    # Return payload if at least one profile found
    if payload.get("twitter") or payload.get("github") or payload.get("medium"):
        return payload

    return None


# -------------------------------------------------------------------
# Small helper used by cache application (keeps lead mutation logic concise)
# -------------------------------------------------------------------
def _apply_social_payload_to_lead(lead, payload):
    """
    Apply cached payload to lead object (mutates lead). This helper is used
    to avoid duplicating logic when returning cached results.
    """
    try:
        if payload.get("twitter"):
            lead.contact_twitter = payload["twitter"]
        if payload.get("github"):
            # if schema lacks contact_github, keep under research_metadata
            if hasattr(lead, "contact_github"):
                lead.contact_github = payload["github"]
            else:
                meta = getattr(lead, "research_metadata", {}) or {}
                meta["contact_github"] = payload["github"]
                setattr(lead, "research_metadata", meta)
        # published content
        if payload.get("medium") and not getattr(lead, "contact_published_content", None):
            lead.contact_published_content = payload["medium"]
        # confidences
        meta = getattr(lead, "research_metadata", {}) or {}
        meta.setdefault("social_confidences", {})
        meta["social_confidences"].update(payload.get("confidences", {}))
        setattr(lead, "research_metadata", meta)
    except Exception:
        pass
