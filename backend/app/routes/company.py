"""
Company routes.
"""
from fastapi import APIRouter

from ..schemas.company import CompaniesRequest, CompaniesResponse, EnrichRequest, SerperEnrichFieldsRequest
from ..services.company_service import CompanyService
from ..core.db_operations import save_companies, track_api_call

router = APIRouter(prefix="", tags=["companies"])


@router.post("/companies", response_model=CompaniesResponse)
async def get_companies(req: CompaniesRequest):
    """
    Search for companies using Apollo API and enrich with CoreSignal and EnrichLayer.
    """
    service = CompanyService()
    result = await service.search_companies(req)
    
    # Track Apollo API call
    if req.session_id and result.success:
        try:
            track_api_call(
                session_id=req.session_id,
                api_name="Apollo",
                endpoint="mixed_companies/search",
                call_type="apollo_company_search",
                calls_made=1,
                success=True
            )
        except Exception as e:
            print(f"[Cost Tracking] Error tracking Apollo call: {e}")
    
    # Save to database if successful
    if result.success and req.session_id:
        try:
            # Save companies to database
            company_ids = save_companies(result.companies, req.session_id)
            print(f"[Database] Saved {len(company_ids)} companies to Supabase")
        except Exception as e:
            print(f"[Database] Error saving companies: {e}")
    
    # Log session progress if available
    if req.session_id:
        print(f"[Session] Company search completed for session {req.session_id}")
    
    return result