# Session Learnings Log

Track discoveries, patterns, and friction points for harness improvement.

---

### Session 49 - 2026-01-24
**Tasks**: BUG-02-REOPEN (S) + BUG-05-REOPEN (M)

**BUG-02 (Create Project button hidden off-screen)**:
- **Root Cause**: CreateProject.jsx used `height: '100vh'` on its outer container, but it's rendered inside App.jsx's flex layout which already has a header taking space. So 100vh was larger than the available space, pushing the footer off-screen.
- **Fix**: Changed `height: '100vh'` to `height: '100%'` so the component fills its parent container rather than the entire viewport.
- **File Modified**: frontend/src/pages/CreateProject.jsx (line 1104)
- **Verification**: Screenshot shows Cancel and Create Project buttons visible at bottom

**BUG-05 (LLM-Dev panel top edge not draggable)**:
- **Root Cause 1**: Previous 4px resize handle was too thin
- **Root Cause 2 (CRITICAL)**: React's synthetic `onMouseDown` event wasn't reliably firing in all browser scenarios
- **Fix**:
  - Added dedicated 8px orange drag handle with `ref`
  - **Use native event listener via useEffect instead of React's onMouseDown**
  - Added `flex-shrink: 0` to prevent flex parent from crushing panel
  - Added `touchAction: none` for mobile compatibility
- **File Modified**: frontend/src/components/LLMDevPanel.jsx
- **Verification**:
  - Drag UP → panel taller (520px) ✓
  - Drag DOWN → panel shorter (170px) ✓

**Key Learnings**:
- Nested flex containers: Don't use `100vh` inside a flex child - use `100%` instead
- Drag handles need to be at least 6-8px tall to be easily grabbable
- Visual feedback (color change on hover/drag) helps users discover draggable areas
- **CRITICAL**: React's synthetic onMouseDown can fail - use native event listeners via `useEffect + ref` for reliable drag handling
- Always add `flex-shrink: 0` to panels that should maintain their set height in flex containers
- Add `touchAction: none` to drag handles for mobile compatibility
- **CRITICAL for bottom-anchored panels**: Parent container needs `h-full` AND sibling needs `min-h-0` to allow shrinking. Without explicit height constraints, flex items grow instead of the sibling shrinking.

**Files Modified**:
- frontend/src/pages/CreateProject.jsx
- frontend/src/components/LLMDevPanel.jsx

---

### Session 48 - 2026-01-24
**Task**: BUG-03-REOPEN (VPS Connection Wired to Wrong UI Components)

**Root Cause Found**:
1. ServerManager.jsx had `connectServer()` that updated LOCAL state only - never notified Workspace
2. Workspace.jsx passed `onOpenTerminal` and `onOpenFiles` callbacks but NO `onConnectionChange`
3. LLMDevPanel used `project?.vps_server_id` but that wasn't updated when linking a server
4. Result: Top bar stayed "Disconnected", LLM-Dev terminal couldn't find server

**Solution Pattern**:
Three callbacks from Workspace to ServerManager:
1. `onConnectionChange(server, connected)` - Updates Workspace's `isConnected` and `activeServer`
2. `onServerLinked(serverId)` - Updates Workspace's `linkedServerId` state
3. Pass `linkedServerId` to LLMDevPanel so terminal uses correct server

**Code Changes**:
- **ServerManager.jsx**:
  - Added `onConnectionChange` prop, call it when connect/disconnect succeeds
  - Added `onServerLinked` prop, call it when server is linked via dropdown
- **Workspace.jsx**:
  - Added `linkedServerId` state initialized from `project?.vps_server_id`
  - Added `onConnectionChange` callback to update `isConnected` + `activeServer`
  - Added `onServerLinked` callback to update `linkedServerId`
  - Pass `linkedServerId` to LLMDevPanel
- **LLMDevPanel.jsx**:
  - Added `linkedServerId` prop
  - Use `linkedServerId || project?.vps_server_id` for all server operations

**Testing Approach**:
1. Set `openrouter_key` and `vps_servers` in localStorage via agent-browser eval
2. Link Digital Ocean server to project
3. Click Connect - verify top bar shows "Connected"
4. Expand LLM-Dev panel - verify terminal shows actual bash output from VPS
5. Verify file explorer shows server files

