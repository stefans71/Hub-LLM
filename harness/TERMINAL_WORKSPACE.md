# Terminal Workspace Architecture
**Version 2.0 | Updated: January 25, 2026**

This document describes the Terminal tab implementation in the LLM-Dev panel. Read this before working on terminal-related tasks.

---

## Current Architecture (v4.7 - FEAT-09 Complete)

### File Structure
```
frontend/src/components/
├── LLMDevPanel.jsx      # Parent container with tabs (Terminal, Editor, Docker, Logs, Context)
├── MultiTerminal.jsx    # Terminal tab implementation (~980 lines) - FEAT-09 split panes
└── WorkspaceTerminal.jsx # (Legacy - now TerminalInstance is embedded in MultiTerminal)
```

### Layout Structure (Current - v4.7 Split Panes)
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ [● bash][● bash 2][+]  | Editor | Docker | Logs | Project Context               │
├────────────────────────────────────────────────────────────────────────┬────────┤
│ ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔│ TERMS  │
│ █ color bar          ║ █ color bar          ║                        │   +    │
│ ┌──────────────────┐ ║ ┌──────────────────┐ ║   (empty space)        │ ● bash │
│ │ ● Digital Ocean  │ ║ │ ● Connecting...  │ ║                        │ ● bash2│
│ │ root@droplet:~#  │ ║ │                  │ ║                        │        │
│ │ > ls -la         │ ║ │                  │ ║                        │        │
│ │ drwxr-xr-x ...   │ ║ │                  │ ║                        │        │
│ └──────────────────┘ ║ └──────────────────┘ ║                        │        │
│      (300px)        drag     (300px)       drag    (remaining)       │ (120px)│
└────────────────────────────────────────────────────────────────────────┴────────┘

Legend:
- [● bash] = Tab header with colored dot
- ║ = Draggable divider between panes
- █ = Color indicator bar (3px, matches terminal color)
- TERMS = Narrow sidebar with terminal list
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

## Current Features (Working - v4.7)

### Split Pane Terminals (FEAT-09)
- Multiple terminals visible **side-by-side** (max 4)
- Each pane has its own width (default 300px, range 150-600px)
- Draggable dividers between each pane
- Empty space fills remaining width on right
- Tab header shows all terminals: `[● bash][● bash 2][+]`

### Color Coding
- 8 colors available: Gray, Red, Orange, Yellow, Green, Cyan, Blue, Purple
- Right-click terminal (in tab header OR sidebar) → color picker popup
- Color shows on:
  - Tab header dot
  - Sidebar dot
  - Color bar at top of each pane (3px)
- Connected terminals get glow effect on dots

### Multi-Terminal Support
- Click `+` to add new terminal (in tab header or sidebar)
- Click `✕` to close terminal
- Click terminal name to focus that pane
- Double-click to rename
- Each terminal = independent SSH session

### Terminal Status Dots
- 🟢 Green = connected (with glow if colored)
- 🟡 Yellow = connecting
- ⚪ Gray = disconnected

### Draggable Pane Dividers
- Drag left/right to resize individual terminal panes
- Range: 150px (min) to 600px (max) per pane
- Blue highlight on hover/drag
- Each pane has its own divider

### Narrow Sidebar (TERMS)
- Fixed width: 120px
- Contains: + button, terminal list with colored dots
- Right-click for color picker

### xterm.js Integration
- fitAddon for responsive sizing
- Auto-scroll to bottom on new output
- Connects via WebSocket to backend SSH

---

## Known Issues (v4.7)

### BUG-15: Terminal Connection Drops on Panel Toggle (RESOLVED)
- **Symptom:** When you collapse and re-open LLM-Dev panel, terminal connections drop and restart
- **Expected:** Connections should persist through panel toggle
- **Root cause:** LLMDevPanel used `{isExpanded && (...)}` conditional rendering, unmounting MultiTerminal
- **Fix:** Changed to `display: isExpanded ? 'flex' : 'none'` to keep components mounted but hidden
- **Status:** RESOLVED (2026-01-25)

### BUG-16: Terminal Pane Can't Resize Smaller
- **Symptom:** Dragging divider to make terminal larger works, but dragging to make it smaller doesn't work (hits minimum too early?)
- **Expected:** Should be able to resize panes in both directions within min/max bounds
- **Likely cause:** Check min-width constraints and drag calculation in `handleDividerMouseMove`
- **Status:** Open

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

