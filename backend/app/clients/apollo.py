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

        # Build improved keyword tags for better tech company targeting
        keyword_tags = []
        if industries:
            keyword_tags.extend(industries)
        # Add specific tech industry keywords for better targeting
        tech_keywords = ["Software Development", "SaaS", "Cloud Computing", "Software", "Technology"]
        keyword_tags.extend([kw for kw in tech_keywords if kw not in keyword_tags])

        # Convert technologies to lowercase UIDs (Apollo format requirement)
        technology_uids = None
        if filters.technologies:
            technology_uids = [tech.lower().replace(" ", "_").replace(".", "_") for tech in filters.technologies]

        # Use Apollo mixed_companies search endpoint with CORRECTED field names per API docs
        payload: Dict[str, Any] = {
            "page": 1,
            "per_page": 10,

            # Employee count filters ✅ Correct field name
            "organization_num_employees_ranges": [f"{emp_min},{emp_max}"] if emp_min and emp_max else None,

            # Location filters ✅ Correct field name
            "organization_locations": filters.cities if filters.cities else filters.locations,

            # Industry/keyword filters ✅ Correct field name, improved values
            "q_organization_keyword_tags": keyword_tags if keyword_tags else None,

            # Technology filters ✅ FIXED: Correct field name per Apollo API docs
            "currently_using_any_of_technology_uids": technology_uids,

            # Basic constraints
            "prospected_by_current_team": False,
        }

        # Revenue filters ✅ FIXED: Correct format per Apollo API docs (min/max structure)
        if arr_min or arr_max:
            payload["revenue_range"] = {}
            if arr_min:
                payload["revenue_range"]["min"] = int(arr_min)
            if arr_max:
                payload["revenue_range"]["max"] = int(arr_max)

        # Funding filters (optional - only if amount specified, not stage)
        if filters.total_funding_min or filters.total_funding_max:
            payload["total_funding_range"] = {}
            if filters.total_funding_min:
                payload["total_funding_range"]["min"] = int(filters.total_funding_min)
            if filters.total_funding_max:
                payload["total_funding_range"]["max"] = int(filters.total_funding_max)

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
            print(f"[Apollo People] 🔍 FALLBACK: Attempting to find organization_id by company name and domain...")

            # Fallback: Search for the organization by name to get its ID
            try:
                org_id = await self._find_organization_id(company.name, company.domain)
                if org_id:
                    payload["organization_ids"] = [org_id]
                    print(f"[Apollo People] ✅ FALLBACK SUCCESS: Found organization_id: {org_id}")
                else:
                    print(f"[Apollo People] ❌ FALLBACK FAILED: Could not find organization_id")
                    print(f"[Apollo People] ⚠️  Will search by domain only - may return leads from other companies!")
            except Exception as e:
                print(f"[Apollo People] ❌ FALLBACK ERROR: {str(e)}")
                print(f"[Apollo People] ⚠️  Will search by domain only - may return leads from other companies!")
        
        # 🔬 DIAGNOSTIC MODE: Test different filter combinations
        # Set to 1, 2, 3, or 4 to test different approaches
        # MODE 2: Simplified single-word titles for better match rates
        DIAGNOSTIC_MODE = 2

        # Add persona-based title filters if personas are provided
        if personas:
            if DIAGNOSTIC_MODE == 1:
                # MODE 1: NO TITLE FILTERS - Test if removing titles returns contacts
                print(f"[Apollo People] 🧪 DIAGNOSTIC MODE 1: Searching WITHOUT title filters (org_id only)")
                # Don't add person_titles - test if org has ANY contacts

            elif DIAGNOSTIC_MODE == 2:
                # MODE 2: SIMPLIFIED SINGLE-WORD TITLES - Test if exact matching works
                print(f"[Apollo People] 🧪 DIAGNOSTIC MODE 2: Using simplified single-word titles")
                payload["person_titles"] = ["CTO", "VP", "Director", "Manager", "Engineer"]

            elif DIAGNOSTIC_MODE == 3:
                # MODE 3: USE SENIORITY INSTEAD OF TITLES - Test alternative filter
                print(f"[Apollo People] 🧪 DIAGNOSTIC MODE 3: Using person_seniorities instead of titles")
                payload["person_seniorities"] = ["executive", "director", "manager"]
                # Don't add person_titles

            elif DIAGNOSTIC_MODE == 4:
                # MODE 4: ORIGINAL EXPANDED TITLES - Current implementation
                print(f"[Apollo People] 🧪 DIAGNOSTIC MODE 4: Using expanded title list (original)")
                title_keywords = []
                for persona in personas:
                    title_keywords.append(persona.name)

                    # EXPANDED: CTO + Senior Technical Leadership Roles (for small companies 100-500 employees)
                    if persona.name.lower() == "cto":
                        title_keywords.extend([
                            "Chief Technology Officer", "CTO", "Chief Technical Officer",
                            # VP-level technical leadership
                            "VP Engineering", "VP of Engineering", "Vice President of Engineering",
                            "VP Technology", "VP of Technology", "Vice President of Technology",
                            "VP Product Engineering", "VP of Product Engineering",
                            # Head-level technical leadership
                            "Head of Engineering", "Head of Technology", "Head of Development",
                            "Head of Software Engineering", "Head of Tech",
                            # Director-level technical leadership
                            "Director of Engineering", "Engineering Director", "Director Engineering",
                            "Director of Technology", "Technology Director",
                            "Director of Software Engineering", "Software Engineering Director",
                            # Senior Manager/Lead roles (common in smaller companies)
                            "Engineering Manager", "Manager of Engineering", "Tech Manager",
                            "Tech Lead", "Technical Lead", "Lead Engineer", "Lead Developer",
                            "Principal Engineer", "Staff Engineer"
                        ])
                    elif persona.name.lower() == "ceo":
                        title_keywords.extend(["Chief Executive Officer", "CEO", "Chief Executive"])
                    elif persona.name.lower() in ["vp", "vice president"]:
                        title_keywords.extend(["VP", "Vice President", "V.P."])
                    elif "manager" in persona.name.lower():
                        title_keywords.extend(["Manager", "Mgr"])
                    elif "director" in persona.name.lower():
                        title_keywords.extend(["Director", "Dir"])

                if title_keywords:
                    # Increased limit from 10 to 25 to accommodate expanded titles
                    payload["person_titles"] = title_keywords[:25]
        
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

                # DIAGNOSTIC: Log full API response structure
                print(f"[Apollo People] 🔍 DIAGNOSTIC: Full API Response Keys: {list(data.keys())}")

                # Check for error messages in response
                if "error" in data or "errors" in data:
                    error_msg = data.get("error") or data.get("errors")
                    print(f"[Apollo People] ⚠️  API returned error in response: {error_msg}")

                # Check pagination info
                if "pagination" in data:
                    pagination = data["pagination"]
                    print(f"[Apollo People] 📄 Pagination: {pagination}")
                    total_entries = pagination.get("total_entries", 0)
                    print(f"[Apollo People] 📊 Total contacts available in Apollo DB: {total_entries}")
                else:
                    print(f"[Apollo People] ⚠️  No pagination info in response")

                # Get contacts array
                # CRITICAL FIX: Apollo Basic Plan returns data in "people" field, not "contacts"
                # "contacts" field is always empty, "people" field has the actual contact data
                people = data.get("people", [])

                print(f"[Apollo People] Found {len(people)} leads for {company.name}")

                # If 0 results, log the full response for debugging
                if len(people) == 0:
                    import json
                    print(f"[Apollo People] 🚨 ZERO RESULTS - Full Response: {json.dumps(data, indent=2)[:1000]}")

                # Debug: Log available fields for first contact
                if people and len(people) > 0:
                    first_contact = people[0]
                    available_fields = list(first_contact.keys())
                    print(f"[Apollo People] Available fields: {available_fields}")

                    # Log contact-related fields specifically
                    contact_fields = {k: v for k, v in first_contact.items()
                                     if any(term in k.lower() for term in ['email', 'phone', 'twitter', 'contact'])}
                    if contact_fields:
                        print(f"[Apollo People] Contact fields: {contact_fields}")

                    # Print complete first contact data for debugging
                    print(f"[Apollo People] Complete first contact data: {first_contact}")

                return people
            else:
                print(f"[Apollo People] ❌ API HTTP error for {company.name}: {response.status_code} - {response.text}")
                return []

    async def _find_organization_id(self, company_name: str, domain: str) -> Optional[str]:
        """
        Find Apollo organization_id by searching for the company by name and domain.
        This is a fallback when organization_id is not available from initial search.
        """
        if not company_name:
            return None

        # Search for the organization using Apollo's mixed_companies endpoint
        search_payload = {
            "page": 1,
            "per_page": 1,
            "q_organization_name": company_name,
        }

        # Add domain filter if available for better accuracy
        if domain:
            search_payload["q_organization_domains"] = [domain]

        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Cache-Control": "no-cache",
            "X-Api-Key": self.api_key,
        }

        print(f"[Apollo People] 🔍 Searching for organization: {company_name} (domain: {domain or 'N/A'})")

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                self.companies_url,
                json=search_payload,
                headers=headers
            )

            if response.status_code == 200:
                data = response.json()
                companies = data.get("companies") or data.get("organizations") or []

                if companies and len(companies) > 0:
                    org_id = companies[0].get("id")
                    org_name = companies[0].get("name", "Unknown")
                    print(f"[Apollo People] ✅ Found organization: {org_name} (ID: {org_id})")
                    return org_id
                else:
                    print(f"[Apollo People] ❌ No organizations found for: {company_name}")
                    return None
            else:
                print(f"[Apollo People] ❌ Organization search failed: {response.status_code}")
                return None
