"""
Semantic search using sentence transformers
"""
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from models import Paper
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

# Try to import sentence transformers, but make it optional
try:
    from sentence_transformers import SentenceTransformer
    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError:
    SENTENCE_TRANSFORMERS_AVAILABLE = False
    print("sentence-transformers not available, using keyword search only")

class SemanticSearchEngine:
    """Semantic search engine for papers"""
    
    def __init__(self):
        self.model = None
        self.paper_embeddings = {}
        self.paper_ids = []
        self.embeddings_matrix = None
        self._load_model()
    
    def _load_model(self):
        """Load sentence transformer model"""
        if not SENTENCE_TRANSFORMERS_AVAILABLE:
            self.model = None
            print("Semantic search not available - using keyword search")
            return
        
        try:
            # Use a lightweight model for faster inference
            # Try to load model, but don't fail if it doesn't work
            import warnings
            warnings.filterwarnings('ignore')
            self.model = SentenceTransformer('all-MiniLM-L6-v2', device='cpu')
            print("Semantic search model loaded successfully")
        except Exception as e:
            print(f"Error loading semantic search model: {e}")
            print("Falling back to keyword search")
            self.model = None
    
    def _get_paper_text(self, paper: Paper) -> str:
        """Combine paper fields into searchable text"""
        text_parts = []
        if paper.title:
            text_parts.append(paper.title)
        if paper.abstract:
            text_parts.append(paper.abstract)
        if paper.keywords:
            text_parts.append(paper.keywords)
        if paper.domains:
            text_parts.append(paper.domains)
        return " ".join(text_parts)
    
    def build_index(self, papers: List[Paper]):
        """Build semantic index for papers"""
        if not self.model:
            return
        
        try:
            texts = [self._get_paper_text(paper) for paper in papers]
            if not texts:
                return
            
            # Generate embeddings
            embeddings = self.model.encode(texts, show_progress_bar=False)
            
            # Store embeddings
            self.paper_ids = [paper.id for paper in papers]
            self.embeddings_matrix = embeddings
            self.paper_embeddings = {paper.id: embedding for paper, embedding in zip(papers, embeddings)}
            
            print(f"Built semantic index for {len(papers)} papers")
        except Exception as e:
            print(f"Error building semantic index: {e}")
    
    def search(self, query: str, papers: List[Paper], top_k: int = 20) -> List[Paper]:
        """
        Perform semantic search
        
        Args:
            query: Search query
            papers: List of papers to search in
            top_k: Number of results to return
            
        Returns:
            List of papers sorted by relevance
        """
        if not self.model:
            # Fallback to keyword search
            return self._keyword_search(query, papers, top_k)
        
        try:
            # Build index if not already built or if papers changed
            current_ids = {p.id for p in papers}
            indexed_ids = set(self.paper_ids)
            
            if current_ids != indexed_ids or len(papers) != len(self.paper_ids):
                self.build_index(papers)
            
            if self.embeddings_matrix is None or len(self.paper_ids) == 0:
                return self._keyword_search(query, papers, top_k)
            
            # Encode query
            query_embedding = self.model.encode([query], show_progress_bar=False)[0]
            
            # Calculate similarities
            similarities = cosine_similarity(
                query_embedding.reshape(1, -1),
                self.embeddings_matrix
            )[0]
            
            # Get top K papers
            top_indices = np.argsort(similarities)[::-1][:top_k]
            
            # Create paper map for quick lookup
            paper_map = {paper.id: paper for paper in papers}
            
            # Return papers sorted by similarity
            results = []
            for idx in top_indices:
                paper_id = self.paper_ids[idx]
                if paper_id in paper_map:
                    paper = paper_map[paper_id]
                    results.append(paper)
            
            return results
        except Exception as e:
            print(f"Error in semantic search: {e}")
            return self._keyword_search(query, papers, top_k)
    
    def _keyword_search(self, query: str, papers: List[Paper], top_k: int) -> List[Paper]:
        """Fallback keyword search"""
        query_lower = query.lower()
        scored_papers = []
        
        for paper in papers:
            score = 0
            text = self._get_paper_text(paper).lower()
            
            # Title matches are most important
            if query_lower in (paper.title or "").lower():
                score += 10
            # Abstract matches
            if query_lower in (paper.abstract or "").lower():
                score += 5
            # Keyword matches
            if query_lower in (paper.keywords or "").lower():
                score += 3
            
            # Count word matches
            query_words = query_lower.split()
            for word in query_words:
                if word in text:
                    score += 1
            
            if score > 0:
                scored_papers.append((score, paper))
        
        # Sort by score and return top K
        scored_papers.sort(key=lambda x: x[0], reverse=True)
        return [paper for _, paper in scored_papers[:top_k]]

# Global instance
semantic_search_engine = SemanticSearchEngine()
