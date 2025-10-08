import PersonasSection from './PersonasSection'
import CompanyFiltersSection from './CompanyFiltersSection'
import ContactTargetsSection from './ContactTargetsSection'
import BudgetSection from './BudgetSection'

export default function ICPResults({ result, error }) {
  if (!result) return null

  return (
    <div className="icp-results-panel">
      <h3 className="result-title">Normalized ICP Configuration</h3>
      
      {error && (
        <div className="icp-error-info">
          <strong>Note:</strong> {error}
        </div>
      )}
      
      <div className="result-grid">
        <PersonasSection personas={result.personas} />
        <CompanyFiltersSection companyFilters={result.company_filters} />
        <ContactTargetsSection contactPersonaTargets={result.contact_persona_targets} />
        <BudgetSection stageOverrides={result.stage_overrides} />
      </div>

    </div>
  )
}
