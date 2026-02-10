# Audit CODEBASE_INDEX.yaml

Perform a full audit of `harness/CODEBASE_INDEX.yaml` against the actual codebase.

## Steps

1. **Walk all code files** in `src/` (and any other code directories)
2. **For each file**: check if it has a matching entry in CODEBASE_INDEX.yaml
3. **For each index entry**: check if the file still exists on disk
4. **Line count check**: compare `lines:` value in index vs `wc -l` on disk
5. **Duplicate check**: flag any filename appearing more than once

## Output Format

```
CODEBASE_INDEX AUDIT REPORT
============================

Missing from index (files exist but no entry):
  - src/components/NewWidget.jsx (142 lines)

Stale entries (in index but file not found):
  - src/old/Removed.jsx

Line count mismatch:
  - src/components/PreviewPanel.jsx: index=72, actual=144

Duplicate entries:
  - src/utils/helpers.js appears 2 times

Summary: X missing, X stale, X mismatched, X duplicates
```

## Auto-fix

After reporting, update the line counts in CODEBASE_INDEX.yaml to match actual values.
Add stub entries for missing files. Remove stale entries for deleted files.
