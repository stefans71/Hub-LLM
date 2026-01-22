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

## Prerequisites

Before starting, make sure you have installed:
- **Docker Desktop** (for the database)
- **Python 3.10+** 
- **Node.js 18+** and npm
- **Git**

## Setup Instructions

### 1. Clone and Configure

```bash
git clone https://github.com/stefans71/Hub-LLM.git
cd Hub-LLM

# Copy environment file and add your API keys
cp .env.example .env
```

Edit `.env` with your API keys:
```env
OPENROUTER_API_KEY=your_openrouter_key
GITHUB_CLIENT_ID=your_github_oauth_id
GITHUB_CLIENT_SECRET=your_github_oauth_secret
GOOGLE_CLIENT_ID=your_google_oauth_id
GOOGLE_CLIENT_SECRET=your_google_oauth_secret
DATABASE_URL=postgresql://hubllm:hubllm@localhost:5432/hubllm
SECRET_KEY=your_random_secret_key
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
```

### 2. Start Database (Docker)

```bash
docker compose up db -d
```

### 3. Backend Setup

**Linux/WSL:**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

**Windows PowerShell:**
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs at: http://localhost:8000

### 4. Frontend Setup (New Terminal)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: http://localhost:5173

## Quick Start (Docker - Full Stack)

If you prefer to run everything in Docker:

```bash
docker-compose up
```

Open http://localhost:5173

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Python, FastAPI, asyncssh, SQLAlchemy |
| **Frontend** | React, Vite, TailwindCSS, xterm.js, Monaco Editor |
| **Database** | PostgreSQL |
| **Cache** | Redis |
| **Auth** | JWT + OAuth (GitHub, Google) |
| **AI Routing** | OpenRouter API + Direct Claude API |

## Project Structure

```
Hub-LLM/
├── backend/
│   ├── main.py              # FastAPI entry point
│   ├── requirements.txt     # Python dependencies
│   ├── routers/
│   │   ├── auth.py          # Authentication endpoints
│   │   ├── chat.py          # AI chat endpoints
│   │   ├── projects.py      # Project management
│   │   ├── ssh.py           # SSH & file operations
│   │   ├── github.py        # GitHub Codespaces API
│   │   ├── servers.py       # Server management
│   │   └── voice.py         # Voice transcription
│   ├── services/
│   │   ├── auth.py          # Auth business logic
│   │   ├── openrouter.py    # OpenRouter + Claude integration
│   │   ├── ssh.py           # SSH/SFTP service
│   │   ├── github.py        # GitHub API service
│   │   └── database.py      # Database service
│   └── models/
│       └── __init__.py      # SQLAlchemy models
├── frontend/
│   ├── package.json         # Node dependencies
│   ├── src/
│   │   ├── App.jsx
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx
│   │   └── components/
│   │       ├── AuthPage.jsx          # Login/Signup UI
│   │       ├── AuthCallback.jsx      # OAuth callback handler
│   │       ├── Chat.jsx              # AI chat interface
│   │       ├── VoiceInput.jsx        # Voice input (Web Speech API)
│   │       ├── Terminal.jsx          # xterm.js terminal
│   │       ├── FileBrowser.jsx       # SFTP file browser
│   │       ├── CodeEditor.jsx        # Monaco code editor
│   │       ├── ServerManager.jsx     # SSH server management
│   │       ├── ServerConnect.jsx     # Server connection UI
│   │       ├── CodespacesManager.jsx # GitHub Codespaces
│   │       ├── Workspace.jsx         # Main workspace with tabs
│   │       ├── ProjectSidebar.jsx    # Project navigation
│   │       ├── ModelSelector.jsx     # AI model picker
│   │       └── SettingsModal.jsx     # API key settings
│   └── vite.config.js
├── docker-compose.yml
├── .env.example
└── README.md
```

## Features

### ✅ Core Features (Complete)
- [x] Multi-model AI chat (OpenRouter + direct Claude)
- [x] Streaming responses (Server-Sent Events)
- [x] Voice input (Web Speech API - free, no API key needed)
- [x] Project management with sidebar navigation
- [x] SSH terminal (xterm.js + asyncssh)
- [x] SFTP file browser
- [x] Code editor with syntax highlighting (Monaco)
- [x] Server connection management
- [x] GitHub Codespaces integration
- [x] Model selector (switch between AI models)
- [x] Settings modal for API keys
- [x] BYOK (Bring Your Own Key) - keys sent via headers, not stored

