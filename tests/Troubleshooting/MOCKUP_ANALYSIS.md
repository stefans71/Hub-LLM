# HubLLM Mockup vs Current Implementation - Detailed Analysis

## Overview

This document provides a detailed component-by-component analysis comparing the mockup (`hubllm-mockup-v2.html`, 6739 lines) with the current React implementation.

---

## 1. NAVIGATION ARCHITECTURE

### Mockup Navigation
```
┌─────────────────────────────────────────────────────────────────────────┐
│ [HubLLM.dev logo] │ Dashboard │ Workspace │ Settings │ Create Project  │
│                   │   (tab)   │   (tab)   │  (tab)   │      (tab)      │
└─────────────────────────────────────────────────────────────────────────┘
                              HEADER TABS
```

### Current Navigation (App.jsx)
```
┌──────────┬──────────────────────────────────────────────────────────────┐
│ SIDEBAR  │                                                              │
│          │                      CONTENT AREA                            │
│ Dashboard│                                                              │
│ Settings │                                                              │
│          │                                                              │
│ WORK-    │                                                              │
│ SPACES   │                                                              │
│ ├─ proj1 │                                                              │
│ └─ proj2 │                                                              │
└──────────┴──────────────────────────────────────────────────────────────┘
                            SIDEBAR ONLY
```

### Gap Analysis - Navigation
| Feature | Mockup | Current | Status |
|---------|--------|---------|--------|
| Header with tabs | ✅ Dashboard, Workspace, Settings, Create Project tabs | ❌ No header tabs | **MISSING** |
| URL-based routing | ✅ Each view has distinct UI state | ❌ State-based (`currentView`) | **DIFFERENT** |
| Sidebar collapse | ✅ Can collapse to icon-only | ✅ Implemented | ✅ MATCH |
| Workspace tree | ✅ In sidebar | ✅ In sidebar | ✅ MATCH |

---

## 2. DASHBOARD VIEW

### Mockup Dashboard (view-dashboard, line 2537)

**Stats Cards:**
- ACTIVE SESSIONS (12) - "Across 4 LLM providers"
- TOTAL PROJECTS (48) - "12 GitHub, 36 Local"
- CONNECTED LLMS (5) - "OpenRouter + Anthropic"

**Project Cards:**
- Workspace label (e.g., "Customers")
- Project name
- Description
- Source tag (VPS/Local/GitHub)
- Tech stack tag
- Agent avatars
- "Updated X ago" timestamp

### Current Dashboard (Dashboard.jsx, 362 lines)

**Stats Cards:**
- TOTAL PROJECTS - "X GitHub, Y Local"
- TOKENS USED - "Via OpenRouter API"
- ACTIVE AGENTS (4) - "Code, Test, Docs, Review"

**Project Cards:**
- Same structure as mockup ✅

### Gap Analysis - Dashboard
| Feature | Mockup | Current | Status |
|---------|--------|---------|--------|
| Stats: Active Sessions | ✅ "12 across 4 providers" | ❌ Not shown | **MISSING** |
| Stats: Total Projects | ✅ | ✅ | ✅ MATCH |
| Stats: Connected LLMs | ✅ "OpenRouter + Anthropic" | ❌ Shows "Tokens Used" | **DIFFERENT** |
| Stats: Active Agents | ❌ | ✅ Shows instead of sessions | **EXTRA** |
| Project cards | ✅ | ✅ | ✅ MATCH |
| Grid/List toggle | ✅ | ✅ | ✅ MATCH |
| Search bar | ✅ In header | ✅ In header | ✅ MATCH |
| Refresh All button | ✅ | ✅ | ✅ MATCH |

---

## 3. SETTINGS VIEW

### Mockup Settings Sections (view-settings, line 2871)

| # | Section ID | Name | Line # | Description |
|---|------------|------|--------|-------------|
| 1 | settings-subscription | Anthropic Subscription | 2984 | Claude Code CLI connection, auth status |
| 2 | settings-apikeys | API Keys | 3073 | OpenRouter, OpenAI API keys |
| 3 | settings-model | Default Model | 3117 | Model selection with provider groups |
| 4 | settings-vps | VPS Connections | 3150 | Remote server management |
| 5 | settings-profile | Profile | 3162 | Name, email, avatar, timezone |
| 6 | settings-appearance | Appearance | 3210 | Theme, accent color, font size |
| 7 | settings-voice | Voice Input | 3261 | Whisper API configuration |
| 8 | settings-globalagents | Global Agents | 3277 | Reusable AI agents with icons |
| 9 | settings-globalskills | Global Skills | 3432 | Skill modules (prompts, triggers) |
| 10 | settings-globalmcp | Global MCP Servers | 3502 | MCP server connections |

