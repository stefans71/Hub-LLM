# HubLLM Component Mapping
## HTML Mockup → React Components → Backend APIs

---

## Views Overview

```
hubllm-mockup-v2.html
├── view-dashboard (line 2537)
├── view-settings (line 2871)
├── view-create-project (line 3687)
└── view-workspace (line 4368)
```

---

## 1. DASHBOARD VIEW

### HTML Structure
```
view-dashboard
├── sidebar (dashboard-sidebar)
│   ├── logo
│   ├── nav-items (Dashboard, Settings, Create Project)
│   └── workspace-tree (project list)
├── main content
│   ├── header (Welcome back + Create Project btn)
│   ├── stats-grid (3 stat cards)
│   ├── view-toggle (Projects | Activity)
│   └── project cards grid
└── sidebar-expand-btn
```

### React Components

| HTML Element | React Component | File Path |
|--------------|-----------------|-----------|
| `view-dashboard` | `Dashboard.jsx` | `src/pages/Dashboard.jsx` |
| `dashboard-sidebar` | `Sidebar.jsx` | `src/components/Sidebar.jsx` |
| `workspace-tree` | `ProjectTree.jsx` | `src/components/ProjectTree.jsx` |
| stat cards | `StatCard.jsx` | `src/components/StatCard.jsx` |
| project cards | `ProjectCard.jsx` | `src/components/ProjectCard.jsx` |
| view-toggle | `ViewToggle.jsx` | `src/components/ViewToggle.jsx` |

### Backend Endpoints

```
GET /api/projects
  → List user's projects
  Response: [{ id, name, description, status, model, created_at }]

GET /api/stats/dashboard
  → Dashboard statistics
  Response: { projects_count, tokens_used, active_agents }

GET /api/activity
  → Recent activity feed
  Response: [{ type, project, action, timestamp }]
```

---

## 2. SETTINGS VIEW

### HTML Structure
```
view-settings
├── sidebar
│   └── settings nav items
└── settings sections
    ├── settings-subscription (line 2984)
    ├── settings-apikeys (line 3073)
    ├── settings-model (line 3117)
    ├── settings-vps (line 3150)
    ├── settings-profile (line 3162)
    ├── settings-appearance (line 3210)
    ├── settings-voice (line 3261)
    ├── settings-globalagents (line 3277)
    ├── settings-globalskills (line 3432)
    └── settings-globalmcp (line 3502)
```

### React Components

| HTML ID | React Component | File Path |
|---------|-----------------|-----------|
| `view-settings` | `Settings.jsx` | `src/pages/Settings.jsx` |
| `settings-subscription` | `SubscriptionSettings.jsx` | `src/components/settings/SubscriptionSettings.jsx` |
| `settings-apikeys` | `APIKeySettings.jsx` | `src/components/settings/APIKeySettings.jsx` |
| `settings-model` | `ModelSettings.jsx` | `src/components/settings/ModelSettings.jsx` |
| `settings-vps` | `VPSSettings.jsx` | `src/components/settings/VPSSettings.jsx` |
| `settings-profile` | `ProfileSettings.jsx` | `src/components/settings/ProfileSettings.jsx` |
| `settings-appearance` | `AppearanceSettings.jsx` | `src/components/settings/AppearanceSettings.jsx` |
| `settings-voice` | `VoiceSettings.jsx` | `src/components/settings/VoiceSettings.jsx` |
| `settings-globalagents` | `GlobalAgentsSettings.jsx` | `src/components/settings/GlobalAgentsSettings.jsx` |
| `settings-globalskills` | `GlobalSkillsSettings.jsx` | `src/components/settings/GlobalSkillsSettings.jsx` |
| `settings-globalmcp` | `GlobalMCPSettings.jsx` | `src/components/settings/GlobalMCPSettings.jsx` |

### Backend Endpoints

