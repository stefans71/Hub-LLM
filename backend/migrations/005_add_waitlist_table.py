"""
Migration 005: Create waitlist_signups table for VibeShip.cloud beta waitlist.
Works on both SQLite and Postgres.
"""
from sqlalchemy import text


def migrate(engine):
    with engine.connect() as conn:
        # Check if table already exists
        dialect = engine.dialect.name
        if dialect == "postgresql":
            result = conn.execute(text(
                "SELECT 1 FROM information_schema.tables "
                "WHERE table_schema = 'public' AND table_name = 'waitlist_signups'"
            ))
        else:
            result = conn.execute(text(
                "SELECT 1 FROM sqlite_master WHERE type='table' AND name='waitlist_signups'"
            ))

        if result.fetchone():
            print("  waitlist_signups table already exists, skipping")
            return

        # Create the table
        if dialect == "postgresql":
            conn.execute(text("""
                CREATE TABLE waitlist_signups (
                    id VARCHAR(64) PRIMARY KEY,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    source VARCHAR(64) DEFAULT 'setup_wizard',
                    created_at TIMESTAMP DEFAULT NOW()
                )
            """))
            conn.execute(text(
                "CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist_signups(email)"
            ))
        else:
            conn.execute(text("""
                CREATE TABLE waitlist_signups (
                    id VARCHAR(64) PRIMARY KEY,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    source VARCHAR(64) DEFAULT 'setup_wizard',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """))
            conn.execute(text(
                "CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist_signups(email)"
            ))

        conn.commit()
        print("  Created waitlist_signups table")
