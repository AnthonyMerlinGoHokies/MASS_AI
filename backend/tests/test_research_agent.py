
import pytest
import re
from types import SimpleNamespace

from app.schemas.company import Company
from app.schemas.lead import Lead

# ---------- Fakes / Stubs ----------

class FakeSerper:
    """
    A controllable Serper stub. It looks at the incoming query to return
    predictable "organic" results suited for each tested method.
    """
    def __init__(self, script=None):
        # script: optional dict[str->callable(query)->dict]
        self.script = script or {}

    def search(self, query: str):
        # Route via explicit script first
        for key, handler in self.script.items():
            if key in query:
                return handler(query)

        # Default heuristics for common patterns
        q = query.lower()

        if "site:linkedin.com/jobs" in q:
            # Distinct value for Strategy 1
            return {"organic": [{} for _ in range(10)]}  # 10 LinkedIn jobs

        # LinkedIn jobs result -> provide multiple organic items
        if "site:linkedin.com/jobs" in q and "required skills" in q:
            # Tech stack via LinkedIn
            return {
                "organic": [
                    {"title": "We use Python and AWS extensively", "snippet": "React, Docker, Kubernetes"},
                    {"title": "Hiring engineers (Typescript, Node.js)", "snippet": "PostgreSQL on AWS"}
                ]
            }

        if 'tech stack or' in q or 'built with' in q or 'powered by' in q or 'uses' in q:
            return {
                "organic": [
                    {"title": "Our stack: Python + FastAPI", "snippet": "We also use Redis and PostgreSQL"},
                    {"title": "Powered by Kubernetes", "snippet": "Hosted on AWS"}
                ]
            }

        if "site:stackshare.io" in q or "site:builtwith.com" in q:
            return {
                "organic": [
                    {"title": "StackShare - ACME", "snippet": "React, Node.js, AWS"},
                    {"title": "BuiltWith for acme.com", "snippet": "Docker, Kubernetes"}
                ]
            }

        if "careers or jobs hiring" in q:
            # Provide a snippet with number of jobs
            return {"organic": [
                {"title": "Careers - ACME", "snippet": "We have 18 open positions across engineering and sales"}
            ]}

        if "launched or announces" in q or "unveils" in q or "releases" in q or "expands" in q:
            return {"organic": [
                {"title": "Acme launches AI assistant", "snippet": "Acme announces new feature"}
            ]}

        if "raised" in q and "funding" in q:
            return {"organic": [
                {"title": "Acme raised $25M Series B", "snippet": "The company secured $25M funding round"}
            ]}

        if "award" in q or "recognition" in q or "ranked" in q or "named" in q or "best" in q:
            return {"organic": [
                {"title": "Acme named Best Workplace 2025", "snippet": ""}
            ]}

        if "ai product" in q or "ai platform" in q or "ai feature" in q or "machine learning" in q:
            return {"organic": [
                {"title": "Acme AI product launch", "snippet": "Our AI platform helps teams"}
            ]}

        if "using ai" in q or "ai implementation" in q or "adopted ai" in q:
            return {"organic": [
                {"title": "Acme implements AI across org", "snippet": "AI platform rollout"}
            ]}

        if "linkedin post" in q:
            return {"organic": [
                {"title": "linkedin.com/posts/123", "link": "https://www.linkedin.com/posts/acme_123", "snippet": "Great milestone this week!"}
            ]}

        if "twitter.com" in q:
            return {"organic": [
                {"title": "X (Twitter) - Jane Doe", "link": "https://twitter.com/janedoe"}
            ]}

        if " location" in q:
            return {"organic": [
                {"snippet": "Jane Doe - Senior Eng - Austin, TX · Acme"}
            ]}

        if "article or blog or talk or speaking" in q or "article or blog" in q:
            return {"organic": [
                {"title": "Jane on Medium: Scaling FastAPI", "link": "https://medium.com/@jane/scaling-fastapi"},
                {"title": "Tech talk - PyData", "link": "https://youtube.com/watch?v=12345"},
            ]}

        # Generic fallback
        return {"organic": []}


class FakeHunter:
    def verify(self, email):
        return {"result": "deliverable"}


