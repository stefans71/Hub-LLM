# AGENTS.md - Instructions for AI Coding Agents

## Project Overview

HubLLM is a web-based AI development environment with:
- Voice input and multi-model AI chat
- SSH terminal and file browser
- GitHub Codespaces integration
- Project management with agents and MCP servers

---

## CRITICAL: Reference Documents

**Before building ANY UI, read these:**

| Document | Path | Purpose |
|----------|------|---------|
| **UI Mockup** | `docs/hubllm-mockup-v2.html` | Complete HTML/CSS for all views |
| **Component Map** | `docs/HUBLLM_COMPONENT_MAPPING.md` | HTML ID → React → API mapping |
| **Strategy** | `docs/HUBLLM_DEVELOPMENT_STRATEGY.md` | Architecture, DB schemas |

---

## Architecture

```
Hub-LLM/
├── backend/              # Python FastAPI
│   ├── main.py
│   ├── routers/
│   ├── services/
│   └── models/
├── frontend/             # React + Vite
│   └── src/
│       ├── components/
│       ├── contexts/
│       └── pages/
├── docs/                 # ← REFERENCE THESE
│   ├── hubllm-mockup-v2.html
│   ├── HUBLLM_COMPONENT_MAPPING.md
│   └── HUBLLM_DEVELOPMENT_STRATEGY.md
├── feature_list.json     # Features to implement
├── claude-progress.txt   # Session log
└── init.sh               # Start dev environment
```

---

## Before Starting Work

1. **Read `claude-progress.txt`** - See what was done
2. **Read `feature_list.json`** - Find next failing feature
3. **Read `docs/HUBLLM_COMPONENT_MAPPING.md`** - Understand structure
4. **Run `./init.sh`** - Start the environment
5. **Pick ONE feature** - Don't try to do multiple

---

## CSS Variables (from mockup)

```css
:root {
  --bg-primary: #0f1419;
  --bg-secondary: #1a2028;
  --bg-tertiary: #242b35;
  --border: #2d3748;
  --primary: #3b82f6;
  --primary-hover: #2563eb;
  --accent: #f97316;
  --success: #22c55e;
  --error: #ef4444;
  --text-primary: #ffffff;
  --text-secondary: #9ca3af;
  --text-muted: #6b7280;
}
```

**Always use these variables, never hardcoded colors!**

---

## Views in Mockup

| View | HTML ID | Line | Purpose |
|------|---------|------|---------|
| Dashboard | `view-dashboard` | ~2537 | Project list, stats |
| Settings | `view-settings` | ~2871 | 10 settings sections |
| Create Project | `view-create-project` | ~3687 | 5-step wizard |
| Workspace | `view-workspace` | ~4368 | Terminal, editor, chat |

---

## Create Project Flow (5 Steps)

| Step | Key IDs | What It Does |
|------|---------|--------------|
| 1. Project Details | `project-brief`, `ai-brief-chat` | Name, brief, AI expansion |
| 2. Connection Source | `github-card`, `vps-card` | GitHub OAuth or VPS |
| 3. Project Context | `ctx-tech-stack`, `ctx-standards` | Tech stack, standards |
| 4. Project Agents | `global-agents-list` | Select agents |
| 5. MCP Servers | `global-mcp-list` | Select MCP servers |

---

## Testing with agent-browser

```bash
# Install
npm install -g agent-browser
agent-browser install

# Test flow
agent-browser open http://localhost:5173
agent-browser snapshot -i
agent-browser click @e2
agent-browser fill @e3 "text"
agent-browser screenshot test.png
```

---

## After Completing Work

1. **Test the feature** - Use agent-browser
2. **Update `feature_list.json`** - Set `passes: true`
3. **Update `claude-progress.txt`** - Log what you did
4. **Commit** - `git commit -m "feat(feature-id): description"`

---

## Do Not

- ❌ Implement multiple features in one session
- ❌ Skip reading the mockup and component mapping
- ❌ Use hardcoded colors (use CSS variables)
- ❌ Mark features as passing without testing
- ❌ Skip updating progress files

## Do

- ✅ Read docs before writing UI code
- ✅ Match mockup styling exactly
- ✅ Use CSS variables
- ✅ Work on ONE feature at a time
- ✅ Test with agent-browser
- ✅ Update progress files
- ✅ Write clear commit messages
