"""
Client for Enrich Layer API.
"""
import os
import httpx
from dotenv import load_dotenv

load_dotenv()

class EnrichLayerClient:
    """Client for Enrich Layer API."""
    def __init__(self):
        self.api_key = os.getenv("ENRICH_LAYER")

    async def enrich_company(self, company_data: dict) -> dict:
        """
        Enrich company data using the Enrich Layer API (v2).

        Parameters
        ----------
        company_data : dict
            The company data to enrich. Must include 'domain' or 'url'.

        Returns
        -------
        dict
            The enriched company data or error details.
        """
        import logging

        if not self.api_key:
            return {"success": False, "error": "ENRICH_LAYER API key not configured"}

        # Use the correct v2 endpoint for company enrichment
        base_url = "https://enrichlayer.com/api/v2/company"
        params = {}

        # Accept either 'url' (preferred) or 'domain' as input
        if "url" in company_data and company_data["url"]:
            params["url"] = company_data["url"]
        elif "domain" in company_data and company_data["domain"]:
            # Clean domain: remove protocol and www if present
            import re
            domain = company_data["domain"]
            domain = re.sub(r'^https?://', '', domain)
            domain = domain.strip('/')
            domain = re.sub(r'^www\.', '', domain)
            # Most reliable: convert to LinkedIn/company URL if possible, else error
            return {
                "success": False,
                "error": (
                    "Enrich Layer v2 API prefers a company LinkedIn URL as 'url'. "
                    "Please provide a LinkedIn/company URL (e.g., 'https://www.linkedin.com/company/google/') "
                    "in the 'url' field for best results. Domain-only queries may not be supported."
                )
            }
        else:
            return {"success": False, "error": "Must provide 'url' (preferred) in company_data."}

        # Add recommended enrichment parameters
        params["categories"] = "include"
        params["funding_data"] = "include"
        params["exit_data"] = "include"
        params["acquisitions"] = "include"
        params["extra"] = "include"
        params["use_cache"] = "if-present"
        params["fallback_to_cache"] = "on-error"

        headers = {
            "Authorization": f"Bearer {self.api_key}"
        }
        # Debug logging for request
        logging.info(f"[EnrichLayer] GET {base_url} params={params} headers={headers}")

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(base_url, params=params, headers=headers, timeout=15)
                logging.info(f"[EnrichLayer] Response status: {response.status_code}")
                response.raise_for_status()
                return response.json()
        except Exception as e:
            logging.error(f"Enrich Layer API call failed: {str(e)}")
            return {"success": False, "error": str(e)}