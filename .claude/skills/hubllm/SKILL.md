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
8. `git commit -m "feat(TASK-ID): description"` then `git push`

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
├── HeaderNavigation.jsx
├── AuthPage.jsx
├── Setup.jsx                       # Onboarding wizard
├── Dashboard / DashboardSidebar.jsx
├── Workspace.jsx
│   ├── WorkspaceTopBar.jsx → ModelSelector.jsx
│   ├── WorkspaceIconSidebar.jsx
│   ├── WorkspaceFileExplorer.jsx
│   ├── Chat.jsx → ClaudeCodeTerminalChat.jsx
│   ├── ServerManager.jsx
│   ├── PreviewPanel.jsx
│   └── LLMDevPanel.jsx
│       ├── MultiTerminal.jsx (split-pane, xterm.js)
│       ├── CodeEditor.jsx
│       └── FileBrowser.jsx
├── Settings.jsx (~4600 lines)
└── CreateProject
```

## Backend (`backend/routers/`)
`ai.py auth.py chat.py files.py github.py projects.py servers.py settings.py ssh.py stats.py terminal.py voice.py`
Key: `backend/services/vps_connection.py`

## Quick Ref
- **localStorage is source of truth** for VPS servers
- **Chat routing:** Anthropic+VPS → SSH | else → OpenRouter API
- **SSH:** VPSConnectionManager singleton → PTY channels → shared fate
- **CSS vars:** `--bg-primary: #0f1419` `--bg-secondary: #1a2028` `--bg-tertiary: #242b35` `--border: #2d3748` `--primary: #3b82f6` `--accent: #f97316` `--success: #22c55e` `--error: #ef4444`

## Rules
- XS/S = multiple OK | M/L = ONE only, stop after
- ❌ Skip testing, hardcoded colors, skip learnings grep
- ✅ Grep learnings first, update code maps, add patterns to CLAUDE.md, push after commit
