# LLM-HUB Project Rules

## First
Read `.claude/skills/hubllm/SKILL.md` for full project context.

## Skip Login
Auth is verified. Skip any login screens. Use localStorage injection if needed.

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

### Drag Handles - Use Native Events
```javascript
useEffect(() => {
  const handle = dragHandleRef.current
  handle.addEventListener('mousedown', onMouseDown)
  return () => handle.removeEventListener('mousedown', onMouseDown)
}, [])
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

## Testing (REQUIRED for UI/bug tasks)
After code changes, verify with agent-browser:
```bash
agent-browser open http://localhost:5173/[page]
agent-browser screenshot verify.png
```
Do NOT mark task complete without testing.

## After Cleanup Commit
ALWAYS push:
```bash
git push
```
