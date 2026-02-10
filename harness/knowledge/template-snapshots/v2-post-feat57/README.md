# {{projectName}}

{{projectBrief}}

## Getting Started

When you first open this project, a **Welcome guide** loads automatically in the Preview panel (right side). It walks you through your workspace layout and first steps.

```bash
# Install dependencies
{{installCommand}}

# Start development server
{{startCommand}}
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
