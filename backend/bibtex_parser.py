"""
BibTeX parser for importing papers
"""
import re
from typing import List, Dict, Optional
from datetime import datetime

class BibTeXParser:
    """Parse BibTeX entries into paper format"""
    
    @staticmethod
    def parse_bibtex(bibtex_content: str) -> List[Dict]:
        """
        Parse BibTeX content and return list of paper dictionaries
        
        Args:
            bibtex_content: Raw BibTeX string
            
        Returns:
            List of paper dictionaries
        """
        papers = []
        
        # Split by @ entries
        entries = re.split(r'@\w+\{', bibtex_content)
        
        for entry in entries[1:]:  # Skip first empty split
            try:
                # Extract entry type and key
                first_line = entry.split(',', 1)[0] if ',' in entry else entry.split('\n', 1)[0]
                entry_key = first_line.strip().rstrip(',')
                
                # Extract fields
                paper_data = BibTeXParser._parse_entry(entry)
                
                if paper_data:
                    papers.append(paper_data)
            except Exception as e:
                print(f"Error parsing BibTeX entry: {e}")
                continue
        
        return papers
    
    @staticmethod
    def _parse_entry(entry: str) -> Optional[Dict]:
        """Parse a single BibTeX entry"""
        paper = {
            "title": None,
            "authors": None,
            "abstract": None,
            "venue": None,
            "year": None,
            "url": None,
            "doi": None,
            "keywords": None,
            "citation_count": 0
        }
        
        # Extract title
        title_match = re.search(r'title\s*=\s*[{"]([^}"]+)[}"]', entry, re.IGNORECASE)
        if title_match:
            paper["title"] = title_match.group(1).strip()
        
        # Extract authors
        author_match = re.search(r'author\s*=\s*[{"]([^}"]+)[}"]', entry, re.IGNORECASE)
        if author_match:
            authors = author_match.group(1).strip()
            # Clean up BibTeX author formatting
            authors = authors.replace(' and ', ', ')
            paper["authors"] = authors
        
        # Extract abstract
        abstract_match = re.search(r'abstract\s*=\s*[{"]([^}"]+)[}"]', entry, re.IGNORECASE)
        if abstract_match:
            paper["abstract"] = abstract_match.group(1).strip()
        
        # Extract year
        year_match = re.search(r'year\s*=\s*[{"]([^}"]+)[}"]', entry, re.IGNORECASE)
        if year_match:
            try:
                paper["year"] = int(year_match.group(1).strip())
            except:
                pass
        
        # Extract journal/booktitle (venue)
        journal_match = re.search(r'journal\s*=\s*[{"]([^}"]+)[}"]', entry, re.IGNORECASE)
        if journal_match:
            paper["venue"] = journal_match.group(1).strip()
        else:
            booktitle_match = re.search(r'booktitle\s*=\s*[{"]([^}"]+)[}"]', entry, re.IGNORECASE)
            if booktitle_match:
                paper["venue"] = booktitle_match.group(1).strip()
        
        # Extract URL
        url_match = re.search(r'url\s*=\s*[{"]([^}"]+)[}"]', entry, re.IGNORECASE)
        if url_match:
            paper["url"] = url_match.group(1).strip()
        
        # Extract DOI
        doi_match = re.search(r'doi\s*=\s*[{"]([^}"]+)[}"]', entry, re.IGNORECASE)
        if doi_match:
            paper["doi"] = doi_match.group(1).strip()
        
        # Extract keywords
        keywords_match = re.search(r'keywords\s*=\s*[{"]([^}"]+)[}"]', entry, re.IGNORECASE)
        if keywords_match:
            paper["keywords"] = keywords_match.group(1).strip()
        
        # Only return if we have at least title and authors
        if paper["title"] and paper["authors"]:
            return paper
        
        return None
