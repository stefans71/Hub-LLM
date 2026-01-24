# Session Learnings Log

Track discoveries, patterns, and friction points for harness improvement.

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

