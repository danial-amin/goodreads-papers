from sqlalchemy.orm import Session
from typing import List
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from models import Paper, UserPaperInteraction, InteractionStatus
from schemas import RecommendationResponse, PaperResponse

class RecommendationEngine:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(max_features=100, stop_words='english')
        self.paper_vectors = None
        self.paper_ids = None
    
    def _build_paper_vectors(self, db: Session):
        """Build TF-IDF vectors for all papers"""
        papers = db.query(Paper).all()
        if not papers:
            return
        
        # Combine title, abstract, and keywords for each paper
        texts = []
        paper_ids = []
        
        for paper in papers:
            text = f"{paper.title} {paper.abstract}"
            if paper.keywords:
                text += f" {paper.keywords}"
            texts.append(text)
            paper_ids.append(paper.id)
        
        if texts:
            self.paper_vectors = self.vectorizer.fit_transform(texts)
            self.paper_ids = np.array(paper_ids)
    
    def _build_paper_vectors(self, db: Session):
        """Build TF-IDF vectors for all papers"""
        papers = db.query(Paper).all()
        if not papers:
            return
        
        # Combine title, abstract, and keywords for each paper
        texts = []
        paper_ids = []
        
        for paper in papers:
            text = f"{paper.title} {paper.abstract}"
            if paper.keywords:
                text += f" {paper.keywords}"
            texts.append(text)
            paper_ids.append(paper.id)
        
        if texts:
            self.paper_vectors = self.vectorizer.fit_transform(texts)
            self.paper_ids = np.array(paper_ids)
    
    def get_recommendations(
        self,
        user_id: int,
        db: Session,
        limit: int = 10
    ) -> List[RecommendationResponse]:
        """Get personalized recommendations for a user"""
        # Build vectors if not already built
        if self.paper_vectors is None or self.paper_ids is None:
            self._build_paper_vectors(db)
        
        if self.paper_vectors is None or self.paper_ids is None:
            # If no papers, return empty or popular papers
            papers = db.query(Paper).order_by(
                Paper.citation_count.desc()
            ).limit(limit).all()
            return [
                RecommendationResponse(
                    paper=PaperResponse.model_validate(p),
                    score=0.0,
                    reason="Popular paper"
                )
                for p in papers
            ]
        
        # Get user's interactions
        interactions = db.query(UserPaperInteraction).filter(
            UserPaperInteraction.user_id == user_id
        ).all()
        
        if not interactions:
            # If no interactions, return popular papers
            papers = db.query(Paper).order_by(
                Paper.citation_count.desc()
            ).limit(limit).all()
            return [
                RecommendationResponse(
                    paper=PaperResponse.model_validate(p),
                    score=0.0,
                    reason="Popular paper"
                )
                for p in papers
            ]
        
        # Get papers user has already interacted with
        interacted_paper_ids = {interaction.paper_id for interaction in interactions}
        
        # Build user profile vector from their interactions
        user_vector = None
        for interaction in interactions:
            if interaction.paper_id in self.paper_ids:
                idx = np.where(self.paper_ids == interaction.paper_id)[0][0]
                paper_vector = self.paper_vectors[idx]
                
                # Weight by rating if available
                weight = interaction.rating if interaction.rating else 1.0
                if interaction.status == InteractionStatus.FAVORITE:
                    weight *= 2.0
                elif interaction.status == InteractionStatus.READ:
                    weight *= 1.5
                
                if user_vector is None:
                    user_vector = paper_vector * weight
                else:
                    user_vector += paper_vector * weight
        
        if user_vector is None:
            return []
        
        # Normalize user vector
        norm = np.linalg.norm(user_vector.toarray())
        if norm > 0:
            user_vector = user_vector / norm
        
        # Calculate similarity with all papers
        similarities = cosine_similarity(user_vector, self.paper_vectors)[0]
        
        # Get top recommendations excluding already interacted papers
        recommendations = []
        for idx, paper_id in enumerate(self.paper_ids):
            if paper_id not in interacted_paper_ids:
                score = float(similarities[idx])
                recommendations.append((paper_id, score))
        
        # Sort by score and get top N
        recommendations.sort(key=lambda x: x[1], reverse=True)
        top_recommendations = recommendations[:limit]
        
        # Fetch papers and create response
        result = []
        for paper_id, score in top_recommendations:
            paper = db.query(Paper).filter(Paper.id == paper_id).first()
            if paper:
                reason = "Similar to papers you've read"
                if score > 0.3:
                    reason = "Highly relevant to your interests"
                elif score > 0.1:
                    reason = "Related to your reading history"
                
                result.append(
                    RecommendationResponse(
                        paper=PaperResponse.model_validate(paper),
                        score=score,
                        reason=reason
                    )
                )
        
        return result
    
    def get_similar_papers(
        self,
        paper_id: int,
        db: Session,
        limit: int = 5
    ) -> List[PaperResponse]:
        """Get papers similar to a given paper"""
        if self.paper_vectors is None:
            self._build_paper_vectors(db)
        
        if self.paper_vectors is None:
            return []
        
        # Find the paper in our vectors
        if paper_id not in self.paper_ids:
            return []
        
        idx = np.where(self.paper_ids == paper_id)[0][0]
        paper_vector = self.paper_vectors[idx]
        
        # Calculate similarity with all papers
        similarities = cosine_similarity(paper_vector, self.paper_vectors)[0]
        
        # Get top similar papers (excluding the paper itself)
        recommendations = []
        for i, pid in enumerate(self.paper_ids):
            if pid != paper_id:
                recommendations.append((pid, float(similarities[i])))
        
        recommendations.sort(key=lambda x: x[1], reverse=True)
        top_similar = recommendations[:limit]
        
        # Fetch papers
        result = []
        for pid, _ in top_similar:
            paper = db.query(Paper).filter(Paper.id == pid).first()
            if paper:
                result.append(PaperResponse.model_validate(paper))
        
        return result
