# Post-FEAT-57 Audit Plan

**Created**: February 9, 2026
**Context**: After Claude B implements FEAT-53 through FEAT-57, the Director runs this audit before creating a new dogfooding project.

---

## Pre-Audit: Verify All Tasks Completed ✅ DONE (Feb 10)

All original FEAT-53-57 plus follow-up FEAT-59-61 reviewed and completed.

| Task | Status | Review |
|------|--------|--------|
| FEAT-53 | ✅ | All 6 additions to /generate-prp verified |
| FEAT-54 | ✅ | Engineer systemPrompt (286 words) |
| FEAT-55 | ✅ | R2 pass after 3-fix rejection (non-blocking, permissions, glob depth) |
| FEAT-56 | ✅ | 120-line generalized code-researcher agent |
| FEAT-57 | ✅ | 5-phase roadmap |
| FEAT-59 | ✅ | Quick Reference paths in Director CLAUDE.md |
| FEAT-60 | ✅ | Welcome message with brand colors, auto-display on terminal open |
| FEAT-61 | ✅ | Welcome rewritten for humans, responsive (bash script, tput cols), figlet ANSI Shadow logo |

---

## Audit Steps 1-2: Snapshots & Diff ✅ DONE (Feb 10)

- v2 snapshot: 16/16 templates extracted, 180K dir / 42K zip
- Diff: 7 changes — all expected, no surprises
- Full diff saved to `template-snapshots/diff-v1-v2.txt`
- Note: v2 snapshot predates FEAT-59-61 (welcome message, responsive script). A v3 snapshot should be created after live testing.

---

## Audit Step 3: Scaffold a New Test Project

1. Go to Hub-LLM (https://www.hubllm.dev or localhost:5173)
2. Create a new Terminal Track project (name it clearly, e.g., "Harness Test V2")
3. Verify scaffolded files on VPS:

### Engineer side (`/root/llm-hub-projects/{{slug}}/`)

- [ ] `CLAUDE.md` exists with project rules
- [ ] `.claude/settings.json` has BOTH `permissions` AND `systemPrompt`
- [ ] `.claude/commands/generate-prp.md` exists (improved version with review gates)
- [ ] `.claude/commands/execute-prp.md` exists
- [ ] `.claude/commands/audit-index.md` exists
- [ ] `.claude/agents/code-researcher.md` exists with 3 request types
- [ ] `.git/hooks/pre-commit` exists and is executable (`ls -la .git/hooks/pre-commit`)
- [ ] `harness/feature_queue.json` has DOCS-01 seed task
- [ ] `harness/CODEBASE_INDEX.yaml` exists (empty skeleton)
- [ ] `harness/learnings.md` exists
- [ ] `harness/ROADMAP.md` exists with 5 phases
- [ ] `README.md` exists
- [ ] `PRPs/`, `docs/`, `src/` directories exist

### Director side (`/root/llm-hub-projects/{{slug}}-director/`)

- [ ] Directory exists (auto-scaffolded)
- [ ] `CLAUDE.md` exists with Director role, queue format, review workflow
- [ ] `.claude/settings.json` has `systemPrompt` with: task creation gates, review process, index as source of truth, disambiguation rules
- [ ] `.claude/settings.local.json` denies writes to app source code

---

## Audit Step 4: Test PRP Intake Flow (FEAT-53)

In the test project's chat terminal, run `/generate-prp "simple test app"`:

1. [ ] Speech-to-text tip appears before Q1 (with 3 selectable options)
2. [ ] Answer Q1, then type "change answer 1" — re-asks with selectable options
3. [ ] Type "show my answers" — displays summary of all answers
4. [ ] Complete all questions — **review gate starts**: each answer replayed one at a time with Keep/Expand/Change
5. [ ] Select "Expand on this" for one answer — opens free-text, moves to next
6. [ ] After all reviewed — "Ready to generate?" selectable prompt
7. [ ] Select "Yes" — PRP generates
8. [ ] Claude STOPS — shows 3-option gate: Use this PRP / Change a specific answer / Start over
9. [ ] Select "Change a specific answer" — asks which, re-asks it, "change another?" loop
10. [ ] Select "Use this PRP" — queue populates
11. [ ] Claude STOPS again — tells user to run /execute-prp
12. [ ] User Profile in CLAUDE.md reflects final answers + behavioral tracking (revision count, free-text usage)

---

## Audit Step 5: Test Director Setup

Start a Director session:
```bash
cd /root/llm-hub-projects/{{slug}}-director && claude
```

Verify:
- [ ] Director reads CLAUDE.md on startup
- [ ] systemPrompt enforces: task creation gates, review process, no app code writes
- [ ] Director can grep the app's CODEBASE_INDEX.yaml
- [ ] Director can write to app's harness/ files
- [ ] Director CANNOT write to app's src/ or equivalent

---

## Audit Step 6: Test Code-Researcher Agent

From the Engineer session:
```bash
cd /root/llm-hub-projects/{{slug}} && claude
```

After FEAT-01 creates some files, test:
- [ ] "Use the code-researcher agent to scan src/ and write entries to the index"
- [ ] Agent spawns, reads files, writes YAML entries to CODEBASE_INDEX.yaml
- [ ] Index entries have: line count, purpose, exports, imports, last_verified_session

---

## Audit Step 7: Test Pre-Commit Hook

After Engineer makes code changes:
- [ ] `git add src/somefile.js && git commit -m "test"` — should FAIL (index not updated)
- [ ] Update CODEBASE_INDEX.yaml, `git add harness/CODEBASE_INDEX.yaml`
- [ ] `git commit -m "test"` — should SUCCEED

---

## Audit Step 8: Update Harness Template Design Doc ✅ DONE (Feb 10)

- [x] harness-template-design.md manifest updated — FEAT-36, 53-57 marked ✅ Shipped
- [x] File tree updated with .claude/agents/, harness/ROADMAP.md, {{slug}}-director/
- [x] dogfooding-log.md Session 4 added with review results + snapshot info
- [x] Gaps found: project delete doesn't clean VPS dirs (FEAT-58), welcome message needed human rewrite (FEAT-61)

---

## Post-Audit: Decision Point

If audit passes cleanly:
1. Delete the old FishStocker project (fist-stocker-app + fist-stocker-director)
2. Create the REAL FishStocker project with correct name through Hub-LLM
3. Resume dogfooding from the improved template
4. Begin working on Phase 3 automation features (Ralph Loop)

If audit finds issues:
1. File new BUG/FEAT tasks in Hub-LLM queue
2. Have Claude B fix them
3. Re-run the relevant audit steps
4. Create v2.1 snapshot if template constants changed

---

## Files Referenced in This Plan

| File | Purpose |
|------|---------|
| `/root/dev/Hub-LLM/harness/feature_queue.json` | Queue with FEAT-53-57 |
| `/root/dev/Hub-LLM/backend/routers/projects.py` | Template constants (source of truth) |
| `/root/dev/Hub-LLM/harness/knowledge/template-snapshots/` | Snapshot directory + create script |
| `/root/dev/Hub-LLM/harness/knowledge/harness-template-design.md` | Template manifest |
| `/root/dev/Hub-LLM/harness/knowledge/dogfooding-log.md` | Observation log |
| `/root/dev/Claude-Project_Director/.claude/settings.json` | Director systemPrompt (Hub-LLM side) |
| `/root/dev/Claude-Project_Director/CLAUDE.md` | Director reference material (Hub-LLM side) |
