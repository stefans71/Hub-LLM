# HubLLM Knowledge System

Both Claude A (Director) and Claude B (Lead Engineer) use this folder.

## code-maps/ — What exists in the codebase
- workspace-components.md  ✅ (source: harness/debug/)
- terminal-architecture.md ✅ (source: TERMINAL_WORKSPACE.md)
- ssh-multiplexing.md      ✅ (source: SSH_MULTIPLEXED_ARCHITECTURE.MD)
- chat-components.md       ❌ → DOCS-02
- setup-wizard.md          ❌ → DOCS-03
- backend-routes.md        ❌ → DOCS-01
- state-management.md      ❌ → DOCS-04

## design-specs/ — Mockup element mappings (NOT React code)
Copied from harness/mappings/. Static unless mockup changes.

## conventions/ — Patterns and standards
- state-management.md      ❌ → DOCS-04

## Rules
1. Code maps update after every M/L task
2. Director never writes a task without a code map for that area
3. Claude B generates code maps via DOCS tasks
4. Originals remain at old paths so existing references work
