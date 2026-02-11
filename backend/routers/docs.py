"""
Docs Router — Dynamic documentation pages (FEAT-64)

All doc pages are self-contained HTML with inline CSS and baked-in nav sidebar.
Update a template here → deploy → all users see the update instantly.
"""
from fastapi import APIRouter
from fastapi.responses import HTMLResponse

router = APIRouter()


# ---------------------------------------------------------------------------
# Shared CSS (adapted from frontend/public/docs/styles.css)
# ---------------------------------------------------------------------------
DOCS_CSS = """
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  background: linear-gradient(145deg, #0a0f1a 0%, #0d1520 50%, #080c14 100%);
  color: #e0e0e0; line-height: 1.6; min-height: 100vh;
}
.docs-layout { display: flex; min-height: 100vh; }
.docs-sidebar {
  width: 220px; min-width: 220px;
  background: linear-gradient(180deg, #0d1520 0%, #0a0f1a 100%);
  border-right: 1px solid rgba(56, 189, 248, 0.12);
  padding: 20px 0; display: flex; flex-direction: column;
}
.docs-sidebar .sidebar-brand {
  padding: 0 16px 16px; border-bottom: 1px solid rgba(56, 189, 248, 0.1);
  margin-bottom: 12px; text-align: center;
}
.docs-sidebar .sidebar-brand .logo { font-size: 22px; font-weight: 700; }
.docs-sidebar .sidebar-brand .brand-tagline {
  font-size: 11px; color: #00d4aa; letter-spacing: 0.5px; margin-top: 2px;
}
.docs-sidebar nav { padding: 0 8px; display: flex; flex-direction: column; gap: 2px; }
.docs-sidebar nav a {
  display: flex; align-items: center; gap: 10px; padding: 9px 14px;
  color: #94a3b8; text-decoration: none; font-size: 13px; border-radius: 6px;
}
.docs-sidebar nav a:hover { background: rgba(56, 189, 248, 0.08); color: #e0e0e0; }
.docs-sidebar nav a.active {
  background: rgba(56, 189, 248, 0.12); color: #38bdf8; font-weight: 600;
}
.docs-sidebar nav a .nav-icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 20px; flex-shrink: 0;
}
.docs-content { flex: 1; max-width: 780px; padding: 32px 32px 64px; overflow-y: auto; }
.logo-hub { color: #fff; }
.logo-llm { color: #38bdf8; }
.logo-dev { color: rgba(150, 180, 200, 0.5); }
.page-header { margin-bottom: 32px; padding-bottom: 20px; border-bottom: 1px solid rgba(56, 189, 248, 0.15); }
.page-header h1 { font-size: 24px; font-weight: 700; color: #fff; margin-bottom: 6px; }
.page-header .page-desc { font-size: 14px; color: rgba(150, 180, 200, 0.7); }
.section {
  background: linear-gradient(135deg, #1a2535 0%, #0f1620 100%);
  border: 1px solid rgba(56, 189, 248, 0.12); border-radius: 12px;
  padding: 24px; margin-bottom: 20px;
}
.section-number {
  display: inline-block; width: 28px; height: 28px; line-height: 28px;
  text-align: center; background: rgba(56, 189, 248, 0.15); color: #38bdf8;
  border-radius: 50%; font-size: 13px; font-weight: 600; margin-right: 10px;
  vertical-align: middle;
}
h2 { font-size: 18px; font-weight: 600; color: #fff; margin-bottom: 14px; display: inline; vertical-align: middle; }
h3 { font-size: 15px; font-weight: 600; color: #38bdf8; margin: 16px 0 8px; }
p { font-size: 14px; color: #c0c8d4; margin-bottom: 10px; }
.steps { list-style: none; margin: 14px 0; }
.steps li {
  position: relative; padding: 10px 12px 10px 40px; margin-bottom: 8px;
  background: rgba(56, 189, 248, 0.04); border: 1px solid rgba(56, 189, 248, 0.08);
  border-radius: 8px; font-size: 14px; color: #d0d8e4;
}
.steps li .step-num { position: absolute; left: 12px; top: 10px; color: #38bdf8; font-weight: 600; font-size: 13px; }
code {
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  background: rgba(56, 189, 248, 0.1); color: #38bdf8; padding: 2px 6px;
  border-radius: 4px; font-size: 13px;
}
.code-block {
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  background: #0d0d0d; border: 1px solid rgba(56, 189, 248, 0.1);
  border-radius: 8px; padding: 14px 16px; font-size: 13px; color: #c0c8d4;
  overflow-x: auto; margin: 10px 0; line-height: 1.5;
}
.code-block .cmd { color: #22c55e; }
.code-block .comment { color: #64748b; }
.code-block .flag { color: #f97316; }
.workspace-diagram {
  display: grid; grid-template-columns: auto 1fr auto; grid-template-rows: auto 1fr auto;
  gap: 4px; margin: 14px 0; font-size: 12px;
}
.diagram-cell {
  background: rgba(56, 189, 248, 0.06); border: 1px solid rgba(56, 189, 248, 0.12);
  border-radius: 6px; padding: 8px 10px; text-align: center; color: #94a3b8;
}
.diagram-cell.active { border-color: rgba(249, 115, 22, 0.4); background: rgba(249, 115, 22, 0.06); color: #f97316; }
.diagram-cell.highlight { border-color: rgba(56, 189, 248, 0.3); color: #38bdf8; }
.diagram-label { font-weight: 600; display: block; margin-bottom: 2px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
a { color: #38bdf8; text-decoration: none; }
a:hover { text-decoration: underline; }
.link-row { display: flex; gap: 16px; margin: 10px 0; flex-wrap: wrap; }
.link-btn {
  display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px;
  background: rgba(56, 189, 248, 0.08); border: 1px solid rgba(56, 189, 248, 0.2);
  border-radius: 8px; color: #38bdf8; font-size: 13px; text-decoration: none;
}
.link-btn:hover { background: rgba(56, 189, 248, 0.15); border-color: rgba(56, 189, 248, 0.4); text-decoration: none; }
.link-btn svg { width: 14px; height: 14px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.tip {
  background: rgba(249, 115, 22, 0.06); border: 1px solid rgba(249, 115, 22, 0.15);
  border-radius: 8px; padding: 12px 14px; font-size: 13px; color: #d0d8e4; margin: 10px 0;
}
.tip-label { color: #f97316; font-weight: 600; margin-right: 6px; }
.footer {
  text-align: center; margin-top: 32px; padding-top: 20px;
  border-top: 1px solid rgba(56, 189, 248, 0.1); color: rgba(150, 180, 200, 0.5);
}
.footer .footer-brand { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
.footer .footer-tagline { font-size: 12px; color: #00d4aa; }
.card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; margin: 20px 0; }
.card {
  background: linear-gradient(135deg, #1a2535 0%, #0f1620 100%);
  border: 1px solid rgba(56, 189, 248, 0.12); border-radius: 12px; padding: 20px;
  text-decoration: none; color: inherit; display: block;
}
.card:hover { border-color: rgba(56, 189, 248, 0.35); transform: translateY(-2px); text-decoration: none; }
.card .card-icon { font-size: 28px; margin-bottom: 10px; }
.card .card-title { font-size: 15px; font-weight: 600; color: #fff; margin-bottom: 6px; }
.card .card-desc { font-size: 13px; color: #94a3b8; line-height: 1.5; }
.whats-new-preview {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(249, 115, 22, 0.03) 100%);
  border: 1px solid rgba(249, 115, 22, 0.18); border-radius: 12px; padding: 18px 20px; margin-bottom: 24px;
}
.whats-new-preview .wn-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.whats-new-preview .wn-title { font-size: 14px; font-weight: 600; color: #f97316; }
.whats-new-preview .wn-link { font-size: 12px; color: #38bdf8; }
.whats-new-preview .wn-item { font-size: 13px; color: #c0c8d4; padding: 4px 0; }
.whats-new-preview .wn-date { color: #64748b; font-size: 12px; margin-right: 8px; }
.search-bar { margin-bottom: 24px; position: relative; }
.search-bar input {
  width: 100%; padding: 10px 16px 10px 40px;
  background: rgba(56, 189, 248, 0.06); border: 1px solid rgba(56, 189, 248, 0.15);
  border-radius: 10px; color: #e0e0e0; font-size: 14px; font-family: inherit; outline: none;
}
.search-bar input::placeholder { color: #64748b; }
.search-bar input:focus { border-color: rgba(56, 189, 248, 0.4); }
.search-bar .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #64748b; font-size: 16px; pointer-events: none; }
.changelog-entry {
  background: linear-gradient(135deg, #1a2535 0%, #0f1620 100%);
  border: 1px solid rgba(56, 189, 248, 0.12); border-radius: 12px;
  padding: 20px 24px; margin-bottom: 16px;
}
.changelog-entry .cl-date { font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
.changelog-entry .cl-title { font-size: 16px; font-weight: 600; color: #fff; margin-bottom: 8px; }
.changelog-entry .cl-body { font-size: 14px; color: #c0c8d4; }
.changelog-entry .cl-body ul { list-style: none; margin: 8px 0; }
.changelog-entry .cl-body ul li { padding: 3px 0 3px 18px; position: relative; }
.changelog-entry .cl-body ul li::before { content: '>'; position: absolute; left: 0; color: #f97316; font-weight: 600; }
.changelog-tag { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-right: 8px; }
.changelog-tag.feature { background: rgba(56, 189, 248, 0.15); color: #38bdf8; }
.changelog-tag.fix { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
.changelog-tag.improvement { background: rgba(249, 115, 22, 0.15); color: #f97316; }
mark { background: rgba(249, 115, 22, 0.35); color: #fff; padding: 1px 2px; border-radius: 2px; }
@media (max-width: 600px) {
  .docs-layout { flex-direction: column; }
  .docs-sidebar { width: 100%; min-width: 0; border-right: none; border-bottom: 1px solid rgba(56, 189, 248, 0.12); padding: 12px 0; }
  .docs-sidebar nav { flex-direction: row; flex-wrap: wrap; gap: 4px; }
  .docs-sidebar nav a { padding: 6px 10px; font-size: 12px; }
  .docs-content { padding: 20px 16px 48px; }
  .card-grid { grid-template-columns: 1fr; }
}
"""


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


