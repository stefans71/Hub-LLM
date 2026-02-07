# Session Learnings Log

Track discoveries, patterns, and friction points for harness improvement.

---

### Session 93 - 2026-02-06 19:54 EST
**Tasks**: BUG-34, INFRA-03
**What**:
- BUG-34: Setup wizard hardcoded `setClaudeCodeDetected(false)` instead of using test connection response. Fix: added `claude_code_detected` field to `TestConnectionResponse` model, added `which claude` check in `test_connection` endpoint (ssh.py), and wired frontend to read `data.claude_code_detected` from the response.
- INFRA-03: Added idle connection timeout. `VPSConnection` now tracks `last_activity` via `touch()` (called on connect, create_channel, run_command, and terminal input). `VPSConnectionManager` has background task checking every 5 min, closes connections idle > 2 hours. Started/stopped in main.py lifespan. Both ssh.py and terminal.py WebSocket handlers call `vps_conn.touch()` on input.

### Session 92 - 2026-02-07 EST
**Tasks**: BUG-33, UI-07 (re-fix)
**What**:
- BUG-33: Created backend/migrations/003_add_projects_columns.py. Adds 10 missing columns to projects table in Postgres production. Idempotent via SQLAlchemy inspect. Populates slug from name. Skips on SQLite.
- UI-07 re-fix: SVG logos weren't rendering because (1) XML declaration + DOCTYPE in SVGs may cause issues with Vite/browser <img> rendering, (2) OpenRouter SVG was a full wordmark (833x128 = 6.5:1 ratio) invisible at 24x24. Fixed: cleaned XML declarations, cropped OpenRouter to icon-mark-only (152x128), added objectFit:'contain'.
- UI-08: Added iconSize prop to PathCard (default 24). Claude Code card uses iconSize={48} to fill the 48x48 container.
**Key Learning**: SVGs used as <img src> in Vite should be clean (no XML declaration/DOCTYPE) and appropriately sized/cropped for their render context. Wide wordmark SVGs become invisible in square icon containers — use the icon mark portion only.

---

### Session 91 - 2026-02-06 EST
**Tasks**: BUG-31, UI-07, BUG-32
**What**:
- BUG-31: Fixed defensive setupComplete check in App.jsx: changed `!== false` to `=== true`. Refactored Setup.jsx: "Skip for now" = session-only (no backend call), "Don't show again" = permanent. Fixed duplicate asyncpg in requirements.txt.
- UI-07: Moved brand SVGs from repo root to frontend/src/assets/. Updated PathCard to handle both lucide components (`typeof !== 'string'`) and image URLs (`typeof === 'string'`). Replaced Key/Sparkles icons on PathCards with openrouterLogo/claudeCodeLogo. Removed Key from lucide imports (Sparkles kept for line 813).
- BUG-32: Created backend/migrations/002_fix_uuid_columns.py. Checks column types via SQLAlchemy inspect, drops FK constraints, converts UUID→VARCHAR(64). Idempotent, Postgres-only (skips SQLite).
**Key Learning**: When checking boolean flags from API responses, always use `=== true` not `!== false`. For icon components that need to support both React components and image URLs, check `typeof icon === 'string'` to branch rendering.

---

### Session 90 - 2026-02-06 EST
**Task**: BUG-28-REOPEN
**What**: Made init_db() dual-DB aware (SQLite dev / Postgres prod). Fixed 3 issues: (1) SYNC_DATABASE_URL construction — now branches on IS_POSTGRES flag, converts postgresql:// to postgresql+asyncpg:// for async engine and strips +asyncpg for sync engine. (2) Table verification — uses information_schema.tables for Postgres, sqlite_master for SQLite. (3) Created migration system: run_migrations() runs all backend/migrations/NNN_*.py scripts after create_all on every startup. First migration 001_add_setup_completed.py adds setup_completed column if missing (the root cause of BUG-28 in production Postgres). Added psycopg2-binary to requirements.txt for sync Postgres DDL.
**Key Learning**: SQLAlchemy create_all() only creates NEW tables, never alters existing ones. Production Postgres tables created before a new column was added to the ORM model will silently lack that column. Always pair ORM model changes with idempotent ALTER TABLE migrations.

---

### Session 89 - 2026-02-06 EST
**Task**: BUG-30
**What**: Fixed DATABASE_URL using relative path `./hubllm.db` which creates ghost DBs when uvicorn is launched from different CWDs. Changed to absolute path using `Path(__file__).resolve().parent.parent / "hubllm.db"`. Added ghost DB cleanup step in init.sh. Updated init.sh summary to show resolved absolute path.
**Key Learning**: SQLite relative paths are relative to CWD, not to the Python file. Always use `Path(__file__).resolve()` to anchor DB paths.

---

### Session 88 - 2026-02-06 EST
**Task**: BUG-29
**What**: Fixed init_db() creating 0-byte DB. Root cause: aiosqlite `conn.run_sync(Base.metadata.create_all)` doesn't reliably persist DDL to disk. Fix: use sync engine (`create_engine` without aiosqlite) for DDL, then verify via sqlite_master query. Added RuntimeError if tables are missing after create_all.
**Key Learning**: For SQLite DDL with SQLAlchemy async, always use a sync engine. aiosqlite transactions may not flush CREATE TABLE to disk.

---

### Session 87 - 2026-02-06 EST
**Task**: BUG-28 + DOCS-05
**What**:
- BUG-28: Fixed race condition in App.jsx where setupComplete initialized to true, causing redirect logic to skip /setup. Changed init to null + added loading gate.
- DOCS-05: Promoted 7 recurring patterns from learnings.md to CLAUDE.md Critical Patterns: CSS visibility toggle, flex min constraints, sync derived state, null async init, URL persistence, delta drag, overflow for dropdowns.

### Session 86 - 2026-02-06 09:33 EST
**Task**: DOCS-06 - Generate Full CODEBASE_INDEX.yaml
**What**: Scanned entire codebase and populated harness/CODEBASE_INDEX.yaml with all sections

