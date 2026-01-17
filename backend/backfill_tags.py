"""
Backfill existing papers with smart tags and domains
"""
from database import SessionLocal
from models import Paper
from smart_tagger import SmartTagger

def backfill_papers():
    """Add smart tags and domains to existing papers"""
    db = SessionLocal()
    try:
        papers = db.query(Paper).all()
        print(f"Found {len(papers)} papers to process")
        
        tagger = SmartTagger()
        updated = 0
        
        for paper in papers:
            # Skip if already has tags
            if paper.smart_tags and paper.domains:
                continue
            
            # Generate tags
            tag_result = tagger.tag_paper(
                title=paper.title,
                abstract=paper.abstract,
                existing_keywords=paper.keywords
            )
            
            # Update paper
            paper.keywords = tag_result["keywords"]
            paper.smart_tags = tag_result["smart_tags"]
            paper.domains = ", ".join(tag_result["domains"]) if tag_result["domains"] else None
            
            updated += 1
            if updated % 10 == 0:
                print(f"Processed {updated} papers...")
        
        db.commit()
        print(f"Successfully updated {updated} papers with smart tags and domains!")
        
    except Exception as e:
        print(f"Error during backfill: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    backfill_papers()
