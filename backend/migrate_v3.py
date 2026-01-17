"""
Database migration script for v3 features:
- Paper reflection questions (what_is_about, is_relevant, where_can_use)
"""

from sqlalchemy import text
from database import engine


def migrate_v3():
    """Add reflection question columns to user_paper_interactions"""
    migrations = [
        "ALTER TABLE user_paper_interactions ADD COLUMN what_is_about TEXT",
        "ALTER TABLE user_paper_interactions ADD COLUMN is_relevant TEXT",
        "ALTER TABLE user_paper_interactions ADD COLUMN where_can_use TEXT",
    ]

    with engine.connect() as conn:
        for migration in migrations:
            try:
                conn.execute(text(migration))
                conn.commit()
                print(f"Success: {migration[:50]}...")
            except Exception as e:
                if "duplicate column" in str(e).lower() or "already exists" in str(e).lower():
                    print(f"Skipped (already exists): {migration[:50]}...")
                else:
                    print(f"Error: {e}")


if __name__ == "__main__":
    migrate_v3()
