"""
Database operations for ICP conversation state management.
Integrates with existing Supabase setup.
"""
from typing import Dict, Any, List, Optional
from datetime import datetime
from .database import get_db


def create_conversation(
    conversation_id: str, 
    session_id: str, 
    initial_text: str,
    conversation_mode: str = "auto",
    max_turns: int = 5
) -> Dict[str, Any]:
    """Create a new ICP conversation in the database."""
    db = get_db()
    
    data = {
        "conversation_id": conversation_id,
        "session_id": session_id,
        "initial_input": initial_text,
        "conversation_mode": conversation_mode,
        "max_turns": max_turns,
        "current_state": {
            "known_fields": {},
            "missing_fields": [],
            "invalid_fields": [],
            "turn_count": 0,
            "confidence_score": 0.0,
            "progress_percentage": 0.0
        },
        "messages": [
            {
                "role": "user",
                "content": initial_text,
                "timestamp": datetime.now().isoformat()
            }
        ],
        "is_complete": False,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }
    
    result = db.table("icp_conversations").insert(data).execute()
    return result.data[0] if result.data else None


def get_conversation(conversation_id: str) -> Optional[Dict[str, Any]]:
    """Get conversation state from database."""
    db = get_db()
    
    result = db.table("icp_conversations").select("*").eq("conversation_id", conversation_id).execute()
    return result.data[0] if result.data else None


def update_conversation_state(
    conversation_id: str,
    state: Dict[str, Any],
    new_message: Optional[Dict[str, str]] = None
) -> Dict[str, Any]:
    """Update conversation state in database."""
    db = get_db()
    
    # Get current conversation
    current = get_conversation(conversation_id)
    if not current:
        raise ValueError(f"Conversation {conversation_id} not found")
    
    messages = current["messages"]
    if new_message:
        messages.append({
            **new_message,
            "timestamp": datetime.now().isoformat()
        })
    
    update_data = {
        "current_state": state,
        "messages": messages,
        "updated_at": datetime.now().isoformat()
    }
    
    result = db.table("icp_conversations").update(update_data).eq("conversation_id", conversation_id).execute()
    return result.data[0] if result.data else None


def finalize_conversation(conversation_id: str, final_icp_config: Dict[str, Any]) -> Dict[str, Any]:
    """Mark conversation as complete and save final ICP config."""
    db = get_db()
    
    update_data = {
        "is_complete": True,
        "final_icp_config": final_icp_config,
        "completed_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }
    
    result = db.table("icp_conversations").update(update_data).eq("conversation_id", conversation_id).execute()
    return result.data[0] if result.data else None


def get_conversation_history(conversation_id: str) -> List[Dict[str, str]]:
    """Get full conversation message history."""
    conversation = get_conversation(conversation_id)
    return conversation["messages"] if conversation else []

