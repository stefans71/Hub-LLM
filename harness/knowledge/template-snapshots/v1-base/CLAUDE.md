# {{projectName}} — Project Rules

## Quick Start

1. Read this file + `harness/feature_queue.json` on every session
2. Pick the top `pending` task from the queue
3. Check `harness/learnings.md` for past debugging notes on the area
4. Check `harness/CODEBASE_INDEX.yaml` for file locations
5. Implement, test, update index, write learnings
6. Set task status to `pending_review`

## Project Info

| Field | Value |
|-------|-------|
| **Name** | {{projectName}} |
| **Stack** | {{techStack}} |
| **Created** | {{createdDate}} |

## Critical Patterns

### Always update the codebase index
After changing any file, update `harness/CODEBASE_INDEX.yaml`:
- Adjust line counts
- Update `purpose` if the file's role changed
- Add new files you created

### Always write learnings
After every task, add a session entry to `harness/learnings.md`:
- What you changed and why
- Key debugging insights
- Patterns discovered

### Task completion
When done with a task:
1. All `completion_checklist` items must be true
2. Write a `completion_note` with specific test evidence
3. Set status to `pending_review` — NEVER `done` or `completed`

### Prevent stale closures
```javascript
setState(prev => ({ ...prev, field: value }))  // good
setState({ ...state, field: value })            // stale
```

### API calls — always add timeout
```javascript
const controller = new AbortController()
const timeout = setTimeout(() => controller.abort(), 5000)
try {
  const res = await fetch(url, { signal: controller.signal })
} finally {
  clearTimeout(timeout)
}
```

## Git Workflow

- The AI engineer commits automatically after each task
- If a GitHub remote is configured, push regularly: `git push origin main`
- Never force push (`git push --force`) — it rewrites history and can lose work
- Work on `main` unless instructed otherwise
- Review commits with `git log --oneline` to see task history
