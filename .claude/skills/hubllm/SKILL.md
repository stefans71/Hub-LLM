# HubLLM Development Skill

**Stack:** FastAPI (Python) + React (Vite) + SQLite
**Repo:** `/root/dev/Hub-LLM` | **Branch:** `feature/harness-v2`
**Ports:** Frontend 5173, Backend 8000

## Session Workflow

1. This skill + `CLAUDE.md` auto-loaded
2. `grep -i "[your area]" harness/learnings.md` — check past debugging
3. `cat harness/feature_queue.json` — find task
4. `cat harness/knowledge/code-maps/[area].md` — read code map if exists
5. Implement following CLAUDE.md patterns
6. Test with `agent-browser` for UI
7. Add patterns to CLAUDE.md, notes to learnings.md, update code map if needed
8. **Verify branch** `git branch --show-current` → MUST be `feature/harness-v2` (NEVER main)
9. `git commit -m "feat(TASK-ID): description"` then `git push origin feature/harness-v2`
9. Update task in `harness/feature_queue.json`:
   - Set ALL `completion_checklist` items to true (or note why not)
   - Add `"completion_note": "What was done, any caveats"`
   - Set `"status": "pending_review"` — **NEVER `done` or `completed`**
   - Director reviews and moves to `completed[]`

## Key Docs

| File | When |
|------|------|
| `CLAUDE.md` | Every session |
| `harness/feature_queue.json` | Every session |
| `harness/learnings.md` | Before ANY task |
| `harness/knowledge/code-maps/*.md` | Before that area |
| `harness/knowledge/design-specs/*.md` | Matching mockup |
| `harness/LLM-HUB-Vision-V2.md` | Architecture |

## Component Hierarchy

```
App.jsx
├── main.jsx                          # Entry point
├── contexts/AuthContext.jsx           # Auth state provider
│
├── HeaderNavigation.jsx               # Top nav bar
├── AuthPage.jsx                       # Login/register
├── AuthCallback.jsx                   # GitHub OAuth callback
│
├── pages/
│   ├── Setup.jsx                      # Onboarding wizard (OpenRouter / Anthropic Pro)
│   ├── Dashboard.jsx                  # Dashboard wrapper
│   │   └── DashboardSidebar.jsx       # Project list, status dots, reconnect
│   ├── Settings.jsx                   # ~4600 lines (agents/skills/MCP modals inline)
│   │   └── SettingsModal.jsx          # Settings sub-modal
│   └── CreateProject.jsx              # 5-step wizard
│
├── Workspace.jsx                      # Main orchestrator
│   ├── WorkspaceTopBar.jsx            # Model selector, VPS status, Claude Code detection
│   │   ├── ModelSelector.jsx          # Dropdown with provider groups
│   │   └── ModelNotification.jsx      # Model change notifications
│   ├── WorkspaceIconSidebar.jsx       # Left icon bar
│   ├── WorkspaceFileExplorer.jsx      # Project tree, status dots
│   │
│   ├── Chat.jsx                       # Routes: OpenRouter OR ClaudeCodeTerminalChat
│   │   └── ClaudeCodeTerminalChat.jsx # Terminal chat + bubble view
│   │
│   ├── ServerManager.jsx              # VPS link/unlink
│   │   └── ServerConnect.jsx          # SSH connection form
│   ├── CodespacesManager.jsx          # GitHub Codespaces
│   ├── PreviewPanel.jsx               # Live preview
│   ├── AnthropicSubscription.jsx      # Anthropic Pro subscription UI
│   │
│   └── LLMDevPanel.jsx               # Bottom panel (collapsible, drag-resizable)
│       ├── MultiTerminal.jsx          # Split-pane terminals (max 4), xterm.js
│       ├── Terminal.jsx               # Single terminal (legacy)
│       ├── WorkspaceTerminal.jsx      # Terminal wrapper
│       ├── CodeEditor.jsx             # Monaco editor
│       └── FileBrowser.jsx            # SFTP file browser
│
├── VoiceInput.jsx                     # Whisper voice input (utility)
└── ProjectSidebar.jsx                 # Legacy sidebar (may be deprecated)
```

## Backend (`backend/routers/`)
`ai.py auth.py chat.py files.py github.py projects.py servers.py settings.py ssh.py stats.py terminal.py voice.py`
Key: `backend/services/vps_connection.py`

## Template Files (`backend/templates/`)
All harness templates: `backend/templates/harness/` (engineer/, director/, shared/, pages/)
All docs page content: `backend/templates/docs/`
Loader modules: `backend/templates/harness_templates.py`, `backend/templates/docs_templates.py`
Templates use `{{placeholder}}` syntax — replaced by `_fill_template()` in `projects.py` at scaffold time.

## Quick Ref
- **localStorage is source of truth** for VPS servers
- **Chat routing:** Anthropic+VPS → SSH | else → OpenRouter API
- **SSH:** VPSConnectionManager singleton → PTY channels → shared fate
- **CSS vars:** `--bg-primary: #0f1419` `--bg-secondary: #1a2028` `--bg-tertiary: #242b35` `--border: #2d3748` `--primary: #38bdf8` `--accent: #f97316` `--success: #22c55e` `--error: #ef4444`

## Rules
- XS/S = multiple OK | M/L = ONE only, stop after
- ❌ Skip testing, hardcoded colors, skip learnings grep
- ✅ Grep learnings first, update code maps, add patterns to CLAUDE.md, push after commit
