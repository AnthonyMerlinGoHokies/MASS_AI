"""
Conversational ICP service using LangGraph for state management.
Implements a form-filling agent that incrementally collects ICP data.

=== VALIDATION ARCHITECTURE ===

This service implements Gate A: Brief Completeness (ICP Validation)
- Validates that the ICP brief has sufficient information to proceed
- Does NOT validate individual lead/contact data quality

TWO-GATE SYSTEM:
    Gate A (This Agent): Brief Completeness
        - Required: persona AND industry AND location AND company_size
        - Coverage threshold: >= 0.8 (weighted fields)
        - Completion = required_ok AND coverage >= 0.8
        
    Gate B (Downstream): Lead/Contact Verification  
        - Validates individual leads (see guardrails.py)
        - Checks: name completeness, email format, etc.
        - Applied AFTER companies/leads are generated

=== COMPLETION RULES ===

DETERMINISTIC COMPLETION (no AI confidence shortcuts):
    Required Fields (Hard Gate):
        ✅ Persona with person_titles and person_seniorities
        ✅ Company size (employee count OR text-based)
        ✅ Revenue range (ARR in USD)
        
    Auto-filled:
        ✅ Location: Always "United States of America" (not asked)
        
    Coverage Calculation (Weighted):
        - Persona: 3.0 weight (required - must have titles & seniorities)
        - Company size: 2.5 weight (required)
        - Revenue range: 2.0 weight (required)
        - Location: 2.0 weight (auto-filled to USA)
        - Technologies: 2.5 weight (recommended)
        - Industry: 1.0 weight (recommended)
        - Founded year: 0.5 weight (optional)
        
    Confidence (Quality Indicator):
        - Measures specificity and quality
        - Used for routing/notes, NOT for gating
        
    Complete when: required_ok AND coverage >= 0.8

=== MAX TURNS BEHAVIOR ===

At max turns, we DON'T auto-finalize. Instead:
    1. Summarize what's filled + what's missing
    2. Offer user 3 choices:
        A) Proceed with partial brief (may yield lower quality)
        B) Answer 2 more targeted questions  
        C) Cancel and start over
        
This prevents accidental low-quality briefs.
"""
import uuid
from typing import Dict, Any, List, Optional, TypedDict, Annotated
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages

from ..clients.mistral import MistralClient
from ..schemas.icp import ICPConfig
from ..schemas.conversation import ConversationState, ConversationMode
from ..core.conversation_db import (
    create_conversation,
    get_conversation,
    update_conversation_state,
    finalize_conversation
)
from ..core.session import create_session
from ..core.db_operations import save_icp_search, update_icp_search


class ICPGraphState(TypedDict):
    """State for the ICP collection graph."""
    conversation_id: str
    session_id: str
    initial_text: str
    known_fields: Dict[str, Any]
    missing_fields: List[str]
    invalid_fields: List[Dict[str, str]]
    turn_count: int
    max_turns: int
    confidence_score: float  # Quality indicator (specificity)
    is_complete: bool
    last_user_input: str
    last_agent_message: str
    icp_config: Optional[Dict[str, Any]]
    metadata: Dict[str, Any]  # Stores coverage_score, required_ok, etc.


