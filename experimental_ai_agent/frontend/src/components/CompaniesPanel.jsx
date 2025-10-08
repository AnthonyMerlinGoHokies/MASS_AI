import { ExternalLink } from 'lucide-react'

export default function CompaniesPanel({ companies = [], apolloOnlyCompanies = [], leads = [], leadsLoading = false, leadsError = null, apolloRequestInfo, rawCompanies = [], usedMock = false, apolloError = null }) {
  // Show the panel if there are companies OR if there's an error to display
  if (companies.length === 0 && !apolloError && !leadsError) return null

  return (
    <div className="companies-panel">
      <h3 className="panel-title">
        Companies Found ({companies.length})
        {usedMock && <span className="mock-indicator"> (Mock Data)</span>}
      </h3>
      
      {apolloError && (
        <div className="apollo-error-info">
          <strong>Error:</strong> {apolloError}
        </div>
      )}
      
      {/* Show message when no companies are found */}
      {companies.length === 0 && apolloError && (
        <div className="no-data-message">
          <p>{apolloError}</p>
        </div>
      )}
      
      {apolloRequestInfo?.request && (
        <div className="search-filters-info">
          <div><strong>Keywords:</strong> {
            (() => {
              const keywords = [];
              if (apolloRequestInfo.request.q_organization_keyword_tags) {
                keywords.push(...apolloRequestInfo.request.q_organization_keyword_tags);
              }
              if (apolloRequestInfo.request.q_organization_technology_names) {
                keywords.push(...apolloRequestInfo.request.q_organization_technology_names);
              }
              return keywords.length > 0 ? keywords.join(', ') : '—';
            })()
          }</div>
          <div><strong>Employees:</strong> {
            (() => {
              const empRanges = apolloRequestInfo.request.organization_num_employees_ranges;
              if (empRanges && empRanges.length > 0) {
                const range = empRanges[0].split(',');
                return `${parseInt(range[0]).toLocaleString()} - ${parseInt(range[1]).toLocaleString()}`;
              }
              return '—';
            })()
          }</div>
          <div><strong>Revenue:</strong> {
            (() => {
              const revRanges = apolloRequestInfo.request.organization_revenue_ranges;
              if (revRanges && revRanges.length > 0) {
                const range = revRanges[0].split(',');
                return `$${parseInt(range[0]).toLocaleString()} - $${parseInt(range[1]).toLocaleString()}`;
              }
              return '$— - $—';
            })()
          }</div>
        </div>
      )}

      {/* Only show comparison tables when there are companies */}
      {companies.length > 0 && (
        <div className="comparison-container">
        <div className="comparison-section">
          <h4 className="section-title">Apollo Data Only</h4>
          <div className="table-wrapper">
            <table className="companies-table">
              <thead>
                <tr>
                  <th>Organization ID</th>
                  <th>Company Name</th>
                  <th>Domain</th>
                  <th>Industry</th>
                  <th>Founded Year</th>
                  <th>Headquarters</th>
                  <th>Description</th>
                  <th>Company LinkedIn</th>
                  <th>Employee Count</th>
                  <th>Revenue</th>
                  <th>Technologies</th>
                  <th>Tech Spend</th>
                  <th>IT Budget</th>
                  <th>Recent News</th>
                  <th>Job Openings</th>
                  <th>Growth Signals</th>
                  <th>AI Org Signals</th>
                  <th>AI Tech Signals</th>
                  <th>AI Hiring Signals</th>
                  <th>Intent Score</th>
                  <th>Intent Horizon</th>
                  <th>Signal Evidence</th>
                </tr>
              </thead>
              <tbody>
                {apolloOnlyCompanies.map((c, idx) => (
                  <tr key={idx}>
                    <td className="organization-id-cell">{c.id || '-'}</td>
                    <td className="company-name-cell">{c.name || '-'}</td>
                    <td className="domain-cell">{c.domain || '-'}</td>
                    <td className="industry-cell">{c.industry || '-'}</td>
                    <td className="founded-year-cell">{c.founded_year || '-'}</td>
                    <td className="headquarters-cell">{c.headquarters || c.location || '-'}</td>
                    <td className="description-cell" title={c.description}>
                      {c.description ? (c.description.length > 50 ? c.description.substring(0, 50) + '...' : c.description) : '-'}
                    </td>
                    <td className="linkedin-cell">
                      {(c.company_linkedin_url || c.linkedin_url) ? (
                        <a className="website-link linkedin-link" href={c.company_linkedin_url || c.linkedin_url} target="_blank" rel="noreferrer" title="LinkedIn Profile">
                            <ExternalLink className="link-icon" />
                          </a>
                      ) : '-'}
                    </td>
                    <td className="employee-count-cell">{c.employee_count || '-'}</td>
                    <td className="revenue-cell">{c.revenue || c.revenue_range || '-'}</td>
                    <td className="technologies-cell">
                      {c.technologies && c.technologies.length > 0 ? (
                        <span title={c.technologies.map(tech => 
                          typeof tech === 'object' && tech.technology ? tech.technology : tech
                        ).join(', ')}>
                          {c.technologies.map(tech => 
                            typeof tech === 'object' && tech.technology ? tech.technology : tech
                          ).slice(0, 3).join(', ')}
                          {c.technologies.length > 3 && ` (+${c.technologies.length - 3})`}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="tech-spend-cell">{c.tech_spend || '-'}</td>
                    <td className="it-budget-cell">{c.it_budget || '-'}</td>
                    <td className="recent-news-cell">
                      {c.recent_news && c.recent_news.length > 0 ? (
                        <span title={c.recent_news.join('; ')}>
                          {c.recent_news.length} items
                        </span>
                      ) : '-'}
                    </td>
                    <td className="job-openings-cell">{c.job_openings || '-'}</td>
                    <td className="growth-signals-cell">
                      {c.growth_signals && c.growth_signals.length > 0 ? (
                        <span title={c.growth_signals.join('; ')}>
                          {c.growth_signals.length} signals
                        </span>
                      ) : '-'}
                    </td>
                    <td className="ai-org-signals-cell">
                      {c.ai_org_signals && c.ai_org_signals.length > 0 ? (
                        <span title={c.ai_org_signals.join('; ')}>
                          {c.ai_org_signals.length} signals
                        </span>
                      ) : '-'}
                    </td>
                    <td className="ai-tech-signals-cell">
                      {c.ai_tech_signals && c.ai_tech_signals.length > 0 ? (
                        <span title={c.ai_tech_signals.join('; ')}>
                          {c.ai_tech_signals.length} signals
                        </span>
                      ) : '-'}
                    </td>
                    <td className="ai-hiring-signals-cell">
                      {c.ai_hiring_signals && c.ai_hiring_signals.length > 0 ? (
                        <span title={c.ai_hiring_signals.join('; ')}>
                          {c.ai_hiring_signals.length} signals
                        </span>
                      ) : '-'}
                    </td>
                    <td className="intent-score-cell">
                      {c.intent_score ? (
                        <span className={`intent-score ${
                          c.intent_score >= 0.7 ? 'high' : c.intent_score >= 0.4 ? 'medium' : 'low'
                        }`}>
                          {Math.round(c.intent_score * 100)}%
                        </span>
                      ) : '-'}
                    </td>
                    <td className="intent-horizon-cell">{c.intent_horizon || '-'}</td>
                    <td className="signal-evidence-cell">
                      {c.signal_evidence && c.signal_evidence.length > 0 ? (
                        <span title={c.signal_evidence.join('; ')}>
                          {c.signal_evidence.length} items
                        </span>
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="comparison-section">
          <h4 className="section-title">Apollo + CoreSignal Enriched</h4>
          <div className="table-wrapper">
            <table className="companies-table">
              <thead>
                <tr>
                  <th>Organization ID</th>
                  <th>Company Name</th>
                  <th>Domain</th>
                  <th>Industry</th>
                  <th>Founded Year</th>
                  <th>Headquarters</th>
                  <th>Description</th>
                  <th>Company LinkedIn</th>
                  <th>Employee Count</th>
                  <th>Revenue</th>
                  <th>Technologies</th>
                  <th>Tech Spend</th>
                  <th>IT Budget</th>
                  <th>Recent News</th>
                  <th>Job Openings</th>
                  <th>Growth Signals</th>
                  <th>AI Org Signals</th>
                  <th>AI Tech Signals</th>
                  <th>AI Hiring Signals</th>
                  <th>Intent Score</th>
                  <th>Intent Horizon</th>
                  <th>Signal Evidence</th>
                  <th>Enrichment</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((c, idx) => (
                  <tr key={idx}>
                    <td className="organization-id-cell">{c.id || '-'}</td>
                    <td className="company-name-cell">{c.name || '-'}</td>
                    <td className="domain-cell">
                      {c.domain ? (
                        <span title={
                          c.coresignal_data?.domain_source ? 
                            `Domain found via ${c.coresignal_data.domain_source.replace('_', ' ')}` : 
                            'Original domain from Apollo'
                        }>
                          {c.domain}
                          {c.coresignal_data?.domain_source && (
                            <small style={{display: 'block', fontSize: '10px', color: '#666'}}>
                              via {c.coresignal_data.domain_source === 'linkedin_url_enrichment' ? 'LinkedIn' :
                                   c.coresignal_data.domain_source === 'company_name_search' ? 'Search' : 'CoreSignal'}
                            </small>
                          )}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="industry-cell">{c.industry || '-'}</td>
                    <td className="founded-year-cell">{c.founded_year || '-'}</td>
                    <td className="headquarters-cell">{c.headquarters || c.location || '-'}</td>
                    <td className="description-cell" title={c.description}>
                      {c.description ? (c.description.length > 50 ? c.description.substring(0, 50) + '...' : c.description) : '-'}
                    </td>
                    <td className="linkedin-cell">
                      {(c.company_linkedin_url || c.linkedin_url) ? (
                        <a className="website-link linkedin-link" href={c.company_linkedin_url || c.linkedin_url} target="_blank" rel="noreferrer" title="LinkedIn Profile">
                          <ExternalLink className="link-icon" />
                        </a>
                      ) : '-'}
                    </td>
                    <td className="employee-count-cell">{c.employee_count || '-'}</td>
                    <td className="revenue-cell">{c.revenue || c.revenue_range || '-'}</td>
                    <td className="technologies-cell">
                      {c.technologies && c.technologies.length > 0 ? (
                        <span title={c.technologies.map(tech => 
                          typeof tech === 'object' && tech.technology ? tech.technology : tech
                        ).join(', ')}>
                          {c.technologies.map(tech => 
                            typeof tech === 'object' && tech.technology ? tech.technology : tech
                          ).slice(0, 3).join(', ')}
                          {c.technologies.length > 3 && ` (+${c.technologies.length - 3})`}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="tech-spend-cell">{c.tech_spend || '-'}</td>
                    <td className="it-budget-cell">{c.it_budget || '-'}</td>
                    <td className="recent-news-cell">
                      {c.recent_news && c.recent_news.length > 0 ? (
                        <span title={c.recent_news.join('; ')}>
                          {c.recent_news.length} items
                        </span>
                      ) : '-'}
                    </td>
                    <td className="job-openings-cell">{c.job_openings || '-'}</td>
                    <td className="growth-signals-cell">
                      {c.growth_signals && c.growth_signals.length > 0 ? (
                        <span title={c.growth_signals.join('; ')}>
                          {c.growth_signals.length} signals
                        </span>
                      ) : '-'}
                    </td>
                    <td className="ai-org-signals-cell">
                      {c.ai_org_signals && c.ai_org_signals.length > 0 ? (
                        <span title={c.ai_org_signals.join('; ')}>
                          {c.ai_org_signals.length} signals
                        </span>
                      ) : '-'}
                    </td>
                    <td className="ai-tech-signals-cell">
                      {c.ai_tech_signals && c.ai_tech_signals.length > 0 ? (
                        <span title={c.ai_tech_signals.join('; ')}>
                          {c.ai_tech_signals.length} signals
                        </span>
                      ) : '-'}
                    </td>
                    <td className="ai-hiring-signals-cell">
                      {c.ai_hiring_signals && c.ai_hiring_signals.length > 0 ? (
                        <span title={c.ai_hiring_signals.join('; ')}>
                          {c.ai_hiring_signals.length} signals
                        </span>
                      ) : '-'}
                    </td>
                    <td className="intent-score-cell">
                      {c.intent_score ? (
                        <span className={`intent-score ${
                          c.intent_score >= 0.7 ? 'high' : c.intent_score >= 0.4 ? 'medium' : 'low'
                        }`}>
                          {Math.round(c.intent_score * 100)}%
                        </span>
                      ) : '-'}
                    </td>
                    <td className="intent-horizon-cell">{c.intent_horizon || '-'}</td>
                    <td className="signal-evidence-cell">
                      {c.signal_evidence && c.signal_evidence.length > 0 ? (
                        <span title={c.signal_evidence.join('; ')}>
                          {c.signal_evidence.length} items
                        </span>
                      ) : '-'}
                    </td>
                    <td className="enrichment-cell">
                      {c.coresignal_enriched ? (
                        <span className="enrichment-success" title={
                          `Enriched with CoreSignal${c.coresignal_data?.domain_source ? 
                            `\nDomain source: ${c.coresignal_data.domain_source.replace('_', ' ')}` : ''}`
                        }>
                          ✓ CS
                          {c.coresignal_data?.domain_source && (
                            <small style={{display: 'block', fontSize: '10px'}}>
                              {c.coresignal_data.domain_source === 'linkedin_url_enrichment' ? 'D:LinkedIn' :
                               c.coresignal_data.domain_source === 'company_name_search' ? 'D:Search' : 'D:Direct'}
                            </small>
                          )}
                        </span>
                      ) : c.enrichment_error ? (
                        <span className="enrichment-error" title={c.enrichment_error}>✗ Error</span>
                      ) : (
                        <span className="enrichment-none" title="No CoreSignal enrichment">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      )}

      {rawCompanies.length > 0 && (
        <div className="json-output">
          <h4>Raw Apollo API Response</h4>
          <pre className="json-pre">
            {JSON.stringify(rawCompanies, null, 2)}
          </pre>
        </div>
      )}

      {/* Leads Section - Below Apollo + CoreSignal Enriched */}
      <div className="leads-section">
        <h4 className="section-title">
          Leads Found {leadsLoading ? '(Loading...)' : `(${leads.length})`}
        </h4>
        
        {leadsError && (
          <div className="leads-error-info">
            <strong>Error:</strong> {leadsError}
          </div>
        )}
        
        {leadsLoading ? (
          <div className="loading-indicator">
            Loading leads from Apollo People Search...
          </div>
        ) : leads.length > 0 ? (
          <div className="table-wrapper">
            <table className="leads-table">
              <thead>
                <tr>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Title</th>
                  <th>Company</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>LinkedIn</th>
                  <th>Twitter</th>
                  <th>Location</th>
                  <th>Recent Activity</th>
                  <th>Published Content</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead, idx) => (
                  <tr key={idx}>
                    <td className="contact-first-name-cell">{lead.contact_first_name || '-'}</td>
                    <td className="contact-last-name-cell">{lead.contact_last_name || '-'}</td>
                    <td className="contact-title-cell" title={lead.contact_title}>
                      {lead.contact_title ? (lead.contact_title.length > 40 ? lead.contact_title.substring(0, 40) + '...' : lead.contact_title) : '-'}
                    </td>
                    <td className="contact-company-cell">{lead.contact_company || '-'}</td>
                    <td className="contact-email-cell">
                      {lead.contact_email ? (
                        <a href={`mailto:${lead.contact_email}`} className="email-link" title={lead.contact_email}>
                          {lead.contact_email.length > 25 ? lead.contact_email.substring(0, 25) + '...' : lead.contact_email}
                        </a>
                      ) : '-'}
                    </td>
                    <td className="contact-phone-cell">
                      {lead.contact_phone || '-'}
                    </td>
                    <td className="contact-linkedin-cell">
                      {lead.contact_linkedin_url ? (
                        <a href={lead.contact_linkedin_url} target="_blank" rel="noreferrer" className="linkedin-link" title="LinkedIn Profile">
                          <ExternalLink className="link-icon" />
                        </a>
                      ) : '-'}
                    </td>
                    <td className="contact-twitter-cell">
                      {lead.contact_twitter ? (
                        <a href={lead.contact_twitter} target="_blank" rel="noreferrer" className="twitter-link" title="Twitter Profile">
                          <ExternalLink className="link-icon" />
                        </a>
                      ) : '-'}
                    </td>
                    <td className="contact-location-cell" title={lead.contact_location}>
                      {lead.contact_location ? (lead.contact_location.length > 20 ? lead.contact_location.substring(0, 20) + '...' : lead.contact_location) : '-'}
                    </td>
                    <td className="contact-recent-activity-cell" title={lead.contact_recent_activity}>
                      {lead.contact_recent_activity ? (lead.contact_recent_activity.length > 30 ? lead.contact_recent_activity.substring(0, 30) + '...' : lead.contact_recent_activity) : '-'}
                    </td>
                    <td className="contact-published-content-cell" title={lead.contact_published_content}>
                      {lead.contact_published_content ? (lead.contact_published_content.length > 30 ? lead.contact_published_content.substring(0, 30) + '...' : lead.contact_published_content) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : !leadsLoading && (
          <div className="no-leads-message">
            {leadsError ? leadsError : "No leads found from the companies."}
          </div>
        )}
      </div>
    </div>
  )
}


