# Execute PRP

Read the specified PRP and execute its task plan.

## PRP File
$ARGUMENTS

## Workflow

1. **Read the PRP** at the specified path
2. **Read** `harness/feature_queue.json` for current task state
3. **Find the first `pending` task** from the PRP's task list
4. **Before implementing**, check:
   - `harness/CODEBASE_INDEX.yaml` — know where files live
   - `harness/learnings.md` — check for relevant past debugging notes
5. **Implement the task**:
   - Follow the code patterns from the PRP's EXAMPLES section
   - Create/modify files as specified
   - Run tests if specified in the task
6. **After implementing**:
   - Update `harness/CODEBASE_INDEX.yaml` (line counts, new files, purposes)
   - Add entry to `harness/learnings.md`
   - Update task in `harness/feature_queue.json`:
     - Set completion_checklist items to true
     - Write completion_note with test evidence
     - Set status to `pending_review`
7. **Report** what was completed and what's next

Do NOT proceed to the next task automatically. One task per execution.
