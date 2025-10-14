"""
ICP (Ideal Customer Profile) routes.
"""
from fastapi import APIRouter
from ..schemas.icp import ICPInput, ICPResponse
from ..services.icp_service import ICPService
from ..core.db_operations import save_icp_search  # ADD THIS LINE

router = APIRouter(prefix="", tags=["icp"])

@router.post("/normalize-icp", response_model=ICPResponse)
async def normalize_icp(icp_input: ICPInput):
    """
    Normalize natural language ICP description into structured format using MISTRAL Small.
    """
    service = ICPService()
    result = await service.normalize_icp(icp_input.icp_text)
    
    # Save ICP search to database if successful
    if result["success"] and result.get("session_id"):
        try:
            save_icp_search(
                session_id=result["session_id"],
                icp_text=icp_input.icp_text,
                icp_config=result["icp_config"],
                routing_decision=result.get("routing_decision")
            )
            print(f"[Database] Saved ICP search for session {result['session_id']}")
        except Exception as e:
            print(f"[Database] Error saving ICP search: {e}")
    
    # Log session info if available
    if result.get('session_id'):
        print(f"[Session] ICP normalization completed for session {result['session_id']}")
    
    return ICPResponse(
        success=result["success"],
        icp_config=result["icp_config"],
        routing_decision=result.get("routing_decision"),
        error=result["error"],
        session_id=result.get("session_id")
    )