```
# Subscription
GET /api/user/subscription
PUT /api/user/subscription

# Profile  
GET /api/auth/me
PUT /api/auth/me

# API Keys (BYOK - client-side storage)
# No backend needed - stored in localStorage

# Servers/VPS
GET /api/servers
POST /api/servers
PUT /api/servers/{id}
DELETE /api/servers/{id}
POST /api/servers/{id}/test-connection

# Global Agents
GET /api/agents?global=true
POST /api/agents
PUT /api/agents/{id}
DELETE /api/agents/{id}

# Global Skills
GET /api/skills?global=true
POST /api/skills
PUT /api/skills/{id}
DELETE /api/skills/{id}

# Global MCP Servers
GET /api/mcp-servers?global=true
POST /api/mcp-servers
PUT /api/mcp-servers/{id}
DELETE /api/mcp-servers/{id}
```

---

## 3. CREATE PROJECT VIEW

### HTML Structure (Most Complex)
```
view-create-project
├── header ("Create New Project")
├── scrollable content
│   ├── Step 1: Project Details (line 3696)
│   │   ├── workspace dropdown
│   │   ├── project name input
│   │   ├── project-brief textarea
│   │   ├── brief-file-upload
│   │   ├── Define Project with AI button
│   │   └── ai-brief-chat (collapsible)
│   │       ├── chat messages
│   │       ├── suggested questions
│   │       └── input with voice
│   │
│   ├── Step 2: Connection Source (line 3879)
│   │   ├── github-card (primary)
│   │   │   ├── github-not-connected (Sign in / Create Account)
│   │   │   └── github-connected (avatar, repo dropdown)
│   │   └── vps-card (collapsible)
│   │       └── fields-vps (IP, port, SSH key)
│   │
│   ├── Step 3: Project Context (line 4052)
│   │   ├── ctx-tech-stack input
│   │   ├── ctx-standards textarea
│   │   ├── ctx-context textarea
│   │   └── ctx-quirks textarea
│   │
│   ├── Step 4: Project Agents (line 4111)
│   │   ├── agent-help expandable
│   │   ├── global-agents-master checkbox
│   │   └── global-agents-list (checkboxes)
│   │
│   └── Step 5: MCP Servers (line 4229)
│       ├── mcp-help expandable
│       ├── global-mcp-master checkbox
│       └── mcp server list
│
└── action bar
    ├── Cancel button
    └── Create Project button (pulse animation)
```

### React Components

| HTML Element | React Component | Props |
|--------------|-----------------|-------|
| `view-create-project` | `CreateProject.jsx` | - |
| Step 1 | `ProjectDetailsStep.jsx` | `onBriefChange, onAIExpand` |
| `project-brief` | `BriefInput.jsx` | `value, onChange, onFileUpload` |
| `ai-brief-chat` | `AIBriefChat.jsx` | `messages, onSend, onVoice` |
| Step 2 | `ConnectionSourceStep.jsx` | `onGitHubConnect, onVPSConnect` |
| `github-card` | `GitHubConnection.jsx` | `connected, user, repos` |
| `vps-card` | `VPSConnection.jsx` | `servers, onTest` |
| Step 3 | `ProjectContextStep.jsx` | `context, onChange` |
| Step 4 | `AgentsStep.jsx` | `agents, selected, onToggle` |
| Step 5 | `MCPStep.jsx` | `servers, selected, onToggle` |

### Backend Endpoints

```
# AI Brief Expansion
POST /api/ai/expand-brief
  Body: { brief: string, model?: string }
  Response: { 
    tech_stack: string,
    standards: string,
    context: string,
    quirks: string,
    suggested_agents: string[],
    suggested_mcp: string[]
  }

# AI Chat (for follow-up questions)
POST /api/ai/chat
  Body: { messages: [], project_context: {} }
  Response: SSE stream

# GitHub Connection (existing)
GET /api/auth/oauth/github
GET /api/auth/oauth/github/callback
GET /api/github/repos

# Project Creation
POST /api/projects
  Body: {
    name: string,
    workspace_id?: string,
    brief: string,
    connection_type: 'github' | 'vps',
    github_repo?: string,
    vps_server_id?: string,
    context: {
      tech_stack: string,
      standards: string,
      context: string,
      quirks: string
    },
    agent_ids: string[],
    mcp_server_ids: string[]
  }
  Response: { id, name, status, ... }
```

