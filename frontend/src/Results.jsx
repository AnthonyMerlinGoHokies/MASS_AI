import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Results.css'

function Results() {
  const navigate = useNavigate()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [companies, setCompanies] = useState([])
  const [leads, setLeads] = useState([])
  const [sessionId, setSessionId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load data from localStorage
    const companiesData = localStorage.getItem('sios-companies')
    const leadsData = localStorage.getItem('sios-leads')
    const sessionIdData = localStorage.getItem('sios-session-id')

    if (companiesData) {
      const parsedCompanies = JSON.parse(companiesData)
      setCompanies(parsedCompanies)
    } else {
      // Fallback to sample data if no real data
      setCompanies(sampleCompanies)
    }

    if (leadsData) {
      setLeads(JSON.parse(leadsData))
    }

    if (sessionIdData) {
      setSessionId(sessionIdData)
    }

    setIsLoading(false)
  }, [])

  // Sample fallback data
  const sampleCompanies = [
    {
      company_name: "TechCorp Solutions",
      domain: "techcorp.com",
      industry: "Software Development",
      founded_year: "2015",
      headquarters: "San Francisco, CA",
      description: "Leading provider of enterprise software solutions",
      company_linkedin_url: "linkedin.com/company/techcorp",
      employee_count: "250-500",
      revenue: "$50M-$100M",
      technologies: "AWS, React, Python, Kubernetes",
      tech_spend: "$5M annually",
      it_budget: "$8M annually",
      recent_news: "Recently launched AI-powered analytics platform",
      job_openings: "15 open positions",
      growth_signals: "High - 40% YoY growth",
      ai_org_signals: "Strong - Dedicated AI team",
      ai_tech_signals: "Active ML implementation",
      ai_hiring_signals: "5 AI/ML positions open",
      intent_score: "85/100",
      intent_horizon: "3-6 months",
      signal_evidence: "Multiple AI job postings, recent funding"
    },
    {
      company_name: "DataDrive Inc",
      domain: "datadrive.io",
      industry: "Data Analytics",
      founded_year: "2018",
      headquarters: "Austin, TX",
      description: "Big data analytics and business intelligence platform",
      company_linkedin_url: "linkedin.com/company/datadrive",
      employee_count: "100-250",
      revenue: "$20M-$50M",
      technologies: "Azure, Angular, Java, Docker",
      tech_spend: "$3M annually",
      it_budget: "$5M annually",
      recent_news: "Secured Series B funding of $25M",
      job_openings: "12 open positions",
      growth_signals: "Medium - 25% YoY growth",
      ai_org_signals: "Emerging - Building AI capabilities",
      ai_tech_signals: "Exploratory phase",
      ai_hiring_signals: "3 Data Science positions open",
      intent_score: "72/100",
      intent_horizon: "6-12 months",
      signal_evidence: "Funding announcement, expansion plans"
    },
    {
      company_name: "CloudNative Systems",
      domain: "cloudnative.tech",
      industry: "Cloud Infrastructure",
      founded_year: "2016",
      headquarters: "Seattle, WA",
      description: "Cloud-native infrastructure and DevOps solutions",
      company_linkedin_url: "linkedin.com/company/cloudnative",
      employee_count: "500-1000",
      revenue: "$100M+",
      technologies: "GCP, Vue.js, Go, Terraform",
      tech_spend: "$12M annually",
      it_budget: "$18M annually",
      recent_news: "Acquired startup to expand AI offerings",
      job_openings: "25 open positions",
      growth_signals: "Very High - 60% YoY growth",
      ai_org_signals: "Advanced - AI Center of Excellence",
      ai_tech_signals: "Production AI systems",
      ai_hiring_signals: "10 AI/ML positions open",
      intent_score: "92/100",
      intent_horizon: "1-3 months",
      signal_evidence: "Recent acquisition, aggressive hiring, new products"
    }
  ]

  const dataFields = [
    { key: 'company_name', label: 'Company Name' },
    { key: 'domain', label: 'Domain' },
    { key: 'industry', label: 'Industry' },
    { key: 'founded_year', label: 'Founded Year' },
    { key: 'headquarters', label: 'Headquarters' },
    { key: 'description', label: 'Description' },
    { key: 'company_linkedin_url', label: 'LinkedIn URL' },
    { key: 'employee_count', label: 'Employee Count' },
    { key: 'revenue', label: 'Revenue' },
    { key: 'technologies', label: 'Technologies' },
    { key: 'tech_spend', label: 'Tech Spend' },
    { key: 'it_budget', label: 'IT Budget' },
    { key: 'recent_news', label: 'Recent News' },
    { key: 'job_openings', label: 'Job Openings' },
    { key: 'growth_signals', label: 'Growth Signals' },
    { key: 'ai_org_signals', label: 'AI Org Signals' },
    { key: 'ai_tech_signals', label: 'AI Tech Signals' },
    { key: 'ai_hiring_signals', label: 'AI Hiring Signals' },
    { key: 'intent_score', label: 'Intent Score' },
    { key: 'intent_horizon', label: 'Intent Horizon' },
    { key: 'signal_evidence', label: 'Signal Evidence' }
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % companies.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + companies.length) % companies.length)
  }

  const goToSlide = (index) => {
    setCurrentSlide(index)
  }

  if (isLoading) {
    return (
      <div className="results-page">
        <div className="results-background">
          <div style={{ textAlign: 'center', color: 'white' }}>
            <div className="typing-indicator" style={{ justifyContent: 'center', padding: '2rem' }}>
              <span></span>
              <span></span>
              <span></span>
            </div>
            <p>Loading results...</p>
          </div>
        </div>
      </div>
    )
  }

  if (companies.length === 0) {
    return (
      <div className="results-page">
        <div className="results-background">
          <div style={{ textAlign: 'center', color: 'white', maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '1rem' }}>No Results Yet</h2>
            <p style={{ marginBottom: '2rem', opacity: 0.8 }}>
              Complete an ICP conversation and click "Start Process" to generate companies and leads.
            </p>
            <button 
              className="btn-primary"
              onClick={() => navigate('/')}
              style={{ padding: '0.75rem 2rem', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
            >
              Go Back to Agent
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="results-page">
      <aside className="sidebar">
        <div className="sidebar-content">
          <div className="sidebar-logo" onClick={() => navigate('/')}>
            <svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="25" cy="25" r="4" fill="#a855f7" />
              <circle cx="16" cy="14" r="2.5" fill="#c084fc" />
              <circle cx="34" cy="14" r="2.5" fill="#c084fc" />
              <circle cx="38" cy="25" r="2.5" fill="#c084fc" />
              <circle cx="34" cy="36" r="2.5" fill="#c084fc" />
              <circle cx="16" cy="36" r="2.5" fill="#c084fc" />
              <circle cx="12" cy="25" r="2.5" fill="#c084fc" />
              <line x1="25" y1="25" x2="16" y2="14" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="25" y1="25" x2="34" y2="14" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="25" y1="25" x2="38" y2="25" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="25" y1="25" x2="34" y2="36" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="25" y1="25" x2="16" y2="36" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="25" y1="25" x2="12" y2="25" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          
          <nav className="sidebar-nav">
            <button className="sidebar-btn" onClick={() => navigate('/')} aria-label="Home" title="Home">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </button>
          </nav>
        </div>
      </aside>

      <div className="results-background">
        <div className="results-container">
          <header className="results-header">
            <button className="back-btn" onClick={() => navigate('/')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <h1 className="results-title">Company Intelligence Report</h1>
            <p className="results-subtitle">
              {companies.length} companies analyzed
              {leads.length > 0 && ` • ${leads.length} leads generated`}
              {sessionId && ` • Session: ${sessionId}`}
            </p>
          </header>

          <div className="carousel-container">
            <button className="carousel-btn prev" onClick={prevSlide} aria-label="Previous">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            <div className="card-slide">
              <div className="card-header">
                <div className="company-title-section">
                  <h2 className="company-name">{companies[currentSlide].company_name}</h2>
                </div>
                <p className="company-domain">{companies[currentSlide].domain}</p>
              </div>

              <div className="card-body">
                <div className="data-table">
                  {dataFields.map((field) => (
                    <div key={field.key} className="data-row">
                      <div className="data-label">{field.label}</div>
                      <div className="data-value">{companies[currentSlide][field.key]}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button className="carousel-btn next" onClick={nextSlide} aria-label="Next">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          <div className="carousel-dots">
            {companies.map((_, index) => (
              <button
                key={index}
                className={`dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Results