### Current Settings Sections (Settings.jsx, 3478 lines)

| # | Function | Name | Line # |
|---|----------|------|--------|
| 1 | ProfileSettings | Profile | 97 |
| 2 | APIKeysSettings | API Keys | 460 |
| 3 | AppearanceSettings | Appearance | 766 |
| 4 | GlobalMCPSettings | Global MCP Servers | 1618 |
| 5 | GlobalAgentsSettings | Global Agents | 2340 |
| 6 | VPSConnectionsSettings | VPS Connections | 3204 |

### Gap Analysis - Settings
| Section | Mockup | Current | Status |
|---------|--------|---------|--------|
| Anthropic Subscription | ✅ CLI install, auth, model info | ❌ Not implemented | **MISSING** |
| API Keys | ✅ OpenRouter, OpenAI | ✅ OpenRouter, custom key | ✅ PARTIAL |
| Default Model | ✅ Dedicated section | ❌ May be in Appearance | **MISSING** |
| VPS Connections | ✅ | ✅ | ✅ MATCH |
| Profile | ✅ | ✅ | ✅ MATCH |
| Appearance | ✅ Theme, accent, font | ✅ Theme, accent, font | ✅ MATCH |
| Voice Input (Whisper) | ✅ API key, language | ❌ Not in Settings | **MISSING** |
| Global Agents | ✅ With icons, enable/disable | ✅ | ✅ MATCH |
| Global Skills | ✅ Name, trigger, prompt | ❌ Not implemented | **MISSING** |
| Global MCP Servers | ✅ | ✅ | ✅ MATCH |

### Settings Sidebar Organization

**Mockup:**
```
ACCOUNT
├── Anthropic Subscription
├── API Keys
├── Profile
└── Appearance

GLOBAL DEFAULTS
├── Agents
├── Skills
└── MCP Servers
```

**Current:**
```
ACCOUNT
├── Profile
├── API Keys
└── Appearance

GLOBAL DEFAULTS
├── Agents
├── MCP Servers
└── VPS Connections
```

---

## 4. CREATE PROJECT VIEW

### Mockup Create Project (view-create-project, line 3687)

| Step | Section | Line # | Key Elements |
|------|---------|--------|--------------|
| 1 | Project Details | 3697 | Workspace dropdown, name, brief textarea, "Define Project with AI" button |
| 2 | Connection Source | 3880 | GitHub OAuth card, VPS form with host/port/user/key |
| 3 | Project Context | 4053 | Tech stack, coding standards, project context textareas |
| 4 | Project Agents | 4112 | Checkboxes for global agents |
| 5 | MCP Servers | 4230 | Checkboxes for global MCP servers |

**Footer:** Cancel button (left), Create Project button (right)

### Current CreateProject (CreateProject.jsx, 2064+ lines)

| Step | Comment | Line # |
|------|---------|--------|
| 1 | Project Details | 1117 |
| 2 | Connection Source | 1388 |
| 3 | Project Context | 1882 |
| 4 | Project Agents | 1935 |
| 5 | MCP Servers | 2064 |

### Gap Analysis - Create Project
| Feature | Mockup | Current | Status |
|---------|--------|---------|--------|
| 5-step wizard | ✅ | ✅ | ✅ MATCH |
| Project brief textarea | ✅ | ✅ | ✅ MATCH |
| "Define Project with AI" | ✅ Opens AI chat panel | ✅ | ✅ MATCH |
| GitHub OAuth flow | ✅ Shows connected state | ✅ | ✅ MATCH |
| VPS connection form | ✅ | ✅ | ✅ MATCH |
| Global agents checkboxes | ✅ | ✅ | ✅ MATCH |
| Global MCP checkboxes | ✅ | ✅ | ✅ MATCH |
| Sidebar hidden | ✅ Minimal/no sidebar | ❌ Shows project list | **DIFFERENT** |
| Header tabs visible | ✅ | ❌ Shows "HubLLM" only | **DIFFERENT** |

---

## 5. WORKSPACE VIEW

### Mockup Workspace (view-workspace, line 4368)

