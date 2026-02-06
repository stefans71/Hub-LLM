# Investigation Request: INV-[ID]

## Requested by: Director
## Date: [YYYY-MM-DD]
## Related to: [BUG/FEAT-XX or "pre-task research"]
## Status: active

---

## Problem Statement
[What is the bug / what feature is needed — in plain language]

## Hypothesis
[Director's theory on where the code lives and what's wrong]

## Questions to Answer
1. Which files are involved? (paths + line numbers)
2. What state variables drive this behavior?
3. What props chain feeds into this area?
4. Any API calls? Which endpoints?
5. Any localStorage keys?
6. What does the current code do vs. what it should do?
7. What else could break if we change this?

## Starting Points (from CODEBASE_INDEX.yaml)
- File: [path from index]
- Also check: [related file]
- Grep for: [keywords]

## Known Issues (from learnings.md)
- Session [N]: [relevant finding]

## Scope
- [ ] Frontend only
- [ ] Backend only
- [ ] Cross-layer (frontend + backend)
- [ ] Data flow (localStorage/API/DB)

---

## For Code Researcher Agent:
1. Read this file for context
2. Scan the files listed in Starting Points
3. Answer every question above
4. Write/update entries in CODEBASE_INDEX.yaml
5. Save your report to: harness/investigations/reports/INV-[ID]_report.md
6. Include a draft task JSON in your report
