# HubLLM Components Reference

React components built for HubLLM, organized by area. Shows element IDs implemented and key props.

---

## Global Navigation

### HeaderNavigation.jsx
| Property | Value |
|----------|-------|
| **File** | `frontend/src/components/HeaderNavigation.jsx` |
| **Elements** | G-01 through G-09 |
| **Description** | Top navigation bar with logo, nav links, user menu |

**Props:**
```jsx
{
  currentView: string,      // 'dashboard' | 'workspace' | 'settings' | 'create-project'
  onNavigate: (view) => {}, // Navigation handler
  user: { email, name }     // Current user
}
```

---

## Workspace Area

### Workspace.jsx
| Property | Value |
|----------|-------|
| **File** | `frontend/src/components/Workspace.jsx` |
| **Elements** | W-01, W-02, W-30 (container) |
| **Description** | Main workspace container, orchestrates all workspace components |

**Props:**
```jsx
{
  project: { id, name, location },  // Current project
  model: { name, color },           // Selected model
  apiKeys: { anthropic, openrouter, google, github }
}
```

**State owned:**
- `activeTab` - chat/servers/codespaces
- `activeSidebarPanel` - workspaces/search/source-control
- `fileExplorerOpen` - boolean
- `isConnected` - connection status
- `selectedModel` - current model

---

### WorkspaceTopBar.jsx
| Property | Value |
|----------|-------|
| **File** | `frontend/src/components/WorkspaceTopBar.jsx` |
| **Elements** | W-03 through W-29 |
| **Description** | Project info, connection status, model selector, export button |

**Props:**
```jsx
{
  project: { name, location },
  model: { name, color },
  onModelChange: (model) => {},
  isConnected: boolean,
  onConnectionToggle: () => {},
  onExport: () => {}
}
```

---

### WorkspaceIconSidebar.jsx
| Property | Value |
|----------|-------|
| **File** | `frontend/src/components/WorkspaceIconSidebar.jsx` |
| **Elements** | W-31 through W-37 |
| **Description** | Vertical icon bar: workspaces, search, source control, create, settings |

**Props:**
```jsx
{
  activePanel: string,           // 'workspaces' | 'search' | 'source-control' | null
  onPanelChange: (panel) => {},  // Toggle panel
  onNavigate: (view) => {}       // Navigate to create-project or settings
}
```

---

### WorkspaceFileExplorer.jsx
| Property | Value |
|----------|-------|
| **File** | `frontend/src/components/WorkspaceFileExplorer.jsx` |
| **Elements** | W-38 through W-51 |
| **Description** | Collapsible workspaces panel with folder tree |

**Props:**
```jsx
{
  isOpen: boolean,
  onToggle: () => {},
  currentProject: { id, name },
  onSelectProject: (project) => {}
}
```

**Internal state:**
- `expandedFolders` - { customers: bool, personal: bool, archives: bool }

---

### ModelSelector.jsx
| Property | Value |
|----------|-------|
| **File** | `frontend/src/components/ModelSelector.jsx` |
| **Elements** | W-11 through W-28 (used within WorkspaceTopBar) |
| **Description** | Dropdown model selector with provider groups |

**Props:**
```jsx
{
  selectedModel: { name, color },
  onSelect: (model) => {},
  isOpen: boolean,
  onToggle: () => {}
}
```

---

### Chat.jsx
| Property | Value |
|----------|-------|
| **File** | `frontend/src/components/Chat.jsx` |
| **Elements** | W-53 through W-70 (partial) |
| **Description** | AI chat interface with message history |

**Props:**
```jsx
{
  project: { id, name },
  model: { name },
  apiKeys: { anthropic, openrouter, google }
}
```

---

### PreviewPanel.jsx
| Property | Value |
|----------|-------|
| **File** | `frontend/src/components/PreviewPanel.jsx` |
| **Elements** | W-71 through W-85 (partial) |
| **Description** | Live preview panel for web content |

**Props:**
```jsx
{
  previewUrl: string,
  defaultCollapsed: boolean,
  onCollapsedChange: (collapsed) => {}
}
```

---

### Terminal.jsx
| Property | Value |
|----------|-------|
| **File** | `frontend/src/components/Terminal.jsx` |
| **Elements** | (supports W-88 bottom panel) |
| **Description** | SSH terminal with xterm.js |

