# LLM-HUB Project Rules

## First
Read `.claude/skills/hubllm/SKILL.md` for full project context.
Read `harness/TERMINAL_WORKSPACE.md` if working on Terminal features.

## Debugging Priority Order (READ THIS)

When something "doesn't work", check in THIS ORDER:

1. **Console errors FIRST** - `agent-browser console` BEFORE any screenshots
2. **If API/backend error found** → Fix backend code, restart server, commit. **SKIP browser testing.**
3. **If frontend-only issue** → Then use screenshots/clicks to debug UI

**Don't burn tokens on browser automation when the bug is in Python/backend.**

Example: "Editor not loading file" 
- ❌ Wrong: Screenshot → click → screenshot → click → eventually check console
- ✅ Right: `agent-browser console` → see "Failed to read file: 'str' has no decode" → fix backend → commit

## Skip Login / Auth Bypass (MANDATORY)

Auth is verified separately. If login page appears:
- **DO NOT** attempt to authenticate
- **DO NOT** try to work around login
- **DO** note: "view requires authentication - verified separately"
- **DO** continue to commit your code

Use localStorage injection if needed for testing.

## Task Sizing
- XS/S = can do multiple
- M/L = ONE only, stop after

## Critical Patterns (Claude: ADD NEW PATTERNS HERE)

### API Calls - Always add timeout
```javascript
const controller = new AbortController()
const timeout = setTimeout(() => controller.abort(), 5000)
try {
  const res = await fetch(url, { signal: controller.signal })
} finally {
  clearTimeout(timeout)
}
```

### Prevent Infinite Refresh Loops
```javascript
const fetchData = async (isRetry = false) => {
  // if 401 and !isRetry → refresh token, then fetchData(true)
  // if 401 and isRetry → give up (no infinite loop)
}
```

### Prevent State Updates After Unmount
```javascript
const isMounted = useRef(true)
useEffect(() => () => { isMounted.current = false }, [])
// In async: if (isMounted.current) setState(...)
```

### Avoid Stale Closures in useEffect Callbacks
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
        if (!exists) return [...prev, item]
        return prev.map(...)
      })
    }
  })
}, [onEditorReady])
```

### Memoize Callbacks Passed to Child useEffects
```javascript
// Parent - stable reference prevents child useEffect re-runs
const handleReady = useCallback((api) => {
  apiRef.current = api
}, [])
```

### Drag Handles - Use Native Events
```javascript
useEffect(() => {
  const handle = dragHandleRef.current
  handle.addEventListener('mousedown', onMouseDown)
  return () => handle.removeEventListener('mousedown', onMouseDown)
}, [])
```

### xterm.js fitAddon Timing
```javascript
// Call fit() AFTER container is visible
requestAnimationFrame(() => {
  fitAddon.fit()
  // Secondary delayed fit for edge cases
  setTimeout(() => fitAddon.fit(), 100)
})
```

### SFTP Read - Use Binary Mode
```python
# BAD: "r" returns string, .decode() fails
async with sftp.open(path, "r") as f:
    content = await f.read()
    return content.decode("utf-8")  # Error!

# GOOD: "rb" returns bytes
async with sftp.open(path, "rb") as f:
    content = await f.read()
    return content.decode("utf-8")  # Works
```

### localStorage is Source of Truth for VPS
- Frontend localStorage = persistent
- Backend servers_db = in-memory (lost on restart)
- Check localStorage FIRST, then sync to backend

### CSS Visibility Toggle for Stateful Components (Don't Conditional Render)
```jsx
// BAD: Conditional render unmounts component, kills WebSockets/state
{isExpanded && <ComponentWithWebSocket />}

// GOOD: CSS hiding keeps component mounted
<div style={{ display: isExpanded ? 'flex' : 'none' }}>
  <ComponentWithWebSocket />
</div>
```

### Flex Container Constraints for xterm.js
```jsx
// Flex children containing xterm.js or scrollable content need these:
<div style={{ flex: 1, minWidth: 0, minHeight: 0, overflow: 'hidden' }}>
  {/* Without minWidth:0/minHeight:0, fitAddon calculates wildly wrong dimensions */}
```

### Sync Derived State from Props with useEffect
```javascript
const [linkedServerId, setLinkedServerId] = useState(project?.vps_server_id || null)

