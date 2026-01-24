# HubLLM Harness V2

Development harness for AI-assisted coding with visual verification.

## Quick Start

```bash
# Start session
cat harness/SESSION_START.md

# Check what's next
cat harness/feature_queue.json

# Start dev environment
./init.sh
```

## Structure

```
harness/
├── SESSION_START.md      # Read first every session
├── MASTER_INDEX.md       # Overall completion status
├── feature_queue.json    # Priority task queue
├── progress/
│   ├── current.txt       # Recent sessions (max 10)
│   └── archive/          # Old session logs
└── mappings/             # Element specifications
    ├── global_dashboard.md   # Header + Dashboard
    ├── settings.md           # Settings (10 sections)
    ├── create_project.md     # Create Project (5 steps)
    └── workspace_modals.md   # Workspace + Modals
```

## Key Concepts

### Element IDs
Every UI element has a unique ID:
- `G-XX` = Global (header)
- `D-XX` = Dashboard
- `S-XX` = Settings
- `CP-XX` = Create Project
- `W-XX` = Workspace
- `M-XX` = Modals

### Task Sizes
| Size | Elements | Session Rule |
|------|----------|--------------|
| XS | 1-3 | Multiple OK |
| S | 4-10 | Multiple OK |
| M | 11-30 | ONE only |
| L | 31-50 | ONE only |

### Visual Verification
**Required** before marking any UI task complete:
1. Screenshot the implementation
2. Compare to mockup
3. Fix differences
4. Only then mark complete

## Files

| File | Purpose |
|------|---------|
| `SESSION_START.md` | Session workflow |
| `MASTER_INDEX.md` | 917 elements tracked |
| `feature_queue.json` | Next 10 tasks |
| `progress/current.txt` | Session log |
| `mappings/*.md` | Element specs |

## Current Status

- **Total Elements**: 917
- **Completed**: 567 (62%)
- **Priority**: Workspace view (W-XX tasks)
