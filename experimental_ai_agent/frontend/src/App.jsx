import { useState } from 'react'
import axios from 'axios'
import { Send, Loader2, CheckCircle, AlertCircle, FileText, Settings, Download } from 'lucide-react'
import CompaniesPanel from './components/CompaniesPanel'
import ICPResults from './components/ICPResults'
import './App.css'

const API_BASE_URL = 'http://localhost:8000'

function App() {
  const [icpText, setIcpText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [companies, setCompanies] = useState([])
  const [apolloOnlyCompanies, setApolloOnlyCompanies] = useState([])
  const [leads, setLeads] = useState([])
  const [leadsLoading, setLeadsLoading] = useState(false)
  const [leadsError, setLeadsError] = useState(null)
  const [usedMock, setUsedMock] = useState(false)
  const [apolloRequestInfo, setApolloRequestInfo] = useState(null)
  const [apolloError, setApolloError] = useState(null)
  const [icpError, setIcpError] = useState(null)

  // CSV Export Helper Functions
  const escapeCSVValue = (value) => {
    if (value === null || value === undefined) return ''
    const stringValue = String(value)
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`
    }
    return stringValue
  }

  const arrayToCSVString = (arr) => {
    if (!arr || !Array.isArray(arr)) return ''
    return arr.join('; ')
  }

  const exportCompaniesToCSV = () => {
    if (!companies || companies.length === 0) {
      alert('No companies to export')
      return
    }

    const headers = [
      'Organization ID',
      'Company Name',
      'Domain',
      'Industry',
      'Founded Year',
      'Headquarters',
      'Description',
      'Company LinkedIn',
      'Employee Count',
      'Revenue',
      'Technologies',
      'Tech Spend',
      'IT Budget',
      'Recent News',
      'Job Openings',
      'Growth Signals',
      'AI Org Signals',
      'AI Tech Signals',
      'AI Hiring Signals',
      'Intent Score',
      'Intent Horizon',
      'Signal Evidence',
      'CoreSignal Enriched',
      'Domain Source'
    ]

    const rows = companies.map(c => [
      escapeCSVValue(c.id),
      escapeCSVValue(c.name),
      escapeCSVValue(c.domain),
      escapeCSVValue(c.industry),
      escapeCSVValue(c.founded_year),
      escapeCSVValue(c.headquarters || c.location),
      escapeCSVValue(c.description),
      escapeCSVValue(c.company_linkedin_url || c.linkedin_url),
      escapeCSVValue(c.employee_count),
      escapeCSVValue(c.revenue || c.revenue_range),
      escapeCSVValue(arrayToCSVString(c.technologies?.map(t => typeof t === 'object' ? t.technology : t))),
      escapeCSVValue(c.tech_spend),
      escapeCSVValue(c.it_budget),
      escapeCSVValue(arrayToCSVString(c.recent_news)),
      escapeCSVValue(c.job_openings),
      escapeCSVValue(arrayToCSVString(c.growth_signals)),
      escapeCSVValue(arrayToCSVString(c.ai_org_signals)),
      escapeCSVValue(arrayToCSVString(c.ai_tech_signals)),
      escapeCSVValue(arrayToCSVString(c.ai_hiring_signals)),
      escapeCSVValue(c.intent_score ? Math.round(c.intent_score * 100) + '%' : ''),
      escapeCSVValue(c.intent_horizon),
      escapeCSVValue(arrayToCSVString(c.signal_evidence)),
      escapeCSVValue(c.coresignal_enriched ? 'Yes' : 'No'),
      escapeCSVValue(c.coresignal_data?.domain_source || '')
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    downloadCSV(csvContent, `companies_${new Date().toISOString().split('T')[0]}.csv`)
  }

  const exportLeadsToCSV = () => {
    if (!leads || leads.length === 0) {
      alert('No leads to export')
      return
    }

    const headers = [
      'First Name',
      'Last Name',
      'Title',
      'Company',
      'Email',
      'Phone',
      'LinkedIn',
      'Twitter',
      'Location',
      'Recent Activity',
      'Published Content',
      'Matched Persona'
    ]

    const rows = leads.map(l => [
      escapeCSVValue(l.contact_first_name),
      escapeCSVValue(l.contact_last_name),
      escapeCSVValue(l.contact_title),
      escapeCSVValue(l.contact_company),
      escapeCSVValue(l.contact_email),
      escapeCSVValue(l.contact_phone),
      escapeCSVValue(l.contact_linkedin_url),
      escapeCSVValue(l.contact_twitter),
      escapeCSVValue(l.contact_location),
      escapeCSVValue(l.contact_recent_activity),
      escapeCSVValue(l.contact_published_content),
      escapeCSVValue(l.matched_persona)
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    downloadCSV(csvContent, `leads_${new Date().toISOString().split('T')[0]}.csv`)
  }

  const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!icpText.trim()) return

    setIsLoading(true)
    setError(null)
    setResult(null)
    setCompanies([])
    setApolloOnlyCompanies([])
    setLeads([])
    setLeadsLoading(false)
    setLeadsError(null)
    setApolloError(null)
    setIcpError(null)

    try {
      const response = await axios.post(`${API_BASE_URL}/normalize-icp`, {
        icp_text: icpText
      })

      if (response.data.success) {
        setResult(response.data.icp_config)
        const sessionId = response.data.session_id;
        console.log('[ICP] Session ID:', sessionId)
        
        // Show warning if using fallback configuration
        if (response.data.error) {
          console.warn('[ICP] Using fallback configuration:', response.data.error)
          setIcpError(response.data.error)
        }
        // chain request to backend to fetch companies from Apollo
        try {
          // Build comprehensive organization search payload for Apollo using new format
          const filters = response.data.icp_config.company_filters
          const keywords = []
          
          // Build keywords from multiple sources
          if (filters?.industries) keywords.push(...filters.industries)
          if (filters?.keywords) keywords.push(...filters.keywords)
          if (filters?.technologies) keywords.push(...filters.technologies)
          
          const orgPayload = {
            page: 1,
            per_page: 10,
            // Note: Removed q_keywords for more precise targeting with specific fields
            
            // Employee count using new range format
            organization_num_employees_ranges: (filters?.employee_count?.min && filters?.employee_count?.max) 
              ? [`${filters.employee_count.min},${filters.employee_count.max}`] 
              : undefined,
              
            // Revenue using new range format
            organization_revenue_ranges: (filters?.arr_usd?.min && filters?.arr_usd?.max) 
              ? [`${filters.arr_usd.min},${filters.arr_usd.max}`] 
              : undefined,
              
            // Location filters
            organization_locations: filters?.cities || filters?.locations || undefined,
            
            // Industry filters
            q_organization_keyword_tags: filters?.industries || undefined,
            
            // Technology filters
            q_organization_technology_names: filters?.technologies || undefined,
            
            // Basic constraints
            prospected_by_current_team: false
          }
          
          // Remove undefined values
          Object.keys(orgPayload).forEach(key => {
            if (orgPayload[key] === undefined) {
              delete orgPayload[key]
            }
          })

          const companiesResp = await axios.post(`${API_BASE_URL}/companies`, {
            search_payload: orgPayload,
            session_id: sessionId
          })
          if (companiesResp.data?.success) {
            setCompanies(companiesResp.data.companies || [])
            setApolloOnlyCompanies(companiesResp.data.apollo_only_companies || [])
            setUsedMock(Boolean(companiesResp.data.used_mock))
            setApolloError(companiesResp.data.error || null)
            setApolloRequestInfo({
              request: companiesResp.data.request_payload || null,
              count: companiesResp.data.response_count || (companiesResp.data.companies?.length ?? 0)
            })
            console.log('[Apollo] Request sent:', companiesResp.data.request_payload)
            console.log('[Apollo] Companies received:', companiesResp.data.response_count || (companiesResp.data.companies?.length ?? 0))
            console.log('[Apollo] Used mock data:', Boolean(companiesResp.data.used_mock))
            console.log('[Apollo] Apollo-only companies:', companiesResp.data.apollo_only_companies?.length || 0)
            
            // Fetch leads from the companies we found
            if (companiesResp.data.companies && companiesResp.data.companies.length > 0) {
              setLeadsLoading(true)
              setLeadsError(null)
              try {
                // Create simplified company objects for leads API (including contacts for high-confidence lead enrichment)
                const simpleCompanies = companiesResp.data.companies.map(company => ({
                  id: company.id,
                  name: company.name,
                  domain: company.domain,
                  contacts: company.contacts || null
                }));
                
                const leadsResp = await axios.post(`${API_BASE_URL}/leads`, {
                  companies: simpleCompanies,
                  personas: response.data.icp_config.personas,
                  max_leads_per_company: 5,
                  session_id: sessionId
                })
                if (leadsResp.data?.success) {
                  setLeads(leadsResp.data.leads || [])
                  console.log('[Leads] Total leads found:', leadsResp.data.total_leads)
                  console.log('[Leads] Companies processed:', leadsResp.data.companies_processed)
                } else {
                  setLeadsError(leadsResp.data?.error || 'NO DATA AVAILABLE - Failed to fetch leads')
                  setLeads([])
                }
              } catch (leadsErr) {
                console.warn('Leads fetch failed:', leadsErr)
                setLeadsError('NO DATA AVAILABLE - Failed to fetch leads')
                setLeads([])
              } finally {
                setLeadsLoading(false)
              }
            } else {
              // No companies found
              setLeads([])
              setLeadsError('NO DATA AVAILABLE - No companies found to search for leads')
            }
          } else {
            // Companies API failed
            setCompanies([])
            setApolloOnlyCompanies([])
            setApolloError(companiesResp.data?.error || 'NO DATA AVAILABLE - Failed to fetch companies')
            setLeads([])
            setLeadsError('NO DATA AVAILABLE - Cannot fetch leads without companies')
            console.log('[Apollo] Companies API failed:', companiesResp.data?.error)
          }
        } catch (e) {
          // Handle companies API call failure
          console.warn('Companies fetch failed', e)
          setCompanies([])
          setApolloOnlyCompanies([])
          setApolloError('NO DATA AVAILABLE - Failed to connect to companies API')
          setLeads([])
          setLeadsError('NO DATA AVAILABLE - Cannot fetch leads without companies')
        }
      } else {
        setError(response.data.error || 'Unknown error occurred')
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to process ICP')
    } finally {
      setIsLoading(false)
    }
  }

  const clearResults = () => {
    setResult(null)
    setError(null)
    setIcpText('')
    setCompanies([])
    setApolloOnlyCompanies([])
    setUsedMock(false)
    setApolloRequestInfo(null)
    setApolloError(null)
    setIcpError(null)
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="header-title">
            <Settings className="header-icon" />
            <h1>ICP Normalizer</h1>
      </div>
          <p className="header-subtitle">
            Convert your Ideal Customer Profile into structured data using AI
        </p>
      </div>
      </header>

      <main className="main">
        <div className="container">
          <div className="input-section">
            <form onSubmit={handleSubmit} className="form">
              <div className="form-group">
                <label htmlFor="icp-text" className="label">
                  <FileText className="label-icon" />
                  Describe your Ideal Customer Profile
                </label>
                <textarea
                  id="icp-text"
                  value={icpText}
                  onChange={(e) => setIcpText(e.target.value)}
                  placeholder="Describe your ideal customer profile here...

Example: We target small to medium-sized SaaS companies with 10-50 employees, ARR between $1M-$10M, focused on AI/ML or tech services. Looking for CEOs, CTOs, and Sales Managers who are tech-forward and growth-focused. They should have recent hiring activity in AI/ML roles and show signs of scaling their technology infrastructure."
                  className="textarea"
                  rows="6"
                  disabled={isLoading}
                />
              </div>
              
              <div className="form-actions">
                <button
                  type="submit"
                  disabled={!icpText.trim() || isLoading}
                  className="btn btn-primary"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="btn-icon animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="btn-icon" />
                      Normalize ICP
                    </>
                  )}
                </button>
                
                {(result || error) && (
                  <button
                    type="button"
                    onClick={clearResults}
                    className="btn btn-secondary"
                  >
                    Clear Results
                  </button>
                )}
              </div>
            </form>
          </div>

          {error && (
            <div className="result-section">
              <div className="alert alert-error">
                <AlertCircle className="alert-icon" />
                <div>
                  <h3>Error</h3>
                  <p>{error}</p>
                </div>
              </div>
            </div>
          )}

          {result && (
            <div className="result-section">
              <div className="alert alert-success">
                <CheckCircle className="alert-icon" />
                <div>
                  <h3>ICP Successfully Normalized</h3>
                  <p>Your ICP has been converted to structured format.</p>
                </div>
              </div>

              {/* Export Buttons */}
              {(companies?.length > 0 || leads?.length > 0) && (
                <div className="export-actions">
                  <h4>
                    <Download size={20} />
                    Export Data
                  </h4>
                  {companies?.length > 0 && (
                    <button
                      onClick={exportCompaniesToCSV}
                      className="btn btn-secondary"
                      title="Download companies data as CSV"
                    >
                      <Download size={18} />
                      Export Companies ({companies.length})
                    </button>
                  )}
                  {leads?.length > 0 && (
                    <button
                      onClick={exportLeadsToCSV}
                      className="btn btn-secondary"
                      title="Download leads data as CSV"
                    >
                      <Download size={18} />
                      Export Leads ({leads.length})
                    </button>
                  )}
                </div>
              )}

              <div className="result-content">
                <div className="results-layout">
                  <div className="icp-section">
                    <ICPResults result={result} error={icpError} />
                  </div>
                  
                  {companies?.length > 0 && (
                    <div className="companies-section">
                      <CompaniesPanel 
                        companies={companies} 
                        apolloOnlyCompanies={apolloOnlyCompanies}
                        leads={leads}
                        leadsLoading={leadsLoading}
                        leadsError={leadsError}
                        apolloRequestInfo={apolloRequestInfo} 
                        usedMock={usedMock}
                        apolloError={apolloError}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App