**Gotchas for future**:
- `replace_all` in Edit tool can cause self-reference bugs (e.g., `const x = y || x` when replacing `y` with `x`)
- Connection state flow: ServerManager → Workspace → TopBar + LLMDevPanel
- LLMDevPanel gets server ID from `linkedServerId` prop, NOT from project state

**Files Modified**:
- frontend/src/components/ServerManager.jsx
- frontend/src/components/Workspace.jsx
- frontend/src/components/LLMDevPanel.jsx

---

### Session 47 - 2026-01-24
**Task**: FEAT-01 (Model Selector Smart Filtering)
**What was fixed**:
- Refactored model selector in WorkspaceTopBar.jsx to support smart filtering
- Added MODEL_LIST constant with 16 models across 5 providers
- Implemented search filter that filters by model name, provider, or ID
- Added API key detection from localStorage (openrouter_key, openrouter_api_key)
- Greyed out models that require API key user doesn't have
**How it was fixed**:
- Created MODEL_LIST array with model metadata (id, name, provider, tier)
- Added PROVIDER_COLORS and PROVIDER_NAMES constants for consistent styling
- getFilteredModels() groups models by provider and applies search filter
- isModelAvailable() checks tier against apiKeys state
- Dropdown rewritten with search input, provider headers with status badges, and footer
**Testing approach**:
- Set localStorage key via agent-browser eval to bypass API key requirement
- Created test project via API: POST /api/projects/
- Tested search filter by typing "claude" - correctly filtered to Anthropic only
- Tested API key removal - OpenAI models correctly greyed out
**Gotchas for future**:
- React controlled inputs need special handling with agent-browser (use native setter + events)
- Workspace shows "Welcome to HubLLM" unless openrouter_key OR claude_key is in localStorage
- App.jsx hasApiKey check: `apiKeys.openrouter || apiKeys.claude`
**Files Modified**:
- frontend/src/components/WorkspaceTopBar.jsx (major refactor ~250 lines changed)

---

### Session 35 - 2024-01-24
**Task**: S-96, S-166, D-73
**New Commands/Patterns**: None - smooth session
**Friction Points**: None
**Files Needing Attention**: Settings.jsx still large, extracting sections as we go

---

### Session 36 - 2026-01-24
**Task**: S-218 (Global Skills Section) + M-45 (Skill Modal)
**New Commands/Patterns**:
- Used `agent-browser click 'text="..."'` with exact quotes for reliable navigation
- Combined related tasks (S-218 + M-45) since modal is integral part of skills section
**Friction Points**:
- Settings.jsx file too large to read at once (36k+ tokens), need to use offset/limit or grep
- Emoji icons may not render in some browser environments (showed as empty squares)
**Files Needing Attention**:
- Settings.jsx now ~4400 lines - consider extracting GlobalSkillsSettings and SkillModal to separate files

---

### Session 38 - 2026-01-24
**Task**: M-10 (Agent Modal)
**New Commands/Patterns**:
- Use `agent-browser eval "JS code"` for reliable click operations when `click` command fails
- Modal scrolling: use `element.scrollBy(0, pixels)` via eval to scroll within modal containers
- Finding buttons: `[...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Text')?.click()`
**Friction Points**:
- `agent-browser click "text"` doesn't always work for sidebar navigation items
- Modals with maxHeight and overflow:auto may cut off footer - need to scroll within modal to verify
**Files Needing Attention**:
- Settings.jsx continues growing (~4500 lines) - GlobalAgentsSettings and AgentModal could be extracted
- AgentModal component exists at line ~2131, reused properly with M-10 specs

---

### Session 39 - 2026-01-24
**Task**: M-63 (MCP Server Modal)
**New Commands/Patterns**:
- For sidebar navigation: `agent-browser eval "Array.from(document.querySelectorAll('div')).find(d => d.textContent.trim() === 'MCP Servers')?.dispatchEvent(new MouseEvent('click', {bubbles: true}))"`
- The existing MCPModal component was already well-structured, just needed ID/class additions
**Friction Points**:
- `agent-browser click` continues to be unreliable - `eval` with explicit event dispatch works better
- Sidebar nav items are divs without specific classes, making them harder to target
**Files Needing Attention**:
- Settings.jsx now ~4600 lines - MCPModal and GlobalMCPSettings could be extracted to separate files
- MCPModal has testing/OAuth handlers that are simulated - could be wired to real backend later

---

