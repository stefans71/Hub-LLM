# SESSION_START.md - Read This At The Start of Every Session

## Quick Start Checklist

```
□ 1. Read claude-progress.txt (see what was done last)
□ 2. Read feature_list.json (find next failing feature)
□ 3. Read docs/HUBLLM_COMPONENT_MAPPING.md (understand structure)
□ 4. Run ./init.sh (start dev environment)
□ 5. Pick ONE feature to implement
□ 6. Reference docs/hubllm-mockup-v2.html for UI styling
□ 7. Implement and test
□ 8. Update feature_list.json (set passes: true)
□ 9. Update claude-progress.txt (log what you did)
□ 10. Commit changes
```

---

## CRITICAL: Reference Documents

**Before writing ANY UI code, read these:**

| Document | Location | What It Contains |
|----------|----------|------------------|
| **UI Mockup** | `docs/hubllm-mockup-v2.html` | Complete HTML/CSS for all views |
| **Component Map** | `docs/HUBLLM_COMPONENT_MAPPING.md` | HTML ID → React component → API |
| **Strategy** | `docs/HUBLLM_DEVELOPMENT_STRATEGY.md` | Architecture, database schemas |

### CSS Variables (USE THESE)

```css
:root {
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
}
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
```

**Priority order:**
1. `create-*` - Create Project flow (most important)
2. `github-*` - GitHub OAuth integration
3. `dash-*` - Dashboard view
4. `settings-*` - Settings pages

---

## Step 3: Read Component Mapping

```bash
cat docs/HUBLLM_COMPONENT_MAPPING.md
```

This shows exactly:
- Which HTML element maps to which React component
- Which API endpoints are needed
- What props each component needs

---

## Step 4: Start Environment

```bash
./init.sh
```

---

## Step 5: Implement ONE Feature

### Example: Building `create-001` (Create Project page)

1. **Check the mapping:**
   ```bash
   grep -A20 "CREATE PROJECT VIEW" docs/HUBLLM_COMPONENT_MAPPING.md
   ```

2. **Look at mockup HTML:**
   ```bash
   grep -A50 'id="view-create-project"' docs/hubllm-mockup-v2.html
   ```

3. **Create React component matching the mockup styling**

4. **Test with agent-browser:**
   ```bash
   agent-browser open http://localhost:5173/create-project
   agent-browser snapshot -i
   agent-browser screenshot test.png
   ```

---

## Step 6: Update Progress Files

### feature_list.json
Change `"passes": false` to `"passes": true` for completed feature

### claude-progress.txt
Add session entry:
```markdown
### Session [N] - [DATE]
**Focus**: [Feature ID]
**Completed**: [What you built]
**Files**: [Files created/modified]
**Next**: [Suggested next feature]
```

---

## Step 7: Commit

```bash
git add -A
git commit -m "feat(feature-id): description"
git push
```

---

## Views in the Mockup

| View | HTML ID | Purpose |
|------|---------|---------|
| Dashboard | `view-dashboard` | Project list, stats |
| Settings | `view-settings` | User settings (10 sections) |
| Create Project | `view-create-project` | 5-step project wizard |
| Workspace | `view-workspace` | Terminal, editor, chat |

---

## Create Project Steps (from mockup)

| Step | HTML Section | Key Elements |
|------|--------------|--------------|
| 1. Project Details | line ~3696 | `project-brief`, `ai-brief-chat` |
| 2. Connection Source | line ~3879 | `github-card`, `vps-card` |
| 3. Project Context | line ~4052 | `ctx-tech-stack`, `ctx-standards` |
| 4. Project Agents | line ~4111 | `global-agents-list` |
| 5. MCP Servers | line ~4229 | `global-mcp-list` |

---

## Don't Forget!

1. ✅ Reference the mockup for ALL styling
2. ✅ Use CSS variables, not hardcoded colors
3. ✅ Check component mapping before creating files
4. ✅ Work on ONE feature per session
5. ✅ Test with agent-browser before marking complete
6. ✅ Update both progress files
7. ✅ Commit with clear message