## FEAT-09: Multi-Terminal Split Panes (COMPLETED)

**Completed:** January 25, 2026

### Implementation Summary
- Side-by-side terminal panes (max 4)
- Each pane has configurable width (150-600px) with draggable dividers
- 8-color picker via right-click context menu
- Color indicator bar at top of each pane
- Tab header shows all terminals with colored dots
- Narrow sidebar (120px) with terminal list

### Key Changes Made
1. **Terminal State** - Added `color` and `width` to each terminal object
2. **Layout** - Changed from single terminal to flex container with multiple panes
3. **Dividers** - Added draggable dividers between each terminal pane
4. **Color Picker** - Added right-click context menu with 8 color options
5. **Tab Header** - Added row above terminal panes showing all terminals with colors
6. **Sidebar** - Narrowed to 120px with compact terminal list

---

## Bug Fixes Done

### v4.7 Session (FEAT-09)
| Bug/Feature | Issue | Fix |
|-------------|-------|-----|
| FEAT-09 | Single terminal with tabs | Implemented split panes with color coding |
| - | Vite proxy wrong port | Changed from 8000 to 3001 in vite.config.js |

### v4.6 Session
| Bug | Issue | Fix |
|-----|-------|-----|
| BUG-12 | xterm-screen width: 350554px | Proper container sizing, fitAddon timing |
| BUG-13 | TERMINALS sidebar not visible | Fixed flex layout, sidebar now renders |
| - | Sidebar default too wide | Changed to 200px default |
| - | Drag range too limited | Extended to 140px-400px |

---

## Testing Checklist

When working on terminal features, verify:

### Basic Terminal
- [ ] Terminal connects to VPS (green dot with glow)
- [ ] Text fills width appropriately (not bunched left)
- [ ] Mouse wheel scroll works

### Split Panes (FEAT-09)
- [ ] + button adds new terminal pane to the right
- [ ] New terminals get cycling colors
- [ ] All panes visible simultaneously
- [ ] Maximum 4 terminals enforced
- [ ] ✕ button closes terminal pane

### Color Coding
- [ ] Right-click terminal → color picker appears
- [ ] Selecting color updates: tab dot, sidebar dot, color bar
- [ ] Color picker closes on outside click

### Divider Drag
- [ ] Dragging divider resizes adjacent panes
- [ ] Width stays within 150-600px bounds
- [ ] Blue highlight on hover

### Sidebar
- [ ] Sidebar shows all terminals with colored dots
- [ ] Click terminal in sidebar → focuses that pane
- [ ] Double-click to rename works

### Responsive
- [ ] Mobile (<768px) shows horizontal tabs
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

### File: `frontend/src/components/MultiTerminal.jsx` (~980 lines)

#### Key Constants (FEAT-09)

```javascript
// Available terminal colors (line 16-25)
const TERMINAL_COLORS = [
  { name: 'Gray', value: 'var(--text-muted)' },
  { name: 'Red', value: '#f7768e' },
  { name: 'Orange', value: '#ff9e64' },
  { name: 'Yellow', value: '#e0af68' },
  { name: 'Green', value: '#9ece6a' },
  { name: 'Cyan', value: '#7dcfff' },
  { name: 'Blue', value: '#7aa2f7' },
  { name: 'Purple', value: '#bb9af7' },
]
```

#### Key Functions

| Function | Description |
|----------|-------------|
| `TerminalInstance` | Inner component - individual terminal with xterm.js |
| `connect()` | WebSocket connection to backend SSH proxy |
| `loadXterm()` | Async xterm.js initialization with dynamic import |
| `doFit()` | Safe fitAddon.fit() with dimension validation |
| `handleResize()` | ResizeObserver callback, refits terminal + sends resize to WS |
| `MultiTerminal` | Main exported component with terminal management |
| `createTerminal()` | Adds new terminal with color cycling |
| `closeTerminal()` | Removes terminal, switches active if needed |
| `setTerminalColor()` | Updates terminal color from picker |
| `handleTerminalContextMenu()` | Opens color picker at mouse position |
| `handleDividerMouseDown/Move/Up` | Split pane resize handlers |

