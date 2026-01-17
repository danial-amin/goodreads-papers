"""
Smart tagging system for automatic keyword extraction and topic classification
"""
import re
from typing import List, Dict, Optional
from collections import Counter
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.tag import pos_tag
from nltk.chunk import ne_chunk

try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt', quiet=True)

try:
    nltk.data.find('taggers/averaged_perceptron_tagger')
except LookupError:
    nltk.download('averaged_perceptron_tagger', quiet=True)

try:
    nltk.data.find('chunkers/maxent_ne_chunker')
except LookupError:
    nltk.download('maxent_ne_chunker', quiet=True)

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords', quiet=True)

class SmartTagger:
    """Automatic tagging and keyword extraction"""
    
    # Common research domains
    DOMAINS = {
        'machine learning': ['ml', 'machine learning', 'deep learning', 'neural network', 'ai', 'artificial intelligence'],
        'computer vision': ['cv', 'computer vision', 'image', 'visual', 'recognition', 'detection'],
        'nlp': ['nlp', 'natural language', 'language model', 'text', 'transformer', 'bert', 'gpt'],
        'reinforcement learning': ['rl', 'reinforcement', 'q-learning', 'policy', 'agent'],
        'robotics': ['robot', 'robotics', 'autonomous', 'manipulation'],
        'graphics': ['graphics', 'rendering', '3d', 'cg'],
        'systems': ['system', 'distributed', 'parallel', 'scalable'],
        'security': ['security', 'cryptography', 'privacy', 'adversarial'],
        'theory': ['theory', 'algorithm', 'complexity', 'optimization'],
    }
    
    @staticmethod
    def extract_keywords(text: str, max_keywords: int = 10) -> List[str]:
        """
        Extract keywords from text using TF-IDF-like approach
        
        Args:
            text: Input text (title + abstract)
            max_keywords: Maximum number of keywords to return
        """
        if not text:
            return []
        
        # Combine common stopwords
        stop_words = set(stopwords.words('english'))
        stop_words.update(['paper', 'propose', 'proposed', 'method', 'approach', 'result', 'show', 'demonstrate'])
        
        # Tokenize and filter
        words = word_tokenize(text.lower())
        words = [w for w in words if w.isalnum() and len(w) > 2 and w not in stop_words]
        
        # Count frequencies
        word_freq = Counter(words)
        
        # Get most common words
        keywords = [word for word, count in word_freq.most_common(max_keywords * 2)]
        
        # Filter out very common words
        filtered = [kw for kw in keywords if word_freq[kw] >= 2 or len(kw) > 5]
        
        return filtered[:max_keywords]
    
    @staticmethod
    def detect_domain(text: str) -> List[str]:
        """
        Detect research domains from text
        
        Args:
            text: Input text
            
        Returns:
            List of detected domains
        """
        text_lower = text.lower()
        detected = []
        
        for domain, keywords in SmartTagger.DOMAINS.items():
            if any(keyword in text_lower for keyword in keywords):
                detected.append(domain)
        
        return detected[:3]  # Return top 3 domains
    
    @staticmethod
    def extract_entities(text: str) -> List[str]:
        """
        Extract named entities (techniques, models, etc.)
        
        Args:
            text: Input text
            
        Returns:
            List of entities
        """
        try:
            tokens = word_tokenize(text)
            tagged = pos_tag(tokens)
            entities = []
            
            # Extract proper nouns and technical terms
            for word, pos in tagged:
                if pos in ['NNP', 'NNPS'] or (pos == 'NN' and word[0].isupper()):
                    if len(word) > 2:
                        entities.append(word)
            
            return list(set(entities))[:5]
        except:
            return []
    
    @staticmethod
    def tag_paper(title: str, abstract: str, existing_keywords: Optional[str] = None) -> Dict:
        """
        Generate comprehensive tags for a paper
        
        Args:
            title: Paper title
            abstract: Paper abstract
            existing_keywords: Existing keywords (if any)
            
        Returns:
            Dictionary with tags, domains, and enhanced keywords
        """
        combined_text = f"{title} {abstract}"
        
        # Extract keywords
        keywords = SmartTagger.extract_keywords(combined_text, max_keywords=10)
        
        # Detect domains
        domains = SmartTagger.detect_domain(combined_text)
        
        # Extract entities
        entities = SmartTagger.extract_entities(combined_text)
        
        # Combine with existing keywords
        all_keywords = []
        if existing_keywords:
            all_keywords.extend([k.strip() for k in existing_keywords.split(',')])
        all_keywords.extend(keywords)
        all_keywords.extend(entities)
        
        # Remove duplicates and limit
        unique_keywords = list(dict.fromkeys(all_keywords))[:15]
        
        return {
            "keywords": ", ".join(unique_keywords),
            "domains": domains,
            "smart_tags": ", ".join(domains + unique_keywords[:5])
        }