# ---------------------------------------------------------------------------
# Page content constants
# ---------------------------------------------------------------------------

CONTENT_HOME = """\
  <div class="page-header">
    <h1>HubLLM Documentation</h1>
    <p class="page-desc">Everything you need to build with AI &mdash; guides, references, and tips.</p>
  </div>

  <div class="search-bar">
    <span class="search-icon">&#128269;</span>
    <input type="text" placeholder="Search this page..." />
  </div>

  <div class="whats-new-preview">
    <div class="wn-header">
      <span class="wn-title">What's New</span>
      <a href="/api/docs/whats-new" class="wn-link">View all &rarr;</a>
    </div>
    <div class="wn-item"><span class="wn-date">Feb 2026</span> Docs portal launched &mdash; multi-page help center with search</div>
    <div class="wn-item"><span class="wn-date">Feb 2026</span> VibeShip CTA button added to OpenRouter setup</div>
    <div class="wn-item"><span class="wn-date">Feb 2026</span> GitHub OAuth error handling improved</div>
  </div>

  <div class="card-grid">
    <a href="/api/docs/getting-started" class="card">
      <div class="card-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg></div>
      <div class="card-title">Getting Started</div>
      <div class="card-desc">First steps in your HubLLM workspace &mdash; launch Claude, describe a task, and start building.</div>
    </a>
    <a href="/api/docs/workspace-guide" class="card">
      <div class="card-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg></div>
      <div class="card-title">Workspace Guide</div>
      <div class="card-desc">Detailed walkthrough of every panel: File Explorer, Terminal Chat, Preview, and LLM-Dev.</div>
    </a>
    <a href="/api/docs/git-github" class="card">
      <div class="card-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg></div>
      <div class="card-title">Git &amp; GitHub</div>
      <div class="card-desc">Set up version control, connect to GitHub, push your code, and understand commits.</div>
    </a>
    <a href="/api/docs/whats-new" class="card">
      <div class="card-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg></div>
      <div class="card-title">What's New</div>
      <div class="card-desc">Changelog and release notes &mdash; new features, improvements, and fixes.</div>
    </a>
    <a href="/api/docs/harness" class="card">
      <div class="card-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg></div>
      <div class="card-title">Harness System</div>
      <div class="card-desc">How the AI engineering harness works &mdash; CODEBASE_INDEX, feature queue, learnings, and workflows.</div>
    </a>
  </div>

  <div class="footer">
    <div class="footer-brand"><span class="logo-hub">Hub</span><span class="logo-llm">LLM</span><span class="logo-dev">.dev</span></div>
    <div class="footer-tagline">A VibeShip Creation</div>
  </div>"""

