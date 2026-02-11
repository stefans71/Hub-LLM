# Dogfooding Log — Harness Template

Tracking real-world usage of the harness template scaffolding through TheFishStocker.com.

---

## Session 1 — February 8, 2026

### What We Did
1. Created "Fist Stocker App" project via HubLLM CreateProject (Terminal Track)
2. Harness template scaffolded to `/root/llm-hub-projects/fist-stocker-app/`
3. Set up Director directory manually at `/root/llm-hub-projects/fist-stocker-director/`
4. Started `/generate-prp` intake in the chat terminal — got through all 4 calibration questions
5. Hit 5 blocking bugs, all fixed and merged to main

### Bugs Found During Dogfooding
| Bug | Issue | Root Cause | Status |
|-----|-------|-----------|--------|
| BUG-47 | FK violation on project creation | VPS exists in localStorage but not in Postgres. Frontend needed to sync VPS before INSERT. | Fixed, merged |
| BUG-48 | "Enhance with AI" checkbox confusing | Users couldn't tell which track they were on. Replaced with two-card selector ("Use Your VPS + LLM CLI" vs "OpenRouter API Key"). | Fixed, merged |
| BUG-49 | Scaffold writes 0-byte files | `ssh.py write_file` called `.encode()` on bytes. Fixed with `isinstance(content, bytes)` check + `wb` mode. | Fixed, merged |
| BUG-50 | Delete VPS folder fails silently | Frontend missing `&is_dir=true` param. Backend `rmdir()` can't delete non-empty dirs. Added `delete_directory_recursive` with SAFE_PREFIX check. | Fixed, merged |
| BUG-51 | File explorer shows "No projects yet" | `loadProjects` only ran on mount `[]`. Split useEffect to depend on `[currentProject?.id]`. | Fixed, merged |

### Features Added During Dogfooding
| Feature | What | Status |
|---------|------|--------|
| FEAT-33 | Terminal auto-cd to project directory on SSH connect | Fixed, merged |

### Pending Workspace Bugs (from same session)
| Task | What | Priority |
|------|------|----------|
| BUG-52 | LLM-Dev: file tab routing wrong, close X broken, replace DIY highlighter with Monaco | P3 |
| BUG-53 | Preview panel doesn't load URLs | P3 |
| FEAT-34 | LLM-Dev first terminal mirrors chat terminal (should be independent) | P3 |
| FEAT-35 | Hint bubble: add README tip, collapsible caret toggle, X dismiss | P4 |

### Template Observations (feed back to harness-template-design.md)

1. **Scaffolding works end-to-end** — All 10 files created with correct content after BUG-49 fix
2. **`/generate-prp` 3-phase intake works** — All 4 calibration questions rendered correctly in terminal
3. **Director directory needs manual creation** — Future: HubLLM should scaffold a Director directory alongside the project directory (or offer a "Director Mode" toggle)
4. **Project name typo** — User created "Fist Stocker App" instead of "Fish Stocker App". No rename flow exists in the UI (only delete + recreate). Consider adding project rename.
5. **DOCS-01 is always first** — Template correctly seeds the queue with "Generate initial CODEBASE_INDEX.yaml" as the first task. This worked as designed.
6. **Director CLAUDE.md template** — Not scaffolded by HubLLM yet. Currently hand-written. Should be part of the template or a separate "Director scaffold" command.
7. **The hint bubble is useful** — Users do need to know about `claude` and `claude --resume`. But it needs to also mention the README.md and be dismissible (FEAT-35).

