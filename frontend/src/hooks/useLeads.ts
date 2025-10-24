import { useState, useCallback } from 'react';
import { api, LeadsRequest, LeadsResponse, Lead, SimpleCompany } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export interface UseLeadsState {
  leads: Lead[];
  isLoading: boolean;
  error: string | null;
  totalLeads: number;
  companiesProcessed: number;
}

export const useLeads = () => {
  const [state, setState] = useState<UseLeadsState>({
    leads: [],
    isLoading: false,
    error: null,
    totalLeads: 0,
    companiesProcessed: 0,
  });

  const { toast } = useToast();

  const fetchLeads = useCallback(async (request: LeadsRequest) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response: LeadsResponse = await api.leads.get(request);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch leads');
      }

      setState(prev => ({
        ...prev,
        leads: response.leads,
        totalLeads: response.total_leads,
        companiesProcessed: response.companies_processed,
        isLoading: false,
        error: null,
      }));

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch leads';
      console.error('Error fetching leads:', error);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });

      throw error;
    }
  }, [toast]);

  const clearLeads = useCallback(() => {
    setState({
      leads: [],
      isLoading: false,
      error: null,
      totalLeads: 0,
      companiesProcessed: 0,
    });
  }, []);

  const addLeads = useCallback((newLeads: Lead[]) => {
    setState(prev => ({
      ...prev,
      leads: [...prev.leads, ...newLeads],
      totalLeads: prev.totalLeads + newLeads.length,
    }));
  }, []);

  const updateLead = useCallback((leadId: string, updates: Partial<Lead>) => {
    setState(prev => ({
      ...prev,
      leads: prev.leads.map(lead => 
        lead.apollo_id === leadId ? { ...lead, ...updates } : lead
      ),
    }));
  }, []);

  const removeLead = useCallback((leadId: string) => {
    setState(prev => ({
      ...prev,
      leads: prev.leads.filter(lead => lead.apollo_id !== leadId),
      totalLeads: Math.max(0, prev.totalLeads - 1),
    }));
  }, []);

  // Helper function to generate leads from companies (for demo purposes)
  const generateLeadsFromCompanies = useCallback((companies: SimpleCompany[], maxPerCompany = 5): Lead[] => {
    const leads: Lead[] = [];
    
    companies.forEach((company, companyIndex) => {
      const numLeads = Math.min(maxPerCompany, Math.floor(Math.random() * 5) + 1);
      
      for (let i = 0; i < numLeads; i++) {
        const lead: Lead = {
          contact_first_name: `Contact${i + 1}`,
          contact_last_name: `Person${companyIndex + 1}`,
          contact_title: ['CEO', 'CTO', 'VP Engineering', 'Director', 'Manager'][Math.floor(Math.random() * 5)],
          contact_company: company.name || `Company ${companyIndex + 1}`,
          contact_email: `contact${i + 1}@${company.domain || 'company.com'}`,
          contact_phone: `+1-555-${Math.floor(Math.random() * 9000) + 1000}`,
          contact_linkedin_url: `https://linkedin.com/in/contact${i + 1}-${companyIndex + 1}`,
          contact_location: ['San Francisco', 'New York', 'Austin', 'Seattle', 'Boston'][Math.floor(Math.random() * 5)],
          matched_persona: 'Decision Maker',
          persona_confidence: Math.random() * 0.4 + 0.6, // 0.6 to 1.0
          apollo_id: `lead_${companyIndex}_${i}`,
        };
        
        leads.push(lead);
      }
    });
    
    return leads;
  }, []);

  return {
    ...state,
    fetchLeads,
    clearLeads,
    addLeads,
    updateLead,
    removeLead,
    generateLeadsFromCompanies,
  };
};
