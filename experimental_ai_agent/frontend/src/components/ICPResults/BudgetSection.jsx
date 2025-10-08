export default function BudgetSection({ stageOverrides }) {
  if (!stageOverrides) return null

  return (
    <div className="result-card">
      <h4>Budget Allocation</h4>
      <div className="budget-details">
        <div><strong>Per Lead Cap:</strong> ${stageOverrides.budget_cap_per_lead_usd}</div>
        <div className="stage-breakdown">
          <div>Finder: {stageOverrides.finder_pct}%</div>
          <div>Research: {stageOverrides.research_pct}%</div>
          <div>Contacts: {stageOverrides.contacts_pct}%</div>
          <div>Verify: {stageOverrides.verify_pct}%</div>
          <div>Synthesis: {stageOverrides.synthesis_pct}%</div>
          <div>Intent: {stageOverrides.intent_pct}%</div>
        </div>
      </div>
    </div>
  )
}
