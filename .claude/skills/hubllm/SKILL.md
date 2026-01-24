# HubLLM Development Skill

## Project Overview

HubLLM is a web-based development environment that connects AI models to coding workspaces. This skill provides guidance for implementing UI components.

## Harness V2 Structure

```
harness/
├── SESSION_START.md      # Read this first every session
├── MASTER_INDEX.md       # 917 elements, completion status
├── feature_queue.json    # Next 10 priority tasks
├── progress/
│   ├── current.txt       # Recent session logs
│   └── archive/          # Old sessions
└── mappings/             # Detailed element specs
    ├── global_dashboard.md   # G-XX, D-XX elements
    ├── settings.md           # S-XX elements
    ├── create_project.md     # CP-XX elements
    └── workspace_modals.md   # W-XX, M-XX elements
```

## Session Workflow

1. **Start**: `cat harness/progress/current.txt | tail -30`
2. **Find task**: `cat harness/feature_queue.json`
3. **Read specs**: `cat harness/mappings/[relevant_file].md`
4. **Implement**: Match mockup exactly
5. **Verify**: Screenshot and compare to mockup
6. **Update**: feature_queue.json + progress/current.txt
7. **Commit**: `git commit -m "feat(TASK-ID): description"`

## Task Sizing Rules

| Size | Elements | Session Rule |
|------|----------|--------------|
| XS | 1-3 | Multiple OK |
| S | 4-10 | Multiple OK |
| M | 11-30 | **ONE only** |
| L | 31-50 | **ONE only** |

## Element ID Prefixes

- `G-XX` = Global (header navigation)
- `D-XX` = Dashboard view
- `S-XX` = Settings view
- `CP-XX` = Create Project view
- `W-XX` = Workspace view
- `M-XX` = Modals

## CSS Variables (ALWAYS USE)

```css
--bg-primary: #0f1419;
--bg-secondary: #1a2028;
--bg-tertiary: #242b35;
--border: #2d3748;
--primary: #3b82f6;
--accent: #f97316;
--success: #22c55e;
--error: #ef4444;
--text-primary: #ffffff;
--text-secondary: #9ca3af;
```

## Key Files

| Purpose | Location |
|---------|----------|
| UI Mockup | `docs/hubllm-mockup-v2.html` |
| Task Queue | `harness/feature_queue.json` |
| Element Specs | `harness/mappings/*.md` |
| Progress Log | `harness/progress/current.txt` |

## Existing Components (Wire These In)

These components exist but may not be fully integrated:

- `Terminal.jsx` - xterm.js terminal
- `CodeEditor.jsx` - Monaco editor
- `FileBrowser.jsx` - File tree
- `PreviewPanel.jsx` - Live preview
- `ModelSelector.jsx` - Model dropdown
- `Chat.jsx` - AI chat
- `HeaderNavigation.jsx` - Global header

## Current Priority: Workspace View

The Workspace view (W-XX) is only 30% complete. Priority tasks:

1. W-03: Top bar (project info, model selector)
2. W-31: Icon sidebar
3. W-88: LLM-Dev bottom panel

## Visual Verification Required

Before marking ANY UI task complete:

```bash
agent-browser open http://localhost:5173/[view]
agent-browser screenshot current.png
# Compare to mockup - must match
```

## Don't

- ❌ Mark tasks complete without screenshot verification
- ❌ Do multiple M/L tasks in one session
- ❌ Use hardcoded colors (use CSS variables)
- ❌ Ignore the mapping files

## Do

- ✅ Read mapping file before implementing
- ✅ Match mockup exactly
- ✅ Screenshot and verify before marking complete
- ✅ Update both queue and progress files
- ✅ Commit with task ID
