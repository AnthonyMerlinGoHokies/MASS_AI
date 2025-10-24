"""
Database operations for saving companies, leads, and tracking costs.
"""
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.core.database import get_db
from app.schemas.company import Company
from app.schemas.lead import Lead
from app.schemas.icp import ICPConfig


# API Cost Reference (2025 Pricing)
# Sources and accuracy notes:
API_COSTS = {
    # Apollo.io - VERIFIED from official pricing page (apollo.io/pricing) and documentation
    # Apollo charges per "credit" not per API call. Credits consumed when accessing data.
    # Additional credits cost $0.20 each when exceeding plan limits (documented in multiple sources)
    "apollo_company_search": 0.20,  # 1 credit per search = $0.20
    "apollo_people_search": 0.20,   # 1 credit per search = $0.20
    
    # CoreSignal - ESTIMATED from pricing page (coresignal.com/pricing) and reviews
    # Plans start at $49/month with 200 Collect + 400 Search credits
    # Exact per-credit cost not publicly disclosed, calculated as $49/200 ≈ $0.25 per Collect credit
    # Multi-source data costs 2 credits (confirmed in docs)
    "coresignal_enrich": 0.25,      # ~$0.25 per collect credit (ESTIMATE)
    "coresignal_search": 0.125,     # ~$0.125 per search credit (ESTIMATE, half of collect)
    
    # Hunter.io - VERIFIED from official pricing (hunter.io/pricing) and help docs
    # Documented: 1 credit = 1 email found, 0.5 credit = 1 verification
    # Overage cost is $0.10 per credit (documented in pricing page)
    "hunter_domain_search": 0.10,   # 1 credit = $0.10
    "hunter_email_finder": 0.10,    # 1 credit = $0.10
    "hunter_email_verifier": 0.05,  # 0.5 credits = $0.05
    "hunter_enrichment": 0.02,      # 0.2 credits = $0.02 (from API docs)
    
    # Serper - VERIFIED from official website (serper.dev)
    # Clearly stated: $0.30 per 1,000 queries = $0.0003 per query
    # One of the cheapest SERP APIs on the market
    "serper_search": 0.0003,        # $0.30 per 1,000 searches
    "serper_location": 0.0003,      # Same rate
    "serper_news": 0.0003,          # Same rate
    
    # EnrichLayer - ESTIMATED from pricing page (enrichlayer.com/pricing)
    # Credit costs per endpoint documented: Company Profile = 1 credit, Lookup = 2 credits
    # Exact dollar cost per credit not publicly listed, varies by subscription plan
    # Estimated $0.01-0.05 per credit based on plan structure
    "enrichlayer_company": 0.02,    # 1 credit (ESTIMATE at $0.02/credit)
    "enrichlayer_lookup": 0.04,     # 2 credits (ESTIMATE)
}


def save_icp_search(session_id: str, icp_text: str, icp_config: ICPConfig, routing_decision: Optional[Dict] = None):
    """Save ICP search to database."""
    db = get_db()
    
    data = {
        "session_id": session_id,
        "icp_text": icp_text,
        "icp_config": icp_config.dict() if icp_config else None,
        "routing_decision": routing_decision.dict() if hasattr(routing_decision, 'dict') else routing_decision,
        "created_at": datetime.now().isoformat()
    }
    
    result = db.table("icp_searches").insert(data).execute()
    return result.data[0] if result.data else None


def update_icp_search(session_id: str, icp_config: ICPConfig, routing_decision: Optional[Dict] = None):
    """Update existing ICP search with finalized config."""
    db = get_db()
    
    update_data = {
        "icp_config": icp_config.dict() if icp_config else None,
        "routing_decision": routing_decision.dict() if hasattr(routing_decision, 'dict') else routing_decision
    }
    
    result = db.table("icp_searches").update(update_data).eq("session_id", session_id).execute()
    return result.data[0] if result.data else None


def save_companies(companies: List[Company], session_id: str) -> List[str]:
    """Save companies to database and return their IDs."""
    db = get_db()
    company_ids = []
    
    for company in companies:
        # Convert Company object to dict and exclude id field to let database generate it
        company_dict = company.dict(exclude={'id'})
        company_dict["session_id"] = session_id
        company_dict["created_at"] = datetime.now().isoformat()
        
        # Insert and get ID
        result = db.table("companies").insert(company_dict).execute()
        if result.data:
            company_ids.append(result.data[0]["id"])
    
    return company_ids


def save_leads(leads: List[Lead], session_id: str, company_name_to_id: Dict[str, str]):
    """Save leads to database."""
    db = get_db()
    
    for lead in leads:
        lead_dict = lead.dict()
        lead_dict["session_id"] = session_id
        
        # Map company name to company_id
        company_name = lead.contact_company
        if company_name and company_name in company_name_to_id:
            lead_dict["company_id"] = company_name_to_id[company_name]
        
        lead_dict["created_at"] = datetime.now().isoformat()
        
        db.table("leads").insert(lead_dict).execute()


def track_api_call(session_id: str, api_name: str, endpoint: str = None, 
                   call_type: str = None, cost_per_call: float = 0, 
                   calls_made: int = 1, success: bool = True):
    """
    Track API call and its cost.
    
    NOTE: If cost_per_call=0, will attempt to look up cost from API_COSTS dictionary above.
    Always review API_COSTS comments to understand which values are verified vs estimated.
    """
    db = get_db()
    
    # If no cost provided, try to look up from our reference
    if cost_per_call == 0 and call_type:
        cost_per_call = API_COSTS.get(call_type, 0)
    
    data = {
        "session_id": session_id,
        "api_name": api_name,
        "endpoint": endpoint,
        "call_type": call_type,
        "calls_made": calls_made,
        "cost_per_call": cost_per_call,
        "total_cost": cost_per_call * calls_made,
        "success": success,
        "created_at": datetime.now().isoformat()
    }
    
    db.table("api_costs").insert(data).execute()


def update_icp_search_results(session_id: str, companies_found: int, 
                               leads_generated: int, processing_time: int):
    """Update ICP search with final results and costs."""
    db = get_db()
    
    # Calculate total cost from api_costs table
    costs = db.table("api_costs").select("*").eq("session_id", session_id).execute()
    total_cost = sum(c["total_cost"] for c in costs.data)
    cost_per_lead = total_cost / leads_generated if leads_generated > 0 else 0
    
    # Build breakdown
    api_breakdown = {}
    for cost in costs.data:
        api_name = cost["api_name"]
        if api_name not in api_breakdown:
            api_breakdown[api_name] = {"calls": 0, "cost": 0}
        api_breakdown[api_name]["calls"] += cost["calls_made"]
        api_breakdown[api_name]["cost"] += cost["total_cost"]
    
    update_data = {
        "companies_found": companies_found,
        "leads_generated": leads_generated,
        "total_cost_usd": total_cost,
        "cost_per_lead_usd": cost_per_lead,
        "api_calls_breakdown": api_breakdown,
        "processing_time_seconds": processing_time,
        "completed_at": datetime.now().isoformat()
    }
    
    db.table("icp_searches").update(update_data).eq("session_id", session_id).execute()
    
    return {
        "total_cost": total_cost,
        "cost_per_lead": cost_per_lead,
        "breakdown": api_breakdown
    }