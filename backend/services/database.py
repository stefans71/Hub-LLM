"""
Database Service

MVP: In-memory storage
Production: PostgreSQL with SQLAlchemy or asyncpg
"""
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./hubllm.db")


async def init_db():
    """Initialize database connection"""
    # MVP: Using in-memory dicts in routers
    # TODO: Set up PostgreSQL with:
    # - Users table
    # - Projects table  
    # - Chat history table
    # - API keys table (encrypted)
    print("Database initialized (in-memory mode)")


async def close_db():
    """Close database connection"""
    pass


# Future schema (for reference):
"""
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE projects (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    context TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE chat_messages (
    id UUID PRIMARY KEY,
    project_id UUID REFERENCES projects(id),
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    model VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE api_keys (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    provider VARCHAR(50) NOT NULL,
    key_encrypted TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
"""
