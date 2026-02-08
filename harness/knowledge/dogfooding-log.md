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

## Automation Roadmap (from plan Phase 5)
1. **Ralph Loop** — auto-continue after task completion (engineer doesn't stop after 1 task)
2. **MCP server** — file-based task automation (not Supabase)
3. **Browser testing** — Puppeteer integration for visual verification
4. **Hosted intake service** — pay-as-you-go PRP generation where we provide Claude Code, user downloads zip