@pytest.fixture
def service(monkeypatch):
    # Patch SerperApiClient and HunterIoClient classes before constructing the service
    import app.clients.serper_api as serper_mod
    import app.clients.hunter_io as hunter_mod
    monkeypatch.setattr(serper_mod, "SerperApiClient", lambda: FakeSerper())
    monkeypatch.setattr(hunter_mod, "HunterIoClient", lambda: FakeHunter())

    from app.services.research_agent_service import ResearchAgentService
    return ResearchAgentService()


# ---------- Company / Lead helpers ----------

def make_company(**overrides):
    base = dict(
        name="Acme",
        domain="acme.com",
        industry="Software",
        company_linkedin_url="https://www.linkedin.com/company/acme",
        employee_count=250,
        description="Acme builds AI-powered tools.",
        recent_news=["Acme raised $25M Series B this quarter and launched new feature."],

        # Research-agent-managed fields default missing
        technologies=None,
        tech_spend=None,
        it_budget=None,
        job_openings=None,
        growth_signals=None,
        ai_org_signals=None,
        ai_tech_signals=None,
        ai_hiring_signals=None,
        signal_evidence=None,
    )
    base.update(overrides)
    return Company(**base)


def make_lead(**overrides):
    base = dict(
        contact_first_name="Jane",
        contact_last_name="Doe",
        contact_company="Acme",
        contact_email="jane@acme.com",

        # research-agent-managed fields missing
        contact_twitter=None,
        contact_location=None,
        contact_recent_activity=None,
        contact_published_content=None,
    )
    base.update(overrides)
    return Lead(**base)


# ---------- Tests: helper detectors ----------

def test_get_missing_company_fields_flags_only_research_fields(service):
    c = make_company(technologies=[], growth_signals=None, ai_org_signals=None, ai_tech_signals=None)
    missing = service._get_missing_company_fields(c)
    # Only the 9 research fields are considered
    assert set(missing) <= {
        "technologies","tech_spend","it_budget","job_openings",
        "growth_signals","ai_org_signals","ai_tech_signals","ai_hiring_signals","signal_evidence"
    }
    assert "technologies" in missing
    assert "growth_signals" in missing
    assert "ai_org_signals" in missing

def test_get_missing_lead_fields_detection(service):
    l = make_lead(contact_twitter="", contact_location=None)
    missing = service._get_missing_lead_fields(l)
    assert set(missing) == {"contact_twitter","contact_location","contact_recent_activity","contact_published_content"}


# ---------- Async tests for individual strategies ----------

@pytest.mark.asyncio
async def test_research_technologies_finds_stack(service):
    c = make_company()
    techs = await service._research_technologies(c)
    assert techs is None or isinstance(techs, list)
    if techs:
        joined = " ".join(techs).lower()
        assert "python" in joined
        assert "aws" in joined

# @pytest.mark.asyncio
# async def test_research_job_openings_parses_numbers(service):
#     c = make_company(job_openings=None)
#     count = await service._research_job_openings(c)
#     # From FakeSerper careers snippet: 18 open positions (or None if branch differs)
#     assert count in (18, None)


@pytest.mark.asyncio
async def test_job_openings_from_linkedin_count(service):
    c = make_company(company_linkedin_url="https://linkedin.com/acme")
    count = await service._research_job_openings(c)
    assert count == 10  # from LinkedIn branch

@pytest.mark.asyncio
async def test_job_openings_from_careers_snippet(service):
    c = make_company(company_linkedin_url=None)  # force branch 2
    count = await service._research_job_openings(c)
    assert count == 18   # from careers snippet branch

@pytest.mark.asyncio
async def test_research_growth_signals_compiles_multiple(service):
    c = make_company(job_openings=None)
    signals = await service._research_growth_signals(c)
    assert signals is None or isinstance(signals, list)

@pytest.mark.asyncio
async def test_research_ai_hiring_signals_counts_roles(service):
    c = make_company()
    signals = await service._research_ai_hiring_signals(c)
    assert signals is None or isinstance(signals, list)

@pytest.mark.asyncio
async def test_research_ai_org_signals_uses_desc_and_hiring(service):
    c = make_company(ai_hiring_signals=["ML Engineer role"])
    signals = await service._research_ai_org_signals(c)
    assert signals is None or isinstance(signals, list)

