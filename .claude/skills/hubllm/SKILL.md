# HubLLM Development Skill

Skill for developing the HubLLM web-based AI development environment.

## When to Use

Use this skill when working on:
- HubLLM frontend (React/Vite)
- HubLLM backend (Python/FastAPI)
- Project creation flow
- Workspace features
- Authentication
- AI chat integration

## Project Structure

```
Hub-LLM/
├── backend/              # FastAPI backend
│   ├── main.py           # App entry, middleware
│   ├── routers/          # API endpoints
│   │   ├── auth.py       # Authentication
│   │   ├── chat.py       # AI chat
│   │   ├── projects.py   # Project CRUD
│   │   ├── ssh.py        # SSH/SFTP
│   │   └── github.py     # GitHub API
│   ├── services/         # Business logic
│   └── models/           # SQLAlchemy models
├── frontend/             # React frontend
│   └── src/
│       ├── components/   # UI components
│       ├── contexts/     # React contexts
│       ├── pages/        # Page components
│       └── services/     # API calls
├── feature_list.json     # Testable features
├── claude-progress.txt   # Session log
├── init.sh               # Start dev env
└── AGENTS.md             # Agent instructions
```

## Workflow

### Starting a Session

```bash
# 1. Read progress
cat claude-progress.txt

# 2. Check features
cat feature_list.json | jq '.features[] | select(.passes == false) | .id'

# 3. Start environment
./init.sh

# 4. Pick ONE feature to work on
```

### Ending a Session

```bash
# 1. Test the feature
agent-browser open http://localhost:5173
agent-browser snapshot -i
# ... test steps ...

# 2. Update feature_list.json
# Set passes: true for completed feature

# 3. Update claude-progress.txt
# Add session log entry

# 4. Commit
git add -A
git commit -m "feat(feature-id): description"
```

## Key API Endpoints

```
# Authentication
POST /api/auth/signup
POST /api/auth/login
GET  /api/auth/me
GET  /api/auth/oauth/github
GET  /api/auth/oauth/github/callback

# Chat
POST /api/chat/completions  (SSE streaming)
GET  /api/chat/models

# Projects
GET  /api/projects
POST /api/projects
PUT  /api/projects/{id}

# SSH
POST /api/ssh/connect
GET  /api/ssh/files
GET  /api/ssh/file
PUT  /api/ssh/file

# GitHub
GET  /api/github/codespaces
POST /api/github/codespaces
```

## Frontend Components

| Component | Path | Purpose |
|-----------|------|---------|
| Chat | components/Chat.jsx | AI chat with streaming |
| Terminal | components/Terminal.jsx | xterm.js terminal |
| FileBrowser | components/FileBrowser.jsx | SFTP file tree |
| CodeEditor | components/CodeEditor.jsx | Monaco editor |
| ModelSelector | components/ModelSelector.jsx | AI model picker |
| AuthPage | components/AuthPage.jsx | Login/signup |

## CSS Variables (Theme)

```css
:root {
  --bg-primary: #0f1419;
  --bg-secondary: #1a2028;
  --bg-tertiary: #242b35;
  --border: #2d3748;
  --primary: #3b82f6;
  --success: #22c55e;
  --error: #ef4444;
  --text-primary: #ffffff;
  --text-secondary: #9ca3af;
}
```

## Testing with agent-browser

```bash
# Install
npm install -g agent-browser
agent-browser install

# Test login flow
agent-browser open http://localhost:5173/login
agent-browser snapshot -i
agent-browser fill @e1 "test@example.com"
agent-browser fill @e2 "password123"
agent-browser click @e3  # Login button
agent-browser wait --url "**/dashboard"
agent-browser screenshot login-success.png

# Test create project
agent-browser open http://localhost:5173/create-project
agent-browser snapshot -i
agent-browser fill @e1 "My Project"
agent-browser fill @e2 "Build a todo app with React"
agent-browser click @e3  # Define with AI
agent-browser wait 3000
agent-browser screenshot create-project.png
```

## Common Patterns

### Add new API endpoint

```python
# backend/routers/new_router.py
from fastapi import APIRouter, Depends
from services.auth import get_current_user

router = APIRouter(prefix="/api/new", tags=["new"])

@router.get("/")
async def list_items(user = Depends(get_current_user)):
    return {"items": []}

# backend/main.py
from routers import new_router
app.include_router(new_router.router)
```

### Add new React component

```jsx
// frontend/src/components/NewComponent.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function NewComponent({ prop1 }) {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  
  useEffect(() => {
    // Fetch data
  }, []);
  
  return (
    <div style={{ background: 'var(--bg-secondary)' }}>
      {/* Component content */}
    </div>
  );
}
```

### Make authenticated API call

```javascript
// frontend/src/services/api.js
export async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('token');
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });
}
```

## Priority Features (from feature_list.json)

1. **create-001**: Create Project page
2. **create-002**: AI brief expansion
3. **github-001**: GitHub connect in flow
4. **dash-001**: Dashboard view
5. **settings-001**: Settings page

## Do Not

- Implement multiple features per session
- Skip testing before marking complete
- Forget to update progress files
- Break working features