### Session 44 - 2026-01-24
**Task**: BUG-01 (Workspace Blank Page Crash)
**Root Cause**: Missing `useEffect` import in Workspace.jsx
**New Commands/Patterns**:
- Session 43 added useEffect hook (line 58) but forgot to add it to React import (line 1)
- This caused "useEffect is not defined" error, crashing the component
**Friction Points**:
- None - simple one-line fix once identified
**Files Needing Attention**:
- None this session

---

### Session 43 - 2026-01-24
**Task**: FIX-01, FIX-02, FIX-03 (Terminal Integration Debug)
**Root Cause Found**:
- VPS servers were ONLY saved to localStorage in Settings, NOT synced to backend
- Backend servers_db was empty when terminal tried to connect
- LLMDevPanel and WorkspaceTopBar had hardcoded mock data
**Solution Pattern**:
- Settings.jsx now syncs VPS to backend via /api/ssh/servers on add/edit/delete
- Components fetch real server info using project.vps_server_id
**Testing Approach**:
- Used agent-browser with eval for reliable interactions
- Used curl to verify backend API has VPS data
- Created test project via API to quickly test workspace
**Files Modified**:
- Settings.jsx (sync VPS to backend)
- LLMDevPanel.jsx (real API calls, removed mock data)
- WorkspaceTopBar.jsx (fetch VPS info)
- ServerManager.jsx (show linked VPS, not duplicate Add form)
- Workspace.jsx (pass project prop to ServerManager)
**Architecture Lesson**:
- Settings > VPS Connections = GLOBAL servers (stored in localStorage)
- Project.vps_server_id = Which global server THIS project uses
- Components showing project's VPS must read from localStorage, not backend API

---

### Session 42 - 2026-01-24
**Task**: F-02 (FileBrowser Integration) + F-04 (CodeEditor Integration)
**New Commands/Patterns**:
- FileBrowser.jsx and Workspace.jsx had old API endpoints (/api/ssh/servers/...) that needed updating to new /api/files endpoints
- API migration was straightforward - just URL changes and response format handling
**Friction Points**:
- None - clean migration session
**Files Needing Attention**:
- ServerManager.jsx still uses /api/ssh/servers for VPS management (correct - separate concern)
- Terminal.jsx still uses /api/ssh/servers WebSocket (could migrate to /api/terminal/ws later)
- Queue is now empty - need to identify next phase tasks

---

### Session 46 - 2026-01-24
**Tasks**: BUG-04 (Model Selector Dropdown) + BUG-05 (LLM-Dev Panel Drag)
**New Commands/Patterns**:
- CSS overflow:hidden clips absolutely positioned children - dropdown menus need `overflow: visible` on parent
- React drag resize pattern: useState for height/dragging, useCallback for handlers, useEffect for global mouse events
- Global event listeners must be added/removed carefully to prevent memory leaks
- `document.body.style.cursor = 'ns-resize'` during drag provides visual feedback
**Friction Points**:
- Workspace requires API key to view full interface - visual verification gated behind config
- App.jsx gates workspace with `hasApiKey` check, shows welcome screen otherwise
**Files Needing Attention**:
- App.jsx line 157: workspace gated by API key - consider showing workspace even without API (degraded mode)
- WorkspaceTopBar.jsx: model selector now works, ready for FEAT-01 smart filtering
- LLMDevPanel.jsx: drag resize implemented, could add internal resizers for file explorer/editor columns

---

### Session 40 - 2026-01-24
**Task**: T-01 (Terminal WebSocket Endpoint)
**New Commands/Patterns**:
- Backend is Python/FastAPI, not Node.js - feature_queue had outdated references (routes/vps.js → routers/ssh.py)
- SSH service already existed in `services/ssh.py` with asyncssh - complete with terminal, SFTP, file ops
- WebSocket endpoints use FastAPI's `@router.websocket` decorator
- Query params in WebSocket: `Query(None)` for optional params
**Friction Points**:
- feature_queue.json references were for Node.js but backend is Python
- T-02 was already complete (just used asyncssh instead of ssh2) - marked as pre-existing
**Files Needing Attention**:
- Terminal.jsx needs to be integrated with new `/api/terminal/ws` endpoint (T-03)
- LLMDevPanel.jsx uses mock terminal output - needs real xterm.js integration
- Multiple SSH endpoints exist (/api/ssh/servers/, /api/servers/, /api/terminal/) - could consolidate

---