### State Management

```javascript
// CreateProject state shape
const [projectState, setProjectState] = useState({
  // Step 1
  name: '',
  workspace: 'default',
  brief: '',
  briefExpanded: false,
  chatMessages: [],
  
  // Step 2
  connectionType: 'github', // 'github' | 'vps'
  githubConnected: false,
  githubUser: null,
  selectedRepo: null,
  vpsServerId: null,
  
  // Step 3 (can be AI-generated)
  context: {
    techStack: '',
    standards: '',
    context: '',
    quirks: ''
  },
  contextGenerated: false,
  
  // Step 4
  selectedAgents: [],
  
  // Step 5
  selectedMCP: [],
  
  // UI state
  currentStep: 1,
  loading: false,
  error: null
});
```

---

## 4. WORKSPACE VIEW

### HTML Structure
```
view-workspace
├── workspace-top-bar
│   ├── project selector dropdown
│   ├── model selector
│   └── action buttons (run, stop)
├── workspace-layout
│   ├── sidebar-left
│   │   ├── file browser
│   │   └── terminal tabs
│   ├── main-content
│   │   ├── code editor (Monaco)
│   │   └── terminal panels
│   ├── sidebar-right
│   │   └── AI chat panel
│   └── preview-panel (collapsible)
│       ├── device icons (phone, tablet, desktop)
│       ├── preview URL bar
│       └── iframe preview
└── workspace-bottom-bar
    └── status info
```

### React Components (Many Already Exist ✅)

| HTML Element | React Component | Status |
|--------------|-----------------|--------|
| `view-workspace` | `Workspace.jsx` | ✅ Exists |
| file browser | `FileBrowser.jsx` | ✅ Exists |
| terminal | `Terminal.jsx` | ✅ Exists |
| code editor | `CodeEditor.jsx` | ✅ Exists |
| AI chat | `Chat.jsx` | ✅ Exists |
| model selector | `ModelSelector.jsx` | ✅ Exists |
| preview-panel | `PreviewPanel.jsx` | 🔲 New |
| project selector | `ProjectSelector.jsx` | 🔲 New |

### New Components Needed

```jsx
// PreviewPanel.jsx
const PreviewPanel = ({ 
  collapsed, 
  onToggle, 
  previewUrl, 
  deviceType // 'phone' | 'tablet' | 'desktop'
}) => {
  // Renders iframe with Codespaces preview URL
};

// ProjectSelector.jsx
const ProjectSelector = ({ 
  projects, 
  currentProject, 
  onSelect 
}) => {
  // Dropdown to switch between projects
};
```

### Backend Endpoints

```
# Preview URL (Codespaces)
GET /api/github/codespaces/{id}/preview-url
  Response: { url: string, status: string }

# Run/Stop Codespace
POST /api/github/codespaces/{id}/start
POST /api/github/codespaces/{id}/stop

# File operations (existing)
GET /api/ssh/files?path=/
GET /api/ssh/file?path=/src/App.jsx
PUT /api/ssh/file
  Body: { path: string, content: string }
```

---

## 5. Shared Components

| Component | Used In | Purpose |
|-----------|---------|---------|
| `Sidebar.jsx` | Dashboard, Settings | Navigation sidebar |
| `Button.jsx` | All views | Styled button with variants |
| `Modal.jsx` | Settings, Workspace | Modal dialogs |
| `Dropdown.jsx` | All views | Select/dropdown component |
| `Input.jsx` | All views | Styled input with label |
| `Textarea.jsx` | All views | Styled textarea |
| `Checkbox.jsx` | Create Project | Styled checkbox |
| `Badge.jsx` | Dashboard, Settings | Status badges |
| `Card.jsx` | Dashboard | Card container |
| `Tooltip.jsx` | All views | Hover tooltips |
| `Toast.jsx` | All views | Notifications |

