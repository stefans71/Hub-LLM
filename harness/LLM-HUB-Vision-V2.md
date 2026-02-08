# HubLLM — Vision & Architecture V3

*Updated: February 8, 2026*

---

## What HubLLM Is

**HubLLM is a free, open, web-based developer workspace with a built-in context engineering harness.**

It's not a Claude Code wrapper. It's not an IDE replacement. It's the **workspace layer** that sits on top of any CLI agent (claude, codex, etc.) or API (OpenRouter), keeping projects organized and agents on track.

### The Product in One Sentence

> Free developer workspace + structured harness template + VPS hosting funnel.

---

## Why HubLLM Exists

AI coding agents are powerful but undirected. They scatter files, lose context between sessions, and drift from the plan. The tools that fix this (Archon, Linear Harness, Task Master) add heavy dependencies — Docker, Supabase, external APIs.

HubLLM's harness is **zero-dependency and file-based**: a task queue, a codebase index, and a session learnings log. Just files on disk that any CLI agent can read. This keeps agents organized without requiring infrastructure.

Meanwhile, the workspace gives users a browser-based interface to their VPS: terminal, file explorer, multi-pane layout, project management — accessible from any device.

---

## Two Tracks (Tiered, Not Equal)

### Terminal Track — Full Development (Pro)

The primary experience. User has a VPS with a CLI agent installed.

```
User creates project in HubLLM
  → Harness template scaffolded on VPS (CLAUDE.md, queue, index, learnings)
  → PRP/brief placed in project directory
  → Terminal opens in workspace
  → User types `claude` (or `codex`, or any CLI)
  → Agent reads CLAUDE.md + feature_queue.json
  → Agent executes tasks: implement → update index → write learnings
  → Codebase index prevents drift — agent always knows the file structure
```

**What the user gets:**
- Web-based terminal + file explorer + multi-pane layout
- Structured harness that keeps agents organized
- Project management across multiple projects
- Works from any device (phone, tablet, laptop)
- Model-agnostic — use any CLI agent

### OpenRouter Track — Project Setup (Entry)

The onramp. User has an API key, no VPS.

```
User describes their idea
  → System asks clarifying questions
  → Generates a PRP (Product Requirements Prompt)
  → Output: a comprehensive implementation blueprint
  → User downloads the PRP as .md
  → Or: connects a VPS and feeds it to their CLI agent
```

**What the user gets:**
- PRP/brief generation (describe idea → get actionable plan)
- Model selector with 90+ models via OpenRouter
- No file storage needed — output is a document stored in DB
- User acquisition hook → leads to VPS for execution

**Key insight:** OpenRouter is stateless. You can't sustain a development project through API calls alone — you need a persistent agent with context. The OpenRouter track generates the *plan*; the Terminal track *executes* it.

---

## Monetization

HubLLM itself is **free**.

Revenue comes from **cloud hosting resale** — VPS services. The funnel:

1. User discovers HubLLM (free tool)
2. Generates a PRP/brief (free, uses their OpenRouter key)
3. Realizes they need somewhere to RUN the PRP
4. Buys VPS hosting through the integrated hosting marketplace

---

## The Harness Template

The core differentiator. A scaffoldable repo structure that gets initialized on the user's VPS when they create a project.

### Structure

```
project-root/
├── CLAUDE.md                        # Project rules for CLI agent
├── .claude/
│   ├── settings.json                # Agent settings
│   └── commands/
│       ├── generate-prp.md          # /generate-prp command
│       └── execute-prp.md           # /execute-prp command
├── harness/
│   ├── feature_queue.json           # Task queue (pending → in_progress → pending_review → completed)
│   ├── CODEBASE_INDEX.yaml          # File map, component registry, bug patterns
│   ├── learnings.md                 # Session-by-session debugging history
│   └── knowledge/
│       └── code-maps/               # Area-specific architecture docs
├── PRPs/                            # Generated implementation blueprints
├── src/                             # User's application code
└── README.md                        # Auto-generated from PRP/brief
```

### What Makes This Different

Compared to existing context engineering systems:

| Feature | HubLLM Harness | Cole's Context Eng | Archon OS |
|---------|---------------|-------------------|-----------|
| Task tracking | feature_queue.json | N/A (single PRP) | Supabase DB |
| Codebase awareness | CODEBASE_INDEX.yaml | examples/ folder | RAG + PGVector |
| Session memory | learnings.md | None | Version-controlled docs |
| Dependencies | **Zero** (files only) | Zero (files only) | Docker + Supabase |
| Frontend | HubLLM workspace | None (CLI only) | React Todo/Doing/Done |

**The killer feature is CODEBASE_INDEX.yaml.** It gives agents a deterministic map of the entire codebase — file paths, line counts, component relationships, recurring bug patterns. Without it, agents guess where things go and scatter files (observed firsthand with Archon putting components in wrong directories).

### Workflow

1. **PRP generated** (via OpenRouter or in CreateProject enhance flow)
2. **Harness scaffolded** on VPS in project directory
3. **CLAUDE.md configured** with project context, tech stack, rules
4. **Agent reads CLAUDE.md + feature_queue.json** on startup
5. **Agent executes tasks**: picks top pending → implements → updates index → writes learnings → sets pending_review
6. **Codebase index prevents drift** — agent always knows the file structure

### Future Automation (Incremental)

- **Ralph Loop**: Auto-continue after task completion (verifyCompletion → next task)
- **MCP server**: Task automation (mark done → start next) without Supabase — file-based
- **Browser testing**: Puppeteer integration for automated verification
- **Validation gates**: Explicit test requirements that must pass before task completion

---

## PRP (Product Requirements Prompt)