**Scope**:
- 33 .jsx files documented (4 pages, 28 components, 1 context, 1 entry)
- 12 backend routers with all endpoints listed
- 6 backend services documented (vps_connection.py classes/methods in detail)
- 5 DB tables from SQLAlchemy ORM models (users, vps_servers, projects, chat_messages, user_settings)
- 19 localStorage keys with set_by/read_by/sync_direction
- 12 recurring bugs cross-referenced from learnings.md sessions

**Approach**:
- Used 3 parallel Explore agents: frontend JSX scan, backend router scan, localStorage scan
- Read backend/models/__init__.py for ORM-based DB schema (hubllm.db was empty)
- Read learnings.md sessions 51-85 for recurring bug patterns
- Compiled into structured YAML with last_verified_session: 86 on every entry

**Key Finding**: DB file exists but had no tables (fresh deploy). Schema comes from SQLAlchemy ORM models, not SQL DDL.

---

### Session 85 - 2026-01-26 EST
**Task**: BUG-25 - Project Click Doesn't Switch Claude Terminal Chat or LLM-Dev Terminal
**What**: Wired up project switching from WorkspaceFileExplorer to update terminals

**Root Cause**:
- Workspace.jsx's `handleSelectProject` only logged to console, didn't actually switch project
- No callback was passed from App.jsx to Workspace for project changes

**Fix**:
1. Added `onProjectChange` prop to Workspace component
2. App.jsx passes callback that updates `activeProject` state and navigates
3. Workspace.jsx `handleSelectProject` now calls `onProjectChange(selectedProject)`

**Data Flow (verified)**:
1. User clicks project in WorkspaceFileExplorer
2. `handleSelectProject` → `onProjectChange(project)`
3. App.jsx `setActiveProject(project)` + `navigate(/workspace?projectId=...)`
4. Workspace re-renders with new `project` prop
5. useEffect updates `linkedServerId` from `project.vps_server_id`
6. Chat receives new `serverId` → ClaudeCodeTerminalChat reconnects
7. LLMDevPanel receives new `linkedServerId` → MultiTerminal reconnects

---

### Session 84 - 2026-01-26 EST
**Task**: BUG-26 - Clickable Status Dots Don't Trigger Reconnect
**What**: Fixed status dots in both DashboardSidebar and WorkspaceFileExplorer

**Issues Found**:
1. Click target was too small (8x8px span) - hard to click accurately
2. WorkspaceFileExplorer had status dots that weren't clickable at all

**Fixes**:
- Changed span to button element with larger hit area (16x16px with 4px padding around 8px dot)
- Added reconnect functionality to WorkspaceFileExplorer.jsx (was only in DashboardSidebar)
- Added hover scale effect with CSS class `.hover-scale`
- Always call `e.stopPropagation()` to prevent accidental project selection

**Key Pattern**: For small click targets, use a wrapper button with padding around the visible element for better UX.

---

### Session 83 - 2026-01-26 EST
**Task**: INFRA-02 - VPS Reconnect UX
**What**: Added clickable status dots and "Reconnect All" button for easy VPS reconnection

**Implementation**:
- Status dots now clickable when gray/red (disconnected/error)
- Click triggers `POST /api/ssh/servers/{server_id}/connect`
- Dot turns orange with pulse animation while reconnecting
- All projects on same VPS update together (shared connection status)
- "Reconnect All" button appears in Workspaces header when any VPS disconnected
- Button shows spinning RefreshCw icon when reconnecting

**Key Code**:
- `reconnectServer(serverId)` - calls backend with 20s timeout
- `reconnectingServers` Set tracks in-progress reconnections
- `getDisconnectedServerIds()` - finds all unique disconnected VPS IDs
- Status dot onClick with `e.stopPropagation()` to prevent project selection

---

### Session 82 - 2026-01-26 EST
**Task**: BUG-24 - Chat loading state after project create (RESOLVED)
**What**: Implemented Option D - show animated "Connecting to VPS..." welcome message

**Solution**:
- Removed broken `showVpsLoading` loading spinner code that didn't work due to timing issues
- Added `showConnectingWelcome` check: `isAnthropicModel && serverId && !claudeCodeStatus?.authenticated`
- Changed welcome message to show animated dots + "Connecting to your VPS" when waiting
- Added CSS animation for pulsing dots effect

**Why Option D Works**:
- Doesn't fight timing issues - just shows different messaging
- User sees appropriate message during wait ("Connecting to VPS" vs "Hello I'm Claude")
- Once claudeCodeStatus updates, automatically switches to ClaudeCodeTerminalChat
- Simple, clean solution that matches user expectations

---

### Session 81 - 2026-01-26 EST
**Task**: BUG-24 - Chat loading state after project create (investigation)
**What**: Attempted to show loading spinner instead of "Hello I'm Claude" when navigating to workspace

**Problem**: After creating project, Chat.jsx shows regular chat with welcome message for ~4 seconds before ClaudeCodeTerminalChat loads.

**Root Cause Analysis**:
- Chat.jsx checks `useClaudeCodeTerminal = isAnthropicModel && claudeCodeStatus?.authenticated && serverId`
- Initial `claudeCodeStatus` in Workspace.jsx is `{installed: false, authenticated: false}` - no `checking` field
- WorkspaceTopBar runs claude code check async, sets `checking: true`, then `checking: false` when done
- Chat renders before the check starts, sees `authenticated: false`, shows regular chat

**Attempted Fixes**:
1. Added check `claudeCodeStatus?.checking === true` → show loading - FAILED: initial state has no `checking` field
2. Added check `!('checking' in claudeCodeStatus)` → show loading - FAILED: still shows regular chat
3. Combined checks for pending state - FAILED: timing issue, check hasn't started yet

**Why It's Hard**:
- The claudeCodeStatus check runs in WorkspaceTopBar's useEffect
- That effect depends on `linkedServerId` and `isConnected`
- These values take time to resolve after navigation
- Chat renders immediately with stale/initial state

**Also Fixed**:
- Removed "Disconnect VPS" from 3-dot menu (confusing, moved to Settings)
- Added loading overlay to ClaudeCodeTerminalChat while connecting
- Hid input bar in terminal view (only shows in bubble view)
- Added error handling to VPSConnection.create_channel() for stale connections
- Added logging to VPS connection for debugging

---

