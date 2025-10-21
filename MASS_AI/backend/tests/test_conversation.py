
import uuid

def test_conversation_start_and_respond(client, monkeypatch):
    from app.services.conversational_icp_service import ConversationalICPService

    def fake_start(self):
        return {
            "success": True,
            "conversation_id": "conv_1",
            "session_id": "sess_conv",
            "needs_conversation": True,
            "message": "What industry are you targeting?",
            "state": "ASKING"
        }

    def fake_respond(self, conversation_id, user_input):
        return {
            "success": True,
            "conversation_id": conversation_id,
            "session_id": "sess_conv",
            "needs_conversation": True,
            "message": "Got it. Any geo preference?",
            "state": "ASKING",
            "icp_config": {"industries":["SaaS"]}
        }

    monkeypatch.setattr(ConversationalICPService, "start_conversation", fake_start)
    monkeypatch.setattr(ConversationalICPService, "respond_to_conversation", fake_respond)

    # start
    resp = client.post("/conversation/start")
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["conversation_id"] == "conv_1"
    assert data["needs_conversation"] is True

    # respond
    resp2 = client.post("/conversation/conv_1/respond", json={"user_input": "We target SaaS"})
    assert resp2.status_code == 200
    data2 = resp2.json()
    assert data2["success"] is True
    assert data2["conversation_id"] == "conv_1"
    assert data2["state"] in ("ASKING","FINALIZING","COLLECTING")
