"""
Company data mapping utilities.
"""
from typing import Dict, Any, List, Optional

from ..schemas.company import Company


class CompanyMapper:
    """Mapper for company data transformations."""

    def apply_hunterio_enrichment(self, company: Company, hunterio_data: dict) -> Company:
        """
        Map Hunter.io domain search results to Company contacts and pattern.

        Mapping intent and source priority:
        - Hunter.io is the authoritative and only source for contacts and email pattern enrichment.
        - This method is always called after other enrichments (CoreSignal, EnrichLayer, Serper) to ensure
          that all available contacts and email patterns are mapped, regardless of previous enrichment results.
        - No other source is used for contacts or hunterio_pattern fields.

        Logging:
        - Logs each mapped contact and the pattern, including the source (Hunter.io).
        - Logs when no contacts or pattern are found.

        Args:
            company (Company): The company object to enrich (already enriched by other sources).
            hunterio_data (dict): The Hunter.io API response.

        Returns:
            Company: The enriched company object with contacts and hunterio_pattern set if available.
        """
        import logging
        logger = logging.getLogger("hunterio_enrichment")
        from ..schemas.company import Contact
        enriched = Company(**company.dict())
        if not hunterio_data or not hunterio_data.get("data"):
            logger.info("[Hunter.io] No data found in hunterio_data, skipping enrichment.")
            return enriched

        data = hunterio_data["data"]
        emails = data.get("emails", [])
        pattern = data.get("pattern")
        contacts = []
        for email_obj in emails:
            contact = Contact(
                email=email_obj.get("value"),
                first_name=email_obj.get("first_name"),
                last_name=email_obj.get("last_name"),
                job_title=email_obj.get("position"),
                type=email_obj.get("type"),
                confidence=email_obj.get("confidence"),
                pattern=email_obj.get("pattern")
            )
            logger.info(f"[Hunter.io] Mapped contact: {contact.dict()} (source: Hunter.io)")
            contacts.append(contact)
        if contacts:
            enriched.contacts = contacts
            logger.info(f"[Hunter.io] Set {len(contacts)} contacts on Company (source: Hunter.io).")
        else:
            logger.info("[Hunter.io] No contacts found to map (source: Hunter.io).")
        if pattern:
            enriched.hunterio_pattern = pattern
            logger.info(f"[Hunter.io] Set hunterio_pattern: {pattern} (source: Hunter.io)")
        else:
            logger.info("[Hunter.io] No pattern found to map (source: Hunter.io).")
        return enriched

    def map_apollo_to_company(self, row: Dict[str, Any]) -> Company:
        """Map Apollo API response to Company model."""
        location_parts = [
            part for part in [row.get("city"), row.get("state"), row.get("country")] if part
        ]

        # Map revenue field, prioritizing organization_revenue_printed over revenue_range
        revenue_range = row.get("organization_revenue_printed") or row.get("revenue_range")
        
        # Extract technologies as a list if available
        technologies = []
        if row.get("technologies"):
            tech_data = row.get("technologies")
            if isinstance(tech_data, list):
                # Handle list of technology objects or strings
                for tech in tech_data:
                    if isinstance(tech, dict) and tech.get("technology"):
                        # Apollo format: {"technology": "react", "first_verified_at": "...", "last_verified_at": "..."}
                        technologies.append(tech["technology"])
                    elif isinstance(tech, str):
                        technologies.append(tech.strip())
            elif isinstance(tech_data, str):
                technologies = [tech.strip() for tech in tech_data.split(",")]
        
        # Extract recent news as a list if available
        recent_news = []
        if row.get("recent_news"):
            if isinstance(row.get("recent_news"), list):
                recent_news = row.get("recent_news")
            elif isinstance(row.get("recent_news"), str):
                recent_news = [news.strip() for news in row.get("recent_news").split(",")]
        
        # Extract employee count as integer
        employee_count = None
        emp_data = row.get("estimated_num_employees")
        if emp_data:
            if isinstance(emp_data, int):
                employee_count = emp_data
            elif isinstance(emp_data, str):
                # Extract first number from strings like "11-50 employees"
                import re
                numbers = re.findall(r'\d+', emp_data)
                if numbers:
                    employee_count = int(numbers[0])

        return Company(
            id=row.get("id"),
            name=row.get("name") or "",
            domain=row.get("domain") or row.get("website_url"),
            industry=row.get("industry"),
            founded_year=row.get("founded_year") or row.get("year_founded") or row.get("founded") or row.get("organization_founded_year"),
            headquarters=row.get("headquarters") or (", ".join(location_parts) if location_parts else None),
            description=row.get("description"),
            company_linkedin_url=row.get("linkedin_url"),
            employee_count=employee_count,
            revenue=row.get("revenue") or revenue_range,
            technologies=technologies if technologies else None,
            tech_spend=row.get("tech_spend"),
            it_budget=row.get("it_budget"),
            recent_news=recent_news if recent_news else None,
            job_openings=row.get("job_openings"),
            growth_signals=row.get("growth_signals"),
            ai_org_signals=row.get("ai_org_signals"),
            ai_tech_signals=row.get("ai_tech_signals"),
            ai_hiring_signals=row.get("ai_hiring_signals"),
            intent_score=row.get("intent_score"),
            intent_horizon=row.get("intent_horizon"),
            signal_evidence=row.get("signal_evidence"),
            # Legacy fields for backward compatibility
            location=", ".join(location_parts) if location_parts else None,
            revenue_range=revenue_range,
            linkedin_url=row.get("linkedin_url"),
            # Initialize CoreSignal fields
            coresignal_enriched=False,
            coresignal_data=None,
            enrichment_error=None
        )
    
    def apply_coresignal_enrichment(self, company: Company, coresignal_data: Dict[str, Any]) -> Company:
        """
        Apply CoreSignal enrichment data to a company.
        For each field, prefer CoreSignal data if available, otherwise retain the existing value.
        Logs the source and value for each mapped field.
        """
        import logging
        logger = logging.getLogger("coresignal_enrichment")
        try:
            enriched_company = Company(**company.dict())
        except Exception as e:
            logger.error(f"[CoreSignal] Error creating enriched company for {company.name}: {str(e)}")
            return company

        # Industry
        if not enriched_company.industry and coresignal_data.get("industry"):
            enriched_company.industry = coresignal_data.get("industry")
            logger.info(f"[Mapping] industry: using CoreSignal ({enriched_company.industry})")
        else:
            logger.info(f"[Mapping] industry: using previous value ({enriched_company.industry})")

        # Founded year
        if not enriched_company.founded_year:
            founded_year = (coresignal_data.get("founded_year") or
                            coresignal_data.get("year_founded") or
                            coresignal_data.get("founded") or
                            coresignal_data.get("establishment_year"))
            if founded_year:
                try:
                    enriched_company.founded_year = int(founded_year)
                    logger.info(f"[Mapping] founded_year: using CoreSignal ({enriched_company.founded_year})")
                except (ValueError, TypeError):
                    logger.warning(f"[Mapping] founded_year: invalid format from CoreSignal ({founded_year})")
            else:
                logger.info(f"[Mapping] founded_year: using previous value ({enriched_company.founded_year})")

        # Description
        description_enriched = coresignal_data.get("description_enriched")
        if description_enriched and description_enriched.strip():
            enriched_company.description = description_enriched
            logger.info(f"[Mapping] description: using CoreSignal enriched ({description_enriched[:100]}...)")
        elif not enriched_company.description and coresignal_data.get("description"):
            enriched_company.description = coresignal_data.get("description")
            logger.info(f"[Mapping] description: using CoreSignal ({coresignal_data.get('description')[:100]}...)")
        else:
            logger.info(f"[Mapping] description: using previous value ({enriched_company.description})")

        # Technologies
        technologies_used = coresignal_data.get("technologies_used")
        if technologies_used:
            enriched_company.technologies = self._extract_technologies(technologies_used, company.name)
            logger.info(f"[Mapping] technologies: using CoreSignal (technologies_used)")
        elif not enriched_company.technologies and coresignal_data.get("technologies"):
            fallback_tech = coresignal_data.get("technologies")
            enriched_company.technologies = self._extract_technologies_fallback(fallback_tech, company.name)
            logger.info(f"[Mapping] technologies: using CoreSignal (technologies fallback)")
        else:
            logger.info(f"[Mapping] technologies: using previous value ({enriched_company.technologies})")

        # Employee count
        employee_count_raw = coresignal_data.get("size_range")
        if employee_count_raw:
            try:
                import re
                if isinstance(employee_count_raw, str):
                    numbers = re.findall(r'\d+', employee_count_raw)
                    if numbers:
                        enriched_company.employee_count = int(numbers[0])
                        logger.info(f"[Mapping] employee_count: using CoreSignal ({enriched_company.employee_count})")
                    else:
                        logger.warning(f"[Mapping] employee_count: no numbers found in CoreSignal ({employee_count_raw})")
                elif isinstance(employee_count_raw, int):
                    enriched_company.employee_count = employee_count_raw
                    logger.info(f"[Mapping] employee_count: using CoreSignal ({employee_count_raw})")
            except (ValueError, TypeError) as e:
                logger.warning(f"[Mapping] employee_count: invalid format from CoreSignal ({employee_count_raw}) - {str(e)}")
        else:
            logger.info(f"[Mapping] employee_count: using previous value ({enriched_company.employee_count})")

        # Location
        location_hq = coresignal_data.get("location_hq_raw_address")
        if location_hq:
            enriched_company.location = location_hq
            logger.info(f"[Mapping] location: using CoreSignal (location_hq_raw_address: {location_hq})")
        elif not enriched_company.location:
            location_parts = []
            if coresignal_data.get("city"):
                location_parts.append(coresignal_data["city"])
            if coresignal_data.get("country"):
                location_parts.append(coresignal_data["country"])
            if location_parts:
                enriched_company.location = ", ".join(location_parts)
                logger.info(f"[Mapping] location: using CoreSignal (city/country fallback: {enriched_company.location})")
            else:
                logger.info(f"[Mapping] location: using previous value ({enriched_company.location})")
        else:
            logger.info(f"[Mapping] location: using previous value ({enriched_company.location})")

        # Revenue range
        if not enriched_company.revenue_range:
            apollo_revenue = coresignal_data.get("organization_revenue_printed")
            if apollo_revenue:
                enriched_company.revenue_range = str(apollo_revenue)
                logger.info(f"[Mapping] revenue_range: using CoreSignal (organization_revenue_printed: {apollo_revenue})")
            elif coresignal_data.get("revenue"):
                revenue = coresignal_data.get("revenue")
                enriched_company.revenue_range = f"${revenue:,}" if isinstance(revenue, (int, float)) else str(revenue)
                logger.info(f"[Mapping] revenue_range: using CoreSignal (revenue: {enriched_company.revenue_range})")
            else:
                logger.info(f"[Mapping] revenue_range: using previous value ({enriched_company.revenue_range})")
        else:
            logger.info(f"[Mapping] revenue_range: using previous value ({enriched_company.revenue_range})")

        # Social media fields
        if coresignal_data.get("social_twitter_urls"):
            twitter_urls = coresignal_data.get("social_twitter_urls")
            if isinstance(twitter_urls, list) and twitter_urls:
                enriched_company.twitter_url = twitter_urls[0]
            elif isinstance(twitter_urls, str):
                enriched_company.twitter_url = twitter_urls
            logger.info(f"[Mapping] twitter_url: using CoreSignal ({enriched_company.twitter_url})")
        else:
            logger.info(f"[Mapping] twitter_url: using previous value ({enriched_company.twitter_url})")

        if coresignal_data.get("social_facebook_urls"):
            facebook_urls = coresignal_data.get("social_facebook_urls")
            if isinstance(facebook_urls, list) and facebook_urls:
                enriched_company.facebook_url = facebook_urls[0]
            elif isinstance(facebook_urls, str):
                enriched_company.facebook_url = facebook_urls
            logger.info(f"[Mapping] facebook_url: using CoreSignal ({enriched_company.facebook_url})")
        else:
            logger.info(f"[Mapping] facebook_url: using previous value ({enriched_company.facebook_url})")

        if coresignal_data.get("social_instagram_urls"):
            instagram_urls = coresignal_data.get("social_instagram_urls")
            if isinstance(instagram_urls, list) and instagram_urls:
                enriched_company.instagram_url = instagram_urls[0]
            elif isinstance(instagram_urls, str):
                enriched_company.instagram_url = instagram_urls
            logger.info(f"[Mapping] instagram_url: using CoreSignal ({enriched_company.instagram_url})")
        else:
            logger.info(f"[Mapping] instagram_url: using previous value ({enriched_company.instagram_url})")

        if coresignal_data.get("social_youtube_urls"):
            youtube_urls = coresignal_data.get("social_youtube_urls")
            if isinstance(youtube_urls, list) and youtube_urls:
                enriched_company.youtube_url = youtube_urls[0]
            elif isinstance(youtube_urls, str):
                enriched_company.youtube_url = youtube_urls
            logger.info(f"[Mapping] youtube_url: using CoreSignal ({enriched_company.youtube_url})")
        else:
            logger.info(f"[Mapping] youtube_url: using previous value ({enriched_company.youtube_url})")

        if coresignal_data.get("social_github_urls"):
            github_urls = coresignal_data.get("social_github_urls")
            if isinstance(github_urls, list) and github_urls:
                enriched_company.github_url = github_urls[0]
            elif isinstance(github_urls, str):
                enriched_company.github_url = github_urls
            logger.info(f"[Mapping] github_url: using CoreSignal ({enriched_company.github_url})")
        else:
            logger.info(f"[Mapping] github_url: using previous value ({enriched_company.github_url})")

        # Store CoreSignal enrichment info
        enriched_company.coresignal_enriched = True
        enriched_company.coresignal_data = coresignal_data

        # Validate the enriched company before returning
        try:
            enriched_company.dict()
            return enriched_company
        except Exception as validation_error:
            logger.error(f"[CoreSignal] Validation error for enriched {company.name}: {str(validation_error)}")
            company.enrichment_error = f"Validation failed: {str(validation_error)}"
            return company
    
    def _extract_technologies(self, technologies_used: Any, company_name: str) -> Optional[List[str]]:
        """Extract technologies from technologies_used field."""
        if isinstance(technologies_used, list):
            return technologies_used
        elif isinstance(technologies_used, str):
            # Handle case where technologies_used is a string (comma-separated)
            tech_list = [tech.strip() for tech in technologies_used.split(",") if tech.strip()]
            return tech_list if tech_list else None
        elif isinstance(technologies_used, dict):
            # Handle case where technologies_used is a dict with technology categories
            tech_list = []
            for category, techs in technologies_used.items():
                if isinstance(techs, list):
                    tech_list.extend(techs)
                elif isinstance(techs, str):
                    tech_list.extend([tech.strip() for tech in techs.split(",") if tech.strip()])
            return tech_list if tech_list else None
        return None
    
    def _extract_technologies_fallback(self, fallback_tech: Any, company_name: str) -> Optional[List[str]]:
        """Extract technologies from fallback technologies field."""
        if isinstance(fallback_tech, list):
            # Handle list of technology objects like [{'technology': 'react', 'first_verified_at': '...'}]
            tech_list = []
            for tech in fallback_tech:
                if isinstance(tech, dict) and tech.get("technology"):
                    tech_list.append(tech["technology"])
                elif isinstance(tech, str):
                    tech_list.append(tech.strip())
            return tech_list if tech_list else None
        elif isinstance(fallback_tech, str):
            tech_list = [tech.strip() for tech in fallback_tech.split(",") if tech.strip()]
            return tech_list if tech_list else None
        return None
