"""
Projects Router - Manage development projects/workspaces
"""
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse, Response
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
import base64
import io

from models import Project as ProjectModel, ChatMessage as ChatMessageModel, VPSServer as VPSServerModel, async_session
from services.ssh import get_connection, load_server_to_cache

from templates.harness_templates import (
    TEMPLATE_CLAUDE_MD, TEMPLATE_CLAUDE_SETTINGS, TEMPLATE_GENERATE_PRP,
    TEMPLATE_EXECUTE_PRP, TEMPLATE_FEATURE_QUEUE, TEMPLATE_CODEBASE_INDEX,
    TEMPLATE_LEARNINGS, TEMPLATE_README, TEMPLATE_ROADMAP,
    TEMPLATE_DIRECTOR_CLAUDE_MD, TEMPLATE_DIRECTOR_SETTINGS,
    TEMPLATE_DIRECTOR_SETTINGS_LOCAL, TEMPLATE_DIRECTOR_WELCOME,
    TEMPLATE_GETTING_STARTED_HTML, TEMPLATE_PRE_COMMIT_HOOK,
    TEMPLATE_AUDIT_INDEX, TEMPLATE_CODE_RESEARCHER, TEMPLATE_PORTABLE_README,
)

logger = logging.getLogger(__name__)

router = APIRouter()


# --- Template constants moved to backend/templates/ (FEAT-67) ---
# Previously ~1,250 lines of inline string constants lived here.
# Now loaded from separate files via templates/harness_templates.py.
# See backend/templates/harness/ for the actual template content.


def _detect_commands(tech_stack: str) -> tuple[str, str]:
    """Detect install and start commands from tech stack string."""
    ts = (tech_stack or "").lower()
    if any(k in ts for k in ["react", "next", "vue", "vite", "node", "javascript", "typescript"]):
        return "npm install", "npm run dev"
    if "django" in ts:
        return "pip install -r requirements.txt", "python manage.py runserver"
    if any(k in ts for k in ["fastapi", "flask", "python"]):
        return "pip install -r requirements.txt", "uvicorn main:app --reload"
    if "go" in ts:
        return "go mod download", "go run ."
    if "rust" in ts:
        return "cargo build", "cargo run"
    return "npm install", "npm run dev"


def _fill_template(template: str, variables: dict) -> str:
    """Replace {{placeholders}} in template with variable values."""
    result = template
    for key, value in variables.items():
        result = result.replace("{{" + key + "}}", value)
    return result


def slugify(name: str) -> str:
    """Convert name to URL-friendly slug"""
    slug = name.lower().strip()
    slug = re.sub(r'[^\w\s-]', '', slug)
    slug = re.sub(r'[\s_-]+', '-', slug)
    slug = slug.strip('-')
    return slug or 'project'


# VPS project folder base path
VPS_PROJECT_BASE = "/root/llm-hub-projects"