### TheFishStocker Status (end of session)
- **Project scaffolded**: `/root/llm-hub-projects/fist-stocker-app/`
- **Director ready**: `/root/llm-hub-projects/fist-stocker-director/` (CLAUDE.md + .claude/settings.json)
- **DOCS-01 pending**: Generate CODEBASE_INDEX.yaml (in TheFishStocker's own queue)
- **`/generate-prp` started but not completed** — Got through calibration phase, not yet into discovery or PRP generation
- **No code written yet** — Only harness files exist (src/ is empty with .gitkeep)

### Next Steps for Session 2
1. Resume or restart `/generate-prp` in the TheFishStocker chat terminal
2. Complete the PRP and save to `PRPs/` directory
3. Run `/execute-prp` to have the engineer start implementing from the PRP
4. Start a Director session from `cd /root/llm-hub-projects/fist-stocker-director && claude`
5. Have Director review engineer's first task (DOCS-01 or first PRP task)

---

## Harness Template vs Hub-LLM Harness — Key Differences

| Aspect | Template (scaffolded) | Hub-LLM (battle-tested) |
|--------|----------------------|------------------------|
| Commands | `.claude/commands/` (generate-prp, execute-prp) | `.claude/skills/` (hubllm/SKILL.md) |
| Knowledge | Flat `harness/` | `harness/knowledge/` with code-maps/, design-specs/, conventions/ |
| Vision doc | None | `harness/LLM-HUB-Vision-V2.md` |
| Learnings | Empty `learnings.md` | 90+ sessions of debugging history |
| Queue | Single DOCS-01 seed task | 50+ completed tasks across FEAT/BUG/DOCS |
| Director | Separate directory (manual) | `/root/dev/Claude-Project_Director/` |
| Review process | Described in execute-prp (pending_review) | Full Director review workflow with merge gates |

## Gaps Found — Session 1 (end of session)

### Gap 1: No pre-commit hook scaffolded (FEAT-36)
Hub-LLM has a pre-commit hook that blocks commits when code changes but CODEBASE_INDEX.yaml isn't updated. TheFishStocker's `.git/hooks/` only has default `.sample` files — no enforcement. The engineer could commit freely without touching the index, defeating the whole purpose.

**Fix**: Scaffold a `pre-commit` hook in `create_vps_project_folder()` that checks `src/` changes against `harness/CODEBASE_INDEX.yaml` staging.

### Gap 2: No git/GitHub onboarding (FEAT-37)
The template does `git init` and creates an initial commit, but the README and CLAUDE.md never explain git. New users (experience 1-3) will see a `.git/` folder and have no idea what it is. Users without GitHub accounts won't know how to connect a remote. The AI engineer's commit/push workflow assumes git knowledge that beginners don't have.

**Fix**: Add "Version Control" section to README (beginner-friendly, optional GitHub setup) and "Git Workflow" section to CLAUDE.md (commit rules, push-if-remote logic).

### Gap 3: CODEBASE_INDEX.yaml built by DOCS-01 but no enforcement until hook exists
The index is seeded empty by the scaffold, populated by DOCS-01 (first task in queue), and maintained by the engineer after each task (per execute-prp step 6 and CLAUDE.md "Always update the codebase index"). But without the pre-commit hook, this is entirely honor-system. The completion_checklist has `index_updated: false` but nothing prevents setting it to true without actually updating.

---

---

## Session 2 — February 8, 2026 (continued)

### Key Decisions Made

1. **Harness template is a Hub-LLM product feature** — Not a separate project. Template constants live in `projects.py`. Improving the template = FEAT task for B. Director CLAUDE.md updated to explain this.

2. **Separation of concerns finalized**:
   - Hub-LLM Director (here) = platform bugs + template improvements (both go in Hub-LLM queue)
   - TheFishStocker = dogfooding ground to validate the template works in practice
   - User prefixes feedback with context: "In FishStocker..." vs "In Hub-LLM..." vs "B forgot..."

3. **Disambiguation rule added to Director CLAUDE.md** — Same terms mean different things in each project (e.g., "the index" = Hub-LLM's index OR the template that generates the index). Director asks if ambiguous.

4. **Template translation cheat sheet** — Maps user language ("the PRP onboarding text") to template constants (`TEMPLATE_GENERATE_PRP`). User doesn't need to know constant names.

5. **Smart pre-commit hook (FEAT-36 upgraded)** — Beyond binary "was index staged?" check. Now validates: file entry exists, line count matches `wc -l`, no duplicate entries, stale file detection. Plus `/audit-index` command for on-demand full audit.

6. **Template feature manifest** — Added to `harness-template-design.md`. Living checklist of every scaffolded file and planned automation feature. Prevents forgetting to templatize new features.

7. **Iterative dogfooding approach** — Test one template feature → find bugs → fix → delete project → recreate → test next feature. Cleaner than building TheFishStocker into a full app.

8. **Index file insights** — 1,750 lines, 93KB, ~23K tokens. Built organically from actual code (not templatizable). Engineer reads full index + queue + CLAUDE.md on startup = ~51K tokens. Works well because tasks are well-defined with file paths, so engineer doesn't waste context exploring.

9. **Feature queue is 101KB** — Completed tasks array provides valuable project history but adds token cost. Future optimization: archive old completed tasks to separate file.

### Documents Updated This Session
- `/root/dev/Claude-Project_Director/CLAUDE.md` — Two Concerns section, disambiguation rule, cheat sheet
- `/root/dev/Hub-LLM/harness/knowledge/harness-template-design.md` — Feature manifest + updated file tree
- `/root/dev/Hub-LLM/harness/knowledge/dogfooding-log.md` — This file
- `/root/llm-hub-projects/fist-stocker-director/README.md` — Full context for TheFishStocker sessions

### Handoff for Next Director Session
1. Read CLAUDE.md — it now has the full mental model (two concerns, cheat sheet, disambiguation)
2. Check `harness/feature_queue.json` — FEAT-35 (hint bubble), FEAT-36 (hook + audit), FEAT-37 (git onboarding HTML) pending
3. Check `harness/knowledge/harness-template-design.md` — manifest shows what's shipped vs planned
4. B may have completed FEAT-36 — review if `pending_review`
5. TheFishStocker PRP intake was started but not completed — user can resume with `claude --resume` in chat terminal

---

## Session 3 — February 9, 2026

### What We Did
Completed the full `/generate-prp` intake for TheFishStocker — went through all Phase 1 calibration questions and Phase 2 discovery questions, generated the PRP, and had Claude start building.

### UX Gaps Found During PRP Intake

| # | Gap | Impact | Fix |
|---|-----|--------|-----|
| 1 | **No "go back"** — Can't revise or expand a previous answer mid-survey | User realized Q1 answer was too brief after reaching Q3. Had to finish and hope it worked out. | Add navigation commands: "change answer [N]", "show my answers", "start over" |
| 2 | **No review gate** — PRP generates immediately after last question | No chance to see all answers together, catch mistakes, or add missing context before the PRP is built on them. | Add interactive walk-through review: each answer replayed with Keep/Expand/Change selectable options, then a final "Ready to generate?" confirmation |
| 3 | **PRP is read-only** — User doesn't know they can request changes | PRP opens in preview panel. User thinks it's final. No guidance on how to iterate. | Add post-generation guidance: explain how to request changes, list editable sections |
| 4 | **Claude auto-proceeds** — Starts creating tasks and scaffolding without waiting | Claude populated the queue and began DOCS-01 before user could review the PRP. No approval gate. | Add explicit approval gate: STOP after PRP generation, STOP again after queue population. Only proceed on user's explicit go-ahead. |

### Template Change (FEAT-53)
All 4 gaps are addressed in a single task: FEAT-53 in Hub-LLM's queue. Targets `TEMPLATE_GENERATE_PRP` in `backend/routers/projects.py` (lines 119–291). Five surgical additions to the existing prompt template — no structural rewrite needed.

### Additional Observations
- **User Profile update not idempotent** — If a user revises calibration answers, the template says "Append a ## User Profile section" which would create duplicates. FEAT-53 includes changing "Append" to "Replace existing (or create if none)".
- **Post-PRP editing is the wrong default** — Letting users edit the PRP text directly ("adjust this section") is token-expensive and creates cascading changes that need further review. Better design: loop back to Q&A level, change specific answers, then regenerate the entire PRP. The pre-generation review gate (Addition 3) is the cheapest intervention point. Post-PRP gate offers: approve / change a specific answer (loops back to Q&A) / start over.
- **User Profile is a living document, not a snapshot** — Should update continuously throughout the Q&A process, not once at the end. Every answer, revision, expansion, restart is behavioral data. Track patterns: which questions get revised, how often free-text is used vs selectable options, restart count. Over multiple projects, the accumulated profile evolves and Claude adapts the Q&A — better options, right number of follow-ups, appropriate depth. High revision count does NOT automatically mean "make Q&A longer" — could be mis-hit keys or poor selectable options. Let patterns across multiple projects reveal the real signal.

### Template Infrastructure Tasks Filed (Track B)
| Task | What | Size |
|------|------|------|
| FEAT-53 | Improve /generate-prp intake (navigation, review gate, approval gate, user profiling) | M |
| FEAT-54 | Add Engineer systemPrompt to TEMPLATE_CLAUDE_SETTINGS | S |
| FEAT-55 | Director auto-scaffold (CLAUDE.md + settings.json alongside project) | M |
| FEAT-56 | Code-researcher agent in template | S |
| FEAT-57 | Harness ROADMAP.md in template | XS |

Decision: Track B chosen over Track A (fixing FishStocker). The current FishStocker project served as dogfooding round 1 — it found the gaps. Next project created in Hub-LLM will scaffold everything correctly. FishStocker can be deleted and recreated after these template improvements ship.

### Key Design Decision: Index is Source of Truth
- CODEBASE_INDEX.yaml supersedes individual code maps / component maps
- Both Director (task writing via grep) and Engineer (implementation via grep) use it
- Code-researcher agent automates index population (FEAT-56)
- Pre-commit hook enforces index updates (FEAT-36, shipped)
- Director systemPrompt and Engineer systemPrompt both enforce "grep the index, never cat it"

### TheFishStocker Status (end of session)
- PRP generated and saved to `PRPs/`
- Queue populated with Phase 1 tasks
- Project served its purpose as dogfooding round 1
- Will be recreated after FEAT-53–57 ship with full template infrastructure

---

## Session 4 — February 9, 2026 (Post-FEAT-57 Audit)

### What We Did
Reviewed and shipped all 5 template improvement tasks (FEAT-53–57). Created v2 template snapshot and diffed against v1-base. All expected changes present, no unexpected changes.

### Tasks Reviewed
| Task | Verdict | Notes |
|------|---------|-------|
| FEAT-53 | ✅ PASS | All 6 additions to /generate-prp: navigation, answer tracking, review gate, approval gate, living user profile, STT tip. Template grew 172→284 lines. |
| FEAT-54 | ✅ PASS | Engineer systemPrompt (286 words) with index-as-source-of-truth, pending_review enforcement, completion_note mandate, M/L task limit. |
| FEAT-55 | ❌→✅ PASS (R2) | Rejected R1 for: (1) non-blocking scaffold silently swallowing errors, (2) missing Read/Glob/Grep/Write/Edit tool permissions, (3) shallow glob `*` instead of `**` in deny rules. All 3 fixed in R2 — warnings now surface to frontend via `ProjectResponse.scaffold_warnings`. |
| FEAT-56 | ✅ PASS | 120-line generalized code-researcher agent. 3 request types, YAML formats, scanning techniques for frontend + backend. Properly generalized from Hub-LLM's own agent. |
| FEAT-57 | ✅ PASS | 5-phase roadmap with accurate status markers. Wired into scaffold. |

### Template Snapshot
- **v1-base**: 11 templates, pre-FEAT-53 baseline (34KB zip)
- **v2-post-feat57**: 16 templates, all improvements shipped (42KB zip)
- **Diff**: 7 changes — 2 modified files (.claude/settings.json, generate-prp.md) + 5 new files (director/CLAUDE.md, director settings, code-researcher.md, ROADMAP.md)
- Full diff saved to `template-snapshots/diff-v1-v2.txt`

### /execute-prp Compatibility Check
Reviewed `/execute-prp` (unchanged since v1-base, 30 lines) for compatibility with FEAT-53's new flow. Compatible — the approval gate populates the queue before handing off, and /execute-prp just picks up the first pending task. No changes needed.

### Design Doc Updated
- `harness-template-design.md` manifest: FEAT-36, FEAT-53–57 marked ✅ Shipped
- File tree updated to include `.claude/agents/`, `harness/ROADMAP.md`, `{{slug}}-director/`
- "File Contents" section still reflects v1-base text — refer to v2 snapshot for current versions

### Remaining Audit Steps (require live test)
- [ ] Step 3: Create test project via Hub-LLM UI, verify all files on VPS
- [ ] Step 4: Test /generate-prp intake flow (12-step walkthrough)
- [ ] Step 5: Test Director setup
- [ ] Step 6: Test code-researcher agent
- [ ] Step 7: Test pre-commit hook

### Next Steps
1. User creates a new project through Hub-LLM to validate the scaffold
2. Walk through /generate-prp to test FEAT-53 in real usage
3. After live audit passes: delete old FishStocker, create real FishStocker with correct name

---

## Session 5 — February 10, 2026 (FEAT-59-61, Merge to Main, Live Test)

### What We Did
Shipped 3 follow-up tasks (FEAT-59-61), merged feature/harness-v2 to main twice (FEAT-53-57 + FEAT-59-61), created test project "pugg-training-v2" to verify scaffold.

### Tasks Shipped
| Task | What |
|------|------|
| FEAT-59 | Quick Reference paths in Director CLAUDE.md (Director + Engineer dirs, launch command) |
| FEAT-60 | Welcome message — ANSI-colored ASCII art, brand colors from LandingPage.css (#38bdf8 sky blue), auto-display via cat .welcome on terminal open |
| FEAT-61 | Welcome rewrite for humans — figlet ANSI Shadow logo (2x bigger), responsive bash script (tput cols ≥62 desktop / <62 mobile), step-by-step onboarding instructions, copy/paste notes |

### Issues Found During Live Test
1. **First scaffold test (pugg-training)**: None of FEAT-53-57 landed — code was on feature/harness-v2, not merged to main. Production deploys from main.
2. **Welcome message v1 was for LLMs not humans**: "See CLAUDE.md for your Director workflow" — rewritten with step-by-step instructions for human operators.
3. **ASCII logo too small on desktop**: Original 3-line ╦╔╗ art barely visible. Replaced with 6-line figlet ANSI Shadow with ██╗ blocks.
4. **Mobile portrait would break**: 61-char logo wraps on 40-col phone terminal. Made responsive with bash tput cols detection.
5. **Brand colors wrong on first attempt**: B guessed cyan instead of actual #38bdf8. Fixed by pulling colors from LandingPage.css (Hub=#fff, LLM=#38bdf8, .dev=gray).
6. **Shadow effect requested**: ██╗ solid blocks in brand colors, ╚═╝ framework in dark gray creates depth.
7. **Project delete doesn't clean VPS dirs**: delete_project() only removes DB record. FEAT-58 filed (pending, not blocking).

### New Tasks Filed
| Task | What | Priority |
|------|------|----------|
| FEAT-58 | Clean up both VPS dirs ({slug}/ + {slug}-director/) on project delete | P2 |

### Merges to Main
1. First merge: FEAT-53-57 + FEAT-59-60 (fast-forward, 4782 insertions)
2. Second merge: FEAT-61 (fast-forward, 244 insertions)
Both auto-deployed via Coolify.

### Key Design Decisions
- **Welcome is a bash script, not a text file**: enables responsive width detection for mobile vs desktop
- **Frontend runs `bash .welcome` not `cat .welcome`**: changed in ClaudeCodeTerminalChat.jsx:284
- **Terminal auto-cd goes to Director dir, not app dir**: user workflow starts in Director, opens sub-terminal for Engineer
- **Brand colors from source code, not guessed**: LandingPage.css is the color authority

### Live Test Status
- pugg-training-v2 created with full v2 scaffold
- Welcome message displays on terminal open
- Remaining audit steps 3-7 (file verification, PRP intake test, Director test, code-researcher test, pre-commit hook test) ready to run

---

## Session 6 — February 10, 2026 (Welcome Experience V3 Design)

### What We Did
Created fresh "PUGG Training" project after cleaning up old VPS directories. Reviewed the live welcome experience and identified major UX gaps. Designed FEAT-62.

### Issues Found During Live Test
1. **Terminal welcome message is ephemeral**: Once Claude Code starts, the onboarding scrolls off. No persistent reference for paths or commands.
2. **Preview panel opens on "Home" (card grid) not "Getting Started"**: User must manually navigate to Getting Started in the sidebar.
3. **Getting Started page has WRONG instructions**: welcome.html tells user to "cd into project directory" and "type claude" as step 1 — this starts the Director, not the Engineer. No project-specific paths. Mentions hint bubble we're deleting.
4. **Redundant "Type claude..." in 3 places**: (a) green terminal writeln from ClaudeCodeTerminalChat.jsx:287, (b) help bubble overlay at bottom, (c) terminal welcome message. Too noisy.
5. **Help bubble overlaps terminal output**: Adds visual clutter, redundant with welcome message.
6. **Old VPS directories persist after project delete**: rm -rf command split across terminal line breaks — only first dir was removed. FEAT-58 gap confirmed again.
7. **Deleted projects still appear in sidebar**: rm -rf removes VPS dirs but not DB records. Must delete from UI to clean sidebar.

### Key Design Decisions
- **Dynamic Getting Started page, NOT scaffolded**: New endpoint `GET /api/projects/{id}/getting-started` renders TEMPLATE_GETTING_STARTED_HTML with project data on every request. Update template → deploy → ALL projects (existing + new) see the update immediately.
- **Self-contained HTML with inline CSS**: No dependencies on /docs/styles.css or nav.js. Dark theme matching workspace.
- **Slim terminal welcome**: Logo + paths + one cd example + "See Getting Started →" in orange. No multi-LLM options (just claude as the example).
- **Delete help bubble entirely**: Terminal message + Getting Started page provide sufficient guidance.
- **Brand orange sourced from codebase**: #f97316 found in AnthropicSubscription.jsx:12, ClaudeCodeTerminalChat.jsx:949.

### Architecture Discovery
- PreviewPanel is an iframe that needs a URL returning raw HTML — existing `/api/files/content` returns JSON
- For Getting Started specifically: dynamic backend rendering is better than VPS file serving (no SSH needed, updates apply to all projects)
- For future VPS file preview: `/api/files/raw/{server_id}/{path:path}` pattern designed (deferred, not needed for FEAT-62)
- `_fill_template()` already exists in projects.py — reuse for dynamic rendering
- PreviewPanel's welcomeUrl controlled by Workspace.jsx:44 — single-line change to wire dynamic URL

### New Tasks Filed
| Task | What | Priority |
|------|------|----------|
| FEAT-62 | Welcome Experience V3 — dynamic Getting Started + slim terminal + delete bubble | P1 |

---

## Session 7 — February 10, 2026 (FEAT-62–64 Ship, Docs Migration)

### What We Did
Shipped FEAT-62, FEAT-63, and FEAT-64 — completing the full onboarding UX overhaul and migrating all documentation to dynamic backend templates.

### Tasks Shipped
| Task | What |
|------|------|
| FEAT-62 | Dynamic Getting Started page (project-specific), slim terminal welcome, help bubble deleted |
| FEAT-63 | Fix Getting Started rendering: full-bleed in Fit mode, scroll overflow fix, nav sidebar, Docs button uses previewUrl |
| FEAT-64 | Migrate all 5 doc pages to dynamic backend templates at /api/docs/*, delete static frontend/public/docs/ |

### Architecture Shipped
- **docs.py** (778 lines): New router with shared `DOCS_CSS`, `_nav_sidebar(active)`, `_docs_page()` wrapper. 5 endpoints: `/home`, `/workspace-guide`, `/git-github`, `/whats-new`, `/harness`
- **Getting Started** remains project-specific at `/api/projects/{id}/getting-started` (uses `_fill_template` with project placeholders)
- **PreviewPanel**: `isFullBleed = deviceMode === 'fit'` for all content. Docs button + iframe default to `/api/docs/home`
- **Workspace.jsx**: fallback URL `/api/docs/home` instead of old `/docs/welcome.html`
- **Static files deleted**: 8 files removed from `frontend/public/docs/` (HTML, CSS, JS)

### Key Design Decisions
- **All docs are now dynamic**: Update a Python constant → deploy → all users see changes. No static file management.
- **Shared CSS constant**: One `DOCS_CSS` string shared across all 5 pages + Getting Started has its own inline CSS (different theme, simpler layout)
- **Nav sidebar baked in**: No more `nav.js` runtime injection. Each page has sidebar HTML with correct `active` class at render time
- **Getting Started excluded from global nav**: It's project-specific (has `{{projectName}}`, `{{slug}}`, `{{appDir}}` placeholders), so the docs nav has 5 pages and Getting Started has its own nav pointing to `/api/docs/*`

### Dogfooding Audit Status
- [x] Step 1-2: Template snapshot + diff (v2 shipped)
- [ ] **Step 3**: Create test project, verify all files on VPS
- [ ] **Step 4**: Test /generate-prp intake (FEAT-53 improvements)
- [ ] **Step 5**: Test Director setup
- [ ] **Step 6**: Test code-researcher agent
- [ ] **Step 7**: Test pre-commit hook

Steps 3-7 blocked on merge to main (deploying FEAT-62-64) then creating fresh test project.

### Next Steps
1. Merge feature/harness-v2 to main (FEAT-62-64)
2. Create fresh test project to validate full scaffold + new docs rendering
3. Resume audit Steps 3-7

---

## Session 8 — February 10, 2026 (BUG-67 + BUG-68, Audit Step 3 Fixes)

### What We Did
Created fresh "PUGG Training" project after deploying FEAT-65+66. Found and fixed 2 bugs from the live test.

### Bugs Found During Dogfooding
| Bug | Issue | Root Cause | Fix | Status |
|-----|-------|-----------|-----|--------|
| BUG-67 | Preview panel starts on docs Home instead of Getting Started | Race condition: `useState(getPreviewUrl)` is lazy-initialized — called once on mount when `project` is null, locking `welcomeUrl` to `/api/docs/home` forever. | Added `setWelcomeUrl` + `useEffect` to sync when `project.id` loads after mount. Also added `useEffect` to keep `welcomeUrlRef` in sync for BUG-55 navigation detection. | Fixed, merged |
| BUG-68 | Terminal shows old welcome text (pre-FEAT-62 content) | Deploy timing: project creation API hit old Coolify container (with old `TEMPLATE_DIRECTOR_WELCOME`) during rolling restart. `.welcome` is written once at scaffold time and never updated. | New `POST /api/projects/{id}/refresh-welcome` endpoint writes latest template to VPS via SSH. Frontend calls it before `bash .welcome` on terminal connect. Graceful fallback — if refresh fails, stale `.welcome` still runs. | Fixed, merged |

### Key Pattern Discovered: Lazy useState Initialization
`useState(fn)` calls `fn` only on first render. If the value depends on props that may be null on mount (like `project` after page refresh), the state locks to the null-case forever. Fix: pair with `useEffect` to sync when the prop arrives. This is the same class of bug as recurring pattern #9 (linkedServerId not updating on project change).

### Key Pattern Discovered: Scaffold-Time Static Files Go Stale
Any file written once at scaffold time (`.welcome`, `CLAUDE.md`, `settings.json`) will diverge from the template after the next deploy. For files that should always reflect the latest template, refresh on access (like the new `refresh-welcome` endpoint). For files the user customizes (like `CLAUDE.md`), scaffold-once is correct.

### Files Modified
| File | Change |
|------|--------|
| `frontend/src/components/Workspace.jsx:48-61` | Added `setWelcomeUrl` + two `useEffect` hooks for project.id sync |
| `backend/routers/projects.py:1680-1719` | New `POST /{id}/refresh-welcome` endpoint |
| `frontend/src/components/ClaudeCodeTerminalChat.jsx:279-295` | Await refresh-welcome before running bash .welcome |

### Dogfooding Audit Status
- [x] Step 1-2: Template snapshot + diff (v2 shipped)
- [x] **Step 3a**: Preview panel opens on Getting Started (BUG-67 fixed)
- [x] **Step 3b**: Terminal welcome shows latest template (BUG-68 fixed)
- [ ] **Step 4**: Test /generate-prp intake (FEAT-53 improvements)
- [ ] **Step 5**: Test Director setup
- [ ] **Step 6**: Test code-researcher agent
- [ ] **Step 7**: Test pre-commit hook

---

## Session 9 — February 11, 2026 (BUG-69, BUG-74, BUG-75)

### What We Did
Fixed double echo in terminal (BUG-69), then found and fixed two more bugs during continued dogfooding: Director scaffold missing custom commands (BUG-74), Getting Started page missing /generate-prp tip (BUG-75).

### Bugs Found During Dogfooding
| Bug | Issue | Root Cause | Fix | Status |
|-----|-------|-----------|-----|--------|
| BUG-69 | Typing `claude` shows `ccllaauuddee` — every keystroke doubled | Dangling `setHintCollapsed(true)` in `term.onData` handler — function was removed (FEAT-27/35 hint overlay cleanup) but call was left behind. Every keystroke threw `Uncaught ReferenceError`, causing xterm.js to re-fire onData. | Removed the broken call. Also removed React.StrictMode (defensive) and added isInitialMountRef guard + WS handler nulling. | Fixed, merged |
| BUG-74 | `/generate-prp` not available in Director terminal — typing `/gener` only shows `/insights` | Director scaffold (line 1425) only creates `["", ".claude"]` subdirs, doesn't create `.claude/commands/` or write command files. Commands were only scaffolded in Engineer dir. | Added `.claude/commands` to Director subdirs, added generate-prp.md + execute-prp.md to director_files dict. | Fixed, merged |
| BUG-75 | Getting Started page section 3 doesn't mention `/generate-prp` | Section 3 ends with "Press Enter" but never tells user about the next step. | Added tip div after step 3 in both TEMPLATE_GETTING_STARTED_HTML (projects.py) and CONTENT_GETTING_STARTED (docs.py). | Fixed, merged |

### Key Debugging Lesson: Instrument First
BUG-69 took 4 fix attempts across 2 sessions before diagnosis. First 3 attempts guessed at connection-level duplication (double connect, StrictMode, race conditions). What finally worked: adding visible diagnostic counters + console.warn logging. The console immediately showed `onData` firing twice per keystroke followed by `setHintCollapsed is not defined` error. **Lesson: diagnostic logging should be step 1, not step 4.**

### Key Pattern Discovered: Director vs Engineer Scaffold Gap
The Director scaffold (FEAT-55) was added later and only included the basics (CLAUDE.md, settings, .welcome). When new features are added to the Engineer scaffold (like .claude/commands/ in FEAT-30), they must also be checked against the Director scaffold. Two separate `template_files` dicts in the same function — easy to forget the second one.

### Documentation Gap Identified
Finding the Getting Started HTML templates was harder than it should be. There are **two versions** that need to stay in sync:
1. `TEMPLATE_GETTING_STARTED_HTML` in projects.py — project-specific (has {{projectName}}, {{slug}}, {{appDir}} placeholders)
2. `CONTENT_GETTING_STARTED` in docs.py — generic docs version (no placeholders)

These will be updated frequently. The template translation cheat sheet in Director CLAUDE.md needs entries for both.

### Dogfooding Audit Status
- [x] Step 3a: Preview panel opens on Getting Started (BUG-67)
- [x] Step 3b: Terminal welcome shows latest template (BUG-68)
- [x] Step 3c: Terminal no double echo (BUG-69)
- [x] Step 3d: Director has /generate-prp command (BUG-74)
- [x] Step 3e: Getting Started mentions /generate-prp (BUG-75)
- [ ] **Step 4**: Test /generate-prp intake (FEAT-53 improvements)
- [ ] **Step 5**: Test Director setup
- [ ] **Step 6**: Test code-researcher agent
- [ ] **Step 7**: Test pre-commit hook

---

## Automation Roadmap (from plan Phase 5)
1. **Ralph Loop** — auto-continue after task completion (engineer doesn't stop after 1 task)
2. **MCP server** — file-based task automation (not Supabase)
3. **Browser testing** — Puppeteer integration for visual verification
4. **Hosted intake service** — pay-as-you-go PRP generation where we provide Claude Code, user downloads zip
