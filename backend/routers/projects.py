"""
Projects Router - Manage development projects/workspaces
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
import json
import re
import logging
import asyncio

from models import Project as ProjectModel, ChatMessage as ChatMessageModel, VPSServer as VPSServerModel, async_session
from services.ssh import get_connection, load_server_to_cache

logger = logging.getLogger(__name__)

router = APIRouter()


def slugify(name: str) -> str:
    """Convert name to URL-friendly slug"""
    slug = name.lower().strip()
    slug = re.sub(r'[^\w\s-]', '', slug)
    slug = re.sub(r'[\s_-]+', '-', slug)
    slug = slug.strip('-')
    return slug or 'project'


# VPS project folder base path
VPS_PROJECT_BASE = "/root/llm-hub-projects"


async def create_vps_project_folder(vps_server_id: str, project_slug: str) -> bool:
    """
    Create project folder on VPS: /root/llm-hub-projects/{project_slug}/

    Returns True if successful, False otherwise.
    Does not raise exceptions - prints errors instead.
    """
    print(f"Creating VPS folder: {VPS_PROJECT_BASE}/{project_slug}")
    try:
        # Ensure server is loaded in cache
        async with async_session() as session:
            result = await session.execute(
                select(VPSServerModel).where(VPSServerModel.id == vps_server_id)
            )
            server = result.scalar_one_or_none()
            if not server:
                print(f"VPS server {vps_server_id} not found for folder creation")
                return False
            await load_server_to_cache(server)

        # Get SSH connection with timeout
        conn = await asyncio.wait_for(get_connection(vps_server_id), timeout=10.0)

        project_path = f"{VPS_PROJECT_BASE}/{project_slug}"

        # Create base directory if it doesn't exist
        try:
            await asyncio.wait_for(conn.create_directory(VPS_PROJECT_BASE), timeout=5.0)
        except Exception:
            pass  # Directory likely already exists

        # Create project directory
        await asyncio.wait_for(conn.create_directory(project_path), timeout=5.0)
        print(f"Created VPS folder: {project_path}")
        return True

    except asyncio.TimeoutError:
        print(f"Timeout creating VPS folder for {project_slug}")
        return False
    except Exception as e:
        print(f"Failed to create VPS folder for {project_slug}: {e}")
        return False


class ProjectContext(BaseModel):
    """Project context configuration (tech stack, standards, etc.)"""
    tech_stack: Optional[str] = None
    standards: Optional[str] = None
    additional: Optional[str] = None


class ProjectCreate(BaseModel):
    """Full project creation data from Create Project form"""
    name: str
    description: Optional[str] = None
    brief: Optional[str] = None
    workspace: Optional[str] = "default"
    color: str = "#3B82F6"

    # Connection source
    connection_type: Optional[str] = "github"  # 'github' or 'vps'
    github_repo: Optional[str] = None
    vps_server_id: Optional[str] = None

    # Project context
    context: Optional[ProjectContext] = None

    # Selected agents and MCP servers
    agent_ids: Optional[List[str]] = []
    mcp_server_ids: Optional[List[str]] = []


class ProjectResponse(BaseModel):
    """Full project model"""
    id: str
    name: str
    slug: str
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
    status: str

    # Selected model
    selected_model: Optional[dict] = None

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
    selected_model: Optional[dict] = None


def db_to_response(project: ProjectModel) -> ProjectResponse:
    """Convert database model to response"""
    context = None
    if project.context:
        try:
            ctx_data = json.loads(project.context)
            context = ProjectContext(**ctx_data)
        except:
            pass

    return ProjectResponse(
        id=project.id,
        name=project.name,
        slug=project.slug,
        description=project.description,
        brief=project.brief,
        workspace=project.workspace,
        color=project.color,
        connection_type=project.connection_type,
        github_repo=project.github_repo,
        vps_server_id=project.vps_server_id,
        context=context,
        agent_ids=json.loads(project.agent_ids) if project.agent_ids else [],
        mcp_server_ids=json.loads(project.mcp_server_ids) if project.mcp_server_ids else [],
        status=project.status,
        selected_model=json.loads(project.selected_model) if project.selected_model else None,
        created_at=project.created_at,
        updated_at=project.updated_at
    )


@router.get("/")
async def list_projects() -> list[ProjectResponse]:
    """List all projects"""
    async with async_session() as session:
        result = await session.execute(select(ProjectModel).order_by(ProjectModel.created_at.desc()))
        projects = result.scalars().all()
        return [db_to_response(p) for p in projects]


@router.post("/", response_model=ProjectResponse)
async def create_project(project: ProjectCreate):
    """Create a new project with full configuration"""
    project_id = str(uuid.uuid4())
    now = datetime.utcnow()
    slug = slugify(project.name)

    new_project = ProjectModel(
        id=project_id,
        name=project.name,
        slug=slug,
        description=project.description or project.brief,
        brief=project.brief,
        workspace=project.workspace or "default",
        color=project.color,
        connection_type=project.connection_type or "github",
        github_repo=project.github_repo,
        vps_server_id=project.vps_server_id,
        context=json.dumps(project.context.model_dump()) if project.context else None,
        agent_ids=json.dumps(project.agent_ids or []),
        mcp_server_ids=json.dumps(project.mcp_server_ids or []),
        status="active",
        created_at=now,
        updated_at=now
    )

    async with async_session() as session:
        session.add(new_project)
        await session.commit()
        await session.refresh(new_project)
        response = db_to_response(new_project)

    # Create folder on VPS if VPS server is linked
    if project.vps_server_id:
        await create_vps_project_folder(project.vps_server_id, slug)

    return response


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: str):
    """Get a specific project"""
    async with async_session() as session:
        result = await session.execute(select(ProjectModel).where(ProjectModel.id == project_id))
        project = result.scalar_one_or_none()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        return db_to_response(project)


@router.patch("/{project_id}", response_model=ProjectResponse)
async def update_project(project_id: str, update: ProjectUpdate):
    """Update a project"""
    async with async_session() as session:
        result = await session.execute(select(ProjectModel).where(ProjectModel.id == project_id))
        project = result.scalar_one_or_none()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        update_data = update.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            if field == "context" and value is not None:
                setattr(project, field, json.dumps(value.model_dump() if hasattr(value, 'model_dump') else value))
            elif field in ("agent_ids", "mcp_server_ids") and value is not None:
                setattr(project, field, json.dumps(value))
            elif field == "selected_model" and value is not None:
                setattr(project, field, json.dumps(value))
            elif field == "name" and value is not None:
                setattr(project, field, value)
                project.slug = slugify(value)
            else:
                setattr(project, field, value)

        project.updated_at = datetime.utcnow()
        await session.commit()
        await session.refresh(project)

        return db_to_response(project)


@router.delete("/{project_id}")
async def delete_project(project_id: str):
    """Delete a project"""
    async with async_session() as session:
        result = await session.execute(select(ProjectModel).where(ProjectModel.id == project_id))
        project = result.scalar_one_or_none()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        # Delete associated chat messages first
        await session.execute(delete(ChatMessageModel).where(ChatMessageModel.project_id == project_id))
        await session.delete(project)
        await session.commit()

        return {"status": "deleted", "id": project_id}


# Chat history per project
class ChatMessage(BaseModel):
    role: str
    content: str
    model: Optional[str] = None
    timestamp: datetime


@router.get("/{project_id}/history")
async def get_chat_history(project_id: str, limit: int = 50) -> list[ChatMessage]:
    """Get chat history for a project"""
    async with async_session() as session:
        # Verify project exists
        result = await session.execute(select(ProjectModel).where(ProjectModel.id == project_id))
        if not result.scalar_one_or_none():
            raise HTTPException(status_code=404, detail="Project not found")

        # Get messages
        result = await session.execute(
            select(ChatMessageModel)
            .where(ChatMessageModel.project_id == project_id)
            .order_by(ChatMessageModel.timestamp.desc())
            .limit(limit)
        )
        messages = result.scalars().all()

        # Return in chronological order
        return [
            ChatMessage(
                role=m.role,
                content=m.content,
                model=m.model,
                timestamp=m.timestamp
            )
            for m in reversed(messages)
        ]


@router.post("/{project_id}/history")
async def add_to_history(project_id: str, message: ChatMessage):
    """Add a message to project chat history"""
    async with async_session() as session:
        # Verify project exists
        result = await session.execute(select(ProjectModel).where(ProjectModel.id == project_id))
        if not result.scalar_one_or_none():
            raise HTTPException(status_code=404, detail="Project not found")

        new_message = ChatMessageModel(
            project_id=project_id,
            role=message.role,
            content=message.content,
            model=message.model,
            timestamp=message.timestamp
        )
        session.add(new_message)
        await session.commit()

        return {"status": "added"}


@router.delete("/{project_id}/history")
async def clear_history(project_id: str):
    """Clear chat history for a project"""
    async with async_session() as session:
        await session.execute(
            delete(ChatMessageModel).where(ChatMessageModel.project_id == project_id)
        )
        await session.commit()
        return {"status": "cleared"}
