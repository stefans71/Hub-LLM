# Session Learnings Log

Track discoveries, patterns, and friction points for harness improvement.

---

### Session 60 - 2026-01-25 EST
**Task**: UI-03, UI-04, UI-05, UI-06, FEAT-06 - Major UI Session

**BUG-11: LLM-Dev Tabs Don't Switch Content (S)**
- Verified all tabs working correctly: Terminal, Editor, Docker, Logs, Project Context
- Bug may have been fixed by earlier changes in session or was already working
- No code changes needed - marked as resolved

**BUG-10: Terminal Content Cut Off at Bottom (XS)**
- Issue: Terminal content was cut off, couldn't scroll to see all text
- Root cause: Flex containers missing `minHeight: 0` causing height calc issues
- Fix: Added `minHeight: 0` to:
  - WorkspaceTerminal outer div
  - WorkspaceTerminal terminal container div
  - LLMDevPanel terminal tab container
- Also added `scrollToBottom()` for auto-scroll on new output

**FEAT-04: Terminal Opens in Project Directory (XS)**
- Added `projectSlug` prop to WorkspaceTerminal
- After 'connected' message, auto-sends `cd /root/llm-hub-projects/{slug}\n`
- Terminal now starts in project folder

**FEAT-03: Remove Explorer from LLM-Dev Panel (S)**
- Removed Explorer sidebar and old embedded Editor from Terminal tab content
- Terminal tab now shows just the terminal at full width
- Cleaned up unused state: fileTree, currentPath, loading
- Cleaned up unused functions: fetchFiles, navigateToFolder
- Editor remains available in dedicated Editor tab (from FEAT-06)

**FEAT-06: LLM-Dev Editor Tab (M)**
- Added Editor tab to LLM-Dev panel alongside Terminal, Docker, Logs, Project Context
- Wired sidebar file clicks to open in Editor tab via callback pattern:
  - LLMDevPanel exposes `onEditorReady` callback with `openFile(path, serverId)` function
  - Workspace.jsx holds ref and passes `handleFileSelect` to WorkspaceFileExplorer
  - WorkspaceFileExplorer calls `onFileSelect(file, serverId)` when file clicked
- Editor features: file tabs bar, syntax highlighting (JS/keywords/strings/numbers), line numbers
- Note: Backend API `/api/files/content` has existing bug ('str' decode error) - separate issue

**UI-06: Delete Confirmation Modal**
- Added modal triggered by Delete in 3-dot menu
- Two options: Archive (move to archives workspace) or Delete permanently
- Checkbox to also delete VPS folder (only shows if project has VPS)
- Archive: PATCH /api/projects/{id} with {workspace: 'archives'}
- Delete: DELETE /api/projects/{id}
- VPS folder delete: DELETE /api/files/delete?serverId=...&path=...

**UI-05: Project 3-Dot Menu**
- Added 3-dot (⋮) menu button to project rows in WorkspaceFileExplorer
- Menu appears on hover, shows dropdown on click
- Menu items: Rename, Settings, Disconnect VPS (if VPS linked), Delete (red)
- Used inline styles with CSS-in-JS for hover show/hide
- Handlers: handleRename (TODO), handleProjectSettings (navigates), handleDisconnectVps (API call), handleDelete opens modal

**UI-04: Project Name Truncation + Hover Tooltip**
- Added `title={project.name}` attribute to all project name spans
- CSS truncation already in place: `text-overflow: ellipsis; overflow: hidden; white-space: nowrap;`
- Files: WorkspaceFileExplorer.jsx, DashboardSidebar.jsx, ProjectSidebar.jsx

**UI-03: Project Status Dots in Sidebar**

**What**: Added VPS connection status dots to projects in sidebar showing real-time connection state

**Implementation**:
1. Added `loadServerStatuses()` function that fetches from `/api/ssh/servers`
2. Added `getStatusDot()` helper that returns color + tooltip based on status
3. Added polling every 10 seconds to keep status dots updated
4. Implemented in both `WorkspaceFileExplorer.jsx` (workspace view) and `DashboardSidebar.jsx` (dashboard view)

