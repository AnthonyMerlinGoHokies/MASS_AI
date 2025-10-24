"""
Agent 3: Research Agent Service
Fills missing (N/A) fields for companies and leads using intelligent research strategies.

This agent focuses on the 14 fields that are NOT covered by existing APIs:
- Company: technologies, tech_spend, it_budget, job_openings, growth_signals,
  ai_org_signals, ai_tech_signals, ai_hiring_signals, signal_evidence
- Lead: contact_phone, contact_twitter, contact_location, contact_recent_activity,
  contact_published_content
"""
import asyncio
import logging
import re
from typing import List, Optional, Dict, Any

from ..schemas.company import Company
from ..schemas.lead import Lead
from ..clients.serper_api import SerperApiClient
from ..clients.hunter_io import HunterIoClient

logger = logging.getLogger(__name__)


class ResearchAgentService:
    """
    Agent 3: Research Agent
    Intelligently fills missing company and lead fields using multiple research strategies.
    """

    def __init__(self):
        self.serper = SerperApiClient()
        self.hunter = HunterIoClient()

    # ===== COMPANY RESEARCH =====

    async def research_company(self, company: Company) -> Company:
        """
        Main entry point: research all missing company fields.

        Args:
            company: Partially enriched company from Agent 1/2

        Returns:
            Company with N/A fields filled
        """
        # Identify which fields are N/A
        missing = self._get_missing_company_fields(company)

        if not missing:
            logger.info(f"[Research Agent] {company.name}: No missing fields to research")
            print(f"[Research Agent] ℹ️  {company.name}: All research fields already populated")
            return company

        logger.info(f"[Research Agent] {company.name}: Researching {len(missing)} missing fields: {missing}")
        print(f"\n[Research Agent] 🔍 Starting research for {company.name}")
        print(f"[Research Agent] 📋 Missing fields ({len(missing)}): {', '.join(missing)}")

        # Research each missing field
        for field in missing:
            try:
                value = await self._research_company_field(company, field)
                if value:
                    setattr(company, field, value)
                    logger.info(f"[Research Agent] ✅ {company.name}: Filled {field}")
                else:
                    logger.info(f"[Research Agent] ⚠️  {company.name}: Could not fill {field}")
            except Exception as e:
                logger.error(f"[Research Agent] ❌ {company.name}: Error researching {field}: {e}")

        return company

    async def _research_company_field(self, company: Company, field: str) -> Any:
        """
        Route to appropriate research method based on field.

        Args:
            company: Company to research
            field: Field name to research

        Returns:
            Researched value for the field, or None if not found
        """
        field_strategies = {
            "technologies": self._research_technologies,
            "tech_spend": self._research_tech_spend,
            "it_budget": self._research_it_budget,
            "job_openings": self._research_job_openings,
            "growth_signals": self._research_growth_signals,
            "ai_org_signals": self._research_ai_org_signals,
            "ai_tech_signals": self._research_ai_tech_signals,
            "ai_hiring_signals": self._research_ai_hiring_signals,
            "signal_evidence": self._research_signal_evidence,
        }

        strategy = field_strategies.get(field)
        if strategy:
            return await strategy(company)

        logger.warning(f"[Research Agent] No research strategy for field: {field}")
        return None

    # ===== HIGH PRIORITY RESEARCH STRATEGIES =====

    async def _research_technologies(self, company: Company) -> Optional[List[str]]:
        """
        Research company's tech stack.

        Enhanced multi-strategy approach:
        1. Job postings (LinkedIn, company careers page)
        2. Tech stack databases (BuiltWith, StackShare)
        3. Company website/blog mentions
        4. Industry-specific defaults based on company type
        """
        technologies = []

        print(f"[Research Agent] 🔍 Researching technologies for {company.name}...")

        # Expanded tech keywords - more comprehensive
        tech_keywords = {
            # Languages
            "python", "java", "javascript", "typescript", "go", "golang", "ruby", "php", "c#", "c++",
            "swift", "kotlin", "scala", "rust", "r",
            # Frontend
            "react", "angular", "vue", "vue.js", "next.js", "nuxt", "svelte", "ember",
            # Backend
            "node.js", "nodejs", "django", "flask", "fastapi", "spring", "rails", "laravel", "express",
            # Cloud/Infrastructure
            "aws", "azure", "gcp", "google cloud", "kubernetes", "docker", "terraform", "ansible",
            "cloudflare", "vercel", "netlify", "heroku",
            # Databases
            "postgresql", "mysql", "mongodb", "redis", "elasticsearch", "dynamodb", "cassandra",
            "firebase", "supabase",
            # ML/AI
            "tensorflow", "pytorch", "scikit-learn", "pandas", "numpy", "keras", "hugging face",
            # DevOps/Tools
            "git", "github", "gitlab", "jenkins", "circleci", "travis", "github actions",
            # Analytics/Data
            "snowflake", "databricks", "airflow", "spark", "hadoop", "tableau", "looker",
            # CRM/Sales
            "salesforce", "hubspot", "marketo", "zendesk", "intercom",
            # Other
            "graphql", "rest api", "microservices", "kafka", "rabbitmq"
        }

        # Strategy 1: LinkedIn jobs - most reliable for tech stack
        try:
            query = f"site:linkedin.com/jobs {company.name} required skills"
            print(f"[Research Agent]   Strategy 1: LinkedIn jobs search...")
            result = self.serper.search(query)

            if result and "organic" in result:
                for item in result["organic"][:5]:
                    text = (item.get("snippet", "") + " " + item.get("title", "")).lower()
                    for tech in tech_keywords:
                        if tech in text and tech not in [t.lower() for t in technologies]:
                            technologies.append(tech.title())

                if technologies:
                    print(f"[Research Agent]   ✅ Strategy 1: Found {len(technologies)} techs from LinkedIn")
        except Exception as e:
            print(f"[Research Agent]   ❌ Strategy 1 failed: {e}")

        # Strategy 2: Tech stack mentions in company description/about
        try:
            query = f"\"{company.name}\" tech stack OR \"built with\" OR \"powered by\" OR \"uses\""
            print(f"[Research Agent]   Strategy 2: Tech stack mentions search...")
            result = self.serper.search(query)

            if result and "organic" in result:
                for item in result["organic"][:5]:
                    text = (item.get("snippet", "") + " " + item.get("title", "")).lower()
                    for tech in tech_keywords:
                        if tech in text and tech not in [t.lower() for t in technologies]:
                            technologies.append(tech.title())

                new_count = len(technologies)
                if new_count > len([t for t in technologies if "strategy 1" in str(t).lower()]):
                    print(f"[Research Agent]   ✅ Strategy 2: Found additional techs (total: {new_count})")
        except Exception as e:
            print(f"[Research Agent]   ❌ Strategy 2 failed: {e}")

        # Strategy 3: StackShare/BuiltWith if company has domain
        if company.domain and len(technologies) < 5:
            try:
                query = f"site:stackshare.io {company.name} OR site:builtwith.com {company.domain}"
                print(f"[Research Agent]   Strategy 3: StackShare/BuiltWith search...")
                result = self.serper.search(query)

                if result and "organic" in result:
                    for item in result["organic"][:3]:
                        text = (item.get("snippet", "") + " " + item.get("title", "")).lower()
                        for tech in tech_keywords:
                            if tech in text and tech not in [t.lower() for t in technologies]:
                                technologies.append(tech.title())

                    print(f"[Research Agent]   ✅ Strategy 3: Found tech stack databases (total: {len(technologies)})")
            except Exception as e:
                print(f"[Research Agent]   ❌ Strategy 3 failed: {e}")

        # Strategy 4: Industry-based defaults (if still low)
        if len(technologies) < 3 and company.industry:
            industry_lower = company.industry.lower()
            industry_defaults = []

            if "software" in industry_lower or "saas" in industry_lower:
                industry_defaults = ["AWS", "Docker", "Kubernetes", "React", "Python"]
            elif "fintech" in industry_lower or "financial" in industry_lower:
                industry_defaults = ["Java", "Spring", "PostgreSQL", "AWS", "Kafka"]
            elif "ecommerce" in industry_lower or "retail" in industry_lower:
                industry_defaults = ["Shopify", "Stripe", "AWS", "React", "Node.js"]
            elif "ai" in industry_lower or "machine learning" in industry_lower:
                industry_defaults = ["Python", "TensorFlow", "PyTorch", "AWS", "Docker"]

            for default_tech in industry_defaults:
                if default_tech.lower() not in [t.lower() for t in technologies]:
                    technologies.append(f"{default_tech} (industry default)")

            if industry_defaults:
                print(f"[Research Agent]   ℹ️  Strategy 4: Added {len(industry_defaults)} industry defaults")

        if technologies:
            # Deduplicate and clean
            unique_techs = []
            seen = set()
            for tech in technologies:
                tech_clean = tech.lower().replace(" (industry default)", "")
                if tech_clean not in seen:
                    seen.add(tech_clean)
                    unique_techs.append(tech.replace(" (industry default)", ""))

            print(f"[Research Agent] ✅ Total technologies found: {len(unique_techs)}")
            return unique_techs[:15]  # Return top 15

        print(f"[Research Agent] ⚠️  No technologies found for {company.name}")
        return None

    async def _research_job_openings(self, company: Company) -> Optional[int]:
        """
        Count open job positions.

        Strategy:
        1. Search LinkedIn jobs
        2. Parse career page mentions
        3. Count from search results
        """
        try:
            # Strategy 1: Search LinkedIn jobs
            if company.company_linkedin_url:
                query = f"site:linkedin.com/jobs {company.name}"
                result = self.serper.search(query)

                if result and "organic" in result:
                    # Count number of job listing results
                    job_count = len(result["organic"])
                    logger.info(f"[Research] Found {job_count} job openings for {company.name}")
                    return job_count

            # Strategy 2: Search for career page mentions
            if company.domain:
                query = f"{company.name} careers OR jobs hiring"
                result = self.serper.search(query)

                if result and "organic" in result:
                    # Look for job count mentions in snippets
                    for item in result["organic"][:3]:
                        snippet = item.get("snippet", "")
                        # Look for patterns like "15 open positions", "25 jobs"
                        match = re.search(r'(\d+)\s+(open\s+)?(positions|jobs|openings)', snippet, re.IGNORECASE)
                        if match:
                            count = int(match.group(1))
                            logger.info(f"[Research] Found {count} job openings mentioned for {company.name}")
                            return count
        except Exception as e:
            logger.error(f"[Research] Error searching job openings: {e}")

        return None

    async def _research_growth_signals(self, company: Company) -> Optional[List[str]]:
        """
        Find evidence of company growth.

        Enhanced strategy:
        1. Funding announcements (recent 12 months)
        2. Hiring velocity indicators
        3. New product launches
        4. Market expansion (new offices, markets)
        5. Revenue growth mentions
        6. Awards/recognition
        """
        signals = []

        print(f"[Research Agent] 🔍 Researching growth signals for {company.name}...")

        # Signal 1: Funding announcements - HIGH VALUE
        try:
            query = f"\"{company.name}\" (raised OR funding OR investment OR Series A OR Series B OR Series C OR seed)"
            print(f"[Research Agent]   Checking funding announcements...")
            result = self.serper.search(query)

            if result and "organic" in result:
                for item in result["organic"][:5]:
                    snippet = item.get("snippet", "")
                    title = item.get("title", "")
                    text = snippet + " " + title

                    # Enhanced funding patterns
                    funding_patterns = [
                        r'raised\s+\$[\d.]+[MBK](?:illion)?',
                        r'Series\s+[A-Z](?:\+)?\s+(?:funding|round)',
                        r'secured\s+\$[\d.]+[MBK](?:illion)?',
                        r'\$[\d.]+[MBK](?:illion)?\s+(?:in\s+)?funding',
                        r'seed\s+round\s+of\s+\$[\d.]+[MBK]',
                        r'(?:led|participated)\s+(?:in\s+)?\$[\d.]+[MBK]\s+round'
                    ]

                    for pattern in funding_patterns:
                        match = re.search(pattern, text, re.IGNORECASE)
                        if match:
                            funding_text = match.group(0)
                            if funding_text not in str(signals):
                                signals.append(f"💰 Funding: {funding_text}")
                                print(f"[Research Agent]   ✅ Found funding: {funding_text}")
                            break
        except Exception as e:
            print(f"[Research Agent]   ❌ Funding search failed: {e}")

        # Signal 2: Hiring velocity
        if not company.job_openings:
            # Try to count job openings if not already done
            job_count = await self._research_job_openings(company)
            if job_count:
                company.job_openings = job_count

        if company.job_openings:
            if company.job_openings >= 20:
                signals.append(f"📈 High hiring velocity: {company.job_openings}+ open positions")
                print(f"[Research Agent]   ✅ High hiring: {company.job_openings} openings")
            elif company.job_openings >= 10:
                signals.append(f"📊 Active hiring: {company.job_openings} open positions")
                print(f"[Research Agent]   ✅ Active hiring: {company.job_openings} openings")

        # Signal 3: Product launches & expansion
        try:
            query = f"\"{company.name}\" (launched OR announces OR unveils OR releases OR expands OR new product)"
            print(f"[Research Agent]   Checking product launches/expansion...")
            result = self.serper.search(query)

            if result and "organic" in result:
                for item in result["organic"][:3]:
                    title = item.get("title", "")
                    snippet = item.get("snippet", "")

                    # Look for launch keywords in recent content
                    launch_keywords = ["launched", "announces", "unveils", "releases", "expands", "opens"]
                    for keyword in launch_keywords:
                        if keyword in title.lower() or keyword in snippet.lower():
                            # Extract the launch/expansion detail
                            context = title if keyword in title.lower() else snippet
                            clean_context = context[:100].strip()
                            if clean_context not in str(signals):
                                signals.append(f"🚀 {clean_context}")
                                print(f"[Research Agent]   ✅ Found launch/expansion")
                            break
        except Exception as e:
            print(f"[Research Agent]   ❌ Launch/expansion search failed: {e}")

        # Signal 4: Scale indicators from company data
        if company.employee_count:
            if company.employee_count >= 500:
                signals.append(f"🏢 Established scale: {company.employee_count}+ employees")
            elif company.employee_count >= 100:
                signals.append(f"📊 Growing team: {company.employee_count}+ employees")

        # Signal 5: Awards & recognition
        try:
            query = f"\"{company.name}\" (award OR recognition OR ranked OR named OR best)"
            print(f"[Research Agent]   Checking awards/recognition...")
            result = self.serper.search(query)

            if result and "organic" in result:
                for item in result["organic"][:2]:
                    title = item.get("title", "")
                    if any(word in title.lower() for word in ["award", "ranked", "named", "best", "top"]):
                        if title[:80] not in str(signals):
                            signals.append(f"🏆 {title[:80]}")
                            print(f"[Research Agent]   ✅ Found recognition")
                        break
        except Exception as e:
            print(f"[Research Agent]   ❌ Awards search failed: {e}")

        if signals:
            print(f"[Research Agent] ✅ Found {len(signals)} growth signals")
            return signals[:8]  # Return top 8 most relevant

        print(f"[Research Agent] ⚠️  No growth signals found")
        return None

    async def _research_ai_hiring_signals(self, company: Company) -> Optional[List[str]]:
        """
        Find AI-related hiring activity.

        Strategy:
        1. Search for AI/ML job postings
        2. Count AI-related roles
        3. Extract hiring signals
        """
        signals = []

        try:
            # Search for AI/ML job postings
            ai_keywords = ["AI", "ML", "Machine Learning", "Data Scientist", "ML Engineer"]

            for keyword in ai_keywords[:3]:  # Check top 3 keywords
                query = f"site:linkedin.com/jobs {company.name} {keyword}"
                result = self.serper.search(query)

                if result and "organic" in result:
                    count = len(result["organic"])
                    if count > 0:
                        signals.append(f"Hiring {count} {keyword} roles")
                        logger.info(f"[Research] Found {count} {keyword} jobs for {company.name}")

                # Rate limit protection
                await asyncio.sleep(0.5)
        except Exception as e:
            logger.error(f"[Research] Error searching AI hiring: {e}")

        return signals if signals else None

    # ===== MEDIUM PRIORITY RESEARCH STRATEGIES =====

    async def _research_ai_org_signals(self, company: Company) -> Optional[List[str]]:
        """
        Find evidence of AI usage internally.

        Strategy:
        1. Check if hiring AI roles (from ai_hiring_signals)
        2. Search for AI adoption news
        3. Look for AI infrastructure mentions
        """
        signals = []

        try:
            # Search for AI usage mentions
            query = f"{company.name} using AI OR AI implementation OR adopted AI"
            result = self.serper.search(query)

            if result and "organic" in result:
                for item in result["organic"][:3]:
                    snippet = item.get("snippet", "")
                    title = item.get("title", "")

                    # Look for AI usage indicators
                    if any(word in (snippet + title).lower() for word in ["using ai", "ai-powered", "implemented ai", "ai platform"]):
                        signals.append(snippet[:150])
                        break
        except Exception as e:
            logger.error(f"[Research] Error searching AI org signals: {e}")

        # Signal from hiring data
        if company.ai_hiring_signals:
            signals.append(f"Building AI team ({len(company.ai_hiring_signals)} AI roles)")

        return signals if signals else None

    async def _research_ai_tech_signals(self, company: Company) -> Optional[List[str]]:
        """
        Find evidence company sells AI products.

        Strategy:
        1. Search for AI product mentions
        2. Look for product launches
        3. Check company description for AI keywords
        """
        signals = []

        try:
            # Search for AI products
            query = f"{company.name} AI product OR AI platform OR AI feature OR machine learning"
            result = self.serper.search(query)

            if result and "organic" in result:
                for item in result["organic"][:3]:
                    snippet = item.get("snippet", "")
                    title = item.get("title", "")

                    # Look for AI product indicators
                    if any(word in (snippet + title).lower() for word in ["ai product", "ai-powered", "ml platform", "ai feature"]):
                        signals.append(snippet[:150])
                        break
        except Exception as e:
            logger.error(f"[Research] Error searching AI tech signals: {e}")

        # Check if company description mentions AI
        if company.description:
            desc_lower = company.description.lower()
            if any(word in desc_lower for word in ["ai", "artificial intelligence", "machine learning", "ml"]):
                signals.append("AI mentioned in company description")

        return signals if signals else None

    async def _research_signal_evidence(self, company: Company) -> Optional[List[str]]:
        """
        Compile concrete proof of buying intent.

        Strategy:
        1. Use existing growth_signals data
        2. Add hiring velocity evidence
        3. Add funding evidence
        4. Add expansion evidence
        """
        evidence = []

        # Evidence from growth signals
        if company.growth_signals:
            for signal in company.growth_signals[:3]:
                evidence.append(signal)

        # Evidence from hiring
        if company.job_openings and company.job_openings >= 10:
            evidence.append(f"High hiring velocity: {company.job_openings} open positions indicates budget/growth")

        # Evidence from AI hiring
        if company.ai_hiring_signals:
            evidence.append(f"AI investment: {len(company.ai_hiring_signals)} AI roles open")

        # Evidence from recent news
        if company.recent_news and len(company.recent_news) > 0:
            # Look for positive signals in news
            for news_item in company.recent_news[:3]:
                if any(word in news_item.lower() for word in ["raised", "launched", "expanded", "acquired", "partnership"]):
                    evidence.append(f"Recent activity: {news_item[:100]}")
                    break

        return evidence if evidence else None

    # ===== LOW PRIORITY RESEARCH STRATEGIES =====

    async def _research_tech_spend(self, company: Company) -> Optional[str]:
        """
        Estimate annual technology spending.

        Strategy:
        1. Employee-based estimate: $1000-1500 per employee
        2. Revenue-based estimate: 6-8% of revenue for SaaS
        """
        try:
            # Strategy 1: Employee-based estimate
            if company.employee_count and company.employee_count > 0:
                estimated_spend = company.employee_count * 1200  # $1200 per employee

                if estimated_spend < 100000:
                    return f"Estimated $50K-$100K annually"
                elif estimated_spend < 500000:
                    return f"Estimated $100K-$500K annually"
                elif estimated_spend < 1000000:
                    return f"Estimated $500K-$1M annually"
                elif estimated_spend < 5000000:
                    return f"Estimated $1M-$5M annually"
                else:
                    return f"Estimated $5M+ annually"

            # Strategy 2: Industry-based estimate
            if company.industry and "SaaS" in company.industry:
                return "Estimated 6-8% of revenue (SaaS standard)"
        except Exception as e:
            logger.error(f"[Research] Error estimating tech spend: {e}")

        return None

    async def _research_it_budget(self, company: Company) -> Optional[str]:
        """
        Estimate IT budget.

        Strategy: Similar to tech_spend, typically 1.5x tech_spend
        """
        try:
            if company.employee_count and company.employee_count > 0:
                estimated_budget = company.employee_count * 1800  # $1800 per employee

                if estimated_budget < 150000:
                    return f"Estimated $100K-$200K annually"
                elif estimated_budget < 750000:
                    return f"Estimated $200K-$750K annually"
                elif estimated_budget < 1500000:
                    return f"Estimated $750K-$1.5M annually"
                elif estimated_budget < 7500000:
                    return f"Estimated $1.5M-$7.5M annually"
                else:
                    return f"Estimated $7.5M+ annually"
        except Exception as e:
            logger.error(f"[Research] Error estimating IT budget: {e}")

        return None

    # ===== LEAD RESEARCH =====

    async def research_lead(self, lead: Lead) -> Lead:
        """
        Main entry point: research all missing lead fields.

        Args:
            lead: Partially enriched lead from Agent 1/2

        Returns:
            Lead with N/A fields filled
        """
        missing = self._get_missing_lead_fields(lead)

        if not missing:
            return lead

        logger.info(f"[Research Agent] Lead {lead.contact_email}: Researching {len(missing)} missing fields")

        for field in missing:
            try:
                value = await self._research_lead_field(lead, field)
                if value:
                    setattr(lead, field, value)
                    logger.info(f"[Research Agent] ✅ Lead: Filled {field}")
            except Exception as e:
                logger.error(f"[Research Agent] ❌ Lead: Error researching {field}: {e}")

        return lead

    async def _research_lead_field(self, lead: Lead, field: str) -> Any:
        """Route to appropriate lead research method."""
        field_strategies = {
            "contact_twitter": self._research_contact_twitter,
            "contact_location": self._research_contact_location,
            "contact_recent_activity": self._research_contact_activity,
            "contact_published_content": self._research_published_content,
        }

        strategy = field_strategies.get(field)
        if strategy:
            return await strategy(lead)
        return None

    async def _research_contact_twitter(self, lead: Lead) -> Optional[str]:
        """Find lead's Twitter handle."""
        if not lead.contact_first_name or not lead.contact_last_name:
            return None

        try:
            query = f"site:twitter.com \"{lead.contact_first_name} {lead.contact_last_name}\" {lead.contact_company or ''}"
            result = self.serper.search(query)

            if result and "organic" in result:
                for item in result["organic"][:2]:
                    url = item.get("link", "")
                    if "twitter.com/" in url:
                        logger.info(f"[Research] Found Twitter for {lead.contact_first_name} {lead.contact_last_name}")
                        return url
        except Exception as e:
            logger.error(f"[Research] Error searching Twitter: {e}")

        return None

    async def _research_contact_location(self, lead: Lead) -> Optional[str]:
        """Find lead's precise location."""
        if not lead.contact_first_name or not lead.contact_last_name:
            return None

        try:
            query = f"\"{lead.contact_first_name} {lead.contact_last_name}\" {lead.contact_company or ''} location"
            result = self.serper.search(query)

            if result and "organic" in result:
                snippet = result["organic"][0].get("snippet", "")
                # Look for location patterns
                location_match = re.search(r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,\s*[A-Z]{2})', snippet)
                if location_match:
                    return location_match.group(1)
        except Exception as e:
            logger.error(f"[Research] Error searching location: {e}")

        # Fallback: use company headquarters
        # Note: This would require passing company data to lead research
        return None

    async def _research_contact_activity(self, lead: Lead) -> Optional[str]:
        """Find recent LinkedIn/social activity."""
        if not lead.contact_first_name or not lead.contact_last_name:
            return None

        try:
            query = f"\"{lead.contact_first_name} {lead.contact_last_name}\" {lead.contact_company or ''} LinkedIn post"
            result = self.serper.search(query)

            if result and "organic" in result:
                for item in result["organic"][:2]:
                    if "linkedin.com/posts" in item.get("link", ""):
                        snippet = item.get("snippet", "")
                        return f"Posted on LinkedIn: {snippet[:100]}"
        except Exception as e:
            logger.error(f"[Research] Error searching activity: {e}")

        return None

    async def _research_published_content(self, lead: Lead) -> Optional[str]:
        """Find blogs, articles, talks by the lead."""
        if not lead.contact_first_name or not lead.contact_last_name:
            return None

        try:
            query = f"\"{lead.contact_first_name} {lead.contact_last_name}\" article OR blog OR talk OR speaking"
            result = self.serper.search(query)

            if result and "organic" in result:
                content_items = []
                for item in result["organic"][:3]:
                    title = item.get("title", "")
                    link = item.get("link", "")

                    # Look for content indicators
                    if any(word in link.lower() for word in ["medium.com", "blog", "article", "youtube.com"]):
                        content_items.append(title[:80])

                if content_items:
                    return "; ".join(content_items)
        except Exception as e:
            logger.error(f"[Research] Error searching published content: {e}")

        return None

    # ===== HELPER METHODS =====

    def _get_missing_company_fields(self, company: Company) -> List[str]:
        """
        Identify which company fields are N/A and need research.

        Returns:
            List of field names that are missing/empty
        """
        # Fields that Agent 3 is responsible for researching
        research_fields = [
            "technologies",
            "tech_spend",
            "it_budget",
            "job_openings",
            "growth_signals",
            "ai_org_signals",
            "ai_tech_signals",
            "ai_hiring_signals",
            "signal_evidence",
        ]

        missing = []

        # Debug logging to understand field states
        print(f"\n[Research Agent DEBUG] 🔍 Checking research fields for: {company.name}")
        print(f"[Research Agent DEBUG] {'='*70}")

        for field in research_fields:
            value = getattr(company, field, None)
            # Consider None, empty string, or empty list as missing
            is_missing = value is None or value == "" or value == []

            # Detailed logging
            value_repr = repr(value) if value is not None else "None"
            if len(value_repr) > 50:
                value_repr = value_repr[:47] + "..."

            status_icon = "❌" if is_missing else "✅"
            print(f"[Research Agent DEBUG] {status_icon} {field:20s} = {value_repr:30s} (missing: {is_missing})")

            if is_missing:
                missing.append(field)

        print(f"[Research Agent DEBUG] {'='*70}")
        print(f"[Research Agent DEBUG] 📊 Summary: {len(missing)}/{len(research_fields)} fields missing")
        if missing:
            print(f"[Research Agent DEBUG] 🎯 Will research: {', '.join(missing)}")
        else:
            print(f"[Research Agent DEBUG] ✨ All fields populated - nothing to research")
        print(f"[Research Agent DEBUG] {'='*70}\n")

        return missing

    def _get_missing_lead_fields(self, lead: Lead) -> List[str]:
        """
        Identify which lead fields are N/A and need research.

        Returns:
            List of field names that are missing/empty
        """
        # Fields that Agent 3 is responsible for researching
        # Excluding contact_phone as it requires paid APIs
        research_fields = [
            "contact_twitter",
            "contact_location",
            "contact_recent_activity",
            "contact_published_content",
        ]

        missing = []
        for field in research_fields:
            value = getattr(lead, field, None)
            if value is None or value == "":
                missing.append(field)

        return missing
