# Harness Template Design — Scaffoldable Files

*Designed: February 8, 2026*
*Status: Design complete — ready for implementation*

---

## Overview

When a user creates a project in HubLLM (Terminal Track), these files get scaffolded on their VPS at `/root/llm-hub-projects/{slug}/`. The harness gives any CLI agent (claude, codex, etc.) a structured workspace with task tracking, codebase awareness, and session memory.

All files are templates with `{{placeholders}}` that get filled from the CreateProject form data.

---

## File Tree

```
{{slug}}/
├── CLAUDE.md                           # Project rules — agent reads this first
├── .claude/
│   ├── settings.json                   # Claude Code settings (allowlist, etc.)
│   └── commands/
│       ├── generate-prp.md             # /generate-prp slash command
│       └── execute-prp.md              # /execute-prp slash command
├── harness/
│   ├── feature_queue.json              # Task queue
│   ├── CODEBASE_INDEX.yaml             # File map (starts minimal, grows)
│   └── learnings.md                    # Session debugging history
├── PRPs/                               # Generated implementation blueprints
│   └── .gitkeep
├── src/                                # User's application code
│   └── .gitkeep
└── README.md                           # Generated from project brief
```

---

## File Contents

### 1. `CLAUDE.md`

The agent's primary instruction file. Read on every session start.

```markdown
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
setState(prev => ({ ...prev, field: value }))  // ✅
setState({ ...state, field: value })            // ❌ stale
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
```

### 2. `.claude/settings.json`

Minimal Claude Code settings.

```json
{
  "permissions": {
    "allow": [
      "Bash(git *)",
      "Bash(npm *)",
      "Bash(npx *)",
      "Bash(node *)",
      "Bash(python *)",
      "Bash(pip *)",
      "Bash(ls *)",
      "Bash(cat *)",
      "Bash(mkdir *)",
      "Bash(cp *)",
      "Bash(mv *)"
    ],
    "deny": [
      "Bash(rm -rf /)",
      "Bash(sudo rm -rf *)"
    ]
  }
}
```

### 3. `.claude/commands/generate-prp.md`

Adapted from Cole Medin's context-engineering-intro. Generates a PRP from the project brief.

```markdown
# Generate PRP

Read the project brief below and generate a comprehensive PRP (Product Requirements Prompt).

## Brief
$ARGUMENTS

## Output Format

Create a file at `PRPs/{{timestamp}}-prp.md` with these sections:

### 1. FEATURE
- What to build — specific functionality and requirements
- User stories with acceptance criteria
- Success metrics

### 2. PHASES
Break the feature into ordered implementation phases:
- Phase 1: Foundation (data models, API endpoints, basic UI)
- Phase 2: Core Logic (business rules, validation, error handling)
- Phase 3: Polish (edge cases, performance, UX refinements)

Each phase contains tasks with:
- Clear deliverable
- Files to create/modify (reference CODEBASE_INDEX.yaml)
- Test requirements (what must pass before moving on)

### 3. EXAMPLES
Code patterns to follow — pull from existing codebase:
- Import patterns
- Component structure
- API call patterns
- State management approach
- Error handling style

### 4. DOCUMENTATION
- Relevant API docs or external resources
- Dependencies to install
- Environment variables needed

### 5. OTHER CONSIDERATIONS
- Edge cases the AI commonly misses
- Security considerations
- Performance implications
- Accessibility requirements

After generating, add all tasks to `harness/feature_queue.json` with:
- Incremental IDs (FEAT-01, FEAT-02, etc.)
- Priority order matching phase sequence
- File paths from CODEBASE_INDEX.yaml
- Test requirements from the PRP
```

### 4. `.claude/commands/execute-prp.md`

Reads a PRP and executes the task plan.