---

## 6. CSS/Styling Approach

### Current Mockup Uses
- CSS Custom Properties (`:root` variables)
- Inline styles (for prototype speed)

### Recommended Migration
```
Option A: Tailwind CSS (matches mockup style)
Option B: CSS Modules (component-scoped)
Option C: Styled Components (CSS-in-JS)
```

### Color Variables to Keep
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

## 7. JavaScript Functions to Migrate

### From Mockup (Need React Equivalents)

| Function | Purpose | React Equivalent |
|----------|---------|------------------|
| `showView(viewId)` | Switch views | React Router |
| `toggleDashboardSidebar()` | Collapse sidebar | `useState` |
| `startProjectDefinition()` | AI brief expansion | API call + `useState` |
| `sendBriefMessage()` | Chat message | API call |
| `connectGitHub()` | OAuth flow | `window.open` + callback |
| `toggleVPSCard()` | Expand VPS form | `useState` |
| `toggleAllGlobalAgents()` | Select all agents | `useState` |
| `togglePreview()` | Show/hide preview | `useState` |
| `showAgentModal()` | Agent edit modal | `useState` |

---

## 8. File Structure Recommendation

```
frontend/src/
├── pages/
│   ├── Dashboard.jsx
│   ├── Settings.jsx
│   ├── CreateProject.jsx
│   └── Workspace.jsx
├── components/
│   ├── common/
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Modal.jsx
│   │   └── ...
│   ├── dashboard/
│   │   ├── StatCard.jsx
│   │   ├── ProjectCard.jsx
│   │   └── ProjectTree.jsx
│   ├── settings/
│   │   ├── SubscriptionSettings.jsx
│   │   ├── ProfileSettings.jsx
│   │   └── ...
│   ├── create-project/
│   │   ├── ProjectDetailsStep.jsx
│   │   ├── ConnectionSourceStep.jsx
│   │   ├── ProjectContextStep.jsx
│   │   ├── AgentsStep.jsx
│   │   ├── MCPStep.jsx
│   │   ├── AIBriefChat.jsx
│   │   └── GitHubConnection.jsx
│   └── workspace/
│       ├── FileBrowser.jsx ✅
│       ├── Terminal.jsx ✅
│       ├── CodeEditor.jsx ✅
│       ├── Chat.jsx ✅
│       ├── PreviewPanel.jsx
│       └── ModelSelector.jsx ✅
├── contexts/
│   ├── AuthContext.jsx ✅
│   ├── ProjectContext.jsx
│   └── WorkspaceContext.jsx
├── hooks/
│   ├── useAuth.js
│   ├── useProjects.js
│   ├── useAgents.js
│   └── useMCP.js
├── services/
│   ├── api.js
│   ├── auth.js
│   ├── projects.js
│   ├── ai.js
│   └── github.js
└── styles/
    ├── variables.css
    └── global.css
```

---

## Summary

### What's Already Built (Backend)
- ✅ Auth (signup, login, OAuth)
- ✅ Chat/AI completions
- ✅ SSH/SFTP operations
- ✅ Server management
- ✅ GitHub Codespaces (basic)
- ✅ Projects (basic CRUD)

### What Needs Backend Work
- 🔲 AI brief expansion endpoint
- 🔲 Agents CRUD
- 🔲 Skills CRUD
- 🔲 MCP servers CRUD
- 🔲 Project-agent/mcp associations
- 🔲 Codespaces preview URL

### What's Already Built (Frontend)
- ✅ Auth components
- ✅ Chat component
- ✅ Terminal (xterm.js)
- ✅ File browser
- ✅ Code editor (Monaco)
- ✅ Model selector

### What Needs Frontend Work
- 🔲 Dashboard (new)
- 🔲 Settings (new)
- 🔲 Create Project (new - biggest)
- 🔲 Preview Panel
- 🔲 All the step components

The HTML mockup is well-organized and can be systematically converted to React components using this mapping.
