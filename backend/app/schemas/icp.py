"""
ICP (Ideal Customer Profile) related schemas.
"""
from pydantic import BaseModel
from typing import List, Dict, Any, Optional


class ICPInput(BaseModel):
    icp_text: str


class PersonaConfig(BaseModel):
    name: str
    title_regex: List[str]
    seniority: List[str]
    functions: List[str]


class CompanyFilters(BaseModel):
    employee_count: Dict[str, Optional[int]]
    arr_usd: Dict[str, Optional[int]]
    industries: List[str]
    # Location filters
    locations: Optional[List[str]] = None
    cities: Optional[List[str]] = None
    states: Optional[List[str]] = None
    countries: Optional[List[str]] = None
    # Company characteristics
    founded_year_min: Optional[int] = None
    founded_year_max: Optional[int] = None
    company_types: Optional[List[str]] = None
    # Technology filters
    technologies: Optional[List[str]] = None
    # Funding filters
    funding_stage: Optional[List[str]] = None
    total_funding_min: Optional[int] = None
    total_funding_max: Optional[int] = None
    # Company size alternatives
    company_size: Optional[List[str]] = None
    # Keywords and exclusions
    keywords: Optional[List[str]] = None
    exclude_keywords: Optional[List[str]] = None


class ContactPersonaTargets(BaseModel):
    per_company_min: int
    per_company_max: int
    persona_order: List[str]


class StageOverrides(BaseModel):
    budget_cap_per_lead_usd: float
    finder_pct: int
    research_pct: int
    contacts_pct: int
    verify_pct: int
    synthesis_pct: int
    intent_pct: int


class ICPConfig(BaseModel):
    personas: List[PersonaConfig]
    company_filters: CompanyFilters
    signals_required: List[str]
    negative_keywords: List[str]
    required_fields_for_qualify: List[str]
    contact_persona_targets: ContactPersonaTargets
    stage_overrides: StageOverrides


class RoutingScores(BaseModel):
    """Scores for routing decision."""
    specificity: float  # 0.0-1.0: how fully the ICP specifies key filters
    mappability: float  # 0.0-1.0: fraction mapping to firmographic API fields
    stability: float    # 0.0-1.0: presence of temporal/volatile demands


class ResearchPlanHardFilters(BaseModel):
    """Hard filters for research plan."""
    employee_count: Optional[Dict[str, Optional[int]]] = None
    founded_year_min: Optional[int] = None
    countries: Optional[List[str]] = None
    industries: Optional[List[str]] = None


class ResearchPlanTimeWindows(BaseModel):
    """Time windows for research."""
    recency_months_default: int = 12
    jobs_months: int = 3
    tech_adoption_months: int = 18


class ResearchPlan(BaseModel):
    """Research plan for deep research route."""
    themes: List[str]  # Key concepts/keywords
    hard_filters: ResearchPlanHardFilters
    time_windows: ResearchPlanTimeWindows
    evidence_requirements: List[str]  # e.g., "funding|>=1_tier1_source|<=12mo"
    seed_strategies: List[str]  # e.g., ["events_news", "careers", "docs_marketplaces"]
    personas: List[str]  # Requested personas in order of importance
    notes: Optional[str] = None  # Optional guidance to specialists


class RoutingDecision(BaseModel):
    """LLM Router decision output."""
    scores: RoutingScores
    route: str  # "structured" | "hybrid" | "deep_research"
    route_reason: str
    research_plan: ResearchPlan


class ICPResponse(BaseModel):
    success: bool
    icp_config: Optional[ICPConfig]
    routing_decision: Optional[RoutingDecision] = None
    error: Optional[str]
    session_id: Optional[str] = None