async def create_vps_project_folder(
    vps_server_id: str,
    project_slug: str,
    project_name: str = "",
    tech_stack: str = "",
    brief: str = "",
) -> dict:
    """
    Create project folder on VPS and scaffold harness template files.

    Returns dict with:
      - success: bool
      - warnings: list[str] (non-fatal issues like Director scaffold failure)
    Does not raise exceptions - prints errors instead.
    """
    warnings = []
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

        # Create project directory (BUG-76: wrap in try/except so recreating
        # a project with the same slug doesn't abort the entire scaffold)
        try:
            await asyncio.wait_for(conn.create_directory(project_path), timeout=5.0)
        except Exception:
            pass  # May already exist from previous project
        print(f"Created/verified VPS folder: {project_path}")

        # Scaffold harness template files (FEAT-30)
        created_date = datetime.utcnow().strftime("%Y-%m-%d")
        install_cmd, start_cmd = _detect_commands(tech_stack)
        variables = {
            "projectName": project_name or project_slug,
            "slug": project_slug,
            "techStack": tech_stack or "Not specified",
            "createdDate": created_date,
            "projectBrief": brief or f"A new project built with {tech_stack or 'modern tools'}",
            "installCommand": install_cmd,
            "startCommand": start_cmd,
        }

        # Create subdirectories
        subdirs = [".claude", ".claude/commands", ".claude/agents", "harness", "PRPs", "docs", "src"]
        for subdir in subdirs:
            try:
                await asyncio.wait_for(
                    conn.create_directory(f"{project_path}/{subdir}"), timeout=5.0
                )
            except Exception:
                pass  # May already exist

        # Write template files
        template_files = {
            "CLAUDE.md": TEMPLATE_CLAUDE_MD,
            ".claude/settings.json": TEMPLATE_CLAUDE_SETTINGS,
            ".claude/commands/generate-prp.md": TEMPLATE_GENERATE_PRP,
            ".claude/commands/execute-prp.md": TEMPLATE_EXECUTE_PRP,
            ".claude/commands/audit-index.md": TEMPLATE_AUDIT_INDEX,
            ".claude/agents/code-researcher.md": TEMPLATE_CODE_RESEARCHER,
            "harness/feature_queue.json": TEMPLATE_FEATURE_QUEUE,
            "harness/CODEBASE_INDEX.yaml": TEMPLATE_CODEBASE_INDEX,
            "harness/learnings.md": TEMPLATE_LEARNINGS,
            "README.md": TEMPLATE_README,
            "harness/ROADMAP.md": TEMPLATE_ROADMAP,
            "PRPs/.gitkeep": "",
            "docs/.gitkeep": "",
            "src/.gitkeep": "",
        }

        for file_path, template in template_files.items():
            content = _fill_template(template, variables) if template else ""
            try:
                await asyncio.wait_for(
                    conn.write_file(f"{project_path}/{file_path}", content), timeout=5.0
                )
            except Exception as e:
                print(f"Failed to write {file_path}: {e}")

        print(f"Scaffolded harness template in {project_path}")

        # Git init + pre-commit hook + initial commit (non-blocking)
        try:
            await asyncio.wait_for(
                conn.run_command(
                    f"cd {project_path} && git init",
                    timeout=10.0,
                ),
                timeout=15.0,
            )
            # Write pre-commit hook after git init creates .git/hooks/
            await asyncio.wait_for(
                conn.write_file(
                    f"{project_path}/.git/hooks/pre-commit",
                    TEMPLATE_PRE_COMMIT_HOOK,
                ),
                timeout=5.0,
            )
            await asyncio.wait_for(
                conn.run_command(
                    f"chmod +x {project_path}/.git/hooks/pre-commit",
                    timeout=5.0,
                ),
                timeout=10.0,
            )
            # Stage and commit
            await asyncio.wait_for(
                conn.run_command(
                    f'cd {project_path} && git add -A && '
                    f'git commit -m "Initial commit — HubLLM harness scaffolded" --no-verify',
                    timeout=15.0,
                ),
                timeout=20.0,
            )
            print(f"Git initialized with pre-commit hook in {project_path}")
        except Exception as e:
            print(f"Git init failed (non-blocking): {e}")

        # Scaffold Director directory alongside project (FEAT-55)
        director_path = f"{VPS_PROJECT_BASE}/{project_slug}-director"
        director_variables = {
            **variables,
            "appDir": project_path,
        }
        try:
            # Create director subdirectories
            for subdir in ["", ".claude", ".claude/commands"]:
                try:
                    await asyncio.wait_for(
                        conn.create_directory(
                            f"{director_path}/{subdir}" if subdir else director_path
                        ),
                        timeout=5.0,
                    )
                except Exception:
                    pass  # May already exist

            # Write director files
            director_files = {
                "CLAUDE.md": TEMPLATE_DIRECTOR_CLAUDE_MD,
                ".claude/settings.json": TEMPLATE_DIRECTOR_SETTINGS,
                ".claude/settings.local.json": TEMPLATE_DIRECTOR_SETTINGS_LOCAL,
                ".claude/commands/generate-prp.md": TEMPLATE_GENERATE_PRP,
                ".claude/commands/execute-prp.md": TEMPLATE_EXECUTE_PRP,
                ".welcome": TEMPLATE_DIRECTOR_WELCOME,
            }
            failed_files = []
            for file_path, template in director_files.items():
                content = _fill_template(template, director_variables)
                try:
                    await asyncio.wait_for(
                        conn.write_file(
                            f"{director_path}/{file_path}", content
                        ),
                        timeout=5.0,
                    )
                except Exception as e:
                    failed_files.append(file_path)
                    print(f"Failed to write director {file_path}: {e}")

            if failed_files:
                msg = f"Director scaffold partial failure: could not write {', '.join(failed_files)}"
                warnings.append(msg)
                print(msg)
            else:
                print(f"Scaffolded Director directory at {director_path}")
        except Exception as e:
            msg = f"Director scaffold failed: {e}"
            warnings.append(msg)
            print(msg)

        return {"success": True, "warnings": warnings}

    except asyncio.TimeoutError:
        print(f"Timeout creating VPS folder for {project_slug}")
        return {"success": False, "warnings": warnings}
    except Exception as e:
        print(f"Failed to create VPS folder for {project_slug}: {e}")
        return {"success": False, "warnings": warnings}


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

    # Scaffold warnings (populated on create if Director scaffold had issues)
    scaffold_warnings: Optional[List[str]] = None

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

    # Verify VPS server exists in DB before INSERT (prevents FK violation)
    if project.vps_server_id:
        async with async_session() as session:
            result = await session.execute(
                select(VPSServerModel).where(VPSServerModel.id == project.vps_server_id)
            )
            if not result.scalar_one_or_none():
                raise HTTPException(
                    status_code=400,
                    detail=f"VPS server '{project.vps_server_id}' not found. Please save the server in Settings first."
                )

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

    # Create folder on VPS if VPS server is linked — scaffold harness template (FEAT-30)
    if project.vps_server_id:
        tech_stack = project.context.tech_stack if project.context else ""
        result = await create_vps_project_folder(
            vps_server_id=project.vps_server_id,
            project_slug=slug,
            project_name=project.name,
            tech_stack=tech_stack or "",
            brief=project.brief or "",
        )
        if result.get("warnings"):
            response.scaffold_warnings = result["warnings"]

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