# Inline search JS for home page (adapted from nav.js search logic)
HOME_SEARCH_JS = """<script>
(function(){
  var input = document.querySelector('.search-bar input');
  if (!input) return;
  var content = document.querySelector('.docs-content');
  var original = null;
  input.addEventListener('input', function(){
    if (original) { content.innerHTML = original; original = null;
      input = document.querySelector('.search-bar input');
      if (input) { input.value = this.value; input.addEventListener('input', arguments.callee); input.focus(); }
    }
    var q = (input ? input.value : '').trim().toLowerCase();
    if (q.length < 2) return;
    if (!original) original = content.innerHTML;
    var walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT, null, false);
    var nodes = [];
    while (walker.nextNode()) {
      var n = walker.currentNode;
      if (n.parentNode.tagName==='SCRIPT'||n.parentNode.tagName==='STYLE') continue;
      if (n.nodeValue.toLowerCase().indexOf(q)!==-1) nodes.push(n);
    }
    for (var i=0;i<nodes.length;i++){
      var t=nodes[i], txt=t.nodeValue, idx=txt.toLowerCase().indexOf(q);
      if(idx===-1)continue;
      var s=document.createElement('span');
      s.appendChild(document.createTextNode(txt.substring(0,idx)));
      var m=document.createElement('mark'); m.textContent=txt.substring(idx,idx+q.length);
      s.appendChild(m); s.appendChild(document.createTextNode(txt.substring(idx+q.length)));
      t.parentNode.replaceChild(s,t);
    }
    var first=content.querySelector('mark');
    if(first) first.scrollIntoView({behavior:'smooth',block:'center'});
  });
})();
</script>"""


