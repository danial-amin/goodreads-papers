"""
Topic progression analysis for creating logical paths between papers
"""
from typing import List, Dict, Tuple
from sqlalchemy.orm import Session
from models import Paper
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from collections import defaultdict

class TopicProgressionAnalyzer:
    """Analyze topic progression between papers"""
    
    def __init__(self):
        self.vectorizer = TfidfVectorizer(max_features=200, stop_words='english')
        self.paper_vectors = None
        self.paper_ids = None
        self.paper_domains = {}
    
    def build_topic_space(self, papers: List[Paper]):
        """Build topic vector space from papers"""
        texts = []
        paper_ids = []
        domains_map = {}
        
        for paper in papers:
            # Combine title, abstract, keywords, and domains
            text = f"{paper.title} {paper.abstract}"
            if paper.keywords:
                text += f" {paper.keywords}"
            if paper.domains:
                text += f" {paper.domains}"
            
            texts.append(text)
            paper_ids.append(int(paper.id))
            if paper.domains:
                domains_map[int(paper.id)] = [d.strip() for d in paper.domains.split(',') if d.strip()]
            else:
                domains_map[int(paper.id)] = []
        
        if texts:
            self.paper_vectors = self.vectorizer.fit_transform(texts)
            self.paper_ids = np.array(paper_ids)
            self.paper_domains = domains_map
    
    def _is_general_paper(self, paper: Paper) -> bool:
        """Determine if a paper is general (broad topic) or specific (narrow topic)"""
        if not paper.abstract:
            return False
        
        abstract_lower = paper.abstract.lower()
        title_lower = paper.title.lower()
        
        # General papers often have broad terms
        general_indicators = [
            'survey', 'review', 'overview', 'introduction', 'foundation',
            'fundamental', 'principles', 'framework', 'paradigm', 'methodology'
        ]
        
        # Specific papers have narrow, technical terms
        specific_indicators = [
            'novel', 'propose', 'new method', 'algorithm', 'technique',
            'implementation', 'architecture', 'model', 'system'
        ]
        
        # Count indicators
        general_count = sum(1 for term in general_indicators if term in abstract_lower or term in title_lower)
        specific_count = sum(1 for term in specific_indicators if term in abstract_lower or term in title_lower)
        
        # Check abstract length (longer abstracts often more general)
        abstract_length = len(paper.abstract.split())
        
        # General if: has general indicators OR long abstract with few specific terms
        is_general = general_count > specific_count or (abstract_length > 300 and specific_count < 2)
        
        return is_general
    
    def find_topic_progression(self, paper_id: int, papers: List[Paper], limit: int = 5) -> List[Tuple[int, float, str]]:
        """
        Find papers that represent topic progression from a given paper
        Logic: General papers connect to specific papers, specific papers connect to related specific papers
        
        Returns:
            List of (paper_id, similarity_score, progression_type) tuples
        """
        if self.paper_vectors is None or paper_id not in self.paper_ids:
            return []
        
        # Find paper index
        idx = np.where(self.paper_ids == paper_id)[0][0]
        paper_vector = self.paper_vectors[idx]
        
        # Get paper year for temporal analysis
        paper = next((p for p in papers if p.id == paper_id), None)
        if not paper:
            return []
        
        paper_year = paper.year or 0
        paper_domains = self.paper_domains.get(paper_id, [])
        is_paper_general = self._is_general_paper(paper)
        
        # Calculate similarity with all papers
        similarities = cosine_similarity(paper_vector, self.paper_vectors)[0]
        
        # Score papers based on progression criteria
        progression_scores = []
        
        for i, other_paper_id in enumerate(self.paper_ids):
            if other_paper_id == paper_id:
                continue
            
            other_paper = next((p for p in papers if p.id == other_paper_id), None)
            if not other_paper:
                continue
            
            similarity = float(similarities[i])
            other_year = other_paper.year or 0
            other_domains = self.paper_domains.get(other_paper_id, [])
            is_other_general = self._is_general_paper(other_paper)
            
            # Calculate progression score
            score = similarity
            
            # Logical progression rules:
            # 1. General papers connect to specific papers (foundation → application)
            # 2. Specific papers connect to other specific papers (related work)
            # 3. Specific papers connect back to general papers (context)
            
            if is_paper_general and not is_other_general:
                # General → Specific: Strong connection (foundation to application)
                score *= 1.5
                progression_type = "application"
            elif not is_paper_general and is_other_general:
                # Specific → General: Moderate connection (application to context)
                score *= 1.2
                progression_type = "context"
            elif not is_paper_general and not is_other_general:
                # Specific → Specific: Strong if similar, moderate if different
                if similarity > 0.3:
                    score *= 1.4
                    progression_type = "related_work"
                else:
                    score *= 1.1
                    progression_type = "alternative_approach"
            else:
                # General → General: Weak connection unless very similar
                if similarity > 0.4:
                    score *= 1.1
                    progression_type = "related_survey"
                else:
                    score *= 0.8  # Reduce score for unrelated general papers
                    progression_type = "unrelated"
            
            # Temporal progression (newer papers building on older)
            if other_year > paper_year and other_year - paper_year <= 5:
                score *= 1.3  # Recent follow-up work
            elif other_year < paper_year and paper_year - other_year <= 5:
                score *= 1.2  # Recent foundational work
            elif abs(other_year - paper_year) > 10:
                score *= 0.9  # Slightly reduce for very old/new papers
            
            # Boost for domain overlap
            domain_overlap = len(set(paper_domains) & set(other_domains))
            if domain_overlap > 0:
                score *= (1 + domain_overlap * 0.25)
            
            # Boost for high citation count (important papers)
            if other_paper.citation_count > 100:
                score *= 1.15
            
            # Only include if score is above threshold
            if score > 0.1:
                progression_scores.append((other_paper_id, score, progression_type))
        
        # Sort by score and return top N
        progression_scores.sort(key=lambda x: x[1], reverse=True)
        return progression_scores[:limit]
    
    def create_progression_paths(self, papers: List[Paper], max_paths_per_paper: int = 4) -> List[Dict]:
        """
        Create topic progression paths between papers
        Creates logical connections: General → Specific, Specific → Related Specific
        
        Returns:
            List of link dictionaries with progression information
        """
        if len(papers) == 0:
            return []
        
        self.build_topic_space(papers)
        
        links = []
        processed_pairs = set()
        
        # Separate general and specific papers
        general_papers = [p for p in papers if self._is_general_paper(p)]
        specific_papers = [p for p in papers if not self._is_general_paper(p)]
        
        # Create progression paths
        # 1. General papers connect to specific papers (foundation → application)
        for paper in general_papers[:30]:
            progressions = self.find_topic_progression(paper.id, papers, limit=max_paths_per_paper)
            
            for target_id, score, prog_type in progressions:
                pair_key = tuple(sorted([paper.id, target_id]))
                
                if pair_key not in processed_pairs and score > 0.12:
                    links.append({
                        "source": int(paper.id),
                        "target": int(target_id),
                        "value": float(min(score * 12, 5)),  # Scale to 1-5
                        "type": "topic_progression",
                        "progression_type": str(prog_type),
                        "similarity": float(score)
                    })
                    processed_pairs.add(pair_key)
        
        # 2. Specific papers connect to related specific papers and general context
        for paper in specific_papers[:40]:
            progressions = self.find_topic_progression(paper.id, papers, limit=max_paths_per_paper)
            
            for target_id, score, prog_type in progressions:
                pair_key = tuple(sorted([paper.id, target_id]))
                
                if pair_key not in processed_pairs and score > 0.15:
                    links.append({
                        "source": int(paper.id),
                        "target": int(target_id),
                        "value": float(min(score * 10, 4)),  # Slightly lower value for specific-specific
                        "type": "topic_progression",
                        "progression_type": str(prog_type),
                        "similarity": float(score)
                    })
                    processed_pairs.add(pair_key)
        
        return links
