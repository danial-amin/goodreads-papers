"""
Database migration script for v2 features:
- New user fields (user_type, primary_goal, weekly_paper_goal, etc.)
- New interaction statuses (skimmed, studied, implemented, cited)
"""

from sqlalchemy import text
from database import engine


def migrate_v2():
    """Add new columns for v2 features"""
    migrations = [
        # User onboarding fields
        "ALTER TABLE users ADD COLUMN user_type VARCHAR DEFAULT 'other'",
        "ALTER TABLE users ADD COLUMN primary_goal VARCHAR DEFAULT 'build_reading_habit'",
        "ALTER TABLE users ADD COLUMN weekly_paper_goal INTEGER DEFAULT 3",
        "ALTER TABLE users ADD COLUMN experience_level VARCHAR",
        "ALTER TABLE users ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE",
        # User streak tracking
        "ALTER TABLE users ADD COLUMN current_streak INTEGER DEFAULT 0",
        "ALTER TABLE users ADD COLUMN longest_streak INTEGER DEFAULT 0",
        "ALTER TABLE users ADD COLUMN last_reading_week VARCHAR",
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
    migrate_v2()
