"""
Enhanced console and file logging for ICP journey visualization.
Provides detailed step-by-step logging with visual separators and saved output.
"""

import logging
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional
import json


class ICPConsoleLogger:
    """Enhanced logger that displays detailed ICP journey progress in console and file."""
    
    def __init__(self, log_dir: str = "logs"):
        """Initialize console logger with file output."""
        self.log_dir = Path(log_dir)
        self.log_dir.mkdir(exist_ok=True)
        
        # Create session-based log file
        self.current_session_file = None
        self.current_session_id = None
        
        # Setup Python logger
        self.logger = logging.getLogger("ICP_Journey")
        self.logger.setLevel(logging.INFO)
        
        # Clear existing handlers
        self.logger.handlers.clear()
        
        # Console handler with custom formatting
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(logging.INFO)
        console_formatter = logging.Formatter('%(message)s')
        console_handler.setFormatter(console_formatter)
        self.logger.addHandler(console_handler)
    
    def start_session(self, session_id: str, icp_text: str):
        """Start a new ICP processing session."""
        self.current_session_id = session_id
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        self.current_session_file = self.log_dir / f"session_{session_id}_{timestamp}.log"
        
        self._log_both("\n" + "="*100)
        self._log_both(f"🎯 NEW ICP PROCESSING SESSION")
        self._log_both(f"Session ID: {session_id}")
        self._log_both(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        self._log_both("="*100)
        self._log_both("")
        self._log_both("📝 USER ICP INPUT:")
        self._log_both("-" * 100)
        self._log_both(f"{icp_text}")
        self._log_both("-" * 100)
        self._log_both("")
    
    def log_mistral_start(self):
        """Log Mistral AI normalization start."""
        self._log_both("\n" + "🤖 STEP 1: ICP NORMALIZATION WITH MISTRAL AI")
        self._log_both("=" * 100)
        self._log_both("📤 Sending ICP text to Mistral AI...")
        self._log_both("⏳ Waiting for AI to parse and structure the ICP...")
    
    def log_mistral_result(self, success: bool, icp_config: Optional[Dict] = None, error: Optional[str] = None):
        """Log Mistral AI normalization result."""
        if success and icp_config:
            self._log_both("\n✅ MISTRAL AI NORMALIZATION: SUCCESS")
            self._log_both("-" * 100)
            
            # Log personas
            if 'personas' in icp_config:
                personas = icp_config['personas']
                self._log_both(f"\n👥 Personas Identified: {len(personas)}")
                for i, persona in enumerate(personas, 1):
                    self._log_both(f"  {i}. {persona.get('name', 'Unknown')}")
                    self._log_both(f"     - Seniority: {', '.join(persona.get('seniority', []))}")
                    self._log_both(f"     - Functions: {', '.join(persona.get('functions', []))}")
            
            # Log company filters
            if 'company_filters' in icp_config:
                filters = icp_config['company_filters']
                self._log_both(f"\n🏢 Company Filters:")
                
                if filters.get('employee_count'):
                    emp = filters['employee_count']
                    self._log_both(f"  - Employee Count: {emp.get('min', '?')} - {emp.get('max', '?')}")
                
                if filters.get('arr_usd'):
                    arr = filters['arr_usd']
                    min_arr = f"${arr.get('min', 0):,}" if arr.get('min') else "?"
                    max_arr = f"${arr.get('max', 0):,}" if arr.get('max') else "?"
                    self._log_both(f"  - Revenue (ARR): {min_arr} - {max_arr}")
                
                if filters.get('industries'):
                    self._log_both(f"  - Industries: {', '.join(filters['industries'][:5])}")
                
                if filters.get('technologies'):
                    self._log_both(f"  - Technologies: {', '.join(filters['technologies'][:5])}")
                
                if filters.get('locations') or filters.get('cities'):
                    locs = filters.get('cities') or filters.get('locations') or []
                    self._log_both(f"  - Locations: {', '.join(locs[:5])}")
            
            self._log_both("-" * 100)
        else:
            self._log_both(f"\n❌ MISTRAL AI NORMALIZATION: FAILED")
            self._log_both(f"Error: {error}")
    
    def log_routing_start(self):
        """Log routing decision start."""
        self._log_both("\n\n🧭 STEP 2: LLM ROUTING DECISION")
        self._log_both("=" * 100)
        self._log_both("📤 Analyzing ICP complexity and requirements...")
        self._log_both("⏳ Determining optimal research route...")
    
    def log_routing_result(self, success: bool, routing_decision: Optional[Dict] = None, error: Optional[str] = None):
        """Log routing decision result."""
        if success and routing_decision:
            self._log_both("\n✅ ROUTING DECISION: SUCCESS")
            self._log_both("-" * 100)
            
            # Log scores
            if 'scores' in routing_decision:
                scores = routing_decision['scores']
                self._log_both(f"\n📊 Routing Scores:")
                self._log_both(f"  - Specificity: {scores.get('specificity', 0):.2f} (how fully ICP specifies filters)")
                self._log_both(f"  - Mappability: {scores.get('mappability', 0):.2f} (maps to firmographic APIs)")
                self._log_both(f"  - Stability:   {scores.get('stability', 0):.2f} (temporal/volatile demands)")
            
            # Log route decision
            route = routing_decision.get('route', 'unknown')
            route_emoji = {
                'structured': '🏗️',
                'hybrid': '🔀',
                'deep_research': '🔬'
            }.get(route, '❓')
            
            self._log_both(f"\n{route_emoji} Selected Route: {route.upper()}")
            self._log_both(f"   Reason: {routing_decision.get('route_reason', 'No reason provided')}")
            
            # Log research plan
            if 'research_plan' in routing_decision:
                plan = routing_decision['research_plan']
                self._log_both(f"\n📋 Research Plan:")
                
                if plan.get('themes'):
                    self._log_both(f"  - Themes: {', '.join(plan['themes'][:5])}")
                
                if plan.get('personas'):
                    self._log_both(f"  - Personas: {', '.join(plan['personas'])}")
                
                if plan.get('seed_strategies'):
                    self._log_both(f"  - Seed Strategies: {', '.join(plan['seed_strategies'])}")
                
                if plan.get('evidence_requirements'):
                    self._log_both(f"  - Evidence Requirements: {len(plan['evidence_requirements'])} rules")
                    for req in plan['evidence_requirements'][:3]:
                        self._log_both(f"    • {req}")
                
                if plan.get('hard_filters'):
                    hf = plan['hard_filters']
                    self._log_both(f"  - Hard Filters:")
                    if hf.get('employee_count'):
                        self._log_both(f"    • Employee Count: {hf['employee_count']}")
                    if hf.get('industries'):
                        self._log_both(f"    • Industries: {', '.join(hf['industries'][:3])}")
                    if hf.get('countries'):
                        self._log_both(f"    • Countries: {', '.join(hf['countries'][:3])}")
                
                if plan.get('time_windows'):
                    tw = plan['time_windows']
                    self._log_both(f"  - Time Windows:")
                    self._log_both(f"    • Recency: {tw.get('recency_months_default', 12)} months")
                    self._log_both(f"    • Jobs: {tw.get('jobs_months', 3)} months")
                    self._log_both(f"    • Tech Adoption: {tw.get('tech_adoption_months', 18)} months")
                
                if plan.get('notes'):
                    self._log_both(f"  - Notes: {plan['notes']}")
            
            self._log_both("-" * 100)
        else:
            self._log_both(f"\n❌ ROUTING DECISION: FAILED")
            self._log_both(f"Error: {error}")
            self._log_both("-" * 100)
    
    def log_apollo_start(self, search_payload: Dict):
        """Log Apollo company search start."""
        self._log_both("\n\n🔍 STEP 3: COMPANY SEARCH WITH APOLLO API")
        self._log_both("=" * 100)
        self._log_both("📤 Sending search criteria to Apollo...")
        self._log_both("\n🎯 Search Parameters:")
        
        if search_payload.get('organization_num_employees_ranges'):
            self._log_both(f"  - Employee Range: {search_payload['organization_num_employees_ranges']}")
        if search_payload.get('organization_revenue_ranges'):
            self._log_both(f"  - Revenue Range: {search_payload['organization_revenue_ranges']}")
        if search_payload.get('q_organization_keyword_tags'):
            self._log_both(f"  - Industries: {search_payload['q_organization_keyword_tags']}")
        if search_payload.get('q_organization_technology_names'):
            self._log_both(f"  - Technologies: {search_payload['q_organization_technology_names']}")
        if search_payload.get('organization_locations'):
            self._log_both(f"  - Locations: {search_payload['organization_locations']}")
        
        self._log_both(f"  - Page Size: {search_payload.get('per_page', 10)}")
    
    def log_apollo_result(self, success: bool, companies: List[Dict], error: Optional[str] = None):
        """Log Apollo company search result."""
        if success:
            self._log_both(f"\n✅ APOLLO SEARCH: SUCCESS - Found {len(companies)} companies")
            self._log_both("-" * 100)
            
            for i, company in enumerate(companies[:5], 1):  # Show first 5
                self._log_both(f"\n  {i}. {company.get('name', 'Unknown')}")
                self._log_both(f"     - Domain: {company.get('domain', 'N/A')}")
                self._log_both(f"     - Industry: {company.get('industry', 'N/A')}")
                self._log_both(f"     - Employees: {company.get('employee_count', 'N/A')}")
                self._log_both(f"     - LinkedIn: {company.get('company_linkedin_url', 'N/A')}")
            
            if len(companies) > 5:
                self._log_both(f"\n  ... and {len(companies) - 5} more companies")
            
            self._log_both("-" * 100)
        else:
            self._log_both(f"\n❌ APOLLO SEARCH: FAILED")
            self._log_both(f"Error: {error}")
    
    def log_enrichment_start(self, company_count: int):
        """Log start of multi-layer enrichment."""
        self._log_both("\n\n🔄 STEP 4: MULTI-LAYER COMPANY ENRICHMENT")
        self._log_both("=" * 100)
        self._log_both(f"Processing {company_count} companies through enrichment pipeline...")
        self._log_both("Enrichment Layers: EnrichLayer → CoreSignal → Hunter.io → Serper")
        self._log_both("")
    
    def log_company_enrichment(self, company_name: str, company_num: int, total: int):
        """Log individual company enrichment progress."""
        self._log_both(f"\n📍 [{company_num}/{total}] Enriching: {company_name}")
        self._log_both("-" * 80)
    
    def log_enrichment_layer_start(self, layer_name: str, company_name: str):
        """Log when starting an enrichment layer."""
        self._log_both(f"  🔄 {layer_name}: Processing...")
    
    def log_enrichlayer_result(self, company_name: str, success: bool, data: Optional[Dict] = None):
        """Log EnrichLayer enrichment result with detailed fields."""
        if success and data:
            # Extract meaningful fields that were provided
            provided_fields = []
            field_details = []
            
            if data.get('name'):
                provided_fields.append('name')
            if data.get('description'):
                provided_fields.append('description')
                field_details.append(f"description ({len(data['description'])} chars)")
            if data.get('website'):
                provided_fields.append('website')
                field_details.append(f"website ({data['website']})")
            if data.get('company_size_on_linkedin'):
                provided_fields.append('employee_count')
                field_details.append(f"employees ({data['company_size_on_linkedin']})")
            if data.get('industry'):
                provided_fields.append('industry')
                field_details.append(f"industry ({data['industry']})")
            if data.get('specialities'):
                provided_fields.append('specialities')
                spec_count = len(data['specialities']) if isinstance(data['specialities'], list) else 1
                field_details.append(f"specialities ({spec_count})")
            if data.get('technologies'):
                provided_fields.append('technologies')
            if data.get('hq'):
                provided_fields.append('location/hq')
            
            if provided_fields:
                self._log_both(f"  ✅ EnrichLayer: Provided {len(provided_fields)} fields")
                for detail in field_details[:5]:  # Show first 5 details
                    self._log_both(f"     • {detail}")
                if len(field_details) > 5:
                    self._log_both(f"     • ... and {len(field_details) - 5} more fields")
            else:
                self._log_both(f"  ✅ EnrichLayer: Data received (no fields extracted)")
        elif success:
            self._log_both(f"  ⚠️  EnrichLayer: No usable data in response")
        else:
            self._log_both(f"  ⚠️  EnrichLayer: Failed or skipped")
    
    def log_coresignal_result(self, company_name: str, success: bool, domain_found: bool = False, 
                              domain_source: str = None, data: Optional[Dict] = None):
        """Log CoreSignal enrichment result with detailed fields."""
        if success and data:
            field_details = []
            
            # Check for domain discovery
            if domain_found and domain_source:
                self._log_both(f"  ✅ CoreSignal: Domain discovered via {domain_source}")
            
            # Extract meaningful fields
            if data.get('name'):
                field_details.append(f"name ({data['name']})")
            if data.get('website'):
                field_details.append(f"domain ({data['website']})")
            if data.get('description'):
                field_details.append(f"description ({len(data['description'])} chars)")
            if data.get('industry'):
                field_details.append(f"industry ({data['industry']})")
            if data.get('location') or data.get('location_hq_raw_address'):
                loc = data.get('location') or data.get('location_hq_raw_address', 'N/A')
                field_details.append(f"location ({loc})")
            if data.get('founded'):
                field_details.append(f"founded ({data['founded']})")
            if data.get('size_range'):
                field_details.append(f"size ({data['size_range']})")
            
            if field_details:
                self._log_both(f"  ✅ CoreSignal: Provided {len(field_details)} fields")
                for detail in field_details[:5]:
                    self._log_both(f"     • {detail}")
                if len(field_details) > 5:
                    self._log_both(f"     • ... and {len(field_details) - 5} more fields")
            else:
                self._log_both(f"  ✅ CoreSignal: Data received (no new fields)")
        elif success:
            self._log_both(f"  ⚠️  CoreSignal: No usable data")
        else:
            self._log_both(f"  ⚠️  CoreSignal: Failed or skipped")
    
    def log_hunterio_result(self, company_name: str, success: bool, contacts_count: int = 0, 
                           pattern: str = None, data: Optional[Dict] = None):
        """Log Hunter.io enrichment result with detailed info."""
        if success and contacts_count > 0:
            self._log_both(f"  ✅ Hunter.io: Found {contacts_count} email contacts")
            if pattern:
                self._log_both(f"     • Email pattern: {pattern}")
            if data and data.get('data'):
                domain_data = data['data']
                if domain_data.get('organization'):
                    self._log_both(f"     • Organization: {domain_data['organization']}")
                if domain_data.get('emails'):
                    # Show sample contacts
                    emails = domain_data['emails'][:3]
                    for email in emails:
                        name = f"{email.get('first_name', '')} {email.get('last_name', '')}".strip()
                        if name:
                            self._log_both(f"     • {name} ({email.get('value', 'N/A')})")
        elif success and pattern:
            self._log_both(f"  ✅ Hunter.io: Email pattern discovered ({pattern})")
        elif success:
            self._log_both(f"  ⚠️  Hunter.io: Domain verified but no contacts found")
        else:
            self._log_both(f"  ⚠️  Hunter.io: No data available")
    
    def log_serper_result(self, company_name: str, fields_enriched: Dict[str, Any] = None):
        """Log Serper enrichment result with detailed fields."""
        if fields_enriched and len(fields_enriched) > 0:
            self._log_both(f"  ✅ Serper: Enriched {len(fields_enriched)} fields")
            for field, value in list(fields_enriched.items())[:5]:
                if isinstance(value, str):
                    display_value = value[:50] + "..." if len(value) > 50 else value
                elif isinstance(value, list):
                    display_value = f"{len(value)} items"
                else:
                    display_value = str(value)
                self._log_both(f"     • {field}: {display_value}")
            if len(fields_enriched) > 5:
                self._log_both(f"     • ... and {len(fields_enriched) - 5} more fields")
        else:
            self._log_both(f"  ⚠️  Serper: No missing fields to enrich")
    
    def log_enrichment_summary(self, total_companies: int, enriched_count: int, 
                              domain_discoveries: int, failed_count: int):
        """Log enrichment summary."""
        self._log_both("\n" + "=" * 100)
        self._log_both("📊 ENRICHMENT SUMMARY")
        self._log_both(f"  - Total Companies: {total_companies}")
        self._log_both(f"  - Successfully Enriched: {enriched_count}")
        self._log_both(f"  - Domains Discovered: {domain_discoveries}")
        self._log_both(f"  - Partial/Failed: {failed_count}")
        self._log_both("=" * 100)
    
    def log_leads_start(self, company_count: int, personas: List[Dict]):
        """Log lead generation start."""
        self._log_both("\n\n👥 STEP 5: LEAD GENERATION FROM COMPANIES")
        self._log_both("=" * 100)
        self._log_both(f"Searching for contacts at {company_count} companies...")
        self._log_both(f"Target Personas: {', '.join([p.get('name', '?') for p in personas])}")
        self._log_both("")
    
    def log_company_leads(self, company_name: str, leads_found: int, company_num: int, total: int):
        """Log leads found for a company."""
        self._log_both(f"  [{company_num}/{total}] {company_name}: Found {leads_found} leads")
    
    def log_guardrails_filtering(self, before_count: int, after_count: int, filtered_count: int):
        """Log guardrails filtering step."""
        self._log_both(f"\n🛡️  GUARDRAILS: Validating Lead Quality")
        self._log_both("-" * 80)
        self._log_both(f"  Total Leads Before Validation: {before_count}")
        self._log_both(f"  ✅ Valid Leads (with names): {after_count}")
        self._log_both(f"  ❌ Filtered Out (missing names): {filtered_count}")
        self._log_both("-" * 80)
    
    def log_leads_summary(self, total_leads: int, companies_processed: int, 
                         apollo_leads: int, hunterio_leads: int):
        """Log lead generation summary."""
        self._log_both("\n" + "=" * 100)
        self._log_both("📊 LEAD GENERATION SUMMARY")
        self._log_both(f"  - Total Leads Found: {total_leads}")
        self._log_both(f"  - Companies Processed: {companies_processed}")
        self._log_both(f"  - Apollo Leads: {apollo_leads}")
        self._log_both(f"  - Hunter.io High-Confidence: {hunterio_leads}")
        self._log_both(f"  - Final Valid Leads: {total_leads}")
        self._log_both("=" * 100)
    
    def log_session_complete(self, processing_time: float, total_companies: int, 
                           total_leads: int, errors: List[str] = None):
        """Log session completion."""
        self._log_both("\n\n" + "=" * 100)
        self._log_both("🎉 ICP PROCESSING SESSION COMPLETE!")
        self._log_both("=" * 100)
        self._log_both(f"Session ID: {self.current_session_id}")
        self._log_both(f"Processing Time: {processing_time:.2f} seconds")
        self._log_both(f"")
        self._log_both(f"📈 FINAL RESULTS:")
        self._log_both(f"  ✅ Companies Found & Enriched: {total_companies}")
        self._log_both(f"  ✅ Leads Generated: {total_leads}")
        
        if errors:
            self._log_both(f"\n⚠️  Errors Encountered: {len(errors)}")
            for error in errors[:3]:
                self._log_both(f"     - {error}")
        
        self._log_both(f"\n💾 Session log saved to: {self.current_session_file}")
        self._log_both("=" * 100 + "\n")
    
    def _log_both(self, message: str):
        """Log message to both console and file."""
        # Log to console
        self.logger.info(message)
        
        # Log to file if session is active
        if self.current_session_file:
            try:
                with open(self.current_session_file, 'a', encoding='utf-8') as f:
                    f.write(message + '\n')
            except Exception as e:
                self.logger.error(f"Failed to write to log file: {e}")


# Global console logger instance
console_logger = ICPConsoleLogger()
