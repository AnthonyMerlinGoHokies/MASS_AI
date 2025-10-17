"""
Lead service for people search and lead generation.
"""
from typing import List, Optional
from collections import Counter
import asyncio
import time

from ..clients.apollo import ApolloClient
from ..schemas.lead import Lead, LeadsRequest, LeadsResponse
from ..schemas.icp import PersonaConfig
from ..mappers.lead_mapper import LeadMapper
from ..core.session import get_session
from ..core.logger import journey_logger
from ..core.console_logger import console_logger
from ..core.guardrails import lead_guardrails, log_guardrails_summary


class LeadService:
    """Service for lead operations."""
    
    def __init__(self):
        self.apollo = ApolloClient()
        self.mapper = LeadMapper()
    
    async def get_leads(self, request: LeadsRequest) -> LeadsResponse:
        """
        Get leads from companies using Apollo People Search API and high-confidence contacts from company enrichments.
        """
        session = None
        if hasattr(request, 'session_id') and request.session_id:
            session = get_session(request.session_id)
        
        # Log leads generation start
        personas_list = [p.dict() for p in request.personas] if request.personas else []
        console_logger.log_leads_start(len(request.companies), personas_list)
        
        start_time = time.time()

        try:
            all_leads = []
            companies_processed = 0
            apollo_lead_count = 0

            print(f"[Leads] Processing {len(request.companies)} companies")

            # 1. Collect Apollo leads as before
            for i, company in enumerate(request.companies, 1):
                if company.domain:
                    leads = await self._get_company_leads(company, request.personas, request.max_leads_per_company or 5)
                    all_leads.extend(leads)
                    apollo_lead_count += len(leads)
                    companies_processed += 1
                    console_logger.log_company_leads(company.name, len(leads), i, len(request.companies))
                    await asyncio.sleep(0.5)  # Rate limiting
                else:
                    print(f"[Leads] Skipping {company.name} - no domain")
                    console_logger.log_company_leads(company.name, 0, i, len(request.companies))

            # 2. Collect high-confidence contacts from company enrichment (Hunter.io, EnrichLayer, etc.)
            high_conf_contacts = []
            for company in request.companies:
                # company.contacts is a list of Contact objects (from Hunter.io enrichment)
                contacts = getattr(company, "contacts", None)
                if contacts:
                    for contact in contacts:
                        if contact.confidence is not None and contact.confidence > 90:
                            # Map Contact to Lead
                            lead = Lead(
                                contact_first_name=contact.first_name,
                                contact_last_name=contact.last_name,
                                contact_title=contact.job_title,
                                contact_company=company.name,
                                contact_email=contact.email,
                                contact_phone=None,
                                contact_linkedin_url=None,
                                contact_twitter=None,
                                contact_location=None,
                                contact_recent_activity=None,
                                contact_published_content=None,
                                matched_persona=None,
                                persona_confidence=None,
                                apollo_id=None
                            )
                            high_conf_contacts.append(lead)
                            print(f"[Leads] [High-Confidence] Added contact {contact.first_name} {contact.last_name} ({contact.email}) from {company.name} with confidence {contact.confidence}")

            # 3. Enrich high-confidence contacts (Hunter.io, Serper, etc.)
            enriched_high_conf_leads = []
            for lead in high_conf_contacts:
                enriched_lead = await self._enrich_lead(lead)
                enriched_high_conf_leads.append(enriched_lead)
                print(f"[Leads] [Enrichment] Enriched high-confidence contact: {lead.contact_first_name} {lead.contact_last_name} ({lead.contact_email})")

            # 4. Merge Apollo and high-confidence leads
            all_leads.extend(enriched_high_conf_leads)

            if not all_leads:
                return self._no_leads_response(companies_processed)

            # 5. Deduplicate leads (across Apollo, Hunter.io, etc.)
            deduplicated_leads = self._deduplicate_leads(all_leads)
            print(f"[Leads] Deduplication complete: {len(all_leads)} → {len(deduplicated_leads)} leads")
            
            hunterio_lead_count = len(enriched_high_conf_leads)
            
            # 6. Apply guardrails to filter invalid leads
            print(f"[Leads] Applying guardrails to validate {len(deduplicated_leads)} leads...")
            validated_leads, guardrails_stats = lead_guardrails.apply_guardrails(deduplicated_leads)
            print(f"[Leads] Guardrails filtering complete: {len(deduplicated_leads)} → {len(validated_leads)} leads")
            
            # Log guardrails to console and file
            console_logger.log_guardrails_filtering(
                len(deduplicated_leads),
                len(validated_leads),
                guardrails_stats['filtered_leads']
            )
            log_guardrails_summary(guardrails_stats, session.session_id if session else None)

            # 7. Log all valid leads
            for lead in validated_leads:
                company_domain = next((c.domain for c in request.companies if c.name == lead.contact_company), None)
                journey_logger.log_lead_generation(
                    session_id=session.session_id if session else "unknown",
                    lead=lead,
                    company_domain=company_domain
                )

            # 8. Update session with final lead count
            if session:
                session.set_leads_generated(len(validated_leads))
            
            # Log leads summary with guardrails info
            console_logger.log_leads_summary(
                len(validated_leads),
                companies_processed,
                apollo_lead_count,
                hunterio_lead_count
            )
            
            # Log session complete
            processing_time = time.time() - start_time
            errors = session.errors if session else []
            console_logger.log_session_complete(
                processing_time,
                len(request.companies),
                len(validated_leads),
                errors
            )

            return LeadsResponse(
                success=True,
                leads=validated_leads,
                total_leads=len(validated_leads),
                companies_processed=companies_processed
            )

        except Exception as e:
            error_msg = str(e).encode('ascii', 'replace').decode('ascii')
            if session:
                session.add_error(f"Lead generation failed: {error_msg}")
            print(f"[Leads] Service error: {error_msg}")
            return LeadsResponse(success=False, leads=[], total_leads=0, companies_processed=0, error=error_msg)
    
    async def _get_company_leads(self, company, personas: Optional[List[PersonaConfig]], max_leads: int) -> List[Lead]:
        """Get leads for a single company."""
        try:
            # Safely log company name with encoding handling
            company_name = str(company.name).encode('ascii', 'replace').decode('ascii') if company.name else "Unknown"
            print(f"[Leads] Processing {company_name}")
            
            people_data = await self.apollo.search_people(company, personas, max_leads)
            
            leads = []
            for person_data in people_data:
                try:
                    matched_persona = self._match_person_to_personas(person_data, personas) if personas else None
                    lead = self.mapper.map_apollo_person_to_lead(person_data, company, matched_persona)
                    leads.append(lead)
                except Exception as e:
                    print(f"[Leads] Error processing person data: {str(e)}")
                    continue
            
            print(f"[Leads] Got {len(leads)} leads for {company_name}")
            return leads
        except Exception as e:
            print(f"[Leads] Error getting leads for company: {str(e)}")
            return []
    
    def _no_leads_response(self, companies_processed: int) -> LeadsResponse:
        """Create response when no leads are found."""
        if not self.apollo.api_key:
            error = "Apollo API key not configured"
        elif companies_processed == 0:
            error = "No companies provided for lead search"
        else:
            error = "No leads found for the provided companies"
        
        return LeadsResponse(
            success=False, 
            leads=[], 
            total_leads=0, 
            companies_processed=companies_processed,
            error=f"NO DATA AVAILABLE - {error}"
        )
    
    def _deduplicate_leads(self, leads: List[Lead]) -> List[Lead]:
        """
        Remove duplicate leads by email (primary), then Apollo ID (if present).
        """
        seen_emails = set()
        seen_ids = set()
        deduplicated = []

        for lead in leads:
            email = (lead.contact_email or "").lower()
            apollo_id = lead.apollo_id
            if email and email in seen_emails:
                print(f"[Leads] Skipping duplicate by email: {lead.contact_first_name} {lead.contact_last_name} ({email})")
                continue
            if apollo_id and apollo_id in seen_ids:
                print(f"[Leads] Skipping duplicate by Apollo ID: {lead.contact_first_name} {lead.contact_last_name} ({apollo_id})")
                continue
            if email:
                seen_emails.add(email)
            if apollo_id:
                seen_ids.add(apollo_id)
            deduplicated.append(lead)

        if len(deduplicated) != len(leads):
            print(f"[Leads] Deduplication: {len(leads)} → {len(deduplicated)} leads")

        return deduplicated
    
    def _match_person_to_personas(self, person_data: dict, personas: List[PersonaConfig]) -> Optional[str]:
        """Match a person to personas based on title regex."""
        import re
        
        title = person_data.get("title", "").strip()
        if not title:
            return None
        
        for persona in personas:
            for regex_pattern in persona.title_regex:
                try:
                    if re.match(regex_pattern, title, re.IGNORECASE):
                        return persona.name
                except re.error:
                    if persona.name.lower() in title.lower():
                        return persona.name
        return None

    async def _enrich_lead(self, lead: Lead) -> Lead:
        """
        Enrich a lead using Hunter.io and Serper (email verification, LinkedIn, etc.).
        """
        # Example enrichment: verify email with Hunter.io, supplement with Serper if needed
        # (Extend this as needed for your enrichment stack)
        from ..clients.hunter_io import HunterIoClient
        from ..clients.serper_api import SerperApiClient

        hunter = HunterIoClient()
        serper = SerperApiClient()

        # 1. Email verification (Hunter.io)
        if lead.contact_email:
            try:
                result = hunter.email_verifier(lead.contact_email)
                if result and result.get("data", {}).get("result") == "deliverable":
                    print(f"[Enrich] Hunter.io verified deliverable email: {lead.contact_email}")
                else:
                    print(f"[Enrich] Hunter.io could not verify email: {lead.contact_email}")
            except Exception as e:
                print(f"[Enrich] Hunter.io verification error: {str(e)}")

        # 2. Supplement LinkedIn/Twitter with Serper if missing
        if not lead.contact_linkedin_url and lead.contact_first_name and lead.contact_last_name and lead.contact_company:
            query = f"{lead.contact_first_name} {lead.contact_last_name} {lead.contact_company} linkedin"
            try:
                search_result = serper.search(query)
                if search_result and "organic" in search_result:
                    for result in search_result["organic"]:
                        url = result.get("link", "")
                        if "linkedin.com/in/" in url:
                            lead.contact_linkedin_url = url
                            print(f"[Enrich] Serper found LinkedIn: {url}")
                            break
            except Exception as e:
                print(f"[Enrich] Serper LinkedIn enrichment error: {str(e)}")

        # 3. Supplement Twitter with Serper if missing
        if not lead.contact_twitter and lead.contact_first_name and lead.contact_last_name and lead.contact_company:
            query = f"{lead.contact_first_name} {lead.contact_last_name} {lead.contact_company} twitter"
            try:
                search_result = serper.search(query)
                if search_result and "organic" in search_result:
                    for result in search_result["organic"]:
                        url = result.get("link", "")
                        if "twitter.com" in url:
                            lead.contact_twitter = url
                            print(f"[Enrich] Serper found Twitter: {url}")
                            break
            except Exception as e:
                print(f"[Enrich] Serper Twitter enrichment error: {str(e)}")

        # 4. Agent 3: Research Agent - Fill remaining N/A lead fields
        try:
            from ..services.research_agent_service import ResearchAgentService
            research_agent = ResearchAgentService()

            print(f"[Enrich] Starting Agent 3 (Research Agent) for lead: {lead.contact_email}")
            lead = await research_agent.research_lead(lead)
            print(f"[Enrich] Agent 3 (Research Agent) complete for lead")
        except Exception as e:
            print(f"[Enrich] Agent 3 (Research Agent) exception: {str(e)}")

        return lead
