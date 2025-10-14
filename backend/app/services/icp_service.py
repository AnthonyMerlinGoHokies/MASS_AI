"""
ICP (Ideal Customer Profile) service for normalization and fallback logic.
"""
from typing import Dict, Any

from ..clients.mistral import MistralClient
from ..schemas.icp import ICPConfig, RoutingDecision
from ..core.session import create_session
from ..core.console_logger import console_logger


class ICPService:
    """Service for ICP normalization."""
    
    def __init__(self):
        self.mistral_client = MistralClient()
    
    def create_fallback_icp_config(self, icp_text: str) -> Dict[str, Any]:
        """Create a basic fallback ICP configuration when MISTRAL fails."""
        return {
            "personas": [
                {
                    "name": "Decision Maker",
                    "title_regex": ["^(CEO|CTO|VP|Director|Manager).*$"],
                    "seniority": ["Senior", "Executive"],
                    "functions": ["Executive", "Technology", "Sales"]
                }
            ],
            "company_filters": {
                "employee_count": {"min": 10, "max": 500},
                "arr_usd": {"min": 1000000, "max": 50000000},
                "industries": ["Technology", "SaaS", "Software"],
                "locations": ["United States", "Canada"],
                "cities": ["San Francisco", "New York", "Austin", "Seattle"],
                "countries": ["United States", "Canada"],
                "founded_year_min": 2000,
                "founded_year_max": 2024,
                "technologies": ["Python", "JavaScript", "React", "AWS"],
                "keywords": ["AI", "Machine Learning", "SaaS", "Cloud"],
                "exclude_keywords": ["Consulting", "Outsourcing"]
            },
            "signals_required": ["company_growth", "recent_funding"],
            "negative_keywords": ["bankruptcy", "layoffs"],
            "required_fields_for_qualify": ["domain", "industry", "employee_count_band", "revenue_band", "company_linkedin_url"],
            "contact_persona_targets": {
                "per_company_min": 3,
                "per_company_max": 5,
                "persona_order": ["Decision Maker"]
            },
            "stage_overrides": {
                "budget_cap_per_lead_usd": 1.50,
                "finder_pct": 10,
                "research_pct": 35,
                "contacts_pct": 25,
                "verify_pct": 20,
                "synthesis_pct": 5,
                "intent_pct": 5
            }
        }
    
    async def normalize_icp(self, icp_text: str) -> Dict[str, Any]:
        """Normalize ICP text using MISTRAL with fallback, then route with LLM Router."""
        # Create session for journey tracking
        session = create_session(icp_text)
        
        # Start console logging
        console_logger.start_session(session.session_id, icp_text)
        console_logger.log_mistral_start()
        
        try:
            # STEP 1: Create prompt for MISTRAL ICP Normalization
            prompt = self.mistral_client.create_icp_normalization_prompt(icp_text)
            
            # Call MISTRAL API for normalization
            normalized_data = await self.mistral_client.call_api(prompt)
            
            # Validate the response matches our schema
            icp_config = ICPConfig(**normalized_data)
            session.set_normalized_icp(icp_config)
            
            # Log normalization success
            console_logger.log_mistral_result(True, icp_config.dict())
            
            # STEP 2: LLM Routing Decision
            console_logger.log_routing_start()
            
            try:
                # Create routing prompt with both raw ICP and normalized JSON
                routing_prompt = self.mistral_client.create_routing_prompt(icp_text, normalized_data)
                
                # Call MISTRAL API for routing decision
                routing_data = await self.mistral_client.call_api(routing_prompt)
                
                # Validate routing response
                routing_decision = RoutingDecision(**routing_data)
                
                # Log routing success
                console_logger.log_routing_result(True, routing_decision.dict())
                
                return {
                    "success": True,
                    "icp_config": icp_config,
                    "routing_decision": routing_decision,
                    "error": None,
                    "session_id": session.session_id
                }
                
            except Exception as routing_error:
                # If routing fails, still proceed with normalized ICP
                print(f"[ICP] Routing failed: {str(routing_error)}")
                console_logger.log_routing_result(False, error=str(routing_error))
                
                return {
                    "success": True,
                    "icp_config": icp_config,
                    "routing_decision": None,
                    "error": f"Warning: Routing failed ({str(routing_error)}), proceeding with structured route",
                    "session_id": session.session_id
                }
            
        except Exception as e:
            session.add_error(f"MISTRAL normalization failed: {str(e)}")
            print(f"[ICP] MISTRAL normalization failed: {str(e)}")
            
            # Log failure
            console_logger.log_mistral_result(False, error=str(e))
            
            return {
                "success": False,
                "icp_config": None,
                "routing_decision": None,
                "error": f"NO DATA AVAILABLE - ICP normalization failed: {str(e)}",
                "session_id": session.session_id
            }
