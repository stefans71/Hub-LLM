# IMPLEMENT.md - HubLLM Harness Setup Instructions

## READ THIS FIRST

This file contains instructions for setting up the HubLLM development harness. 
Follow these steps in order.

---

## Step 1: Unpack Files

Move these files from the `hubllm-harness-pack/` folder to the repo root:

```bash
# Run from Hub-LLM repo root
mv hubllm-harness-pack/feature_list.json .
mv hubllm-harness-pack/claude-progress.txt .
mv hubllm-harness-pack/init.sh .
mv hubllm-harness-pack/AGENTS.md .
mv hubllm-harness-pack/SESSION_START.md .

# Create skills directory and move skills
mkdir -p .claude/skills
mv hubllm-harness-pack/.claude/skills/hubllm .claude/skills/
mv hubllm-harness-pack/.claude/skills/agent-browser .claude/skills/

# Make init.sh executable
chmod +x init.sh

# Clean up
rm -rf hubllm-harness-pack/
```

---

## Step 2: Install agent-browser

```bash
npm install -g agent-browser
agent-browser install
```

This downloads Chromium for browser automation testing.

---

## Step 3: Verify Environment

Check that these exist:
- `.env` file with API keys (copy from `.env.example` if needed)
- `docker-compose.yml` for PostgreSQL
- `backend/` folder with FastAPI code
- `frontend/` folder with React code

---

## Step 4: Test Dev Environment

```bash
# Start everything
./init.sh

# Should see:
# ✓ PostgreSQL started
# ✓ Backend started (PID: xxxx)
# ✓ Frontend started (PID: xxxx)
# 
# Frontend:  http://localhost:5173
# Backend:   http://localhost:8000
```

If in Codespaces, ports will be forwarded automatically.

---

## Step 5: Verify Harness Files

```bash
# Check feature list
cat feature_list.json | head -50

# Check progress file
cat claude-progress.txt

# Check skills
ls -la .claude/skills/
```

---

## Step 6: Test Browser Automation

```bash
# Open the app
agent-browser open http://localhost:5173

# Get interactive elements
agent-browser snapshot -i

# Take screenshot
agent-browser screenshot setup-test.png

# Close browser
agent-browser close
```

---

## Setup Complete!

The harness is now configured. Here's what each file does:

| File | Purpose |
|------|---------|
| `feature_list.json` | 38 features to implement, each marked pass/fail |
| `claude-progress.txt` | Session handoff log - READ at start, UPDATE at end |
| `init.sh` | Starts all services with one command |
| `AGENTS.md` | Instructions for AI agents (you're reading similar now) |
| `SESSION_START.md` | What to do at the start of each coding session |
| `.claude/skills/hubllm/SKILL.md` | HubLLM-specific development patterns |
| `.claude/skills/agent-browser/SKILL.md` | Browser automation commands |

---

## What To Do Next

1. **Commit the harness files:**
   ```bash
   git add -A
   git commit -m "chore: add development harness files"
   git push
   ```

2. **Start your first coding session** - Read `SESSION_START.md`

3. **Pick a feature from `feature_list.json`** where `passes: false`

---

## For Future Sessions

Every new Claude session should:

1. **First message to Claude:**
   ```
   Read SESSION_START.md and begin working on HubLLM.
   ```

2. Claude will then:
   - Read `claude-progress.txt` to see what was done
   - Read `feature_list.json` to find next feature
   - Run `./init.sh` to start the environment
   - Work on ONE feature
   - Test with `agent-browser`
   - Update progress files
   - Commit changes

---

## Troubleshooting

### Port already in use
```bash
lsof -ti:8000 | xargs kill -9  # Kill backend
lsof -ti:5173 | xargs kill -9  # Kill frontend
```

### Database issues
```bash
docker compose down
docker compose up db -d
```

### agent-browser not found
```bash
npm install -g agent-browser
agent-browser install
```

### Missing dependencies
```bash
cd backend && pip install -r requirements.txt
cd frontend && npm install
```
