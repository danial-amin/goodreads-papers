"""
Auto-fetch new articles from external sources
"""
import asyncio
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Paper
from paper_fetchers import PaperFetcherService, ArxivFetcher
from smart_tagger import SmartTagger
import time

class AutoFetcher:
    """Automatically fetch new articles"""
    
    def __init__(self):
        self.smart_tagger = SmartTagger()
        self.last_fetch_time = None
    
    def fetch_and_save_new_papers(self, db: Session, max_papers: int = 30):
        """
        Fetch new papers from external sources and save to database
        
        Args:
            db: Database session
            max_papers: Maximum number of papers to fetch
        """
        try:
            print(f"[AutoFetch] Starting to fetch new papers at {datetime.now()}")
            
            # Fetch recent papers from arXiv
            arxiv_papers = ArxivFetcher.get_recent(max_results=max_papers)
            
            saved_count = 0
            for paper_data in arxiv_papers:
                # Check if paper already exists (by title)
                existing = db.query(Paper).filter(
                    Paper.title == paper_data.get("title", "")
                ).first()
                
                if existing:
                    continue  # Skip duplicates
                
                # Ensure required fields
                if not paper_data.get("title") or not paper_data.get("abstract"):
                    continue
                
                # Apply smart tagging
                tag_result = self.smart_tagger.tag_paper(
                    title=paper_data.get("title", ""),
                    abstract=paper_data.get("abstract", ""),
                    existing_keywords=paper_data.get("keywords")
                )
                
                # Create paper
                db_paper = Paper(
                    title=paper_data.get("title", ""),
                    authors=paper_data.get("authors", ""),
                    abstract=paper_data.get("abstract", ""),
                    venue=paper_data.get("venue", "arXiv"),
                    year=paper_data.get("year"),
                    url=paper_data.get("url", ""),
                    doi=paper_data.get("doi"),
                    keywords=tag_result["keywords"],
                    smart_tags=tag_result["smart_tags"],
                    domains=", ".join(tag_result["domains"]) if tag_result["domains"] else None,
                    citation_count=paper_data.get("citation_count", 0)
                )
                
                db.add(db_paper)
                saved_count += 1
            
            db.commit()
            self.last_fetch_time = datetime.now()
            print(f"[AutoFetch] Saved {saved_count} new papers")
            return saved_count
            
        except Exception as e:
            print(f"[AutoFetch] Error: {e}")
            db.rollback()
            return 0

# Global instance
auto_fetcher = AutoFetcher()

async def periodic_fetch():
    """Periodically fetch new papers"""
    while True:
        try:
            db = SessionLocal()
            try:
                auto_fetcher.fetch_and_save_new_papers(db, max_papers=30)
            finally:
                db.close()
        except Exception as e:
            print(f"[AutoFetch] Error in periodic fetch: {e}")
        
        # Wait 1 hour before next fetch
        await asyncio.sleep(3600)
