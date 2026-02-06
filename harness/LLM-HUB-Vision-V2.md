# LLM-HUB.dev Vision & Architecture V2

## The Problem We're Solving

**"On the go" development** - Developers and creators shouldn't be tied to their laptop. They need a web app where they can keep working on projects from any device, with AI assistance.

**Accessibility** - Non-technical people and new developers should be able to use LLMs to build real software without deep technical knowledge, while pro devs get the power tools they need.

**Bring Your Own Subscription** - Users shouldn't pay twice. If they have an Anthropic Pro subscription ($200/mo), they should be able to use it through LLM-HUB instead of paying per API call.

---

## Who Uses LLM-HUB?

| User Type | Technical Level | Likely Setup |
|-----------|-----------------|--------------|
| **Creator** | Non-technical | OpenRouter key + GitHub Codespaces |
| **New Dev** | Learning | OpenRouter key + VPS (learning servers) |
| **Pro Dev** | Experienced | Anthropic Pro + VPS (full control) |

---

## Core Concept: Dual-Mode Chat

LLM-HUB's chat window can route to **two different backends**:

```
┌─────────────────────────────────────────────────────────────┐
│                     CHAT WINDOW                             │
│                                                             │
│  Model Selector: [Claude Opus 4.5 ▼]                        │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ "Build me a todo app with authentication"             │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │   Which billing source?       │
              └───────────────────────────────┘
                     │                │
         ┌───────────┘                └───────────┐
         ▼                                        ▼
┌─────────────────────┐              ┌─────────────────────┐
│ OPENROUTER PATH     │              │ CLAUDE CODE PATH    │
│                     │              │                     │
│ Chat → Backend →    │              │ Chat → SSH → VPS →  │
│ OpenRouter API      │              │ `claude` command    │
│                     │              │                     │
│ Billing: Per call   │              │ Billing: Pro sub    │
│ Works immediately   │              │ Requires VPS setup  │
│ Any model supported │              │ Anthropic models    │
└─────────────────────┘              └─────────────────────┘
```

### Route Selection Logic

```
User selects a model:

IF model is Anthropic (Claude Opus, Sonnet, Haiku):
  IF Claude Code installed on connected VPS:
    → Route to VPS (Pro subscription - flat rate)
  ELSE:
    → Route to OpenRouter (pay per call)
    → Show warning if switching from Pro

IF model is non-Anthropic (GPT-4, DeepSeek, etc.):
  → Route to OpenRouter (requires API key)
  → Show "needs API key" if not configured
```

---

## Projects

A **Project** in LLM-HUB is:

```
Project
├── Name & Settings (metadata)
├── Selected Model (per-project, persisted)
├── Billing Source (detected: Pro vs OpenRouter)
├── Compute Environment (where code runs)
│   ├── Option A: GitHub Codespace (free, managed)
│   └── Option B: User's VPS (full control)
├── Files (live on the compute environment)
│   └── Located at: /root/llm-hub-projects/{project-slug}/
├── Git Repository (optional but encouraged)
└── Claude Conversations (if using Claude Code)
    └── Can resume with `claude --resume`
```

---

## Compute Options

### Option A: GitHub Codespaces (Recommended for beginners)
- **Free tier available**
- **Managed environment** - no server setup
- **Sign up with GitHub** - one click to get started
- **Limitation**: Cannot use Anthropic Pro (no persistent Linux system)
- **Best for**: Non-tech users, learners, trying things out

### Option B: VPS (Digital Ocean, etc.)
- **Full control** - install anything, configure everything
- **Persistent** - always running, your own server
- **Enables Anthropic Pro** - install Claude Code, use Pro subscription
- **Production-ready** - can deploy directly on it
- **Best for**: Pro devs, production apps, using Pro subscription

---

## User Onboarding Flow

