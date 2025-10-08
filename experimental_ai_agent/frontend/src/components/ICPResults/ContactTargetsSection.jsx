export default function ContactTargetsSection({ contactPersonaTargets }) {
  if (!contactPersonaTargets) return null

  return (
    <div className="result-card">
      <h4>Contact Targets</h4>
      <div className="contact-details">
        <div>
          <strong>Per Company:</strong> {contactPersonaTargets.per_company_min} - {contactPersonaTargets.per_company_max} contacts
        </div>
        <div>
          <strong>Priority Order:</strong>
          <ol>
            {contactPersonaTargets.persona_order?.map((persona, index) => (
              <li key={index}>{persona}</li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}
