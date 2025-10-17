import os
import logging
from typing import Optional, Any, Dict
import requests

logger = logging.getLogger(__name__)

class HunterIoClient:
    """
    Client for the Hunter.io API.
    Supports:
      - Domain Search (find all emails for a domain)
      - Email Finder (find likely email for a person at a domain)
      - Email Verifier (verify deliverability of an email)
    """

    BASE_URL = "https://api.hunter.io/v2"

    def __init__(self, api_key: Optional[str] = None, timeout: int = 10):
        """
        Initialize the HunterIoClient.

        Args:
            api_key (str, optional): Hunter.io API key. If not provided, reads from HUNTER_IO_API_KEY env variable.
            timeout (int): Request timeout in seconds.
        Raises:
            ValueError: If API key is not provided or found in environment.
        """
        self.api_key = api_key or os.environ.get("HUNTER_IO_API_KEY")
        if not self.api_key:
            logger.error("Hunter.io API key not found in environment variable 'HUNTER_IO_API_KEY'.")
            raise ValueError("Hunter.io API key not found in environment variable 'HUNTER_IO_API_KEY'.")
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update({
            "Accept": "application/json"
        })

    def domain_search(self, domain: str, **kwargs) -> Optional[Dict[str, Any]]:
        """
        Find all emails for a given domain using Hunter.io Domain Search.

        Args:
            domain (str): The domain to search (e.g., 'example.com').
            **kwargs: Additional query parameters (e.g., 'company', 'limit', 'offset').

        Returns:
            dict: Parsed JSON response, or None on error.
        """
        url = f"{self.BASE_URL}/domain-search"
        params = {"domain": domain, "api_key": self.api_key}
        params.update(kwargs)
        try:
            response = self.session.get(url, params=params, timeout=self.timeout)
            if response.status_code == 200:
                return response.json()
            elif response.status_code == 429:
                logger.warning("Hunter.io rate limit exceeded (HTTP 429) on domain search.")
            else:
                logger.error(f"Hunter.io domain search error: {response.status_code} - {response.text}")
        except requests.RequestException as e:
            logger.error(f"Hunter.io domain search request failed: {e}")
        return None

    def email_finder(self, domain: str, first_name: str, last_name: str, **kwargs) -> Optional[Dict[str, Any]]:
        """
        Find the most likely email for a person at a domain using Hunter.io Email Finder.

        Args:
            domain (str): The domain to search (e.g., 'example.com').
            first_name (str): The person's first name.
            last_name (str): The person's last name.
            **kwargs: Additional query parameters (e.g., 'company', 'full_name', 'gender').

        Returns:
            dict: Parsed JSON response, or None on error.
        """
        url = f"{self.BASE_URL}/email-finder"
        params = {
            "domain": domain,
            "first_name": first_name,
            "last_name": last_name,
            "api_key": self.api_key
        }
        params.update(kwargs)
        try:
            response = self.session.get(url, params=params, timeout=self.timeout)
            if response.status_code == 200:
                return response.json()
            elif response.status_code == 429:
                logger.warning("Hunter.io rate limit exceeded (HTTP 429) on email finder.")
            else:
                logger.error(f"Hunter.io email finder error: {response.status_code} - {response.text}")
        except requests.RequestException as e:
            logger.error(f"Hunter.io email finder request failed: {e}")
        return None

    def email_verifier(self, email: str) -> Optional[Dict[str, Any]]:
        """
        Verify the deliverability of an email address using Hunter.io Email Verifier.

        Args:
            email (str): The email address to verify.

        Returns:
            dict: Parsed JSON response, or None on error.
        """
        url = f"{self.BASE_URL}/email-verifier"
        params = {"email": email, "api_key": self.api_key}
        try:
            response = self.session.get(url, params=params, timeout=self.timeout)
            if response.status_code == 200:
                return response.json()
            elif response.status_code == 429:
                logger.warning("Hunter.io rate limit exceeded (HTTP 429) on email verifier.")
            else:
                logger.error(f"Hunter.io email verifier error: {response.status_code} - {response.text}")
        except requests.RequestException as e:
            logger.error(f"Hunter.io email verifier request failed: {e}")
        return None