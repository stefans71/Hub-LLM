# LLM-HUB Project Rules

## First
Read `.claude/skills/hubllm/SKILL.md` for full project context.

## Skip Login
Auth is verified. Skip any login screens. Use localStorage injection if needed.

## Task Sizing
- XS/S = can do multiple
- M/L = ONE only, stop after

## Before EVERY Commit
Get timestamp: `TZ='America/New_York' date '+%Y-%m-%d %H:%M %Z'`

Then append to `harness/learnings.md`:
```markdown
### Session [N] - [TIMESTAMP FROM ABOVE]
**Task**: [ID]
**Root Cause**: [what was broken]
**Fix**: [what you changed]
**Files**: [list]
```

## After EVERY Commit
Do a cleanup commit:
```bash
# Remove your test data
# Remove your console.logs  
# Remove commented code you added
git add -A && git commit -m "chore: cleanup" || true
```

## Files to Read
- `harness/feature_queue.json` - your tasks
- `harness/learnings.md` - patterns that work (UPDATE THIS)
- `harness/TECH_DEBT.md` - don't make it worse