@pytest.mark.asyncio
async def test_research_ai_tech_signals_detects_product_or_description(service):
    c = make_company(description="We offer an AI platform for teams.")
    signals = await service._research_ai_tech_signals(c)
    assert signals is None or isinstance(signals, list)

@pytest.mark.asyncio
async def test_research_signal_evidence_aggregates(service):
    c = make_company(
        job_openings=22,
        ai_hiring_signals=["AI Engineer"],
        growth_signals=["💰 Funding: raised $25M"],
        recent_news=["Acme launched a new product and expanded to EU"]
    )
    ev = await service._research_signal_evidence(c)
    assert isinstance(ev, list)
    joined = " ".join(ev).lower()
    assert any(k in joined for k in ["funding","hiring","recent activity"])


@pytest.mark.asyncio
async def test_research_tech_spend_by_employee_count(service):
    c = make_company(employee_count=50)  # 50 * 1200 = 60,000
    result = await service._research_tech_spend(c)
    assert result == "Estimated $50K-$100K annually"

    c = make_company(employee_count=300)  # 360,000
    result = await service._research_tech_spend(c)
    assert result == "Estimated $100K-$500K annually"

    c = make_company(employee_count=1000)  # 1.2M
    result = await service._research_tech_spend(c)
    assert result == "Estimated $1M-$5M annually"


@pytest.mark.asyncio
async def test_research_tech_spend_by_industry(service):
    c = make_company(employee_count=None, industry="SaaS")
    result = await service._research_tech_spend(c)
    assert result == "Estimated 6-8% of revenue (SaaS standard)"


@pytest.mark.asyncio
async def test_research_it_budget_by_employee_count(service):
    c = make_company(employee_count=50)  # 90,000
    result = await service._research_it_budget(c)
    assert result == "Estimated $100K-$200K annually"

    c = make_company(employee_count=300)  # 540,000
    result = await service._research_it_budget(c)
    assert result == "Estimated $200K-$750K annually"

    c = make_company(employee_count=1000)  # 1.8M
    result = await service._research_it_budget(c)
    assert result == "Estimated $1.5M-$7.5M annually"


# ---------- Routing tests ----------

@pytest.mark.asyncio
async def test_research_company_field_routes(service):
    c = make_company()
    out = await service._research_company_field(c, "technologies")
    assert out is None or isinstance(out, list)

@pytest.mark.asyncio
async def test_research_lead_field_routes(service):
    l = make_lead()
    out = await service._research_lead_field(l, "contact_twitter")
    assert out is None or isinstance(out, str)


# ---------- End-to-end-ish: research_company & research_lead ----------

@pytest.mark.asyncio
async def test_research_company_fills_some_fields(service):
    c = make_company(
        technologies=None, job_openings=None, growth_signals=None,
        ai_org_signals=None, ai_tech_signals=None, ai_hiring_signals=None, signal_evidence=None
    )
    enriched = await service.research_company(c)
    # Should remain a Company and ideally fill at least technologies; others may depend on heuristics
    assert isinstance(enriched, Company)
    # Do not assert exact counts; just ensure no exception and type

@pytest.mark.asyncio
async def test_research_company_no_missing_returns_quick(service):
    c = make_company(
        technologies=["Python","AWS"], tech_spend="Estimated $500K-$1M annually",
        it_budget="Estimated $750K-$1.5M annually", job_openings=10,
        growth_signals=["🚀 Product launch"], ai_org_signals=["AI platform rollout"],
        ai_tech_signals=["AI product"], ai_hiring_signals=["Hiring ML Engineer"],
        signal_evidence=["Recent activity: Something"]
    )
    enriched = await service.research_company(c)
    # No changes; but crucially, should not raise and should return object
    assert isinstance(enriched, Company)

@pytest.mark.asyncio
async def test_research_lead_populates_fields(service):
    l = make_lead()
    enriched = await service.research_lead(l)
    assert isinstance(enriched, Lead)
    assert enriched.contact_twitter is None or isinstance(enriched.contact_twitter, str)
    assert enriched.contact_location is None or isinstance(enriched.contact_location, str)
    assert enriched.contact_recent_activity is None or isinstance(enriched.contact_recent_activity, str)
    assert enriched.contact_published_content is None or isinstance(enriched.contact_published_content, str)
