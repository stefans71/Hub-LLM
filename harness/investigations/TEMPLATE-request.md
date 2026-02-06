# Investigation Request: INV-[ID]

## Requested by: Director
## Date: [YYYY-MM-DD]
## Related task: [FEAT/BUG-XX or "pre-task research"]

## Problem Statement
[What is the bug / what feature is needed — in plain language]

## Hypothesis
[Director's initial theory on where the code lives and what's wrong]

## Questions to Answer
1. Which components are involved? (file paths + line numbers)
2. What state variables drive this behavior?
3. What props chain feeds into this area?
4. Are there any API calls involved? Which endpoints?
5. Any localStorage keys involved?
6. What does the current code do vs. what it should do?

## Starting Points (from CODEBASE_INDEX.yaml)
- Start with: [file path from index]
- Also check: [related file from index]
- Grep for: [keywords]

## Known Issues (from learnings.md)
- Session [N]: [relevant finding]

## Scope
- [ ] Frontend only
- [ ] Backend only
- [ ] Cross-layer (frontend + backend)
- [ ] Data flow (localStorage/API/DB)
