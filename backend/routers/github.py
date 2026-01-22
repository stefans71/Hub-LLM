"""
GitHub & Codespaces Router

Endpoints for managing GitHub Codespaces
"""
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional

from services.github import GitHubService, Codespace

router = APIRouter()


class CodespaceResponse(BaseModel):
    id: int
    name: str
    display_name: str
    state: str
    repository: str
    branch: str
    machine_type: str
    created_at: str
    updated_at: str
    web_url: str


class CreateCodespaceRequest(BaseModel):
    repo_owner: str
    repo_name: str
    branch: str = "main"
    machine: str = "basicLinux32gb"


def get_github_service(x_github_token: Optional[str] = Header(None)) -> GitHubService:
    """Get GitHub service with token from header"""
    if not x_github_token:
        raise HTTPException(
            status_code=401,
            detail="GitHub token required. Add X-GitHub-Token header."
        )
    return GitHubService(x_github_token)


@router.get("/user")
async def get_user(x_github_token: Optional[str] = Header(None)):
    """Get authenticated GitHub user"""
    service = get_github_service(x_github_token)
    try:
        return await service.get_user()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/codespaces")
async def list_codespaces(
    x_github_token: Optional[str] = Header(None)
) -> list[CodespaceResponse]:
    """List all codespaces for the authenticated user"""
    service = get_github_service(x_github_token)
    try:
        codespaces = await service.list_codespaces()
        return [CodespaceResponse(
            id=cs.id,
            name=cs.name,
            display_name=cs.display_name,
            state=cs.state,
            repository=cs.repository,
            branch=cs.branch,
            machine_type=cs.machine_type,
            created_at=cs.created_at,
            updated_at=cs.updated_at,
            web_url=cs.web_url
        ) for cs in codespaces]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/codespaces/{codespace_name}")
async def get_codespace(
    codespace_name: str,
    x_github_token: Optional[str] = Header(None)
) -> CodespaceResponse:
    """Get details for a specific codespace"""
    service = get_github_service(x_github_token)
    try:
        cs = await service.get_codespace(codespace_name)
        return CodespaceResponse(
            id=cs.id,
            name=cs.name,
            display_name=cs.display_name,
            state=cs.state,
            repository=cs.repository,
            branch=cs.branch,
            machine_type=cs.machine_type,
            created_at=cs.created_at,
            updated_at=cs.updated_at,
            web_url=cs.web_url
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/codespaces/{codespace_name}/start")
async def start_codespace(
    codespace_name: str,
    x_github_token: Optional[str] = Header(None)
):
    """Start a stopped codespace"""
    service = get_github_service(x_github_token)
    try:
        result = await service.start_codespace(codespace_name)
        return {"status": "starting", "codespace": codespace_name}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/codespaces/{codespace_name}/stop")
async def stop_codespace(
    codespace_name: str,
    x_github_token: Optional[str] = Header(None)
):
    """Stop a running codespace"""
    service = get_github_service(x_github_token)
    try:
        result = await service.stop_codespace(codespace_name)
        return {"status": "stopping", "codespace": codespace_name}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/codespaces")
async def create_codespace(
    request: CreateCodespaceRequest,
    x_github_token: Optional[str] = Header(None)
) -> CodespaceResponse:
    """Create a new codespace"""
    service = get_github_service(x_github_token)
    try:
        cs = await service.create_codespace(
            request.repo_owner,
            request.repo_name,
            request.branch,
            request.machine
        )
        return CodespaceResponse(
            id=cs.id,
            name=cs.name,
            display_name=cs.display_name,
            state=cs.state,
            repository=cs.repository,
            branch=cs.branch,
            machine_type=cs.machine_type,
            created_at=cs.created_at,
            updated_at=cs.updated_at,
            web_url=cs.web_url
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/codespaces/{codespace_name}")
async def delete_codespace(
    codespace_name: str,
    x_github_token: Optional[str] = Header(None)
):
    """Delete a codespace"""
    service = get_github_service(x_github_token)
    try:
        success = await service.delete_codespace(codespace_name)
        if success:
            return {"status": "deleted", "codespace": codespace_name}
        else:
            raise HTTPException(status_code=500, detail="Failed to delete codespace")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/repos")
async def list_repos(
    x_github_token: Optional[str] = Header(None),
    per_page: int = 30
):
    """List repositories accessible to the user"""
    service = get_github_service(x_github_token)
    try:
        return await service.list_repos(per_page)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/repos/{owner}/{repo}/machines")
async def get_machines(
    owner: str,
    repo: str,
    x_github_token: Optional[str] = Header(None)
):
    """Get available machine types for a repository"""
    service = get_github_service(x_github_token)
    try:
        return await service.get_codespace_machines(owner, repo)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
