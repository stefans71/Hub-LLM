"""
SQLAlchemy Database Models for HubLLM

Uses SQLite for simplicity. Tables:
- vps_servers: VPS server configurations
- projects: Development projects
- chat_messages: Chat history per project
- user_settings: Key-value user settings
"""
from datetime import datetime
from typing import Optional
import os
import json
import re

from sqlalchemy import (
    Column, String, Text, DateTime, Boolean, Integer, ForeignKey,
    create_engine, Enum as SQLEnum
)
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase, relationship, Mapped, mapped_column
import enum

# Database URL - SQLite for simplicity
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./hubllm.db")

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
    """Create all tables"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print(f"Database initialized: {DATABASE_URL}")


async def close_db():
    """Close database engine"""
    await engine.dispose()
    print("Database connection closed")


def get_session() -> AsyncSession:
    """Get a database session context manager"""
    return async_session()


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
