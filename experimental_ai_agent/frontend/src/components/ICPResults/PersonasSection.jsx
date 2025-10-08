export default function PersonasSection({ personas = [] }) {
  return (
    <div className="result-card">
      <h4>Personas ({personas.length})</h4>
      <div className="persona-list">
        {personas.map((persona, index) => (
          <div key={index} className="persona-item">
            <strong>{persona.name}</strong>
            <div className="persona-details">
              <span>Functions: {persona.functions?.join(', ')}</span>
              <span>Seniority: {persona.seniority?.join(', ')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