### Session 80 - 2026-01-26 EST
**Task**: INFRA-01 - SSH Connection Multiplexing
**What**: Implemented single SSH connection per VPS with multiplexed PTY channels

**Architecture Before**:
- Each terminal WebSocket created a NEW SSHConnection
- SSHConnection had single `process` field (only 1 PTY)
- Terminals to same VPS had independent connection fate
- Status not synced across components

**Architecture After**:
- VPSConnectionManager singleton manages ONE connection per VPS
- VPSConnection holds multiple PTYChannels (up to N terminals)
- All terminals share fate - if SSH drops, all channels die together
- Status listeners broadcast connection changes to all WebSockets

**Key Pattern - Channel-Based Multiplexing**:
```python
class VPSConnection:
    """One SSH connection per VPS, multiple PTY channels"""
    def __init__(self):
        self.conn = None  # Single asyncssh connection
        self.channels = {}  # Multiple PTY channels
        self._status_listeners = []  # Notify all terminals

    async def create_channel(self, cols, rows) -> PTYChannel:
        # Creates new PTY on existing connection
        process = await self.conn.create_process(...)
        channel = PTYChannel(id=uuid4(), process=process)
        self.channels[channel.id] = channel
        return channel

    async def close_channel(self, channel_id):
        # Close channel without killing connection
        if channel_id in self.channels:
            self.channels[channel_id].close()
            del self.channels[channel_id]
```

**Key Pattern - Status Broadcasting**:
```python
# Backend sends status changes to all terminals
async def on_status_change(server_id, status, error_msg):
    await websocket.send_json({
        "type": "connection_status",
        "server_id": server_id,
        "status": status.value,  # connected|disconnected|error
        "message": error_msg
    })

# Frontend handles shared fate
case 'connection_status':
    if (message.status === 'disconnected') {
        setStatus('disconnected')
        xtermRef.current.writeln('VPS connection lost - all terminals affected')
    }
```

**Files Created**:
- backend/services/vps_connection.py (VPSConnectionManager, VPSConnection, PTYChannel)

**Files Modified**:
- backend/routers/terminal.py (use vps_manager + create channels)
- backend/routers/ssh.py (update terminal_websocket to use channels)
- frontend/src/components/MultiTerminal.jsx (handle connection_status message)

**Testing Status**: Backend imports verified, server starts. Real-world testing requires VPS.

---

### Session 79 - 2026-01-26 EST
**Task**: PHASE-2 MVP wrap-up - Terminal loading spinner
**What**: Added loading state while terminal initializes

**Problem**: Terminal view shows blank screen while xterm loads
**Solution**:
- Add `terminalReady` state, set true after xterm mounts
- Show spinner + "Loading terminal..." while waiting
- Terminal already defaults to 'terminal' mode (useState line 195)

**Note**: If bubble view still appears on load, user needs to clear browser cache (Ctrl+Shift+R)

**PHASE-2 MVP Status**: COMPLETE
- ✅ Bubble/terminal toggle
- ✅ User/Claude message rendering
- ✅ Thinking indicator with spinner text
- ✅ Echo detection (skip user input capture)
- ✅ Spinner word filtering (50+ words)
- ✅ Terminal loading spinner
- ⚠️ Known: Some edge cases with UI artifact leaking

---

### Session 78 - 2026-01-26 EST
**Task**: PHASE-2 polish - Thinking indicator
**What**: Added visual feedback when Claude is processing

**Problem**: In bubble view, no way to tell if Claude is working or stuck
- User sends message, sees nothing
- Have to switch to terminal view to see spinner
- Connection timeout not reflected in chat status

**Solution**: Processing state + thinking indicator
1. Track `isProcessing` state - true after sending, false when prompt detected
2. Detect spinner words in output (channeling, catapulting, etc.) → update `processingText`
3. Show animated "thinking" indicator with bouncing dots + spinner word
4. Reset processing state on error/disconnect/reconnect

**Key Pattern - Processing Detection**:
```javascript
// In output handler, detect spinner and update text
const spinnerPatterns = ['channeling', 'catapulting', 'thinking', ...]
for (const pattern of spinnerPatterns) {
  if (lowerData.includes(pattern)) {
    setProcessingText(pattern.charAt(0).toUpperCase() + pattern.slice(1) + '...')
    break
  }
}

// When prompt detected, processing complete
if (hasPromptAtEnd) {
  setIsProcessing(false)
}
```

---

### Session 77 - 2026-01-26 EST
**Task**: PHASE-2 polish - Echo handling and styling
**What**: Fixed user input appearing as Claude response, improved bubble visuals

**Problem**: User's message was being echoed by terminal and captured as Claude's response
- "Knots sounds fun for kids..." appeared in both user and Claude bubbles
- Spaces stripped from echoed text
- "Catapulting..." and "● LIVE" still leaking

**Solution**: Echo detection approach
1. When sending message, set `waitingForEchoRef = true`
2. Skip all output until we detect response indicator (spinner chars)
3. 500ms fallback timeout clears buffer if no indicator seen
4. Only THEN start capturing Claude's actual response

**Key Pattern - Echo Skipping**:
```javascript
// In output handler:
if (waitingForEchoRef.current) {
  const hasResponseStart = responseIndicators.some(i => data.includes(i))
  if (hasResponseStart) {
    waitingForEchoRef.current = false
    outputBufferRef.current = '' // Clear accumulated echo
  }
  return // Skip this output
}
```

**Styling Improvements**:
- Gradient avatars with box shadows
- Better spacing (20px margin, 1.7 line-height)
- Subtle border on Claude bubbles for depth

---

### Session 76 - 2026-01-26 EST
**Task**: PHASE-2 polish - Spinner text filtering
**What**: Enhanced bubble view filter to catch more Claude Code UI elements

**Problem**: Spinner animation text and UI fragments leaking into bubble view
- Words like "Pollinating...", "Percolating...", "Bamboozling..." appearing as messages
- Tool names and short fragments showing up

**Solution**: Comprehensive filter approach
1. Expanded spinner word list (30+ words covering all -ating/-ing patterns)
2. Skip lines ending with "..." (loading indicators)
3. Skip tool names (Read, Write, Bash, etc.)
4. Skip short fragments (<10 chars, no spaces, not capitalized)
5. Default to terminal view on startup (user can see Claude load, then switch to bubbles)

