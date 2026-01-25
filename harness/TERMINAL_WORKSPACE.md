# Terminal Workspace Architecture
**Version 1.0 | Updated: January 25, 2026**

This document describes the Terminal tab implementation in the LLM-Dev panel. Read this before working on terminal-related tasks.

---

## Current Architecture

### File Structure
```
frontend/src/components/
├── LLMDevPanel.jsx      # Parent container with tabs (Terminal, Editor, Docker, Logs, Context)
├── MultiTerminal.jsx    # Terminal tab implementation (500+ lines)
└── WorkspaceTerminal.jsx # Individual xterm.js instance wrapper
```

### Layout Structure (Current - v4.6)
```
┌─────────────────────────────────────────────────────────────────┬───────────┐
│ Terminal | Editor | Docker | Logs | Project Context              │           │
├──────────────────────────────────────────────────────────────────┤ TERMINALS │
│                                                                  │     +     │
│                    ACTIVE TERMINAL                               │ ● bash    │
│                    (xterm.js instance)                           │           │
│                                                                  │           │
│                                                                  ├───────────┤
│                                                                  │  divider  │
└──────────────────────────────────────────────────────────────────┴───────────┘
```

### Key CSS Classes (from inspector)
```
div.llm-dev-content          # Main panel content area
  div.terminal-tab-wrapper   # Terminal tab container (flex)
    div.terminal-area        # Active terminal (flex: 1)
      div.terminal.xterm     # xterm.js root
        div.xterm-viewport   # Scrollable viewport
        div.xterm-screen     # Rendered content (width was 350k px bug)
    div.resize-divider       # Draggable divider (blue on hover)
    div.terminals-sidebar    # Right sidebar (width: 200px default)
```

### Responsive Behavior
- **Desktop (>768px):** Right sidebar visible, vertical terminal list
- **Mobile (<768px):** Horizontal sub-tabs below LLM-Dev tabs

---

## Current Features (Working)

### Multi-Terminal Support
- Click `+` to add new terminal
- Click `✕` to close terminal
- Click terminal name to switch
- Double-click to rename
- Each terminal = independent SSH session

### Terminal Status Dots
- 🟢 Green = connected
- 🟡 Yellow = connecting
- ⚪ Gray = disconnected

### Draggable Divider
- Drag left/right to resize terminal vs sidebar
- Range: 140px (min sidebar) to 400px (max sidebar)
- Blue highlight on hover/drag
- Uses native mousedown listener (per CLAUDE.md pattern)

### xterm.js Integration
- fitAddon for responsive sizing
- Auto-scroll to bottom on new output
- Connects via WebSocket to backend SSH

---

## Known Issues / Limitations

### Scrollbar (Minor)
- Click-drag on scrollbar is finicky - hard to grab
- Mouse wheel scrolling works fine
- Root cause: xterm-screen overlay captures mouse events
- **Status:** Acceptable for now, not worth fixing

### fitAddon Timing
- Must call `fitAddon.fit()` AFTER container is visible
- Using `requestAnimationFrame` + secondary delayed fit
- If terminal text bunches left, fit timing is wrong

---

## FEAT-09: Multi-Terminal Split Panes (PLANNED)

### Target Layout
```
┌───────────────────────────────────────────────────────────────────┬──────────┐
│ [● Term 1][● Term 2][● Term 3] | Editor | Docker | Logs | Context │          │
├──────────────┬──────────────┬──────────────┬──────────────────────┤TERMINALS │
│              │              │              │                      │    +     │
│  Terminal 1  │  Terminal 2  │  Terminal 3  │   (empty space)      │ 🔴 bash  │
│  (main)      │  (added)     │  (added)     │                      │ 🔵 bash 2│
│  LEFT-JUST   │   drag →     │   drag →     │                      │ 🟢 bash 3│
│  200px       │   200px      │   200px      │                      │          │
└──────────────┴──────────────┴──────────────┴──────────────────────┴──────────┘
```

### Behavior Spec
1. **Terminal 1** (main)
   - Always leftmost, left-justified
   - Opens in project directory
   - Default width: 200px
   - Draggable right edge

2. **Click + (add terminal)**
   - New terminal appears to the RIGHT of existing terminals
   - Between last terminal and empty space
   - Default width: 200px
   - Each has draggable right edge

3. **TERMINALS sidebar**
   - Far right, FIXED position
   - Narrow: ~100px (10-12 columns)
   - Contains: + button, terminal list

