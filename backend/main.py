"""
HubLLM Backend - FastAPI Application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os

from routers import chat, projects, voice, ssh, github, servers, auth, ai, stats, terminal, files, settings
from models import init_db, close_db
from services.vps_connection import vps_manager


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting HubLLM API...")
    await init_db()
    # INFRA-03B: Idle checker defaults to OFF — user enables via Settings toggle
    yield
    # Shutdown
    print("Shutting down HubLLM API...")
    vps_manager.stop_idle_checker()
    await vps_manager.close_all()
    await close_db()


app = FastAPI(
    title="HubLLM API",
    description="Multi-model AI routing with voice support and user authentication",
    version="0.2.0",
    lifespan=lifespan
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",
        os.getenv("FRONTEND_URL", "")
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(projects.router, prefix="/api/projects", tags=["projects"])
app.include_router(voice.router, prefix="/api/voice", tags=["voice"])
app.include_router(ssh.router, prefix="/api/ssh", tags=["ssh"])
app.include_router(github.router, prefix="/api/github", tags=["github"])
app.include_router(servers.router, prefix="/api/servers", tags=["servers"])
app.include_router(ai.router, prefix="/api/ai", tags=["ai"])
app.include_router(stats.router, prefix="/api/stats", tags=["stats"])
app.include_router(terminal.router, prefix="/api/terminal", tags=["terminal"])
app.include_router(files.router, prefix="/api/files", tags=["files"])
app.include_router(settings.router, prefix="/api/settings", tags=["settings"])


@app.get("/")
async def root():
    return {"status": "ok", "service": "hubllm", "version": "0.2.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
