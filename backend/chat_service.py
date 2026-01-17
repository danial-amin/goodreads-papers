"""
Chat service for conversational paper recommendations
"""
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from models import Paper, User, UserPaperInteraction
from recommendation_engine import RecommendationEngine
import os

try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

class ChatService:
    """Service for conversational recommendations"""
    
    def __init__(self, rec_engine: RecommendationEngine):
        self.rec_engine = rec_engine
        self.client = None
        if OPENAI_AVAILABLE:
            api_key = os.getenv("OPENAI_API_KEY")
            if api_key:
                self.client = OpenAI(api_key=api_key)
    
    def get_conversational_recommendations(
        self,
        user_id: int,
        message: str,
        db: Session,
        limit: int = 5
    ) -> Dict:
        """
        Get recommendations based on conversational query
        
        Args:
            user_id: User ID
            message: User's conversational query
            db: Database session
            limit: Number of recommendations
        """
        # Get user's reading history
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return {"error": "User not found"}
        
        interactions = db.query(UserPaperInteraction).filter(
            UserPaperInteraction.user_id == user_id
        ).all()
        
        # Get all papers for context
        all_papers = db.query(Paper).limit(100).all()
        
        # Build context about user's interests
        user_interests = []
        if user.research_interests:
            user_interests.append(f"Research interests: {user.research_interests}")
        
        if interactions:
            read_papers = [i.paper_id for i in interactions if i.status.value == "read"]
            if read_papers:
                user_interests.append(f"Has read {len(read_papers)} papers")
        
        # If OpenAI is available, use it for better understanding
        if self.client:
            try:
                # Get recommendations first
                recommendations = self.rec_engine.get_recommendations(user_id, db, limit * 2)
                
                # Build prompt for OpenAI
                papers_context = "\n".join([
                    f"- {r.paper.title} (Score: {r.score:.2f})" 
                    for r in recommendations[:10]
                ])
                
                prompt = f"""You are a helpful research paper recommendation assistant.

User's context:
{chr(10).join(user_interests)}

Available recommended papers:
{papers_context}

User query: "{message}"

Based on the user's query and the recommended papers above, provide:
1. A natural language response explaining why these papers match their query
2. Select the top {limit} most relevant papers from the recommendations

Respond in a friendly, conversational way. Focus on how the papers relate to what the user is asking about."""

                response = self.client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "You are a helpful research paper recommendation assistant."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.7,
                    max_tokens=500
                )
                
                explanation = response.choices[0].message.content
                
                # Filter recommendations based on the query (simple keyword matching)
                query_lower = message.lower()
                filtered_recs = []
                for rec in recommendations:
                    paper_text = f"{rec.paper.title} {rec.paper.abstract}".lower()
                    if any(word in paper_text for word in query_lower.split() if len(word) > 3):
                        filtered_recs.append(rec)
                
                if not filtered_recs:
                    filtered_recs = recommendations[:limit]
                else:
                    filtered_recs = filtered_recs[:limit]
                
                return {
                    "response": explanation,
                    "recommendations": [
                        {
                            "paper": {
                                "id": r.paper.id,
                                "title": r.paper.title,
                                "authors": r.paper.authors,
                                "abstract": r.paper.abstract,
                                "venue": r.paper.venue,
                                "year": r.paper.year,
                                "url": r.paper.url,
                                "keywords": r.paper.keywords
                            },
                            "score": r.score,
                            "reason": r.reason
                        }
                        for r in filtered_recs
                    ]
                }
            except Exception as e:
                print(f"Error with OpenAI: {e}")
                # Fall through to simple matching
        
        # Simple keyword-based matching if OpenAI not available
        recommendations = self.rec_engine.get_recommendations(user_id, db, limit * 2)
        query_lower = message.lower()
        query_words = [w for w in query_lower.split() if len(w) > 3]
        
        filtered_recs = []
        for rec in recommendations:
            paper_text = f"{rec.paper.title} {rec.paper.abstract} {rec.paper.keywords or ''}".lower()
            matches = sum(1 for word in query_words if word in paper_text)
            if matches > 0:
                filtered_recs.append((rec, matches))
        
        filtered_recs.sort(key=lambda x: x[1], reverse=True)
        top_recs = [r[0] for r in filtered_recs[:limit]] if filtered_recs else recommendations[:limit]
        
        explanation = f"Based on your query '{message}', I found {len(top_recs)} relevant papers that match your interests."
        
        return {
            "response": explanation,
            "recommendations": [
                {
                    "paper": {
                        "id": r.paper.id,
                        "title": r.paper.title,
                        "authors": r.paper.authors,
                        "abstract": r.paper.abstract,
                        "venue": r.paper.venue,
                        "year": r.paper.year,
                        "url": r.paper.url,
                        "keywords": r.paper.keywords
                    },
                    "score": r.score,
                    "reason": r.reason
                }
                for r in top_recs
            ]
        }
