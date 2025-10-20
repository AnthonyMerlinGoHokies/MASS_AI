"""
Lead routes.
"""
from fastapi import APIRouter
from datetime import datetime
from time import time

from ..schemas.lead import LeadsRequest, LeadsResponse
from ..services.lead_service import LeadService
from ..core.logger import journey_logger
from ..core.session import get_session, complete_session
from ..core.db_operations import save_leads, update_icp_search_results

router = APIRouter(prefix="", tags=["leads"])


@router.post("/leads", response_model=LeadsResponse)
async def get_leads(request: LeadsRequest) -> LeadsResponse:
    """Get leads from companies using Apollo People Search API."""
    service = LeadService()
    result = await service.get_leads(request)
    
    # Save leads to database if successful
    if result.success and request.session_id:
        try:
            # Create company name to ID mapping
            company_name_to_id = {}
            for company in request.companies:
                if company.name:
                    company_name_to_id[company.name] = company.id
            
            # Save leads
            save_leads(result.leads, request.session_id, company_name_to_id)
            print(f"[Database] Saved {len(result.leads)} leads to Supabase")
            
            # Update ICP search with final results and costs
            session = get_session(request.session_id)
            if session:
                # Calculate processing time safely
                processing_time = 0
                if hasattr(session, 'end_time') and session.end_time:
                    if isinstance(session.end_time, datetime):
                        processing_time = int((session.end_time - session.start_time).total_seconds())
                    else:
                        # If it's a timestamp, just subtract
                        processing_time = int(session.end_time - session.start_time) if session.end_time > 0 else 0
                elif hasattr(session, 'start_time') and session.start_time:
                    if isinstance(session.start_time, datetime):
                        processing_time = int((datetime.now() - session.start_time).total_seconds())
                    else:
                        # If it's a timestamp, calculate elapsed time
                        processing_time = int(time() - session.start_time) if session.start_time > 0 else 0
                
                cost_summary = update_icp_search_results(
                    request.session_id,
                    companies_found=result.companies_processed,
                    leads_generated=result.total_leads,
                    processing_time=processing_time
                )
                print(f"[Database] Cost Summary: ${cost_summary['total_cost']:.2f} total, ${cost_summary['cost_per_lead']:.4f} per lead")
        except Exception as e:
            print(f"[Database] Error saving leads: {e}")
    
    # Complete the journey logging if we have a session
    if request.session_id:
        session = get_session(request.session_id)
        if session:
            journey_data = complete_session(request.session_id)
            if journey_data:
                # Log the complete ICP journey
                journey_logger.log_icp_journey(
                    session_id=journey_data['session_id'],
                    raw_icp_text=journey_data['raw_icp_text'],
                    normalized_icp=journey_data['normalized_icp'],
                    apollo_companies_count=journey_data['apollo_companies_count'],
                    coresignal_enriched_count=journey_data['coresignal_enriched_count'],
                    leads_generated_count=journey_data['leads_generated_count'],
                    domain_enrichment_attempts=journey_data['domain_enrichment_attempts'],
                    domain_enrichment_successes=journey_data['domain_enrichment_successes'],
                    processing_time_seconds=journey_data['processing_time_seconds'],
                    errors=journey_data['errors']
                )
                print(f"[Logger] Complete ICP journey logged for session {request.session_id}")
    
    return result