**Props:**
```jsx
{
  serverId: string,
  serverName: string,
  onClose: () => {}
}
```

---

### FileBrowser.jsx
| Property | Value |
|----------|-------|
| **File** | `frontend/src/components/FileBrowser.jsx` |
| **Elements** | (SFTP browser, not workspace tree) |
| **Description** | SFTP file browser for connected servers |

**Props:**
```jsx
{
  serverId: string,
  serverName: string
}
```

---

### CodeEditor.jsx
| Property | Value |
|----------|-------|
| **File** | `frontend/src/components/CodeEditor.jsx` |
| **Elements** | (supports workspace editor) |
| **Description** | Code editor with syntax highlighting |

**Props:**
```jsx
{
  path: string,
  content: string,
  onSave: (path, content) => {},
  onClose: () => {}
}
```

---

## Dashboard Area

### DashboardSidebar.jsx
| Property | Value |
|----------|-------|
| **File** | `frontend/src/components/DashboardSidebar.jsx` |
| **Elements** | D-01 through D-30 (partial) |
| **Description** | Dashboard sidebar with project list |

---

## Settings Area

### SettingsModal.jsx
| Property | Value |
|----------|-------|
| **File** | `frontend/src/components/SettingsModal.jsx` |
| **Elements** | S-01 through S-60 (partial) |
| **Description** | Settings modal with API key configuration |

---

## Authentication

### AuthPage.jsx
| Property | Value |
|----------|-------|
| **File** | `frontend/src/components/AuthPage.jsx` |
| **Elements** | A-01 through A-45 |
| **Description** | Login/register page with GitHub OAuth |

### AuthCallback.jsx
| Property | Value |
|----------|-------|
| **File** | `frontend/src/components/AuthCallback.jsx` |
| **Elements** | (OAuth callback handler) |
| **Description** | GitHub OAuth callback handler |

---

## Server Management

### ServerManager.jsx
| Property | Value |
|----------|-------|
| **File** | `frontend/src/components/ServerManager.jsx` |
| **Elements** | (VPS management) |
| **Description** | VPS server list and management |

### ServerConnect.jsx
| Property | Value |
|----------|-------|
| **File** | `frontend/src/components/ServerConnect.jsx` |
| **Elements** | (SSH connection form) |
| **Description** | SSH server connection form |

---

## Codespaces

### CodespacesManager.jsx
| Property | Value |
|----------|-------|
| **File** | `frontend/src/components/CodespacesManager.jsx` |
| **Elements** | (GitHub Codespaces) |
| **Description** | GitHub Codespaces management |

---

## Utilities

### VoiceInput.jsx
| Property | Value |
|----------|-------|
| **File** | `frontend/src/components/VoiceInput.jsx` |
| **Elements** | (voice input button) |
| **Description** | Whisper-powered voice input |

### ProjectSidebar.jsx
| Property | Value |
|----------|-------|
| **File** | `frontend/src/components/ProjectSidebar.jsx` |
| **Elements** | (legacy, may be deprecated) |
| **Description** | Project sidebar (older implementation) |

---

## Component Hierarchy

```
App.jsx
├── HeaderNavigation (G-01 to G-09)
├── AuthPage (A-*)
├── Dashboard
│   └── DashboardSidebar (D-*)
├── Workspace (W-01, W-02, W-30)
│   ├── WorkspaceTopBar (W-03 to W-29)
│   │   └── ModelSelector (W-11 to W-28)
│   ├── WorkspaceIconSidebar (W-31 to W-37)
│   ├── WorkspaceFileExplorer (W-38 to W-51)
│   ├── Chat (W-53 to W-70)
│   ├── PreviewPanel (W-71 to W-85)
│   ├── ServerManager
│   ├── CodespacesManager
│   ├── Terminal
│   ├── FileBrowser
│   └── CodeEditor
├── Settings
│   └── SettingsModal (S-*)
└── CreateProject (CP-*)
```

---

## CSS Files

| File | Contains |
|------|----------|
| `frontend/src/index.css` | CSS variables, workspace-icon-bar, file-explorer, scrollbar styles |
| `frontend/src/App.css` | (minimal, mostly using Tailwind) |

---

## Last Updated
2026-01-24 - Session 32