CONTENT_WORKSPACE = """\
  <div class="page-header">
    <h1>Workspace Guide</h1>
    <p class="page-desc">A detailed walkthrough of every panel in your HubLLM workspace.</p>
  </div>

  <div class="section">
    <span class="section-number">1</span>
    <h2>Overview</h2>
    <p style="margin-top: 14px;">
      The HubLLM workspace is your all-in-one AI development environment. It's organized into five main areas, each designed to keep you productive without switching between tools.
    </p>
    <div class="workspace-diagram">
      <div class="diagram-cell" style="grid-column: 1 / -1;">
        <span class="diagram-label">Top Bar</span>
        Model selector &middot; VPS status &middot; Project settings
      </div>
      <div class="diagram-cell highlight">
        <span class="diagram-label">File Explorer</span>
        Project tree
      </div>
      <div class="diagram-cell highlight">
        <span class="diagram-label">Terminal Chat</span>
        Claude Code
      </div>
      <div class="diagram-cell active">
        <span class="diagram-label">Preview Panel</span>
        Live preview
      </div>
      <div class="diagram-cell" style="grid-column: 1 / -1;">
        <span class="diagram-label">LLM-Dev Panel</span>
        Terminals &middot; Editor &middot; Files &middot; Docker &middot; Logs
      </div>
    </div>
  </div>

  <div class="section">
    <span class="section-number">2</span>
    <h2>Top Bar</h2>
    <p style="margin-top: 14px;">The top bar spans the full width of the workspace and gives you quick access to project-level controls.</p>
    <h3>Model Selector</h3>
    <p>Choose which AI model powers your session. Models are grouped by provider (Anthropic, OpenAI, Google, etc.).</p>
    <h3>VPS Status</h3>
    <p>Shows the connection state of your linked VPS server. Green means connected and ready.</p>
    <h3>Claude Code Detection</h3>
    <p>When Claude Code is running in the terminal, the top bar displays a status indicator.</p>
  </div>

  <div class="section">
    <span class="section-number">3</span>
    <h2>File Explorer</h2>
    <p style="margin-top: 14px;">The left sidebar shows your project's file tree, loaded from your VPS via SFTP.</p>
    <ul class="steps">
      <li><span class="step-num">&bull;</span><strong>Click a file</strong> to open it in the code editor in the LLM-Dev panel below.</li>
      <li><span class="step-num">&bull;</span><strong>Folders expand/collapse</strong> with a click. The tree auto-refreshes when Claude makes changes.</li>
      <li><span class="step-num">&bull;</span><strong>Status dots</strong> next to files indicate changes: green for new/modified, red for errors.</li>
    </ul>
    <div class="tip"><span class="tip-label">Tip:</span> The File Explorer reads from your VPS filesystem. If you don't see recent changes, click the refresh button at the top of the tree.</div>
  </div>

  <div class="section">
    <span class="section-number">4</span>
    <h2>Terminal Chat</h2>
    <p style="margin-top: 14px;">The center panel is your main interaction point with Claude Code. This is a real terminal connected to your VPS via SSH.</p>
    <h3>How to use it</h3>
    <ol class="steps">
      <li><span class="step-num">1.</span>Type <code>claude</code> to start a new Claude Code session, or <code>claude --resume</code> to continue where you left off.</li>
      <li><span class="step-num">2.</span>Describe what you want built in plain language. Claude reads your codebase, writes code, and commits changes.</li>
      <li><span class="step-num">3.</span>Claude may ask yes/no questions about file edits &mdash; respond directly in the terminal.</li>
    </ol>
    <h3>Bubble View</h3>
    <p>The terminal includes an optional "bubble view" that renders Claude's responses in a chat-like format. Toggle between raw terminal and bubble view using the view switcher in the terminal header.</p>
    <div class="tip"><span class="tip-label">Tip:</span> You can run any shell command here too &mdash; <code>npm install</code>, <code>python app.py</code>, <code>git log</code>, etc. It's a full terminal.</div>
  </div>

  <div class="section">
    <span class="section-number">5</span>
    <h2>Preview Panel</h2>
    <p style="margin-top: 14px;">The right panel is a built-in browser for previewing your web application as you build it.</p>
    <h3>Address Bar</h3>
    <p>Type any URL to load it. For local development servers (e.g., <code>http://localhost:3000</code>), enter the URL and see your site rendered in real time.</p>
    <h3>DevTools</h3>
    <p>Click the "Open in Browser" button to open the current URL in a new browser tab where you have access to full Chrome DevTools.</p>
    <h3>Drag Resize</h3>
    <p>Grab the left edge of the Preview Panel to drag and resize it.</p>
    <div class="tip"><span class="tip-label">Tip:</span> The docs you're reading right now are loaded in the Preview Panel!</div>
  </div>

  <div class="section">
    <span class="section-number">6</span>
    <h2>LLM-Dev Panel</h2>
    <p style="margin-top: 14px;">The bottom panel is a collapsible, drag-resizable workspace with multiple tabs.</p>
    <h3>Terminals</h3>
    <p>Up to four split-pane terminals, each running an independent SSH session to your VPS.</p>
    <h3>Code Editor</h3>
    <p>A Monaco-powered code editor (the same engine as VS Code). Click a file in the File Explorer to open it here.</p>
    <h3>File Browser</h3>
    <p>An SFTP-based file browser for navigating your VPS filesystem. Upload, download, and manage files directly.</p>
    <h3>Docker &amp; Logs</h3>
    <p>Monitor running Docker containers and view their logs, all from within the workspace.</p>
  </div>

  <div class="footer">
    <div class="footer-brand"><span class="logo-hub">Hub</span><span class="logo-llm">LLM</span><span class="logo-dev">.dev</span></div>
    <div class="footer-tagline">A VibeShip Creation</div>
  </div>"""


