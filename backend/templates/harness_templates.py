"""
Harness template loader — reads template files and exports them as constants.

These constants are imported by backend/routers/projects.py and used during
project scaffolding on VPS. Each constant maps to a file that gets written
to the user's project directory.

See backend/templates/harness/ for the actual template content.
"""
from pathlib import Path

_DIR = Path(__file__).parent


def _load(subpath: str) -> str:
    return (_DIR / subpath).read_text()


# ---------------------------------------------------------------------------
# Engineer templates (scaffolded into the project directory)
# ---------------------------------------------------------------------------
TEMPLATE_CLAUDE_MD = _load("harness/engineer/claude.md")
TEMPLATE_CLAUDE_SETTINGS = _load("harness/engineer/claude-settings.json")
TEMPLATE_FEATURE_QUEUE = _load("harness/engineer/feature-queue.json")
TEMPLATE_CODEBASE_INDEX = _load("harness/engineer/codebase-index.yaml")
TEMPLATE_LEARNINGS = _load("harness/engineer/learnings.md")
TEMPLATE_README = _load("harness/engineer/readme.md")
TEMPLATE_ROADMAP = _load("harness/engineer/roadmap.md")
TEMPLATE_PRE_COMMIT_HOOK = _load("harness/engineer/pre-commit-hook.sh")
TEMPLATE_AUDIT_INDEX = _load("harness/engineer/audit-index.md")
TEMPLATE_CODE_RESEARCHER = _load("harness/engineer/code-researcher.md")

# ---------------------------------------------------------------------------
# Director templates (scaffolded into {slug}-director/)
# ---------------------------------------------------------------------------
TEMPLATE_DIRECTOR_CLAUDE_MD = _load("harness/director/claude.md")
TEMPLATE_DIRECTOR_SETTINGS = _load("harness/director/claude-settings.json")
TEMPLATE_DIRECTOR_SETTINGS_LOCAL = _load("harness/director/claude-settings-local.json")
TEMPLATE_DIRECTOR_WELCOME = _load("harness/director/welcome.sh")

# ---------------------------------------------------------------------------
# Shared templates (used by both Engineer and Director)
# ---------------------------------------------------------------------------
TEMPLATE_GENERATE_PRP = _load("harness/shared/generate-prp.md")
TEMPLATE_EXECUTE_PRP = _load("harness/shared/execute-prp.md")

# ---------------------------------------------------------------------------
# Pages (served via API endpoints)
# ---------------------------------------------------------------------------
TEMPLATE_GETTING_STARTED_HTML = _load("harness/pages/getting-started.html")

# ---------------------------------------------------------------------------
# Export (project download)
# ---------------------------------------------------------------------------
TEMPLATE_PORTABLE_README = _load("export/portable-readme.md")
