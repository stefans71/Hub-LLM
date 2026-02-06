"""
Migration 001: Add setup_completed column to users table.

SQLAlchemy create_all() only creates NEW tables — it never adds columns
to existing tables. In Postgres production, users table was created before
setup_completed was added to the ORM model.

Works on both SQLite and Postgres.
"""
from sqlalchemy import text, inspect


def migrate(engine):
    inspector = inspect(engine)
    if "users" not in inspector.get_table_names():
        print("  [001] users table doesn't exist yet, skipping (create_all will handle it)")
        return

    columns = {col["name"] for col in inspector.get_columns("users")}
    if "setup_completed" in columns:
        print("  [001] setup_completed column already exists, skipping")
        return

    with engine.begin() as conn:
        conn.execute(text(
            "ALTER TABLE users ADD COLUMN setup_completed BOOLEAN DEFAULT false"
        ))
    print("  [001] Added setup_completed column to users table")
