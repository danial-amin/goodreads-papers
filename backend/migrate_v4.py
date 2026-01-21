from sqlalchemy import text
from database import engine

def migrate_v4():
    """Add reading lists and association table"""
    migrations = [
        # Create reading_lists table
        """CREATE TABLE IF NOT EXISTS reading_lists (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name VARCHAR NOT NULL,
            description TEXT,
            is_public BOOLEAN DEFAULT 1,
            is_default BOOLEAN DEFAULT 0,
            default_type VARCHAR,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )""",
        
        # Create reading_list_papers association table
        """CREATE TABLE IF NOT EXISTS reading_list_papers (
            reading_list_id INTEGER NOT NULL,
            paper_id INTEGER NOT NULL,
            PRIMARY KEY (reading_list_id, paper_id),
            FOREIGN KEY (reading_list_id) REFERENCES reading_lists(id) ON DELETE CASCADE,
            FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE
        )""",
        
        # Create indexes
        "CREATE INDEX IF NOT EXISTS idx_reading_lists_user_id ON reading_lists(user_id)",
        "CREATE INDEX IF NOT EXISTS idx_reading_list_papers_list_id ON reading_list_papers(reading_list_id)",
        "CREATE INDEX IF NOT EXISTS idx_reading_list_papers_paper_id ON reading_list_papers(paper_id)",
    ]

    with engine.connect() as conn:
        for migration in migrations:
            try:
                conn.execute(text(migration))
                conn.commit()
                print(f"Success: {migration[:50]}...")
            except Exception as e:
                if "already exists" in str(e).lower() or "duplicate" in str(e).lower():
                    print(f"Skipped (already exists): {migration[:50]}...")
                else:
                    print(f"Error: {e}")

if __name__ == "__main__":
    migrate_v4()
