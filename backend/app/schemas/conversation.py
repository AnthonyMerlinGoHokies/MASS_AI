"""
Schemas for conversational ICP collection.
"""
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from enum import Enum


class ConversationMode(str, Enum):
    """Conversation mode options."""
    AUTO = "auto"           # Parse first, conversation if incomplete
    CONVERSATIONAL = "conversational"  # Always use conversation
    QUICK = "quick"         # One-shot only, no conversation


class MessageRole(str, Enum):
    """Message roles in conversation."""
    USER = "user"
    AGENT = "agent"
    SYSTEM = "system"


class ConversationMessage(BaseModel):
    """A single message in the conversation."""
    role: MessageRole
    content: str
    timestamp: Optional[str] = None


class ConversationState(BaseModel):
    """Current state of the conversation."""
    known_fields: Dict[str, Any] = Field(default_factory=dict)
    missing_fields: List[str] = Field(default_factory=list)
    invalid_fields: List[Dict[str, str]] = Field(default_factory=list)
    turn_count: int = 0
    confidence_score: float = 0.0
    max_turns: int = 5


class ICPConversationStartRequest(BaseModel):
    """Request to start a new ICP conversation."""
    initial_text: str = Field(..., description="User's initial ICP description")
    mode: ConversationMode = ConversationMode.AUTO
    max_turns: int = Field(default=5, ge=1, le=7, description="Maximum conversation turns")


class ICPConversationStartResponse(BaseModel):
    """Response after starting conversation."""
    conversation_id: str
    session_id: str
    needs_conversation: bool
    message: Optional[str] = None  # Agent's first question if needs_conversation=True
    current_state: ConversationState
    icp_config: Optional[Dict[str, Any]] = None  # If complete on first parse


class ICPConversationRespondRequest(BaseModel):
    """Request to respond to agent's question."""
    answer: str = Field(..., description="User's answer to the question")


class ICPConversationRespondResponse(BaseModel):
    """Response after user answers."""
    conversation_id: str
    needs_more_info: bool
    message: Optional[str] = None  # Next question if needs_more_info=True
    current_state: ConversationState
    progress_percentage: float
    icp_config: Optional[Dict[str, Any]] = None  # If complete


class ICPConversationStatusResponse(BaseModel):
    """Status of an ongoing conversation."""
    conversation_id: str
    session_id: str
    turn_count: int
    is_complete: bool
    progress_percentage: float
    known_fields: Dict[str, Any]
    missing_fields: List[str]
    messages: List[ConversationMessage]


class ICPConversationFinalizeRequest(BaseModel):
    """Request to finalize conversation with partial data."""
    force_complete: bool = Field(default=False, description="Complete even with missing fields")


class ICPConversationFinalizeResponse(BaseModel):
    """Response after finalizing conversation."""
    success: bool
    session_id: str
    icp_config: Dict[str, Any]
    missing_fields: List[str]
    warning: Optional[str] = None  # Warning if finalized with missing data