**Layout:**
```
┌─────────────────────────────────────────────────────────────────────────┐
│ Project Name │ VPS: status │ ● Connected │ Claude Opus 4.5 ▼ │ Export  │
├──────────┬──────────────────────────────────────────────────┬───────────┤
│ WORKSPACES│                                                  │ Live      │
│ [+] [◀]  │              AI CHAT MESSAGES                    │ Preview   │
│          │   ┌──────────────────────────────────────┐       │           │
│ ▾ Cust.  │   │ Claude: I've updated the hero...    │       │ [iframe]  │
│  └ API   │   │ ```jsx code block```                 │       │           │
│  └ Acme  │   └──────────────────────────────────────┘       │ Desktop   │
│ ▸ Personal│   User: Can you add dark mode toggle?          │ Tablet    │
│ ▸ Archives│                                                 │ Mobile    │
├──────────┼──────────────────────────────────────────────────┼───────────┤
│ 📁 Files │   [Ask Claude to build something...]    [🎤] [➤] │ [▶]       │
│ 🔍 Search│                                                  │           │
│ 📊 Git   │   ⌘ Enter to send • Click 🎤 for voice          │           │
│ ➕       │                                                  │           │
├──────────┴──────────────────────────────────────────────────┴───────────┤
│ ▲ LLM-Dev │ > Terminal │ 🐳 Docker │ 📄 Logs │ 📋 Context │ VPS status│
└─────────────────────────────────────────────────────────────────────────┘
```

### Current Workspace (Workspace.jsx, 289 lines)

**Layout:**
```
┌─────────────────────────────────────────────────────────────────────────┐
│ [Chat] [Servers] [Codespaces]                              [Panel ◀]   │
├───────────────────────────────────────────────────────────┬─────────────┤
│                                                           │ Right Panel │
│              CHAT / SERVERS / CODESPACES                  │ (optional)  │
│              (based on active tab)                        │             │
│                                                           │ Terminal/   │
│                                                           │ Files/      │
│                                                           │ Editor      │
└───────────────────────────────────────────────────────────┴─────────────┘
```

### Gap Analysis - Workspace
| Feature | Mockup | Current | Status |
|---------|--------|---------|--------|
| Header bar with project name | ✅ Project + VPS + Model | ❌ Only tabs | **MISSING** |
| Model selector in header | ✅ | ❌ | **MISSING** |
| "Export Project" button | ✅ | ❌ | **MISSING** |
| File explorer sidebar | ✅ Left side always visible | ❌ In right panel only | **MISSING** |
| Workspace tree | ✅ In left sidebar | ❌ Not in workspace | **MISSING** |
| AI Chat panel | ✅ Center | ✅ Full width | ✅ PARTIAL |
| Live Preview panel | ✅ Right side | ✅ Collapsible | ✅ MATCH |
| Bottom bar tabs | ✅ LLM-Dev, Terminal, Docker, Logs, Context | ❌ No bottom bar | **MISSING** |
| Voice input button | ✅ In chat input | ✅ | ✅ MATCH |
| Search in sidebar | ✅ | ❌ | **MISSING** |
| Git panel in sidebar | ✅ | ❌ | **MISSING** |

---

## 6. COMPONENT INVENTORY

### Existing Components (frontend/src/components/)

| Component | Size | Mockup Feature | Status |
|-----------|------|----------------|--------|
| AuthCallback.jsx | 3KB | OAuth callback | ✅ WORKING |
| AuthPage.jsx | 11KB | Login/signup | ✅ WORKING |
| Chat.jsx | 7KB | AI chat | ✅ WORKING |
| CodeEditor.jsx | 6KB | Monaco editor | ✅ WORKING |
| CodespacesManager.jsx | 11KB | GitHub Codespaces | ✅ WORKING |
| DashboardSidebar.jsx | 10KB | Dashboard sidebar | ✅ WORKING |
| FileBrowser.jsx | 9KB | File tree | ✅ WORKING |
| ModelSelector.jsx | 4KB | Model dropdown | ✅ WORKING |
| PreviewPanel.jsx | 13KB | Live preview | ✅ WORKING |
| ProjectSidebar.jsx | 3KB | Project sidebar | ✅ WORKING |
| ServerConnect.jsx | 8KB | SSH connection | ✅ WORKING |
| ServerManager.jsx | 13KB | Server list | ✅ WORKING |
| SettingsModal.jsx | 7KB | Old settings modal | ⚠️ DEPRECATED |
| Terminal.jsx | 6KB | xterm.js | ✅ WORKING |
| VoiceInput.jsx | 4KB | Voice-to-text | ✅ WORKING |
| Workspace.jsx | 10KB | Main workspace | ⚠️ NEEDS WORK |

### Missing Components

| Mockup Feature | Status |
|----------------|--------|
| HeaderNavigation.jsx | **NEEDS CREATION** |
| BottomBar.jsx (Terminal, Docker, Logs tabs) | **NEEDS CREATION** |
| WorkspaceSidebar.jsx (unified file/search/git) | **NEEDS CREATION** |
| AnthropicSubscription.jsx (Settings section) | **NEEDS CREATION** |
| GlobalSkills.jsx (Settings section) | **NEEDS CREATION** |
| VoiceSettings.jsx (Settings section) | **NEEDS CREATION** |
| DefaultModelSettings.jsx (Settings section) | **NEEDS CREATION** |

