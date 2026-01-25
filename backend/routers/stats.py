"""
Stats Router - Dashboard statistics and usage metrics
"""
from fastapi import APIRouter, Header
from pydantic import BaseModel
from typing import Optional
from sqlalchemy import select, func
import httpx
import os

from models import Project as ProjectModel, async_session

router = APIRouter()

OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"


class DashboardStats(BaseModel):
    """Dashboard statistics response"""
    projects_count: int
    tokens_used: int
    tokens_limit: Optional[int] = None
    active_agents: int
    github_projects: int
    local_projects: int


class APIKeyVerifyResponse(BaseModel):
    """API key verification response"""
    valid: bool
    label: Optional[str] = None
    usage_usd: Optional[float] = None
    limit_usd: Optional[float] = None
    is_free_tier: Optional[bool] = None
    rate_limit: Optional[dict] = None
    error: Optional[str] = None


@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_stats(
    x_openrouter_key: Optional[str] = Header(None)
):
    """
    Get aggregated dashboard statistics

    Returns:
        - projects_count: Total number of projects
        - tokens_used: Tokens used this period (from OpenRouter)
        - active_agents: Number of enabled agents
        - github_projects: Number of GitHub-connected projects
        - local_projects: Number of local projects
    """
    # Count projects from database
    async with async_session() as session:
        result = await session.execute(select(ProjectModel))
        projects = result.scalars().all()

    projects_count = len(projects)
    github_projects = sum(1 for p in projects if p.github_repo)
    local_projects = projects_count - github_projects

    # Get token usage from OpenRouter if key provided
    tokens_used = 0
    tokens_limit = None

    if x_openrouter_key:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    f"{OPENROUTER_BASE_URL}/auth/key",
                    headers={
                        "Authorization": f"Bearer {x_openrouter_key}",
                        "Content-Type": "application/json"
                    }
                )
                if response.status_code == 200:
                    data = response.json().get("data", {})
                    # OpenRouter returns usage in USD, convert to approximate tokens
                    # Average cost is ~$0.001 per 1000 tokens
                    usage_usd = data.get("usage", 0)
                    tokens_used = int(usage_usd * 1000000)  # Rough approximation

                    limit_usd = data.get("limit", None)
                    if limit_usd:
                        tokens_limit = int(limit_usd * 1000000)
        except Exception as e:
            # If OpenRouter fails, return 0 tokens
            print(f"Failed to fetch OpenRouter usage: {e}")

    # Count active agents (from localStorage on frontend, use default for now)
    # TODO: Store agent settings in database per user
    active_agents = 4  # Default agents: Code Review, Testing, Documentation, Refactoring

    return DashboardStats(
        projects_count=projects_count,
        tokens_used=tokens_used,
        tokens_limit=tokens_limit,
        active_agents=active_agents,
        github_projects=github_projects,
        local_projects=local_projects
    )


@router.post("/verify-api-key", response_model=APIKeyVerifyResponse)
async def verify_api_key(
    x_openrouter_key: Optional[str] = Header(None)
):
    """
    Verify an OpenRouter API key and return account information

    Returns:
        - valid: Whether the key is valid
        - label: Key label/name from OpenRouter
        - usage_usd: Current usage in USD
        - limit_usd: Spending limit in USD (if set)
        - is_free_tier: Whether this is a free tier key
        - rate_limit: Rate limit information
        - error: Error message if verification failed
    """
    if not x_openrouter_key:
        return APIKeyVerifyResponse(
            valid=False,
            error="No API key provided"
        )

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{OPENROUTER_BASE_URL}/auth/key",
                headers={
                    "Authorization": f"Bearer {x_openrouter_key}",
                    "Content-Type": "application/json"
                }
            )

            if response.status_code == 200:
                data = response.json().get("data", {})
                return APIKeyVerifyResponse(
                    valid=True,
                    label=data.get("label", "API Key"),
                    usage_usd=data.get("usage", 0),
                    limit_usd=data.get("limit"),
                    is_free_tier=data.get("is_free_tier", False),
                    rate_limit=data.get("rate_limit")
                )
            elif response.status_code == 401:
                return APIKeyVerifyResponse(
                    valid=False,
                    error="Invalid API key"
                )
            else:
                return APIKeyVerifyResponse(
                    valid=False,
                    error=f"OpenRouter returned status {response.status_code}"
                )
    except httpx.TimeoutException:
        return APIKeyVerifyResponse(
            valid=False,
            error="Connection timeout - please try again"
        )
    except Exception as e:
        return APIKeyVerifyResponse(
            valid=False,
            error=f"Verification failed: {str(e)}"
        )
