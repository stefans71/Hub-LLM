# HubLLM

**Web-based AI development environment with voice input, multi-model routing, SSH terminal, and file browser**

## What This Is

A browser-based workspace where you can:
- Talk to AI models using your voice
- Route queries to any model via OpenRouter (or use your Claude Max subscription directly)
- SSH into your VPS or Codespaces
- Browse and edit files remotely
- Manage multiple projects in one place
- Access from anywhere (phone, laptop, tablet)

## Quick Start

```bash
# Clone the repo
git clone https://github.com/yourusername/hubllm.git
cd hubllm

# Copy environment file
cp .env.example .env
# Edit .env with your API keys

# Run with Docker
docker-compose up

# Or run locally
cd backend && pip install -r requirements.txt && uvicorn main:app --reload
cd frontend && npm install && npm run dev
```

Open http://localhost:5173

## Tech Stack

- **Backend**: Python + FastAPI + asyncssh
- **Frontend**: React + Vite + TailwindCSS + xterm.js
- **Database**: PostgreSQL (in-memory for MVP)
- **Cache**: Redis
- **Auth**: Better-Auth (self-hosted) or Auth0
- **AI Routing**: OpenRouter API

## Project Structure

```
hubllm/
├── backend/
│   ├── main.py              # FastAPI entry point
│   ├── routers/
│   │   ├── chat.py          # AI chat endpoints
│   │   ├── projects.py      # Project management
│   │   ├── ssh.py           # SSH & file operations
│   │   ├── github.py        # GitHub Codespaces API
│   │   └── voice.py         # Voice transcription
│   └── services/
│       ├── openrouter.py    # OpenRouter integration
│       ├── ssh.py           # SSH/SFTP service
│       ├── github.py        # GitHub API service
│       └── database.py      # Database service
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   └── components/
│   │       ├── Chat.jsx              # AI chat interface
│   │       ├── VoiceInput.jsx        # Voice input (Web Speech API)
│   │       ├── Terminal.jsx          # xterm.js terminal
│   │       ├── FileBrowser.jsx       # SFTP file browser
│   │       ├── CodeEditor.jsx        # Monaco code editor
│   │       ├── ServerManager.jsx     # SSH server management
│   │       ├── CodespacesManager.jsx # GitHub Codespaces
│   │       ├── Workspace.jsx         # Main workspace with tabs
│   │       ├── ProjectSidebar.jsx    # Project navigation
│   │       ├── ModelSelector.jsx     # AI model picker
│   │       └── SettingsModal.jsx     # API key settings
│   └── package.json
├── docker-compose.yml
└── .env.example
```

## Features

### ✅ MVP Complete
- [x] Multi-model AI chat (OpenRouter + direct Claude)
- [x] Voice input (Web Speech API - free)
- [x] Project management
- [x] SSH terminal (xterm.js + asyncssh)
- [x] File browser (SFTP)
- [x] Code editor with syntax highlighting (Monaco)
- [x] Server connection management
- [x] GitHub Codespaces integration

### ✅ Authentication & Database (Just Added)
- [x] User authentication (JWT tokens)
- [x] OAuth support (GitHub, Google)
- [x] Email verification flow
- [x] Password reset flow
- [x] PostgreSQL persistence (SQLAlchemy async)
- [x] Database models (User, Project, ChatMessage, APIKey, Server)

### 🚧 Coming Soon
- [ ] Frontend auth UI (login/signup forms)
- [ ] Protected routes in frontend
- [ ] Direct SSH to Codespaces
- [ ] Split-pane layout improvements

## Development

Using Claude Code:
```bash
cd hubllm
claude  # Opens Claude Code CLI in this directory
```

Using GitHub Codespaces:
1. Push this repo to GitHub
2. Open in Codespaces
3. Run `docker-compose up`

## License

MIT
