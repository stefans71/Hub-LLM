"""
Docs Router — Dynamic documentation pages (FEAT-64)

All doc pages are self-contained HTML with inline CSS and baked-in nav sidebar.
Template content lives in backend/templates/docs/ — edit there, deploy, all users see the update.
"""
from fastapi import APIRouter
from fastapi.responses import HTMLResponse

from templates.docs_templates import (
    DOCS_CSS, CONTENT_HOME, HOME_SEARCH_JS, CONTENT_WORKSPACE,
    CONTENT_GIT, CONTENT_WHATS_NEW, CONTENT_HARNESS, CONTENT_GETTING_STARTED,
)

router = APIRouter()


# --- CSS and page content moved to backend/templates/docs/ (FEAT-67) ---
# Previously ~595 lines of inline string constants lived here.
# Now loaded from separate files via templates/docs_templates.py.

# ---------------------------------------------------------------------------
# Nav sidebar builder
# ---------------------------------------------------------------------------
_NAV_PAGES = [
    ("home", "Home", "/api/docs/home",
     '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>'),
    ("getting-started", "Getting Started", "/api/docs/getting-started",
     '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>'),
    ("workspace", "Workspace Guide", "/api/docs/workspace-guide",
     '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>'),
    ("git", "Git &amp; GitHub", "/api/docs/git-github",
     '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="3" x2="6" y2="15"></line><circle cx="18" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><path d="M18 9a9 9 0 0 1-9 9"></path></svg>'),
    ("whats-new", "What's New", "/api/docs/whats-new",
     '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>'),
    ("harness", "Harness System", "/api/docs/harness",
     '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>'),
]


def _nav_sidebar(active: str) -> str:
    links = ""
    for page_id, label, href, icon in _NAV_PAGES:
        cls = ' class="active"' if page_id == active else ""
        links += f'      <a href="{href}"{cls}><span class="nav-icon">{icon}</span>{label}</a>\n'
    return (
        '  <div class="docs-sidebar">\n'
        '    <div class="sidebar-brand">\n'
        '      <div class="logo"><span class="logo-hub">Hub</span>'
        '<span class="logo-llm">LLM</span><span class="logo-dev">.dev</span></div>\n'
        '      <div class="brand-tagline">A VibeShip Creation</div>\n'
        '    </div>\n'
        f'    <nav>\n{links}    </nav>\n'
        '  </div>\n'
    )


def _docs_page(title: str, active: str, content: str, extra_js: str = "") -> str:
    return (
        '<!DOCTYPE html>\n<html lang="en">\n<head>\n'
        '<meta charset="UTF-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
        f'<title>{title} — HubLLM Docs</title>\n'
        f'<style>{DOCS_CSS}</style>\n'
        '</head>\n<body>\n'
        '<div class="docs-layout">\n'
        f'{_nav_sidebar(active)}'
        f'  <div class="docs-content">\n{content}\n  </div>\n'
        '</div>\n'
        f'{extra_js}\n'
        # BUG-70: Propagate projectId through nav links so Getting Started
        # points back to the project-specific page, not the generic docs version
        '<script>\n'
        '(function() {\n'
        '  var pid = new URLSearchParams(location.search).get("projectId");\n'
        '  if (!pid) return;\n'
        '  document.querySelectorAll(".docs-sidebar nav a").forEach(function(a) {\n'
        '    var text = a.textContent.trim();\n'
        '    if (text === "Getting Started") {\n'
        '      a.href = "/api/projects/" + pid + "/getting-started";\n'
        '    } else if (a.href && a.href.indexOf("projectId=") === -1) {\n'
        '      a.href += (a.href.indexOf("?") !== -1 ? "&" : "?") + "projectId=" + pid;\n'
        '    }\n'
        '  });\n'
        '})();\n'
        '</script>\n'
        '</body>\n</html>'
    )


# --- Page content constants moved to backend/templates/docs/ (FEAT-67) ---


@router.get("/getting-started")
async def docs_getting_started():
    return HTMLResponse(_docs_page("Getting Started", "getting-started", CONTENT_GETTING_STARTED))


@router.get("/home")
async def docs_home():
    return HTMLResponse(_docs_page("HubLLM Documentation", "home", CONTENT_HOME, HOME_SEARCH_JS))


@router.get("/workspace-guide")
async def docs_workspace():
    return HTMLResponse(_docs_page("Workspace Guide", "workspace", CONTENT_WORKSPACE))


@router.get("/git-github")
async def docs_git():
    return HTMLResponse(_docs_page("Git & GitHub", "git", CONTENT_GIT))


@router.get("/whats-new")
async def docs_whats_new():
    return HTMLResponse(_docs_page("What's New", "whats-new", CONTENT_WHATS_NEW))


@router.get("/harness")
async def docs_harness():
    return HTMLResponse(_docs_page("Harness System", "harness", CONTENT_HARNESS))