@router.get("/{project_id}/getting-started")
async def get_project_getting_started(project_id: str):
    """Render project-specific Getting Started page from template."""
    async with async_session() as session:
        result = await session.execute(select(ProjectModel).where(ProjectModel.id == project_id))
        project = result.scalar_one_or_none()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        variables = {
            "projectName": project.name,
            "slug": project.slug,
            "appDir": f"/root/llm-hub-projects/{project.slug}",
            "projectId": project_id,  # BUG-70: propagate to nav links
        }
        html = _fill_template(TEMPLATE_GETTING_STARTED_HTML, variables)
        return Response(content=html, media_type="text/html")


@router.post("/{project_id}/refresh-welcome")
async def refresh_welcome(project_id: str):
    """BUG-68: Re-write .welcome to VPS with latest template. Called on terminal connect."""
    async with async_session() as session:
        result = await session.execute(select(ProjectModel).where(ProjectModel.id == project_id))
        project = result.scalar_one_or_none()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        if not project.vps_server_id:
            raise HTTPException(status_code=400, detail="Project has no VPS server")

        project_path = f"{VPS_PROJECT_BASE}/{project.slug}"
        director_path = f"{VPS_PROJECT_BASE}/{project.slug}-director"
        variables = {
            "projectName": project.name,
            "slug": project.slug,
            "techStack": "Not specified",
            "createdDate": "",
            "projectBrief": "",
            "installCommand": "",
            "startCommand": "",
            "appDir": project_path,
        }
        content = _fill_template(TEMPLATE_DIRECTOR_WELCOME, variables)

        try:
            await load_server_to_cache(
                (await session.execute(
                    select(VPSServerModel).where(VPSServerModel.id == project.vps_server_id)
                )).scalar_one_or_none()
            )
            conn = await asyncio.wait_for(get_connection(project.vps_server_id), timeout=10.0)
            await asyncio.wait_for(
                conn.write_file(f"{director_path}/.welcome", content),
                timeout=5.0,
            )
            return {"status": "ok"}
        except Exception as e:
            logger.warning(f"refresh-welcome failed for {project.slug}: {e}")
            raise HTTPException(status_code=502, detail=f"Failed to write .welcome: {e}")


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


