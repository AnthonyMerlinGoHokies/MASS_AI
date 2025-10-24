
import pytest

def test_normalize_icp_happy_path(client, monkeypatch):
    # Arrange: monkeypatch ICPService.normalize_icp to a deterministic return
    from app.routes import icp as icp_route
    from app.services.icp_service import ICPService

    async def fake_normalize(self, icp_text):
        return {
            "success": True,
            "icp_config": {
                "industries": ["SaaS"],
                "company_size": {"min": 10, "max": 500},
                "geos": ["US"],
                "technologies": ["AWS"],
                "personas": [{"title": "CTO"}],
            },
            "routing_decision": {"route":"apollo","confidence":0.92},
            "error": None,
            "session_id": "sess_123"
        }

    monkeypatch.setattr(ICPService, "create_fallback_icp_config", lambda self, *_args, **_kw: {"industries":["SaaS"]})
    # The route constructs ICPService() and calls .normalize (based on repo), so patch broadly:
    # if normalize_icp method exists
    if hasattr(ICPService, "normalize_icp"):
        monkeypatch.setattr(ICPService, "normalize_icp", fake_normalize)
    else:
        # fallback if route calls a different method name
        monkeypatch.setattr(ICPService, "normalize", fake_normalize)

    # Avoid DB side effects
    try:
        import app.core.db_operations as dbo
        monkeypatch.setattr(dbo, "save_icp_search", lambda *a, **k: None, raising=False)
    except Exception:
        pass

    payload = {"icp_text": "B2B SaaS companies 10-500 employees in US targeting CTOs"}
    resp = client.post("/normalize-icp", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["icp_config"]["industries"] == ["SaaS"]
    assert data["routing_decision"]["route"] in ("apollo","coresignal","fallback")
    assert data["session_id"] == "sess_123"

def test_normalize_icp_validation_error(client):
    # Missing required field should 422
    resp = client.post("/normalize-icp", json={})
    assert resp.status_code == 422