4. **Color Coding**
   - Right-click terminal in sidebar → color picker (8 colors)
   - Color shows on:
     - Sidebar dot (●)
     - Tab header at top (`[● Term 2]`)
   - Helps identify terminals visually

5. **Tab Header**
   - Shows as tabs: `[● Term 1][● Term 2]`
   - Colored dots match sidebar
   - Click tab = switch focus to that terminal pane
   - All terminals remain visible (not tabbed/hidden)

### Implementation Notes
- Each terminal pane = separate WorkspaceTerminal instance
- Need array of terminal states: `[{id, name, color, width, wsConnection}, ...]`
- Dividers between each pane
- fitAddon.fit() on each resize
- Consider max terminals (4-6?) to prevent cramped UI

---

## Bug Fixes Done (v4.6 Session)

| Bug | Issue | Fix |
|-----|-------|-----|
| BUG-12 | xterm-screen width: 350554px | Proper container sizing, fitAddon timing |
| BUG-13 | TERMINALS sidebar not visible | Fixed flex layout, sidebar now renders |
| - | Sidebar default too wide | Changed to 200px default |
| - | Drag range too limited | Extended to 140px-400px |

---

## Files to Modify for FEAT-09

1. **MultiTerminal.jsx** - Major refactor
   - Change from single terminal + sidebar to multiple terminal panes
   - Add terminal array state management
   - Add color picker component
   - Add draggable dividers between each pane

2. **LLMDevPanel.jsx** - Minor updates
   - Tab header may need to show terminal tabs with colors

3. **CSS** - New styles for:
   - Multi-pane layout
   - Color picker dropdown
   - Colored tab indicators

---

## Testing Checklist

When working on terminal features, verify:
- [ ] Terminal connects to VPS (green dot)
- [ ] Text fills width appropriately (not bunched left)
- [ ] Mouse wheel scroll works
- [ ] + button adds new terminal
- [ ] ✕ button closes terminal
- [ ] Switching terminals works
- [ ] Sidebar divider draggable
- [ ] Responsive: mobile shows horizontal tabs
- [ ] Page refresh: reconnects properly

---

## Reference: xterm.js Options

Current options in WorkspaceTerminal.jsx:
```javascript
{
  cursorBlink: true,
  fontSize: 14,
  fontFamily: 'Menlo, Monaco, "Courier New", monospace',
  theme: {
    background: '#1a1a2e',
    foreground: '#ffffff',
    cursor: '#ffffff'
  }
}
```

For scrollbar improvements (future):
```javascript
{
  scrollback: 1000,        // Lines to keep in buffer
  scrollSensitivity: 1,    // Mouse wheel sensitivity
  fastScrollSensitivity: 5 // Fast scroll multiplier
}
```

---

## Code Implementation Details

### File: `frontend/src/components/MultiTerminal.jsx` (778 lines)

#### Key Functions with Line Numbers

| Function | Lines | Description |
|----------|-------|-------------|
| `TerminalInstance` | 14-366 | Inner component - individual terminal with xterm.js |
| `connect()` | 31-120 | WebSocket connection to backend SSH proxy |
| `loadXterm()` | 126-189 | Async xterm.js initialization with dynamic import |
| `doFit()` | 164-172 | Safe fitAddon.fit() with dimension validation |
| `handleResize()` | 216-231 | ResizeObserver callback, refits terminal + sends resize to WS |
| `reconnect()` | 256-262 | Clears terminal and calls connect() |
| `MultiTerminal` | 370-777 | Main exported component with terminal management |
| `createTerminal()` | 441-450 | Adds new terminal to state array |
| `closeTerminal()` | 452-462 | Removes terminal, switches active if needed |
| `handleStatusChange()` | 464-468 | Callback from TerminalInstance to update status |
| `startRename()` / `finishRename()` | 470-483 | Double-click rename handlers |

#### fitAddon Initialization & fit() Calls

```
Line 154-158: fitAddon created and loaded
Line 169:     fitAddon.fit() in doFit() helper
Line 174-178: requestAnimationFrame + setTimeout(doFit, 100) for initial fit
Line 221:     fitAddon.fit() in handleResize() (ResizeObserver)
Line 247:     setTimeout(handleResize, 50) when becoming active
```

#### Sidebar Render Logic (Desktop)

```
Line 616-776: Desktop layout return block
Line 639-651: Draggable divider element with ref
Line 653-773: Right sidebar with terminal list
Line 662-690: Sidebar header with "TERMINALS" label + Plus button
Line 692-772: Terminal list items with status dots, names, close buttons
```