**Key Pattern - Aggressive UI Filtering**:
```javascript
// Multiple layers of filtering for terminal → bubble conversion
if (spinnerWords.some(word => lowerLine.includes(word))) return false
if (trimmed.endsWith('...')) return false
if (toolNames.some(tool => lowerLine === tool)) return false
if (trimmed.length < 10 && !trimmed.includes(' ')) return false
```

---

### Session 75 - 2026-01-26 EST
**Task**: BUG-23 + PHASE-2

**BUG-23: Setup Wizard VPS Validation**
- Root cause: Setup.jsx required username field filled, CreateProject.jsx defaults to 'root'
- Fix: Default username to 'root', add .trim() to API call values

**PHASE-2: Chat Bubble Rendering for Claude Code Output**
- Added view mode toggle in status bar (bubbles/terminal icons)
- Created ChatBubble component with user (right, blue) and Claude (left, purple avatar)
- Strip ANSI codes from terminal output for clean text
- Parse output by detecting `> ` prompt pattern for user input
- Accumulate Claude responses until next user prompt
- Render markdown code blocks and inline code
- Auto-scroll to bottom on new messages
- Keep raw terminal always mounted (hidden when in bubbles mode)

**Key Pattern - View Mode Toggle**:
```javascript
// Keep component mounted, toggle visibility
<div style={{ display: viewMode === 'terminal' ? 'block' : 'none' }}>
  <terminal />
</div>
```

**Files Modified**:
- frontend/src/pages/Setup.jsx (BUG-23)
- frontend/src/components/ClaudeCodeTerminalChat.jsx (PHASE-2)
- frontend/src/index.css (PHASE-2 styles)

---

### Session 74 - 2026-01-26 EST
**Task**: BUG-17, BUG-19, BUG-20 - Setup Wizard and Create Project VPS Issues
**What**: Fixed Setup Wizard VPS test and verified CreateProject VPS save

**BUG-17: Setup Wizard VPS Test Not Working**
- Root cause: Used non-existent `/api/vps/test` endpoint
- Fix: Changed to `/api/ssh/test` (same as CreateProject)
- Added localStorage save after successful test (saves to `vps_servers`)

**BUG-19: Setup Wizard SSH Key Format**
- Updated textarea styling to match CreateProject:
  - `minHeight: 120px` instead of `rows={4}`
  - `fontSize: 11px` with Monaco/Consolas monospace font
  - `whiteSpace: pre` to preserve key formatting
  - Better placeholder showing key format

**BUG-20: CreateProject VPS Save (Already Fixed)**
- Verified CreateProject.jsx already saves VPS to localStorage after successful test (lines 619-653)
- No changes needed

**Files Modified**:
- frontend/src/pages/Setup.jsx (connectVPS, saveVPSConfig, textarea styling)
- harness/feature_queue.json

---

### Session 73 - 2026-01-26 EST
**Task**: BUG-21 - Project Switch/Refresh Doesn't Reconnect VPS or Load Chat Terminal
**What**: Fixed project not persisting in URL, causing wrong project to load on refresh

**Root Causes Found**:
1. **URL didn't track project ID**: `/workspace` had no query param, so refresh loaded first project from DB
2. **linkedServerId not updating**: State initialized from `project?.vps_server_id` but never updated when project prop changed

**Solution**:
1. **App.jsx** - URL project persistence:
   - Added `useSearchParams` hook to read/write URL params
   - Navigation to workspace now includes `?projectId={id}`
   - On page load, `loadProjects()` checks URL for `projectId` and sets that project as active
   - All navigation points updated: `onSelectProject`, `onNavigate`, `handleProjectCreated`, Dashboard

2. **Workspace.jsx** - linkedServerId sync:
   - Added `useEffect` that updates `linkedServerId` when `project` prop changes
   - Critical for page refresh: component mounts with null project, then receives project after load
   - Without this, `linkedServerId` stayed null even after project loaded

3. **ClaudeCodeTerminalChat.jsx** - Project switch handling:
   - Added `projectSlug` to reconnect useEffect dependency
   - Ensures terminal reconnects when switching to different project (even with same VPS)

**Key Pattern - URL State Persistence**:
```javascript
// Read from URL on load
const [searchParams] = useSearchParams()
const urlProjectId = searchParams.get('projectId')
if (urlProjectId) {
  const project = data.find(p => String(p.id) === urlProjectId)
  if (project) setActiveProject(project)
}

// Write to URL on navigation
navigate(`/workspace?projectId=${project.id}`)
```

**Key Pattern - Sync State from Props**:
```javascript
// Initialize from prop
const [linkedServerId, setLinkedServerId] = useState(project?.vps_server_id || null)

// CRITICAL: Update when prop changes (for page refresh)
useEffect(() => {
  if (project?.vps_server_id) {
    setLinkedServerId(project.vps_server_id)
  } else {
    setLinkedServerId(null)
  }
}, [project?.id, project?.vps_server_id])
```

**Files Modified**:
- frontend/src/App.jsx (URL param handling)
- frontend/src/components/Workspace.jsx (linkedServerId sync)
- frontend/src/components/ClaudeCodeTerminalChat.jsx (projectSlug reconnect)

---

### Session 72 - 2026-01-26 EST
**Task**: CLAUDE-02-REWORK (Phase 1) - Terminal-based Chat for Claude Code
**What**: Replace one-shot `claude -p` approach with live terminal session in chat area

**Investigation Findings**:
1. **Claude Code Output Patterns**: User input uses `>` marker, supports `--output-format` (text/json/stream-json), Ink-based rendering
2. **ANSI Codes**: Claude Code uses ANSI for styling but doesn't filter them (can consume tokens)
3. **xterm.js Interception**: Can wrap `term.write()`, use `onWriteParsed`, Buffer API, or parser hooks
4. **Resume Functionality**: `claude --resume` shows picker, `claude -c` continues most recent, history in `~/.claude/`

**Implementation (Phase 1)**:
1. Created `ClaudeCodeTerminalChat.jsx`:
   - xterm.js in chat area (reuses existing WebSocket terminal approach)
   - Auto-runs `claude` command on VPS connect
   - Wires chat input to terminal stdin via WebSocket
   - Status tracking: disconnected → connecting → connected → claude_starting → claude_ready
   - Detects Claude Code ready by watching for `>` prompt in output

