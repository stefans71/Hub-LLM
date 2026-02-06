"""
Migration 002: Convert UUID columns to VARCHAR(64) in Postgres.

The production DB was originally created by an older code version that used UUID column types.
The current ORM uses String(64)/VARCHAR(64). This migration converts any remaining UUID columns
so the ORM queries work correctly (avoids 'operator does not exist: uuid = character varying').

Only applies to Postgres — SQLite has no UUID type and is skipped entirely.
Idempotent: checks column types before altering.
"""
from sqlalchemy import text, inspect


# ORM tables and their id/FK columns that should be VARCHAR(64)
_COLUMNS_TO_CHECK = {
    "users": ["id"],
    "projects": ["id", "vps_server_id"],
    "vps_servers": ["id"],
    "chat_messages": ["project_id"],
    "user_settings": [],
}

# FK constraints that may reference UUID columns (Postgres auto-names them)
_FK_CONSTRAINTS = [
    ("projects", "projects_vps_server_id_fkey"),
    ("chat_messages", "chat_messages_project_id_fkey"),
]


def migrate(engine):
    dialect = engine.dialect.name
    if dialect != "postgresql":
        print("  [002] Not Postgres (SQLite), skipping UUID fix")
        return

    inspector = inspect(engine)
    existing_tables = set(inspector.get_table_names())
    columns_fixed = 0

    # Check which columns are still UUID type
    cols_to_fix = []
    for table, columns in _COLUMNS_TO_CHECK.items():
        if table not in existing_tables:
            continue
        col_info = {c["name"]: c for c in inspector.get_columns(table)}
        for col_name in columns:
            if col_name not in col_info:
                continue
            col_type = str(col_info[col_name]["type"]).upper()
            if "UUID" in col_type:
                cols_to_fix.append((table, col_name))

    if not cols_to_fix:
        print("  [002] No UUID columns found, skipping")
        return

    print(f"  [002] Found UUID columns to fix: {cols_to_fix}")

    with engine.begin() as conn:
        # Drop FK constraints first (they reference UUID types)
        for table, constraint in _FK_CONSTRAINTS:
            if table in existing_tables:
                try:
                    conn.execute(text(
                        f"ALTER TABLE {table} DROP CONSTRAINT IF EXISTS {constraint}"
                    ))
                except Exception:
                    pass  # Constraint may not exist

        # Convert UUID columns to VARCHAR(64)
        for table, col_name in cols_to_fix:
            conn.execute(text(
                f"ALTER TABLE {table} ALTER COLUMN {col_name} "
                f"TYPE VARCHAR(64) USING {col_name}::varchar"
            ))
            columns_fixed += 1
            print(f"  [002] Converted {table}.{col_name} from UUID to VARCHAR(64)")

    print(f"  [002] Fixed {columns_fixed} UUID column(s). FKs will be recreated by create_all on next startup.")