#### Divider Drag Handlers

```
Line 380-383: State: sidebarWidth (default 200), isDraggingSidebar, dividerRef
Line 394-406: Native mousedown listener on divider (useEffect)
Line 408-419: handleSidebarMouseMove - calculates width from mouse position
Line 421-423: handleSidebarMouseUp - stops dragging
Line 425-439: Global mousemove/mouseup listeners during drag
```

---

### State Variables

#### TerminalInstance (lines 15-21)
| Variable | Type | Purpose |
|----------|------|---------|
| `terminalRef` | useRef | DOM element for xterm to attach to |
| `xtermRef` | useRef | xterm Terminal instance |
| `wsRef` | useRef | WebSocket connection |
| `fitAddonRef` | useRef | FitAddon instance |
| `status` | useState | 'disconnected' \| 'connecting' \| 'connected' \| 'error' |
| `serverInfo` | useState | `{ server, host }` after connection |
| `error` | useState | Error message string |

#### MultiTerminal (lines 371-383)
| Variable | Type | Purpose |
|----------|------|---------|
| `terminals` | useState | Array of `{ id, name, status }` |
| `activeTerminalId` | useState | Currently visible terminal ID |
| `nextId` | useState | Auto-increment ID for new terminals |
| `isMobile` | useState | `window.innerWidth < 768` |
| `editingId` | useState | Terminal ID being renamed (null if none) |
| `editName` | useState | Current value in rename input |
| `sidebarWidth` | useState | Sidebar width in px (default 200, range 140-400) |
| `isDraggingSidebar` | useState | True while dragging divider |
| `dividerRef` | useRef | Divider DOM element for drag handling |

---

### Props Chain

```
LLMDevPanel.jsx (line 539-543)
    │
    ├── projectId={project?.id}
    ├── serverId={serverId}
    └── projectSlug={project?.slug}
    │
    ▼
MultiTerminal.jsx (line 370)
    │
    ├── projectId
    ├── serverId
    └── projectSlug
    │
    ▼ (passed to each TerminalInstance, lines 627-635)
TerminalInstance (line 14)
    │
    ├── id              (terminal's unique ID)
    ├── projectId       (from MultiTerminal)
    ├── serverId        (from MultiTerminal)
    ├── projectSlug     (from MultiTerminal)
    ├── isActive        (terminal.id === activeTerminalId)
    └── onStatusChange  (handleStatusChange callback)
```

---

### WebSocket Endpoint

**URL Construction (lines 47-51):**
```javascript
const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
const params = new URLSearchParams()
if (projectId) params.set('projectId', projectId)
if (serverId) params.set('serverId', serverId)
const wsUrl = `${protocol}//${window.location.host}/api/terminal/ws?${params.toString()}`
```

**Resulting URL:**
```
ws://localhost:3001/api/terminal/ws?projectId=123
wss://hubllm.dev/api/terminal/ws?serverId=456
```

**WebSocket Message Types:**

| Direction | Type | Payload |
|-----------|------|---------|
| Client→Server | `init` | `{ type: 'init', cols, rows }` |
| Client→Server | `input` | `{ type: 'input', data: string }` |
| Client→Server | `resize` | `{ type: 'resize', cols, rows }` |
| Server→Client | `connected` | `{ type: 'connected', server, host }` |
| Server→Client | `output` | `{ type: 'output', data: string }` |
| Server→Client | `error` | `{ type: 'error', message }` |
| Server→Client | `disconnected` | `{ type: 'disconnected' }` |

---

### TODO Comments / Incomplete Code

**None found in current code.**

Previous TODOs have been resolved:
- BUG-12 fix comments at lines 162-163, 218
- Note about overflow:hidden removal at line 293

---

### Related Files

| File | Purpose |
|------|---------|
| `frontend/src/components/LLMDevPanel.jsx` | Parent component, renders MultiTerminal in Terminal tab |
| `frontend/src/index.css` | xterm scrollbar styles (lines 791-823) |
| `backend/routes/terminal.js` | WebSocket endpoint `/api/terminal/ws` |

---

## Commands for Testing

```bash
# Check terminal files
cat frontend/src/components/MultiTerminal.jsx | head -100

# Check for xterm dependencies
grep -r "xterm" frontend/package.json

# Watch for CSS issues
# In browser: Inspect → div.xterm-screen → check width
```