2. Modified `Chat.jsx`:
   - Added `useClaudeCodeTerminal` memoized flag
   - When Anthropic model + claudeCodeStatus.authenticated + serverId → render ClaudeCodeTerminalChat
   - Otherwise render normal chat

3. Added CSS in `index.css`:
   - `.claude-code-terminal-chat` styling
   - Status bar with dot indicators
   - Terminal area styling to match chat background

**Key Pattern - Conditional Chat Mode**:
```javascript
const useClaudeCodeTerminal = useMemo(() => {
  const isAnthropicModel = model?.provider === 'anthropic' ||
    (typeof model === 'string' && model.toLowerCase().includes('claude'))
  return isAnthropicModel && claudeCodeStatus?.authenticated && serverId
}, [model, claudeCodeStatus, serverId])

if (useClaudeCodeTerminal) {
  return <ClaudeCodeTerminalChat project={project} serverId={serverId} />
}
```

**Files Created**:
- frontend/src/components/ClaudeCodeTerminalChat.jsx

**Files Modified**:
- frontend/src/components/Chat.jsx
- frontend/src/index.css

**Phase 2 TODO** (not yet implemented):
- Parse terminal output for chat bubble rendering
- User messages → right bubbles, Claude responses → left bubbles
- Strip ANSI codes for clean text display

---

### Session 71 - 2026-01-26 EST
**Task**: ONBOARD-01 - Setup Wizard Skeleton
**What**: Post-signup wizard to configure API keys and VPS

**Implementation**:
1. Backend (`models/__init__.py`):
   - Added `setup_completed` field to User model (Boolean, default False)

2. Backend (`services/auth.py`):
   - Added `setup_completed` to UserResponse schema
   - Updated `user_to_response()` to include setup_completed

3. Backend (`routers/auth.py`):
   - Added POST `/api/auth/me/setup-complete` endpoint to mark setup as done

4. Frontend (`pages/Setup.jsx`) - NEW:
   - Created step-based wizard with 2 steps:
     - Step 1: Choose path - OpenRouter API key vs Anthropic Pro subscription
     - Step 2a (OpenRouter): Enter API key, validate against OpenRouter API, save to localStorage
     - Step 2b (Anthropic): Connect VPS, test connection, detect Claude Code
   - Skip option to bypass setup
   - Calls `/api/auth/me/setup-complete` on finish

5. Frontend (`App.jsx`):
   - Added `/setup` route
   - Added redirect logic: if `user.setup_completed === false`, redirect to /setup
   - If on /setup but already completed, redirect to /dashboard
   - `setSetupComplete` state passed to Setup component for navigation after completion

**User Flow**:
1. New user signs up → `setup_completed: false` in database
2. After login, AppContent checks `user.setup_completed`
3. If false and not on /setup → redirect to /setup
4. User completes wizard or clicks "Skip" → POST to /setup-complete → redirect to /dashboard
5. On subsequent logins, user goes directly to dashboard

**Key Patterns**:
- **Redirect on auth state change**: Use effect to check user.setup_completed when user object loads
- **OpenRouter API key validation**: Call `/api/v1/models` with Bearer token to verify key works
- **VPS connection test**: POST to `/api/vps/test` with credentials

**Files Created**:
- frontend/src/pages/Setup.jsx

**Files Modified**:
- backend/models/__init__.py (User model)
- backend/services/auth.py (UserResponse, user_to_response)
- backend/routers/auth.py (setup-complete endpoint)
- frontend/src/App.jsx (route, redirect logic)

---

### Session 70 - 2026-01-26 EST
**Task**: MODEL-02, MODEL-03 - Billing Source Detection and Warning

**MODEL-02: Billing Source Detection and Display**
**What**: Show users which billing source each model uses in the model selector

**Implementation**:
1. Frontend (`WorkspaceTopBar.jsx`):
   - Added `getBillingLabel()` function that returns billing source text:
     - Anthropic models + Claude Code available → "Pro Subscription" (green)
     - Anthropic models without Claude Code → "OpenRouter (paid)" (amber)
     - OpenRouter models → "OpenRouter (paid)" (amber)
     - Coming Soon models → "Coming Soon" (muted)
   - Added `getBillingColor()` function for consistent color coding
   - Added billing badge to selected model button (shows "PRO" or "PAID")
   - Added billing label to each model in dropdown list

**MODEL-03: Billing Switch Warning Popup**
**What**: Warn user when switching from Pro subscription to paid-per-call model

**Implementation**:
1. Frontend (`ModelNotification.jsx`):
   - Added `showDontShowAgain` prop to show checkbox
   - Added `onDontShowAgainChange` callback for preference storage
   - Checkbox state managed internally, fires callback on confirm

2. Frontend (`WorkspaceTopBar.jsx`):
   - Added `showBillingWarning` state for second modal
   - Added `isCurrentModelPro()` to detect if current model uses Pro subscription
   - Added `willUseOpenRouter()` to detect if new model will use OpenRouter
   - Added `shouldShowBillingWarning()` to check localStorage preference
   - Modified `handleModelSelect()` to detect billing switch and show warning
   - Added billing warning handlers (confirm, cancel, dontShowAgain)
   - Added second ModelNotification for billing warning with checkbox

**Preference Storage**:
- `localStorage.hide_billing_switch_warning` = 'true' when user checks "Don't show again"

**Files Modified**:
- frontend/src/components/ModelNotification.jsx
- frontend/src/components/WorkspaceTopBar.jsx

---

### Session 69 - 2026-01-26 EST
**Task**: CLAUDE-02 - Route Chat to Claude Code on VPS
**What**: When Anthropic model selected + Claude Code detected, pipe chat to VPS instead of OpenRouter

**Implementation**:
1. Backend (`services/claude_code_ssh.py`) - NEW:
   - Created `ClaudeCodeSSHService` that routes chat through Claude Code CLI on VPS
   - Runs `claude -p "prompt" --max-tokens N` via SSH
   - Streams output back to frontend in SSE format
   - Formats multi-turn conversations for Claude Code context

