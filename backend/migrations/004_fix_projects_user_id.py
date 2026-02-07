"""
Migration 004: Make user_id nullable on projects table in Postgres.

The original projects table was created with user_id NOT NULL, but the
current ORM model (backend/models/__init__.py) has no user_id field.
INSERTs fail because Postgres requires a value for NOT NULL columns
even if the ORM doesn't send one.

Fix: ALTER COLUMN user_id DROP NOT NULL so existing rows keep their
user_id values but new inserts don't require it.

Postgres-only (SQLite doesn't enforce NOT NULL the same way and
create_all recreates tables fresh).
"""
from sqlalchemy import text, inspect


def migrate(engine):
    dialect = engine.dialect.name
    if dialect != "postgresql":
        print("  [004] Not Postgres (SQLite), skipping user_id fix")
        return

    inspector = inspect(engine)
    if "projects" not in inspector.get_table_names():
        print("  [004] projects table doesn't exist yet, skipping")
        return

    columns = {col["name"]: col for col in inspector.get_columns("projects")}
    if "user_id" not in columns:
        print("  [004] projects.user_id column doesn't exist, skipping")
        return

    if columns["user_id"].get("nullable", True):
        print("  [004] projects.user_id is already nullable, skipping")
        return

    with engine.begin() as conn:
        conn.execute(text(
            "ALTER TABLE projects ALTER COLUMN user_id DROP NOT NULL"
        ))
    print("  [004] Made projects.user_id nullable (DROP NOT NULL)")
