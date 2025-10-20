"""
Lead data mapping utilities.
"""
from typing import Dict, Any, Optional

from ..schemas.lead import Lead
from ..schemas.company import SimpleCompany


class LeadMapper:
    """Mapper for lead data transformations."""
    
    def map_apollo_person_to_lead(self, person_data: Dict[str, Any], company: SimpleCompany, matched_persona: Optional[str] = None) -> Lead:
        """Map Apollo person data to Lead model with contact fields."""
        
        # Enhanced email extraction - try multiple fields
        contact_email = None
        email_fields = ["email", "work_email", "personal_email", "primary_email"]
        for field in email_fields:
            email_value = person_data.get(field)
            if email_value and not email_value.startswith("email_not_unlocked"):
                contact_email = email_value
                break
        
        # Enhanced phone extraction - try multiple formats
        contact_phone = None
        if person_data.get("phone_numbers"):
            phone_numbers = []
            for phone in person_data["phone_numbers"]:
                if isinstance(phone, dict):
                    phone_num = (phone.get("sanitized_number") or 
                               phone.get("raw_number") or 
                               phone.get("number"))
                    if phone_num and phone_num != "phone_not_unlocked":
                        phone_numbers.append(phone_num)
                elif isinstance(phone, str) and phone != "phone_not_unlocked":
                    phone_numbers.append(phone)
            contact_phone = phone_numbers[0] if phone_numbers else None
        
        # Try direct phone field if phone_numbers didn't work
        if not contact_phone:
            direct_phone = person_data.get("phone") or person_data.get("mobile_phone")
            if direct_phone and direct_phone != "phone_not_unlocked":
                contact_phone = direct_phone
        
        # Enhanced Twitter extraction
        contact_twitter = None
        twitter_fields = ["twitter_url", "twitter", "social_twitter", "twitter_handle"]
        for field in twitter_fields:
            twitter_value = person_data.get(field)
            if twitter_value:
                if not twitter_value.startswith("http"):
                    twitter_value = f"https://twitter.com/{twitter_value.lstrip('@')}"
                contact_twitter = twitter_value
                break
        
        # Extract location from various fields
        contact_location = None
        location_parts = []
        if person_data.get("city"):
            location_parts.append(person_data["city"])
        if person_data.get("state"):
            location_parts.append(person_data["state"])
        if person_data.get("country"):
            location_parts.append(person_data["country"])
        contact_location = ", ".join(location_parts) if location_parts else person_data.get("location")
        
        # Extract recent activity and published content
        contact_recent_activity = person_data.get("recent_activity") or person_data.get("headline")
        contact_published_content = person_data.get("published_content") or person_data.get("bio")
        
        # Use Apollo's organization data since organization_ids filtering ensures correct company
        actual_company_name = company.name  # Default fallback
        
        # Extract company name from Apollo's organization data
        if person_data.get("organization"):
            org_data = person_data["organization"]
            if isinstance(org_data, dict) and org_data.get("name"):
                actual_company_name = org_data["name"]
                print(f"[Apollo People] Using Apollo organization name: {actual_company_name}")
        
        # Debug: Log company assignment with safe encoding
        try:
            first_name = str(person_data.get('first_name', '')).encode('ascii', 'replace').decode('ascii') 
            last_name = str(person_data.get('last_name', '')).encode('ascii', 'replace').decode('ascii')
            safe_company_name = str(actual_company_name).encode('ascii', 'replace').decode('ascii')
            print(f"[Apollo People] Assigned company: {safe_company_name} for {first_name} {last_name}")
        except Exception as e:
            print(f"[Apollo People] Could not log person assignment: {str(e)}")
        
        return Lead(
            contact_first_name=person_data.get("first_name"),
            contact_last_name=person_data.get("last_name"),
            contact_title=person_data.get("title"),
            contact_company=actual_company_name,  # Use Apollo's company data
            contact_email=contact_email,  # Using enhanced extraction
            contact_phone=contact_phone,  # Using enhanced extraction
            contact_linkedin_url=person_data.get("linkedin_url"),
            contact_twitter=contact_twitter,  # Using enhanced extraction
            contact_location=contact_location,
            contact_recent_activity=contact_recent_activity,
            contact_published_content=contact_published_content,
            
            matched_persona=matched_persona,
            persona_confidence=1.0 if matched_persona else None,
            apollo_id=str(person_data.get("id")) if person_data.get("id") else None
        )