Based on Rasmus Widing's framework. A PRP is:

> PRD + curated codebase intelligence + agent/runbook — the minimum viable packet an AI needs to ship production-ready code on the first pass.

### PRP vs PRD

- **Traditional PRD**: What to build + why. Avoids how. For humans.
- **PRP**: What + why + **how** (API endpoints, test runners, patterns, typehints, dependencies, architectural patterns). For AI agents.

### PRP Template Sections

1. **FEATURE** — What to build, specific functionality and requirements
2. **EXAMPLES** — Code patterns to follow (most critical section)
3. **DOCUMENTATION** — Relevant APIs, MCP servers, external resources
4. **OTHER CONSIDERATIONS** — Gotchas, edge cases, things AI commonly misses

### PRP Workflow in HubLLM

```
User describes idea (CreateProject or workspace)
  → /generate-prp: System analyzes brief, asks clarifying questions
  → Generates PRP with phases, tasks, validation gates
  → PRP saved to PRPs/ directory
  → /execute-prp: Agent reads PRP, builds task plan, implements
  → Each task validated against test requirements
  → Iterate until all success criteria met
```

---

## Competitive Landscape (February 2026)

| Tool | Type | Moat | HubLLM Difference |
|------|------|------|-------------------|
| **OpenAI Codex App** | Mac desktop | Multi-agent command center, git worktrees | Web-based (any browser), model-agnostic |
| **Claude Code** | CLI | $1B ARR, deep Anthropic integration | Adds workspace layer + harness on top |
| **Cursor** | Desktop IDE | AI-native editor, 360K+ paying users | Free, self-hosted, not locked to one provider |
| **Databutton/Riff** | Hosted platform | "Describe it, we build it", $20-$700/mo | Self-hosted + free, user owns the code |
| **Archon OS** | MCP server platform | RAG + vector search, task management | Zero dependencies, file-based, simpler |

**Existential risk**: If Anthropic or OpenAI ship native desktop apps with built-in VM, file explorer, and project management, the *workspace* features become commodity. The *harness template* and *web-based model-agnostic access* are the lasting differentiators.

---

## Architecture

### Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite), port 5173 |
| Backend | Python (FastAPI), port 8000 |
| Database (dev) | SQLite (`backend/hubllm.db`) |
| Database (prod) | Postgres 16 via Docker |
| Cache | Redis 7 |
| Deployment | Docker Compose → Coolify → Traefik → `https://www.hubllm.dev` |

### Data Flow

```
localStorage (persistent, source of truth)
├── vps_servers[]              # VPS configs + Claude Code detection
├── api_keys (openrouter)      # API key for OpenRouter
└── user_settings              # Preferences

Backend (synced from localStorage)
├── hubllm.db / Postgres       # Users, projects, chat history
├── SSH connections (WebSocket) # Live terminal sessions
└── servers_cache (in-memory)   # Loaded from DB
```

### Component Map

```
App.jsx
├── HeaderNavigation.jsx
├── LandingPage.jsx                # Unauthenticated users
├── AuthPage.jsx / AuthCallback.jsx
├── Setup.jsx                      # Onboarding wizard
├── Dashboard + DashboardSidebar
├── Workspace.jsx                  # Main orchestrator
│   ├── WorkspaceTopBar.jsx        # Claude Code badge or model selector
│   ├── WorkspaceIconSidebar.jsx
│   ├── WorkspaceFileExplorer.jsx
│   ├── Chat.jsx                   # Routes: OpenRouter OR ClaudeCodeTerminalChat
│   │   └── ClaudeCodeTerminalChat.jsx  # xterm.js terminal for CLI agent
│   ├── PreviewPanel.jsx
│   └── LLMDevPanel.jsx            # Bottom panel
│       ├── MultiTerminal.jsx      # Split-pane terminals
│       ├── CodeEditor.jsx
│       └── FileBrowser.jsx
├── Settings.jsx                   # ~4600 lines
└── CreateProject.jsx              # 5-step wizard with PRP/enhance
```

---

## Development System

### Director / Engineer Pattern

Two Claude instances coordinate via shared files:

- **Director** (Claude A, `/root/dev/Claude-Project_Director/`) — Architect, planner, queue manager. Reads code, writes tasks, reviews work. Never writes application code.
- **Engineer** (Claude B, `/root/dev/Hub-LLM/`) — Implements tasks from `feature_queue.json`. Commits, pushes, updates index and learnings.

### Shared Files

```
/root/dev/Hub-LLM/harness/
├── feature_queue.json      # Task queue (Director writes, Engineer reads)
├── CODEBASE_INDEX.yaml     # Full codebase map (Engineer maintains)
├── learnings.md            # 90+ sessions of debugging history
└── knowledge/code-maps/    # Area-specific architecture docs
```

### Workflow

1. Director reads code, identifies need
2. Director writes task to `feature_queue.json` with file paths, line numbers, learnings refs
3. Engineer reads task, implements, updates index, writes learnings
4. Engineer sets status to `pending_review`
5. Director reviews commit diff, verifies index, moves to `completed[]`
6. Director merges to `main` → Coolify auto-deploys

---

## Notes for Development

1. **localStorage is source of truth** for VPS servers (synced to backend)
2. **Projects map to folders** at `/root/llm-hub-projects/{slug}/`
3. **Model selection is per-project**, not global
4. **Claude Code conversations live on VPS**, not in our DB
5. **Subscription users see static "Claude Code PRO" badge**, not model dropdown
6. **Test with page refresh** — persistence is critical
7. **Never `docker restart` Coolify containers** — use Coolify dashboard or `git push`
8. **Every Postgres schema change needs a migration** — `create_all()` doesn't add columns
