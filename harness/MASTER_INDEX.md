# HubLLM Master Component Index

**Generated from mockup analysis - Source of truth for development**

---

## TOTAL ELEMENTS: 917

| View | File | Elements |
|------|------|----------|
| Global Navigation | hubllm_element_mapping_global_dashboard.md | 9 |
| Dashboard | hubllm_element_mapping_global_dashboard.md | 118 |
| Settings | hubllm_element_mapping_settings.md | 298 |
| Create Project | hubllm_element_mapping_create_project.md | 203 |
| Workspace | hubllm_element_mapping_workspace_modals.md | 124 |
| Modals | hubllm_element_mapping_workspace_modals.md | 91 |
| **TOTAL** | | **917** |

---

## VIEW SUMMARIES

### GLOBAL NAVIGATION (G-01 to G-09) - 9 elements
| ID | Element | Status |
|----|---------|--------|
| G-01 | Navigation Bar Container | ✅ HeaderNavigation.jsx |
| G-02 | Logo Container | ✅ Done |
| G-03 | Logo Icon (⚡) | ✅ Done |
| G-04 | Brand Name "HubLLM.dev" | ✅ Done |
| G-05 | Navigation Tabs Container | ✅ Done |
| G-06 | Dashboard Tab | ✅ Done |
| G-07 | Workspace Tab | ✅ Done |
| G-08 | Settings Tab | ✅ Done |
| G-09 | Create Project Tab | ✅ Done |

**Status: 100% Complete** ✅

---

### DASHBOARD VIEW (D-01 to D-129) - 118 elements

#### Sidebar (D-03 to D-47) - 45 elements
| Section | Elements | Status |
|---------|----------|--------|
| Main Nav Section | 8 | ✅ Done |
| Workspaces Section | 24 | ✅ Done |
| Sidebar Footer | 13 | ✅ Done |

#### Main Content (D-48 to D-129) - 73 elements
| Section | Elements | Status |
|---------|----------|--------|
| Top Bar + Search | 11 | ✅ Done |
| Page Header | 9 | ✅ Done |
| Stats Grid | 25 | ⚠️ Different metrics |
| Projects Grid | 28 | ✅ Done |

**Dashboard Gaps:**
- D-73: Stats show "Total Projects" instead of "Active Sessions"
- D-85: Stats show "Active Agents" instead of "Connected LLMs"
- D-127: "Start New Project" card missing

**Status: ~90% Complete** ⚠️

---

### SETTINGS VIEW (S-01 to S-303) - 298 elements

#### Settings Sidebar (S-03 to S-51) - 32 elements
| Section | Status |
|---------|--------|
| Account Category | ✅ Done |
| Global Defaults Category | ✅ Done |

#### Settings Sections
| # | Section | Elements | Status |
|---|---------|----------|--------|
| 1 | Anthropic Subscription | 32 | ❌ **MISSING** |
| 2 | API Keys | 22 | ✅ Done |
| 3 | Default Model | 10 | ❌ **MISSING** |
| 4 | VPS Connections | 7 | ✅ Done |
| 5 | Profile | 25 | ✅ Done |
| 6 | Appearance | 23 | ✅ Done |
| 7 | Voice Input | 7 | ❌ **MISSING** |
| 8 | Global Agents | 50 | ✅ Done |
| 9 | Global Skills | 29 | ❌ **MISSING** |
| 10 | Global MCP Servers | 54 | ✅ Done |

**Settings Gaps:**
- Anthropic Subscription (32 elements) - Claude CLI connection, Cross-LLM
- Default Model (10 elements) - Model selection dropdown
- Voice Input (7 elements) - Whisper API toggle
- Global Skills (29 elements) - Skill templates with SKILL.md

**Status: ~70% Complete** ⚠️

---

### CREATE PROJECT VIEW (CP-01 to CP-203) - 203 elements

| Step | Elements | Status |
|------|----------|--------|
| Container + Header | 6 | ✅ Done |
| Step 1: Project Details | 56 | ✅ Done |
| Step 2: Connection Source | 52 | ✅ Done |
| Step 3: Project Context | 18 | ✅ Done |
| Step 4: Project Agents | 32 | ✅ Done |
| Step 5: MCP Servers | 33 | ✅ Done |
| Action Bar | 6 | ⚠️ Partial |

