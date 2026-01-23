"""
Projects Router - Manage development projects/workspaces
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid

router = APIRouter()

# In-memory store for MVP (replace with PostgreSQL later)
projects_db: dict = {}


class ProjectContext(BaseModel):
    """Project context configuration (tech stack, standards, etc.)"""
    tech_stack: Optional[str] = None
    standards: Optional[str] = None
    additional: Optional[str] = None


class ProjectCreate(BaseModel):
    """Full project creation data from Create Project form"""
    name: str
    description: Optional[str] = None
    brief: Optional[str] = None  # Project brief/description
    workspace: Optional[str] = "default"  # Workspace folder name
    color: str = "#3B82F6"  # Default blue

    # Connection source
    connection_type: Optional[str] = "github"  # 'github' or 'vps'
    github_repo: Optional[str] = None  # Full repo name (user/repo)
    vps_server_id: Optional[str] = None  # VPS server ID if using VPS

    # Project context (AI-generated or manual)
    context: Optional[ProjectContext] = None

    # Selected agents and MCP servers
    agent_ids: Optional[List[str]] = []
    mcp_server_ids: Optional[List[str]] = []


class Project(BaseModel):
    """Full project model"""
    id: str
    name: str
    description: Optional[str]
    brief: Optional[str]
    workspace: str
    color: str

    # Connection source
    connection_type: str
    github_repo: Optional[str]
    vps_server_id: Optional[str]

    # Project context
    context: Optional[ProjectContext]

    # Selected agents and MCP servers
    agent_ids: List[str]
    mcp_server_ids: List[str]

    # Status
    status: str = "active"  # 'active', 'archived', 'error'

    # Timestamps
    created_at: datetime
    updated_at: datetime


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    brief: Optional[str] = None
    workspace: Optional[str] = None
    color: Optional[str] = None
    connection_type: Optional[str] = None
    github_repo: Optional[str] = None
    vps_server_id: Optional[str] = None
    context: Optional[ProjectContext] = None
    agent_ids: Optional[List[str]] = None
    mcp_server_ids: Optional[List[str]] = None
    status: Optional[str] = None


@router.get("/")
async def list_projects() -> list[Project]:
    """List all projects"""
    return list(projects_db.values())


@router.post("/", response_model=Project)
async def create_project(project: ProjectCreate):
    """Create a new project with full configuration"""
    project_id = str(uuid.uuid4())
    now = datetime.utcnow()

    new_project = Project(
        id=project_id,
        name=project.name,
        description=project.description or project.brief,  # Use brief as description if not provided
        brief=project.brief,
        workspace=project.workspace or "default",
        color=project.color,
        connection_type=project.connection_type or "github",
        github_repo=project.github_repo,
        vps_server_id=project.vps_server_id,
        context=project.context,
        agent_ids=project.agent_ids or [],
        mcp_server_ids=project.mcp_server_ids or [],
        status="active",
        created_at=now,
        updated_at=now
    )

    projects_db[project_id] = new_project
    return new_project


@router.get("/{project_id}", response_model=Project)
async def get_project(project_id: str):
    """Get a specific project"""
    if project_id not in projects_db:
        raise HTTPException(status_code=404, detail="Project not found")
    return projects_db[project_id]


@router.patch("/{project_id}", response_model=Project)
async def update_project(project_id: str, update: ProjectUpdate):
    """Update a project"""
    if project_id not in projects_db:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project = projects_db[project_id]
    update_data = update.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(project, field, value)
    
    project.updated_at = datetime.utcnow()
    projects_db[project_id] = project
    
    return project


@router.delete("/{project_id}")
async def delete_project(project_id: str):
    """Delete a project"""
    if project_id not in projects_db:
        raise HTTPException(status_code=404, detail="Project not found")
    
    del projects_db[project_id]
    return {"status": "deleted", "id": project_id}


# Chat history per project
chat_history_db: dict = {}  # project_id -> list of messages


class ChatMessage(BaseModel):
    role: str
    content: str
    model: Optional[str] = None
    timestamp: datetime


@router.get("/{project_id}/history")
async def get_chat_history(project_id: str, limit: int = 50) -> list[ChatMessage]:
    """Get chat history for a project"""
    if project_id not in projects_db:
        raise HTTPException(status_code=404, detail="Project not found")
    
    history = chat_history_db.get(project_id, [])
    return history[-limit:]


@router.post("/{project_id}/history")
async def add_to_history(project_id: str, message: ChatMessage):
    """Add a message to project chat history"""
    if project_id not in projects_db:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project_id not in chat_history_db:
        chat_history_db[project_id] = []
    
    chat_history_db[project_id].append(message)
    return {"status": "added"}


@router.delete("/{project_id}/history")
async def clear_history(project_id: str):
    """Clear chat history for a project"""
    if project_id in chat_history_db:
        chat_history_db[project_id] = []
    return {"status": "cleared"}
