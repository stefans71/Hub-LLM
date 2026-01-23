# HubLLM Mockup vs Current Implementation Analysis

## Overview

This document analyzes the differences between the mockup (`hubllm-mockup-v2.html`) and the current React implementation to identify gaps and plan fixes.

---

## Mockup Structure (6739 lines)

### 4 Main Views

| View | Line # | Description |
|------|--------|-------------|
| `view-dashboard` | 2537 | Project Dashboard with stats, project cards |
| `view-settings` | 2871 | Settings with 10 sections |
| `view-create-project` | 3687 | 5-step project creation wizard |
| `view-workspace` | 4368 | Main development workspace |

### Navigation Architecture (Mockup)

```
Header Navigation Bar
├── HubLLM.dev (logo)
├── Dashboard (tab)
├── Workspace (tab)
├── Settings (tab)
└── Create Project (tab)

Left Sidebar (Dashboard/Settings)
├── MAIN
│   ├── Dashboard
│   └── Settings
├── WORKSPACES
│   ├── Customers (expandable)
│   │   ├── Acme Corp Website
│   │   ├── API Backend Optimization
│   │   └── Beta Inc Dashboard
│   ├── Personal (expandable)
│   └── Archives
└── Footer
    ├── + New Project button
    └── User profile
```

---

## Settings Sections (Mockup)

| Section ID | Name | Line # | Description |
|------------|------|--------|-------------|
| `settings-subscription` | Anthropic Subscription | 2984 | Claude Code CLI connection |
| `settings-apikeys` | API Keys | 3073 | OpenRouter, OpenAI keys |
| `settings-model` | Default Model | 3117 | Model selection |
| `settings-vps` | VPS Connections | 3150 | Remote server management |
| `settings-profile` | Profile | 3162 | User profile info |
| `settings-appearance` | Appearance | 3210 | Theme, font settings |
| `settings-voice` | Voice Input | 3261 | Whisper configuration |
| `settings-globalagents` | Global Agents | 3277 | Reusable AI agents |
| `settings-globalskills` | Global Skills | 3432 | Reusable skill modules |
| `settings-globalmcp` | Global MCP Servers | 3502 | MCP server management |

---

## Create Project Steps (Mockup)

| Step | Section | Line # | Elements |
|------|---------|--------|----------|
| 1 | Project Details | 3697 | Workspace dropdown, name, brief, AI define button |
| 2 | Connection Source | 3880 | GitHub OAuth, VPS connection form |
| 3 | Project Context | 4053 | Tech stack, standards, context fields |
| 4 | Project Agents | 4112 | Global agents checkbox list |
| 5 | MCP Servers | 4230 | Global MCP checkbox list |

---

## Workspace Layout (Mockup)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Header: Project Name │ VPS status │ Model selector │ Export Project     │
├──────────┬──────────────────────────────────────────────────┬───────────┤
│ SIDEBAR  │                                                  │  PREVIEW  │
│          │              AI CHAT PANEL                       │   PANEL   │
│ Files    │   ┌──────────────────────────────────────┐       │           │
│ Search   │   │ AI response with code blocks         │       │ Live      │
│ Git      │   │                                      │       │ Preview   │
│ +        │   │                                      │       │ (iframe)  │
│          │   │                                      │       │           │
│ TREE     │   │                                      │       │ Device    │
│ Customers│   └──────────────────────────────────────┘       │ selector  │
│  └─proj  │   ┌──────────────────────────────────────┐       │           │
│ Personal │   │ Input: Ask Claude to build...        │       │           │
│ Archives │   └──────────────────────────────────────┘       │           │
├──────────┴──────────────────────────────────────────────────┴───────────┤
│ Bottom Bar: LLM-Dev │ Terminal │ Docker │ Logs │ Context │ VPS Status  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Current Implementation Components

### Pages (`/frontend/src/pages/`)
- `Dashboard.jsx` (12KB) - Dashboard view
- `Settings.jsx` (121KB) - Settings page
- `CreateProject.jsx` (84KB) - Create Project wizard

### Components (`/frontend/src/components/`)
- `AuthCallback.jsx` - OAuth callback handler
- `AuthPage.jsx` - Login/signup form
- `Chat.jsx` - AI chat panel
- `CodeEditor.jsx` - Monaco editor
- `CodespacesManager.jsx` - GitHub Codespaces integration
- `DashboardSidebar.jsx` - Dashboard left sidebar
- `FileBrowser.jsx` - File tree
- `ModelSelector.jsx` - Model dropdown
- `PreviewPanel.jsx` - Live preview iframe
- `ProjectSidebar.jsx` - Project-specific sidebar
- `ServerConnect.jsx` - SSH connection
- `ServerManager.jsx` - Server management
- `SettingsModal.jsx` - Settings popup (old)
- `Terminal.jsx` - xterm.js terminal
- `VoiceInput.jsx` - Voice-to-text
- `Workspace.jsx` - Main workspace

