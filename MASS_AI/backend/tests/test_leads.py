def test_leads_generation(client, monkeypatch):
    from app.services.lead_service import LeadService
    from app.schemas.lead import LeadsResponse, Lead

    async def fake_get_leads(self, request):
        # Build one fake Lead object
        lead = Lead(
            contact_first_name="Jane",
            contact_last_name="Doe",
            contact_title="CTO",
            contact_company="Acme",
            contact_email="jane@acme.com"
        )
        return LeadsResponse(
            success=True,
            leads=[lead],
            total_leads=1,
            companies_processed=1
        )

    monkeypatch.setattr(LeadService, "get_leads", fake_get_leads)

    # ✅ Minimal valid request (no personas needed)
    resp = client.post(
        "/leads",
        json={
            "companies": [{"name": "Acme", "domain": "acme.com"}],
            "max_leads_per_company": 1
        }
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["total_leads"] == 1
    assert data["leads"][0]["contact_email"] == "jane@acme.com"

    # ✅ Full request with PersonaConfig schema
    payload = {
        "companies": [{"name": "Acme", "domain": "acme.com"}],
        "personas": [
            {
                "name": "CTO Persona",
                "title_regex": ["CTO"],
                "seniority": ["C-Level"],
                "functions": ["Engineering"]
            }
        ],
        "max_leads_per_company": 1,
        "session_id": "sess_2"
    }
    resp2 = client.post("/leads", json=payload)
    assert resp2.status_code == 200
    data2 = resp2.json()
    assert data2["success"] is True
    assert data2["total_leads"] == 1
    assert data2["leads"][0]["contact_email"] == "jane@acme.com"