**Status Dot Colors**:
- Green (#22c55e) + glow: VPS connected
- Gray (#6b7280): No VPS assigned OR not connected
- Red (#ef4444): Error state

**Placement**: Left of project name, before folder icon (as per spec)

**Files Modified**:
- frontend/src/components/WorkspaceFileExplorer.jsx
- frontend/src/components/DashboardSidebar.jsx

---

### Session 59 - 2026-01-25 EST
**Task**: UI-01 (S) + UI-02 (S) - Simplify Workspace UI

**UI-01: Simplify Top Bar**
- Removed W-06 (Location Badge) - showed "VPS: Digital Ocean (IP)"
- Removed W-07 (Divider)
- Removed W-08 (Connection Status) - showed "Connected/Disconnected"
- Removed unused props and state for VPS info

**UI-02: Remove Servers and Codespaces Tabs**
- Removed entire tab bar (Chat, Servers, Codespaces)
- Main area now shows Chat directly without tabs
- Removed imports: `ServerManager`, `CodespacesManager`, `Server`, `Cloud`, `MessageSquare`
- Removed state: `activeTab`, `previewUrl`

**Result**:
- Top bar: Project Name (left) | Model Selector + Export (right)
- Main area: Chat only (no tab switching needed)
- Server config → Settings page
- Codespaces config → Settings page
- VPS connection status will show via sidebar project dot (UI-03)

**Files Modified**:
- frontend/src/components/WorkspaceTopBar.jsx (UI-01)
- frontend/src/components/Workspace.jsx (UI-01, UI-02)

---

### Session 58 - 2026-01-25 EST
**Task**: FEAT-05 (M) - Left Sidebar: Expandable Project File Tree
**What**: Added expandable file trees to projects in left sidebar that show VPS files from /root/llm-hub-projects/{slug}/

**Implementation**:
1. Modified `WorkspaceFileExplorer.jsx` to support project expansion
2. Added state for expanded projects, file trees per project, directory expansion
3. Fetch files from `/api/files?serverId=...&path=/root/llm-hub-projects/{slug}/`
4. Recursive file tree rendering with folder expand/collapse
5. Filter out `.` and `..` directory entries

**Key Details**:
- Projects with VPS connection show expand arrow (▶/▼)
- Projects without VPS show circle indicator (○)
- File tree loads lazily when project is first expanded
- Subdirectories also expand lazily on click
- Color-coded file icons by extension (JS=yellow, TS=blue, etc.)

**Gotcha - React Strict Mode with useRef**:
- Initial approach using `isMounted.current` ref caused loading to never complete
- In Strict Mode, components mount→unmount→remount, leaving ref as `false`
- Solution: Removed isMounted pattern entirely (original working code didn't need it)

**Pattern - Fetch with Timeout for API Calls**:
```javascript
const controller = new AbortController()
const timeout = setTimeout(() => controller.abort(), 5000)
try {
  const res = await fetch(url, { signal: controller.signal })
  clearTimeout(timeout)
} catch (err) {
  clearTimeout(timeout)
  if (err.name !== 'AbortError') console.error(err)
}
```

**Files Modified**:
- frontend/src/components/WorkspaceFileExplorer.jsx

---

### Session 57 - 2026-01-25 EST
**Task**: FEAT-02 (M) - Project Creates Folder on VPS
**What**: When creating a project with VPS connection, automatically creates `/root/llm-hub-projects/{project-slug}/` on the VPS

**Implementation**:
1. Added `create_vps_project_folder()` helper function in `routers/projects.py`
2. Called after project creation when `connection_type == "vps"` and `vps_server_id` is set
3. Uses existing SSH service (`get_connection`, `create_directory`)

**Key Details**:
- Base path: `/root/llm-hub-projects/` (created if doesn't exist)
- Project folder: `/root/llm-hub-projects/{project-slug}/`
- Uses timeouts (10s for connection, 5s for mkdir) to avoid hanging
- Non-blocking: folder creation failure doesn't fail project creation (logged instead)
- Loads server into cache before connecting (required by `get_connection()`)

**Pattern - Async Timeout for SSH Operations**:
```python
import asyncio
try:
    conn = await asyncio.wait_for(get_connection(server_id), timeout=10.0)
    await asyncio.wait_for(conn.create_directory(path), timeout=5.0)
except asyncio.TimeoutError:
    logger.warning("SSH operation timed out")
```

**Files Modified**:
- backend/routers/projects.py (added VPS folder creation on project create)

---

### Session 56 - 2026-01-25 EST
**Task**: Post-REFACTOR-01 Bugfixes
**What**: Fixed signup 500 error and workspace sidebar not showing database projects

**Bug 1: Signup 500 Error**
- **Root Cause 1**: User model missing fields that `services/auth.py` expects (verification_token, verification_expires, email_verified, reset_token, reset_expires, avatar_url, last_login)
- **Root Cause 2**: `get_session()` was returning session directly, but FastAPI's `Depends()` requires async generator
- **Root Cause 3**: Old database schema didn't have new User columns (had to delete hubllm.db and recreate)

**Solution**:
1. Added all missing User model fields to `models/__init__.py`
2. Changed `get_session()` to async generator that yields session
3. Updated routers to use `async_session()` directly for context manager pattern
4. Deleted old hubllm.db and let it recreate with new schema

**Bug 2: Workspace Sidebar Showing Mock Data**
- **Root Cause**: `WorkspaceFileExplorer.jsx` had hardcoded mock projects (Customers, Personal, Archives folders with fake projects)
- **Solution**: Updated to fetch from `/api/projects/` and group by workspace dynamically

**Pattern - Two Ways to Use Database Sessions**:
```python
# For FastAPI Depends():
async def get_session():
    async with async_session() as session:
        yield session

# For direct usage in functions:
async with async_session() as session:
    # use session
```

**Files Modified**:
- backend/models/__init__.py (User model fields, get_session as generator)
- backend/routers/*.py (use async_session() for context manager)
- frontend/src/components/WorkspaceFileExplorer.jsx (fetch from API)

---

### Session 55 - 2026-01-25 EST
**Task**: REFACTOR-01 (L) - Move Data from localStorage to Database
**What**: Migrated backend from in-memory storage to SQLite database

**Changes Made**:
1. Updated `models/__init__.py` with SQLite-based models:
   - VPSServer: id, name, host, port, username, auth_type, password, private_key, passphrase
   - Project: id, name, slug, vps_server_id, created_at + all existing fields
   - ChatMessage: project chat history
   - UserSetting: key-value user settings
   - User/AuthProvider: minimal for auth compatibility

2. Updated all routers to use SQLAlchemy async sessions:
   - `routers/projects.py` - CRUD via database
   - `routers/servers.py` - VPS servers from database
   - `routers/ssh.py` - Uses database + cache
   - `routers/terminal.py` - Loads servers from database
   - `routers/files.py` - Loads servers from database
   - `routers/stats.py` - Counts from database
   - `routers/settings.py` - NEW: User settings API

3. Updated `services/ssh.py`:
   - Changed `servers_db` to `servers_cache` (in-memory cache loaded from DB)
   - Added `load_server_to_cache()` and `remove_from_cache()` functions
   - Connection cache remains in-memory for performance

4. Removed old `services/database.py` (was unused stub)

5. Added aiosqlite to requirements.txt

**Database Schema**:
```sql
-- vps_servers: id, name, host, port, username, auth_type, password, private_key, ...
-- projects: id, name, slug, description, vps_server_id, connection_type, ...
-- chat_messages: id, project_id, role, content, model, timestamp
-- user_settings: id, key, value
```

**Key Architecture**:
- SQLite file: `./hubllm.db` (created on first run)
- Servers loaded from DB into cache on first access
- Projects, chat history, settings persisted to DB
- Data survives backend restart

**Files Modified**:
- backend/models/__init__.py (complete rewrite)
- backend/routers/projects.py
- backend/routers/servers.py
- backend/routers/ssh.py
- backend/routers/terminal.py
- backend/routers/files.py
- backend/routers/stats.py
- backend/routers/settings.py (new)
- backend/services/ssh.py
- backend/services/__init__.py
- backend/main.py
- backend/requirements.txt

---

### Session 54 - 2026-01-25 EST
**Task**: CLEANUP-02 (M) - Consolidate servers_db to One Location
**What**: Unified duplicate `servers_db` definitions from routers/ssh.py and services/ssh.py

**Root Cause**:
Two completely separate server databases existed:
1. `routers/ssh.py:76` - `servers_db: dict[str, dict]` - used by ssh, files, terminal routers
2. `services/ssh.py:262` - `servers_db: dict[str, ServerCredentials]` - used by servers router

These were disconnected - adding a server via one API didn't appear in the other.

**Solution**:
1. Keep single `servers_db` in `services/ssh.py` using dict format (more flexible)
2. Updated all routers to import from `services/ssh.py`
3. Updated `routers/servers.py` to work with dict format instead of ServerCredentials dataclass
4. Updated `get_connection()` to read from dict-based servers_db
5. Fixed `SSHConnection` instantiation in servers router terminal websocket

**Files Modified**:
- backend/services/ssh.py (unified servers_db, updated get_connection)
- backend/routers/ssh.py (import servers_db from services/ssh.py)
- backend/routers/servers.py (use dict format instead of ServerCredentials)
- backend/routers/files.py (import from services/ssh.py)
- backend/routers/terminal.py (import from services/ssh.py)

**Pattern**:
```python
# Single source of truth for server storage
# services/ssh.py
servers_db: dict[str, dict] = {}  # {server_id: {name, host, port, ...}}

# All routers import from here
from services.ssh import servers_db
```

---

### Session 53 - 2026-01-25 EST
**Task**: BUG-09 (S) - VPS Connection Not Persisting from Project Creation
**What**: Fixed auto-connect when entering workspace with linked VPS

**Root Cause**:
1. When user tests VPS during project creation, connection only tested but not persisted
2. `checkConnectionStatus()` in Workspace.jsx only checked backend state, didn't auto-connect
3. If user entered VPS details manually (not selecting saved server), server wasn't saved to localStorage with ID

**Solution Pattern**:
1. **CreateProject.jsx** - Save new VPS servers to localStorage on successful test:
   - If no `vpsServerId` selected, create new entry with `lastTestSuccess: true`
   - If saved server re-tested, update its `lastTestSuccess` flag
   - Set `vpsServerId` in form so project gets linked to server
2. **Workspace.jsx** - Auto-connect on workspace entry:
   - Check localStorage for server with matching ID
   - If server has `lastTestSuccess: true`, sync to backend and auto-connect
   - Use timeout (15s) and proper error handling

**Files Modified**:
- frontend/src/components/Workspace.jsx (checkAndAutoConnect replaces checkConnectionStatus)
- frontend/src/pages/CreateProject.jsx (handleTestVps saves server to localStorage)

---

### Session 52 - 2026-01-25
**Task**: AUDIT-01 + CLEANUP-01
**What**: Mapped component wiring, then removed duplicate terminal/files buttons from ServerManager

**Key Findings**:
1. **Two Terminal Paths (Duplication)**:
   - Path 1: ServerManager → onOpenTerminal → Workspace right panel → Terminal.jsx
   - Path 2: LLMDevPanel → WorkspaceTerminal.jsx (xterm.js + WebSocket)

2. **Two Terminal Components**:
   - `Terminal.jsx` - Used in right panel (simpler, older)
   - `WorkspaceTerminal.jsx` - Used in LLMDevPanel (xterm.js + /api/terminal/ws)

3. **Duplicate UI in ServerManager** (lines 240-252):
   - Terminal button opens right panel terminal
   - Files button opens right panel file browser
   - These duplicate LLMDevPanel's functionality

4. **Connection State Flow**:
   - localStorage (vps_servers) → ServerManager, LLMDevPanel, Workspace
   - Backend synced from localStorage on connect (preserving original UUID)

**Deliverable**: harness/debug/workspace-component-map.md

**CLEANUP-01 Changes**:
- Removed terminal/files buttons from ServerManager (lines 240-252)
- Removed unused TerminalIcon, FolderOpen imports
- Removed onOpenTerminal, onOpenFiles props from ServerManager
- Removed orphaned openTerminal, openFiles functions from Workspace.jsx
- Kept closeTerminal (still used by right panel)
- Right panel still accessible via toggle when connected (separate removal candidate)

**Files Modified**:
- frontend/src/components/ServerManager.jsx
- frontend/src/components/Workspace.jsx

---

### Session 51 - 2026-01-24
**Task**: BUG-08 (M) - Site Hanging on Login

**Root Cause Analysis**:
1. Backend was stuck in reload state ("Waiting for background tasks to complete") causing frontend fetches to hang indefinitely
2. No timeout on auth API calls - UI would wait forever if backend unresponsive
3. Potential infinite loop: `fetchUser()` → 401 → `refreshAccessToken()` → `fetchUser()` without guard
4. No cleanup on unmount could cause state updates after component unmounted

**Solution Pattern**:
```javascript
// 1. Fetch with timeout using AbortController
const fetchWithTimeout = async (url, options = {}, timeout = 10000) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  try {
    const res = await fetch(url, { ...options, signal: controller.signal })
    clearTimeout(timeoutId)
    return res
  } catch (err) {
    clearTimeout(timeoutId)
    if (err.name === 'AbortError') throw new Error('Request timed out')
    throw err
  }
}

// 2. Recursion guard to prevent infinite loops
const fetchUser = async (isRetry = false) => {
  // ...
  if (res.status === 401 && !isRetry) {
    const refreshed = await refreshAccessToken()
    if (refreshed) return fetchUser(true) // Mark as retry
  }
}

// 3. isMounted ref for cleanup
const isMounted = useRef(true)
useEffect(() => {
  isMounted.current = true
  return () => { isMounted.current = false }
}, [])
// Before setState: if (isMounted.current) setState(...)
```

**Key Learnings**:
- **CRITICAL**: Always add timeout to API calls that could hang (AbortController + setTimeout)
- **CRITICAL**: Add recursion guards (`isRetry` flag) to prevent infinite refresh loops
- Use `isMounted` ref pattern to prevent state updates after unmount
- On auth timeout/error, clear tokens and show login (graceful degradation)
- Wrap async handlers with `useCallback` for proper dependency tracking

**Files Modified**:
- frontend/src/contexts/AuthContext.jsx

---

### Session 50 - 2026-01-24
**Tasks**: BUG-06 (S) + BUG-07 (M) - VPS persistence issues

**Root Cause Analysis**:
1. Backend `servers_db` is **in-memory only** (`routers/ssh.py` line 75)
2. Frontend stores VPS servers in localStorage (persists correctly)
3. After page refresh:
   - localStorage still has VPS servers ✓
   - Backend `servers_db` is empty ✗
   - Project still has `vps_server_id` pointing to old UUID
   - WorkspaceTopBar and LLMDevPanel only checked backend API → showed "Loading..." or error

**Architecture Issue**:
- Frontend localStorage = source of truth for VPS server configs
- Backend in-memory = ephemeral, lost on restart
- UUID mismatch: When syncing localStorage → backend, backend generated NEW UUIDs

**Solution Pattern**:
1. **Backend**: Add optional `id` field to `ServerCreate` model so frontend can preserve original UUID
2. **Frontend components**: Check localStorage FIRST, then fallback to backend API
3. **Frontend sync**: When syncing to backend, pass the original `id` to preserve UUID

**Code Changes**:
- **routers/ssh.py**: Added `id: Optional[str] = None` to `ServerCreate`, use provided ID if given
- **WorkspaceTopBar.jsx** (`fetchVpsInfo`): Check localStorage first for server name/IP
- **LLMDevPanel.jsx** (`fetchServerInfo`): Check localStorage first, sync to backend with same ID
- **Workspace.jsx** & **ServerManager.jsx**: Pass `id` field when syncing to backend

**Key Insight**:
```
Frontend localStorage (vps_servers) = Persistent source of truth
Backend servers_db = In-memory cache, needs sync on page load
Project.vps_server_id = Stable reference, must match localStorage ID
```

**Pattern for Future**:
When localStorage is primary storage:
1. Components should check localStorage FIRST
2. Sync to backend should preserve original IDs
3. Backend should accept optional `id` parameter for sync

**Files Modified**:
- backend/routers/ssh.py (ServerCreate model, add_server function)
- frontend/src/components/WorkspaceTopBar.jsx (fetchVpsInfo)
- frontend/src/components/LLMDevPanel.jsx (fetchServerInfo)
- frontend/src/components/Workspace.jsx (handleConnectionToggle)
- frontend/src/components/ServerManager.jsx (connectServer)

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

