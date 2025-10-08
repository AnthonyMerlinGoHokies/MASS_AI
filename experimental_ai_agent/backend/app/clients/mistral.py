"""
Mistral AI API client for ICP normalization.
"""
import json
import time
import httpx
from typing import Dict, Any

from ..core.config import settings


class MistralClient:
    """Client for Mistral AI API."""
    
    def __init__(self):
        self.api_key = settings.MISTRAL_API_KEY
        self.api_url = settings.MISTRAL_API_URL
        self.last_call_time = 0
        self.rate_limit_seconds = settings.MISTRAL_RATE_LIMIT_SECONDS
    
    def create_icp_normalization_prompt(self, icp_text: str) -> str:
        """Create a prompt for MISTRAL to normalize ICP text into structured format."""
        return f"""You are an expert at converting natural language Ideal Customer Profile (ICP) descriptions into structured JSON format.

CRITICAL INSTRUCTIONS:
1. You must respond with ONLY valid JSON - no explanations, no markdown, no code blocks, no additional text
2. Your response must start with {{ and end with }}
3. You must include ALL required fields in the JSON structure
4. If a field is not mentioned in the description, set it to null or empty array as appropriate

Convert the following ICP description into a valid JSON that matches this EXACT schema:

{{
  "personas": [
    {{
      "name": "string",
      "title_regex": ["regex_pattern"],
      "seniority": ["level"],
      "functions": ["department"]
    }}
  ],
  "company_filters": {{
    "employee_count": {{"min": int, "max": int}},
    "arr_usd": {{"min": int, "max": int}},
    "industries": ["industry_name"],
    "locations": ["location_name"],
    "cities": ["city_name"],
    "states": ["state_name"],
    "countries": ["country_name"],
    "founded_year_min": int,
    "founded_year_max": int,
    "company_types": ["company_type"],
    "technologies": ["technology_name"],
    "funding_stage": ["funding_stage"],
    "total_funding_min": int,
    "total_funding_max": int,
    "company_size": ["size_category"],
    "keywords": ["keyword"],
    "exclude_keywords": ["exclude_keyword"]
  }},
  "signals_required": ["signal_name"],
  "negative_keywords": ["keyword"],
  "required_fields_for_qualify": ["field_name"],
  "contact_persona_targets": {{
    "per_company_min": int,
    "per_company_max": int,
    "persona_order": ["persona_name"]
  }},
  "stage_overrides": {{
    "budget_cap_per_lead_usd": float,
    "finder_pct": int,
    "research_pct": int,
    "contacts_pct": int,
    "verify_pct": int,
    "synthesis_pct": int,
    "intent_pct": int
  }}
}}

Guidelines:
- Extract persona information and create REGEX patterns for job titles (e.g., "CTO" becomes "^(Chief Technology Officer|CTO|Chief Technical Officer).*$")
- For common titles, use comprehensive regex: VP -> "^(VP|Vice President|V\\\\.P\\\\.).*", Director -> "^(Director|Dir\\\\.).*", Manager -> "^(Manager|Mgr\\\\.).*"
- Set reasonable company size and revenue ranges based on description
- Include relevant industry categories from the description
- Extract location information (cities, states, countries) if mentioned
- Extract founded year ranges if specified (e.g., "founded between 2010-2020")
- Extract technology requirements (e.g., "using Python, React")
- Extract company types if mentioned (e.g., "SaaS", "Enterprise", "Startup")
- Extract funding stage preferences if mentioned
- Extract keywords from the description for broader matching
- Extract exclusion keywords (e.g., "excluding consulting companies")
- Set null for fields not mentioned in the description
- Create multiple personas if multiple job titles/roles are mentioned
- Map seniority levels: C-level -> "Executive", VP -> "Executive", Director -> "Director", Manager -> "Manager", Senior -> "Senior"
- Map functions: Engineering/Tech -> "Engineering", Sales -> "Sales", Marketing -> "Marketing", etc.
- Set default stage percentages: finder_pct: 10, research_pct: 35, contacts_pct: 25, verify_pct: 20, synthesis_pct: 5, intent_pct: 5
- Default budget_cap_per_lead_usd to 1.50 unless specified
- Default contact targets: per_company_min: 3, per_company_max: 5
- Include standard required fields: ["domain","industry","employee_count_band","revenue_band","company_linkedin_url"]

EXAMPLE OUTPUT for "Target CTOs and VPs at SaaS companies with 100+ employees":
{{
  "personas": [
    {{
      "name": "CTO",
      "title_regex": ["^(Chief Technology Officer|CTO|Chief Technical Officer).*$"],
      "seniority": ["Executive"],
      "functions": ["Technology"]
    }},
    {{
      "name": "VP",
      "title_regex": ["^(VP|Vice President|V\\\\.P\\\\.).*$"],
      "seniority": ["Executive"],
      "functions": ["Technology"]
    }}
  ],
  "company_filters": {{
    "employee_count": {{"min": 100, "max": null}},
    "arr_usd": {{"min": null, "max": null}},
    "industries": ["SaaS"],
    "locations": null,
    "cities": null,
    "states": null,
    "countries": null,
    "founded_year_min": null,
    "founded_year_max": null,
    "company_types": ["SaaS"],
    "technologies": null,
    "funding_stage": null,
    "total_funding_min": null,
    "total_funding_max": null,
    "company_size": null,
    "keywords": ["SaaS"],
    "exclude_keywords": null
  }},
  "signals_required": [],
  "negative_keywords": [],
  "required_fields_for_qualify": ["domain","industry","employee_count_band","revenue_band","company_linkedin_url"],
  "contact_persona_targets": {{
    "per_company_min": 3,
    "per_company_max": 5,
    "persona_order": ["CTO", "VP"]
  }},
  "stage_overrides": {{
    "budget_cap_per_lead_usd": 1.50,
    "finder_pct": 10,
    "research_pct": 35,
    "contacts_pct": 25,
    "verify_pct": 20,
    "synthesis_pct": 5,
    "intent_pct": 5
  }}
}}

NOW convert this ICP description:
{icp_text}

RESPOND WITH ONLY THE JSON - START WITH {{ AND END WITH }}:"""

    def create_routing_prompt(self, icp_text: str, normalized_icp_json: Dict[str, Any]) -> str:
        """Create a prompt for routing decision after ICP normalization."""
        import json
        icp_json_str = json.dumps(normalized_icp_json, indent=2)
        
        return f"""You are a routing judge for a sales-research system. 
Decide whether the request can be satisfied by structured firmographic APIs (Structured), 
needs a small probe then decide (Hybrid), or requires open-web Deep Research.

Return ONLY valid JSON with this schema:
{{
  "scores": {{
    "specificity": 0.0,
    "mappability": 0.0,
    "stability": 0.0
  }},
  "route": "structured | hybrid | deep_research",
  "route_reason": "string",
  "research_plan": {{
    "themes": ["string"],
    "hard_filters": {{
      "employee_count": {{"min": null, "max": null}},
      "founded_year_min": null,
      "countries": [],
      "industries": []
    }},
    "time_windows": {{
      "recency_months_default": 12,
      "jobs_months": 3,
      "tech_adoption_months": 18
    }},
    "evidence_requirements": [
      "funding|>=1_tier1_source|<=12mo",
      "headcount|source:any|required",
      "founded_year|source:any|required"
    ],
    "seed_strategies": ["events_news", "careers", "docs_marketplaces"],
    "personas": ["CEO"],
    "notes": "optional guidance to specialists"
  }}
}}

Definitions:
- Specificity (0–1): how fully the ICP specifies key filters (industry, size, geo, persona).
- Mappability (0–1): fraction of requested constraints that map to common firmographic API fields 
  (industry/size/geo/persona/ARR/basic tech tags). Penalize time-bound events, certifications, tech-adoption, hiring, partnerships.
- Stability (0–1): presence of temporal/volatile demands (recent, launched, hiring now, funding, leadership changes, certifications-in-progress, stack).

Routing rule to apply:
- If Specificity ≥ 0.8 AND Mappability ≥ 0.7 AND Stability ≤ 0.3 → "structured"
- If Specificity < 0.6 OR Mappability < 0.5 OR Stability ≥ 0.5 → "deep_research"
- Else → "hybrid"

For "research_plan":
- themes: extract key concepts/keywords (synonyms OK).
- hard_filters: copy only enforceable, deterministic gates from the ICP.
- time_windows: defaults as provided unless the ICP states otherwise.
- evidence_requirements: derive from the ICP demands (e.g., "funding", "hiring", "tech_stack", "compliance"); 
  always require headcount and founded_year sources if those filters exist.
- seed_strategies: choose among ["events_news","careers","docs_marketplaces","broad_web"] based on what's needed.
- personas: use the requested personas; if multiple, preserve order of importance.

Now judge this request.

RAW_PROMPT:
<<<{icp_text}>>>

ICP_JSON:
<<<{icp_json_str}>>>

RESPOND WITH ONLY THE JSON - START WITH {{ AND END WITH }}:"""

    async def call_api(self, prompt: str) -> Dict[str, Any]:
        """Call MISTRAL API to process the ICP normalization."""
        if not self.api_key:
            raise Exception("MISTRAL API key not configured")
        
        # Rate limiting: ensure minimum time between calls
        current_time = time.time()
        time_since_last_call = current_time - self.last_call_time
        
        if time_since_last_call < self.rate_limit_seconds:
            wait_time = self.rate_limit_seconds - time_since_last_call
            print(f"[MISTRAL] Rate limiting: waiting {wait_time:.1f} seconds...")
            import asyncio
            await asyncio.sleep(wait_time)
        
        self.last_call_time = time.time()
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        
        payload = {
            "model": "mistral-small-latest",
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": 0.1,
            "max_tokens": 2000
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.api_url, 
                headers=headers, 
                json=payload, 
                timeout=settings.DEFAULT_TIMEOUT
            )
            response.raise_for_status()
            
            result = response.json()
            content = result["choices"][0]["message"]["content"].strip()
            
            # Log the raw response for debugging
            print(f"[MISTRAL] Raw response content: {content[:1000]}...")
            
            # Clean and parse JSON response
            return self._parse_json_response(content)
    
    def _parse_json_response(self, content: str) -> Dict[str, Any]:
        """Parse and clean JSON response from Mistral."""
        # First, try to clean the content by removing markdown code blocks
        cleaned_content = content.strip()
        
        # Remove markdown code block markers
        if cleaned_content.startswith('```json'):
            cleaned_content = cleaned_content[7:]  # Remove ```json
        elif cleaned_content.startswith('```'):
            cleaned_content = cleaned_content[3:]   # Remove ```
            
        if cleaned_content.endswith('```'):
            cleaned_content = cleaned_content[:-3]  # Remove closing ```
            
        cleaned_content = cleaned_content.strip()
        
        # Try to parse the cleaned JSON response
        try:
            json_content = json.loads(cleaned_content)
            print(f"[MISTRAL] Successfully parsed cleaned JSON with keys: {list(json_content.keys()) if isinstance(json_content, dict) else 'Not a dict'}")
            return json_content
        except json.JSONDecodeError as e:
            print(f"[MISTRAL] Cleaned JSON parsing failed: {str(e)}")
            
            # Fallback: Try to extract JSON using regex patterns
            import re
            
            # Try to find complete JSON structure
            json_patterns = [
                r'```json\s*(\{.*\})\s*```',  # JSON in code blocks (greedy match)
                r'```\s*(\{.*\})\s*```',      # JSON in generic code blocks (greedy match)
                r'(\{.*\})',  # Any JSON structure (greedy match)
            ]
            
            for pattern in json_patterns:
                json_match = re.search(pattern, content, re.DOTALL)
                if json_match:
                    json_str = json_match.group(1) if len(json_match.groups()) > 0 else json_match.group()
                    try:
                        parsed_json = json.loads(json_str)
                        print(f"[MISTRAL] Successfully extracted JSON with pattern: {pattern}")
                        print(f"[MISTRAL] Extracted JSON keys: {list(parsed_json.keys()) if isinstance(parsed_json, dict) else 'Not a dict'}")
                        return parsed_json
                    except json.JSONDecodeError as parse_error:
                        print(f"[MISTRAL] Pattern {pattern} matched but JSON parsing failed: {parse_error}")
                        continue
            
            # If all patterns fail, provide a detailed error
            print(f"[MISTRAL] All JSON parsing attempts failed. Content: {content}")
            raise ValueError(f"No valid JSON found in response. Content received: {content[:200]}...")
