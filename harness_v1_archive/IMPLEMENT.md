# IMPLEMENT.md - HubLLM Harness Setup Instructions

## READ THIS FIRST

This file contains instructions for setting up the HubLLM development harness.
Follow these steps in order.

---

## Step 1: Unpack Files

Move files from `hubllm-harness-pack-v2/` to the repo root:

```bash
# Run from Hub-LLM repo root
mv hubllm-harness-pack-v2/* .
mv hubllm-harness-pack-v2/.claude .

# Clean up
rm -rf hubllm-harness-pack-v2 hubllm-harness-pack-v2.zip

# Make init.sh executable
chmod +x init.sh
```

---

## Step 2: Verify File Structure

After unpacking, your repo should have:

```
Hub-LLM/
├── .claude/skills/
│   ├── hubllm/SKILL.md
│   └── agent-browser/SKILL.md
├── docs/
│   ├── hubllm-mockup-v2.html       ← UI MOCKUP (reference this!)
│   ├── HUBLLM_COMPONENT_MAPPING.md  ← HTML → React mapping
│   └── HUBLLM_DEVELOPMENT_STRATEGY.md
├── backend/
├── frontend/
├── AGENTS.md
├── IMPLEMENT.md (this file)
├── SESSION_START.md
├── feature_list.json
├── claude-progress.txt
├── init.sh
└── ...
```

---

## Step 3: Install agent-browser

```bash
npm install -g agent-browser
agent-browser install
```

---

## Step 4: Test Dev Environment

```bash
./init.sh
```

Should see:
```
✓ PostgreSQL started
✓ Backend started
✓ Frontend started
Frontend:  http://localhost:5173
Backend:   http://localhost:8000
```

---

## Step 5: Commit Harness Files

```bash
git add -A
git commit -m "chore: add development harness and UI docs"
git push
```

---

## KEY REFERENCE FILES

**ALWAYS reference these when building UI components:**

| File | Purpose |
|------|---------|
| `docs/hubllm-mockup-v2.html` | Complete UI mockup with all styling |
| `docs/HUBLLM_COMPONENT_MAPPING.md` | Maps HTML IDs → React components → Backend APIs |
| `docs/HUBLLM_DEVELOPMENT_STRATEGY.md` | Architecture and implementation plan |

### CSS Variables (from mockup)

```css
--bg-primary: #0f1419;
--bg-secondary: #1a2028;
--bg-tertiary: #242b35;
--border: #2d3748;
--primary: #3b82f6;
--primary-hover: #2563eb;
--accent: #f97316;
--success: #22c55e;
--error: #ef4444;
--text-primary: #ffffff;
--text-secondary: #9ca3af;
--text-muted: #6b7280;
```

---

## Setup Complete!

For each coding session, read `SESSION_START.md` first.
