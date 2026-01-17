"""
Database migration script to add new columns
"""
import sqlite3
import os
from pathlib import Path

def migrate_database():
    """Add new columns to existing database"""
    # Find database file
    db_path = os.getenv("DATABASE_URL", "sqlite:///./data/paperreads.db")
    if db_path.startswith("sqlite:///"):
        db_path = db_path.replace("sqlite:///", "")
    
    # Handle relative paths
    if not os.path.isabs(db_path):
        db_path = os.path.join("/app", db_path)
    
    # Check if file exists
    if not os.path.exists(db_path):
        print(f"Database file not found at {db_path}, will be created on first run")
        return
    
    print(f"Migrating database at {db_path}")
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check and add columns to papers table
        cursor.execute("PRAGMA table_info(papers)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if 'smart_tags' not in columns:
            print("Adding smart_tags column to papers table...")
            cursor.execute("ALTER TABLE papers ADD COLUMN smart_tags TEXT")
        
        if 'domains' not in columns:
            print("Adding domains column to papers table...")
            cursor.execute("ALTER TABLE papers ADD COLUMN domains TEXT")
        
        # Check and add columns to users table
        cursor.execute("PRAGMA table_info(users)")
        user_columns = [col[1] for col in cursor.fetchall()]
        
        if 'password_hash' not in user_columns:
            print("Adding password_hash column to users table...")
            cursor.execute("ALTER TABLE users ADD COLUMN password_hash TEXT")
        
        if 'preferred_domains' not in user_columns:
            print("Adding preferred_domains column to users table...")
            cursor.execute("ALTER TABLE users ADD COLUMN preferred_domains TEXT")
        
        if 'is_active' not in user_columns:
            print("Adding is_active column to users table...")
            cursor.execute("ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT 1")
        
        conn.commit()
        print("Migration completed successfully!")
        
    except Exception as e:
        print(f"Error during migration: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_database()