**Create Project Gaps:**
- Action bar not sticky at bottom
- Sidebar visible during wizard (should be hidden)

**Status: ~95% Complete** ✅

---

### WORKSPACE VIEW (W-01 to W-124) - 124 elements

| Section | Elements | Status |
|---------|----------|--------|
| Container | 2 | ✅ Done |
| Top Bar | 28 | ❌ **MISSING** |
| Icon Sidebar | 7 | ❌ **MISSING** |
| File Explorer | 14 | ⚠️ Exists, not wired |
| Chat Panel | 14 | ✅ Done |
| Preview Panel | 17 | ⚠️ Exists, collapsed |
| LLM-Dev Panel | 26 | ❌ **MISSING** |
| Tab Contents | 16 | ❌ **MISSING** |

**Workspace Gaps (MAJOR):**
- W-03 to W-30: Top bar with project info, model selector, export
- W-31 to W-37: Icon sidebar (workspaces, search, git, settings)
- W-88 to W-124: LLM-Dev panel (Terminal, Docker, Logs, Context tabs)

**Status: ~30% Complete** ❌

---

### MODALS (M-01 to M-91) - 91 elements

| Modal | Elements | Status |
|-------|----------|--------|
| Model Notification | 9 | ❌ Missing |
| Agent Modal | 35 | ✅ Done |
| Skill Modal | 18 | ❌ **MISSING** |
| MCP Server Modal | 29 | ✅ Done |

**Status: ~60% Complete** ⚠️

---

## IMPLEMENTATION STATUS SUMMARY

| View | Elements | Done | Partial | Missing | % Complete |
|------|----------|------|---------|---------|------------|
| Global Nav | 9 | 9 | 0 | 0 | **100%** |
| Dashboard | 118 | 100 | 10 | 8 | **90%** |
| Settings | 298 | 188 | 0 | 110 | **63%** |
| Create Project | 203 | 190 | 7 | 6 | **95%** |
| Workspace | 124 | 16 | 31 | 77 | **30%** |
| Modals | 91 | 64 | 0 | 27 | **70%** |
| **TOTAL** | **917** | **567** | **48** | **228** | **67%** |

---

## PRIORITY FIX LIST

### Priority 1: Workspace Overhaul (77 missing elements)
The workspace is the main work area and is severely incomplete.

**Tasks:**
1. W-03 to W-30: Create workspace top bar
   - Project name display
   - VPS/GitHub connection badge
   - Connection status indicator
   - Model selector dropdown
   - Export Project button

2. W-31 to W-37: Create icon sidebar
   - Workspaces icon (toggles file explorer)
   - Search icon
   - Source Control icon
   - Create icon
   - Settings icon

3. W-88 to W-124: Create LLM-Dev bottom panel
   - Tab bar (Terminal, Docker, Logs, Project Context)
   - Terminal tab content (file explorer + editor + terminal)
   - Docker tab content (container list)
   - Logs tab content (timestamped entries)
   - Project Context tab (model info, agents, MCP)

**Existing components to wire up:**
- Terminal.jsx ✅
- CodeEditor.jsx ✅
- FileBrowser.jsx ✅
- PreviewPanel.jsx ✅

### Priority 2: Settings Completion (78 missing elements)

**Tasks:**
1. S-64 to S-95: Anthropic Subscription section (32 elements)
   - Claude CLI installation status
   - Authentication button
   - Cross-LLM toggle
   - Model info display

2. S-96 to S-105: Default Model section (10 elements)
   - Model dropdown with provider groups
   
3. S-166 to S-172: Voice Input section (7 elements)
   - Whisper API toggle
   
4. S-218 to S-246: Global Skills section (29 elements)
   - Skills list
   - Add Skill button
   - Skill modal

### Priority 3: Dashboard Polish (8 missing elements)

**Tasks:**
1. D-73 to D-78: Change stat card 1 to "Active Sessions"
2. D-85 to D-90: Change stat card 3 to "Connected LLMs"
3. D-126 to D-129: Add "Start New Project" card

