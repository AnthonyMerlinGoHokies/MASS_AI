"""
CoreSignal API client for company enrichment.
"""
import httpx
from typing import Dict, Any, Optional

from ..core.config import settings


class CoreSignalClient:
    """Client for CoreSignal API."""
    
    def __init__(self):
        self.api_key = settings.CORESIGNAL_API_KEY
        self.enrich_url = settings.CORESIGNAL_API_URL
        self.search_url = settings.CORESIGNAL_SEARCH_URL
        self.collect_url = settings.CORESIGNAL_COLLECT_URL
        self.es_dsl_url = settings.CORESIGNAL_ES_DSL_URL
        self.timeout = settings.CORESIGNAL_TIMEOUT
    
    async def enrich_by_domain(self, domain: str) -> Optional[Dict[str, Any]]:
        """Enrich company data using domain."""
        if not self.api_key or not domain:
            return None
        
        headers = {
            "accept": "application/json",
            "apikey": self.api_key
        }
        
        # Clean domain (remove http/https if present)
        clean_domain = domain.replace("http://", "").replace("https://", "").strip("/")
        url = f"{self.enrich_url}?website={clean_domain}"
        
        print(f"[CoreSignal] Enriching domain: {clean_domain}")
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, headers=headers, timeout=self.timeout)
                response.raise_for_status()
                
                data = response.json()
                print(f"[CoreSignal] Response for {clean_domain}: {len(str(data))} chars")
                
                if isinstance(data, dict):
                    available_fields = list(data.keys())
                    print(f"[CoreSignal] Available fields: {available_fields}")
                    return data
                else:
                    print(f"[CoreSignal] Response is not a dict: {type(data)}")
                    return None
                    
            except httpx.HTTPStatusError as e:
                print(f"[CoreSignal] HTTP Error for {clean_domain}: {e.response.status_code}")
                return None
            except Exception as e:
                print(f"[CoreSignal] Error for {clean_domain}: {str(e)}")
                return None
    
    
    async def search_by_name(self, company_name: str, location: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Search for company by name and optionally location."""
        if not self.api_key or not company_name:
            return None
        
        headers = {
            "accept": "application/json",
            "apikey": self.api_key
        }
        
        # Build simpler search query for company name
        search_body = {
            "query": {
                "match": {
                    "name": company_name
                }
            },
            "size": 1,  # Only get top match
            "_source": ["name", "website", "location", "location_hq_raw_address"]
        }
        
        # Add location filter if available
        if location:
            search_body["query"] = {
                "bool": {
                    "must": [
                        {"match": {"name": company_name}},
                        {
                            "multi_match": {
                                "query": location,
                                "fields": ["location", "location_hq_raw_address", "city", "country"]
                            }
                        }
                    ]
                }
            }
            print(f"[CoreSignal] Searching for: '{company_name}' in '{location}'")
        else:
            print(f"[CoreSignal] Searching for: '{company_name}'")
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    self.search_url,
                    headers=headers,
                    json=search_body,
                    timeout=self.timeout
                )
                
                if response.status_code == 200:
                    search_data = response.json()
                    hits = search_data.get("hits", {}).get("hits", [])
                    
                    if hits and len(hits) > 0:
                        top_match = hits[0].get("_source", {})
                        website = top_match.get("website")
                        
                        if website:
                            print(f"[CoreSignal] Found website via name search: {website}")
                            print(f"[CoreSignal] Matched company: {top_match.get('name')} (score: {hits[0].get('_score')})")
                            # Return the full company data for enrichment
                            return top_match
                        else:
                            print(f"[CoreSignal] Top search result has no website field")
                    else:
                        print(f"[CoreSignal] No search results found for {company_name}")
                else:
                    print(f"[CoreSignal] Search API returned status: {response.status_code}")
                    if response.status_code != 200:
                        print(f"[CoreSignal] Response: {response.text[:500]}")
                        print(f"[CoreSignal] Request URL: {self.search_url}")
                        print(f"[CoreSignal] Request headers: {headers}")
                        print(f"[CoreSignal] Request body: {search_body}")
                return None
                
            except Exception as e:
                print(f"[CoreSignal] Company name search failed: {str(e)}")
                return None
    
    async def collect_by_slug(self, slug: str) -> Optional[Dict[str, Any]]:
        """Collect company data using LinkedIn slug."""
        if not self.api_key or not slug:
            print(f"[CoreSignal] ❌ Missing API key or slug")
            return None
        
        headers = {
            "accept": "application/json",
            "apikey": self.api_key
        }
        
        url = f"{self.collect_url}/{slug}"
        print(f"[CoreSignal] 🔍 Collecting data for slug: {slug}")
        print(f"[CoreSignal] 🌐 URL: {url}")
        
        async with httpx.AsyncClient() as client:
            try:
                print(f"[CoreSignal] 📡 Making GET request...")
                response = await client.get(url, headers=headers, timeout=self.timeout)
                print(f"[CoreSignal] 📊 Response status: {response.status_code}")
                
                if response.status_code == 200:
                    data = response.json()
                    print(f"[CoreSignal] ✅ Collect response for {slug}: {len(str(data))} chars")
                    if isinstance(data, dict):
                        available_fields = list(data.keys())
                        print(f"[CoreSignal] 📋 Available fields ({len(available_fields)}): {available_fields[:10]}...")
                        
                        # Log key fields
                        print(f"[CoreSignal] 🔍 Key field values:")
                        print(f"[CoreSignal]   - name: {data.get('name', 'NOT FOUND')}")
                        print(f"[CoreSignal]   - websites_main: {data.get('websites_main', 'NOT FOUND')}")
                        print(f"[CoreSignal]   - industry: {data.get('industry', 'NOT FOUND')}")
                        print(f"[CoreSignal]   - founded: {data.get('founded', 'NOT FOUND')}")
                        print(f"[CoreSignal]   - size_range: {data.get('size_range', 'NOT FOUND')}")
                        
                        return data
                    else:
                        print(f"[CoreSignal] ❌ Collect response is not a dict: {type(data)}")
                        return None
                else:
                    print(f"[CoreSignal] ❌ Collect API returned status: {response.status_code}")
                    if response.status_code != 200:
                        print(f"[CoreSignal] 📄 Response: {response.text[:500]}")
                return None
            except Exception as e:
                print(f"[CoreSignal] ❌ Collect by slug failed: {str(e)}")
                return None
    
    async def search_by_linkedin_url(self, linkedin_url: str) -> Optional[Dict[str, Any]]:
        """Search for company using LinkedIn URL in websites_professional_network field."""
        if not self.api_key or not linkedin_url:
            print(f"[CoreSignal] ❌ Missing API key or LinkedIn URL")
            return None
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        # Build Elasticsearch DSL query
        search_body = {
            "query": {
                "term": {
                    "websites_professional_network": linkedin_url
                }
            },
            "size": 1,  # Only get top match
            "_source": ["name", "website", "location", "location_hq_raw_address", "websites_professional_network"]
        }
        
        print(f"[CoreSignal] 🔍 Searching by LinkedIn URL: {linkedin_url}")
        print(f"[CoreSignal] 🌐 ES DSL URL: {self.es_dsl_url}")
        print(f"[CoreSignal] 📋 Query: {search_body}")
        
        async with httpx.AsyncClient() as client:
            try:
                print(f"[CoreSignal] 📡 Making POST request to ES DSL endpoint...")
                response = await client.post(
                    self.es_dsl_url,
                    headers=headers,
                    json=search_body,
                    timeout=self.timeout
                )
                print(f"[CoreSignal] 📊 Response status: {response.status_code}")
                
                if response.status_code == 200:
                    search_data = response.json()
                    hits = search_data.get("hits", {}).get("hits", [])
                    print(f"[CoreSignal] 📊 Found {len(hits)} search results")
                    
                    if hits and len(hits) > 0:
                        top_match = hits[0].get("_source", {})
                        website = top_match.get("website")
                        score = hits[0].get("_score")
                        
                        print(f"[CoreSignal] 🏆 Top match score: {score}")
                        print(f"[CoreSignal] 🔍 Top match data: {list(top_match.keys())}")
                        
                        if website:
                            print(f"[CoreSignal] ✅ Found website via LinkedIn URL search: {website}")
                            print(f"[CoreSignal] 🏢 Matched company: {top_match.get('name')}")
                            # Return the full company data for enrichment
                            return top_match
                        else:
                            print(f"[CoreSignal] ❌ Top search result has no website field")
                            print(f"[CoreSignal] 📋 Available fields: {list(top_match.keys())}")
                    else:
                        print(f"[CoreSignal] ❌ No search results found for LinkedIn URL: {linkedin_url}")
                else:
                    print(f"[CoreSignal] ❌ LinkedIn URL search API returned status: {response.status_code}")
                    if response.status_code == 404:
                        print(f"[CoreSignal] ⚠️  ES_DSL endpoint not found (404) - may need different API plan or endpoint URL")
                    elif response.status_code == 402:
                        print(f"[CoreSignal] ⚠️  Insufficient credits (402) - need to purchase more credits")
                    if response.status_code != 200:
                        print(f"[CoreSignal] 📄 Response: {response.text[:500]}")
                        print(f"[CoreSignal] 🌐 Request URL: {self.es_dsl_url}")
                        print(f"[CoreSignal] 📋 Request headers: {headers}")
                        print(f"[CoreSignal] 📋 Request body: {search_body}")
                return None
                
            except Exception as e:
                print(f"[CoreSignal] ❌ LinkedIn URL search failed: {str(e)}")
                return None