CONTENT_GIT = """\
  <div class="page-header">
    <h1>Git &amp; GitHub</h1>
    <p class="page-desc">Version control setup, GitHub integration, and how your AI engineer handles commits.</p>
  </div>

  <div class="section">
    <span class="section-number">1</span>
    <h2>What is Git?</h2>
    <p style="margin-top: 14px;">Git is a version control system that tracks every change to your code. Think of it like an unlimited undo history &mdash; you can see what changed, when, and why, and roll back to any previous state.</p>
    <p>Your HubLLM project already has Git initialized. When you scaffolded your project, <code>git init</code> was run automatically.</p>
  </div>

  <div class="section">
    <span class="section-number">2</span>
    <h2>Understanding Commits</h2>
    <p style="margin-top: 14px;">A <strong>commit</strong> is a snapshot of your code at a point in time. Each commit has:</p>
    <ul class="steps">
      <li><span class="step-num">&bull;</span><strong>A message</strong> describing what changed (e.g., "Add login page with form validation")</li>
      <li><span class="step-num">&bull;</span><strong>A unique ID</strong> (a hash like <code>a1b2c3d</code>) so you can reference it later</li>
      <li><span class="step-num">&bull;</span><strong>A diff</strong> showing exactly which lines were added, changed, or removed</li>
    </ul>
    <h3>Auto-commits by Claude</h3>
    <p>When Claude Code finishes a task, it automatically creates a commit with a descriptive message.</p>
    <div class="tip"><span class="tip-label">Tip:</span> Run <code>git log --oneline</code> in the terminal to see a list of all commits.</div>
  </div>

  <div class="section">
    <span class="section-number">3</span>
    <h2>Setting Up GitHub</h2>
    <p style="margin-top: 14px;">GitHub is a cloud service that stores your Git repositories online. Connecting gives you cloud backup, collaboration, and a shareable link to your project.</p>
    <h3>Step 1: Create a GitHub Account</h3>
    <p>If you don't have one already, sign up at <a href="https://github.com/join" target="_blank">github.com/join</a>. It's free.</p>
    <h3>Step 2: Create a Repository</h3>
    <ol class="steps">
      <li><span class="step-num">1.</span>Go to <a href="https://github.com/new" target="_blank">github.com/new</a></li>
      <li><span class="step-num">2.</span>Enter a repository name (e.g., <code>my-project</code>)</li>
      <li><span class="step-num">3.</span>Leave it as <strong>Public</strong> or choose <strong>Private</strong></li>
      <li><span class="step-num">4.</span><strong>Do NOT</strong> initialize with a README (your project already has one)</li>
      <li><span class="step-num">5.</span>Click <strong>Create repository</strong></li>
    </ol>
    <h3>Step 3: Connect Your Project</h3>
    <p>In your HubLLM terminal, run these commands:</p>
    <div class="code-block">
      <span class="comment"># Add your GitHub repo as a remote</span><br>
      <span class="cmd">git remote add</span> origin <span class="flag">https://github.com/YOUR_USERNAME/YOUR_REPO.git</span><br><br>
      <span class="comment"># Push your code to GitHub</span><br>
      <span class="cmd">git push</span> <span class="flag">-u</span> origin main
    </div>
    <p>After this, your code is backed up on GitHub. Every time Claude commits, you can push with <code>git push</code>.</p>
  </div>

  <div class="section">
    <span class="section-number">4</span>
    <h2>Common Git Commands</h2>
    <p style="margin-top: 14px;">Here are the commands you'll use most often:</p>
    <div class="code-block">
      <span class="comment"># See what files have changed</span><br>
      <span class="cmd">git status</span><br><br>
      <span class="comment"># See recent commits</span><br>
      <span class="cmd">git log</span> <span class="flag">--oneline</span><br><br>
      <span class="comment"># Push commits to GitHub</span><br>
      <span class="cmd">git push</span><br><br>
      <span class="comment"># Pull latest changes (if collaborating)</span><br>
      <span class="cmd">git pull</span><br><br>
      <span class="comment"># See what changed in a file</span><br>
      <span class="cmd">git diff</span> <span class="flag">filename.js</span><br><br>
      <span class="comment"># Undo uncommitted changes to a file</span><br>
      <span class="cmd">git checkout</span> <span class="flag">--</span> filename.js
    </div>
  </div>

  <div class="section">
    <span class="section-number">5</span>
    <h2>Branching (Advanced)</h2>
    <p style="margin-top: 14px;">Branches let you work on features in isolation without affecting your main code.</p>
    <div class="code-block">
      <span class="comment"># Create a new branch</span><br>
      <span class="cmd">git checkout</span> <span class="flag">-b</span> my-feature<br><br>
      <span class="comment"># Switch back to main</span><br>
      <span class="cmd">git checkout</span> main<br><br>
      <span class="comment"># Merge your feature into main</span><br>
      <span class="cmd">git merge</span> my-feature
    </div>
    <div class="tip"><span class="tip-label">Tip:</span> For most projects, working directly on <code>main</code> is fine. Branching becomes useful when collaborating with others.</div>
  </div>

  <div class="section">
    <span class="section-number">6</span>
    <h2>Helpful Links</h2>
    <div class="link-row" style="margin-top: 14px;">
      <a href="https://github.com/join" target="_blank" class="link-btn">Sign up for GitHub</a>
      <a href="https://github.com/login" target="_blank" class="link-btn">Sign in to GitHub</a>
    </div>
  </div>

  <div class="footer">
    <div class="footer-brand"><span class="logo-hub">Hub</span><span class="logo-llm">LLM</span><span class="logo-dev">.dev</span></div>
    <div class="footer-tagline">A VibeShip Creation</div>
  </div>"""


