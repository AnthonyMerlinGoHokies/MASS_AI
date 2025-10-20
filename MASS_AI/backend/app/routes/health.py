"""
Health check routes.
"""
from fastapi import APIRouter

from ..core.config import settings

router = APIRouter(prefix="", tags=["health"])


@router.get("/")
async def root():
    """Health check endpoint."""
    return {"message": "ICP Normalizer API is running"}


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "mistral_configured": bool(settings.MISTRAL_API_KEY),
        "apollo_configured": bool(settings.APOLLO_API_KEY),
        "coresignal_configured": bool(settings.CORESIGNAL_API_KEY)
    }
