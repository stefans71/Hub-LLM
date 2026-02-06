# Workspace Terminal/Server Component Map

**Created**: 2026-01-25 (AUDIT-01)

## Component Hierarchy

```
Workspace.jsx
├── WorkspaceTopBar
│   └── VPS connection toggle (handleConnectionToggle)
│       → Reads from localStorage (vps_servers)
│       → Syncs to backend API
│       → Connects/disconnects via /api/ssh/servers/{id}/connect
│
├── Tab Bar (chat | servers | codespaces)
│
├── ServerManager.jsx (visible on "servers" tab)
│   ├── Reads VPS servers from localStorage (vps_servers)
│   ├── Shows project's linked server (project.vps_server_id)
│   ├── Terminal button → onOpenTerminal(server) → opens Right Panel Terminal
│   ├── Files button → onOpenFiles(server) → opens Right Panel FileBrowser
│   └── Connect button → syncs to backend → calls /api/ssh/servers/{id}/connect
│
├── Right Panel (conditional, when activeServer exists)
│   ├── Terminal.jsx (different from WorkspaceTerminal!)
│   │   └── Old terminal component (used in right panel)
│   └── FileBrowser.jsx
│
└── LLMDevPanel.jsx (ALWAYS at bottom, collapsible)
    ├── Uses linkedServerId || project.vps_server_id
    ├── Has OWN file explorer (dev-file-explorer)
    └── WorkspaceTerminal.jsx (xterm.js + WebSocket)
        └── Connects to /api/terminal/ws?serverId={id}
```

## Two Terminal Paths (DUPLICATION)

### Path 1: ServerManager → Right Panel Terminal
```
ServerManager.jsx:241-252
  ├── onOpenTerminal?.(linkedServer)
  ↓
Workspace.jsx:194-202 (openTerminal function)
  ├── setTerminals([...terminals, server])
  ├── setActiveServer(server)
  ├── setRightPanelContent('terminal')
  ├── setShowRightPanel(true)
  ↓
Workspace.jsx:458-463
  └── <Terminal serverId={activeServer.id} />
      (This is frontend/src/components/Terminal.jsx)
```

### Path 2: LLMDevPanel → WorkspaceTerminal
```
LLMDevPanel.jsx:853-857
  └── <WorkspaceTerminal
        projectId={project?.id}
        serverId={serverId}  // = linkedServerId || project.vps_server_id
      />
      ↓
WorkspaceTerminal.jsx
  ├── Creates WebSocket to /api/terminal/ws?serverId={id}
  ├── Uses xterm.js for real terminal
  └── Handles resize, reconnect
```

## Connection State Flow

```
localStorage (vps_servers)
       │
       ├──→ ServerManager reads + displays
       ├──→ LLMDevPanel reads for server info
       └──→ Workspace reads for handleConnectionToggle

Backend (servers_db in ssh.py)
       │
       ├──→ /api/ssh/servers - list all
       ├──→ /api/ssh/servers/{id}/connect - SSH connect
       ├──→ /api/ssh/servers/{id}/disconnect
       └──→ /api/terminal/ws - WebSocket terminal

Sync: Frontend syncs localStorage → Backend on connect
```

## Key State Variables

### Workspace.jsx
- `isConnected` - VPS connection status (for top bar)
- `linkedServerId` - Currently linked server (may differ from project.vps_server_id)
- `activeServer` - Server for right panel terminal/files
- `terminals[]` - Open terminal instances for right panel
- `showRightPanel` - Whether right panel is visible
- `rightPanelContent` - 'terminal' | 'files' | 'editor'

### ServerManager.jsx
- `linkedServer` - The project's linked VPS server object
- `globalServers` - All VPS servers from localStorage
- `connecting` - Loading state for connection

### LLMDevPanel.jsx
- `serverId` - linkedServerId || project?.vps_server_id
- `serverInfo` - Server details fetched from localStorage/API
- `isExpanded` - Panel expanded state
- `panelHeight` - Height when expanded

### WorkspaceTerminal.jsx
- `status` - 'disconnected' | 'connecting' | 'connected' | 'error'
- `wsRef` - WebSocket reference
- `xtermRef` - xterm.js Terminal instance

## Identified Issues for CLEANUP-01

1. **Duplicate Terminal UI**: ServerManager has terminal/files buttons that open a SEPARATE terminal in the right panel. LLMDevPanel has its own terminal that's always present.

2. **Two Terminal Components**:
   - `Terminal.jsx` - Used in right panel (simpler)
   - `WorkspaceTerminal.jsx` - Used in LLMDevPanel (xterm.js + WebSocket)

3. **ServerManager buttons (lines 240-252)**: These terminal/files buttons should be removed per CLEANUP-01. The LLMDevPanel terminal is the canonical one.

## Component Responsibility

| Component | Should Own |
|-----------|------------|
| WorkspaceTopBar | VPS connect/disconnect toggle, status display |
| ServerManager | Link/unlink VPS to project, show server info |
| LLMDevPanel | Terminal, file explorer, Docker, logs |
| WorkspaceTerminal | xterm.js WebSocket terminal |

## Files to Modify for CLEANUP-01

1. `ServerManager.jsx` - Remove terminal/files buttons (lines 240-252)
2. Potentially remove import of `Terminal` icon if unused after cleanup
