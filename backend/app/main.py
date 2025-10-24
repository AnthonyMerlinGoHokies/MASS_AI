"""
FastAPI application factory and configuration.
"""
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import time

from .core.config import settings
from .routes import icp_router, company_router, lead_router, health_router, conversation_router

# Rate limiter
limiter = Limiter(key_func=get_remote_address)


def create_application() -> FastAPI:
    """Create FastAPI application with all configurations."""
    
    # Create FastAPI instance
    app = FastAPI(
        title=settings.APP_TITLE,
        version=settings.APP_VERSION,
        description="API for normalizing Ideal Customer Profiles and finding companies and leads using Apollo + CoreSignal + Mistral AI"
    )

    # Add rate limiting
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    # Add CORS middleware for React frontend
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Add request logging middleware
    @app.middleware("http")
    async def log_requests(request: Request, call_next):
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        
        # Log only if it's not an OPTIONS request to reduce noise
        if request.method != "OPTIONS":
            print(f"{request.method} {request.url.path} - {response.status_code} - {process_time:.3f}s")
        
        return response

    # Include routers
    app.include_router(health_router)
    app.include_router(icp_router)
    app.include_router(conversation_router)  # New conversational ICP collection
    app.include_router(company_router)
    app.include_router(lead_router)

    return app


# Create the application instance
app = create_application()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
