"""
SQLAlchemy Database Models for HubLLM

Dual-DB: SQLite (local dev) / Postgres (production via Docker/Coolify).
Tables: users, vps_servers, projects, chat_messages, user_settings
Migrations in backend/migrations/ run on every startup after create_all.
"""
from datetime import datetime
from typing import Optional
from pathlib import Path
import os
import json
import re

from sqlalchemy import (
    Column, String, Text, DateTime, Boolean, Integer, ForeignKey,
    create_engine, text, Enum as SQLEnum
)
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase, relationship, Mapped, mapped_column
import enum

# Database URL - SQLite locally, Postgres in production (Docker/Coolify)
# Use absolute path so DB always lands at backend/hubllm.db regardless of CWD
_DEFAULT_DB_PATH = Path(__file__).resolve().parent.parent / "hubllm.db"
_RAW_DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite+aiosqlite:///{_DEFAULT_DB_PATH}")

IS_POSTGRES = _RAW_DATABASE_URL.startswith("postgresql")

if IS_POSTGRES:
    # Ensure async engine uses asyncpg driver
    # docker-compose sets DATABASE_URL=postgresql://... (no driver suffix)
    if "+asyncpg" not in _RAW_DATABASE_URL:
        DATABASE_URL = _RAW_DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
    else:
        DATABASE_URL = _RAW_DATABASE_URL
    # Sync URL uses psycopg2 (plain postgresql://)
    SYNC_DATABASE_URL = _RAW_DATABASE_URL.replace("+asyncpg", "")
else:
    # SQLite: async uses aiosqlite, sync uses plain sqlite
    DATABASE_URL = _RAW_DATABASE_URL
    SYNC_DATABASE_URL = _RAW_DATABASE_URL.replace("+aiosqlite", "")

# Async engine and session
engine = create_async_engine(DATABASE_URL, echo=False)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    """Base class for all models"""
    pass


class AuthProvider(enum.Enum):
    """Authentication provider types"""
    LOCAL = "local"
    GITHUB = "github"
    GOOGLE = "google"


class User(Base):
    """User account model"""
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: __import__('uuid').uuid4().hex)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Profile
    name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # OAuth
    auth_provider: Mapped[AuthProvider] = mapped_column(SQLEnum(AuthProvider), default=AuthProvider.LOCAL)
    oauth_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Email verification
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    verification_token: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    verification_expires: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Password reset
    reset_token: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    reset_expires: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Setup wizard
    setup_completed: Mapped[bool] = mapped_column(Boolean, default=False)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    last_login: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)


def slugify(name: str) -> str:
    """Convert name to URL-friendly slug"""
    slug = name.lower().strip()
    slug = re.sub(r'[^\w\s-]', '', slug)
    slug = re.sub(r'[\s_-]+', '-', slug)
    slug = slug.strip('-')
    return slug or 'project'


class VPSServer(Base):
    """VPS Server configuration"""
    __tablename__ = "vps_servers"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    host: Mapped[str] = mapped_column(String(255), nullable=False)
    port: Mapped[int] = mapped_column(Integer, default=22)
    username: Mapped[str] = mapped_column(String(255), default="root")
    auth_type: Mapped[str] = mapped_column(String(50), default="key")  # "password" or "key"
    password: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    private_key: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    passphrase: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    last_test_success: Mapped[bool] = mapped_column(Boolean, default=False)
    server_info: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON string
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationship with projects
    projects: Mapped[list["Project"]] = relationship("Project", back_populates="vps_server")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "host": self.host,
            "port": self.port,
            "username": self.username,
            "auth_type": self.auth_type,
            "password": self.password,
            "private_key": self.private_key,
            "passphrase": self.passphrase,
            "lastTestSuccess": self.last_test_success,
            "serverInfo": json.loads(self.server_info) if self.server_info else None,
            "createdAt": self.created_at.isoformat() if self.created_at else None
        }


