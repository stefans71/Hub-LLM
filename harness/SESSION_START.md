# SESSION START - HubLLM Harness V2

## Quick Check (30 seconds)

```bash
# 1. What was done last?
cat harness/progress/current.txt | tail -30

# 2. What's next?
cat harness/feature_queue.json

# 3. Start environment
./init.sh
```

---

## Rules

1. **Task Sizing** - Check the size before starting:
   - **XS/S tasks**: Multiple allowed per session
   - **M/L tasks**: ONE only per session

2. **Visual Verification** - REQUIRED before marking complete:
   ```bash
   agent-browser screenshot current.png
   # Compare to mockup - must match before marking pass
   ```

3. **Reference the mappings** - Every element has an ID:
   ```bash
   cat harness/mappings/workspace_modals.md | head -100
   ```

---

## Task Sizes

| Size | Elements | Time | Session Rule |
|------|----------|------|--------------|
| XS | 1-3 | 5-10 min | Multiple OK |
| S | 4-10 | 15-30 min | Multiple OK |
| M | 11-30 | 1-2 hrs | **ONE only** |
| L | 31-50 | 2-4 hrs | **ONE only** |

---

## File References

| Need | File |
|------|------|
| What's next? | `harness/feature_queue.json` |
| Element specs | `harness/mappings/*.md` |
| Overall status | `harness/MASTER_INDEX.md` |
| UI reference | `docs/hubllm-mockup-v2.html` |
| Last session | `harness/progress/current.txt` |

---

## CSS Variables (USE THESE)

```css
--bg-primary: #0f1419;
--bg-secondary: #1a2028;
--bg-tertiary: #242b35;
--border: #2d3748;
--primary: #3b82f6;
--primary-hover: #2563eb;
--accent: #f97316;
--success: #22c55e;
--error: #ef4444;
--text-primary: #ffffff;
--text-secondary: #9ca3af;
--text-muted: #6b7280;
```

---

## Workflow

### 1. Pick Task from Queue
```bash
cat harness/feature_queue.json
# Pick the top incomplete task
```

### 2. Read the Mapping
```bash
# Example: Working on W-03 (Workspace Top Bar)
grep -A50 "W-03" harness/mappings/workspace_modals.md
```

### 3. Implement
- Reference `docs/hubllm-mockup-v2.html` for exact styling
- Use CSS variables, not hardcoded colors
- Match the mockup EXACTLY

### 4. Verify with Screenshot
```bash
agent-browser open http://localhost:5173/workspace
agent-browser screenshot workspace-topbar.png
# Compare to mockup - fix any differences
```

### 5. Update Files
```bash
# Update feature_queue.json - mark task complete
# Add session entry to harness/progress/current.txt
```

### 6. Commit
```bash
git add -A
git commit -m "feat(W-03): add workspace top bar with project info and model selector"
git push
```

---

## Session Entry Format

Add to `harness/progress/current.txt`:

```markdown
### Session XX - YYYY-MM-DD
**Task**: W-03 (Workspace Top Bar) - Size M
**Status**: ✅ Complete
**Files Modified**:
- frontend/src/components/WorkspaceTopBar.jsx (created)
- frontend/src/components/Workspace.jsx (modified)
**Verified**: Screenshot matches mockup
**Notes**: [Any issues or observations]
```

---

## Progress File Maintenance

If `harness/progress/current.txt` exceeds 10 sessions:
```bash
# Move oldest sessions to archive
head -n 100 harness/progress/current.txt >> harness/progress/archive/sessions_$(date +%Y%m%d).txt
tail -n +101 harness/progress/current.txt > temp.txt && mv temp.txt harness/progress/current.txt
```

---

## Don't Forget

- ✅ Check task size BEFORE starting
- ✅ Read mapping file for element specs
- ✅ Screenshot and verify BEFORE marking complete
- ✅ ONE M/L task per session max
- ✅ Update both queue and progress files
- ✅ Commit with task ID in message

---

## Visual Verification - Auth Bypass

Authentication is ALREADY VERIFIED. When taking screenshots:

1. **Login page appears?** → Note "requires auth" and skip
2. **DO NOT** create accounts or login during verification
3. **DO NOT** spend tokens on auth flows

Just verify YOUR component renders. Auth works.

---

## Visual Verification - Auth Bypass

Authentication is ALREADY VERIFIED. When taking screenshots:

1. **Login page appears?** → Note "requires auth" and skip
2. **DO NOT** create accounts or login during verification  
3. **DO NOT** spend tokens on auth flows

Just verify YOUR component renders. Auth works.
