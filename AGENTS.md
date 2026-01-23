# AGENTS.md - Instructions for AI Coding Agents

## Project Overview

HubLLM is a web-based AI development environment with:
- Voice input and multi-model AI chat
- SSH terminal and file browser
- GitHub Codespaces integration
- Project management with agents and MCP servers

## Architecture

```
Hub-LLM/
├── backend/          # Python FastAPI
│   ├── main.py       # Entry point
│   ├── routers/      # API endpoints
│   ├── services/     # Business logic
│   └── models/       # SQLAlchemy models
├── frontend/         # React + Vite
│   └── src/
│       ├── components/
│       ├── contexts/
│       └── pages/
├── feature_list.json # Testable features (CHECK THIS FIRST)
├── claude-progress.txt # Session handoff log (UPDATE THIS)
└── init.sh           # Start dev environment
```

## Before Starting Work

1. **Read `claude-progress.txt`** - See what was done in previous sessions
2. **Read `feature_list.json`** - Find next failing feature to work on
3. **Run `./init.sh`** - Start the dev environment
4. **Pick ONE feature** - Don't try to implement multiple features at once

## Coding Standards

### Backend (Python/FastAPI)
- Use async/await for all database operations
- Type hints required on all functions
- Pydantic models for request/response validation
- SQLAlchemy async for database
- JWT tokens for authentication

### Frontend (React)
- Functional components with hooks
- Context API for global state
- Fetch API for HTTP requests (no axios)
- CSS variables for theming (see :root in mockup)

## Key Files to Know

| File | Purpose |
|------|---------|
| `backend/main.py` | FastAPI app setup, middleware |
| `backend/routers/auth.py` | Authentication endpoints |
| `backend/routers/chat.py` | AI chat with streaming |
| `backend/routers/ssh.py` | SSH/SFTP operations |
| `frontend/src/contexts/AuthContext.jsx` | Auth state management |
| `frontend/src/components/Chat.jsx` | AI chat component |
| `frontend/src/components/Terminal.jsx` | xterm.js terminal |

## Testing with agent-browser

```bash
# Install agent-browser
npm install -g agent-browser
agent-browser install

# Basic workflow
agent-browser open http://localhost:5173
agent-browser snapshot -i              # Get interactive elements
agent-browser click @e2                # Click by ref
agent-browser fill @e3 "text"          # Fill input
agent-browser screenshot test.png      # Take screenshot
```

## After Completing Work

1. **Test the feature** - Use agent-browser or manual testing
2. **Update `feature_list.json`** - Set `passes: true` for completed feature
3. **Update `claude-progress.txt`** - Log what you did
4. **Commit with clear message** - `git commit -m "feat: [feature-id] description"`

## Common Tasks

### Add new API endpoint
1. Create route in `backend/routers/`
2. Add to `backend/main.py` router includes
3. Create service function in `backend/services/`
4. Test with curl or frontend

### Add new React component
1. Create in `frontend/src/components/`
2. Follow existing component patterns
3. Use CSS variables from `:root`
4. Add to parent component

### Add database table
1. Add model to `backend/models/__init__.py`
2. Run migrations: `alembic revision --autogenerate`
3. Apply: `alembic upgrade head`

## Environment Variables

```env
# Required in .env
OPENROUTER_API_KEY=your_key
GITHUB_CLIENT_ID=your_id
GITHUB_CLIENT_SECRET=your_secret
DATABASE_URL=postgresql://hubllm:hubllm@localhost:5432/hubllm
SECRET_KEY=random_secret_key
```

## Do Not

- ❌ Try to implement multiple features in one session
- ❌ Mark features as passing without testing
- ❌ Skip updating progress files
- ❌ Change working features without good reason
- ❌ Remove or edit tests from feature_list.json

## Do

- ✅ Read progress files before starting
- ✅ Work on ONE feature at a time
- ✅ Test with agent-browser before marking complete
- ✅ Leave code in mergeable state
- ✅ Write clear commit messages
- ✅ Update documentation when adding features