class ConversationalICPService:
    """Service for conversational ICP collection."""
    
    def __init__(self):
        self.mistral = MistralClient()
        self.graph = self._build_graph()
    
    def _build_graph(self) -> StateGraph:
        """Build the LangGraph state machine."""
        workflow = StateGraph(ICPGraphState)
        
        # Define nodes
        workflow.add_node("parse", self._parse_node)
        workflow.add_node("evaluate", self._evaluate_node)
        workflow.add_node("ask", self._ask_node)
        # Note: collect node is called manually in respond_to_conversation, not part of graph
        workflow.add_node("finalize", self._finalize_node)

        # Define edges
        workflow.set_entry_point("parse")

        # From parse: either evaluate or ask
        workflow.add_conditional_edges(
            "parse",
            self._should_ask_questions,
            {
                "evaluate": "evaluate",
                "ask": "ask"
            }
        )

        # From evaluate: either complete or ask more
        workflow.add_conditional_edges(
            "evaluate",
            self._is_complete,
            {
                "complete": "finalize",
                "incomplete": "ask"
            }
        )

        # From ask: wait for user response (external trigger)
        workflow.add_edge("ask", END)

        # From finalize: end
        workflow.add_edge("finalize", END)
        
        return workflow.compile()
    
    def _should_ask_questions(self, state: ICPGraphState) -> str:
        """Decide if we need to ask questions after initial parse."""
        # Always go through evaluation - no confidence shortcuts
        return "evaluate"
    
    def _is_complete(self, state: ICPGraphState) -> str:
        """
        Check if ICP is complete enough to finalize.
        
        Completion is deterministic based on:
        - Required fields: persona AND (industry OR location)
        - Coverage score >= 0.8
        
        At max turns, we DON'T auto-finalize - we ask user to choose.
        """
        if state["is_complete"]:
            return "complete"
        
        # At max turns, go to ask node to present options
        if state["turn_count"] >= state["max_turns"]:
            return "incomplete"  # Will trigger ask node with max_turns options
        
        return "incomplete"
    
    async def _parse_node(self, state: ICPGraphState) -> ICPGraphState:
        """
        Parse initial user input and extract ICP fields.
        
        NOTE: This node ONLY extracts fields. It does NOT determine what's missing.
        The EVALUATE node handles all completion logic with deterministic rules.
        """
        print(f"[Parse Node] Processing: {state['initial_text']}")
        
        try:
            # Use existing normalization prompt to extract fields
            prompt = self.mistral.create_icp_normalization_prompt(state["initial_text"])
            parsed_data = await self.mistral.call_api(prompt)
            
            # Auto-fill location to United States of America
            if not parsed_data.get("company_filters"):
                parsed_data["company_filters"] = {}
            
            # Always set location to USA unless explicitly specified otherwise
            if not parsed_data["company_filters"].get("countries"):
                parsed_data["company_filters"]["countries"] = ["United States of America"]
                print(f"[Parse Node] Auto-filled location: United States of America")
            
            # Update state with extracted fields
            state["known_fields"] = parsed_data
            
            # Log what was extracted
            extracted_fields = []
            if parsed_data.get("personas"):
                extracted_fields.append(f"personas({len(parsed_data['personas'])})")
            if parsed_data.get("company_filters"):
                cf = parsed_data["company_filters"]
                if cf.get("industries"):
                    extracted_fields.append(f"industries({len(cf['industries'])})")
                if cf.get("locations") or cf.get("cities") or cf.get("states") or cf.get("countries"):
                    extracted_fields.append("locations")
                if cf.get("employee_count") or cf.get("company_size"):
                    extracted_fields.append("company_size")
                if cf.get("funding_stage"):
                    extracted_fields.append("funding_stage")
            
            print(f"[Parse Node] Extracted: {', '.join(extracted_fields)}")
            
            # Don't determine completion here - let EVALUATE do it
            state["is_complete"] = False
            state["missing_fields"] = []  # EVALUATE will set this
            
        except Exception as e:
            print(f"[Parse Node] CRITICAL ERROR: {str(e)}")
            import traceback
            traceback.print_exc()
            
            # On error, create minimal structure to avoid breaking
            # Better to ask for everything than to crash
            state["known_fields"] = {
                "personas": [],
                "company_filters": {
                    "industries": [],
                    "employee_count": {"min": None, "max": None},
                    "arr_usd": {"min": None, "max": None}
                },
                "signals_required": [],
                "negative_keywords": []
            }
            state["is_complete"] = False
            state["missing_fields"] = []
            
            print(f"[Parse Node] Initialized with empty structure due to error")
        
        return state
    
    async def _evaluate_node(self, state: ICPGraphState) -> ICPGraphState:
        """
        Evaluate current state using deterministic rules.
        
        Gate A: Brief Completeness (ICP validation)
        - Required (hard gate): persona AND company_size AND revenue
        - Recommended: industries, technologies
        - Coverage threshold: >= 0.8 (weighted coverage of fields)
        
        Completion = required_ok AND coverage >= 0.8
        Confidence tracks quality but doesn't gate completion.
        """
        print(f"[Evaluate Node] Turn {state['turn_count']}/{state['max_turns']}")
        
        known = state["known_fields"]
        company_filters = known.get("company_filters", {})
        
        # Debug: Log what we're evaluating
        print(f"[Evaluate Node] Known fields keys: {list(known.keys())}")
        print(f"[Evaluate Node] Personas: {known.get('personas', [])}")
        print(f"[Evaluate Node] Company filters keys: {list(company_filters.keys())}")
        
        # === REQUIRED FIELDS (Hard Gate) ===
        # Required: Persona (with titles & seniorities) + Size + Revenue
        # Location: Auto-filled to USA (always present)
        
        # Persona: Must have titles and seniorities
        has_persona = False
        if known.get("personas") and len(known["personas"]) > 0:
            persona = known["personas"][0]
            
            # Handle case where persona might be a string instead of dict
            if isinstance(persona, str):
                print(f"[Evaluate Node] WARNING: Persona is string, not object: {persona}")
                has_persona = False
            elif isinstance(persona, dict):
                has_titles = bool(persona.get("title_regex") or persona.get("name"))
                has_seniority = bool(persona.get("seniority"))
                has_persona = has_titles and has_seniority
            else:
                print(f"[Evaluate Node] WARNING: Persona has unexpected type: {type(persona)}")
                has_persona = False
        
        # Technologies: Must be specified
        has_technologies = bool(
            company_filters.get("technologies") and len(company_filters["technologies"]) > 0
        )
        
        # Company size: Check both numeric ranges and text-based descriptions
        has_company_size = bool(
            # Numeric employee count range
            (company_filters.get("employee_count") and (
                company_filters["employee_count"].get("min") is not None or
                company_filters["employee_count"].get("max") is not None
            )) or
            # Text-based company size (small/medium/large/startup/enterprise)
            company_filters.get("company_size")
        )
        
        # Revenue range: Must have ARR specified
        has_revenue = bool(
            company_filters.get("arr_usd") and (
                company_filters["arr_usd"].get("min") is not None or
                company_filters["arr_usd"].get("max") is not None
            )
        )
        
        # Location: Auto-filled to USA (always true)
        has_location = bool(
            company_filters.get("locations") or
            company_filters.get("cities") or
            company_filters.get("states") or
            company_filters.get("countries")
        )
        
        # ALL THREE are required (location is auto-filled so should always be true)
        required_ok = has_persona and has_company_size and has_revenue
        
        # === RECOMMENDED FIELDS (for better targeting) ===
        has_industry = bool(company_filters.get("industries") and len(company_filters["industries"]) > 0)
        
        # === COVERAGE CALCULATION (Weighted) ===
        # Coverage = fraction of required + important fields filled
        weighted_score = 0.0
        max_weight = 0.0
        
        # Required fields (highest weight)
        if has_persona:
            weighted_score += 3.0
        max_weight += 3.0
        
        if has_company_size:
            weighted_score += 2.5
        max_weight += 2.5
        
        if has_revenue:
            weighted_score += 2.0
        max_weight += 2.0
        
        # Location (auto-filled, always present)
        if has_location:
            weighted_score += 2.0
        max_weight += 2.0
        
        # Recommended fields (medium weight)
        if has_technologies:
            weighted_score += 2.5
        max_weight += 2.5
        
        if has_industry:
            weighted_score += 1.0
        max_weight += 1.0
        
        # Optional fields (lower weight)
        if company_filters.get("founded_year_min"):
            weighted_score += 0.5
        max_weight += 0.5
        
        coverage_score = weighted_score / max_weight if max_weight > 0 else 0.0
        
        # === CONFIDENCE CALCULATION (Quality) ===
        # Confidence = quality of values (specificity, not just presence)
        # This is informational and affects routing/notes, not the gate
        confidence_factors = []
        
        if has_persona:
            # Check if persona has detailed regex patterns (high specificity)
            personas = known.get("personas", [])
            if personas and personas[0].get("title_regex"):
                confidence_factors.append(1.0)
            else:
                confidence_factors.append(0.7)
        
        if has_industry:
            # Multiple industries = more specific
            num_industries = len(company_filters.get("industries", []))
            confidence_factors.append(min(1.0, num_industries / 3.0))
        
        if has_location:
            # Specific cities > states > countries
            if company_filters.get("cities"):
                confidence_factors.append(1.0)
            elif company_filters.get("states"):
                confidence_factors.append(0.8)
            elif company_filters.get("countries"):
                confidence_factors.append(0.6)
        
        if has_company_size:
            # Specific range = high confidence
            ec = company_filters.get("employee_count", {})
            if ec.get("min") and ec.get("max"):
                confidence_factors.append(1.0)
            else:
                confidence_factors.append(0.7)
        
        confidence_score = sum(confidence_factors) / len(confidence_factors) if confidence_factors else 0.0
        
        # === CATEGORIZE MISSING FIELDS ===
        # Only ask about REQUIRED fields until they're satisfied
        required_missing = []
        recommended_missing = []
        optional_missing = []
        
        # Required field 1: Persona (must have titles and seniorities)
        if not has_persona:
            if not known.get("personas") or len(known["personas"]) == 0:
                required_missing.append("person_titles")
                required_missing.append("person_seniorities")
            else:
                persona = known["personas"][0]
                
                # Handle string personas (shouldn't happen but defensive)
                if isinstance(persona, str):
                    required_missing.append("person_titles")
                    required_missing.append("person_seniorities")
                elif isinstance(persona, dict):
                    if not persona.get("title_regex") and not persona.get("name"):
                        required_missing.append("person_titles")
                    if not persona.get("seniority"):
                        required_missing.append("person_seniorities")
        
        # Required field 2: Company size
        if not has_company_size:
            required_missing.append("company_size")
        
        # Required field 3: Revenue range
        if not has_revenue:
            required_missing.append("revenue_range")
        
        # Once required fields are met, ask for recommended fields for coverage
        if required_ok:
            if not has_technologies:
                recommended_missing.append("technologies")
            if not has_industry:
                recommended_missing.append("industries")
        
        # Optional fields (only if coverage needs boost)
        if required_ok and coverage_score >= 0.6:
            if not company_filters.get("founded_year_min"):
                optional_missing.append("founded_year")
        
        # === UPDATE STATE ===
        state["confidence_score"] = confidence_score
        
        # PRIORITY: Only ask about required fields first
        # If required fields are met, then ask about recommended fields for coverage
        if len(required_missing) > 0:
            state["missing_fields"] = required_missing
        elif coverage_score < 0.8:
            state["missing_fields"] = recommended_missing
        else:
            state["missing_fields"] = []
        
        # Store coverage as metadata (useful for UI/logging)
        if "metadata" not in state:
            state["metadata"] = {}
        state["metadata"]["coverage_score"] = coverage_score
        state["metadata"]["required_ok"] = required_ok
        state["metadata"]["has_persona"] = has_persona
        state["metadata"]["has_technologies"] = has_technologies
        state["metadata"]["has_company_size"] = has_company_size
        state["metadata"]["has_revenue"] = has_revenue
        state["metadata"]["has_location"] = has_location
        state["metadata"]["has_industry"] = has_industry
        state["metadata"]["required_missing"] = required_missing
        state["metadata"]["recommended_missing"] = recommended_missing
        state["metadata"]["optional_missing"] = optional_missing
        
        # DETERMINISTIC COMPLETION GATE
        # Complete = required_ok AND coverage >= 0.8
        state["is_complete"] = required_ok and coverage_score >= 0.8
        
        print(f"[Evaluate Node] Required OK: {required_ok} (persona={has_persona}, size={has_company_size}, revenue={has_revenue})")
        print(f"[Evaluate Node] Location: {has_location} (auto-filled to USA)")
        print(f"[Evaluate Node] Required Missing: {required_missing}")
        print(f"[Evaluate Node] Recommended Missing: {recommended_missing}")
        print(f"[Evaluate Node] Coverage: {coverage_score:.2f} (threshold: 0.80)")
        print(f"[Evaluate Node] Confidence: {confidence_score:.2f} (quality indicator)")
        print(f"[Evaluate Node] Complete: {state['is_complete']}")
        print(f"[Evaluate Node] Will ask about: {state['missing_fields']}")
        
        return state
    
    async def _ask_node(self, state: ICPGraphState) -> ICPGraphState:
        """
        Generate next question for the user.
        
        At max turns: Don't auto-finalize. Instead offer:
        (A) Proceed with partial brief
        (B) Ask 2 more targeted questions
        (C) Cancel and start over
        """
        print(f"[Ask Node] Generating question for turn {state['turn_count']}")
        
        # === AT MAX TURNS: Offer Options ===
        if state["turn_count"] >= state["max_turns"]:
            metadata = state.get("metadata", {})
            required_ok = metadata.get("required_ok", False)
            coverage = metadata.get("coverage_score", 0.0)
            
            # Summarize what we have
            summary_parts = []
            known_cf = state["known_fields"].get("company_filters", {})
            
            # Required field 1: Persona
            if metadata.get("has_persona"):
                personas = state["known_fields"].get("personas", [])
                if personas and len(personas) > 0:
                    if isinstance(personas[0], dict):
                        persona_names = [p.get("name", "Unknown") for p in personas]
                        summary_parts.append(f"• Persona: {', '.join(persona_names)}")
                    else:
                        # Handle string personas
                        summary_parts.append(f"• Persona: {', '.join(str(p) for p in personas)}")
                else:
                    summary_parts.append("• Persona: Specified")
            else:
                summary_parts.append("• Persona (titles & seniorities): Missing (required)")
            
            # Required field 2: Technologies
            if metadata.get("has_technologies"):
                techs = known_cf.get("technologies", [])
                summary_parts.append(f"• Technologies: {', '.join(techs)}")
            else:
                summary_parts.append("• Technologies: Missing (required)")
            
            # Required field 3: Company Size
            if metadata.get("has_company_size"):
                if known_cf.get("company_size"):
                    summary_parts.append(f"• Company Size: {known_cf['company_size']}")
                elif known_cf.get("employee_count"):
                    ec = known_cf["employee_count"]
                    summary_parts.append(f"• Company Size: {ec.get('min', '?')}-{ec.get('max', '?')} employees")
                else:
                    summary_parts.append("• Company Size: Specified")
            else:
                summary_parts.append("• Company Size: Missing (required)")
            
            # Required field 4: Revenue Range
            if metadata.get("has_revenue"):
                arr = known_cf.get("arr_usd", {})
                summary_parts.append(f"• Revenue: ${arr.get('min', '?')}M-${arr.get('max', '?')}M ARR")
            else:
                summary_parts.append("• Revenue Range: Missing (required)")
            
            # Auto-filled: Location
            summary_parts.append("• Location: United States of America (auto-filled)")
            
            # Recommended: Industry
            if metadata.get("has_industry"):
                industries = known_cf.get("industries", [])
                summary_parts.append(f"• Industries: {', '.join(industries)}")
            else:
                summary_parts.append("• Industries: Not specified (recommended)")
            
            # Recommended: Funding
            if metadata.get("has_funding"):
                funding = known_cf.get("funding_stage", [])
                summary_parts.append(f"• Funding Stage: {', '.join(funding)}")
            else:
                summary_parts.append("• Funding Stage: Not specified (recommended)")
            
            summary = "\n".join(summary_parts)
            
            # Build the max-turns message
            state["last_agent_message"] = f"""Maximum turns reached ({state['max_turns']}).

CURRENT STATUS:
Coverage: {coverage*100:.0f}% (need 80%)
Required fields: {"Complete" if required_ok else "Incomplete"}

{summary}

OPTIONS:
A) Proceed with this partial brief (may yield lower-quality results)
B) Answer 2 more targeted questions to improve the brief
C) Cancel and start over

Reply with A, B, or C."""

            print(f"[Ask Node] Max turns reached - offering options")
            print(f"[Ask Node] Required OK: {required_ok}, Coverage: {coverage:.2f}")
            
        else:
            # === NORMAL QUESTION GENERATION ===
            try:
                # Generate question based on missing fields
                prompt = self.mistral.create_missing_fields_question_prompt(
                    state["known_fields"],
                    state["missing_fields"],
                    state["turn_count"]
                )
                
                response = await self.mistral.call_api(prompt)
                
                state["last_agent_message"] = response.get("message", self._get_fallback_question(state["missing_fields"]))
                
                print(f"[Ask Node] Question: {state['last_agent_message']}")
                
            except Exception as e:
                print(f"[Ask Node] Error generating question: {str(e)}")
                # Use fallback question with examples
                state["last_agent_message"] = self._get_fallback_question(state["missing_fields"])
        
        # Save state to database
        self._save_state(state, add_agent_message=True)
        
        return state
    
    async def _collect_node(self, state: ICPGraphState) -> ICPGraphState:
        """
        Collect and parse user's answer.
        
        Handles special cases:
        - At max_turns: Process A/B/C options
        - Normal: Extract fields from answer
        """
        print(f"[Collect Node] Processing answer: {state['last_user_input']}")
        
        user_input = state["last_user_input"].strip().upper()
        
        # === HANDLE MAX TURNS OPTIONS (A/B/C) ===
        if state["turn_count"] >= state["max_turns"]:
            if user_input in ['A', 'OPTION A', 'PROCEED', 'A)', 'A.']:
                # Option A: Proceed with partial brief
                print(f"[Collect Node] User chose A: Proceed with partial")
                state["is_complete"] = True
                state["last_agent_message"] = "Proceeding with partial brief. Note: Results may be lower quality due to missing fields."
                return state
                
            elif user_input in ['B', 'OPTION B', 'CONTINUE', 'B)', 'B.']:
                # Option B: Answer 2 more questions
                print(f"[Collect Node] User chose B: Continue with 2 more questions")
                state["max_turns"] += 2  # Extend by 2 turns
                state["last_agent_message"] = "Great! Let's continue with 2 more targeted questions to improve your brief."
                return state
                
            elif user_input in ['C', 'OPTION C', 'CANCEL', 'START OVER', 'C)', 'C.']:
                # Option C: Cancel and restart
                print(f"[Collect Node] User chose C: Cancel")
                state["last_agent_message"] = "Conversation cancelled. Please start over with a more detailed description of your ideal customer."
                state["is_complete"] = True  # End conversation
                state["known_fields"] = {}  # Clear fields
                return state
            else:
                # Invalid option
                state["last_agent_message"] = "Please reply with A, B, or C to choose an option."
                return state
        
        # === NORMAL FIELD EXTRACTION ===
        try:
            # Extract fields from user's answer
            prompt = self.mistral.create_field_extraction_prompt(
                state["last_user_input"],
                state["known_fields"]
            )
            
            extracted = await self.mistral.call_api(prompt)
            
            # Merge extracted fields with known fields
            if not extracted.get("_no_new_fields"):
                state["known_fields"] = self._merge_fields(
                    state["known_fields"],
                    extracted
                )
            
            # Increment turn count
            state["turn_count"] += 1
            
            # Save state to database
            self._save_state(state, add_user_message=True)
            
            print(f"[Collect Node] Updated known fields")
            
        except Exception as e:
            print(f"[Collect Node] Error: {str(e)}")
            state["turn_count"] += 1
        
        return state
    
    async def _finalize_node(self, state: ICPGraphState) -> ICPGraphState:
        """Finalize ICP configuration and create ICPConfig object."""
        print(f"[Finalize Node] Creating final ICP config")
        
        try:
            # Fill in defaults for missing required fields
            final_config = self._fill_defaults(state["known_fields"])
            
            # Validate against ICPConfig schema
            icp_config = ICPConfig(**final_config)
            
            state["icp_config"] = icp_config.dict()
            state["is_complete"] = True
            
            # Save final config to icp_conversations table
            finalize_conversation(state["conversation_id"], state["icp_config"])
            
            # Update icp_searches table with finalized config
            update_icp_search(
                session_id=state["session_id"],
                icp_config=icp_config,
                routing_decision=None  # Routing can be added later if needed
            )
            
            print(f"[Finalize Node] ICP config created successfully")
            print(f"[Finalize Node] Updated icp_searches table for session: {state['session_id']}")
            
        except Exception as e:
            print(f"[Finalize Node] Error: {str(e)}")
            state["icp_config"] = None
        
        return state
    
    def _merge_fields(self, known: Dict[str, Any], extracted: Dict[str, Any]) -> Dict[str, Any]:
        """
        Merge extracted fields with known fields intelligently.
        
        Special handling for personas to preserve object structure.
        """
        merged = dict(known)
        
        for key, value in extracted.items():
            if key.startswith("_"):
                continue
            
            if key == "personas":
                # Special handling for personas - ensure they're objects, not strings
                if not value:
                    continue
                    
                # If extracted personas are strings, keep existing if they're objects
                if isinstance(value, list) and len(value) > 0:
                    if isinstance(value[0], str):
                        # Extracted as strings - don't override existing objects
                        if key in merged and isinstance(merged[key], list) and len(merged[key]) > 0:
                            if isinstance(merged[key][0], dict):
                                # Keep existing persona objects
                                print(f"[Merge] Keeping existing persona objects, ignoring string extraction")
                                continue
                    # Otherwise use the new value (should be objects)
                    merged[key] = value
            
            elif key == "company_filters":
                # Deep merge company_filters
                if key not in merged:
                    merged[key] = {}
                if isinstance(value, dict):
                    for cf_key, cf_value in value.items():
                        if cf_value is not None:
                            if cf_key in ["industries", "technologies", "funding_stage", "company_types"]:
                                # For lists, merge and deduplicate
                                if cf_key in merged[key] and isinstance(merged[key][cf_key], list):
                                    existing = set(merged[key][cf_key])
                                    new_items = set(cf_value) if isinstance(cf_value, list) else {cf_value}
                                    merged[key][cf_key] = list(existing | new_items)
                                else:
                                    merged[key][cf_key] = cf_value
                            else:
                                # For other fields, update directly
                                merged[key][cf_key] = cf_value
            
            elif key not in merged:
                merged[key] = value
            elif isinstance(value, dict) and isinstance(merged[key], dict):
                # Merge dictionaries
                merged[key] = {**merged[key], **value}
            elif isinstance(value, list) and isinstance(merged[key], list):
                # Merge lists - check if they contain dicts or primitives
                if len(value) > 0 and isinstance(value[0], dict):
                    # Can't use set() on dicts - just append
                    merged[key] = merged[key] + [v for v in value if v not in merged[key]]
                else:
                    # Primitive values - can deduplicate
                    merged[key] = list(set(merged[key] + value))
            else:
                # Override with new value
                merged[key] = value
        
        return merged
    
    def _fill_defaults(self, known_fields: Dict[str, Any]) -> Dict[str, Any]:
        """Fill in default values for missing required fields."""
        config = dict(known_fields)
        
        # Ensure personas exist
        if not config.get("personas"):
            config["personas"] = [{
                "name": "Decision Maker",
                "title_regex": ["^(CEO|CTO|VP|Director|Manager).*$"],
                "seniority": ["Executive"],
                "functions": ["Executive"]
            }]
        
        # Ensure company_filters exist
        if not config.get("company_filters"):
            config["company_filters"] = {}
        
        cf = config["company_filters"]
        if not cf.get("employee_count"):
            cf["employee_count"] = {"min": 10, "max": 500}
        if not cf.get("arr_usd"):
            cf["arr_usd"] = {"min": None, "max": None}
        if not cf.get("industries"):
            cf["industries"] = []
        
        # Ensure other required fields
        if not config.get("signals_required"):
            config["signals_required"] = []
        if not config.get("negative_keywords"):
            config["negative_keywords"] = []
        if not config.get("required_fields_for_qualify"):
            config["required_fields_for_qualify"] = [
                "domain", "industry", "employee_count_band", 
                "revenue_band", "company_linkedin_url"
            ]
        if not config.get("contact_persona_targets"):
            config["contact_persona_targets"] = {
                "per_company_min": 3,
                "per_company_max": 5,
                "persona_order": [p["name"] for p in config["personas"]]
            }
        if not config.get("stage_overrides"):
            config["stage_overrides"] = {
                "budget_cap_per_lead_usd": 1.50,
                "finder_pct": 10,
                "research_pct": 35,
                "contacts_pct": 25,
                "verify_pct": 20,
                "synthesis_pct": 5,
                "intent_pct": 5
            }
        
        return config
    
    def _get_fallback_question(self, missing_fields: List[str]) -> str:
        """
        Generate fallback question with examples when AI fails.
        Ensures agent always has good questions even if Mistral API is down.
        """
        if not missing_fields:
            return "Could you provide more details about your ideal customer?"
        
        # Map fields to conversational questions with examples
        field_questions = {
            "person_titles": "What job titles are you targeting? (e.g., CEO, CTO, VP of Engineering)",
            "person_seniorities": "What seniority levels? (e.g., Executive, Senior, Director)",
            "technologies": "What technologies do these companies use? (e.g., Python, AWS, React, or Salesforce, HubSpot)",
            "company_size": "What's the company size? (e.g., 50-200 employees, or small/medium/large)",
            "revenue_range": "What's the revenue range you're targeting? (e.g., $10M-$50M ARR, or $1M-$10M)",
            "industries": "What industries are you focusing on? (e.g., SaaS, FinTech, Healthcare)",
            "locations": "What locations are you targeting? (e.g., California, New York, or specific cities)",
            "founded_year": "What year range were these companies founded? (e.g., 2020-2024, or 2015+)"
        }
        
        # Build question
        if len(missing_fields) == 1:
            # Single field - natural sentence
            field = missing_fields[0]
            return field_questions.get(field, f"Could you specify the {field.replace('_', ' ')}?")
        else:
            # Multiple fields - bullet list with examples
            questions = []
            for field in missing_fields[:4]:  # Max 4 questions at once
                if field in field_questions:
                    questions.append(f"• {field_questions[field]}")
            
            if questions:
                return "I need a few more details:\n\n" + "\n".join(questions)
            else:
                return "Could you provide more details about your ideal customer?"
    
    def _save_state(self, state: ICPGraphState, add_user_message: bool = False, add_agent_message: bool = False):
        """Save current state to database."""
        conversation_state = {
            "known_fields": state["known_fields"],
            "missing_fields": state["missing_fields"],
            "invalid_fields": state["invalid_fields"],
            "turn_count": state["turn_count"],
            "confidence_score": state["confidence_score"]
        }
        
        new_message = None
        if add_user_message:
            new_message = {"role": "user", "content": state["last_user_input"]}
        elif add_agent_message:
            new_message = {"role": "agent", "content": state["last_agent_message"]}
        
        update_conversation_state(state["conversation_id"], conversation_state, new_message)
    
    async def start_conversation(
        self, 
        initial_text: str, 
        mode: ConversationMode = ConversationMode.AUTO,
        max_turns: int = 5
    ) -> Dict[str, Any]:
        """Start a new ICP conversation."""
        # Generate IDs
        conversation_id = str(uuid.uuid4())[:8]
        session = create_session(initial_text)
        session_id = session.session_id
        
        # Create placeholder ICP search entry (required for foreign key)
        save_icp_search(session_id, initial_text, None)
        
        # Create conversation in database with mode and max_turns
        create_conversation(conversation_id, session_id, initial_text, mode.value, max_turns)
        
        # Initialize state
        initial_state: ICPGraphState = {
            "conversation_id": conversation_id,
            "session_id": session_id,
            "initial_text": initial_text,
            "known_fields": {},
            "missing_fields": [],
            "invalid_fields": [],
            "turn_count": 0,
            "max_turns": max_turns,
            "confidence_score": 0.0,
            "is_complete": False,
            "last_user_input": initial_text,
            "last_agent_message": "",
            "icp_config": None,
            "metadata": {}
        }
        
        # Run through parse and evaluate manually
        # (Graph is only used for validation, actual flow is manual)
        state = initial_state
        state = await self._parse_node(state)
        state = await self._evaluate_node(state)

        # If complete, finalize; otherwise ask questions
        if state["is_complete"]:
            state = await self._finalize_node(state)
        else:
            state = await self._ask_node(state)

        return {
            "conversation_id": conversation_id,
            "session_id": session_id,
            "needs_conversation": not state["is_complete"],
            "message": state.get("last_agent_message"),
            "state": ConversationState(
                known_fields=state["known_fields"],
                missing_fields=state["missing_fields"],
                invalid_fields=state["invalid_fields"],
                turn_count=state["turn_count"],
                confidence_score=state["confidence_score"],
                max_turns=state["max_turns"]
            ),
            "icp_config": state.get("icp_config")
        }
    
    async def respond_to_conversation(self, conversation_id: str, answer: str) -> Dict[str, Any]:
        """Process user's answer and continue conversation."""
        # Get current conversation from database
        conversation = get_conversation(conversation_id)
        if not conversation:
            raise ValueError(f"Conversation {conversation_id} not found")
        
        current_state = conversation["current_state"]
        
        # Build state for collect node
        state: ICPGraphState = {
            "conversation_id": conversation_id,
            "session_id": conversation["session_id"],
            "initial_text": conversation["initial_input"],
            "known_fields": current_state["known_fields"],
            "missing_fields": current_state["missing_fields"],
            "invalid_fields": current_state["invalid_fields"],
            "turn_count": current_state["turn_count"],
            "max_turns": conversation["max_turns"],  # Read from database
            "confidence_score": current_state.get("confidence_score", 0.0),
            "is_complete": False,
            "last_user_input": answer,
            "last_agent_message": "",
            "icp_config": None,
            "metadata": current_state.get("metadata", {})
        }
        
        # Run collect → evaluate → ask/finalize
        state = await self._collect_node(state)
        state = await self._evaluate_node(state)
        
        if state["is_complete"] or state["turn_count"] >= state["max_turns"]:
            state = await self._finalize_node(state)
            needs_more = False
        else:
            state = await self._ask_node(state)
            needs_more = True
        
        # Calculate progress
        progress = min(100.0, (state["turn_count"] / state["max_turns"]) * 100)
        if state["is_complete"]:
            progress = 100.0
        
        return {
            "conversation_id": conversation_id,
            "needs_more_info": needs_more,
            "message": state.get("last_agent_message"),
            "state": ConversationState(
                known_fields=state["known_fields"],
                missing_fields=state["missing_fields"],
                invalid_fields=state["invalid_fields"],
                turn_count=state["turn_count"],
                confidence_score=state["confidence_score"],
                max_turns=state["max_turns"]
            ),
            "progress_percentage": progress,
            "icp_config": state.get("icp_config")
        }