// CRITICAL: useState(initialValue) only sets on first mount.
// Without this, state goes stale on refresh/project switch.
useEffect(() => {
  setLinkedServerId(project?.vps_server_id || null)
}, [project?.id, project?.vps_server_id])
```

### Initialize Async-Dependent State to null, Gate Renders
```javascript
// BAD: Default matches valid state → premature decisions before async resolves
const [setupComplete, setSetupComplete] = useState(true)

// GOOD: null = "unknown", gate renders until resolved
const [setupComplete, setSetupComplete] = useState(null)
if (setupComplete === null) return <LoadingSpinner />
```

### URL State Persistence for Page Refresh
```javascript
// Read on load
const urlProjectId = searchParams.get('projectId')
// Write on navigate
navigate(`/workspace?projectId=${project.id}`)
// Any state that should survive F5 belongs in URL or localStorage
```

### Delta-Based Drag Resize (Not Absolute Position)
```javascript
// On mousedown: capture start state
const handleMouseDown = (e) => { startX = e.clientX; startWidth = currentWidth }
// On mousemove: delta from start (resilient to stale closures)
const handleMouseMove = (e) => {
  const newSize = Math.max(MIN, Math.min(MAX, startWidth + (e.clientX - startX)))
  setSize(newSize)
}
```

### overflow:visible for Dropdown Parents
```css
/* Parent containers with dropdown children must NOT clip them */
.parent { overflow: visible; } /* NOT overflow: hidden */
/* Or use a portal to render outside the clipping context */
```

<!-- ADD NEW CRITICAL PATTERNS ABOVE THIS LINE -->

## Documentation Rule - Document Patterns DURING Implementation

When completing a feature that adds new interaction patterns:

1. **Universal patterns** → Add to CLAUDE.md "Critical Patterns" section
   - Examples: fetch timeout, stale closures, isMounted ref
   - Pattern applies across multiple areas

2. **Area-specific patterns** → Add to relevant workspace doc
   - Terminal patterns → `harness/TERMINAL_WORKSPACE.md`
   - Editor patterns → `harness/EDITOR_WORKSPACE.md` (create if needed)
   - Chat patterns → `harness/CHAT_WORKSPACE.md` (create if needed)

3. **Required for patterns:**
   - Working code snippet (copy from implementation)
   - Why this approach (1-2 sentences)
   - Any gotchas discovered

**Do this DURING feature implementation, not after bugs.**

## Before EVERY Commit
1. If you discovered a CRITICAL pattern → Add it to "Critical Patterns" section above
2. Write session notes to `harness/learnings.md`:
```markdown
### Session [N] - $(TZ='America/New_York' date '+%Y-%m-%d %H:%M %Z')
**Task**: [ID] 
**What**: [brief summary]
```

## After EVERY Commit
Cleanup: `git add -A && git commit -m "chore: cleanup" || true`

## Files
- `harness/feature_queue.json` - tasks
- `harness/learnings.md` - session notes
- `harness/TERMINAL_WORKSPACE.md` - terminal code map (read for terminal tasks)

## Testing (REQUIRED for UI/bug tasks)

**For backend-only bugs:** Skip browser testing. Fix code, restart server, commit.

**For frontend/UI bugs:** After code changes, verify with agent-browser:
```bash
agent-browser console                    # CHECK THIS FIRST for errors
agent-browser open http://localhost:5173/[page]
agent-browser screenshot verify.png
```

**If login appears:** Note "auth verified separately", continue to commit.

Do NOT mark task complete without testing (unless backend-only fix).

## Test Evidence in completion_note (MANDATORY)

Every `completion_note` MUST include concrete test evidence — not just a summary of what you changed. Examples:
- Backend fix: paste the curl response or log output showing it works
- DB change: paste `sqlite3 ... '.tables'` or query output
- Frontend fix: note the screenshot filename or console output confirming no errors
- If the task's `test` field specifies output to paste, you MUST include it

**BAD**: "Fixed race condition, changed init to null"
**GOOD**: "Fixed race condition. Verified: sqlite3 .tables shows 5 tables, curl /api/auth/signup returns 201, no console errors in agent-browser"

## After Cleanup Commit
ALWAYS push:
```bash
git push
```
