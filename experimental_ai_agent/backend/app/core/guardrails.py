"""
Guardrails system for validating and filtering leads.
Ensures data quality by applying business rules before displaying results.
"""

from typing import List, Tuple
from ..schemas.lead import Lead
import logging

logger = logging.getLogger(__name__)


class LeadGuardrails:
    """Validation and filtering rules for leads."""
    
    def __init__(self):
        self.validation_rules = {
            'required_name_fields': self._validate_required_name_fields,
            # Add more rules here in the future:
            # 'valid_email_format': self._validate_email_format,
            # 'required_contact_info': self._validate_contact_info,
        }
        self.stats = {
            'total_leads': 0,
            'filtered_leads': 0,
            'passed_leads': 0,
            'rules_failed': {}
        }
    
    def apply_guardrails(self, leads: List[Lead]) -> Tuple[List[Lead], dict]:
        """
        Apply all validation rules to leads and filter out invalid ones.
        
        Args:
            leads: List of Lead objects to validate
            
        Returns:
            Tuple of (valid_leads, stats_dict)
        """
        self.stats = {
            'total_leads': len(leads),
            'filtered_leads': 0,
            'passed_leads': 0,
            'rules_failed': {}
        }
        
        valid_leads = []
        
        for lead in leads:
            is_valid, failed_rules = self._validate_lead(lead)
            
            if is_valid:
                valid_leads.append(lead)
                self.stats['passed_leads'] += 1
            else:
                self.stats['filtered_leads'] += 1
                for rule in failed_rules:
                    self.stats['rules_failed'][rule] = self.stats['rules_failed'].get(rule, 0) + 1
                
                # Log filtered lead
                logger.info(
                    f"[Guardrails] Filtered lead: {lead.contact_email or 'No email'} "
                    f"from {lead.contact_company or 'Unknown company'} - "
                    f"Failed rules: {', '.join(failed_rules)}"
                )
        
        return valid_leads, self.stats
    
    def _validate_lead(self, lead: Lead) -> Tuple[bool, List[str]]:
        """
        Validate a single lead against all rules.
        
        Returns:
            Tuple of (is_valid, list_of_failed_rule_names)
        """
        failed_rules = []
        
        for rule_name, rule_func in self.validation_rules.items():
            if not rule_func(lead):
                failed_rules.append(rule_name)
        
        return len(failed_rules) == 0, failed_rules
    
    # ==================== VALIDATION RULES ====================
    
    def _validate_required_name_fields(self, lead: Lead) -> bool:
        """
        RULE: Lead must have both first_name AND last_name.
        
        Rationale: A lead without a name is not actionable for outreach.
        Leads are people, and people have names.
        """
        has_first_name = bool(lead.contact_first_name and lead.contact_first_name.strip())
        has_last_name = bool(lead.contact_last_name and lead.contact_last_name.strip())
        
        return has_first_name and has_last_name
    
    # ==================== FUTURE VALIDATION RULES ====================
    # Uncomment and customize these as needed:
    
    # def _validate_email_format(self, lead: Lead) -> bool:
    #     """
    #     RULE: If email is provided, it must be valid format.
    #     """
    #     if not lead.contact_email:
    #         return True  # Email is optional, so no email is fine
    #     
    #     import re
    #     email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    #     return bool(re.match(email_pattern, lead.contact_email))
    
    # def _validate_required_contact_info(self, lead: Lead) -> bool:
    #     """
    #     RULE: Lead must have at least one contact method (email, phone, or LinkedIn).
    #     """
    #     has_email = bool(lead.contact_email and lead.contact_email.strip())
    #     has_phone = bool(lead.contact_phone and lead.contact_phone.strip())
    #     has_linkedin = bool(lead.contact_linkedin_url and lead.contact_linkedin_url.strip())
    #     
    #     return has_email or has_phone or has_linkedin
    
    # def _validate_title_present(self, lead: Lead) -> bool:
    #     """
    #     RULE: Lead must have a job title.
    #     """
    #     return bool(lead.contact_title and lead.contact_title.strip())
    
    # def _validate_company_present(self, lead: Lead) -> bool:
    #     """
    #     RULE: Lead must have a company association.
    #     """
    #     return bool(lead.contact_company and lead.contact_company.strip())


def log_guardrails_summary(stats: dict, session_id: str = None):
    """
    Log a summary of guardrails filtering.
    
    Args:
        stats: Statistics dict from apply_guardrails
        session_id: Optional session ID for logging
    """
    logger.info(f"\n{'='*80}")
    logger.info(f"[Guardrails] Lead Validation Summary")
    if session_id:
        logger.info(f"[Guardrails] Session: {session_id}")
    logger.info(f"[Guardrails] Total Leads: {stats['total_leads']}")
    logger.info(f"[Guardrails] ✅ Passed: {stats['passed_leads']}")
    logger.info(f"[Guardrails] ❌ Filtered: {stats['filtered_leads']}")
    
    if stats['rules_failed']:
        logger.info(f"[Guardrails] Rules Failed Breakdown:")
        for rule, count in stats['rules_failed'].items():
            logger.info(f"[Guardrails]   - {rule}: {count} leads")
    
    logger.info(f"{'='*80}\n")
    
    # Also print to console
    print(f"\n{'='*80}")
    print(f"🛡️  GUARDRAILS: Lead Validation Summary")
    print(f"{'='*80}")
    print(f"  Total Leads Processed: {stats['total_leads']}")
    print(f"  ✅ Valid Leads: {stats['passed_leads']}")
    print(f"  ❌ Filtered Out: {stats['filtered_leads']}")
    
    if stats['rules_failed']:
        print(f"\n  Filtered Reasons:")
        for rule, count in stats['rules_failed'].items():
            rule_display = rule.replace('_', ' ').title()
            print(f"    • {rule_display}: {count} leads")
    
    print(f"{'='*80}\n")


# Global guardrails instance
lead_guardrails = LeadGuardrails()
