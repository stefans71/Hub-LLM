# SESSION_START.md - Read This At The Start of Every Session

## Quick Start Checklist

```
□ 1. Read claude-progress.txt (see what was done last)
□ 2. Read feature_list.json (find next failing feature)
□ 3. Run ./init.sh (start dev environment)
□ 4. Pick ONE feature to implement
□ 5. Implement and test
□ 6. Update feature_list.json (set passes: true)
□ 7. Update claude-progress.txt (log what you did)
□ 8. Commit changes
```

---

## Step 1: Check Progress

```bash
cat claude-progress.txt
```

Look for:
- What was completed in the last session
- Any known issues or blockers
- What was suggested as "next priority"

---

## Step 2: Find Next Feature

```bash
# List failing features
cat feature_list.json | grep -B5 '"passes": false' | grep '"id"'

# Or view full feature details
cat feature_list.json | jq '.features[] | select(.passes == false) | {id, category, description}'
```

**Priority order by category:**
1. `project-creation` - Create Project flow (most important)
2. `github-integration` - GitHub OAuth in flow
3. `dashboard` - Dashboard view
4. `settings` - Settings pages
5. `agents` / `mcp-servers` - Agent and MCP management

---

## Step 3: Start Environment

```bash
./init.sh
```

Wait for:
```
✓ PostgreSQL started
✓ Backend started
✓ Frontend started
Frontend:  http://localhost:5173
Backend:   http://localhost:8000
```

---

## Step 4: Implement ONE Feature

Example workflow for `create-001` (Create Project page):

1. **Understand the feature:**
   ```bash
   cat feature_list.json | jq '.features[] | select(.id == "create-001")'
   ```

2. **Check existing code:**
   ```bash
   ls frontend/src/components/
   ls frontend/src/pages/
   ```

3. **Reference the mockup:**
   - HTML mockup is in project files or previous chat context
   - CSS variables are defined in `:root`

4. **Implement:**
   - Create new React component
   - Add route if needed
   - Connect to backend API

5. **Test with agent-browser:**
   ```bash
   agent-browser open http://localhost:5173/create-project
   agent-browser snapshot -i
   agent-browser screenshot create-project-test.png
   ```

---

## Step 5: Update feature_list.json

After testing passes:

```bash
# Edit feature_list.json
# Change: "passes": false
# To:     "passes": true
```

**IMPORTANT:** Only mark `passes: true` if you've actually tested it!

---

## Step 6: Update claude-progress.txt

Add a new session entry:

```markdown
### Session [N] - [DATE]
**Focus**: [Feature ID and name]
**Completed**:
- [What you implemented]
- [Files created/modified]

**Tested**:
- [How you verified it works]

**Issues**:
- [Any problems encountered]

**Next**:
- [Suggested next feature]
```

---

## Step 7: Commit Changes

```bash
git add -A
git status  # Review changes
git commit -m "feat(feature-id): brief description"
git push
```

Commit message format:
- `feat(create-001): implement Create Project page`
- `fix(auth-003): fix GitHub OAuth callback`
- `chore: update progress files`

---

## Quick Reference

### Useful Commands

```bash
# Start environment
./init.sh

# View logs
tail -f backend.log
tail -f frontend.log

# Test in browser
agent-browser open http://localhost:5173
agent-browser snapshot -i
agent-browser click @e1
agent-browser fill @e2 "text"
agent-browser screenshot test.png

# Stop everything
pkill -f uvicorn
pkill -f vite
docker compose stop
```

### File Locations

```
Backend API:     backend/routers/
Backend Logic:   backend/services/
React Pages:     frontend/src/pages/
React Components: frontend/src/components/
Contexts:        frontend/src/contexts/
```

### API Testing

```bash
# Health check
curl http://localhost:8000/health

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Authenticated request
curl http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Don't Forget!

1. ✅ Work on ONE feature per session
2. ✅ Test before marking complete
3. ✅ Update both progress files
4. ✅ Commit with clear message
5. ✅ Leave code in working state

---

## If You're Stuck

1. Read `.claude/skills/hubllm/SKILL.md` for patterns
2. Check `AGENTS.md` for project overview
3. Look at existing components for examples
4. Run `agent-browser snapshot -i` to see current UI state
