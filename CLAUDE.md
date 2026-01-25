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

<!-- ADD NEW CRITICAL PATTERNS ABOVE THIS LINE -->

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

## After Cleanup Commit
ALWAYS push:
```bash
git push
```
