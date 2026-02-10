# Harness Automation Roadmap

This roadmap tracks the evolution of the HubLLM harness — the automation layer that coordinates AI agents building your project.

## Phase 1: Manual (Current) ✅ SHIPPED
- User prompts Claude Code: "do the next task"
- One task at a time, manual review cycle
- harness/feature_queue.json tracks task state
- CODEBASE_INDEX.yaml keeps agents oriented
- harness/learnings.md captures debugging history

## Phase 2: PRP Generation ✅ SHIPPED
- `/generate-prp "brief"` — interactive Q&A → full implementation blueprint
- `/execute-prp PRPs/x.md` — auto-populates feature_queue.json from PRP
- User Profile in CLAUDE.md adapts Q&A across projects
- Review gates before PRP generation and after

## Phase 3: Ralph Loop 🔜 PLANNED
- Agent auto-continues after task completion with verification gates
- Completion quality checks before proceeding to next task
- Automatic index updates validated between tasks
- Pause/resume capability for long task chains

## Phase 4: MCP Server 🔜 PLANNED
- File-based task automation via Model Context Protocol
- Tools: get_next_task, complete_task, update_index, get_learnings
- Enables external orchestrators to drive the task loop
- Structured tool calls replace prompt-based task management

## Phase 5: Browser Testing 📋 FUTURE
- Puppeteer/Playwright for automated UI verification
- Screenshot comparison for visual regression
- Agent-driven test flows that validate frontend changes
- Integrated into completion checklist as automated gate

---
*Updated: {{createdDate}}*