CONTENT_WHATS_NEW = """\
  <div class="page-header">
    <h1>What's New</h1>
    <p class="page-desc">Changelog and release notes &mdash; new features, improvements, and fixes.</p>
  </div>

  <div class="changelog-entry">
    <div class="cl-date">February 9, 2026</div>
    <div class="cl-title"><span class="changelog-tag feature">Feature</span> Docs Portal</div>
    <div class="cl-body">
      <p>Launched the multi-page documentation portal. All HubLLM platform help lives in one searchable, navigable place.</p>
      <ul>
        <li>Six pages covering getting started, workspace, Git, changelog, and the harness system</li>
        <li>Shared navigation sidebar with current-page highlighting</li>
        <li>Text search on every page</li>
        <li>Responsive design that works at any preview panel width</li>
      </ul>
    </div>
  </div>

  <div class="changelog-entry">
    <div class="cl-date">February 9, 2026</div>
    <div class="cl-title"><span class="changelog-tag feature">Feature</span> VibeShip CTA Button</div>
    <div class="cl-body">
      <p>Added a VibeShip call-to-action button next to the PRP download in the OpenRouter setup flow.</p>
    </div>
  </div>

  <div class="changelog-entry">
    <div class="cl-date">February 9, 2026</div>
    <div class="cl-title"><span class="changelog-tag fix">Fix</span> GitHub OAuth Error Handling</div>
    <div class="cl-body">
      <p>GitHub OAuth popup now shows a clear error message instead of silently failing when the server-side <code>GITHUB_CLIENT_ID</code> isn't configured.</p>
    </div>
  </div>

  <div class="changelog-entry">
    <div class="cl-date">February 9, 2026</div>
    <div class="cl-title"><span class="changelog-tag improvement">Improvement</span> Create Project Reframe</div>
    <div class="cl-body">
      <p>Removed all Codespaces messaging from the project creation wizard. GitHub is now positioned as version control and cloud backup. VPS card shows first as the primary hosting option.</p>
    </div>
  </div>

  <div class="changelog-entry">
    <div class="cl-date">February 9, 2026</div>
    <div class="cl-title"><span class="changelog-tag feature">Feature</span> Welcome Page</div>
    <div class="cl-body">
      <p>New welcome page auto-loads in the Preview Panel on first project open. Includes getting started steps, workspace diagram, Git setup guide, and helpful tips.</p>
    </div>
  </div>

  <div class="changelog-entry">
    <div class="cl-date">February 9, 2026</div>
    <div class="cl-title"><span class="changelog-tag feature">Feature</span> Preview Panel Drag Resize</div>
    <div class="cl-body">
      <p>The Preview Panel now has a draggable left edge for resizing. No more fixed width.</p>
    </div>
  </div>

  <div class="changelog-entry">
    <div class="cl-date">January 2026</div>
    <div class="cl-title"><span class="changelog-tag feature">Feature</span> Multi-Terminal Split Panes</div>
    <div class="cl-body">
      <p>The LLM-Dev panel now supports up to four split-pane terminals. Each terminal runs an independent SSH session.</p>
    </div>
  </div>

  <div class="changelog-entry">
    <div class="cl-date">January 2026</div>
    <div class="cl-title"><span class="changelog-tag feature">Feature</span> Claude Code Terminal Chat</div>
    <div class="cl-body">
      <p>Integrated Claude Code directly into the workspace terminal. Start a session with <code>claude</code> and interact with your AI engineer without leaving HubLLM.</p>
    </div>
  </div>

  <div class="changelog-entry">
    <div class="cl-date">January 2026</div>
    <div class="cl-title"><span class="changelog-tag feature">Feature</span> Monaco Code Editor</div>
    <div class="cl-body">
      <p>Added a VS Code-powered code editor in the LLM-Dev panel. Click any file in the File Explorer to open it with full syntax highlighting.</p>
    </div>
  </div>

  <div class="changelog-entry">
    <div class="cl-date">December 2025</div>
    <div class="cl-title"><span class="changelog-tag feature">Feature</span> VPS Connection Manager</div>
    <div class="cl-body">
      <p>Link a VPS to your project for a persistent development environment. SSH connections are managed automatically with reconnection on drop.</p>
    </div>
  </div>

  <div class="changelog-entry">
    <div class="cl-date">December 2025</div>
    <div class="cl-title"><span class="changelog-tag feature">Feature</span> Platform Launch</div>
    <div class="cl-body">
      <p>HubLLM.dev goes live &mdash; AI-powered development workspaces with Claude Code integration, project management, and a full web-based IDE.</p>
    </div>
  </div>

  <div class="footer">
    <div class="footer-brand"><span class="logo-hub">Hub</span><span class="logo-llm">LLM</span><span class="logo-dev">.dev</span></div>
    <div class="footer-tagline">A VibeShip Creation</div>
  </div>"""