### Priority 4: Create Project Polish (6 elements)

**Tasks:**
1. CP-198 to CP-203: Make action bar sticky
2. Hide sidebar during wizard flow

### Priority 5: Modals (27 missing elements)

**Tasks:**
1. M-01 to M-09: Model Notification modal
2. M-45 to M-62: Skill Modal (create/edit skills)

---

## MAPPING FILES REFERENCE

For detailed element-by-element specifications, see:

| View | File | Lines |
|------|------|-------|
| Global + Dashboard | hubllm_element_mapping_global_dashboard.md | 2521-2868 |
| Settings | hubllm_element_mapping_settings.md | 2871-3685 |
| Create Project | hubllm_element_mapping_create_project.md | 3687-4366 |
| Workspace + Modals | hubllm_element_mapping_workspace_modals.md | 4368-5389 |

---

## REACT COMPONENT MAPPING

### Existing Components
| Component | File Size | Mockup Coverage | Status |
|-----------|-----------|-----------------|--------|
| HeaderNavigation.jsx | 5.4KB | G-01 to G-09 | ✅ Complete |
| DashboardSidebar.jsx | 9.9KB | D-03 to D-47 | ✅ Complete |
| Dashboard.jsx | - | D-48 to D-129 | ⚠️ 90% |
| Settings.jsx | 3.5KB | S-01 to S-303 | ⚠️ 63% |
| CreateProject.jsx | - | CP-01 to CP-203 | ✅ 95% |
| Workspace.jsx | 9.9KB | W-01 to W-124 | ❌ 30% |
| Chat.jsx | 6.7KB | W-53 to W-67 | ✅ Complete |
| Terminal.jsx | 5.7KB | W-108 to W-124 | ✅ Exists |
| CodeEditor.jsx | 5.7KB | W-95 to W-107 | ✅ Exists |
| FileBrowser.jsx | 8.8KB | W-38 to W-52 | ✅ Exists |
| PreviewPanel.jsx | 12.9KB | W-68 to W-87 | ✅ Exists |
| ModelSelector.jsx | 4.2KB | W-11 to W-28 | ✅ Exists |
| ServerManager.jsx | 13.1KB | - | ✅ Exists |
| CodespacesManager.jsx | 10.8KB | - | ✅ Exists |

### Components Needed
| Component | Mockup Coverage | Priority |
|-----------|-----------------|----------|
| WorkspaceTopBar.jsx | W-03 to W-30 | HIGH |
| WorkspaceIconSidebar.jsx | W-31 to W-37 | HIGH |
| LLMDevPanel.jsx | W-88 to W-124 | HIGH |
| AnthropicSubscription.jsx | S-64 to S-95 | MEDIUM |
| DefaultModelSettings.jsx | S-96 to S-105 | MEDIUM |
| VoiceSettings.jsx | S-166 to S-172 | MEDIUM |
| GlobalSkills.jsx | S-218 to S-246 | MEDIUM |
| SkillModal.jsx | M-45 to M-62 | MEDIUM |
| ModelNotification.jsx | M-01 to M-09 | LOW |

---

## ESTIMATED EFFORT

| Priority | Task | New Components | Elements | Effort |
|----------|------|----------------|----------|--------|
| 1 | Workspace Overhaul | 3 | 77 | 3-5 days |
| 2 | Settings Completion | 4 | 78 | 2-3 days |
| 3 | Dashboard Polish | 0 | 8 | 2-4 hours |
| 4 | Create Project Polish | 0 | 6 | 1-2 hours |
| 5 | Modals | 2 | 27 | 1 day |
| **TOTAL** | | **9** | **196** | **7-10 days** |

---

## NEXT STEPS

1. **Fix agent-browser** - Visual testing must work before more coding
2. **Start Priority 1** - Workspace overhaul (biggest gap)
3. **Wire existing components** - Terminal, CodeEditor, FileBrowser already exist
4. **Create new components** - WorkspaceTopBar, IconSidebar, LLMDevPanel
5. **Visual verification** - Screenshot each completion against mockup
