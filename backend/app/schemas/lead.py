"""
Lead related schemas.
"""
from pydantic import BaseModel
from typing import List, Optional

from .icp import PersonaConfig
from .company import SimpleCompany


class Lead(BaseModel):
    # Contact fields as requested
    contact_first_name: Optional[str] = None
    contact_last_name: Optional[str] = None
    contact_title: Optional[str] = None
    contact_company: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_linkedin_url: Optional[str] = None
    contact_twitter: Optional[str] = None
    contact_location: Optional[str] = None
    contact_recent_activity: Optional[str] = None
    contact_published_content: Optional[str] = None
    
    # Additional fields for functionality
    matched_persona: Optional[str] = None
    persona_confidence: Optional[float] = None
    apollo_id: Optional[str] = None


class LeadsRequest(BaseModel):
    companies: List[SimpleCompany]
    personas: Optional[List[PersonaConfig]] = None
    max_leads_per_company: Optional[int] = 25
    session_id: Optional[str] = None


class LeadsResponse(BaseModel):
    success: bool
    leads: List[Lead]
    total_leads: int
    companies_processed: int
    error: Optional[str] = None
