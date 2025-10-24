/**
 * API client for connecting to the SIOS backend
 */
import { config } from './config';

const API_BASE_URL = config.api.baseUrl;

// Request throttling to prevent resource exhaustion
let requestQueue: Promise<any>[] = [];
const MAX_CONCURRENT_REQUESTS = 2;

// Data transformation function to map backend Company schema to frontend display format
export function transformBackendCompany(company: Company): Company {
  return {
    ...company,
    // Map backend fields to frontend expectations
    employees: company.employee_count,
    linkedIn: company.company_linkedin_url || company.linkedin_url,
    value: company.revenue || `$${company.employee_count || 'N/A'}K`,
    stage: 2, // Default stage for new companies
    // Transform contacts from Hunter.io format to frontend format
    contacts: (company.contacts || []).map(contact => ({
      name: `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || contact.email,
      role: contact.job_title || 'Contact',
      email: contact.email,
      phone: '', // Not provided by backend
      linkedIn: contact.linkedin_url || '', // Map LinkedIn URL from backend
      disc: '', // Not provided by backend
      research: '', // Not provided by backend
      personalityTraits: [],
      recentActivity: ''
    })),
    // Add summary from description
    summary: company.description || '',
    tags: [], // Generate from growth_signals if available
    // Structure research data
    research: {
      description: company.description || '',
      painPoints: [], // Not provided by backend
      recentNews: company.recent_news || [],
      techStack: company.technologies || [],
      competitors: [],
      decisionProcess: '',
      budget: '',
      timeline: ''
    }
  };
}

export interface ConversationMessage {
  role: 'user' | 'agent' | 'system';
  content: string;
  timestamp?: string;
}

export interface ConversationState {
  known_fields: Record<string, any>;
  missing_fields: string[];
  invalid_fields: Array<{ field: string; error: string }>;
  turn_count: number;
  confidence_score: number;
  max_turns: number;
}

export interface ConversationStartRequest {
  initial_text: string;
  mode?: 'auto' | 'conversational' | 'quick';
  max_turns?: number;
}

export interface ConversationStartResponse {
  conversation_id: string;
  session_id: string;
  needs_conversation: boolean;
  message?: string;
  current_state: ConversationState;
  icp_config?: Record<string, any>;
}

export interface ConversationRespondRequest {
  answer: string;
}

export interface ConversationRespondResponse {
  conversation_id: string;
  needs_more_info: boolean;
  message?: string;
  current_state: ConversationState;
  progress_percentage: number;
  icp_config?: Record<string, any>;
}

export interface ConversationStatusResponse {
  conversation_id: string;
  session_id: string;
  turn_count: number;
  is_complete: boolean;
  progress_percentage: number;
  known_fields: Record<string, any>;
  missing_fields: string[];
  messages: ConversationMessage[];
}

export interface Lead {
  contact_first_name?: string;
  contact_last_name?: string;
  contact_title?: string;
  contact_company?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_linkedin_url?: string;
  contact_twitter?: string;
  contact_location?: string;
  contact_recent_activity?: string;
  contact_published_content?: string;
  matched_persona?: string;
  persona_confidence?: number;
  apollo_id?: string;
}

export interface SimpleCompany {
  id?: string;
  organization_id?: string;
  name?: string;
  domain?: string;
  contacts?: Array<{
    email: string;
    first_name?: string;
    last_name?: string;
    job_title?: string;
    type?: string;
    confidence?: number;
    pattern?: string;
  }>;
}

export interface LeadsRequest {
  companies: SimpleCompany[];
  personas?: Array<{
    name: string;
    title_regex?: string[];
    seniority?: string[];
    functions?: string[];
  }>;
  max_leads_per_company?: number;
  session_id?: string;
}

export interface LeadsResponse {
  success: boolean;
  leads: Lead[];
  total_leads: number;
  companies_processed: number;
  error?: string;
}

export interface Company {
  id?: string;
  organization_id?: string;
  name: string;
  domain?: string;
  industry?: string;
  founded_year?: number;
  headquarters?: string;
  description?: string;
  company_linkedin_url?: string;
  employee_count?: number;
  specialities?: string[];
  revenue?: string;
  technologies?: string[];
  tech_spend?: string;
  it_budget?: string;
  recent_news?: string[];
  job_openings?: number;
  growth_signals?: string[];
  ai_org_signals?: string[];
  ai_tech_signals?: string[];
  ai_hiring_signals?: string[];
  intent_score?: number;
  intent_horizon?: string;
  signal_evidence?: string[];
  location?: string;
  revenue_range?: string;
  linkedin_url?: string;
  twitter_url?: string;
  facebook_url?: string;
  instagram_url?: string;
  youtube_url?: string;
  github_url?: string;
  coresignal_enriched?: boolean;
  coresignal_data?: Record<string, any>;
  enrichment_error?: string;
  contacts?: Array<{
    email: string;
    first_name?: string;
    last_name?: string;
    job_title?: string;
    type?: string;
    confidence?: number;
    pattern?: string;
    linkedin_url?: string;
    // Transformed fields for frontend display
    name?: string;
    role?: string;
    disc?: string;
    phone?: string;
    linkedIn?: string;
    research?: string;
    personalityTraits?: string[];
    recentActivity?: string;
  }>;
  hunterio_pattern?: string;
  // Transformed fields for frontend display
  employees?: number;
  linkedIn?: string;
  value?: string;
  stage?: number;
  summary?: string;
  tags?: string[];
  research?: {
    description?: string;
    painPoints?: string[];
    recentNews?: string[];
    techStack?: string[];
    competitors?: string[];
    decisionProcess?: string;
    budget?: string;
    timeline?: string;
  };
}

export interface ICPConfig {
  personas?: Array<{
    name: string;
    title_regex?: string[];
    seniority?: string[];
    functions?: string[];
  }>;
  company_filters?: {
    industries?: string[];
    employee_count?: { min?: number; max?: number };
    arr_usd?: { min?: number; max?: number };
    technologies?: string[];
    funding_stage?: string[];
    company_size?: string;
    locations?: string[];
    cities?: string[];
    states?: string[];
    countries?: string[];
    founded_year_min?: number;
  };
  signals_required?: string[];
  negative_keywords?: string[];
  required_fields_for_qualify?: string[];
  contact_persona_targets?: {
    per_company_min?: number;
    per_company_max?: number;
    persona_order?: string[];
  };
  stage_overrides?: {
    budget_cap_per_lead_usd?: number;
    finder_pct?: number;
    research_pct?: number;
    contacts_pct?: number;
    verify_pct?: number;
    synthesis_pct?: number;
    intent_pct?: number;
  };
}

export interface CompaniesRequest {
  icp_config?: ICPConfig;
  search_payload?: Record<string, any>;
  limit?: number;
  session_id?: string;
}

export interface CompaniesResponse {
  success: boolean;
  companies: Company[];
  apollo_only_companies?: Company[];
  used_mock?: boolean;
  response_count?: number;
  request_payload?: Record<string, any>;
  raw_companies?: Record<string, any>[];
  error?: string;
}

class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Wait for available slot in request queue
  while (requestQueue.length >= MAX_CONCURRENT_REQUESTS) {
    await Promise.race(requestQueue);
  }
  
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const requestPromise = (async () => {
    try {
      const config: RequestInit = {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      };

      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new APIError(response.status, errorText || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      
      // Network or other errors
      throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      // Remove from queue when done
      const index = requestQueue.indexOf(requestPromise);
      if (index > -1) {
        requestQueue.splice(index, 1);
      }
    }
  })();
  
  requestQueue.push(requestPromise);
  return requestPromise;
}

export const api = {
  // Conversation endpoints
  conversation: {
    async start(request: ConversationStartRequest): Promise<ConversationStartResponse> {
      return apiRequest('/icp/conversation/start', {
        method: 'POST',
        body: JSON.stringify(request),
      });
    },

    async respond(conversationId: string, request: ConversationRespondRequest): Promise<ConversationRespondResponse> {
      return apiRequest(`/icp/conversation/${conversationId}/respond`, {
        method: 'POST',
        body: JSON.stringify(request),
      });
    },

    async getStatus(conversationId: string): Promise<ConversationStatusResponse> {
      return apiRequest(`/icp/conversation/${conversationId}/status`);
    },

    async finalize(conversationId: string, forceComplete = false): Promise<{ success: boolean; session_id: string; icp_config: Record<string, any>; missing_fields: string[]; warning?: string }> {
      return apiRequest(`/icp/conversation/${conversationId}/finalize`, {
        method: 'POST',
        body: JSON.stringify({ force_complete: forceComplete }),
      });
    },
  },

  // Company endpoints
  companies: {
    async search(request: CompaniesRequest): Promise<CompaniesResponse> {
      return apiRequest('/companies', {
        method: 'POST',
        body: JSON.stringify(request),
      });
    },
  },

  // Lead endpoints
  leads: {
    async get(request: LeadsRequest): Promise<LeadsResponse> {
      return apiRequest('/leads', {
        method: 'POST',
        body: JSON.stringify(request),
      });
    },
  },

  // Health check
  async health(): Promise<{ message: string }> {
    return apiRequest('/health');
  },
};

export { APIError };
