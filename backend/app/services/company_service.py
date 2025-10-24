"""
Company service for search and enrichment operations.
"""
from typing import Dict, Any, List, Optional
from ..core.db_operations import track_api_call
from ..clients.apollo import ApolloClient
from ..clients.coresignal import CoreSignalClient
from ..clients.enrich_layer import EnrichLayerClient
from ..clients.serper_api import SerperApiClient
from ..schemas.company import Company, CompaniesRequest, CompaniesResponse
from ..mappers.company_mapper import CompanyMapper
import sys
from ..core.session import get_session
from ..core.logger import journey_logger
from ..core.console_logger import console_logger


class CompanyService:
    """Service for company operations."""

    async def orchestrate_enrichment_pipeline(
        self, apollo_row: dict, session=None
    ) -> "Company":
        """
        Orchestrate the full enrichment pipeline for a single company.
        Flow: Apollo → EnrichLayer → CoreSignal → Hunter.io → Serper (per-field).
        - Uses CompanyMapper for all mapping.
        - Handles field-level authority, conflict resolution, and missing field detection.
        - Logs all enrichment steps and errors.
        - Returns the canonical Company object.
        """
        import logging

        logger = logging.getLogger("enrichment_orchestration")
        mapper = self.mapper

        # 1. Apollo → Company (canonical)
        company = mapper.map_apollo_to_company(apollo_row)
        logger.info(f"[Orchestration] Apollo mapped: {company.name} ({company.domain})")

        # 2. EnrichLayer enrichment (if LinkedIn/company URL available)
        enrichlayer_data = None
        enrichlayer_success = False
        if company.company_linkedin_url or company.linkedin_url:
            try:
                enrich_input = {"url": company.company_linkedin_url or company.linkedin_url}
                enrichlayer_data = await self.enrich_layer.enrich_company(enrich_input)
                if enrichlayer_data and enrichlayer_data.get("success", True):
                    enrichlayer_success = True
                    logger.info(f"[Orchestration] EnrichLayer success for {company.name}")
                else:
                    logger.warning(f"[Orchestration] EnrichLayer error: {enrichlayer_data.get('error')}")
            except Exception as e:
                logger.error(f"[Orchestration] EnrichLayer exception: {str(e)}")
        else:
            logger.info(f"[Orchestration] Skipping EnrichLayer: no LinkedIn/company URL")

        # 3. CoreSignal enrichment (always run after EnrichLayer)
        coresignal_data = None
        coresignal_success = False
        enriched_coresignal_company = None
        try:
            if not company.domain and (company.company_linkedin_url or company.linkedin_url):
                # Attempt domain discovery via CoreSignal
                company = await self._find_missing_domain(company, session)
            if company.domain:
                coresignal_data = await self.coresignal.enrich_by_domain(company.domain)
                if coresignal_data:
                    enriched_coresignal_company = mapper.apply_coresignal_enrichment(company, coresignal_data)
                    coresignal_success = True
                    logger.info(f"[Orchestration] CoreSignal success for {company.name}")
                else:
                    logger.warning(f"[Orchestration] CoreSignal: no data for {company.name}")
            else:
                logger.warning(f"[Orchestration] CoreSignal: no domain for {company.name}")
        except Exception as e:
            logger.error(f"[Orchestration] CoreSignal exception: {str(e)}")

        # 4. Field-level mapping and authority resolution
        def pick_field(*sources, field_name=None):
            for src, src_name in sources:
                if src is not None:
                    logger.info(f"[Orchestration] {field_name}: using {src_name}")
                    return src
            logger.info(f"[Orchestration] {field_name}: no value found in any source")
            return None

        mapped_company = Company(
            name=pick_field(
                (enrichlayer_data.get("name") if enrichlayer_success else None, "EnrichLayer"),
                (getattr(enriched_coresignal_company, "name", None) if coresignal_success else None, "CoreSignal"),
                (company.name, "Apollo"),
                field_name="name"),
            description=pick_field(
                (enrichlayer_data.get("description") if enrichlayer_success else None, "EnrichLayer"),
                (getattr(enriched_coresignal_company, "description", None) if coresignal_success else None, "CoreSignal"),
                (company.description, "Apollo"),
                field_name="description"),
            domain=pick_field(
                ((enrichlayer_data.get("website") or "").replace("https://", "").replace("http://", "").strip("/") if enrichlayer_success else None, "EnrichLayer"),
                (getattr(enriched_coresignal_company, "domain", None) if coresignal_success else None, "CoreSignal"),
                (company.domain, "Apollo"),
                field_name="domain"),
            industry=pick_field(
                (enrichlayer_data.get("industry") if enrichlayer_success else None, "EnrichLayer"),
                (getattr(enriched_coresignal_company, "industry", None) if coresignal_success else None, "CoreSignal"),
                (company.industry, "Apollo"),
                field_name="industry"),
            founded_year=pick_field(
                (enrichlayer_data.get("founded_year") if enrichlayer_success else None, "EnrichLayer"),
                (getattr(enriched_coresignal_company, "founded_year", None) if coresignal_success else None, "CoreSignal"),
                (company.founded_year, "Apollo"),
                field_name="founded_year"),
            headquarters=pick_field(
                ((enrichlayer_data.get("hq", {}).get("city") if enrichlayer_success and enrichlayer_data.get("hq") else None), "EnrichLayer"),
                (getattr(enriched_coresignal_company, "headquarters", None) if coresignal_success else None, "CoreSignal"),
                (company.headquarters, "Apollo"),
                field_name="headquarters"),
            company_linkedin_url=pick_field(
                (enrichlayer_data.get("url") if enrichlayer_success else None, "EnrichLayer"),
                (getattr(enriched_coresignal_company, "company_linkedin_url", None) if coresignal_success else None, "CoreSignal"),
                (company.company_linkedin_url, "Apollo"),
                field_name="company_linkedin_url"),
            employee_count=pick_field(
                (enrichlayer_data.get("company_size_on_linkedin") if enrichlayer_success else None, "EnrichLayer"),
                (getattr(enriched_coresignal_company, "employee_count", None) if coresignal_success else None, "CoreSignal"),
                (company.employee_count, "Apollo"),
                field_name="employee_count"),
            location=pick_field(
                ((enrichlayer_data.get("hq", {}).get("city") if enrichlayer_success and enrichlayer_data.get("hq") else None), "EnrichLayer"),
                (getattr(enriched_coresignal_company, "location", None) if coresignal_success else None, "CoreSignal"),
                (company.location, "Apollo"),
                field_name="location"),
            revenue=pick_field(
                (enrichlayer_data.get("revenue") if enrichlayer_success else None, "EnrichLayer"),
                (getattr(enriched_coresignal_company, "revenue", None) if coresignal_success else None, "CoreSignal"),
                (company.revenue, "Apollo"),
                field_name="revenue"),
            technologies=pick_field(
                ([t.strip() for t in enrichlayer_data.get("technologies", [])] if enrichlayer_success and isinstance(enrichlayer_data.get("technologies"), list)
                    else [t.strip() for t in enrichlayer_data.get("technologies", "").split(",") if t.strip()] if enrichlayer_success and isinstance(enrichlayer_data.get("technologies"), str)
                    else None, "EnrichLayer"),
                (getattr(enriched_coresignal_company, "technologies", None) if coresignal_success else None, "CoreSignal"),
                (company.technologies, "Apollo"),
                field_name="technologies"),
            tech_spend=pick_field(
                (enrichlayer_data.get("tech_spend") if enrichlayer_success else None, "EnrichLayer"),
                (getattr(enriched_coresignal_company, "tech_spend", None) if coresignal_success else None, "CoreSignal"),
                (company.tech_spend, "Apollo"),
                field_name="tech_spend"),
            it_budget=pick_field(
                (enrichlayer_data.get("it_budget") if enrichlayer_success else None, "EnrichLayer"),
                (getattr(enriched_coresignal_company, "it_budget", None) if coresignal_success else None, "CoreSignal"),
                (company.it_budget, "Apollo"),
                field_name="it_budget"),
            recent_news=pick_field(
                (enrichlayer_data.get("recent_news") if enrichlayer_success and isinstance(enrichlayer_data.get("recent_news"), list) else [enrichlayer_data.get("recent_news")] if enrichlayer_success and isinstance(enrichlayer_data.get("recent_news"), str) else None, "EnrichLayer"),
                (getattr(enriched_coresignal_company, "recent_news", None) if coresignal_success else None, "CoreSignal"),
                (company.recent_news, "Apollo"),
                field_name="recent_news"),
            job_openings=pick_field(
                (enrichlayer_data.get("job_openings") if enrichlayer_success else None, "EnrichLayer"),
                (getattr(enriched_coresignal_company, "job_openings", None) if coresignal_success else None, "CoreSignal"),
                (company.job_openings, "Apollo"),
                field_name="job_openings"),
            growth_signals=pick_field(
                (enrichlayer_data.get("growth_signals") if enrichlayer_success else None, "EnrichLayer"),
                (getattr(enriched_coresignal_company, "growth_signals", None) if coresignal_success else None, "CoreSignal"),
                (company.growth_signals, "Apollo"),
                field_name="growth_signals"),
            ai_org_signals=pick_field(
                (enrichlayer_data.get("ai_org_signals") if enrichlayer_success else None, "EnrichLayer"),
                (getattr(enriched_coresignal_company, "ai_org_signals", None) if coresignal_success else None, "CoreSignal"),
                (company.ai_org_signals, "Apollo"),
                field_name="ai_org_signals"),
            ai_tech_signals=pick_field(
                (enrichlayer_data.get("ai_tech_signals") if enrichlayer_success else None, "EnrichLayer"),
                (getattr(enriched_coresignal_company, "ai_tech_signals", None) if coresignal_success else None, "CoreSignal"),
                (company.ai_tech_signals, "Apollo"),
                field_name="ai_tech_signals"),
            ai_hiring_signals=pick_field(
                (enrichlayer_data.get("ai_hiring_signals") if enrichlayer_success else None, "EnrichLayer"),
                (getattr(enriched_coresignal_company, "ai_hiring_signals", None) if coresignal_success else None, "CoreSignal"),
                (company.ai_hiring_signals, "Apollo"),
                field_name="ai_hiring_signals"),
            intent_score=pick_field(
                (enrichlayer_data.get("intent_score") if enrichlayer_success else None, "EnrichLayer"),
                (getattr(enriched_coresignal_company, "intent_score", None) if coresignal_success else None, "CoreSignal"),
                (company.intent_score, "Apollo"),
                field_name="intent_score"),
            intent_horizon=pick_field(
                (enrichlayer_data.get("intent_horizon") if enrichlayer_success else None, "EnrichLayer"),
                (getattr(enriched_coresignal_company, "intent_horizon", None) if coresignal_success else None, "CoreSignal"),
                (company.intent_horizon, "Apollo"),
                field_name="intent_horizon"),
            signal_evidence=pick_field(
                (enrichlayer_data.get("signal_evidence") if enrichlayer_success else None, "EnrichLayer"),
                (getattr(enriched_coresignal_company, "signal_evidence", None) if coresignal_success else None, "CoreSignal"),
                (company.signal_evidence, "Apollo"),
                field_name="signal_evidence"),
            revenue_range=pick_field(
                (enrichlayer_data.get("revenue_range") if enrichlayer_success else None, "EnrichLayer"),
                (getattr(enriched_coresignal_company, "revenue_range", None) if coresignal_success else None, "CoreSignal"),
                (company.revenue_range, "Apollo"),
                field_name="revenue_range"),
            linkedin_url=pick_field(
                (enrichlayer_data.get("url") if enrichlayer_success else None, "EnrichLayer"),
                (getattr(enriched_coresignal_company, "linkedin_url", None) if coresignal_success else None, "CoreSignal"),
                (company.linkedin_url, "Apollo"),
                field_name="linkedin_url"),
            twitter_url=pick_field(
                (enrichlayer_data.get("twitter_url") or enrichlayer_data.get("twitter") if enrichlayer_success else None, "EnrichLayer"),
                (getattr(enriched_coresignal_company, "twitter_url", None) if coresignal_success else None, "CoreSignal"),
                (company.twitter_url, "Apollo"),
                field_name="twitter_url"),
            facebook_url=pick_field(
                (enrichlayer_data.get("facebook_url") or enrichlayer_data.get("facebook") if enrichlayer_success else None, "EnrichLayer"),
                (getattr(enriched_coresignal_company, "facebook_url", None) if coresignal_success else None, "CoreSignal"),
                (company.facebook_url, "Apollo"),
                field_name="facebook_url"),
            instagram_url=pick_field(
                (enrichlayer_data.get("instagram_url") or enrichlayer_data.get("instagram") if enrichlayer_success else None, "EnrichLayer"),
                (getattr(enriched_coresignal_company, "instagram_url", None) if coresignal_success else None, "CoreSignal"),
                (company.instagram_url, "Apollo"),
                field_name="instagram_url"),
            youtube_url=pick_field(
                (enrichlayer_data.get("youtube_url") or enrichlayer_data.get("youtube") if enrichlayer_success else None, "EnrichLayer"),
                (getattr(enriched_coresignal_company, "youtube_url", None) if coresignal_success else None, "CoreSignal"),
                (company.youtube_url, "Apollo"),
                field_name="youtube_url"),
            github_url=pick_field(
                (enrichlayer_data.get("github_url") or enrichlayer_data.get("github") if enrichlayer_success else None, "EnrichLayer"),
                (getattr(enriched_coresignal_company, "github_url", None) if coresignal_success else None, "CoreSignal"),
                (company.github_url, "Apollo"),
                field_name="github_url"),
            coresignal_enriched=coresignal_success,
            coresignal_data=coresignal_data if coresignal_success else None,
            enrichment_error=None
        )

        # 5. Hunter.io enrichment (contacts and pattern only)
        try:
            if mapped_company.domain:
                hunterio_result = self.hunterio.domain_search(mapped_company.domain)
                if hunterio_result and hunterio_result.get("data", {}).get("emails"):
                    mapped_company = mapper.apply_hunterio_enrichment(mapped_company, hunterio_result)
                    logger.info(f"[Orchestration] Hunter.io success for {mapped_company.name}")
                else:
                    logger.info(f"[Orchestration] Hunter.io: no emails found for {mapped_company.name}")
            else:
                logger.info(f"[Orchestration] Hunter.io: no domain for {mapped_company.name}")
        except Exception as e:
            logger.error(f"[Orchestration] Hunter.io exception: {str(e)}")

        # 6. Per-field Serper enrichment for any remaining missing fields
        missing_fields = [
            field for field in Company.__fields__
            if getattr(mapped_company, field, None) in (None, [], "")
            and self.SERPER_FIELD_ENDPOINT_MAP.get(field)
        ]
        if missing_fields:
            try:
                logger.info(f"[Orchestration] Serper per-field enrichment for: {missing_fields}")
                serper_result = await self.enrich_fields_with_serper(mapped_company.name, missing_fields)
                if serper_result.get("success"):
                    for field, value in serper_result.get("enriched", {}).items():
                        setattr(mapped_company, field, value)
                    logger.info(f"[Orchestration] Serper enrichment applied for fields: {list(serper_result.get('enriched', {}).keys())}")
                else:
                    logger.warning(f"[Orchestration] Serper error: {serper_result.get('error')}")
            except Exception as e:
                logger.error(f"[Orchestration] Serper exception: {str(e)}")

        logger.info(f"[Orchestration] Final enriched company: {mapped_company.name} ({mapped_company.domain})")

        # --- Targeted Serper site-specific search for social URLs as final fallback ---
        social_fields = [
            ("facebook_url", "facebook.com"),
            ("youtube_url", "youtube.com"),
            ("github_url", "github.com"),
        ]
        missing_socials = [
            (field, domain)
            for field, domain in social_fields
            if not getattr(mapped_company, field, None)
        ]
        if missing_socials:
            logger.info(f"[Orchestration] Targeted Serper fallback for missing socials: {missing_socials}")
            for field, domain in missing_socials:
                query = f"site:{domain} {mapped_company.name}"
                try:
                    url = self.serper.get_first_url_for_query(query, expected_domain=domain)
                    if url:
                        setattr(mapped_company, field, url)
                        logger.info(f"[Orchestration] Serper targeted search: set {field} to {url}")
                    else:
                        logger.info(f"[Orchestration] Serper targeted search: no {field} found for {mapped_company.name}")
                except Exception as e:
                    logger.error(f"[Orchestration] Serper targeted search exception for {field}: {str(e)}")

        # 7. Agent 3: Research Agent - Fill remaining N/A fields
        try:
            from .research_agent_service import ResearchAgentService
            research_agent = ResearchAgentService()

            logger.info(f"[Orchestration] Starting Agent 3 (Research Agent) for {mapped_company.name}")
            mapped_company = await research_agent.research_company(mapped_company)
            logger.info(f"[Orchestration] Agent 3 (Research Agent) complete for {mapped_company.name}")
        except Exception as e:
            logger.error(f"[Orchestration] Agent 3 (Research Agent) exception: {str(e)}")

        return mapped_company

    # Hardcoded mapping: Company field -> Serper endpoint or None
    # This mapping is used to select which Serper endpoint (if any) to call for each field.
    # Documented for maintainability and clarity.
    SERPER_FIELD_ENDPOINT_MAP = {
        "name": "search",  # Use search result title if needed
        "domain": "search",  # Use first organic result URL
        "industry": None,
        "founded_year": None,
        "headquarters": "location",  # Use location endpoint
        "location": "location",      # Use location endpoint
        "description": "search",     # Use snippet from first organic result
        "company_linkedin_url": "search",  # Find first linkedin.com/company URL
        "employee_count": None,
        "revenue": None,
        "technologies": None,
        "tech_spend": None,
        "it_budget": None,
        "recent_news": "news",       # Use news endpoint, return titles
        "job_openings": None,
        "growth_signals": None,
        "ai_org_signals": None,
        "ai_tech_signals": None,
        "ai_hiring_signals": None,
        "intent_score": None,
        "intent_horizon": None,
        "signal_evidence": None,
        "revenue_range": None,
        "linkedin_url": "search",    # Same as company_linkedin_url
        "twitter_url": "search",     # Find first twitter.com URL
        "facebook_url": "search",    # Find first facebook.com URL
        "instagram_url": "search",   # Find first instagram.com URL
        "youtube_url": "search",     # Find first youtube.com URL
        "github_url": "search",      # Find first github.com URL
        "contacts": None,
        "hunterio_pattern": None,
        "coresignal_enriched": None,
        "coresignal_data": None,
        "enrichment_error": None,
    }

    def __init__(self):
        self.apollo = ApolloClient()
        self.coresignal = CoreSignalClient()
        self.mapper = CompanyMapper()
        self.enrich_layer = EnrichLayerClient()
        self.serper = SerperApiClient()
        from ..clients.hunter_io import HunterIoClient
        self.hunterio = HunterIoClient()

    from ..clients.serper_api import SerperApiClient

    async def enrich_fields_with_serper(self, company_name: str, missing_fields: List[str]) -> Dict[str, Any]:
        """
        Enrich specific fields for a company using Serper endpoints, based on a hardcoded mapping.
    
        Args:
            company_name (str): The name of the company to enrich.
            missing_fields (List[str]): List of Company fields to attempt enrichment for.
    
        Returns:
            Dict[str, Any]: {
                "success": bool,
                "enriched": {field: value, ...},
                "error": Optional[str]
            }
        """
        import logging
        logger = logging.getLogger("serper_field_enrichment")
        enriched = {}
        errors = []
        # Normalize missing_fields to lowercase and underscores
        normalized_fields = []
        for f in missing_fields:
            if isinstance(f, str):
                normalized_fields.append(f.strip().lower().replace(" ", "_"))
        # Pre-fetch search and news results if needed to avoid redundant calls
        search_result = None
        news_result = None
        location_result = None
    
        # Determine which endpoints are needed
        needs_search = any(self.SERPER_FIELD_ENDPOINT_MAP.get(f) == "search" for f in normalized_fields)
        needs_news = any(self.SERPER_FIELD_ENDPOINT_MAP.get(f) == "news" for f in normalized_fields)
        needs_location = any(self.SERPER_FIELD_ENDPOINT_MAP.get(f) == "location" for f in normalized_fields)
    
        try:
            if needs_search:
                logger.info(f"[Serper] Performing search for '{company_name}'")
                search_result = self.serper.search(company_name)
            if needs_news:
                logger.info(f"[Serper] Performing news search for '{company_name}'")
                news_result = self.serper.news(company_name)
                logger.info(f"[Serper] Raw news_result: {news_result}")
            if needs_location:
                logger.info(f"[Serper] Performing location search for '{company_name}'")
                location_result = self.serper.location(company_name)
        except Exception as e:
            logger.error(f"[Serper] Error during Serper API calls: {str(e)}")
            return {"success": False, "enriched": {}, "error": str(e)}
    
        # Helper to extract from search results
        def extract_from_search(field):
            if not search_result or "organic" not in search_result:
                return None
            for result in search_result["organic"]:
                url = result.get("link")
                snippet = result.get("snippet")
                if field == "domain":
                    # Use first organic result URL
                    if url:
                        logger.info(f"[Serper] domain: using {url}")
                        return url.replace("https://", "").replace("http://", "").strip("/")
                elif field in ("company_linkedin_url", "linkedin_url"):
                    if url and "linkedin.com/company" in url:
                        logger.info(f"[Serper] {field}: using {url}")
                        return url
                elif field == "description":
                    if snippet:
                        logger.info(f"[Serper] description: using {snippet}")
                        return snippet
                elif field == "twitter_url":
                    if url and "twitter.com" in url:
                        logger.info(f"[Serper] twitter_url: using {url}")
                        return url
                elif field == "facebook_url":
                    if url and "facebook.com" in url:
                        logger.info(f"[Serper] facebook_url: using {url}")
                        return url
                elif field == "instagram_url":
                    if url and "instagram.com" in url:
                        logger.info(f"[Serper] instagram_url: using {url}")
                        return url
                elif field == "youtube_url":
                    if url and "youtube.com" in url:
                        logger.info(f"[Serper] youtube_url: using {url}")
                        return url
                elif field == "github_url":
                    if url and "github.com" in url:
                        logger.info(f"[Serper] github_url: using {url}")
                        return url
                elif field == "name":
                    title = result.get("title")
                    if title:
                        logger.info(f"[Serper] name: using {title}")
                        return title
            return None
    
        # Helper to extract from news results
        def extract_from_news():
            if not news_result or "news" not in news_result:
                return []
            news_titles = [n.get("title") for n in news_result["news"] if n.get("title")]
            logger.info(f"[Serper] recent_news: using {news_titles}")
            return news_titles
    
        # Helper to extract from location results
        def extract_from_location():
            if not location_result or "locations" not in location_result:
                return None
            # Use the formatted address of the first location
            locs = location_result["locations"]
            if locs and isinstance(locs, list) and "formattedAddress" in locs[0]:
                logger.info(f"[Serper] location/headquarters: using {locs[0]['formattedAddress']}")
                return locs[0]["formattedAddress"]
            return None
    
        for field in normalized_fields:
            endpoint = self.SERPER_FIELD_ENDPOINT_MAP.get(field)
            if not endpoint:
                logger.info(f"[Serper] Skipping field '{field}': no Serper enrichment available.")
                continue
            try:
                if endpoint == "search":
                    value = extract_from_search(field)
                elif endpoint == "news":
                    value = extract_from_news()
                elif endpoint == "location":
                    value = extract_from_location()
                else:
                    value = None
                if value is not None:
                    enriched[field] = value
                else:
                    logger.info(f"[Serper] No value found for field '{field}' via endpoint '{endpoint}'.")
            except Exception as e:
                logger.error(f"[Serper] Error enriching field '{field}': {str(e)}")
                errors.append(f"{field}: {str(e)}")
    
        return {
            "success": True,
            "enriched": enriched,
            "error": "; ".join(errors) if errors else None
        }

    async def search_companies(self, request: CompaniesRequest) -> CompaniesResponse:
        """Search for companies using Apollo and enrich with CoreSignal."""
        # Get session for logging if available
        session = None
        if hasattr(request, 'session_id') and request.session_id:
            session = get_session(request.session_id)
        
        limit = request.limit or 10
        if limit > 50:
            limit = 50

        # Build query payload
        if request.search_payload:
            query_payload = {**request.search_payload}
        elif request.icp_config:
            query_payload = self.apollo.compose_query_from_icp(request.icp_config)
        else:
            if session:
                session.add_error("No search payload or ICP config provided")
            return self._error_response(query_payload=None, error="Provide either search_payload or icp_config")

        # Set pagination
        query_payload.setdefault("per_page", limit)

        # Check API key
        if not self.apollo.api_key:
            if session:
                session.add_error("Apollo API key not configured")
            return self._error_response(query_payload, "Apollo API key not configured")

        try:
            # Log Apollo search start
            console_logger.log_apollo_start(query_payload)
            print(f"[Companies] Starting Apollo search with {len(query_payload)} filters...")
            
            # Search companies with Apollo
            data = await self.apollo.search_companies(query_payload)
            rows = data.get("companies") or data.get("organizations") or []
            
            if not isinstance(rows, list):
                rows = []

            print(f"[Companies] Apollo returned {len(rows)} companies")
            apollo_companies = [self.mapper.map_apollo_to_company(r) for r in rows][:query_payload.get("per_page", limit)]
            
            # Log Apollo results
            console_logger.log_apollo_result(True, [c.dict() for c in apollo_companies])
            
            # Update session with Apollo results
            if session:
                session.set_apollo_results(len(apollo_companies))
            
            # Keep a copy of original Apollo data
            apollo_only_companies = [Company(**company.dict()) for company in apollo_companies]
            
            # Log enrichment start
            console_logger.log_enrichment_start(len(apollo_companies))
            print(f"[Companies] Starting enrichment for {len(apollo_companies)} companies...")
            
            # Enrich companies with multi-layer enrichment
            enriched_companies = await self._enrich_companies(apollo_companies, session)
            print(f"[Companies] Enrichment complete. Returning {len(enriched_companies)} companies")
            
            # Calculate enrichment stats
            enriched_count = sum(1 for c in enriched_companies if c.coresignal_enriched)
            domain_discoveries = sum(1 for c in enriched_companies 
                                    if c.coresignal_data and c.coresignal_data.get('domain_source'))
            
            console_logger.log_enrichment_summary(
                len(enriched_companies), 
                enriched_count,
                domain_discoveries,
                len(enriched_companies) - enriched_count
            )
            
            return CompaniesResponse(
                success=True,
                companies=enriched_companies,
                apollo_only_companies=apollo_only_companies,
                used_mock=False,
                response_count=len(enriched_companies),
                request_payload=query_payload,
                raw_companies=rows[: query_payload.get("per_page", limit)]
            )

        except Exception as e:
            if session:
                session.add_error(f"Apollo API failed: {str(e)}")
            console_logger.log_apollo_result(False, [], str(e))
            print(f"[Apollo] API call failed: {str(e)}")
            return self._error_response(query_payload, f"Apollo API failed: {str(e)}")
    
    async def enrich_company(self, domain: str) -> Dict[str, Any]:
        """Enrich a single company using CoreSignal API."""
        if not self.coresignal.api_key:
            return {"success": False, "company": None, "enriched": False, "error": "CoreSignal API key not configured"}
        
        company = Company(name="Unknown", domain=domain)
        enriched_company = await self._enrich_single_company(company)
        
        return {
            "success": True,
            "company": enriched_company,
            "enriched": enriched_company.coresignal_enriched,
            "error": enriched_company.enrichment_error
        }
    
    def _error_response(self, query_payload: Dict[str, Any], error: str) -> CompaniesResponse:
        """Create standardized error response."""
        return CompaniesResponse(
            success=False,
            companies=[],
            apollo_only_companies=[],
            used_mock=False,
            response_count=0,
            request_payload=query_payload,
            raw_companies=[],
            error=f"NO DATA AVAILABLE - {error}"
        )
    
    async def _enrich_companies(self, companies: list[Company], session=None) -> list[Company]:
        """Enrich multiple companies with CoreSignal."""
        if not self.coresignal.api_key or not companies:
            return companies
            
        print(f"[CoreSignal] Enriching {len(companies)} companies...")
        enriched = []
        for i, company in enumerate(companies, 1):
            console_logger.log_company_enrichment(company.name, i, len(companies))
            enriched_company = await self._enrich_single_company(company, session)
            enriched.append(enriched_company)
        return enriched
    
    async def _enrich_single_company(self, company: Company, session=None) -> Company:
        """
        Enrich a single company using EnrichLayer, CoreSignal, Serper, and Apollo (in that order).
        For each Company field, the mapping priority is:
            1. EnrichLayer (if available)
            2. CoreSignal (if available)
            3. Serper (if available)
            4. Apollo (original)
        Each field is mapped from the most reliable/complete source available.
        Logging and comments clarify which source provided each mapped field.
        No schema changes are made to the Company model.
        """
        import logging

        try:
            safe_company_name = str(company.name).encode('ascii', 'replace').decode('ascii') if company.name else "Unknown"
        except Exception:
            safe_company_name = "Unknown"

        apollo_company = Company(**company.dict())
        logger = logging.getLogger("company_enrichment")
        logger.info(f"\n=== [Enrichment] Processing Company: {safe_company_name} ===")
        logger.info(f"[Enrichment] Apollo provided domain: {'YES' if company.domain else 'NO'}")
        if company.domain:
            logger.info(f"[Enrichment] Apollo domain: {company.domain}")
        if company.company_linkedin_url or company.linkedin_url:
            linkedin = company.company_linkedin_url or company.linkedin_url
            logger.info(f"[Enrichment] Apollo LinkedIn URL: {linkedin}")
        logger.info(f"[Enrichment] Apollo location: {company.headquarters or company.location or 'Not provided'}")

        # 1. EnrichLayer enrichment (highest priority)
        from ..core.console_logger import console_logger
        enrichlayer_success = False
        enrich_result = None
        enrich_input = None
        try:
            linkedin_url = company.company_linkedin_url or company.linkedin_url
            if linkedin_url:
                enrich_input = {"url": linkedin_url}
                enrich_result = await self.enrich_layer.enrich_company(enrich_input)
                if enrich_result and enrich_result.get("success", True):
                    enrichlayer_success = True
                    logger.info(f"[EnrichLayer] SUCCESS: Enriched {safe_company_name} with EnrichLayer")
                    
                    # Track EnrichLayer API call
                    if session and hasattr(session, 'session_id'):
                        try:
                            track_api_call(
                                session_id=session.session_id,
                                api_name="EnrichLayer",
                                endpoint="company",
                                call_type="enrichlayer_company",
                                calls_made=1,
                                success=True
                            )
                        except Exception as e:
                            logger.error(f"[Cost Tracking] Error tracking EnrichLayer call: {e}")
                    
                    # Log to console with details
                    console_logger.log_enrichlayer_result(safe_company_name, True, enrich_result)
                else:
                    logger.warning(f"[EnrichLayer] ERROR: {enrich_result.get('error', 'Unknown error from EnrichLayer')}")
                    console_logger.log_enrichlayer_result(safe_company_name, False)
            else:
                logger.warning(f"[EnrichLayer] SKIP: No LinkedIn/company URL available for EnrichLayer enrichment.")
                console_logger.log_enrichlayer_result(safe_company_name, False)
        except Exception as e:
            logger.error(f"[EnrichLayer] EXCEPTION: {str(e)}")
            console_logger.log_enrichlayer_result(safe_company_name, False)
        

        # 2. CoreSignal enrichment (always run after EnrichLayer)
        coresignal_success = False
        coresignal_data = None
        domain_source = ""
        original_domain = company.domain
        enriched_coresignal_company = None
        try:
            if not self.coresignal.api_key:
                logger.warning(f"[CoreSignal] SKIP: {safe_company_name} - API key not configured")
            else:
                # Try to find domain if missing
                if not company.domain:
                    logger.info(f"[CoreSignal] DISCOVERY: No domain found for {safe_company_name}, attempting domain discovery...")
                    if session:
                        session.increment_domain_enrichment_attempt()
                    company = await self._find_missing_domain(company, session)
                    if company.domain and not original_domain:
                        if hasattr(company, 'coresignal_data') and company.coresignal_data:
                            domain_source = company.coresignal_data.get('domain_source', '')
                        logger.info(f"[CoreSignal] DISCOVERY RESULT: {company.domain or 'NOT FOUND'}")
                        if domain_source:
                            logger.info(f"[CoreSignal] DOMAIN SOURCE: {domain_source}")
                else:
                    logger.info(f"[CoreSignal] USING APOLLO DOMAIN: {company.domain}")
                    if not hasattr(company, 'coresignal_data') or company.coresignal_data is None:
                        company.coresignal_data = {}
                    company.coresignal_data['domain_source'] = 'apollo_original'
                    domain_source = 'apollo_original'

                if not company.domain:
                    logger.warning(f"[CoreSignal] SKIP: {safe_company_name} - no domain available after discovery attempts")
                    console_logger.log_coresignal_result(safe_company_name, False)
                else:
                    logger.info(f"[CoreSignal] ENRICHING: {safe_company_name} with domain: {company.domain}")
                    coresignal_data = await self.coresignal.enrich_by_domain(company.domain)
                    if coresignal_data:
                        enriched_coresignal_company = self.mapper.apply_coresignal_enrichment(company, coresignal_data)
                        
                        # Track CoreSignal API call
                        if session and hasattr(session, 'session_id'):
                            try:
                                track_api_call(
                                    session_id=session.session_id,
                                    api_name="CoreSignal",
                                    endpoint="company_clean/enrich",
                                    call_type="coresignal_enrich",
                                    calls_made=1,
                                    success=True
                                )
                            except Exception as e:
                                logger.error(f"[Cost Tracking] Error tracking CoreSignal call: {e}")
                        
                        if not hasattr(enriched_coresignal_company, 'coresignal_data') or enriched_coresignal_company.coresignal_data is None:
                            enriched_coresignal_company.coresignal_data = {}
                        if domain_source:
                            enriched_coresignal_company.coresignal_data['domain_source'] = domain_source
                        if session:
                            session.increment_coresignal_enriched()
                        logger.info(f"[CoreSignal] SUCCESS: Successfully enriched {safe_company_name}")
                        logger.info(f"[CoreSignal] DATA: Enhanced with {len(coresignal_data)} fields")
                        coresignal_success = True
                        # Log to console with details
                        domain_found = bool(company.domain and not original_domain)
                        console_logger.log_coresignal_result(safe_company_name, True, domain_found, domain_source, coresignal_data)
                    else:
                        logger.warning(f"[CoreSignal] NO DATA: No enrichment data returned for {safe_company_name}")
                        console_logger.log_coresignal_result(safe_company_name, False)
        except Exception as e:
            logger.error(f"[CoreSignal] ERROR: Enrichment failed for {safe_company_name}: {str(e)}")
            console_logger.log_coresignal_result(safe_company_name, False)

        

        # 3. Serper enrichment (third priority, per-field)
        serper_success = False
        serper_field_results = {}
        try:
            # Identify missing fields that are mapped to Serper endpoints
            missing_fields = []
            for field, endpoint in self.SERPER_FIELD_ENDPOINT_MAP.items():
                if endpoint and getattr(company, field, None) in (None, [], ""):
                    missing_fields.append(field)
            if missing_fields:
                logger.info(f"[Serper] Attempting per-field enrichment for: {missing_fields}")
                serper_result = await self.enrich_fields_with_serper(company.name, missing_fields)
                if serper_result.get("success"):
                    serper_field_results = serper_result.get("enriched", {})
                    serper_success = True
                    
                    # Track Serper API calls
                    if session and hasattr(session, 'session_id'):
                        try:
                            # Count actual Serper calls made (search, news, location)
                            serper_calls = 0
                            if missing_fields:  # Only track if we actually called Serper
                                # This was determined earlier in the code
                                needs_search = any(self.SERPER_FIELD_ENDPOINT_MAP.get(f) == "search" for f in missing_fields)
                                needs_news = any(self.SERPER_FIELD_ENDPOINT_MAP.get(f) == "news" for f in missing_fields)
                                needs_location = any(self.SERPER_FIELD_ENDPOINT_MAP.get(f) == "location" for f in missing_fields)
                                serper_calls = sum([needs_search, needs_news, needs_location])
                                
                                track_api_call(
                                    session_id=session.session_id,
                                    api_name="Serper",
                                    endpoint="search",
                                    call_type="serper_search",
                                    calls_made=serper_calls,
                                    success=True
                                )
                        except Exception as e:
                            logger.error(f"[Cost Tracking] Error tracking Serper call: {e}")
                    
                    # Log to console with details
                    console_logger.log_serper_result(safe_company_name, serper_field_results)
                else:
                    logger.warning(f"[Serper] Per-field enrichment error: {serper_result.get('error')}")
                    console_logger.log_serper_result(safe_company_name, None)
            else:
                console_logger.log_serper_result(safe_company_name, None)
        except Exception as e:
            logger.error(f"[SerperAPI] ERROR: Per-field enrichment failed for {safe_company_name}: {str(e)}")
            console_logger.log_serper_result(safe_company_name, None)

        # 4. Unified mapping: For each field, use highest-priority available value
        def pick_field(*sources, field_name=None):
            for src, src_name in sources:
                if src is not None:
                    logger.info(f"[Mapping] {field_name}: using {src_name}")
                    return src
            logger.info(f"[Mapping] {field_name}: no value found in any source")
            return None

        # Log organization_id preservation
        logger.info(f"[Mapping] 🆔 Preserving Apollo IDs - id: {company.id}, organization_id: {company.organization_id}")

        mapped_company = Company(
            # Preserve Apollo IDs (critical for People API)
            id=company.id,
            organization_id=company.organization_id,
            name=pick_field(
                (enrich_result.get("name") if enrichlayer_success else None, "EnrichLayer"),
                (getattr(enriched_coresignal_company, "name", None) if coresignal_success else None, "CoreSignal"),
                (serper_field_results.get("name"), "Serper"),
                (company.name, "Apollo"),
                field_name="name"),
            description=pick_field(
                (enrich_result.get("description") if enrichlayer_success else None, "EnrichLayer"),
                (getattr(enriched_coresignal_company, "description", None) if coresignal_success else None, "CoreSignal"),
                (serper_field_results.get("description"), "Serper"),
                (company.description, "Apollo"),
                field_name="description"),
            domain=pick_field(
                ((enrich_result.get("website") or "").replace("https://", "").replace("http://", "").strip("/") if enrichlayer_success else None, "EnrichLayer"),
                (getattr(enriched_coresignal_company, "domain", None) if coresignal_success else None, "CoreSignal"),
                (serper_field_results.get("domain"), "Serper"),
                (company.domain, "Apollo"),
                field_name="domain"),
            industry=pick_field(
                (enrich_result.get("industry") if enrichlayer_success else None, "EnrichLayer"),
                (getattr(enriched_coresignal_company, "industry", None) if coresignal_success else None, "CoreSignal"),
                (company.industry, "Apollo"),
                field_name="industry"),
            founded_year=pick_field(
                (enrich_result.get("founded_year") if enrichlayer_success else None, "EnrichLayer"),
                (getattr(enriched_coresignal_company, "founded_year", None) if coresignal_success else None, "CoreSignal"),
                (company.founded_year, "Apollo"),
                field_name="founded_year"),
            headquarters=pick_field(
                ((enrich_result.get("hq", {}).get("city") if enrichlayer_success and enrich_result.get("hq") else None), "EnrichLayer"),
                (getattr(enriched_coresignal_company, "headquarters", None) if coresignal_success else None, "CoreSignal"),
                (serper_field_results.get("headquarters") or serper_field_results.get("location"), "Serper"),
                (company.headquarters, "Apollo"),
                field_name="headquarters"),
            company_linkedin_url=pick_field(
                (enrich_input.get("url") if enrichlayer_success and enrich_input else None, "EnrichLayer"),
                (getattr(enriched_coresignal_company, "company_linkedin_url", None) if coresignal_success else None, "CoreSignal"),
                (serper_field_results.get("company_linkedin_url"), "Serper"),
                (company.company_linkedin_url, "Apollo"),
                field_name="company_linkedin_url"),
            employee_count=pick_field(
                (enrich_result.get("company_size_on_linkedin") if enrichlayer_success else None, "EnrichLayer"),
                (getattr(enriched_coresignal_company, "employee_count", None) if coresignal_success else None, "CoreSignal"),
                (company.employee_count, "Apollo"),
                field_name="employee_count"),
            specialities=pick_field(
                (enrich_result.get("specialities") if enrichlayer_success else None, "EnrichLayer"),
                (getattr(enriched_coresignal_company, "specialities", None) if coresignal_success else None, "CoreSignal"),
                (getattr(company, "specialities", None), "Apollo"),
                field_name="specialities"),
            location=pick_field(
                ((enrich_result.get("hq", {}).get("city") if enrichlayer_success and enrich_result.get("hq") else None), "EnrichLayer"),
                (getattr(enriched_coresignal_company, "location", None) if coresignal_success else None, "CoreSignal"),
                (serper_field_results.get("location") or serper_field_results.get("headquarters"), "Serper"),
                (company.location, "Apollo"),
                field_name="location"),
            revenue=pick_field(
                (enrich_result.get("revenue") if enrichlayer_success else None, "EnrichLayer"),
                (getattr(enriched_coresignal_company, "revenue", None) if coresignal_success else None, "CoreSignal"),
                (company.revenue, "Apollo"),
                field_name="revenue"),
            technologies=pick_field(
                ([t.strip() for t in enrich_result.get("technologies", [])] if enrichlayer_success and isinstance(enrich_result.get("technologies"), list)
                    else [t.strip() for t in enrich_result.get("technologies", "").split(",") if t.strip()] if enrichlayer_success and isinstance(enrich_result.get("technologies"), str)
                    else None, "EnrichLayer"),
                (getattr(enriched_coresignal_company, "technologies", None) if coresignal_success else None, "CoreSignal"),
                (company.technologies, "Apollo"),
                field_name="technologies"),
            tech_spend=pick_field(
                (enrich_result.get("tech_spend") if enrichlayer_success else None, "EnrichLayer"),
                (getattr(enriched_coresignal_company, "tech_spend", None) if coresignal_success else None, "CoreSignal"),
                (company.tech_spend, "Apollo"),
                field_name="tech_spend"),
            it_budget=pick_field(
                (enrich_result.get("it_budget") if enrichlayer_success else None, "EnrichLayer"),
                (getattr(enriched_coresignal_company, "it_budget", None) if coresignal_success else None, "CoreSignal"),
                (company.it_budget, "Apollo"),
                field_name="it_budget"),
            recent_news=pick_field(
                (enrich_result.get("recent_news") if enrichlayer_success and isinstance(enrich_result.get("recent_news"), list) else [enrich_result.get("recent_news")] if enrichlayer_success and isinstance(enrich_result.get("recent_news"), str) else None, "EnrichLayer"),
                (getattr(enriched_coresignal_company, "recent_news", None) if coresignal_success else None, "CoreSignal"),
                (serper_field_results.get("recent_news"), "Serper"),
                (company.recent_news, "Apollo"),
                field_name="recent_news"),
            job_openings=pick_field(
                (enrich_result.get("job_openings") if enrichlayer_success else None, "EnrichLayer"),
                (getattr(enriched_coresignal_company, "job_openings", None) if coresignal_success else None, "CoreSignal"),
                (company.job_openings, "Apollo"),
                field_name="job_openings"),
            growth_signals=pick_field(
                (enrich_result.get("growth_signals") if enrichlayer_success else None, "EnrichLayer"),
                (getattr(enriched_coresignal_company, "growth_signals", None) if coresignal_success else None, "CoreSignal"),
                (company.growth_signals, "Apollo"),
                field_name="growth_signals"),
            ai_org_signals=pick_field(
                (enrich_result.get("ai_org_signals") if enrichlayer_success else None, "EnrichLayer"),
                (getattr(enriched_coresignal_company, "ai_org_signals", None) if coresignal_success else None, "CoreSignal"),
                (company.ai_org_signals, "Apollo"),
                field_name="ai_org_signals"),
            ai_tech_signals=pick_field(
                (enrich_result.get("ai_tech_signals") if enrichlayer_success else None, "EnrichLayer"),
                (getattr(enriched_coresignal_company, "ai_tech_signals", None) if coresignal_success else None, "CoreSignal"),
                (company.ai_tech_signals, "Apollo"),
                field_name="ai_tech_signals"),
            ai_hiring_signals=pick_field(
                (enrich_result.get("ai_hiring_signals") if enrichlayer_success else None, "EnrichLayer"),
                (getattr(enriched_coresignal_company, "ai_hiring_signals", None) if coresignal_success else None, "CoreSignal"),
                (company.ai_hiring_signals, "Apollo"),
                field_name="ai_hiring_signals"),
            intent_score=pick_field(
                (enrich_result.get("intent_score") if enrichlayer_success else None, "EnrichLayer"),
                (getattr(enriched_coresignal_company, "intent_score", None) if coresignal_success else None, "CoreSignal"),
                (company.intent_score, "Apollo"),
                field_name="intent_score"),
            intent_horizon=pick_field(
                (enrich_result.get("intent_horizon") if enrichlayer_success else None, "EnrichLayer"),
                (getattr(enriched_coresignal_company, "intent_horizon", None) if coresignal_success else None, "CoreSignal"),
                (company.intent_horizon, "Apollo"),
                field_name="intent_horizon"),
            signal_evidence=pick_field(
                (enrich_result.get("signal_evidence") if enrichlayer_success else None, "EnrichLayer"),
                (getattr(enriched_coresignal_company, "signal_evidence", None) if coresignal_success else None, "CoreSignal"),
                (company.signal_evidence, "Apollo"),
                field_name="signal_evidence"),
            revenue_range=pick_field(
                (enrich_result.get("revenue_range") if enrichlayer_success else None, "EnrichLayer"),
                (getattr(enriched_coresignal_company, "revenue_range", None) if coresignal_success else None, "CoreSignal"),
                (company.revenue_range, "Apollo"),
                field_name="revenue_range"),
            linkedin_url=pick_field(
                (enrich_input.get("url") if enrichlayer_success and enrich_input else None, "EnrichLayer"),
                (getattr(enriched_coresignal_company, "linkedin_url", None) if coresignal_success else None, "CoreSignal"),
                (serper_field_results.get("linkedin_url"), "Serper"),
                (company.linkedin_url, "Apollo"),
                field_name="linkedin_url"),
            twitter_url=pick_field(
                (enrich_result.get("twitter_url") or enrich_result.get("twitter") if enrichlayer_success else None, "EnrichLayer"),
                (getattr(enriched_coresignal_company, "twitter_url", None) if coresignal_success else None, "CoreSignal"),
                (serper_field_results.get("twitter_url"), "Serper"),
                (company.twitter_url, "Apollo"),
                field_name="twitter_url"),
            facebook_url=pick_field(
                (enrich_result.get("facebook_url") or enrich_result.get("facebook") if enrichlayer_success else None, "EnrichLayer"),
                (getattr(enriched_coresignal_company, "facebook_url", None) if coresignal_success else None, "CoreSignal"),
                (serper_field_results.get("facebook_url"), "Serper"),
                (company.facebook_url, "Apollo"),
                field_name="facebook_url"),
            instagram_url=pick_field(
                (enrich_result.get("instagram_url") or enrich_result.get("instagram") if enrichlayer_success else None, "EnrichLayer"),
                (getattr(enriched_coresignal_company, "instagram_url", None) if coresignal_success else None, "CoreSignal"),
                (serper_field_results.get("instagram_url"), "Serper"),
                (company.instagram_url, "Apollo"),
                field_name="instagram_url"),
            youtube_url=pick_field(
                (enrich_result.get("youtube_url") or enrich_result.get("youtube") if enrichlayer_success else None, "EnrichLayer"),
                (getattr(enriched_coresignal_company, "youtube_url", None) if coresignal_success else None, "CoreSignal"),
                (serper_field_results.get("youtube_url"), "Serper"),
                (company.youtube_url, "Apollo"),
                field_name="youtube_url"),
            github_url=pick_field(
                (enrich_result.get("github_url") or enrich_result.get("github") if enrichlayer_success else None, "EnrichLayer"),
                (getattr(enriched_coresignal_company, "github_url", None) if coresignal_success else None, "CoreSignal"),
                (serper_field_results.get("github_url"), "Serper"),
                (company.github_url, "Apollo"),
                field_name="github_url"),
            coresignal_enriched=coresignal_success,
            coresignal_data=coresignal_data if coresignal_success else None,
            enrichment_error=None
        )

        journey_logger.log_company_enrichment(
            session_id=session.session_id if session else "unknown",
            apollo_company=apollo_company,
            enriched_company=mapped_company,
            enrichment_status="final_mapping"
        )

        # 5. Hunter.io enrichment (contacts only, always applied if available)
        try:
            if mapped_company.domain:
                logger.info(f"[Hunter.io] Attempting domain search for {mapped_company.domain}")
                hunterio_result = self.hunterio.domain_search(mapped_company.domain)
                logger.info(f"[Hunter.io] Response: {hunterio_result}")
                if hunterio_result and hunterio_result.get("data", {}).get("emails"):
                    mapped_company = self.mapper.apply_hunterio_enrichment(mapped_company, hunterio_result)
                    
                    # Track Hunter.io API call
                    if session and hasattr(session, 'session_id'):
                        try:
                            track_api_call(
                                session_id=session.session_id,
                                api_name="Hunter",
                                endpoint="domain-search",
                                call_type="hunter_domain_search",
                                calls_made=1,
                                success=True
                            )
                        except Exception as e:
                            logger.error(f"[Cost Tracking] Error tracking Hunter.io call: {e}")
                    
                    logger.info(f"[Hunter.io] SUCCESS: Enriched {safe_company_name} with Hunter.io")
                    journey_logger.log_company_enrichment(
                        session_id=session.session_id if session else "unknown",
                        apollo_company=apollo_company,
                        enriched_company=mapped_company,
                        enrichment_status="hunterio_success"
                    )
                    # Log to console with details
                    contacts_count = len(hunterio_result.get("data", {}).get("emails", []))
                    pattern = hunterio_result.get("data", {}).get("pattern")
                    console_logger.log_hunterio_result(safe_company_name, True, contacts_count, pattern, hunterio_result)
                else:
                    logger.info(f"[Hunter.io] NO DATA: No emails found for {safe_company_name} with Hunter.io")
                    console_logger.log_hunterio_result(safe_company_name, False)
            else:
                logger.info(f"[Hunter.io] SKIP: No domain available for Hunter.io enrichment")
                console_logger.log_hunterio_result(safe_company_name, False)
        except Exception as e:
            logger.error(f"[Hunter.io] ERROR: Enrichment failed for {safe_company_name}: {str(e)}")
            journey_logger.log_company_enrichment(
                session_id=session.session_id if session else "unknown",
                apollo_company=apollo_company,
                enriched_company=mapped_company,
                enrichment_status="hunterio_exception",
                enrichment_error=str(e)
            )
            console_logger.log_hunterio_result(safe_company_name, False)

        # 7. Agent 3: Research Agent - Fill remaining N/A fields
        try:
            from .research_agent_service import ResearchAgentService
            research_agent = ResearchAgentService()

            print(f"[Enrichment] Starting Agent 3 (Research Agent) for {safe_company_name}")
            mapped_company = await research_agent.research_company(mapped_company)
            print(f"[Enrichment] Agent 3 (Research Agent) complete for {safe_company_name}")
        except Exception as e:
            print(f"[Enrichment] Agent 3 (Research Agent) exception: {str(e)}")

        return mapped_company

    async def _enrich_with_serper(self, company: Company) -> Optional[Company]:
        """
        Enrich a company using SerperAPI (Google Search and News).
        Maps all useful datapoints (website, description, recent_news, social URLs, etc.) to the Company model.
        Adds field-level logging for each mapped field.
        """
        import logging
        logger = logging.getLogger("serper_enrichment")

        # Use company name and location for search queries
        query = company.name
        if company.location:
            query += f" {company.location}"
        elif company.headquarters:
            query += f" {company.headquarters}"

        # 1. Search for main company info
        search_result = self.serper.search(query)
        logger.info(f"[Serper] Search result for '{query}': {search_result}")

        website = None
        linkedin_url = None
        description = None
        social_urls = {
            "twitter_url": None,
            "facebook_url": None,
            "instagram_url": None,
            "youtube_url": None,
            "github_url": None,
        }

        if search_result and "organic" in search_result:
            for result in search_result["organic"]:
                url = result.get("link")
                snippet = result.get("snippet")
                title = result.get("title", "").lower()
                # Try to find main website
                if not website and url and company.name.lower() in url.lower():
                    website = url
                    logger.info(f"[Serper] Mapped website: {website}")
                # Try to find LinkedIn
                if not linkedin_url and url and "linkedin.com/company" in url:
                    linkedin_url = url
                    logger.info(f"[Serper] Mapped LinkedIn URL: {linkedin_url}")
                # Try to find description/snippet
                if not description and snippet:
                    description = snippet
                    logger.info(f"[Serper] Mapped description: {description}")
                # Try to find social URLs
                if url:
                    if "twitter.com" in url and not social_urls["twitter_url"]:
                        social_urls["twitter_url"] = url
                        logger.info(f"[Serper] Mapped Twitter URL: {url}")
                    if "facebook.com" in url and not social_urls["facebook_url"]:
                        social_urls["facebook_url"] = url
                        logger.info(f"[Serper] Mapped Facebook URL: {url}")
                    if "instagram.com" in url and not social_urls["instagram_url"]:
                        social_urls["instagram_url"] = url
                        logger.info(f"[Serper] Mapped Instagram URL: {url}")
                    if "youtube.com" in url and not social_urls["youtube_url"]:
                        social_urls["youtube_url"] = url
                        logger.info(f"[Serper] Mapped YouTube URL: {url}")
                    if "github.com" in url and not social_urls["github_url"]:
                        social_urls["github_url"] = url
                        logger.info(f"[Serper] Mapped GitHub URL: {url}")

        # 2. Get recent news
        recent_news = []
        news_result = self.serper.news(company.name)
        logger.info(f"[Serper] News result for '{company.name}': {news_result}")
        if news_result and "news" in news_result:
            for news_item in news_result["news"]:
                headline = news_item.get("title")
                if headline:
                    recent_news.append(headline)
            logger.info(f"[Serper] Mapped recent_news: {recent_news}")

        # 3. Map to Company model
        mapped_company = Company(
            name=company.name,
            description=description or company.description,
            domain=(website or company.domain or "").replace("https://", "").replace("http://", "").strip("/"),
            industry=company.industry,
            founded_year=company.founded_year,
            headquarters=company.headquarters,
            company_linkedin_url=linkedin_url or company.company_linkedin_url,
            employee_count=company.employee_count,
            specialities=getattr(company, "specialities", None),
            location=company.location,
            revenue=company.revenue,
            technologies=company.technologies,
            tech_spend=company.tech_spend,
            it_budget=company.it_budget,
            recent_news=recent_news if recent_news else company.recent_news,
            job_openings=company.job_openings,
            growth_signals=company.growth_signals,
            ai_org_signals=company.ai_org_signals,
            ai_tech_signals=company.ai_tech_signals,
            ai_hiring_signals=company.ai_hiring_signals,
            intent_score=company.intent_score,
            intent_horizon=company.intent_horizon,
            signal_evidence=company.signal_evidence,
            revenue_range=company.revenue_range,
            linkedin_url=linkedin_url or company.linkedin_url,
            twitter_url=social_urls["twitter_url"] or company.twitter_url,
            facebook_url=social_urls["facebook_url"] or company.facebook_url,
            instagram_url=social_urls["instagram_url"] or company.instagram_url,
            youtube_url=social_urls["youtube_url"] or company.youtube_url,
            github_url=social_urls["github_url"] or company.github_url,
            coresignal_enriched=False,
            coresignal_data=None,
            enrichment_error=None
        )
        logger.info(f"[Serper] Final mapped company: {mapped_company.dict()}")
        return mapped_company

        # Hunter.io enrichment as final fallback
        try:
            if company.domain:
                print(f"[Hunter.io] Attempting domain search for {company.domain}")
                import logging
                logger = logging.getLogger("hunterio_enrichment")
                hunterio_result = self.hunterio.domain_search(company.domain)
                logger.info(f"[Hunter.io] Called for domain: {company.domain}")
                logger.info(f"[Hunter.io] Response: {hunterio_result}")
                print(f"[Hunter.io] Response: {hunterio_result}")
                if hunterio_result and hunterio_result.get("data", {}).get("emails"):
                    enriched_with_hunterio = self.mapper.apply_hunterio_enrichment(company, hunterio_result)
                    print(f"[Hunter.io] SUCCESS: Enriched {safe_company_name} with Hunter.io")
                    journey_logger.log_company_enrichment(
                        session_id=session.session_id if session else "unknown",
                        apollo_company=apollo_company,
                        enriched_company=enriched_with_hunterio,
                        enrichment_status="hunterio_success"
                    )
                    return enriched_with_hunterio
                else:
                    print(f"[Hunter.io] NO DATA: No emails found for {safe_company_name} with Hunter.io")
                    journey_logger.log_company_enrichment(
                        session_id=session.session_id if session else "unknown",
                        apollo_company=apollo_company,
                        enriched_company=company,
                        enrichment_status="hunterio_no_data"
                    )
            else:
                print(f"[Hunter.io] SKIP: No domain available for Hunter.io enrichment")
        except Exception as e:
            print(f"[Hunter.io] ERROR: Enrichment failed for {safe_company_name}: {str(e)}")
            import logging
            logger = logging.getLogger("hunterio_enrichment")
            logger.error(f"[Hunter.io] Exception: {str(e)}")
            journey_logger.log_company_enrichment(
                session_id=session.session_id if session else "unknown",
                apollo_company=apollo_company,
                enriched_company=company,
                enrichment_status="hunterio_exception",
                enrichment_error=str(e)
            )
        return company
    
    async def _find_missing_domain(self, company: Company, session=None) -> Company:
        """Find domain for company using LinkedIn URL or name search."""
        # Safely log company name
        try:
            safe_company_name = str(company.name).encode('ascii', 'replace').decode('ascii') if company.name else "Unknown"
        except:
            safe_company_name = "Unknown"
            
        print(f"\n--- [Domain Discovery] Starting for {safe_company_name} ---")
        
        # Strategy 1: Try LinkedIn slug lookup first
        linkedin_url = company.company_linkedin_url or company.linkedin_url
        if linkedin_url:
            print(f"\n[Domain Discovery] ===== STRATEGY 1: LinkedIn Slug Lookup =====")
            print(f"[Domain Discovery] LinkedIn URL: {linkedin_url}")
            try:
                # Extract slug from LinkedIn URL
                slug = self._extract_linkedin_slug(linkedin_url)
                if slug:
                    print(f"[Domain Discovery] ✅ Extracted slug: {slug}")
                    print(f"[Domain Discovery] 🔍 Calling CoreSignal collect endpoint...")
                    data = await self.coresignal.collect_by_slug(slug)
                    if data:
                        print(f"[Domain Discovery] ✅ CoreSignal returned data: {len(data)} fields")
                        
                        # Try multiple website field names that CoreSignal might return
                        website = (data.get("websites_main") or 
                                 data.get("websites_resolved") or 
                                 data.get("unique_website") or 
                                 data.get("unique_domain"))
                        
                        print(f"[Domain Discovery] 🔍 Checking for website fields:")
                        print(f"[Domain Discovery]   - websites_main: {data.get('websites_main', 'NOT FOUND')}")
                        print(f"[Domain Discovery]   - websites_resolved: {data.get('websites_resolved', 'NOT FOUND')}")
                        print(f"[Domain Discovery]   - unique_website: {data.get('unique_website', 'NOT FOUND')}")
                        print(f"[Domain Discovery]   - unique_domain: {data.get('unique_domain', 'NOT FOUND')}")
                        
                        if website:
                            found_domain = self._clean_domain(website)
                            print(f"[Domain Discovery] ✅ Found website: {website} -> cleaned to: {found_domain}")
                            company.domain = found_domain
                            
                            print(f"[Domain Discovery] 🔄 Applying CoreSignal enrichment...")
                            # Apply CoreSignal enrichment data immediately
                            enriched_company = self.mapper.apply_coresignal_enrichment(company, data)
                            enriched_company.coresignal_data = enriched_company.coresignal_data or {}
                            enriched_company.coresignal_data["domain_source"] = "linkedin_slug_lookup"
                            
                            if session:
                                session.increment_domain_enrichment_success()
                                session.increment_coresignal_enriched()
                            
                            print(f"[Domain Discovery] 🎉 SUCCESS via LinkedIn slug: {found_domain}")
                            print(f"[Domain Discovery] 📊 Company enriched with {len(data)} CoreSignal fields")
                            print(f"[Domain Discovery] 🏷️  Domain source: linkedin_slug_lookup")
                            print(f"[Domain Discovery] ===== STRATEGY 1 COMPLETED SUCCESSFULLY =====")
                            return enriched_company
                        else:
                            print(f"[Domain Discovery] ❌ No website field found in CoreSignal response")
                            if data:
                                available_fields = list(data.keys()) if isinstance(data, dict) else []
                                print(f"[Domain Discovery] 📋 Available fields: {available_fields[:10]}...")
                    else:
                        print(f"[Domain Discovery] ❌ CoreSignal collect returned no data")
                else:
                    print(f"[Domain Discovery] ❌ Could not extract slug from LinkedIn URL")
            except Exception as e:
                print(f"[Domain Discovery] ❌ LinkedIn slug lookup failed: {str(e)}")
        else:
            print(f"[Domain Discovery] ⏭️  Skipping LinkedIn strategy - no LinkedIn URL provided")
        
        # Strategy 2: Try direct LinkedIn URL search
        if linkedin_url:
            print(f"\n[Domain Discovery] ===== STRATEGY 2: Direct LinkedIn URL Search =====")
            print(f"[Domain Discovery] LinkedIn URL: {linkedin_url}")
            try:
                print(f"[Domain Discovery] 🔍 Calling CoreSignal ES DSL search endpoint...")
                search_result = await self.coresignal.search_by_linkedin_url(linkedin_url)
                if search_result and search_result.get("website"):
                    found_domain = self._clean_domain(search_result["website"])
                    print(f"[Domain Discovery] ✅ Found website: {search_result['website']} -> cleaned to: {found_domain}")
                    company.domain = found_domain
                    
                    print(f"[Domain Discovery] 🔄 Applying CoreSignal enrichment...")
                    # Apply CoreSignal enrichment data immediately
                    enriched_company = self.mapper.apply_coresignal_enrichment(company, search_result)
                    enriched_company.coresignal_data = enriched_company.coresignal_data or {}
                    enriched_company.coresignal_data["domain_source"] = "linkedin_url_search"
                    
                    if session:
                        session.increment_domain_enrichment_success()
                        session.increment_coresignal_enriched()
                    
                    print(f"[Domain Discovery] 🎉 SUCCESS via LinkedIn URL search: {found_domain}")
                    print(f"[Domain Discovery] 📊 Company enriched with CoreSignal data")
                    print(f"[Domain Discovery] 🏷️  Domain source: linkedin_url_search")
                    
                    # Log match details
                    matched_name = search_result.get("name", "N/A")
                    print(f"[Domain Discovery] 🏢 Matched company: {matched_name}")
                    print(f"[Domain Discovery] ===== STRATEGY 2 COMPLETED SUCCESSFULLY =====")
                    return enriched_company
                else:
                    print(f"[Domain Discovery] ❌ LinkedIn URL search returned no website field")
                    if search_result:
                        available_fields = list(search_result.keys()) if isinstance(search_result, dict) else []
                        print(f"[Domain Discovery] 📋 Available fields: {available_fields}")
                    else:
                        print(f"[Domain Discovery] ❌ No search results returned")
            except Exception as e:
                print(f"[Domain Discovery] ❌ LinkedIn URL search failed: {str(e)}")
        else:
            print(f"[Domain Discovery] ⏭️  Skipping LinkedIn URL search - no LinkedIn URL provided")
        
        # Strategy 3: Try company name search
        print(f"\n[Domain Discovery] ===== STRATEGY 3: Company Name Search =====")
        location = company.headquarters or company.location
        search_query = f"'{company.name}'"
        if location:
            search_query += f" in '{location}'"
        print(f"[Domain Discovery] 🔍 Search query: {search_query}")
        print(f"[Domain Discovery] 📍 Location: {location or 'Not provided'}")
        
        try:
            print(f"[Domain Discovery] 🔍 Calling CoreSignal name search endpoint...")
            search_result = await self.coresignal.search_by_name(company.name, location)
            if search_result and search_result.get("website"):
                found_domain = self._clean_domain(search_result["website"])
                print(f"[Domain Discovery] ✅ Found website: {search_result['website']} -> cleaned to: {found_domain}")
                company.domain = found_domain
                
                print(f"[Domain Discovery] 🔄 Applying CoreSignal enrichment...")
                # Apply CoreSignal enrichment data immediately
                enriched_company = self.mapper.apply_coresignal_enrichment(company, search_result)
                enriched_company.coresignal_data = enriched_company.coresignal_data or {}
                enriched_company.coresignal_data["domain_source"] = "company_name_search"
                
                if session:
                    session.increment_domain_enrichment_success()
                    session.increment_coresignal_enriched()
                
                print(f"[Domain Discovery] 🎉 SUCCESS via name search: {found_domain}")
                print(f"[Domain Discovery] 📊 Company enriched with CoreSignal data")
                print(f"[Domain Discovery] 🏷️  Domain source: company_name_search")
                
                # Log match details
                matched_name = search_result.get("name", "N/A")
                print(f"[Domain Discovery] 🏢 Matched company: {matched_name}")
                print(f"[Domain Discovery] ===== STRATEGY 3 COMPLETED SUCCESSFULLY =====")
                return enriched_company
            else:
                print(f"[Domain Discovery] ❌ Name search returned no website field")
                if search_result:
                    available_fields = list(search_result.keys()) if isinstance(search_result, dict) else []
                    print(f"[Domain Discovery] 📋 Available fields: {available_fields}")
                else:
                    print(f"[Domain Discovery] ❌ No search results returned")
        except Exception as e:
            print(f"[Domain Discovery] ❌ Name search failed: {str(e)}")
        
        
        print(f"\n[Domain Discovery] ===== ALL STRATEGIES FAILED =====")
        print(f"[Domain Discovery] ❌ Could not find domain for {safe_company_name}")
        print(f"[Domain Discovery] 📊 Attempted strategies summary:")
        print(f"[Domain Discovery]   1️⃣  LinkedIn slug lookup: {'✅ Available' if linkedin_url else '❌ Not provided'}")
        print(f"[Domain Discovery]   2️⃣  LinkedIn URL search: {'✅ Available' if linkedin_url else '❌ Not provided'}")
        print(f"[Domain Discovery]   3️⃣  Company name search: ✅ Attempted")
        print(f"[Domain Discovery] ===== DOMAIN DISCOVERY COMPLETE - NO DOMAIN FOUND =====")
        print(f"--- [Domain Discovery] Complete ---\n")
        return company
    
    def _clean_domain(self, url: str) -> str:
        """
        Clean URL to extract just the base domain.
        Handles full URLs like 'www.reuters.com/business/uks-vertu-motors...' → 'www.reuters.com'
        """
        if not url:
            return ""

        # Remove protocol
        cleaned = url.replace("http://", "").replace("https://", "")

        # Extract base domain (before first /)
        if "/" in cleaned:
            cleaned = cleaned.split("/")[0]

        # Remove trailing slashes
        cleaned = cleaned.strip("/")

        return cleaned
    
    def _extract_linkedin_slug(self, linkedin_url: str) -> Optional[str]:
        """Extract company slug from LinkedIn URL."""
        if not linkedin_url:
            return None
        
        import re
        # Match patterns like:
        # http://www.linkedin.com/company/tapsdigital
        # https://linkedin.com/company/company-name
        # linkedin.com/company/slug
        pattern = r'(?:https?://)?(?:www\.)?linkedin\.com/company/([^/?]+)'
        match = re.search(pattern, linkedin_url.lower())
        
        if match:
            slug = match.group(1).strip()
            print(f"[Domain Discovery] Extracted LinkedIn slug: {slug}")
            return slug
        
        print(f"[Domain Discovery] Could not extract slug from: {linkedin_url}")
        return None
    
