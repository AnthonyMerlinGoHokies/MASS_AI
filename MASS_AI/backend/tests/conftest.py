
import pytest
from httpx import AsyncClient
from fastapi.testclient import TestClient
from app.main import create_application
import sys, os

# ensure the "backend" directory is on sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)


@pytest.fixture(scope="session", autouse=True)
def set_env_vars():
    os.environ["HUNTER_IO_API_KEY"] = "test_hunter_key"
    os.environ["SUPABASE_URL"] = "http://test-url"
    os.environ["SUPABASE_KEY"] = "test_key"
    yield
    os.environ.pop("HUNTER_IO_API_KEY", None)
    os.environ.pop("SUPABASE_URL", None)
    os.environ.pop("SUPABASE_KEY", None)


@pytest.fixture(scope="session")
def app():
    """ 
    Create a single FastAPI app instance for the entire test session.
    """
    return create_application()


@pytest.fixture(scope="session")
def client(app):
    """
    Synchronous test client for basic endpoint testing.
    """
    return TestClient(app)


@pytest.fixture(scope="session")
async def async_client(app):
    """
    Asynchronous HTTPX client for async route and service tests.
    """
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac


@pytest.fixture(autouse=True)
def clean_test_env(monkeypatch):
    """
    Automatically patch out external API calls (like Serper, Hunter)
    for all tests to avoid live requests.
    """
    monkeypatch.setenv("ENV", "test")
    # Example patch: disable analytics, external logging, etc.
    # monkeypatch.setattr("app.utils.analytics.track_event", lambda *_, **__: None)
    yield
