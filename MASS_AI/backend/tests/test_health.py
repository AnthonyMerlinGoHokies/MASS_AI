
def test_root_health(client):
    resp = client.get("/")
    assert resp.status_code == 200
    data = resp.json()
    assert resp.json()["message"] == "ICP Normalizer API is running"