2. Backend (`routers/chat.py`):
   - Added `claude_code_ssh` provider type
   - Added `server_id` field to ChatRequest for VPS routing
   - Routes to ClaudeCodeSSHService when provider is `claude_code_ssh`
   - Always uses streaming for claude_code_ssh (no non-streaming mode)

3. Frontend (`Chat.jsx`):
   - Added `serverId` and `claudeCodeStatus` props
   - Detects when to use Claude Code SSH routing:
     - Model provider is 'anthropic' OR model ID contains 'claude'
     - `claudeCodeStatus.authenticated` is true
     - `serverId` is available
   - Passes `server_id` in request body when using claude_code_ssh

4. Frontend (`Workspace.jsx`):
   - Added `claudeCodeStatus` state tracking
   - Pass `serverId` (linkedServerId) and `claudeCodeStatus` to Chat
   - Pass `onClaudeCodeStatusChange` callback to WorkspaceTopBar

5. Frontend (`WorkspaceTopBar.jsx`):
   - Added `onClaudeCodeStatusChange` prop
   - Calls callback when Claude Code detection completes

**Provider Priority**:
1. Claude Code SSH (if Anthropic model + VPS connected + Claude Code authenticated)
2. Claude Direct API (if apiKeys.claude available)
3. OpenRouter (default fallback)

**Key Pattern - Async Generator Interface**:
```python
# Service must return async generator, not BE one
async def chat(self, ...) -> AsyncGenerator[str, None]:
    # Returns the generator (not yields from it)
    return self._stream_chat(conn, cmd)

async def _stream_chat(self, conn, cmd) -> AsyncGenerator[str, None]:
    # This is the actual async generator
    async for chunk in self._stream_command(conn, cmd):
        yield chunk
```

**Files Created**:
- backend/services/claude_code_ssh.py

**Files Modified**:
- backend/routers/chat.py
- frontend/src/components/Chat.jsx
- frontend/src/components/Workspace.jsx
- frontend/src/components/WorkspaceTopBar.jsx

---

### Session 68 - 2026-01-26 EST
**Task**: AUTH-01 - Password Validation Rules
**What**: Added password strength requirements to signup and password reset

**Implementation**:
1. Frontend (AuthPage.jsx):
   - Added `passwordRules` array with 4 validation rules (length, uppercase, number, special char)
   - Created `PasswordRequirements` component showing real-time feedback as user types
   - Submit button disabled until all requirements met
   - Shows green check/red X for each rule

2. Backend (routers/auth.py):
   - Added `validate_password()` helper function with regex checks
   - Applied to `/signup` and `/reset-password` endpoints
   - Returns specific error message indicating which requirement failed

