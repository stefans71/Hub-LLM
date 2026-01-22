"""
SQLAlchemy Database Models for HubLLM

Models:
- User: User accounts with auth
- Project: User projects/workspaces
- ChatMessage: Chat history per project
- APIKey: Encrypted API keys per user
- Server: SSH server credentials per user
"""
from datetime import datetime
from typing import Optional
import uuid

from sqlalchemy import (
    Column, String, Text, DateTime, Boolean, ForeignKey,
    UniqueConstraint, Index, Enum as SQLEnum
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase, relationship
import enum
import os


# Database URL from environment
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://hubllm:hubllm@localhost:5432/hubllm"
)

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


class APIKeyProvider(enum.Enum):
    """API key provider types"""
    OPENROUTER = "openrouter"
    CLAUDE = "claude"
    OPENAI = "openai"
    GITHUB = "github"


class User(Base):
    """User account model"""
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=True)  # Null for OAuth users

    # Profile
    name = Column(String(255), nullable=True)
    avatar_url = Column(String(500), nullable=True)

    # OAuth
    auth_provider = Column(SQLEnum(AuthProvider), default=AuthProvider.LOCAL)
    oauth_id = Column(String(255), nullable=True)  # Provider-specific user ID

    # Email verification
    email_verified = Column(Boolean, default=False)
    verification_token = Column(String(255), nullable=True)
    verification_expires = Column(DateTime, nullable=True)

    # Password reset
    reset_token = Column(String(255), nullable=True)
    reset_expires = Column(DateTime, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)

    # Relationships
    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")
    api_keys = relationship("APIKey", back_populates="user", cascade="all, delete-orphan")
    servers = relationship("Server", back_populates="user", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint('auth_provider', 'oauth_id', name='uq_oauth_user'),
        Index('ix_users_oauth', 'auth_provider', 'oauth_id'),
    )


class Project(Base):
    """Project/workspace model"""
    __tablename__ = "projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    color = Column(String(7), default="#3B82F6")  # Hex color
    context = Column(Text, nullable=True)  # System prompt/context for AI

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="projects")
    messages = relationship("ChatMessage", back_populates="project", cascade="all, delete-orphan")

    __table_args__ = (
        Index('ix_projects_user', 'user_id'),
    )


class ChatMessage(Base):
    """Chat message history model"""
    __tablename__ = "chat_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)

    role = Column(String(20), nullable=False)  # 'user', 'assistant', 'system'
    content = Column(Text, nullable=False)
    model = Column(String(100), nullable=True)  # Model used for this response

    # Token usage tracking
    prompt_tokens = Column(String(20), nullable=True)
    completion_tokens = Column(String(20), nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="messages")

    __table_args__ = (
        Index('ix_chat_messages_project', 'project_id'),
        Index('ix_chat_messages_created', 'created_at'),
    )


class APIKey(Base):
    """Encrypted API key storage model"""
    __tablename__ = "api_keys"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    provider = Column(SQLEnum(APIKeyProvider), nullable=False)
    key_encrypted = Column(Text, nullable=False)  # Encrypted with user's secret
    key_hint = Column(String(20), nullable=True)  # Last 4 chars for display

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="api_keys")

    __table_args__ = (
        UniqueConstraint('user_id', 'provider', name='uq_user_provider'),
        Index('ix_api_keys_user', 'user_id'),
    )


class Server(Base):
    """SSH server credentials model"""
    __tablename__ = "servers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    name = Column(String(255), nullable=False)
    host = Column(String(255), nullable=False)
    port = Column(String(10), default="22")
    username = Column(String(255), nullable=False)

    # Auth (encrypted in production)
    password_encrypted = Column(Text, nullable=True)
    private_key_encrypted = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    last_connected = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="servers")

    __table_args__ = (
        Index('ix_servers_user', 'user_id'),
    )


# Database initialization functions
async def init_db():
    """Create all tables"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Database tables created successfully")


async def close_db():
    """Close database engine"""
    await engine.dispose()


async def get_session() -> AsyncSession:
    """Get a database session"""
    async with async_session() as session:
        yield session


# Export all models
__all__ = [
    "Base",
    "User",
    "Project",
    "ChatMessage",
    "APIKey",
    "Server",
    "AuthProvider",
    "APIKeyProvider",
    "engine",
    "async_session",
    "init_db",
    "close_db",
    "get_session",
]
