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


# =============================================================================
# Harness Template Strings (FEAT-30)
# =============================================================================

TEMPLATE_CLAUDE_MD = """# {{projectName}} — Project Rules

## Quick Start

1. Read this file + `harness/feature_queue.json` on every session
2. Pick the top `pending` task from the queue
3. Check `harness/learnings.md` for past debugging notes on the area
4. Check `harness/CODEBASE_INDEX.yaml` for file locations
5. Implement, test, update index, write learnings
6. Set task status to `pending_review`

## Project Info

| Field | Value |
|-------|-------|
| **Name** | {{projectName}} |
| **Stack** | {{techStack}} |
| **Created** | {{createdDate}} |

## Critical Patterns

### Always update the codebase index
After changing any file, update `harness/CODEBASE_INDEX.yaml`:
- Adjust line counts
- Update `purpose` if the file's role changed
- Add new files you created

### Always write learnings
After every task, add a session entry to `harness/learnings.md`:
- What you changed and why
- Key debugging insights
- Patterns discovered

### Task completion
When done with a task:
1. All `completion_checklist` items must be true
2. Write a `completion_note` with specific test evidence
3. Set status to `pending_review` — NEVER `done` or `completed`

### Prevent stale closures
```javascript
setState(prev => ({ ...prev, field: value }))  // good
setState({ ...state, field: value })            // stale
```

### API calls — always add timeout
```javascript
const controller = new AbortController()
const timeout = setTimeout(() => controller.abort(), 5000)
try {
  const res = await fetch(url, { signal: controller.signal })
} finally {
  clearTimeout(timeout)
}
```
"""

TEMPLATE_CLAUDE_SETTINGS = """{
  "permissions": {
    "allow": [
      "Bash(git *)",
      "Bash(npm *)",
      "Bash(npx *)",
      "Bash(node *)",
      "Bash(python *)",
      "Bash(pip *)",
      "Bash(ls *)",
      "Bash(cat *)",
      "Bash(mkdir *)",
      "Bash(cp *)",
      "Bash(mv *)"
    ],
    "deny": [
      "Bash(rm -rf /)",
      "Bash(sudo rm -rf *)"
    ]
  }
}
"""

TEMPLATE_GENERATE_PRP = """# Generate PRP

Read the project brief below and generate a comprehensive PRP (Product Requirements Prompt).

## Brief
$ARGUMENTS

## Output Format

Create a file at `PRPs/{{timestamp}}-prp.md` with these sections:

### 1. FEATURE
- What to build — specific functionality and requirements
- User stories with acceptance criteria
- Success metrics

### 2. PHASES
Break the feature into ordered implementation phases:
- Phase 1: Foundation (data models, API endpoints, basic UI)
- Phase 2: Core Logic (business rules, validation, error handling)
- Phase 3: Polish (edge cases, performance, UX refinements)

Each phase contains tasks with:
- Clear deliverable
- Files to create/modify (reference CODEBASE_INDEX.yaml)
- Test requirements (what must pass before moving on)

### 3. EXAMPLES
Code patterns to follow — pull from existing codebase:
- Import patterns
- Component structure
- API call patterns
- State management approach
- Error handling style

### 4. DOCUMENTATION
- Relevant API docs or external resources
- Dependencies to install
- Environment variables needed

### 5. OTHER CONSIDERATIONS
- Edge cases the AI commonly misses
- Security considerations
- Performance implications
- Accessibility requirements

After generating, add all tasks to `harness/feature_queue.json` with:
- Incremental IDs (FEAT-01, FEAT-02, etc.)
- Priority order matching phase sequence
- File paths from CODEBASE_INDEX.yaml
- Test requirements from the PRP
"""

TEMPLATE_EXECUTE_PRP = """# Execute PRP

Read the specified PRP and execute its task plan.

## PRP File
$ARGUMENTS

## Workflow

1. **Read the PRP** at the specified path
2. **Read** `harness/feature_queue.json` for current task state
3. **Find the first `pending` task** from the PRP's task list
4. **Before implementing**, check:
   - `harness/CODEBASE_INDEX.yaml` — know where files live
   - `harness/learnings.md` — check for relevant past debugging notes
5. **Implement the task**:
   - Follow the code patterns from the PRP's EXAMPLES section
   - Create/modify files as specified
   - Run tests if specified in the task
6. **After implementing**:
   - Update `harness/CODEBASE_INDEX.yaml` (line counts, new files, purposes)
   - Add entry to `harness/learnings.md`
   - Update task in `harness/feature_queue.json`:
     - Set completion_checklist items to true
     - Write completion_note with test evidence
     - Set status to `pending_review`
7. **Report** what was completed and what's next

Do NOT proceed to the next task automatically. One task per execution.
"""

