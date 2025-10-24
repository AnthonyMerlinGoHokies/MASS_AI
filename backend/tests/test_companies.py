
# def test_companies_endpoint_happy_path(client, monkeypatch):
#     # Patch CompanyService.search_and_enrich to deterministic
#     from app.services.company_service import CompanyService

#     def fake_search_and_enrich(self, icp_config, limit=20, session_id=None):
#         return {
#             "success": True,
#             "companies": [{
#                 "name":"Acme Inc",
#                 "domain":"acme.com",
#                 "employees": 120,
#                 "location": "USA"
#             }],
#             "total_companies": 1,
#             "error": None,
#             "journey_data": {
#                 "session_id": session_id or "sess_1",
#                 "raw_icp_text": "raw",
#                 "normalized_icp": {"industries":["SaaS"]},
#                 "apollo_companies_count": 1,
#                 "coresignal_enriched_count": 1,
#                 "leads_generated_count": 0,
#                 "domain_enrichment_attempts": 1,
#                 "domain_enrichment_successes": 1,
#                 "processing_time_seconds": 0.1,
#                 "errors": []
#             }
#         }
#     monkeypatch.setattr(CompanyService, "search_and_enrich", fake_search_and_enrich)

#     # Avoid DB writes
#     try:
#         import app.core.db_operations as dbo
#         monkeypatch.setattr(dbo, "save_companies", lambda *a, **k: None, raising=False)
#         monkeypatch.setattr(dbo, "track_api_call", lambda *a, **k: None, raising=False)
#     except Exception:
#         pass

#     payload = {
#         "icp_config": {"industries":["SaaS"]},
#         "limit": 1,
#         "session_id": "sess_1"
#     }
#     resp = client.post("/companies", json=payload)
#     assert resp.status_code == 200
#     data = resp.json()
#     assert data["success"] is True
#     assert data["total_companies"] == 1
#     assert data["companies"][0]["domain"] == "acme.com"
import os

def test_companies_endpoint_happy_path(client, monkeypatch):
    from app.services.company_service import CompanyService
    from app.schemas.company import CompaniesResponse, Company
    # ✅ ensure dummy env var
    os.environ["SERPER_API_KEY"] = "dummy"


    async def fake_search_companies(self, request):
        # Fake company object
        company = Company(
            name="Acme",
            domain="acme.com",
            industry="SaaS",
            description="Acme builds AI tools"
        )
        return CompaniesResponse(
            success=True,
            companies=[company],
            apollo_only_companies=[company],
            used_mock=False,
            response_count=1,
            request_payload=request.dict() if hasattr(request, "dict") else {},
            raw_companies=[{"name": "Acme", "domain": "acme.com"}]
        )

    # Patch the service method
    monkeypatch.setattr(CompanyService, "search_companies", fake_search_companies)

    # Call endpoint
    resp = client.post(
        "/companies",
        json={
            "search_payload": {"name": "Acme"},
            "limit": 1
        }
    )

    # Assertions
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["response_count"] == 1
    assert data["companies"][0]["domain"] == "acme.com"