CONTENT_HARNESS = """\
  <div class="page-header">
    <h1>Harness System</h1>
    <p class="page-desc">How the AI engineering harness works &mdash; the system that keeps Claude productive and your project organized.</p>
  </div>

  <div class="section">
    <span class="section-number">1</span>
    <h2>What is the Harness?</h2>
    <p style="margin-top: 14px;">The harness is a set of files and conventions that guide AI engineering sessions. It gives Claude Code structured context about your project, tracks tasks, captures learnings, and ensures quality through automated checks.</p>
    <p>Think of it as a project management layer designed specifically for AI engineers. Humans set the direction; the harness keeps the AI on track.</p>
  </div>

  <div class="section">
    <span class="section-number">2</span>
    <h2>CODEBASE_INDEX.yaml</h2>
    <p style="margin-top: 14px;">This file is the AI's map of your codebase. It contains structured descriptions of every significant file: what it does, what it exports, its dependencies, and how it relates to other files.</p>
    <h3>Why it matters</h3>
    <p>When Claude starts a new session, it reads CODEBASE_INDEX.yaml to understand your project's architecture without having to read every file.</p>
    <h3>How it stays current</h3>
    <p>The index is updated during development sessions. A pre-commit hook can audit the index to catch drift.</p>
    <div class="code-block">
      <span class="comment"># Example entry in CODEBASE_INDEX.yaml</span><br>
      <span class="cmd">frontend/src/components/Workspace.jsx</span>:<br>
      &nbsp;&nbsp;description: <span class="flag">Main workspace orchestrator</span><br>
      &nbsp;&nbsp;exports: [Workspace]<br>
      &nbsp;&nbsp;imports: [Chat, PreviewPanel, LLMDevPanel, ...]<br>
      &nbsp;&nbsp;lines: 450<br>
      &nbsp;&nbsp;role: <span class="flag">Layout container for all workspace panels</span>
    </div>
  </div>

  <div class="section">
    <span class="section-number">3</span>
    <h2>feature_queue.json</h2>
    <p style="margin-top: 14px;">The feature queue is a structured task list that defines what needs to be built. Each task includes:</p>
    <ul class="steps">
      <li><span class="step-num">&bull;</span><strong>ID</strong> &mdash; A unique identifier like <code>FEAT-41</code> or <code>BUG-54</code></li>
      <li><span class="step-num">&bull;</span><strong>Size</strong> &mdash; XS, S, M, or L. XS/S tasks can be batched; M/L tasks are done one at a time</li>
      <li><span class="step-num">&bull;</span><strong>Description</strong> &mdash; Detailed requirements and implementation notes</li>
      <li><span class="step-num">&bull;</span><strong>Change list</strong> &mdash; Which files need to be created or modified</li>
      <li><span class="step-num">&bull;</span><strong>Test criteria</strong> &mdash; How to verify the task is complete</li>
      <li><span class="step-num">&bull;</span><strong>Completion checklist</strong> &mdash; Code works, index updated, learnings written, committed, status set</li>
    </ul>
    <h3>Task lifecycle</h3>
    <div class="code-block">
      pending &rarr; in_progress &rarr; pending_review &rarr; completed<br>
      <span class="comment"># Only the Director moves tasks to "completed" after review</span>
    </div>
    <div class="tip"><span class="tip-label">Tip:</span> Tasks are never marked "done" by the engineer. They go to <code>pending_review</code>, and a human reviews and promotes them.</div>
  </div>

  <div class="section">
    <span class="section-number">4</span>
    <h2>learnings.md</h2>
    <p style="margin-top: 14px;">This file captures debugging insights, architectural decisions, and gotchas discovered during development sessions.</p>
    <h3>Why it matters</h3>
    <p>AI sessions are stateless &mdash; Claude doesn't remember previous conversations. Learnings.md is the persistent memory.</p>
    <h3>What gets recorded</h3>
    <ul class="steps">
      <li><span class="step-num">&bull;</span>Bugs that were tricky to diagnose and their root causes</li>
      <li><span class="step-num">&bull;</span>Patterns that work (and patterns that don't)</li>
      <li><span class="step-num">&bull;</span>Decisions about architecture or library choices</li>
      <li><span class="step-num">&bull;</span>Environment quirks (e.g., "SQLite and Postgres handle X differently")</li>
    </ul>
  </div>

  <div class="section">
    <span class="section-number">5</span>
    <h2>CLAUDE.md</h2>
    <p style="margin-top: 14px;">The CLAUDE.md file in your project root contains rules and patterns that Claude follows automatically.</p>
    <h3>What's in it</h3>
    <ul class="steps">
      <li><span class="step-num">&bull;</span><strong>Critical patterns</strong> &mdash; Code snippets for common tasks (API calls with timeouts, preventing infinite loops, drag resize, etc.)</li>
      <li><span class="step-num">&bull;</span><strong>Project rules</strong> &mdash; Which branch to work on, how to test, when to commit</li>
      <li><span class="step-num">&bull;</span><strong>Stack info</strong> &mdash; Database engine, deployment config, environment variables</li>
    </ul>
    <p>When the AI discovers a new pattern worth remembering, it adds it to CLAUDE.md so future sessions benefit automatically.</p>
  </div>

  <div class="section">
    <span class="section-number">6</span>
    <h2>Director &amp; Engineer Workflow</h2>
    <p style="margin-top: 14px;">HubLLM uses a two-role workflow for AI-assisted development:</p>
    <h3>The Director (Human)</h3>
    <ul class="steps">
      <li><span class="step-num">&bull;</span>Writes tasks in <code>feature_queue.json</code> with clear requirements</li>
      <li><span class="step-num">&bull;</span>Reviews completed work and moves tasks to <code>completed</code></li>
      <li><span class="step-num">&bull;</span>Merges feature branches into <code>main</code> for production deployment</li>
      <li><span class="step-num">&bull;</span>Sets priorities and makes architectural decisions</li>
    </ul>
    <h3>The Engineer (Claude Code)</h3>
    <ul class="steps">
      <li><span class="step-num">&bull;</span>Picks up tasks from the queue and implements them</li>
      <li><span class="step-num">&bull;</span>Follows patterns in CLAUDE.md and checks learnings.md</li>
      <li><span class="step-num">&bull;</span>Tests changes, commits to the feature branch, pushes</li>
      <li><span class="step-num">&bull;</span>Sets tasks to <code>pending_review</code> (never <code>completed</code>)</li>
    </ul>
    <div class="tip"><span class="tip-label">Tip:</span> This workflow prevents the AI from self-approving its own work. The human always has the final say before changes go to production.</div>
  </div>

  <div class="section">
    <span class="section-number">7</span>
    <h2>Pre-commit Hook</h2>
    <p style="margin-top: 14px;">HubLLM projects can include a Git pre-commit hook that runs automated checks before every commit:</p>
    <ul class="steps">
      <li><span class="step-num">&bull;</span>Verifies you're on the correct branch (not committing to <code>main</code> directly)</li>
      <li><span class="step-num">&bull;</span>Checks that CODEBASE_INDEX.yaml is up to date with changed files</li>
      <li><span class="step-num">&bull;</span>Validates that learnings.md has been updated</li>
    </ul>
    <p>If a check fails, the commit is blocked with a clear message about what needs to be fixed.</p>
  </div>

  <div class="footer">
    <div class="footer-brand"><span class="logo-hub">Hub</span><span class="logo-llm">LLM</span><span class="logo-dev">.dev</span></div>
    <div class="footer-tagline">A VibeShip Creation</div>
  </div>"""


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

