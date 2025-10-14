"""
Session tracking for ICP journey logging.
"""

import uuid
import time
from typing import Dict, Any, List
from datetime import datetime


class ICPSession:
    """Tracks a single ICP processing session."""
    
    def __init__(self, raw_icp_text: str):
        self.session_id = str(uuid.uuid4())[:8]  # Short unique ID
        self.raw_icp_text = raw_icp_text
        self.start_time = time.time()
        
        # Journey tracking
        self.normalized_icp = None
        self.apollo_companies_count = 0
        self.coresignal_enriched_count = 0
        self.leads_generated_count = 0
        self.domain_enrichment_attempts = 0
        self.domain_enrichment_successes = 0
        self.errors: List[str] = []
        
        print(f"[Session] Started ICP session {self.session_id}")
    
    def set_normalized_icp(self, icp_config):
        """Set the normalized ICP configuration."""
        self.normalized_icp = icp_config
        print(f"[Session {self.session_id}] ICP normalized")
    
    def set_apollo_results(self, companies_count: int):
        """Set Apollo search results count."""
        self.apollo_companies_count = companies_count
        print(f"[Session {self.session_id}] Apollo returned {companies_count} companies")
    
    def increment_coresignal_enriched(self):
        """Increment CoreSignal enriched companies count."""
        self.coresignal_enriched_count += 1
    
    def increment_domain_enrichment_attempt(self):
        """Increment domain enrichment attempts."""
        self.domain_enrichment_attempts += 1
    
    def increment_domain_enrichment_success(self):
        """Increment successful domain enrichments."""
        self.domain_enrichment_successes += 1
    
    def set_leads_generated(self, leads_count: int):
        """Set the number of leads generated."""
        self.leads_generated_count = leads_count
        print(f"[Session {self.session_id}] Generated {leads_count} leads")
    
    def add_error(self, error: str):
        """Add an error to the session."""
        self.errors.append(error)
        print(f"[Session {self.session_id}] Error: {error}")
    
    def get_processing_time(self) -> float:
        """Get the total processing time in seconds."""
        return time.time() - self.start_time
    
    def complete(self):
        """Mark the session as complete."""
        processing_time = self.get_processing_time()
        print(f"[Session {self.session_id}] Completed in {processing_time:.2f}s")
        return {
            'session_id': self.session_id,
            'raw_icp_text': self.raw_icp_text,
            'normalized_icp': self.normalized_icp,
            'apollo_companies_count': self.apollo_companies_count,
            'coresignal_enriched_count': self.coresignal_enriched_count,
            'leads_generated_count': self.leads_generated_count,
            'domain_enrichment_attempts': self.domain_enrichment_attempts,
            'domain_enrichment_successes': self.domain_enrichment_successes,
            'processing_time_seconds': processing_time,
            'errors': self.errors
        }


# Global session storage (in production, use Redis or similar)
_active_sessions: Dict[str, ICPSession] = {}


def create_session(raw_icp_text: str) -> ICPSession:
    """Create a new ICP processing session."""
    session = ICPSession(raw_icp_text)
    _active_sessions[session.session_id] = session
    return session


def get_session(session_id: str) -> ICPSession:
    """Get an active session by ID."""
    return _active_sessions.get(session_id)


def complete_session(session_id: str) -> Dict[str, Any]:
    """Complete and remove a session."""
    session = _active_sessions.pop(session_id, None)
    if session:
        return session.complete()
    return None
