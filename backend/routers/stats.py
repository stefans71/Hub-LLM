"""
Stats Router - Dashboard statistics and usage metrics
"""
from fastapi import APIRouter, Header
from pydantic import BaseModel
from typing import Optional
import httpx
import os

from routers.projects import projects_db

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
    # Count projects
    projects_count = len(projects_db)
    github_projects = sum(1 for p in projects_db.values() if getattr(p, 'github_repo', None))
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