CONTENT_GETTING_STARTED = """\
  <div class="page-header">
    <h1>Getting Started</h1>
    <p class="page-desc">First steps in your HubLLM workspace &mdash; launch Claude, describe a task, and start building.</p>
  </div>

  <div class="section">
    <span class="section-number">1</span>
    <h2>Your Workspace</h2>
    <p style="margin-top: 14px;">When you create a project, HubLLM sets up two directories on your VPS:</p>
    <ul class="steps">
      <li><span class="step-num">&bull;</span><strong>Director</strong> &mdash; <code>{slug}-director/</code> &mdash; manages the project: planning, task creation, and review.</li>
      <li><span class="step-num">&bull;</span><strong>Engineer</strong> &mdash; <code>{slug}/</code> &mdash; writes code, runs tests, and handles git.</li>
    </ul>
    <div class="tip"><span class="tip-label">Tip:</span> The Director and Engineer each run their own Claude Code session in separate terminals.</div>
  </div>

  <div class="section">
    <span class="section-number">2</span>
    <h2>Launch Your AI Engineer</h2>
    <p style="margin-top: 14px;">Open the <strong>LLM-Dev Terminal</strong> panel in the lower-left of the screen. Copy and paste this command:</p>
    <div class="code-block"><span class="cmd">cd</span> /root/llm-hub-projects/{slug} <span class="flag">&amp;&amp;</span> <span class="cmd">claude</span></div>
    <p>This starts a Claude Code session in your Engineer directory. Claude will read your codebase, write code, and commit changes.</p>
  </div>

  <div class="section">
    <span class="section-number">3</span>
    <h2>Start the Project Director</h2>
    <p style="margin-top: 14px;">Come back to the main terminal (upper area) and type:</p>
    <div class="code-block"><span class="cmd">claude</span></div>
    <p>Press Enter. This starts your AI Coding session with the Project Director AI Persona.</p>
    <div class="tip"><span class="tip-label">Tip:</span> Once the Director is running, type <code>/generate-prp</code> to create a detailed project brief that guides your AI team.</div>
  </div>

  <div class="section">
    <span class="section-number">4</span>
    <h2>Terminal Tips</h2>
    <p style="margin-top: 14px;"><strong>Copy:</strong> Highlight text in the terminal, right-click and select "Copy".</p>
    <p><strong>Paste:</strong> Right-click in the terminal and select "Paste".</p>
    <div class="tip"><span class="tip-label">Tip:</span> HubLLM works with any terminal-based AI coding tool. Claude Code is the default.</div>
  </div>

  <div class="section">
    <span class="section-number">5</span>
    <h2>Next Steps</h2>
    <p style="margin-top: 14px;">Once both terminals are running, the Director will guide you through the rest of the workflow &mdash; task planning, execution, and review.</p>
    <p>For more details, see the <a href="/api/docs/workspace-guide">Workspace Guide</a> or browse the <a href="/api/docs/home">full documentation</a>.</p>
  </div>

  <div class="footer">
    <div class="footer-brand"><span class="logo-hub">Hub</span><span class="logo-llm">LLM</span><span class="logo-dev">.dev</span></div>
    <div class="footer-tagline">A VibeShip Creation</div>
  </div>"""


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