### ✅ Authentication & Database (Complete)
- [x] User registration with email/password
- [x] JWT access + refresh tokens
- [x] OAuth support (GitHub, Google)
- [x] Email verification flow (endpoint ready, email sending TODO)
- [x] Password reset flow (endpoint ready, email sending TODO)
- [x] PostgreSQL persistence (SQLAlchemy async)
- [x] Database models (User, Project, ChatMessage, APIKey, Server)
- [x] Auth context for frontend state management
- [x] Login/Signup UI components
- [x] OAuth callback handling

### 🚧 In Progress
- [ ] Protected routes in frontend
- [ ] Direct SSH to Codespaces
- [ ] Split-pane layout improvements
- [ ] Chat history persistence
- [ ] File upload/download
- [ ] Email sending for verification/reset

### 📋 Planned
- [ ] VPS deployment with nginx reverse proxy
- [ ] HTTPS/SSL setup
- [ ] Multi-user support
- [ ] Shared projects/collaboration
- [ ] Custom model configurations

## API Endpoints

Base URL: `http://localhost:8000`

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Service status |
| GET | `/health` | Health check |

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login with email/password |
| POST | `/api/auth/logout` | Logout (client-side) |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/me` | Get current user (requires auth) |
| POST | `/api/auth/verify-email` | Verify email with token |
| POST | `/api/auth/resend-verification` | Resend verification email |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password with token |
| GET | `/api/auth/oauth/github` | GitHub OAuth redirect |
| GET | `/api/auth/oauth/github/callback` | GitHub OAuth callback |
| GET | `/api/auth/oauth/google` | Google OAuth redirect |
| GET | `/api/auth/oauth/google/callback` | Google OAuth callback |
| GET | `/api/auth/oauth/providers` | List available OAuth providers |

### Chat (`/api/chat`)
| Method | Endpoint | Description | Headers |
|--------|----------|-------------|---------|
| POST | `/api/chat/completions` | Send chat message | `X-OpenRouter-Key` or `X-Claude-Key` |
| GET | `/api/chat/models` | List available models | `X-OpenRouter-Key` |
| GET | `/api/chat/usage` | Get API usage/credits | `X-OpenRouter-Key` |

**Chat Request Body:**
```json
{
  "messages": [
    {"role": "user", "content": "Hello!"}
  ],
  "model": "anthropic/claude-sonnet-4",
  "temperature": 0.7,
  "max_tokens": 4096,
  "stream": true,
  "provider": "openrouter"
}
```

### Projects (`/api/projects`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List projects |
| POST | `/api/projects` | Create project |
| PUT | `/api/projects/{id}` | Update project |
| DELETE | `/api/projects/{id}` | Delete project |

### SSH/Servers (`/api/ssh`, `/api/servers`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/servers` | List saved servers |
| POST | `/api/servers` | Add server |
| POST | `/api/ssh/connect` | Connect to server |
| GET | `/api/ssh/files` | List directory |
| GET | `/api/ssh/file` | Read file |
| PUT | `/api/ssh/file` | Write file |

### GitHub (`/api/github`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/github/codespaces` | List Codespaces |
| POST | `/api/github/codespaces` | Create Codespace |

### Voice (`/api/voice`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/voice/transcribe` | Transcribe audio |

## Troubleshooting

### "Port already in use"
```bash
# Kill process on port 8000 (backend)
lsof -ti:8000 | xargs kill -9

# Kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9
```

### Database connection issues
```bash
# Check if PostgreSQL container is running
docker ps

# Restart the database
docker compose down
docker compose up db -d
```

### Frontend not connecting to backend
Make sure both are running and check `vite.config.js` has the correct proxy settings.

### OAuth not working
1. Make sure `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are set in `.env`
2. Check callback URL matches: `http://localhost:8000/api/auth/oauth/github/callback`
3. Check `/api/auth/oauth/providers` to see which providers are configured

## Development Notes

### Running in WSL
The project works well in WSL2. Run the backend in WSL and frontend in either WSL or Windows PowerShell.

### Hot Reload
- Backend: Enabled with `--reload` flag
- Frontend: Enabled by default with Vite

### API Key Security (BYOK)
API keys are passed via headers (`X-OpenRouter-Key`, `X-Claude-Key`) and are **not stored** on the server. This is the "Bring Your Own Key" model - users manage their own API keys.

## VPS Deployment (Coming Soon)

Instructions for deploying to a VPS with:
- nginx reverse proxy
- SSL certificates (Let's Encrypt)
- systemd services
- PostgreSQL production setup

## License

MIT

---

**Version:** 0.2.0  
**Repository:** https://github.com/stefans71/Hub-LLM