```markdown
# Execute PRP

Read the specified PRP and execute its task plan.

## PRP File
$ARGUMENTS

## Workflow

1. **Read the PRP** at the specified path
2. **Read** `harness/feature_queue.json` for current task state
3. **Find the first `pending` task** from the PRP's task list
4. **Before implementing**, check:
   - `harness/CODEBASE_INDEX.yaml` — know where files live
   - `harness/learnings.md` — check for relevant past debugging notes
5. **Implement the task**:
   - Follow the code patterns from the PRP's EXAMPLES section
   - Create/modify files as specified
   - Run tests if specified in the task
6. **After implementing**:
   - Update `harness/CODEBASE_INDEX.yaml` (line counts, new files, purposes)
   - Add entry to `harness/learnings.md`
   - Update task in `harness/feature_queue.json`:
     - Set completion_checklist items to true
     - Write completion_note with test evidence
     - Set status to `pending_review`
7. **Report** what was completed and what's next

Do NOT proceed to the next task automatically. One task per execution.
```

### 5. `harness/feature_queue.json`

Starts with an initial task to generate the codebase index.

```json
{
  "version": "1.0",
  "updated": "{{createdDate}}",
  "project": "{{projectName}}",
  "queue": [
    {
      "id": "DOCS-01",
      "name": "Generate initial CODEBASE_INDEX.yaml",
      "size": "S",
      "priority": 1,
      "status": "pending",
      "description": "Scan the project directory and populate harness/CODEBASE_INDEX.yaml with all source files, their line counts, purposes, and relationships. This is the foundation — every future task references this index.",
      "change": [
        "harness/CODEBASE_INDEX.yaml: Populate with all files in src/, their line counts, exports, imports, and purpose descriptions"
      ],
      "test": "Verify every file in src/ has an entry in the index. Line counts should match actual files.",
      "completion_note": "",
      "completion_checklist": {
        "code_works": false,
        "index_updated": false,
        "learnings_written": false,
        "committed_pushed": false,
        "status_set_to_pending_review": false
      }
    }
  ],
  "completed": []
}
```

### 6. `harness/CODEBASE_INDEX.yaml`

Starts as a skeleton. The first task (DOCS-01) populates it.

```yaml
# =============================================================================
# {{projectName}} — CODEBASE INDEX
# =============================================================================
# Single source of truth for codebase structure.
# Agent reads this to know where files live and what they do.
# Agent UPDATES this after every task that changes code.
#
# Created: {{createdDate}}
# Last updated: {{createdDate}}
# =============================================================================

meta:
  project: "{{projectName}}"
  stack: "{{techStack}}"
  created: "{{createdDate}}"
  last_updated: "{{createdDate}}"
  total_files: 0

# Populated by DOCS-01 task. Structure will look like:
#
# source_files:
#   src/App.jsx:
#     lines: 45
#     purpose: "Root component — renders layout and routes"
#     exports: [App]
#     imports: [react, react-router-dom]
#     last_verified_session: 1
#
# recurring_bugs:
#   - id: 1
#     pattern: "Description of the recurring issue"
#     fix: "How to fix it"
#     affected_files: [src/SomeFile.jsx]
```

### 7. `harness/learnings.md`

Starts empty with a header. Grows session by session.

```markdown
# Session Learnings Log

Track discoveries, patterns, and friction points across development sessions.

---

### Session 1 - {{createdDate}}
**Task**: Project initialization
**What**: Harness scaffolded. CLAUDE.md configured with {{techStack}} stack.
**Key Learning**: Project created via HubLLM workspace. Harness template includes task queue, codebase index, and learnings log.

---
```

### 8. `README.md`

Generated from project brief if available.

```markdown
# {{projectName}}

{{projectBrief || "A new project built with " + techStack}}

## Getting Started

```bash
# Install dependencies
{{installCommand || "npm install"}}

# Start development server
{{startCommand || "npm run dev"}}
```

## Project Structure

See `harness/CODEBASE_INDEX.yaml` for a complete file map.

## Development

This project uses the HubLLM harness for AI-assisted development:

- **Task Queue**: `harness/feature_queue.json` — pending tasks and their status
- **Codebase Index**: `harness/CODEBASE_INDEX.yaml` — file map for agent awareness
- **Learnings**: `harness/learnings.md` — session-by-session debugging history
- **PRPs**: `PRPs/` — implementation blueprints generated from project briefs

### AI Commands

```bash
claude                  # Start a new Claude Code session
/generate-prp "brief"  # Generate implementation plan from a brief
/execute-prp PRPs/x.md # Execute tasks from a PRP
```
```

