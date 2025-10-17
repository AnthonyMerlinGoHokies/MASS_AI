"""
Structured logging system for ICP normalization and enrichment journey.
Captures the full process from ICP input to final enriched results.
"""

import csv
import json
import os
from datetime import datetime
from typing import List, Dict, Any, Optional
from pathlib import Path

from ..schemas.icp import ICPConfig, PersonaConfig
from ..schemas.company import Company
from ..schemas.lead import Lead


class ICPJourneyLogger:
    """Logger for capturing the complete ICP normalization and enrichment journey."""
    
    def __init__(self, log_dir: str = "logs"):
        """Initialize the logger with log directory."""
        self.log_dir = Path(log_dir)
        self.log_dir.mkdir(exist_ok=True)
        
        # Define log file paths
        self.icp_log_file = self.log_dir / "icp_journey.csv"
        self.companies_log_file = self.log_dir / "companies_enrichment.csv"
        self.leads_log_file = self.log_dir / "leads_generation.csv"
        
        # Initialize CSV files with headers if they don't exist
        self._initialize_csv_files()
    
    def _initialize_csv_files(self):
        """Initialize CSV files with appropriate headers."""
        
        # ICP Journey Headers
        icp_headers = [
            "timestamp", "session_id", "raw_icp_text", "normalized_icp_json",
            "apollo_companies_count", "coresignal_enriched_count", "leads_generated_count",
            "domain_enrichment_attempts", "domain_enrichment_successes",
            "processing_time_seconds", "errors"
        ]
        
        # Companies Enrichment Headers
        company_headers = [
            "timestamp", "session_id", "organization_id", "company_name", "domain",
            "industry", "founded_year", "headquarters", "description", "company_linkedin",
            "employee_count", "revenue", "technologies", "tech_spend", "it_budget",
            "recent_news", "job_openings", "growth_signals", "ai_org_signals",
            "ai_tech_signals", "ai_hiring_signals", "intent_score", "intent_horizon",
            "signal_evidence", "enrichment_source", "apollo_domain", "coresignal_domain",
            "domain_source", "apollo_missing_fields", "coresignal_added_fields",
            "enrichment_status", "enrichment_error"
        ]
        
        # Leads Generation Headers
        lead_headers = [
            "timestamp", "session_id", "first_name", "last_name", "title", "company",
            "email", "phone", "linkedin", "twitter", "location", "recent_activity",
            "published_content", "matched_persona", "persona_confidence", "company_domain",
            "lead_source"
        ]
        
        # Initialize files if they don't exist
        self._init_csv_file(self.icp_log_file, icp_headers)
        self._init_csv_file(self.companies_log_file, company_headers)
        self._init_csv_file(self.leads_log_file, lead_headers)
    
    def _init_csv_file(self, file_path: Path, headers: List[str]):
        """Initialize a CSV file with headers if it doesn't exist."""
        if not file_path.exists():
            with open(file_path, 'w', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerow(headers)
    
    def _safe_json_dumps(self, obj: Any) -> str:
        """Safely convert object to JSON string, handling encoding issues."""
        try:
            return json.dumps(obj, ensure_ascii=True, separators=(',', ':'))
        except Exception as e:
            return f"JSON_ENCODE_ERROR: {str(e)}"
    
    def _safe_str(self, value: Any) -> str:
        """Safely convert value to string, handling encoding issues."""
        if value is None:
            return ""
        try:
            return str(value).encode('ascii', 'replace').decode('ascii')
        except Exception:
            return "ENCODING_ERROR"
    
    def log_icp_journey(self, 
                       session_id: str,
                       raw_icp_text: str,
                       normalized_icp: ICPConfig,
                       apollo_companies_count: int,
                       coresignal_enriched_count: int,
                       leads_generated_count: int,
                       domain_enrichment_attempts: int,
                       domain_enrichment_successes: int,
                       processing_time_seconds: float,
                       errors: List[str] = None):
        """Log the complete ICP journey summary."""
        
        timestamp = datetime.now().isoformat()
        
        row = [
            timestamp,
            session_id,
            self._safe_str(raw_icp_text),
            self._safe_json_dumps(normalized_icp.dict() if normalized_icp else None),
            apollo_companies_count,
            coresignal_enriched_count,
            leads_generated_count,
            domain_enrichment_attempts,
            domain_enrichment_successes,
            processing_time_seconds,
            self._safe_json_dumps(errors or [])
        ]
        
        with open(self.icp_log_file, 'a', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(row)
        
        print(f"[Logger] ICP journey logged for session {session_id}")
    
    def log_company_enrichment(self,
                             session_id: str,
                             apollo_company: Company,
                             enriched_company: Company,
                             enrichment_status: str,
                             enrichment_error: str = None):
        """Log detailed company enrichment data."""
        
        timestamp = datetime.now().isoformat()
        
        # Extract Apollo data points
        apollo_data = self._extract_company_data_points(apollo_company)
        enriched_data = self._extract_company_data_points(enriched_company)
        
        # Determine what fields were missing in Apollo and added by CoreSignal
        apollo_missing = []
        coresignal_added = []
        
        for field, enriched_value in enriched_data.items():
            apollo_value = apollo_data.get(field)
            if not apollo_value and enriched_value:
                apollo_missing.append(field)
                coresignal_added.append(f"{field}:{enriched_value}")
        
        # Domain enrichment tracking
        apollo_domain = apollo_company.domain or ""
        coresignal_domain = enriched_company.domain or ""
        domain_source = ""
        
        if hasattr(enriched_company, 'coresignal_data') and enriched_company.coresignal_data:
            domain_source = enriched_company.coresignal_data.get('domain_source', '')
        
        row = [
            timestamp,
            session_id,
            self._safe_str(enriched_company.id),
            self._safe_str(enriched_company.name),
            self._safe_str(enriched_company.domain),
            self._safe_str(enriched_data.get('industry')),
            self._safe_str(enriched_data.get('founded_year')),
            self._safe_str(enriched_data.get('headquarters')),
            self._safe_str(enriched_data.get('description')),
            self._safe_str(enriched_data.get('company_linkedin')),
            self._safe_str(enriched_data.get('employee_count')),
            self._safe_str(enriched_data.get('revenue')),
            self._safe_str(enriched_data.get('technologies')),
            self._safe_str(enriched_data.get('tech_spend')),
            self._safe_str(enriched_data.get('it_budget')),
            self._safe_str(enriched_data.get('recent_news')),
            self._safe_str(enriched_data.get('job_openings')),
            self._safe_str(enriched_data.get('growth_signals')),
            self._safe_str(enriched_data.get('ai_org_signals')),
            self._safe_str(enriched_data.get('ai_tech_signals')),
            self._safe_str(enriched_data.get('ai_hiring_signals')),
            self._safe_str(enriched_data.get('intent_score')),
            self._safe_str(enriched_data.get('intent_horizon')),
            self._safe_str(enriched_data.get('signal_evidence')),
            self._safe_str(enriched_data.get('enrichment_source')),
            self._safe_str(apollo_domain),
            self._safe_str(coresignal_domain),
            self._safe_str(domain_source),
            self._safe_json_dumps(apollo_missing),
            self._safe_json_dumps(coresignal_added),
            self._safe_str(enrichment_status),
            self._safe_str(enrichment_error or "")
        ]
        
        with open(self.companies_log_file, 'a', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(row)
    
    def log_lead_generation(self,
                          session_id: str,
                          lead: Lead,
                          company_domain: str = None):
        """Log lead generation data."""
        
        timestamp = datetime.now().isoformat()
        
        row = [
            timestamp,
            session_id,
            self._safe_str(lead.contact_first_name),
            self._safe_str(lead.contact_last_name),
            self._safe_str(lead.contact_title),
            self._safe_str(lead.contact_company),
            self._safe_str(lead.contact_email),
            self._safe_str(lead.contact_phone),
            self._safe_str(lead.contact_linkedin_url),
            self._safe_str(lead.contact_twitter),
            self._safe_str(lead.contact_location),
            self._safe_str(lead.contact_recent_activity),
            self._safe_str(lead.contact_published_content),
            self._safe_str(lead.matched_persona),
            self._safe_str(lead.persona_confidence),
            self._safe_str(company_domain or ""),
            "Apollo"  # lead_source
        ]
        
        with open(self.leads_log_file, 'a', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(row)
    
    def _extract_company_data_points(self, company: Company) -> Dict[str, Any]:
        """Extract all company data points for logging."""
        data = {
            'organization_id': company.id,
            'company_name': company.name,
            'domain': company.domain,
            'industry': company.industry,
            'founded_year': company.founded_year,
            'headquarters': company.headquarters or company.location,
            'description': company.description,
            'company_linkedin': company.company_linkedin_url or company.linkedin_url,
            'employee_count': company.employee_count,
            'revenue': company.revenue,
            'technologies': None,  # Will be filled from coresignal_data if available
            'tech_spend': None,
            'it_budget': None,
            'recent_news': None,
            'job_openings': None,
            'growth_signals': None,
            'ai_org_signals': None,
            'ai_tech_signals': None,
            'ai_hiring_signals': None,
            'intent_score': None,
            'intent_horizon': None,
            'signal_evidence': None,
            'enrichment_source': "Apollo" if not getattr(company, 'coresignal_enriched', False) else "CoreSignal"
        }
        
        # Add CoreSignal enriched data if available
        if hasattr(company, 'coresignal_data') and company.coresignal_data:
            cs_data = company.coresignal_data
            if isinstance(cs_data, dict):
                data.update({
                    'technologies': cs_data.get('technologies'),
                    'tech_spend': cs_data.get('tech_spend'),
                    'it_budget': cs_data.get('it_budget'),
                    'recent_news': cs_data.get('recent_news'),
                    'job_openings': cs_data.get('job_openings'),
                    'growth_signals': cs_data.get('growth_signals'),
                    'ai_org_signals': cs_data.get('ai_org_signals'),
                    'ai_tech_signals': cs_data.get('ai_tech_signals'),
                    'ai_hiring_signals': cs_data.get('ai_hiring_signals'),
                    'intent_score': cs_data.get('intent_score'),
                    'intent_horizon': cs_data.get('intent_horizon'),
                    'signal_evidence': cs_data.get('signal_evidence')
                })
        
        return data


# Global logger instance
journey_logger = ICPJourneyLogger()
