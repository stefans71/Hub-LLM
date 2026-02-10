# Terminal Messaging & Template Updates — Continuation Plan

**Created**: Session 4, February 9, 2026
**Context**: Completing the terminal messaging and scaffolded template work stream.

---

## Completed This Session (for context)

| Task | What | File(s) |
|------|------|---------|
| FEAT-54 | Engineer systemPrompt in TEMPLATE_CLAUDE_SETTINGS | projects.py:~96 |
| FEAT-57 | ROADMAP.md template | projects.py:~552 |
| FEAT-55 | Director auto-scaffold (+ R2 rejection fix) | projects.py:~595-714 |
| FEAT-53 | /generate-prp intake rewrite (navigation, review gate, approval gate) | projects.py:~120-402 |
| FEAT-56 | Code-researcher agent template | projects.py:~839 |
| FEAT-59 | Directory quick-reference in Director CLAUDE.md | projects.py:~595 |
| FEAT-60 | Welcome message (.welcome) with ANSI art | projects.py:716-731 |

---

## Next Tasks (in priority order)

### 1. FEAT-61 [S, p1] — Fix welcome message for human operators

**What**: Rewrite TEMPLATE_DIRECTOR_WELCOME (projects.py:716-731) to be human-oriented, not LLM-oriented. The current version was written for Claude; real users need step-by-step onboarding.

**Color fixes**:
- ASCII art "Hub" letters → ALL bold white (`\x1b[1;37m`)
- ASCII art "LLM" letters → ALL sky blue true color (`\x1b[38;2;56;189;248m`)
- Remove "hubllm.dev" gray text entirely
- Director/Engineer labels → change from gray (`\x1b[90m`) to cyan (`\x1b[36m`)

**Content rewrite** — replace everything below ASCII art with:
1. Welcome to {{projectName}}!
2. Director/Engineer paths (cyan labels, green paths)
3. Step-by-step instructions:
   - Step 1: Open LLM-Dev Terminal panel, paste `cd {{appDir}} && claude`
   - Step 2: Come back to this terminal, type `claude`, press Enter
   - Step 3: Once Claude Code launched, type `/generate-prp`
4. Copy/paste tip at bottom (dim text)

**Key implementation notes**:
- Same parenthesized string concat pattern as current FEAT-60
- `\x1b` literal escape bytes, NOT `\033` text
- Verify with `repr()` that escape bytes are real
- Validate Python syntax with `py_compile`

**File**: `backend/routers/projects.py:716-731`

---

### 2. FEAT-58 [S, p2] — Clean up VPS directories on project delete

**What**: When user deletes project, also rm -rf both VPS directories.

**Backend** (`projects.py:~1415-1429` delete_project endpoint):
- After DB deletion succeeds, SSH to project's VPS server
- `rm -rf /root/llm-hub-projects/{slug}/`
- `rm -rf /root/llm-hub-projects/{slug}-director/`
- Non-blocking: don't fail delete if SSH is down
- Return which dirs were successfully removed

**Frontend** (`WorkspaceFileExplorer.jsx:1041` delete confirmation):
- Currently only shows `{slug}/` — update to show both directories
- "This will delete all folders associated with this project"

---

## Terminal Auto-CD Locations (reference)

Three places in the frontend construct `cd` commands for project directories:

| File | Line | Current Target | Purpose |
|------|------|---------------|---------|
| `ClaudeCodeTerminalChat.jsx` | 284 | `{slug}-director/` + `cat .welcome` | Chat panel terminal startup (Director) |
| `ClaudeCodeTerminalChat.jsx` | 552 | `{slug}/` | Claude Code startup (Engineer) |
| `WorkspaceTerminal.jsx` | 78 | `{slug}/` | LLM-Dev panel terminals (dev work) |

**Lines 552 and 78 correctly go to `{slug}/`** — they're for Engineer/dev sessions, not Director.
**Line 284 correctly goes to `{slug}-director/`** — that's where the Director operates.

No changes needed to auto-cd routing. All three are correct for their context.

---

## Template Constants in projects.py (current state, ~1679 lines)

| Constant | Line (approx) | What |
|----------|--------------|------|
| `TEMPLATE_CLAUDE_MD` | ~22 | Engineer CLAUDE.md with rules, workflow |
| `TEMPLATE_CLAUDE_SETTINGS` | ~80 | Engineer .claude/settings.json + systemPrompt |
| `TEMPLATE_GENERATE_PRP` | ~120 | /generate-prp command (284 template lines) |
| `TEMPLATE_EXECUTE_PRP` | ~405 | /execute-prp command |
| `TEMPLATE_AUDIT_INDEX` | ~435 | /audit-index command |
| `TEMPLATE_ROADMAP` | ~552 | harness/ROADMAP.md |
| `TEMPLATE_DIRECTOR_CLAUDE_MD` | ~595 | Director CLAUDE.md with role, quick ref |
| `TEMPLATE_DIRECTOR_SETTINGS` | ~662 | Director .claude/settings.json + permissions |
| `TEMPLATE_DIRECTOR_SETTINGS_LOCAL` | ~687 | Director deny rules |
| `TEMPLATE_DIRECTOR_WELCOME` | ~716 | .welcome ANSI art (FEAT-61 will rewrite) |
| `TEMPLATE_PRE_COMMIT_HOOK` | ~734 | Git pre-commit hook |
| `TEMPLATE_CODE_RESEARCHER` | ~839 | .claude/agents/code-researcher.md |
| `TEMPLATE_README` | later | README.md |
| `TEMPLATE_CODEBASE_INDEX` | later | Empty index YAML |
| `TEMPLATE_FEATURE_QUEUE` | later | Initial queue JSON |
| `TEMPLATE_LEARNINGS` | later | Empty learnings.md |

---

## ANSI Color Reference (brand palette)

```
Bold white:     \x1b[1;37m   (Hub text, project name)
Sky blue:       \x1b[38;2;56;189;248m  (LLM text — true color #38bdf8)
Dark gray/dim:  \x1b[90m    (subdued labels, notes)
Green:          \x1b[32m    (file paths)
Cyan:           \x1b[36m    (commands, directory labels)
Bold:           \x1b[1m     (emphasis)
Reset:          \x1b[0m     (always reset after colored text)
```

---

## Technical Notes for Future Sessions

1. **projects.py is 1679 lines** — all templates are string constants at module level. If it grows much more, consider extracting templates to a `templates/` module.

2. **`_fill_template(template, variables)`** — simple `{{placeholder}}` replacement. Variables dict built in `create_vps_project_folder()`.

3. **Director gets extra variable**: `director_variables = {**variables, "appDir": project_path}` — so Director templates can reference the app directory path.

4. **Pre-commit hook blocks**: CODEBASE_INDEX.yaml must be staged when code files change. Run `git add harness/CODEBASE_INDEX.yaml` before committing.

5. **`create_vps_project_folder()` returns dict** `{success: bool, warnings: list[str]}` — not bool. Warnings surface to frontend via `ProjectResponse.scaffold_warnings`.

6. **Delete endpoint**: `projects.py:~1415-1429` — currently only deletes DB record + chat messages. FEAT-58 adds VPS cleanup here.

7. **WorkspaceFileExplorer.jsx:1041** — current delete confirmation dialog only mentions `{slug}/`. FEAT-58 updates to show both directories.