# =============================================================================
# FEAT-51: Export Project
# --- TEMPLATE_PORTABLE_README moved to backend/templates/ (FEAT-67) ---
# =============================================================================


@router.get("/{project_id}/export")
async def export_project(project_id: str):
    """Export project as .tar.gz download from VPS"""
    # Look up project
    async with async_session() as session:
        result = await session.execute(
            select(ProjectModel).where(ProjectModel.id == project_id)
        )
        project = result.scalar_one_or_none()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        if not project.vps_server_id:
            raise HTTPException(status_code=400, detail="Project has no VPS server linked")

        slug = project.slug
        server_id = project.vps_server_id

    # Load server and get SSH connection
    async with async_session() as session:
        result = await session.execute(
            select(VPSServerModel).where(VPSServerModel.id == server_id)
        )
        server_model = result.scalar_one_or_none()
        if not server_model:
            raise HTTPException(status_code=404, detail="VPS server not found")
        await load_server_to_cache(server_model)

    try:
        conn = await get_connection(server_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"SSH connection failed: {e}")

    project_path = f"/root/llm-hub-projects/{slug}"
    export_path = f"/tmp/{slug}-export.tar.gz"

    try:
        # Write PORTABLE_README.md into the project folder
        readme_content = TEMPLATE_PORTABLE_README.format(
            date=datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")
        )
        await asyncio.wait_for(
            conn.write_file(f"{project_path}/PORTABLE_README.md", readme_content),
            timeout=10.0
        )

        # Create tar.gz excluding bloat
        tar_cmd = (
            f"cd /root/llm-hub-projects && tar -czf {export_path} "
            f"--exclude='node_modules' --exclude='__pycache__' --exclude='.venv' "
            f"--exclude='*.pyc' --exclude='.next' --exclude='dist' "
            f"--exclude='.nuxt' --exclude='target' "
            f"{slug}/"
        )
        stdout, stderr, exit_code = await asyncio.wait_for(
            conn.run_command(tar_cmd, timeout=60.0),
            timeout=65.0
        )

        if exit_code != 0:
            raise HTTPException(
                status_code=500,
                detail=f"tar failed: {stderr.strip() or 'unknown error'}"
            )

        # Read the tar.gz as base64 (reliable for binary over SSH)
        read_cmd = f"base64 {export_path}"
        stdout, stderr, exit_code = await asyncio.wait_for(
            conn.run_command(read_cmd, timeout=60.0),
            timeout=65.0
        )

        if exit_code != 0:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to read export: {stderr.strip()}"
            )

        file_bytes = base64.b64decode(stdout.strip())

        # Clean up temp file (non-blocking, best-effort)
        asyncio.create_task(_cleanup_export(conn, export_path))

        return StreamingResponse(
            io.BytesIO(file_bytes),
            media_type="application/gzip",
            headers={
                "Content-Disposition": f'attachment; filename="{slug}-export.tar.gz"',
                "Content-Length": str(len(file_bytes))
            }
        )

    except HTTPException:
        raise
    except asyncio.TimeoutError:
        raise HTTPException(status_code=504, detail="Export timed out — project may be too large")
    except Exception as e:
        logger.error(f"Export failed for {project_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")


async def _cleanup_export(conn, export_path: str):
    """Best-effort cleanup of temp export file"""
    try:
        await conn.run_command(f"rm -f {export_path}", timeout=5.0)
    except Exception:
        pass