---

## Scaffolding Logic

### Template Variables

| Variable | Source | Example |
|----------|--------|---------|
| `{{slug}}` | CreateProject form → slugified name | `phishing-app-2026` |
| `{{projectName}}` | CreateProject form → name field | `Phishing App 2026` |
| `{{techStack}}` | CreateProject form or PRP-detected | `React + FastAPI + PostgreSQL` |
| `{{createdDate}}` | Date.now() formatted | `2026-02-08` |
| `{{projectBrief}}` | CreateProject form → brief field | `A tool for...` |
| `{{installCommand}}` | Detected from tech stack | `npm install` |
| `{{startCommand}}` | Detected from tech stack | `npm run dev` |

### Scaffolding Trigger

When the user clicks "Create Project" in HubLLM (Terminal Track):

1. Backend creates project record in DB
2. SSH to user's VPS
3. `mkdir -p /root/llm-hub-projects/{{slug}}`
4. Write template files with variables filled
5. `cd /root/llm-hub-projects/{{slug}} && git init`
6. Return to workspace — terminal opens in project dir

### Tech Stack Detection

If user provides a PRP/brief, detect the stack and populate variables:

| Stack | installCommand | startCommand |
|-------|---------------|-------------|
| React (Vite) | `npm install` | `npm run dev` |
| Next.js | `npm install` | `npm run dev` |
| Python (FastAPI) | `pip install -r requirements.txt` | `uvicorn main:app --reload` |
| Python (Django) | `pip install -r requirements.txt` | `python manage.py runserver` |
| Go | `go mod download` | `go run .` |
| Rust | `cargo build` | `cargo run` |

---

## Incremental Automation Path

### Phase 1: Manual (current — ships first)
- User runs `claude` in terminal
- Agent reads CLAUDE.md + feature_queue.json
- User manually prompts "do the next task"
- Agent completes task, sets `pending_review`

### Phase 2: PRP Generation
- `/generate-prp` command creates implementation plan from brief
- Tasks auto-populated in feature_queue.json
- `/execute-prp` command picks up first pending task

### Phase 3: Ralph Loop
- After task completion, agent auto-checks: "Is the task actually done?"
- If verification passes → marks complete, loads next task
- If verification fails → retries with error context
- `--max-iterations` safety limit prevents infinite loops
- Implementation: Claude Code hook (stop hook intercepts exit, checks completion promise)

### Phase 4: MCP Server (File-Based)
- MCP server reads/writes feature_queue.json
- Tools: `get_next_task`, `complete_task`, `update_index`, `add_learning`
- No Supabase — just file I/O over MCP protocol
- Agent transitions tasks without manual editing

### Phase 5: Browser Testing
- Puppeteer/Playwright integration for automated UI verification
- Tasks can specify visual test requirements
- Agent captures screenshots, compares against expectations
- Validation gates: tests must pass before `pending_review`

---

## Key Design Decisions

### Why files, not a database?
- Zero dependencies — works with any CLI agent
- Git-trackable — full history of task changes
- Human-readable — users can edit queue by hand
- Portable — copy the directory, everything comes with it

### Why YAML for the index, not JSON?
- More readable for large documents (comments, multi-line strings)
- Agents parse YAML reliably
- Easier to hand-edit when needed
- JSON for the queue (structured data, programmatic read/write)

### Why `pending_review` instead of `completed`?
- Forces a review step — catches incomplete work
- In solo mode: user reviews before marking complete
- In Director/Engineer mode: Director reviews Engineer's work
- Prevents agents from marking their own work as done without verification

### Why one task per execution?
- Prevents context window exhaustion on large tasks
- Each task gets fresh context with updated index
- Easier to debug — one commit per task
- Ralph Loop (Phase 3) handles auto-continuation
