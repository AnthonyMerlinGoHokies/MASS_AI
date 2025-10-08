import os
import logging
from typing import Optional, Any, Dict
import requests

logger = logging.getLogger(__name__)

class SerperApiClient:
    """
    Client for the SerperAPI Google Search endpoint.
    Used for company data supplementation and enrichment fallback.
    """

    API_URL = "https://google.serper.dev/search"
    LOCATION_URL = "https://google.serper.dev/location"
    NEWS_URL = "https://google.serper.dev/news"

    def __init__(self, api_key: Optional[str] = None, timeout: int = 10):
        self.api_key = api_key or os.environ.get("SERPER_API_KEY")
        if not self.api_key:
            logger.error("SerperAPI key not found in environment variable 'SERPER_API_KEY'.")
            raise ValueError("SerperAPI key not found in environment variable 'SERPER_API_KEY'.")
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update({
            "X-API-KEY": self.api_key,
            "Content-Type": "application/json"
        })

    def search(self, query: str) -> Optional[Dict[str, Any]]:
        """
        Perform a Google search using SerperAPI.
        Returns parsed JSON results, or None on error.
        Logs request, response, and error details for reliability.
        """
        payload = {"q": query}
        logger.info(f"[SerperAPI] Performing search for query: '{query}'")
        try:
            response = self.session.post(self.API_URL, json=payload, timeout=self.timeout)
            logger.info(f"[SerperAPI] Search response status: {response.status_code}")
            if response.status_code == 200:
                logger.info(f"[SerperAPI] Search response: {response.json()}")
                return response.json()
            elif response.status_code == 429:
                logger.warning("[SerperAPI] Rate limit exceeded (HTTP 429).")
            else:
                logger.error(f"[SerperAPI] Error: {response.status_code} - {response.text}")
        except requests.RequestException as e:
            logger.error(f"[SerperAPI] Request failed: {e}")
        return None

    def location(self, query: str) -> Optional[Dict[str, Any]]:
        """
        Perform a location search using SerperAPI.
        Returns parsed JSON results, or None on error.
        Logs request, response, and error details for reliability.
        """
        payload = {"q": query}
        logger.info(f"[SerperAPI] Performing location search for query: '{query}'")
        try:
            response = self.session.post(self.LOCATION_URL, json=payload, timeout=self.timeout)
            logger.info(f"[SerperAPI] Location response status: {response.status_code}")
            if response.status_code == 200:
                logger.info(f"[SerperAPI] Location response: {response.json()}")
                return response.json()
            elif response.status_code == 429:
                logger.warning("[SerperAPI] Rate limit exceeded (HTTP 429) on location endpoint.")
            else:
                logger.error(f"[SerperAPI] Location error: {response.status_code} - {response.text}")
        except requests.RequestException as e:
            logger.error(f"[SerperAPI] Location request failed: {e}")
        return None

    def news(self, query: str) -> Optional[Dict[str, Any]]:
        """
        Perform a news search using SerperAPI.
        Returns parsed JSON results, or None on error.
        Logs request, response, and error details for reliability.
        """
        payload = {"q": query}
        logger.info(f"[SerperAPI] Performing news search for query: '{query}'")
        try:
            response = self.session.post(self.NEWS_URL, json=payload, timeout=self.timeout)
            logger.info(f"[SerperAPI] News response status: {response.status_code}")
            if response.status_code == 200:
                logger.info(f"[SerperAPI] News response: {response.json()}")
                return response.json()
            elif response.status_code == 429:
                logger.warning("[SerperAPI] Rate limit exceeded (HTTP 429) on news endpoint.")
            else:
                logger.error(f"[SerperAPI] News error: {response.status_code} - {response.text}")
        except requests.RequestException as e:
            logger.error(f"[SerperAPI] News request failed: {e}")
        return None

    def get_first_url_for_query(self, query: str, expected_domain: Optional[str] = None) -> Optional[str]:
        """
        Returns the first valid URL from the search results, optionally filtered by expected_domain.
        If expected_domain is provided, only URLs containing that domain are considered.
        """
        results = self.search(query)
        if not results:
            logger.info(f"No results returned for query: {query}")
            return None

        # SerperAPI returns results in 'organic' (main search results)
        organic = results.get("organic", [])
        for result in organic:
            url = result.get("link")
            if not url:
                continue
            if expected_domain:
                if expected_domain.lower() in url.lower():
                    return url
            else:
                return url

        logger.info(
            f"No URL found for query '{query}'"
            + (f" with expected domain '{expected_domain}'." if expected_domain else ".")
        )
        return None