"""
FastAPI application factory and configuration.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.config import settings
from .routes import icp_router, company_router, lead_router, health_router


def create_application() -> FastAPI:
    """Create FastAPI application with all configurations."""
    
    # Create FastAPI instance
    app = FastAPI(
        title=settings.APP_TITLE,
        version=settings.APP_VERSION,
        description="API for normalizing Ideal Customer Profiles and finding companies and leads using Apollo + CoreSignal + Mistral AI"
    )

    # Add CORS middleware for React frontend
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include routers
    app.include_router(health_router)
    app.include_router(icp_router)
    app.include_router(company_router)
    app.include_router(lead_router)

    return app


# Create the application instance
app = create_application()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