**Password Requirements**:
- Min 8 characters
- At least 1 uppercase letter (A-Z)
- At least 1 number (0-9)
- At least 1 special character (!@#$%^&*)

**Files Modified**:
- frontend/src/components/AuthPage.jsx
- backend/routers/auth.py

**Note**: No password change feature exists yet (mentioned in task description but not implemented). Validation applies to signup and reset-password endpoints.

---

**Task**: CLAUDE-01 - Detect Claude Code on VPS
**What**: Added Claude Code detection when VPS connects

**Implementation**:
1. Backend (`services/ssh.py`):
   - Added `run_command()` method to SSHConnection for executing commands and getting output

2. Backend (`routers/ssh.py`):
   - Added `/api/ssh/servers/{server_id}/claude-code` endpoint
   - Runs `which claude` to check if installed
   - Runs `claude --version` to get version
   - Returns `ClaudeCodeStatus`: installed, version, authenticated, error

3. Frontend (`WorkspaceTopBar.jsx`):
   - Added `claudeCodeStatus` state to track detection result
   - Added useEffect to check Claude Code when VPS connects
   - Updated `apiKeys.anthropic` to be based on real detection
   - Updated provider header to show real status:
     - "⏳ Checking..." while detecting
     - "○ Connect VPS" when no VPS connected
     - "✓ Claude Code Ready" when installed & authenticated
     - "⚠ Not Authenticated" when installed but not auth'd
     - "⚠ Install Claude Code" when not installed
   - Added "Install Claude Code on VPS →" link to Anthropic docs
   - Anthropic models now greyed out when Claude Code not available

4. Frontend (`Workspace.jsx`):
   - Passed `linkedServerId` and `isConnected` props to WorkspaceTopBar

**Files Modified**:
- backend/services/ssh.py
- backend/routers/ssh.py
- frontend/src/components/WorkspaceTopBar.jsx
- frontend/src/components/Workspace.jsx

---

**Task**: MODEL-01 - Per-Project Model Persistence
**What**: Store selected model per project instead of globally

**Implementation**:
1. Backend (`models/__init__.py`):
   - Added `selected_model` field to Project model (JSON string)
   - Updated `to_dict()` to include selected_model

2. Backend (`routers/projects.py`):
   - Added `selected_model` to ProjectResponse and ProjectUpdate
   - Updated `db_to_response()` to include selected_model
   - Updated `update_project()` to handle selected_model JSON serialization

3. Frontend (`Workspace.jsx`):
   - Initialize selectedModel from project.selected_model or localStorage fallback
   - Save model to project via PATCH /api/projects/{id} when changed
   - Save to localStorage as "last_used_model" for new projects default
   - Load model when project changes (switching between projects)

**Files Modified**:
- backend/models/__init__.py
- backend/routers/projects.py
- frontend/src/components/Workspace.jsx

---

### Session 67 - 2026-01-25 EST
**Task**: CLEANUP-03 - Fix Config Mismatch - Standardize on SQLite + Port 8000
**What**: Aligned configuration files - Vite proxy now points to port 8000, init.sh no longer starts PostgreSQL/Docker

**Changes**:
- `frontend/vite.config.js`: Changed proxy target from 3001 to 8000
- `init.sh`: Removed PostgreSQL/Docker startup (Step 1), renumbered remaining steps
- `init.sh`: Updated summary output to show "SQLite (backend/hubllm.db)" instead of PostgreSQL URL

**Testing**:
- Verified backend healthy on port 8000: `curl http://localhost:8000/health` → `{"status":"healthy"}`
- Verified Vite proxy working: `curl http://localhost:5173/api/servers/` → returns server data (proxied to 8000)
- Frontend restarted to pick up new vite.config.js

**Files Modified**:
- frontend/vite.config.js
- init.sh

---

### Session 66 - 2026-01-25 EST
**Task**: FEAT-08 - Chat File Drop and Paste
**What**: Added drag/drop and Ctrl+V paste support for images in chat

**Implementation**:
- Drop zone overlay appears when dragging files over chat panel
- Paste event handler captures clipboard images
- FIFO queue limits to 4 images max (oldest removed when exceeding)
- Images stored as base64 data URLs
- Thumbnails shown in input area with remove buttons
- Images sent to Claude API in multimodal content format

**Key Patterns**:

**Drag counter for nested elements**:
```javascript
// Track drag enter/leave across nested children
const dragCounterRef = useRef(0)

const handleDragEnter = (e) => {
  e.preventDefault()
  dragCounterRef.current++
  setIsDragging(true)
}

const handleDragLeave = (e) => {
  e.preventDefault()
  dragCounterRef.current--
  if (dragCounterRef.current === 0) {
    setIsDragging(false) // Only hide when truly leaving
  }
}
```
Why: dragenter/dragleave fire for every child element. Counter tracks net enters.

**Files Modified**:
- frontend/src/components/Chat.jsx - Added image state, drag/drop, paste handlers
- frontend/src/index.css - Added drop overlay, thumbnail, user-images styles

---

### Session 65 - 2026-01-25 EST
**Task**: BUG-15, BUG-16 - Terminal Bugs

**BUG-15: Terminal Connection Drops on Panel Toggle**

**What**: Fixed terminal connections dropping when LLM-Dev panel is collapsed and reopened

**Root Cause**:
- LLMDevPanel.jsx used conditional rendering `{isExpanded && (...)}` for the content area
- When panel collapsed, the entire content including `<MultiTerminal>` component was unmounted from DOM
- This killed all WebSocket connections, requiring reconnection when panel reopened

**Solution**:
- Changed from conditional rendering to CSS-based hiding
- Always render the content area but use `display: isExpanded ? 'flex' : 'none'`
- Components stay mounted (preserving WebSocket connections) but hidden when collapsed

**Key Pattern - Keep Components Mounted, Toggle Visibility**:
```jsx
// BAD: Conditional rendering unmounts component
{isExpanded && <ComponentWithWebSocket />}

// GOOD: CSS hiding keeps component mounted
<div style={{ display: isExpanded ? 'flex' : 'none' }}>
  <ComponentWithWebSocket />
</div>
```

**Files Modified**:
- frontend/src/components/LLMDevPanel.jsx (lines 515-526)

---

**BUG-16: Terminal Pane Can't Resize Smaller**

**What**: Fixed terminal pane divider not allowing resize to make pane smaller

**Root Cause**:
- The drag calculation used absolute container-relative positioning
- Calculated width from container left edge to mouse position, subtracting previous terminals' widths
- This approach was fragile and could calculate incorrect widths during rapid drags
- Stale closures from `terminals` dependency could also cause issues

**Solution**:
- Changed to delta-based calculation approach
- On mousedown: record starting X position and current terminal width
- On mousemove: calculate delta (mouseX - startX) and add to starting width
- This is more reliable: drag right = positive delta = larger, drag left = negative delta = smaller

**Key Pattern - Delta-based Drag Resize**:
```javascript
// On mousedown - record start position and initial size
const handleDividerMouseDown = (terminalId, e) => {
  setDragStartX(e.clientX)
  setDragStartWidth(terminal.width)
}

// On mousemove - calculate delta and add to initial size
const handleDividerMouseMove = (e) => {
  const delta = e.clientX - dragStartX
  const newWidth = dragStartWidth + delta
  const clampedWidth = Math.max(150, Math.min(600, newWidth))
  // Update width
}
```

**Files Modified**:
- frontend/src/components/MultiTerminal.jsx (lines 403-449)

---

### Session 64 - 2026-01-25 EST
**Task**: FEAT-09 - Multi-Terminal Split Panes with Color Coding

**What**: Major refactor of MultiTerminal.jsx to show multiple terminal panes simultaneously with color-coded identification

**Implementation**:
1. **Split Panes**: Changed from single active terminal with tab switching to side-by-side panes
   - Each terminal has its own width (default 300px, range 150-600px)
   - Draggable dividers between each pane for resizing
   - All terminals visible at once (up to 4 max)
   - Empty space fills remaining width on right

2. **Color Coding**: 8 colors available (Gray, Red, Orange, Yellow, Green, Cyan, Blue, Purple)
   - Right-click terminal in tab header or sidebar → color picker popup
   - Color shows on: tab header dot, sidebar dot, color bar at top of each pane
   - Connected terminals get glow effect on dots

3. **Tab Header**: New row above terminal panes
   - Shows all terminals with `[● name]` format
   - Click to focus that terminal
   - Active terminal has underline indicator
   - + button to add new terminal (max 4)

4. **Narrow Sidebar**: Reduced from 200px to 120px
   - Shows "Terms" header with + button
   - Compact terminal list with colored dots
   - Right-click for color picker

5. **TerminalInstance Changes**:
   - Added `isSplitPane` prop to control visibility
   - In split mode: `position: relative`, always visible
   - In tabbed mode (mobile): `position: absolute`, only active visible

**Key Pattern - Split Pane Divider Drag**:
```javascript
// Track which divider is being dragged
const [draggingDividerId, setDraggingDividerId] = useState(null)

const handleDividerMouseMove = useCallback((e) => {
  if (!draggingDividerId) return

  // Calculate cumulative width of terminals before this one
  let prevWidth = 0
  for (let i = 0; i < terminalIndex; i++) {
    prevWidth += terminals[i].width + 4 // +4 for divider
  }

  // New width = mouse position - previous terminals - container left
  const newWidth = e.clientX - containerRect.left - prevWidth
  // Update only the terminal being dragged
  setTerminals(prev => prev.map(t =>
    t.id === draggingDividerId ? { ...t, width: clampedWidth } : t
  ))
}, [draggingDividerId, terminals])
```

**Key Pattern - Context Menu Color Picker**:
```javascript
// Right-click opens color picker at mouse position
const handleTerminalContextMenu = (e, terminalId) => {
  e.preventDefault()
  setColorPickerPosition({ x: e.clientX, y: e.clientY })
  setColorPickerTerminalId(terminalId)
}

// Click outside closes picker
useEffect(() => {
  const handleClickOutside = () => setColorPickerTerminalId(null)
  document.addEventListener('click', handleClickOutside)
  return () => document.removeEventListener('click', handleClickOutside)
}, [colorPickerTerminalId])
```

**Files Modified**:
- frontend/src/components/MultiTerminal.jsx (major refactor, ~980 lines)

---

### Session 63 - 2026-01-25 EST
**Task**: BUG-14 - Editor Tab Not Loading Selected File

**What**: Fixed file selection from sidebar not loading content in Editor tab

**Root Causes Found**:
1. **Frontend - Stale closure bug**: `openEditors` captured in useEffect closure was always `[]` instead of current state
2. **Frontend - Non-memoized callback**: `handleEditorReady` recreated on every render causing useEffect to re-run
3. **Backend - Python decode error**: SFTP read using text mode `"r"` returned string, then `.decode()` called on string

**Solutions**:
1. Changed `openEditors.find(...)` check to use functional update pattern inside `setOpenEditors(prev => ...)`
2. Wrapped `handleEditorReady` in `useCallback` with empty deps
3. Changed SFTP read to binary mode `"rb"` so content is bytes, then decode works

**Key Pattern - Avoid Stale Closures in useEffect Callbacks**:
```javascript
// BAD: openEditors captured from closure - stale!
useEffect(() => {
  onEditorReady({
    openFile: () => {
      if (!openEditors.find(...)) { // Always sees initial []
        setOpenEditors(prev => [...prev, item])
      }
    }
  })
}, [onEditorReady])

// GOOD: Use functional update to read current state
useEffect(() => {
  onEditorReady({
    openFile: () => {
      setOpenEditors(prev => {
        const exists = prev.find(...)
        if (!exists) {
          return [...prev, item]
        }
        return prev.map(...)
      })
    }
  })
}, [onEditorReady])
```

**Key Pattern - Memoize Callbacks Passed to Child useEffects**:
```javascript
// Parent component
const handleReady = useCallback((api) => {
  apiRef.current = api
}, [])  // Stable reference

// Child component
useEffect(() => {
  onReady({ openFile: ... })  // Only runs once now
}, [onReady])
```

**Files Modified**:
- frontend/src/components/Workspace.jsx (useCallback for handleEditorReady)
- frontend/src/components/LLMDevPanel.jsx (functional update for openEditors)
- backend/services/ssh.py (binary mode "rb" for SFTP read)

---

### Session 62 - 2026-01-25 EST
**Task**: BUG-12 - xterm-screen Width Calculation Broken

**What**: Fixed xterm fitAddon calculating absurd width (350554px) causing terminal text to bunch on left side

**Root Cause**:
1. Container divs were missing explicit width constraints (`width: 100%`, `minWidth: 0`)
2. In flex layouts, children can grow beyond parent width without `minWidth: 0`
3. Initial `fitAddon.fit()` called with `setTimeout(..., 0)` which was too early - container not fully rendered
4. fitAddon calculates terminal dimensions from container, so unbounded container = huge width

**Solution**:
1. Added `width: 100%`, `minWidth: 0` to all container chain:
   - LLMDevPanel `.llm-dev-content` container
   - Terminal tab content wrapper
   - MultiTerminal outer and inner containers
   - TerminalInstance wrapper (changed to `position: absolute; inset: 0`)
2. Changed initial fit to use `requestAnimationFrame` + secondary delayed fit
3. Added validation: only call `fit()` if container has positive dimensions
4. Used `requestAnimationFrame` in ResizeObserver callback for debouncing

**Key Pattern - Flex Container Width Constraints**:
```jsx
// For flex children that contain xterm.js terminals:
<div style={{
  flex: 1,
  width: '100%',      // Explicit width constraint
  minWidth: 0,        // Allow shrinking below content width
  minHeight: 0,       // Allow shrinking below content height
  overflow: 'hidden'  // Prevent content overflow
}}>
```

**Key Pattern - xterm.js FitAddon Initialization**:
```javascript
// After term.open(), wait for layout to complete before fitting
requestAnimationFrame(() => {
  const rect = containerRef.current.getBoundingClientRect()
  if (rect.width > 0 && rect.height > 0) {
    fitAddonRef.current.fit()
  }
  // Secondary fit after layout settles
  setTimeout(doFit, 100)
})
```

**Key Pattern - Max Width for Readability**:
```jsx
// Cap terminal at ~80 columns for readability on wide screens
// At 13px font, monospace chars are ~8px wide
// 80 chars × 8px + padding ≈ 700px
maxWidth: '700px'
```

**Files Modified**:
- frontend/src/components/MultiTerminal.jsx
- frontend/src/components/LLMDevPanel.jsx

---

### Session 61 - 2026-01-25 15:15 EST
**Task**: FEAT-07 - Multiple Terminal Tabs

**What**: Added support for multiple terminal instances within the Terminal tab

**Implementation**:
- Created new `MultiTerminal.jsx` component managing multiple terminal instances
- Each terminal gets its own WebSocket SSH session to VPS
- Tab management: create (+), close (✕), switch, rename (double-click)
- Responsive layout:
  - Desktop (>768px): Right sidebar "TERMINALS" with vertical list + button
  - Mobile (<768px): Horizontal sub-tabs below main LLM-Dev tabs
- Status indicators: green=connected, yellow=connecting, gray=disconnected
- Active terminal visually highlighted
- Terminals persist while switching (display:none vs display:flex)
- `TerminalInstance` component extracted from WorkspaceTerminal logic

**Key Pattern**: Managing multiple xterm.js instances
```javascript
// Keep instances mounted, toggle visibility
display: isActive ? 'flex' : 'none'

// Refit terminal when becoming active
useEffect(() => {
  if (isActive) {
    setTimeout(() => fitAddonRef.current?.fit(), 50)
  }
}, [isActive])
```

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

