import { useState, useCallback } from 'react';
import { api, CompaniesRequest, CompaniesResponse, Company, ICPConfig, transformBackendCompany } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export interface UseCompaniesState {
  companies: Company[];
  isLoading: boolean;
  error: string | null;
  responseCount: number;
  usedMock: boolean;
}

export const useCompanies = () => {
  const [state, setState] = useState<UseCompaniesState>({
    companies: [],
    isLoading: false,
    error: null,
    responseCount: 0,
    usedMock: false,
  });

  const { toast } = useToast();

  const searchCompanies = useCallback(async (request: CompaniesRequest) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response: CompaniesResponse = await api.companies.search(request);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to search companies');
      }

      setState(prev => ({
        ...prev,
        companies: response.companies.map(transformBackendCompany),
        responseCount: response.response_count || 0,
        usedMock: response.used_mock || false,
        isLoading: false,
        error: null,
      }));

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to search companies';
      console.error('Error searching companies:', error);
      
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

      // Don't throw the error to prevent cascading failures
      // Return empty response instead
      return {
        success: false,
        error: errorMessage,
        companies: [],
        response_count: 0,
        used_mock: false
      };
    }
  }, [toast]);

  const clearCompanies = useCallback(() => {
    setState({
      companies: [],
      isLoading: false,
      error: null,
      responseCount: 0,
      usedMock: false,
    });
  }, []);

  const addCompany = useCallback((company: Company) => {
    setState(prev => ({
      ...prev,
      companies: [...prev.companies, company],
      responseCount: prev.responseCount + 1,
    }));
  }, []);

  const updateCompany = useCallback((companyId: string, updates: Partial<Company>) => {
    setState(prev => ({
      ...prev,
      companies: prev.companies.map(company => 
        company.id === companyId || company.organization_id === companyId 
          ? { ...company, ...updates } 
          : company
      ),
    }));
  }, []);

  const removeCompany = useCallback((companyId: string) => {
    setState(prev => ({
      ...prev,
      companies: prev.companies.filter(company => 
        company.id !== companyId && company.organization_id !== companyId
      ),
      responseCount: Math.max(0, prev.responseCount - 1),
    }));
  }, []);

  // Helper function to generate mock companies for demo purposes
  const generateMockCompanies = useCallback((count = 10, icpConfig?: ICPConfig): Company[] => {
    const industries = icpConfig?.company_filters?.industries || ['SaaS', 'FinTech', 'Healthcare', 'E-commerce'];
    const technologies = icpConfig?.company_filters?.technologies || ['React', 'Node.js', 'AWS', 'Python'];
    const locations = icpConfig?.company_filters?.locations || ['San Francisco', 'New York', 'Austin', 'Seattle'];
    
    const companies: Company[] = [];
    
    for (let i = 0; i < count; i++) {
      const company: Company = {
        id: `company_${i}`,
        organization_id: `apollo_org_${i}`,
        name: `Company ${i + 1}`,
        domain: `company${i + 1}.com`,
        industry: industries[Math.floor(Math.random() * industries.length)],
        founded_year: Math.floor(Math.random() * 20) + 2004, // 2004-2024
        headquarters: locations[Math.floor(Math.random() * locations.length)],
        description: `A leading ${industries[Math.floor(Math.random() * industries.length)]} company providing innovative solutions.`,
        company_linkedin_url: `https://linkedin.com/company/company${i + 1}`,
        employee_count: Math.floor(Math.random() * 500) + 50, // 50-550 employees
        specialities: technologies.slice(0, Math.floor(Math.random() * 3) + 1),
        revenue: `$${Math.floor(Math.random() * 50) + 10}M`,
        technologies: technologies.slice(0, Math.floor(Math.random() * 4) + 1),
        job_openings: Math.floor(Math.random() * 20) + 1,
        growth_signals: ['Hiring', 'Funding', 'Product Launch'],
        intent_score: Math.random() * 0.5 + 0.5, // 0.5 to 1.0
        intent_horizon: '30 days',
        signal_evidence: ['Website traffic increase', 'Job postings', 'Social media activity'],
        location: locations[Math.floor(Math.random() * locations.length)],
        revenue_range: '$10M-$50M',
        linkedin_url: `https://linkedin.com/company/company${i + 1}`,
        twitter_url: `https://twitter.com/company${i + 1}`,
        coresignal_enriched: Math.random() > 0.5,
      };
      
      companies.push(company);
    }
    
    return companies;
  }, []);

  return {
    ...state,
    searchCompanies,
    clearCompanies,
    addCompany,
    updateCompany,
    removeCompany,
    generateMockCompanies,
  };
};