### New User Signup
```
┌─────────────────────────────────────────┐
│ SIGNUP                                  │
│ - Email/password                        │
│ - Password: 8+ chars, 1 upper,          │
│   1 number, 1 special                   │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│ SETUP WIZARD                            │
│                                         │
│ "How do you want to access AI models?"  │
│                                         │
│ ┌─────────────────┐ ┌─────────────────┐ │
│ │ OpenRouter      │ │ Anthropic Pro   │ │
│ │ (Quick start)   │ │ (Requires VPS)  │ │
│ └─────────────────┘ └─────────────────┘ │
└─────────────────────────────────────────┘
          │                     │
          ▼                     ▼
┌─────────────────┐   ┌─────────────────────────┐
│ OPENROUTER PATH │   │ ANTHROPIC PRO PATH      │
│                 │   │                         │
│ 1. Paste key    │   │ 1. Connect VPS (SSH)    │
│ 2. Done!        │   │ 2. Install Claude Code  │
│                 │   │    npm i -g @anthropic  │
│ VPS optional    │   │ 3. Run `claude login`   │
│ (add later)     │   │    (OAuth in terminal)  │
│                 │   │ 4. Done!                │
└─────────────────┘   └─────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│ DASHBOARD → Create First Project        │
└─────────────────────────────────────────┘
```

---

## Model Selector UX

### Per-Project Model Selection
Each project remembers its selected model:
- Switch projects → model selector updates
- Prevents confusion about which model you're using
- Enables project-specific billing tracking

### Billing Awareness
```
┌────────────────────────────────────────┐
│ Model Selector                         │
├────────────────────────────────────────┤
│ ■ ANTHROPIC          ✓ PRO SUBSCRIPTION│  ← If Claude Code detected
│   ● Claude Opus 4.5  [RECOMMENDED]     │
│   ● Claude Sonnet 4.5                  │
│   ● Claude 3.5 Sonnet                  │
├────────────────────────────────────────┤
│ ■ ANTHROPIC          VIA OPENROUTER    │  ← If no Claude Code
│   ● Claude Opus 4.5  (paid per call)   │
│   ● Claude Sonnet 4.5                  │
├────────────────────────────────────────┤
│ ■ OPENAI             ✓ API KEY ADDED   │
│   ● GPT-4o                             │
├────────────────────────────────────────┤
│ ■ DEEPSEEK           ✗ NEEDS API KEY   │  ← Greyed out, click → Settings
│   ○ DeepSeek V3                        │
└────────────────────────────────────────┘
```

### Billing Switch Warning
When switching FROM Pro subscription TO OpenRouter:
```
┌─────────────────────────────────────────────┐
│ ⚠️ Switching Billing Source                 │
│                                             │
│ You're switching from your Anthropic Pro    │
│ subscription to OpenRouter, which bills     │
│ per API call.                               │
│                                             │
│ [ ] Don't show this again                   │
│                                             │
│ [Cancel]                    [Continue]      │
└─────────────────────────────────────────────┘
```

---

## UI Architecture

### Workspace Layout
```
┌──────────────────────────────────────────────────────────────┐
│  Fish Finder APP  │ Claude Sonnet 4.5 ▼ │      │Export Proj │
├──────────┬───────────────────────────────────────────────────┤
│WORKSPACES│                                                   │
│          │  🤖 Hello! I'm Claude, your AI coding assistant.  │
│▼ Personal│                                                   │
│  ●● Fish │              CHAT AREA                            │
│          │     (Routes to OpenRouter OR VPS)                 │
│▶ Customer│                                                   │
│▶ Default │  ┌─────────────────────────────────────────────┐  │
│          │  │ + Ask Claude to build something...          │  │
│          │  └─────────────────────────────────────────────┘  │
│          ├───────────────────────────────────────────────────┤
│          │ LLM-Dev │ Terminal │ Editor │ Docker │ Logs │Ctx │
│          │ ┌─────────────────────────────────────┐ ┌───────┐ │
│          │ │ root@droplet:~/fish-finder-app#    │ │ TERMS │ │
│          │ │                                     │ │● bash │ │
│          │ └─────────────────────────────────────┘ └───────┘ │
└──────────┴───────────────────────────────────────────────────┘
```

### Key UI Components
1. **Model Selector** (top) - Per-project, shows billing source
2. **Chat Area** (main) - Dual-mode routing based on model
3. **LLM-Dev Panel** (bottom) - Terminal, Editor, Docker, Logs
4. **Workspaces Sidebar** (left) - Project navigation, VPS status dots

---

## Technical Architecture