TEMPLATE_FEATURE_QUEUE = """{
  "version": "1.0",
  "updated": "{{createdDate}}",
  "project": "{{projectName}}",
  "queue": [
    {
      "id": "DOCS-01",
      "name": "Generate initial CODEBASE_INDEX.yaml",
      "size": "S",
      "priority": 1,
      "status": "pending",
      "description": "Scan the project directory and populate harness/CODEBASE_INDEX.yaml with all source files, their line counts, purposes, and relationships. This is the foundation — every future task references this index.",
      "change": [
        "harness/CODEBASE_INDEX.yaml: Populate with all files in src/, their line counts, exports, imports, and purpose descriptions"
      ],
      "test": "Verify every file in src/ has an entry in the index. Line counts should match actual files.",
      "completion_note": "",
      "completion_checklist": {
        "code_works": false,
        "index_updated": false,
        "learnings_written": false,
        "committed_pushed": false,
        "status_set_to_pending_review": false
      }
    }
  ],
  "completed": []
}
"""

TEMPLATE_CODEBASE_INDEX = """# =============================================================================
# {{projectName}} — CODEBASE INDEX
# =============================================================================
# Single source of truth for codebase structure.
# Agent reads this to know where files live and what they do.
# Agent UPDATES this after every task that changes code.
#
# Created: {{createdDate}}
# Last updated: {{createdDate}}
# =============================================================================

meta:
  project: "{{projectName}}"
  stack: "{{techStack}}"
  created: "{{createdDate}}"
  last_updated: "{{createdDate}}"
  total_files: 0

# Populated by DOCS-01 task. Structure will look like:
#
# source_files:
#   src/App.jsx:
#     lines: 45
#     purpose: "Root component — renders layout and routes"
#     exports: [App]
#     imports: [react, react-router-dom]
#     last_verified_session: 1
#
# recurring_bugs:
#   - id: 1
#     pattern: "Description of the recurring issue"
#     fix: "How to fix it"
#     affected_files: [src/SomeFile.jsx]
"""

TEMPLATE_LEARNINGS = """# Session Learnings Log

Track discoveries, patterns, and friction points across development sessions.

---

### Session 1 - {{createdDate}}
**Task**: Project initialization
**What**: Harness scaffolded. CLAUDE.md configured with {{techStack}} stack.
**Key Learning**: Project created via HubLLM workspace. Harness template includes task queue, codebase index, and learnings log.

---
"""

TEMPLATE_README = """# {{projectName}}

{{projectBrief}}

## Getting Started

```bash
# Install dependencies
{{installCommand}}

# Start development server
{{startCommand}}
```

## Project Structure

See `harness/CODEBASE_INDEX.yaml` for a complete file map.

## Development

This project uses the HubLLM harness for AI-assisted development:

- **Task Queue**: `harness/feature_queue.json` — pending tasks and their status
- **Codebase Index**: `harness/CODEBASE_INDEX.yaml` — file map for agent awareness
- **Learnings**: `harness/learnings.md` — session-by-session debugging history
- **PRPs**: `PRPs/` — implementation blueprints generated from project briefs

### AI Commands

```bash
claude                  # Start a new Claude Code session
/generate-prp "brief"  # Generate implementation plan from a brief
/execute-prp PRPs/x.md # Execute tasks from a PRP
```
"""


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
) -> bool:
    """
    Create project folder on VPS and scaffold harness template files.

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
        subdirs = [".claude", ".claude/commands", "harness", "PRPs", "src"]
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
            "harness/feature_queue.json": TEMPLATE_FEATURE_QUEUE,
            "harness/CODEBASE_INDEX.yaml": TEMPLATE_CODEBASE_INDEX,
            "harness/learnings.md": TEMPLATE_LEARNINGS,
            "README.md": TEMPLATE_README,
            "PRPs/.gitkeep": "",
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

        # Git init + initial commit (non-blocking — failure doesn't fail project creation)
        try:
            await asyncio.wait_for(
                conn.run_command(
                    f"cd {project_path} && git init && git add -A && "
                    f'git commit -m "Initial commit — HubLLM harness scaffolded"',
                    timeout=15.0,
                ),
                timeout=20.0,
            )
            print(f"Git initialized in {project_path}")
        except Exception as e:
            print(f"Git init failed (non-blocking): {e}")

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

    # Create folder on VPS if VPS server is linked — scaffold harness template (FEAT-30)
    if project.vps_server_id:
        tech_stack = project.context.tech_stack if project.context else ""
        await create_vps_project_folder(
            vps_server_id=project.vps_server_id,
            project_slug=slug,
            project_name=project.name,
            tech_stack=tech_stack or "",
            brief=project.brief or "",
        )

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
