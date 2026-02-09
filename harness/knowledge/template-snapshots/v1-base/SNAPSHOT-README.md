# Harness Template Snapshot — v1-base

**Date**: February 9, 2026
**Source**: `backend/routers/projects.py` (lines 31–1095)
**Branch**: `feature/harness-v2`

---

## What This Is

This is a frozen snapshot of the harness template as it exists BEFORE the FEAT-53–57 improvements. It represents the "base" version — what a user gets when they create a Terminal Track project in Hub-LLM today.

Use this as a reference point to compare against future snapshots after template improvements ship.

## What's Included

### Scaffolded Files (what the user gets)

| File | Template Constant | Purpose |
|------|-------------------|---------|
| `CLAUDE.md` | `TEMPLATE_CLAUDE_MD` | Engineer project rules |
| `.claude/settings.json` | `TEMPLATE_CLAUDE_SETTINGS` | Permissions only (NO systemPrompt) |
| `.claude/commands/generate-prp.md` | `TEMPLATE_GENERATE_PRP` | PRP intake flow |
| `.claude/commands/execute-prp.md` | `TEMPLATE_EXECUTE_PRP` | PRP task execution |
| `.claude/commands/audit-index.md` | `TEMPLATE_AUDIT_INDEX` | Index audit command |
| `.git/hooks/pre-commit` | `TEMPLATE_PRE_COMMIT_HOOK` | Smart index enforcement |
| `harness/feature_queue.json` | `TEMPLATE_FEATURE_QUEUE` | Task queue with DOCS-01 seed |
| `harness/CODEBASE_INDEX.yaml` | `TEMPLATE_CODEBASE_INDEX` | Empty index skeleton |
| `harness/learnings.md` | `TEMPLATE_LEARNINGS` | Session log template |
| `README.md` | `TEMPLATE_README` | Project readme |
| `PRPs/.gitkeep` | — | PRP output directory |
| `docs/.gitkeep` | — | Documentation directory |
| `src/.gitkeep` | — | Source code directory |

### NOT Scaffolded (gaps identified during dogfooding)

| Missing | Impact | Planned Fix |
|---------|--------|-------------|
| **Director directory** | No oversight role scaffolded | FEAT-55 |
| **Engineer systemPrompt** | No persistent behavioral rules | FEAT-54 |
| **Code-researcher agent** | No automated index scanning | FEAT-56 |
| **Harness roadmap** | No visibility into automation phases | FEAT-57 |
| **PRP review gate** | No answer review before generation | FEAT-53 |
| **PRP approval gate** | Claude auto-proceeds after generation | FEAT-53 |
| **User profile continuous update** | Profile only written once after Phase 1 | FEAT-53 |

## Pending Template Improvements (FEAT-53–57)

| Task | What | Size | Priority |
|------|------|------|----------|
| FEAT-53 | Improve /generate-prp intake (navigation, review gate, approval gate, user profiling, STT tip) | M | 2 |
| FEAT-54 | Add Engineer systemPrompt to TEMPLATE_CLAUDE_SETTINGS | S | 2 |
| FEAT-55 | Director auto-scaffold (directory + CLAUDE.md + settings alongside project) | M | 2 |
| FEAT-56 | Code-researcher agent in template | S | 3 |
| FEAT-57 | Harness ROADMAP.md in template | XS | 3 |

## How to Create Future Snapshots

A reusable script is included in this snapshot (`_create-snapshot.sh`) and lives at the snapshots root:

```bash
# Location
/root/dev/Hub-LLM/harness/knowledge/template-snapshots/create-snapshot.sh

# Usage — pass a version name
./create-snapshot.sh v2-post-feat57

# What it does:
# 1. Extracts ALL TEMPLATE_* constants from projects.py
# 2. Writes each to its scaffolded file path (CLAUDE.md, settings.json, etc.)
# 3. Copies design docs (harness-template-design.md, dogfooding-log.md)
# 4. Generates a MANIFEST.md with date, branch, commit, file list
# 5. Copies the script itself into the snapshot for reproducibility
# 6. Creates a ZIP file
```

The script's `file_map` dictionary maps template constant names to file paths. When new template constants are added (e.g. TEMPLATE_DIRECTOR_CLAUDE_MD from FEAT-55), they're already in the map. If Claude B adds a constant not in the map, the script will print `UNMAPPED` — just add the mapping.

## How to Compare Snapshots

```bash
# Diff two snapshot directories
diff -r template-snapshots/v1-base/ template-snapshots/v2-post-feat57/

# Save diff to a file
diff -r template-snapshots/v1-base/ template-snapshots/v2-post-feat57/ > template-diff-v1-v2.txt

# Quick summary of what changed
diff -rq template-snapshots/v1-base/ template-snapshots/v2-post-feat57/
```

## Automation Roadmap (from harness-template-design.md)

| Phase | What | Status |
|-------|------|--------|
| Phase 1: Manual | User prompts "do next task" | Current |
| Phase 2: PRP Generation | /generate-prp + /execute-prp | Shipped (improving via FEAT-53) |
| Phase 3: Ralph Loop | Auto-continue with verification gates | Not started |
| Phase 4: MCP Server | File-based task automation | Not started |
| Phase 5: Browser Testing | Automated UI verification | Not started |

## Design Docs (reference)

These live in Hub-LLM's harness, not in the template:
- `harness/knowledge/harness-template-design.md` — Full design with file contents and scaffolding logic
- `harness/knowledge/dogfooding-log.md` — Observations from real-world template usage