---

## GAP ANALYSIS

### 🔴 Critical Gaps (Missing Features)

| Feature | Mockup | Current | Priority |
|---------|--------|---------|----------|
| Header Navigation Tabs | Dashboard, Workspace, Settings, Create Project tabs | No header tabs, sidebar-only nav | HIGH |
| Anthropic Subscription Section | Full Claude CLI integration | Not implemented | HIGH |
| Skills Management | Global Skills section | Not implemented | MEDIUM |
| Workspace Bottom Bar | Terminal, Docker, Logs, Context tabs | Basic terminal only | MEDIUM |
| Project Context Fields | Tech stack auto-populated | Exists but may not work | MEDIUM |

### 🟡 Styling/Layout Gaps

| Issue | Mockup | Current |
|-------|--------|---------|
| Dashboard Stats | "Active Sessions", "Total Projects", "Connected LLMs" | "Total Projects", "Tokens Used", "Active Agents" |
| Create Project sidebar | Hidden/minimal | Shows project list |
| Settings sidebar | Nested sections under ACCOUNT, GLOBAL DEFAULTS | Flat list |
| Workspace layout | 3-panel (sidebar, chat, preview) | Different arrangement |

### 🟢 Working Features

| Feature | Status |
|---------|--------|
| Authentication (Login/Signup) | ✅ Working |
| OAuth (GitHub, Google) | ✅ Working |
| Dashboard project list | ✅ Working |
| Dashboard stats cards | ✅ Working (different metrics) |
| Create Project wizard | ✅ Working |
| Settings (Profile, API Keys, Appearance, Agents, MCP, VPS) | ✅ Working |
| Voice Input | ✅ Working |
| AI Chat | ✅ Working |

---

## PHASED FIX PLAN

### Phase 1: Navigation & Layout
1. Add header navigation tabs (Dashboard, Workspace, Settings, Create Project)
2. Standardize sidebar layout across views
3. Fix Create Project sidebar (hide projects list, match mockup)

### Phase 2: Dashboard Polish
1. Update stat cards to match mockup ("Active Sessions" etc.)
2. Add project card hover effects
3. Ensure workspace tree matches mockup

### Phase 3: Settings Enhancements
1. Add Anthropic Subscription section
2. Add Skills section (similar to Agents)
3. Organize into ACCOUNT / GLOBAL DEFAULTS groups
4. Add search settings functionality

### Phase 4: Workspace Layout
1. Implement bottom bar with tabs (Terminal, Docker, Logs, Context)
2. Ensure preview panel matches mockup
3. Add file explorer search functionality
4. Add Git panel

### Phase 5: Create Project Polish
1. Ensure AI chat panel positioning matches mockup
2. Add GitHub connection state display
3. Verify all 5 steps match mockup styling

---

## JavaScript Functions in Mockup

Key functions that need to be implemented/verified:

```javascript
// Navigation
showView(viewName)

// Model Selection
toggleModelDropdown()
selectModel(event, modelName, color)
applyModelSelection(modelName, color)

// Connections
selectConnection(element, type)
toggleVPSCard()
connectGitHub()
testVPSConnection()
testGitHubConnection()

// Agents
toggleAllGlobalAgents(masterCheckbox)
updateGlobalAgentsMaster()
showAgentModal(editMode, agentData)
saveAgent()

// Skills (NEW - not in current)
showSkillModal(editMode, skillData)
saveSkill()

// MCP
showMCPModal(editMode, mcpData)
testMCPConnection()
saveMCPServer()

// AI Brief
handleBriefUpload(input)
startProjectDefinition()
sendBriefMessage()
generateProjectContext()

// Voice
toggleVoiceInput()
```

---

## CSS Variables (Mockup)

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
  --warning: #eab308;
  --error: #ef4444;
  --text-primary: #ffffff;
  --text-secondary: #9ca3af;
  --text-muted: #6b7280;
}
```

---

## Screenshots Reference

| File | Description |
|------|-------------|
| `mockup-dashboard.png` | Mockup Dashboard view |
| `mockup-settings.png` | Mockup Settings view |
| `mockup-create-project.png` | Mockup Create Project view |
| `mockup-workspace.png` | Mockup Workspace view |
| `current-dashboard.png` | Current Dashboard view |
| `current-create-project.png` | Current Create Project view |
| `current-login.png` | Current Login page |

---

## Next Steps

1. Review this analysis
2. Decide on priority order for phases
3. Start with Phase 1 (Navigation) as it affects all views
4. Test each fix against mockup screenshots
