# Session Learnings Log

Track discoveries, patterns, and friction points for harness improvement.

---


### Session 35 - 2024-01-24
**Task**: S-96, S-166, D-73
**New Commands/Patterns**: None - smooth session
**Friction Points**: None
**Files Needing Attention**: Settings.jsx still large, extracting sections as we go

---

### Session 36 - 2026-01-24
**Task**: S-218 (Global Skills Section) + M-45 (Skill Modal)
**New Commands/Patterns**:
- Used `agent-browser click 'text="..."'` with exact quotes for reliable navigation
- Combined related tasks (S-218 + M-45) since modal is integral part of skills section
**Friction Points**:
- Settings.jsx file too large to read at once (36k+ tokens), need to use offset/limit or grep
- Emoji icons may not render in some browser environments (showed as empty squares)
**Files Needing Attention**:
- Settings.jsx now ~4400 lines - consider extracting GlobalSkillsSettings and SkillModal to separate files

---

