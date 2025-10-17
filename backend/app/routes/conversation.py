"""
Conversational ICP collection routes.
"""
from fastapi import APIRouter, HTTPException

from ..schemas.conversation import (
    ICPConversationStartRequest,
    ICPConversationStartResponse,
    ICPConversationRespondRequest,
    ICPConversationRespondResponse,
    ICPConversationStatusResponse,
    ICPConversationFinalizeRequest,
    ICPConversationFinalizeResponse,
    ConversationMessage,
    MessageRole
)
from ..services.conversational_icp_service import ConversationalICPService
from ..core.conversation_db import (
    get_conversation,
    finalize_conversation,
    get_conversation_history
)
from ..core.db_operations import save_icp_search

router = APIRouter(prefix="/icp/conversation", tags=["icp-conversation"])


@router.post("/start", response_model=ICPConversationStartResponse)
async def start_conversation(request: ICPConversationStartRequest):
    """
    Start a new conversational ICP collection session.
    
    The agent will:
    1. Parse the initial text
    2. Evaluate completeness
    3. If incomplete, start asking questions
    4. If complete, return the ICP config immediately
    """
    service = ConversationalICPService()
    
    try:
        result = await service.start_conversation(
            initial_text=request.initial_text,
            mode=request.mode,
            max_turns=request.max_turns
        )
        
        return ICPConversationStartResponse(
            conversation_id=result["conversation_id"],
            session_id=result["session_id"],
            needs_conversation=result["needs_conversation"],
            message=result.get("message"),
            current_state=result["state"],
            icp_config=result.get("icp_config")
        )
    
    except Exception as e:
        print(f"[Conversation Start] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{conversation_id}/respond", response_model=ICPConversationRespondResponse)
async def respond_to_conversation(conversation_id: str, request: ICPConversationRespondRequest):
    """
    Respond to the agent's question with user's answer.
    
    The agent will:
    1. Extract new information from the answer
    2. Update known fields
    3. Evaluate if complete
    4. Generate next question or finalize
    """
    service = ConversationalICPService()
    
    try:
        result = await service.respond_to_conversation(
            conversation_id=conversation_id,
            answer=request.answer
        )
        
        return ICPConversationRespondResponse(
            conversation_id=result["conversation_id"],
            needs_more_info=result["needs_more_info"],
            message=result.get("message"),
            current_state=result["state"],
            progress_percentage=result["progress_percentage"],
            icp_config=result.get("icp_config")
        )
    
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        print(f"[Conversation Respond] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{conversation_id}/status", response_model=ICPConversationStatusResponse)
async def get_conversation_status(conversation_id: str):
    """
    Get the current status of an ongoing conversation.
    
    Returns:
    - Current turn count
    - Progress percentage
    - Known fields
    - Missing fields
    - Full message history
    """
    try:
        conversation = get_conversation(conversation_id)
        
        if not conversation:
            raise HTTPException(status_code=404, detail=f"Conversation {conversation_id} not found")
        
        state = conversation["current_state"]
        messages = conversation["messages"]
        
        # Calculate progress
        turn_count = state.get("turn_count", 0)
        max_turns = state.get("max_turns", 5)
        is_complete = conversation.get("is_complete", False)
        
        progress = min(100.0, (turn_count / max_turns) * 100)
        if is_complete:
            progress = 100.0
        
        # Convert messages to ConversationMessage objects
        conversation_messages = [
            ConversationMessage(
                role=MessageRole(msg["role"]),
                content=msg["content"],
                timestamp=msg.get("timestamp")
            )
            for msg in messages
        ]
        
        return ICPConversationStatusResponse(
            conversation_id=conversation_id,
            session_id=conversation["session_id"],
            turn_count=turn_count,
            is_complete=is_complete,
            progress_percentage=progress,
            known_fields=state.get("known_fields", {}),
            missing_fields=state.get("missing_fields", []),
            messages=conversation_messages
        )
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"[Conversation Status] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{conversation_id}/finalize", response_model=ICPConversationFinalizeResponse)
async def finalize_conversation_route(conversation_id: str, request: ICPConversationFinalizeRequest):
    """
    Finalize the conversation and get the complete ICP config.
    
    This endpoint:
    1. Takes the current known fields
    2. Fills in defaults for missing required fields
    3. Creates a valid ICPConfig
    4. Saves to the icp_searches table
    5. Returns the final config
    
    Use this when:
    - User is done providing information
    - Max turns reached
    - User wants to proceed with partial data
    """
    try:
        conversation = get_conversation(conversation_id)
        
        if not conversation:
            raise HTTPException(status_code=404, detail=f"Conversation {conversation_id} not found")
        
        # Check if already finalized
        if conversation.get("is_complete") and conversation.get("final_icp_config"):
            return ICPConversationFinalizeResponse(
                success=True,
                session_id=conversation["session_id"],
                icp_config=conversation["final_icp_config"],
                missing_fields=[],
                warning=None
            )
        
        # Run finalization through service
        service = ConversationalICPService()
        
        state = conversation["current_state"]
        graph_state = {
            "conversation_id": conversation_id,
            "session_id": conversation["session_id"],
            "initial_text": conversation["initial_input"],
            "known_fields": state["known_fields"],
            "missing_fields": state.get("missing_fields", []),
            "invalid_fields": state.get("invalid_fields", []),
            "turn_count": state.get("turn_count", 0),
            "max_turns": 5,
            "confidence_score": state.get("confidence_score", 0.0),
            "is_complete": False,
            "last_user_input": "",
            "last_agent_message": "",
            "icp_config": None
        }
        
        # Finalize
        finalized_state = await service._finalize_node(graph_state)
        
        if not finalized_state.get("icp_config"):
            raise HTTPException(status_code=400, detail="Could not create valid ICP config from collected data")
        
        # Save to icp_searches table
        from ..schemas.icp import ICPConfig
        icp_config_obj = ICPConfig(**finalized_state["icp_config"])
        
        save_icp_search(
            session_id=conversation["session_id"],
            icp_text=conversation["initial_input"],
            icp_config=icp_config_obj,
            routing_decision=None  # Routing not done in conversational mode yet
        )
        
        # Build warning if missing fields
        warning = None
        missing = finalized_state.get("missing_fields", [])
        if missing and not request.force_complete:
            warning = f"ICP finalized with missing fields: {', '.join(missing)}. Default values used."
        
        return ICPConversationFinalizeResponse(
            success=True,
            session_id=conversation["session_id"],
            icp_config=finalized_state["icp_config"],
            missing_fields=missing,
            warning=warning
        )
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"[Conversation Finalize] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

