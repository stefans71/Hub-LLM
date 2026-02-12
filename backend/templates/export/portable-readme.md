# Exported from HubLLM.dev

This project was exported from HubLLM.dev on {date}.

## Quick Start

1. Unzip this archive
2. Install dependencies (check package.json, requirements.txt, or similar)
3. Review .env files and update credentials for your environment

## Project Structure

- `src/` — Application source code
- `CLAUDE.md` — Instructions for AI coding assistants (Claude, Cursor, etc.)
- `.claude/commands/` — Reusable AI workflows:
  - `generate-prp.md` — Product requirements gathering
  - `execute-prp.md` — Task execution workflow
  - `audit-index.md` — Codebase index audit
- `harness/` — Development tracking:
  - `feature_queue.json` — Task queue
  - `CODEBASE_INDEX.yaml` — AI-readable codebase map
  - `learnings.md` — Development session history
- `PRPs/` — Product Requirement Packs
- `docs/` — Documentation
- `README.md` — Project overview

## Using with Another LLM Assistant

The `CLAUDE.md` file and `harness/` directory work with any LLM coding tool.
Point your AI assistant at `CLAUDE.md` for project context, and use
`harness/feature_queue.json` to track tasks.

Built with HubLLM.dev — AI-powered development workspace.
