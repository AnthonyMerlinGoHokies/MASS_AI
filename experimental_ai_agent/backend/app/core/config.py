"""
Core configuration settings for the ICP Normalizer API.
"""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Settings:
    """Application settings and configuration."""
    
    # API Configuration
    APP_TITLE = "ICP Normalizer API"
    APP_VERSION = "1.0.0"
    
    # CORS Configuration
    CORS_ORIGINS = ["http://localhost:5173"]  # Vite default port
    
    # API Keys
    MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
    APOLLO_API_KEY = os.getenv("APOLLO_API_KEY")
    CORESIGNAL_API_KEY = os.getenv("CORESIGNAL_API_KEY")
    
    # API URLs
    MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions"
    APOLLO_SEARCH_URL = "https://api.apollo.io/api/v1/mixed_companies/search"
    APOLLO_PEOPLE_URL = "https://api.apollo.io/api/v1/mixed_people/search"
    CORESIGNAL_API_URL = "https://api.coresignal.com/cdapi/v2/company_clean/enrich"
    CORESIGNAL_SEARCH_URL = "https://api.coresignal.com/cdapi/v2/company_clean/search"
    CORESIGNAL_COLLECT_URL = "https://api.coresignal.com/cdapi/v2/company_clean/collect"
    CORESIGNAL_ES_DSL_URL = "https://api.coresignal.com/v2/company_clean/search/es_dsl"
    
    # Rate Limiting
    MISTRAL_RATE_LIMIT_SECONDS = 2  # Minimum seconds between calls
    
    # Timeouts
    DEFAULT_TIMEOUT = 30.0
    CORESIGNAL_TIMEOUT = 10.0

# Global settings instance
settings = Settings()
