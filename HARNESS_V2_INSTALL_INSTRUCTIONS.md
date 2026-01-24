# Harness V2 Installation - Step by Step

## Overview

This will:
1. Create a new branch for V2
2. Archive old harness files
3. Install new harness structure
4. Update .claude/skills

---

## Step 1: Upload harness-v2.zip to Codespaces

Upload the `harness-v2.zip` file to your Codespace (drag and drop into the file explorer or use the upload button).

---

## Step 2: Open Terminal in Codespaces

Run these commands in order:

### Create New Branch

```bash
cd /workspaces/Hub-LLM
git checkout -b feature/harness-v2
```

### Archive Old Harness Files

```bash
# Create archive folder
mkdir -p harness_v1_archive

# Move old files to archive
mv claude-progress.txt harness_v1_archive/
mv feature_list.json harness_v1_archive/
mv IMPLEMENT.md harness_v1_archive/
mv SESSION_START.md harness_v1_archive/

# Keep AGENTS.md in root or move it
# mv AGENTS.md harness_v1_archive/
```

### Extract New Harness

```bash
# Unzip to repo root (creates harness/ and updates .claude/)
unzip ~/harness-v2.zip -d /workspaces/Hub-LLM/

# Verify structure
ls -la harness/
ls -la .claude/skills/
```

### Move Old Progress to Archive

```bash
# Copy old progress file to new archive location
cp harness_v1_archive/claude-progress.txt harness/progress/archive/v1_claude_progress.txt
```

### Commit Changes

```bash
git add -A
git status

# Should show:
# - harness/ folder (new)
# - .claude/skills/ (updated)
# - harness_v1_archive/ (archived old files)

git commit -m "refactor: migrate to harness v2 with component-level tracking"
git push -u origin feature/harness-v2
```

---

## Step 3: Verify Installation

```bash
# Check harness structure
tree harness/ -L 2

# Should show:
# harness/
# ├── MASTER_INDEX.md
# ├── README.md
# ├── SESSION_START.md
# ├── feature_queue.json
# ├── mappings/
# │   ├── create_project.md
# │   ├── global_dashboard.md
# │   ├── settings.md
# │   └── workspace_modals.md
# └── progress/
#     ├── archive/
#     └── current.txt

# Check skills
cat .claude/skills/hubllm/SKILL.md | head -20
```

---

## Step 4: Test With Claude

Start a new Claude session with this prompt:

```
Read harness/SESSION_START.md and continue working on HubLLM.

RULES:
- Check task SIZE before starting (XS/S = multiple OK, M/L = ONE only)
- Must screenshot and verify against mockup before marking complete
- Update feature_queue.json and progress/current.txt when done
```

---

## What's Changed

| V1 | V2 |
|----|-----|
| `SESSION_START.md` in root | `harness/SESSION_START.md` |
| `claude-progress.txt` (36KB) | `harness/progress/current.txt` (rotates) |
| `feature_list.json` (41 features) | `harness/feature_queue.json` (10 tasks) |
| No mappings | `harness/mappings/` (917 elements) |
| No size limits | T-shirt sizing (XS/S/M/L) |
| No visual verification | Required screenshots |

---

## Rollback (If Needed)

```bash
# If something goes wrong, restore V1
git checkout feature/harness-setup
```

---

## Files in harness-v2.zip

```
harness/
├── SESSION_START.md      # V2 session workflow
├── MASTER_INDEX.md       # 917 elements tracked
├── README.md             # Quick reference
├── feature_queue.json    # Next 10 priority tasks
├── progress/
│   ├── current.txt       # Fresh progress file
│   └── archive/
│       └── v1_sessions_summary.txt
└── mappings/
    ├── global_dashboard.md   # 127 elements
    ├── settings.md           # 298 elements
    ├── create_project.md     # 203 elements
    └── workspace_modals.md   # 289 elements

.claude/
└── skills/
    ├── hubllm/SKILL.md       # Updated project skill
    └── agent-browser/SKILL.md # Visual verification skill
```