### Data Flow
```
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND (React)                                            │
│                                                             │
│ localStorage:                                               │
│ ├── vps_servers[] - VPS configs (PRIMARY SOURCE)            │
│ ├── api_keys - OpenRouter key                               │
│ └── user_settings                                           │
│                                                             │
│ State:                                                      │
│ ├── selectedModel (per project)                             │
│ ├── billingSource (detected: 'pro' | 'openrouter')          │
│ └── claudeCodeStatus (detected on VPS connect)              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ BACKEND (FastAPI)                                           │
│                                                             │
│ SQLite (hubllm.db):                                         │
│ ├── projects - metadata, selected_model, vps_server_id      │
│ ├── vps_servers - synced from localStorage                  │
│ ├── users - auth                                            │
│ └── chat_messages - history (OpenRouter path only)          │
│                                                             │
│ In-memory:                                                  │
│ ├── SSH connections - WebSocket to VPS                      │
│ └── servers_cache - loaded from DB                          │
└─────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┴───────────────────┐
          ▼                                       ▼
┌─────────────────────┐              ┌─────────────────────────┐
│ OPENROUTER API      │              │ USER'S VPS              │
│                     │              │                         │
│ - Any model         │              │ Claude Code installed   │
│ - Pay per call      │              │ - `claude` command      │
│ - Chat history      │              │ - Conversations stored  │
│   stored in DB      │              │   on VPS                │
│                     │              │ - `claude --resume`     │
└─────────────────────┘              └─────────────────────────┘
```

### Claude Code Detection
On VPS connect, backend runs:
```bash
which claude         # Check if installed
claude --version     # Verify working
```

Results stored in connection state, updates model selector.

---

## Current State (January 2026)

### Working ✅
- Project creation and management
- VPS connection (SSH via Settings)
- Terminal (WebSocket to VPS, multi-pane)
- File explorer (VPS files, project-scoped)
- Chat interface with OpenRouter
- Model selector with API key detection
- Image drop/paste in chat
- LLM-Dev panel (drag resize, tabs)

### In Progress 🔧 (Queue v5.0)
- Password validation (AUTH-01)
- Claude Code detection (CLAUDE-01)
- Per-project model persistence (MODEL-01)
- Chat routing to Claude Code (CLAUDE-02)

### Planned 📋
- Billing source warnings (MODEL-02, MODEL-03)
- Setup wizard for new users (ONBOARD-01)
- Claude conversation resume (CLAUDE-03)
- GitHub Codespaces integration

### Not Started 📋
- GitHub OAuth signup
- Codespaces create/connect
- One-click deploy to Vercel/Netlify
- Bot protection (CAPTCHA)

---

## Development Workflow

### Two Claudes System
- **Claude A** (claude.ai) - Architect, planner, queue manager
- **Claude B** (Claude Code in terminal) - Developer, implements tasks

### Key Files
```
/workspaces/Hub-LLM/
├── CLAUDE.md                    # Claude B auto-reads (rules, patterns)
├── harness/
│   ├── feature_queue.json       # Current tasks
│   ├── learnings.md             # Session history
│   ├── TERMINAL_WORKSPACE.md    # Terminal code patterns
│   └── LLM-HUB-Vision-V2.md     # This file
└── .claude/skills/              # Project-specific skills
```

### Task Sizing
| Size | Time | Scope | Per Session |
|------|------|-------|-------------|
| XS | <30 min | Single file | Multiple OK |
| S | 30-60 min | Few files | Multiple OK |
| M | 1-2 hours | Complex | ONE only |
| L | 2+ hours | Major | ONE only, stop after |

---

## Future Roadmap

### Phase 1: Pro Subscription Support (Current)
- Route chat to Claude Code on VPS
- Detect and display billing source
- Per-project model selection

### Phase 2: Onboarding
- Setup wizard for new users
- Guided Claude Code installation
- OpenRouter quick-start path

### Phase 3: Codespaces
- GitHub OAuth integration
- Create/list Codespaces
- Connect to Codespace (SSH tunnel)

### Phase 4: Deployment
- One-click deploy to Vercel/Netlify
- GitHub integration for version control
- Deploy status in UI

---

## Notes for Development

1. **localStorage is source of truth** for VPS servers
2. **Projects map to folders** at `/root/llm-hub-projects/{slug}/`
3. **One terminal** in LLM-Dev panel (not duplicated elsewhere)
4. **Model selection is per-project**, not global
5. **Claude Code conversations live on VPS**, not in our DB
6. **Test with page refresh** - persistence is critical
