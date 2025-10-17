"""
Apollo API client for company and people search.
"""
import json
import httpx
from typing import Dict, Any, List, Optional

from ..core.config import settings
from ..schemas.icp import ICPConfig
from ..schemas.company import SimpleCompany
from ..schemas.icp import PersonaConfig


class ApolloClient:
    """Client for Apollo API."""
    
    def __init__(self):
        self.api_key = settings.APOLLO_API_KEY
        self.companies_url = settings.APOLLO_SEARCH_URL
        self.people_url = settings.APOLLO_PEOPLE_URL
    
    def compose_query_from_icp(self, icp: ICPConfig) -> Dict[str, Any]:
        """Compose Apollo search query from ICP configuration."""
        filters = icp.company_filters
        
        # Basic filters
        industries = filters.industries or []
        emp_min = filters.employee_count.get("min") if filters.employee_count else None
        emp_max = filters.employee_count.get("max") if filters.employee_count else None
        arr_min = filters.arr_usd.get("min") if filters.arr_usd else None
        arr_max = filters.arr_usd.get("max") if filters.arr_usd else None
        
        # Use Apollo mixed_companies search endpoint with correct field names
        payload: Dict[str, Any] = {
            "page": 1,
            "per_page": 10,
            
            # Employee count filters (verified field names)
            "organization_num_employees_ranges": [f"{emp_min},{emp_max}"] if emp_min and emp_max else None,
            
            # Revenue filters (alternative field names)
            "organization_revenue_ranges": [f"{arr_min},{arr_max}"] if arr_min and arr_max else None,
            
            # Location filters (correct field names)
            "organization_locations": filters.cities if filters.cities else filters.locations,
            
            # Industry filters (use keywords for now)
            "q_organization_keyword_tags": industries if industries else None,
            
            # Technology filters (add to keywords)
            "q_organization_technology_names": filters.technologies,
            
            # Founded year (if supported)
            "organization_latest_funding_stage_cd": filters.funding_stage,
            
            # Basic constraints
            "prospected_by_current_team": False,
            "q_organization_domains": None,  # Can add specific domains here
        }

        # Remove None values to avoid API complaints
        clean_payload = {k: v for k, v in payload.items() if v is not None}
        
        # Log the payload for debugging
        print(f"[Apollo] Composed query payload: {clean_payload}")
        
        return clean_payload
    
    async def search_companies(self, search_payload: Dict[str, Any]) -> Dict[str, Any]:
        """Search for companies using Apollo API."""
        if not self.api_key:
            raise Exception("Apollo API key not configured")
        
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Cache-Control": "no-cache",
            "X-Api-Key": self.api_key,
        }
        
        # Log the outbound request payload
        try:
            print(f"[Apollo] Request payload: {json.dumps(search_payload, ensure_ascii=True)}")
        except Exception as e:
            print(f"[Apollo] Could not log request payload: {str(e)}")

        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.companies_url, 
                headers=headers, 
                json=search_payload, 
                timeout=settings.DEFAULT_TIMEOUT
            )
            
            if response.status_code >= 400:
                # Log details from Apollo for easier debugging
                try:
                    print(f"[Apollo] HTTP {response.status_code} error. Body: {response.text[:500]}")
                except Exception:
                    pass
                response.raise_for_status()

            data = response.json()
            # Apollo mixed_companies search returns companies under 'companies'
            rows = data.get("companies") or data.get("organizations") or []
            
            # Log the count received
            try:
                print(f"[Apollo] Response root keys: {list(data.keys())}")
                print(f"[Apollo] Response companies count: {len(rows)}")
                if len(rows) > 0 and isinstance(rows[0], dict):
                    first_keys = list(rows[0].keys())
                    print(f"[Apollo] First company field count: {len(first_keys)}")
                    print(f"[Apollo] First company field names: {first_keys}")
                    
                    # Log founded year related fields specifically
                    first_company = rows[0]
                    founded_fields = {k: v for k, v in first_company.items() if 'found' in k.lower() or 'year' in k.lower() or 'establish' in k.lower()}
                    if founded_fields:
                        print(f"[Apollo] Founded/Year related fields: {founded_fields}")
                    else:
                        print(f"[Apollo] No founded/year fields found in response")
            except Exception:
                pass
            
            return data
    
    async def search_people(self, company: SimpleCompany, personas: Optional[List[PersonaConfig]] = None, max_leads: int = 5) -> List[Dict[str, Any]]:
        """Search for people at a specific company using Apollo People Search API."""
        if not self.api_key:
            print(f"[Apollo People] No API key configured - cannot search for leads")
            return []
        
        if not company.domain:
            print(f"[Apollo People] No domain provided for {company.name} - cannot search for leads")
            return []
        
        # Build the search payload for Apollo People Search API
        payload = {
            "page": 1,
            "per_page": max_leads,
            "organization_ids": [],
            "sort_by_field": "recommendations_score",
            "sort_ascending": False,
            "person_titles": [],
        }
        
        # Add organization_ids filtering to ensure we only get leads from the specific company
        # Try organization_id first (preferred), fallback to id if not available
        org_id = company.organization_id or company.id

        if org_id:
            payload["organization_ids"] = [org_id]
            print(f"[Apollo People] ✅ Searching with organization_ids filter: [{org_id}]")
        else:
            print(f"[Apollo People] ⚠️  WARNING: No organization_id provided for {company.name}")
            print(f"[Apollo People] ⚠️  Will search by domain only - may return leads from other companies!")
        
        # Add persona-based title filters if personas are provided
        if personas:
            title_keywords = []
            for persona in personas:
                title_keywords.append(persona.name)
                if persona.name.lower() == "cto":
                    title_keywords.extend(["Chief Technology Officer", "CTO", "Chief Technical Officer"])
                elif persona.name.lower() == "ceo":
                    title_keywords.extend(["Chief Executive Officer", "CEO", "Chief Executive"])
                elif persona.name.lower() in ["vp", "vice president"]:
                    title_keywords.extend(["VP", "Vice President", "V.P."])
                elif "manager" in persona.name.lower():
                    title_keywords.extend(["Manager", "Mgr"])
                elif "director" in persona.name.lower():
                    title_keywords.extend(["Director", "Dir"])
            
            if title_keywords:
                payload["person_titles"] = title_keywords[:10]  # Limit to avoid too many filters
        
        print(f"[Apollo People] Searching for leads at {company.name} (Domain: {company.domain})")
        print(f"[Apollo People] Final payload: {payload}")
        
        headers = {
            "Cache-Control": "no-cache",
            "Content-Type": "application/json",
            "X-Api-Key": self.api_key
        }
        
        async with httpx.AsyncClient(timeout=settings.DEFAULT_TIMEOUT) as client:
            response = await client.post(
                self.people_url,
                json=payload,
                headers=headers
            )
            
            if response.status_code == 200:
                data = response.json()
                people = data.get("people", [])
                
                print(f"[Apollo People] Found {len(people)} leads for {company.name}")
                
                # Debug: Log available fields for first person
                if people and len(people) > 0:
                    first_person = people[0]
                    available_fields = list(first_person.keys())
                    print(f"[Apollo People] Available fields: {available_fields}")
                    
                    # Log contact-related fields specifically
                    contact_fields = {k: v for k, v in first_person.items() 
                                     if any(term in k.lower() for term in ['email', 'phone', 'twitter', 'contact'])}
                    if contact_fields:
                        print(f"[Apollo People] Contact fields: {contact_fields}")
                    
                    # Print complete first person data for debugging
                    print(f"[Apollo People] Complete first person data: {first_person}")
                
                return people
            else:
                print(f"[Apollo People] API error for {company.name}: {response.status_code} - {response.text}")
                return []