#### FEAT-09 Pattern: Split Pane Divider Drag

```javascript
// Track which divider is being dragged (not a single sidebar divider)
const [draggingDividerId, setDraggingDividerId] = useState(null)

const handleDividerMouseMove = useCallback((e) => {
  if (!draggingDividerId || !containerRef.current) return

  const containerRect = containerRef.current.getBoundingClientRect()
  const terminalIndex = terminals.findIndex(t => t.id === draggingDividerId)
  if (terminalIndex === -1) return

  // Calculate cumulative width of terminals before this one
  let prevWidth = 0
  for (let i = 0; i < terminalIndex; i++) {
    prevWidth += terminals[i].width + 4 // +4 for divider width
  }

  // New width = mouse position - previous terminals - container left
  const newWidth = e.clientX - containerRect.left - prevWidth
  const clampedWidth = Math.max(150, Math.min(600, newWidth))

  // Update only the terminal being dragged
  setTerminals(prev => prev.map(t =>
    t.id === draggingDividerId ? { ...t, width: clampedWidth } : t
  ))
}, [draggingDividerId, terminals])
```

#### FEAT-09 Pattern: Context Menu Color Picker

```javascript
// State for color picker popup
const [colorPickerTerminalId, setColorPickerTerminalId] = useState(null)
const [colorPickerPosition, setColorPickerPosition] = useState({ x: 0, y: 0 })

// Right-click opens color picker at mouse position
const handleTerminalContextMenu = (e, terminalId) => {
  e.preventDefault()
  setColorPickerPosition({ x: e.clientX, y: e.clientY })
  setColorPickerTerminalId(terminalId)
}

// Click outside closes picker
useEffect(() => {
  const handleClickOutside = () => {
    if (colorPickerTerminalId !== null) {
      setColorPickerTerminalId(null)
    }
  }
  document.addEventListener('click', handleClickOutside)
  return () => document.removeEventListener('click', handleClickOutside)
}, [colorPickerTerminalId])

// Render color picker as fixed-position popup
{colorPickerTerminalId !== null && (
  <div
    onClick={(e) => e.stopPropagation()}
    style={{
      position: 'fixed',
      left: colorPickerPosition.x,
      top: colorPickerPosition.y,
      zIndex: 1000
    }}
  >
    {TERMINAL_COLORS.map(color => (
      <button onClick={() => setTerminalColor(colorPickerTerminalId, color.value)} />
    ))}
  </div>
)}
```

#### fitAddon Initialization & fit() Calls

```
fitAddon created and loaded after xterm Terminal init
fitAddon.fit() in doFit() helper with dimension validation
requestAnimationFrame + setTimeout(doFit, 100) for initial fit
fitAddon.fit() in handleResize() (ResizeObserver)
setTimeout(handleResize, 50) when becoming active
```

---

### State Variables

#### TerminalInstance
| Variable | Type | Purpose |
|----------|------|---------|
| `terminalRef` | useRef | DOM element for xterm to attach to |
| `xtermRef` | useRef | xterm Terminal instance |
| `wsRef` | useRef | WebSocket connection |
| `fitAddonRef` | useRef | FitAddon instance |
| `status` | useState | 'disconnected' \| 'connecting' \| 'connected' \| 'error' |
| `serverInfo` | useState | `{ server, host }` after connection |
| `error` | useState | Error message string |

#### MultiTerminal (FEAT-09 Updated)
| Variable | Type | Purpose |
|----------|------|---------|
| `terminals` | useState | Array of `{ id, name, status, color, width }` |
| `activeTerminalId` | useState | Currently focused terminal ID |
| `nextId` | useState | Auto-increment ID for new terminals |
| `isMobile` | useState | `window.innerWidth < 768` |
| `editingId` | useState | Terminal ID being renamed (null if none) |
| `editName` | useState | Current value in rename input |
| `colorPickerTerminalId` | useState | Terminal ID for open color picker (null if closed) |
| `colorPickerPosition` | useState | `{ x, y }` position of color picker popup |
| `draggingDividerId` | useState | Terminal ID whose divider is being dragged |
| `containerRef` | useRef | Container DOM element for calculating widths |

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
