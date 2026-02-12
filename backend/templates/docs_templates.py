"""
Docs template loader — reads doc page content files and exports them as constants.

These constants are imported by backend/routers/docs.py and used to render
the documentation portal at /api/docs/*.

See backend/templates/docs/ for the actual content files.
"""
from pathlib import Path

_DIR = Path(__file__).parent


def _load(subpath: str) -> str:
    return (_DIR / subpath).read_text()


# ---------------------------------------------------------------------------
# Shared styles
# ---------------------------------------------------------------------------
DOCS_CSS = _load("docs/styles.css")

# ---------------------------------------------------------------------------
# Page content
# ---------------------------------------------------------------------------
CONTENT_HOME = _load("docs/home.html")
HOME_SEARCH_JS = _load("docs/home-search.js")
CONTENT_WORKSPACE = _load("docs/workspace.html")
CONTENT_GIT = _load("docs/git.html")
CONTENT_WHATS_NEW = _load("docs/whats-new.html")
CONTENT_HARNESS = _load("docs/harness.html")
CONTENT_GETTING_STARTED = _load("docs/getting-started.html")