---

## 7. CSS/STYLING COMPARISON

### CSS Variables

| Variable | Mockup | Current | Match |
|----------|--------|---------|-------|
| --bg-primary | #0f1419 | #0f1419 | ✅ |
| --bg-secondary | #1a2028 | #1a2028 | ✅ |
| --bg-tertiary | #242b35 | #242b35 | ✅ |
| --border | #2d3748 | #2d3748 | ✅ |
| --primary | #3b82f6 | #3b82f6 | ✅ |
| --accent | #f97316 | ❓ | ⚠️ CHECK |
| --success | #22c55e | ✅ Used | ✅ |
| --error | #ef4444 | ✅ Used | ✅ |

---

## 8. JAVASCRIPT FUNCTIONS

### Mockup Functions vs Current Implementation

| Function | Mockup | Current Location | Status |
|----------|--------|------------------|--------|
| showView(viewName) | ✅ | App.jsx (setCurrentView) | ✅ DIFFERENT |
| toggleModelDropdown() | ✅ | ModelSelector.jsx | ✅ MATCH |
| selectConnection(type) | ✅ | CreateProject.jsx | ✅ MATCH |
| connectGitHub() | ✅ | AuthContext + CreateProject | ✅ MATCH |
| testVPSConnection() | ✅ | CreateProject + Settings | ✅ MATCH |
| showAgentModal() | ✅ | Settings.jsx | ✅ MATCH |
| showSkillModal() | ✅ | ❌ Not implemented | **MISSING** |
| showMCPModal() | ✅ | Settings.jsx | ✅ MATCH |
| startProjectDefinition() | ✅ | CreateProject.jsx | ✅ MATCH |
| toggleVoiceInput() | ✅ | VoiceInput.jsx | ✅ MATCH |

---

## 9. PRIORITIZED FIX PLAN

### Phase 1: Critical Navigation (HIGH PRIORITY)
1. **Create HeaderNavigation component** with tabs
2. **Add URL-based routing** (react-router-dom)
3. **Standardize layout** across all views

### Phase 2: Workspace Overhaul (HIGH PRIORITY)
1. **Create WorkspaceSidebar** (files, search, git)
2. **Create BottomBar** (Terminal, Docker, Logs, Context)
3. **Add project header** with model selector
4. **Restructure layout** to match mockup

### Phase 3: Settings Completion (MEDIUM PRIORITY)
1. **Add Anthropic Subscription section**
2. **Add Global Skills section**
3. **Add Voice Input section**
4. **Add Default Model section**
5. **Reorganize sidebar** (ACCOUNT / GLOBAL DEFAULTS)

### Phase 4: Dashboard Polish (MEDIUM PRIORITY)
1. **Change stat cards** (Active Sessions, Connected LLMs)
2. **Match mockup metrics exactly**

### Phase 5: Create Project Polish (LOW PRIORITY)
1. **Hide sidebar** during wizard
2. **Ensure header visible**

---

## 10. EFFORT ESTIMATES

| Phase | Components | Complexity | Files to Modify |
|-------|------------|------------|-----------------|
| Phase 1 | 2 new, 2 modify | HIGH | App.jsx, new HeaderNav, new routing |
| Phase 2 | 3 new, 1 major modify | HIGH | Workspace.jsx, new BottomBar, new WorkspaceSidebar |
| Phase 3 | 4 new sections | MEDIUM | Settings.jsx (add sections) |
| Phase 4 | 0 new | LOW | Dashboard.jsx (modify stats) |
| Phase 5 | 0 new | LOW | CreateProject.jsx (modify layout) |

---

## 11. SCREENSHOTS REFERENCE

| File | Description |
|------|-------------|
| mockup-dashboard.png | Target Dashboard design |
| mockup-settings.png | Target Settings design |
| mockup-create-project.png | Target Create Project design |
| mockup-workspace.png | Target Workspace design |
| current-dashboard.png | Current Dashboard implementation |
| current-create-project.png | Current Create Project implementation |
| current-login.png | Current Login page |

---

## 12. NEXT STEPS

1. **Review this analysis** and confirm priorities
2. **Start Phase 1** - Add header navigation (biggest visual impact)
3. **Test each change** against mockup screenshots
4. **Iterate through phases** in order

**Recommendation:** Start with Phase 1 (Header Navigation) as it affects the entire app and will make the site immediately feel more like the mockup.