class Project(Base):
    """Development project"""
    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    brief: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    workspace: Mapped[str] = mapped_column(String(255), default="default")
    color: Mapped[str] = mapped_column(String(7), default="#3B82F6")

    # Connection
    connection_type: Mapped[str] = mapped_column(String(50), default="github")  # "github" or "vps"
    github_repo: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    vps_server_id: Mapped[Optional[str]] = mapped_column(String(64), ForeignKey("vps_servers.id"), nullable=True)

    # Context (JSON string)
    context: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Agents and MCP servers (JSON arrays)
    agent_ids: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    mcp_server_ids: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Status
    status: Mapped[str] = mapped_column(String(50), default="active")

    # Selected model (JSON: {id, name, provider})
    selected_model: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    vps_server: Mapped[Optional["VPSServer"]] = relationship("VPSServer", back_populates="projects")
    messages: Mapped[list["ChatMessage"]] = relationship("ChatMessage", back_populates="project", cascade="all, delete-orphan")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "slug": self.slug,
            "description": self.description,
            "brief": self.brief,
            "workspace": self.workspace,
            "color": self.color,
            "connection_type": self.connection_type,
            "github_repo": self.github_repo,
            "vps_server_id": self.vps_server_id,
            "context": json.loads(self.context) if self.context else None,
            "agent_ids": json.loads(self.agent_ids) if self.agent_ids else [],
            "mcp_server_ids": json.loads(self.mcp_server_ids) if self.mcp_server_ids else [],
            "status": self.status,
            "selected_model": json.loads(self.selected_model) if self.selected_model else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }


class ChatMessage(Base):
    """Chat history for projects"""
    __tablename__ = "chat_messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    project_id: Mapped[str] = mapped_column(String(64), ForeignKey("projects.id"), nullable=False)
    role: Mapped[str] = mapped_column(String(50), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    model: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationship
    project: Mapped["Project"] = relationship("Project", back_populates="messages")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "project_id": self.project_id,
            "role": self.role,
            "content": self.content,
            "model": self.model,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None
        }


class UserSetting(Base):
    """User settings storage"""
    __tablename__ = "user_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    key: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    value: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "key": self.key,
            "value": self.value
        }


# Database initialization functions
async def init_db():
    """Create all tables using sync engine, then run pending migrations."""
    expected_tables = set(Base.metadata.tables.keys())
    print(f"[init_db] Engine: {'Postgres' if IS_POSTGRES else 'SQLite'}")
    print(f"[init_db] Tables to create: {sorted(expected_tables)}")

    # Use sync engine for DDL - most reliable for both SQLite and Postgres
    sync_engine = create_engine(SYNC_DATABASE_URL, echo=False)
    Base.metadata.create_all(sync_engine)
    sync_engine.dispose()

    # Verify tables were actually created (engine-aware query)
    async with engine.begin() as conn:
        if IS_POSTGRES:
            result = await conn.execute(text(
                "SELECT table_name FROM information_schema.tables "
                "WHERE table_schema = 'public'"
            ))
        else:
            result = await conn.execute(text(
                "SELECT name FROM sqlite_master WHERE type='table'"
            ))
        created_tables = {row[0] for row in result.fetchall()}

    missing = expected_tables - created_tables
    if missing:
        raise RuntimeError(f"init_db FAILED: missing tables after create_all: {missing}")

    print(f"[init_db] Database initialized: {DATABASE_URL} (tables: {sorted(created_tables)})")

    # Run pending migrations
    await run_migrations()


async def run_migrations():
    """Run all migration scripts from backend/migrations/ in order."""
    migrations_dir = Path(__file__).resolve().parent.parent / "migrations"
    if not migrations_dir.exists():
        print("[migrations] No migrations directory found, skipping")
        return

    import importlib.util

    migration_files = sorted(
        f for f in migrations_dir.iterdir()
        if f.name.endswith(".py") and not f.name.startswith("_")
    )

    if not migration_files:
        print("[migrations] No migration scripts found")
        return

    sync_engine = create_engine(SYNC_DATABASE_URL, echo=False)
    try:
        for migration_file in migration_files:
            print(f"[migrations] Running {migration_file.name}...")
            spec = importlib.util.spec_from_file_location(
                migration_file.stem, str(migration_file)
            )
            mod = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(mod)
            if hasattr(mod, "migrate"):
                mod.migrate(sync_engine)
                print(f"[migrations] {migration_file.name} complete")
            else:
                print(f"[migrations] {migration_file.name} has no migrate() function, skipped")
    finally:
        sync_engine.dispose()


async def close_db():
    """Close database engine"""
    await engine.dispose()
    print("Database connection closed")


async def get_session():
    """Async generator for FastAPI Depends - yields a database session"""
    async with async_session() as session:
        yield session


# Export all models
__all__ = [
    "Base",
    "User",
    "AuthProvider",
    "VPSServer",
    "Project",
    "ChatMessage",
    "UserSetting",
    "slugify",
    "engine",
    "async_session",
    "init_db",
    "close_db",
    "get_session",
]
