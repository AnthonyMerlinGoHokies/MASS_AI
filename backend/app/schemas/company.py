"""
Company related schemas.
"""
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from .icp import ICPConfig

class Contact(BaseModel):
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    job_title: Optional[str] = None
    type: Optional[str] = None
    confidence: Optional[float] = None
    pattern: Optional[str] = None


class Company(BaseModel):
    id: Optional[str] = None
    name: str
    domain: Optional[str] = None
    industry: Optional[str] = None
    founded_year: Optional[int] = None
    headquarters: Optional[str] = None
    description: Optional[str] = None
    company_linkedin_url: Optional[str] = None
    employee_count: Optional[int] = None
    specialities: Optional[List[str]] = None
    revenue: Optional[str] = None
    technologies: Optional[List[str]] = None
    tech_spend: Optional[str] = None
    it_budget: Optional[str] = None
    recent_news: Optional[List[str]] = None
    job_openings: Optional[int] = None
    growth_signals: Optional[List[str]] = None
    ai_org_signals: Optional[List[str]] = None
    ai_tech_signals: Optional[List[str]] = None
    ai_hiring_signals: Optional[List[str]] = None
    intent_score: Optional[float] = None
    intent_horizon: Optional[str] = None
    signal_evidence: Optional[List[str]] = None
    # Legacy fields for backward compatibility
    location: Optional[str] = None
    revenue_range: Optional[str] = None
    linkedin_url: Optional[str] = None
    # Social media fields
    twitter_url: Optional[str] = None
    facebook_url: Optional[str] = None
    instagram_url: Optional[str] = None
    youtube_url: Optional[str] = None
    github_url: Optional[str] = None
    # CoreSignal enrichment fields
    coresignal_enriched: bool = False
    coresignal_data: Optional[Dict[str, Any]] = None
    enrichment_error: Optional[str] = None
    # Hunter.io enrichment fields
    contacts: Optional[List[Contact]] = None
    hunterio_pattern: Optional[str] = None


class SimpleCompany(BaseModel):
    """Simplified company model for leads requests."""
    id: Optional[str] = None
    name: Optional[str] = None
    domain: Optional[str] = None
    contacts: Optional[List[Contact]] = None


class CompaniesRequest(BaseModel):
    icp_config: Optional[ICPConfig] = None
    search_payload: Optional[Dict[str, Any]] = None
    limit: Optional[int] = 10
    session_id: Optional[str] = None


class CompaniesResponse(BaseModel):
    success: bool
    companies: List[Company]  # Enriched companies (Apollo + CoreSignal)
    apollo_only_companies: Optional[List[Company]] = None  # Original Apollo data only
    used_mock: bool = False
    response_count: int = 0
    request_payload: Optional[Dict[str, Any]] = None
    raw_companies: Optional[List[Dict[str, Any]]] = None
    error: Optional[str] = None

class SerperEnrichFieldsRequest(BaseModel):
    """
    Request model for Serper per-field enrichment.

    Parameters
    ----------
    company_name : str
        The company name to enrich (required).
    missing_fields : List[str]
        List of Company fields to attempt enrichment for (required).
    """
    company_name: str
    missing_fields: List[str]


class EnrichRequest(BaseModel):
    """
    Request model for manual Enrich Layer enrichment.

    Parameters
    ----------
    url : str
        The LinkedIn/company URL to enrich (required).
    """
    url: str
