"""
Migration 003: Add missing columns to projects table in Postgres.

SQLAlchemy create_all() only creates NEW tables — it never adds columns
to existing tables. The projects table in production Postgres was created
with only 8 columns (id, user_id, name, description, color, context,
created_at, updated_at) but the ORM model now expects 17 columns.

This migration adds the 10 missing columns idempotently.
Skips on SQLite (create_all already handles new columns via fresh table creation).
"""
from sqlalchemy import text, inspect


# Columns to add: (name, SQL type with default)
# Matches the ORM model in backend/models/__init__.py Project class
_MISSING_COLUMNS = [
    ("slug", "VARCHAR(255) NOT NULL DEFAULT ''"),
    ("brief", "TEXT"),
    ("workspace", "VARCHAR(255) DEFAULT 'default'"),
    ("connection_type", "VARCHAR(50) DEFAULT 'github'"),
    ("github_repo", "VARCHAR(255)"),
    ("vps_server_id", "VARCHAR(64) REFERENCES vps_servers(id)"),
    ("agent_ids", "TEXT"),
    ("mcp_server_ids", "TEXT"),
    ("status", "VARCHAR(50) DEFAULT 'active'"),
    ("selected_model", "TEXT"),
]


def migrate(engine):
    dialect = engine.dialect.name
    if dialect != "postgresql":
        print("  [003] Not Postgres (SQLite), skipping — create_all handles these columns")
        return

    inspector = inspect(engine)
    existing_tables = set(inspector.get_table_names())

    if "projects" not in existing_tables:
        print("  [003] projects table doesn't exist yet, skipping (create_all will handle it)")
        return

    existing_columns = {col["name"] for col in inspector.get_columns("projects")}
    columns_added = 0

    with engine.begin() as conn:
        for col_name, col_def in _MISSING_COLUMNS:
            if col_name in existing_columns:
                print(f"  [003] projects.{col_name} already exists, skipping")
                continue

            # For vps_server_id FK, check that vps_servers table exists first
            if col_name == "vps_server_id" and "vps_servers" not in existing_tables:
                # Add without FK constraint — create_all will add FK later
                col_def = "VARCHAR(64)"
                print(f"  [003] vps_servers table not found, adding vps_server_id without FK")

            conn.execute(text(
                f"ALTER TABLE projects ADD COLUMN {col_name} {col_def}"
            ))
            columns_added += 1
            print(f"  [003] Added projects.{col_name} ({col_def})")

        # Populate slug from name for existing rows (slug is NOT NULL)
        if "slug" not in existing_columns:
            conn.execute(text(
                "UPDATE projects SET slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g')) "
                "WHERE slug = ''"
            ))
            print("  [003] Populated slug column from project names")

    print(f"  [003] Added {columns_added} column(s) to projects table")
