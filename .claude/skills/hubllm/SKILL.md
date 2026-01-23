# HubLLM Development Skill

Skill for developing the HubLLM web-based AI development environment.

## CRITICAL: Reference Documents

**ALWAYS read these before implementing UI:**

```
docs/hubllm-mockup-v2.html         ← Complete UI with all styling
docs/HUBLLM_COMPONENT_MAPPING.md    ← HTML → React → API mapping
docs/HUBLLM_DEVELOPMENT_STRATEGY.md ← Architecture plan
```

---

## Project Structure

```
Hub-LLM/
├── backend/              # FastAPI backend
│   ├── main.py
│   ├── routers/          # API endpoints
│   ├── services/         # Business logic
│   └── models/           # SQLAlchemy models
├── frontend/             # React frontend
│   └── src/
│       ├── components/
│       ├── contexts/
│       └── pages/
├── docs/                 # REFERENCE THESE
│   ├── hubllm-mockup-v2.html
│   ├── HUBLLM_COMPONENT_MAPPING.md
│   └── HUBLLM_DEVELOPMENT_STRATEGY.md
├── feature_list.json
├── claude-progress.txt
├── init.sh
└── SESSION_START.md
```

---

## CSS Variables (from mockup - USE THESE)

```css
:root {
  --bg-primary: #0f1419;
  --bg-secondary: #1a2028;
  --bg-tertiary: #242b35;
  --border: #2d3748;
  --primary: #3b82f6;
  --primary-hover: #2563eb;
  --accent: #f97316;
  --success: #22c55e;
  --warning: #eab308;
  --error: #ef4444;
  --text-primary: #ffffff;
  --text-secondary: #9ca3af;
  --text-muted: #6b7280;
}
```

---

## Views in Mockup

| View | Mockup ID | Line Number |
|------|-----------|-------------|
| Dashboard | `view-dashboard` | ~2537 |
| Settings | `view-settings` | ~2871 |
| Create Project | `view-create-project` | ~3687 |
| Workspace | `view-workspace` | ~4368 |

---

## Create Project Flow (5 Steps)

| Step | Key HTML IDs | Purpose |
|------|--------------|---------|
| 1 | `project-brief`, `ai-brief-chat` | Project details, AI expansion |
| 2 | `github-card`, `github-connected`, `vps-card` | Connection source |
| 3 | `ctx-tech-stack`, `ctx-standards` | Project context |
| 4 | `global-agents-list` | Agent selection |
| 5 | `global-mcp-list` | MCP server selection |

---

## Workflow

### Starting a Session

```bash
# 1. Read progress
cat claude-progress.txt

# 2. Read component mapping
cat docs/HUBLLM_COMPONENT_MAPPING.md

# 3. Start environment
./init.sh

# 4. Pick ONE feature from feature_list.json
```

### Building a Component

```bash
# 1. Find the HTML in mockup
grep -A30 'id="component-id"' docs/hubllm-mockup-v2.html

# 2. Check the mapping
grep "component-id" docs/HUBLLM_COMPONENT_MAPPING.md

# 3. Create React component with same styling

# 4. Test
agent-browser open http://localhost:5173/route
agent-browser snapshot -i
agent-browser screenshot test.png
```

### Ending a Session

```bash
# 1. Update feature_list.json (passes: true)
# 2. Update claude-progress.txt
# 3. Commit
git add -A
git commit -m "feat(feature-id): description"
```

---

## Key API Endpoints

```
# Auth
POST /api/auth/signup
POST /api/auth/login
GET  /api/auth/me
GET  /api/auth/oauth/github

# Chat
POST /api/chat/completions  (SSE streaming)
GET  /api/chat/models

# Projects
GET  /api/projects
POST /api/projects

# SSH
POST /api/ssh/connect
GET  /api/ssh/files
```

---

## Component Patterns

### React Component (matching mockup)

```jsx
export default function MyComponent() {
  return (
    <div style={{
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      padding: '20px'
    }}>
      <h2 style={{ color: 'var(--text-primary)' }}>Title</h2>
      <p style={{ color: 'var(--text-secondary)' }}>Content</p>
      <button style={{
        background: 'var(--primary)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        padding: '10px 20px',
        cursor: 'pointer'
      }}>
        Action
      </button>
    </div>
  );
}
```

---

## Do Not

- ❌ Implement multiple features per session
- ❌ Skip reading the mockup
- ❌ Use hardcoded colors (use CSS variables)
- ❌ Mark features passing without testing
- ❌ Forget to update progress files

## Do

- ✅ Read mockup before writing UI code
- ✅ Check component mapping for structure
- ✅ Use CSS variables from mockup
- ✅ Test with agent-browser
- ✅ Update progress files
- ✅ Commit with clear messages
