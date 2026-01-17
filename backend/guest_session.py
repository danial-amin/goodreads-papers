"""
Guest session management for anonymous users
"""
from typing import Dict, List, Optional
from sqlalchemy.orm import Session
from models import User, UserPaperInteraction, InteractionStatus
import uuid

class GuestSessionManager:
    """Manage guest sessions and interactions"""
    
    @staticmethod
    def create_guest_session() -> str:
        """Create a new guest session ID"""
        return str(uuid.uuid4())
    
    @staticmethod
    def migrate_guest_interactions(
        db: Session,
        user_id: int,
        guest_interactions: List[Dict]
    ) -> int:
        """
        Migrate guest interactions to user account
        
        Args:
            db: Database session
            user_id: User ID to migrate interactions to
            guest_interactions: List of guest interaction dictionaries
            
        Returns:
            Number of interactions migrated
        """
        migrated = 0
        
        for interaction in guest_interactions:
            paper_id = interaction.get("paper_id")
            if not paper_id:
                continue
            
            # Check if interaction already exists
            existing = db.query(UserPaperInteraction).filter(
                UserPaperInteraction.user_id == user_id,
                UserPaperInteraction.paper_id == paper_id
            ).first()
            
            if existing:
                # Update existing interaction
                existing.rating = interaction.get("rating") or existing.rating
                existing.status = interaction.get("status") or existing.status
                existing.notes = interaction.get("notes") or existing.notes
            else:
                # Create new interaction
                db_interaction = UserPaperInteraction(
                    user_id=user_id,
                    paper_id=paper_id,
                    rating=interaction.get("rating"),
                    status=interaction.get("status", InteractionStatus.WANT_TO_READ),
                    notes=interaction.get("notes")
                )
                db.add(db_interaction)
            
            migrated += 1
        
        db.commit()
        return migrated
