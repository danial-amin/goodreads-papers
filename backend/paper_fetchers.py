"""
External paper API integrations for fetching papers from arXiv, PubMed, etc.
"""
import requests
import xml.etree.ElementTree as ET
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import time

class ArxivFetcher:
    """Fetch papers from arXiv API"""
    
    BASE_URL = "http://export.arxiv.org/api/query"
    
    @staticmethod
    def search(query: str, max_results: int = 50, sort_by: str = "submittedDate") -> List[Dict]:
        """
        Search arXiv for papers
        
        Args:
            query: Search query (e.g., "machine learning", "cat:cs.AI")
            max_results: Maximum number of results
            sort_by: Sort order (submittedDate, relevance, lastUpdatedDate)
        """
        params = {
            "search_query": query,
            "start": 0,
            "max_results": max_results,
            "sortBy": sort_by,
            "sortOrder": "descending"
        }
        
        try:
            response = requests.get(ArxivFetcher.BASE_URL, params=params, timeout=10)
            response.raise_for_status()
            
            root = ET.fromstring(response.content)
            namespace = {'atom': 'http://www.w3.org/2005/Atom'}
            
            papers = []
            for entry in root.findall('atom:entry', namespace):
                paper = {
                    "title": entry.find('atom:title', namespace).text.strip().replace('\n', ' ') if entry.find('atom:title', namespace) is not None else "",
                    "authors": ", ".join([author.find('atom:name', namespace).text for author in entry.findall('atom:author', namespace) if author.find('atom:name', namespace) is not None]),
                    "abstract": entry.find('atom:summary', namespace).text.strip().replace('\n', ' ') if entry.find('atom:summary', namespace) is not None else "",
                    "url": entry.find('atom:id', namespace).text if entry.find('atom:id', namespace) is not None else "",
                    "doi": None,
                    "venue": "arXiv",
                    "year": None,
                    "keywords": None,
                    "citation_count": 0
                }
                
                # Extract year from published date
                published = entry.find('atom:published', namespace)
                if published is not None and published.text:
                    try:
                        date = datetime.fromisoformat(published.text.replace('Z', '+00:00'))
                        paper["year"] = date.year
                    except:
                        pass
                
                # Extract categories as keywords
                categories = [cat.get('term') for cat in entry.findall('atom:category', namespace)]
                if categories:
                    paper["keywords"] = ", ".join(categories[:5])
                
                papers.append(paper)
            
            return papers
        except Exception as e:
            print(f"Error fetching from arXiv: {e}")
            return []
    
    @staticmethod
    def get_recent(category: Optional[str] = None, days: int = 7, max_results: int = 50) -> List[Dict]:
        """Get recently submitted papers"""
        if category:
            query = f"cat:{category}"
        else:
            query = "all"
        
        return ArxivFetcher.search(query, max_results=max_results, sort_by="submittedDate")


class PubMedFetcher:
    """Fetch papers from PubMed API"""
    
    BASE_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"
    
    @staticmethod
    def search(query: str, max_results: int = 50) -> List[Dict]:
        """
        Search PubMed for papers
        
        Args:
            query: Search query
            max_results: Maximum number of results
        """
        try:
            # Step 1: Search and get IDs
            search_url = f"{PubMedFetcher.BASE_URL}/esearch.fcgi"
            search_params = {
                "db": "pubmed",
                "term": query,
                "retmax": max_results,
                "retmode": "json"
            }
            
            response = requests.get(search_url, params=search_params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            pmids = data.get("esearchresult", {}).get("idlist", [])
            if not pmids:
                return []
            
            # Step 2: Fetch details
            fetch_url = f"{PubMedFetcher.BASE_URL}/efetch.fcgi"
            fetch_params = {
                "db": "pubmed",
                "id": ",".join(pmids),
                "retmode": "xml"
            }
            
            response = requests.get(fetch_url, params=fetch_params, timeout=10)
            response.raise_for_status()
            
            root = ET.fromstring(response.content)
            namespace = {'pubmed': 'http://www.ncbi.nlm.nih.gov'}
            
            papers = []
            for article in root.findall('.//pubmed:PubmedArticle', namespace):
                try:
                    # Extract title
                    title_elem = article.find('.//pubmed:ArticleTitle', namespace)
                    title = title_elem.text if title_elem is not None else ""
                    
                    # Extract authors
                    authors = []
                    for author in article.findall('.//pubmed:Author', namespace):
                        last_name = author.find('pubmed:LastName', namespace)
                        first_name = author.find('pubmed:FirstName', namespace)
                        if last_name is not None:
                            name = last_name.text
                            if first_name is not None:
                                name += f" {first_name.text}"
                            authors.append(name)
                    
                    # Extract abstract
                    abstract_elem = article.find('.//pubmed:AbstractText', namespace)
                    abstract = abstract_elem.text if abstract_elem is not None else ""
                    
                    # Extract year
                    year = None
                    pub_date = article.find('.//pubmed:PubDate', namespace)
                    if pub_date is not None:
                        year_elem = pub_date.find('pubmed:Year', namespace)
                        if year_elem is not None:
                            year = int(year_elem.text)
                    
                    # Extract DOI
                    doi = None
                    article_ids = article.findall('.//pubmed:ArticleId', namespace)
                    for article_id in article_ids:
                        if article_id.get('IdType') == 'doi':
                            doi = article_id.text
                            break
                    
                    # Extract journal
                    journal_elem = article.find('.//pubmed:Journal', namespace)
                    venue = None
                    if journal_elem is not None:
                        title_elem = journal_elem.find('pubmed:Title', namespace)
                        if title_elem is not None:
                            venue = title_elem.text
                    
                    # Extract MeSH terms as keywords
                    keywords = []
                    mesh_list = article.findall('.//pubmed:DescriptorName', namespace)
                    for mesh in mesh_list[:5]:
                        if mesh.text:
                            keywords.append(mesh.text)
                    
                    # Get corresponding PMID
                    pmid = pmids[len(papers)] if len(papers) < len(pmids) else ""
                    
                    paper = {
                        "title": title,
                        "authors": ", ".join(authors[:10]),  # Limit authors
                        "abstract": abstract,
                        "url": f"https://pubmed.ncbi.nlm.nih.gov/{pmid}" if pmid else None,
                        "doi": doi,
                        "venue": venue or "PubMed",
                        "year": year,
                        "keywords": ", ".join(keywords) if keywords else None,
                        "citation_count": 0
                    }
                    
                    papers.append(paper)
                except Exception as e:
                    print(f"Error parsing PubMed article: {e}")
                    continue
            
            return papers
        except Exception as e:
            print(f"Error fetching from PubMed: {e}")
            return []


class PaperFetcherService:
    """Service to fetch papers from multiple sources"""
    
    @staticmethod
    def fetch_recent_papers(sources: List[str] = ["arxiv"], max_per_source: int = 20) -> List[Dict]:
        """
        Fetch recent papers from specified sources
        
        Args:
            sources: List of sources ("arxiv", "pubmed")
            max_per_source: Maximum papers per source
        """
        all_papers = []
        
        if "arxiv" in sources:
            print("Fetching from arXiv...")
            arxiv_papers = ArxivFetcher.get_recent(max_results=max_per_source)
            all_papers.extend(arxiv_papers)
            time.sleep(1)  # Rate limiting
        
        if "pubmed" in sources:
            print("Fetching from PubMed...")
            pubmed_papers = PubMedFetcher.search("machine learning[Title/Abstract] OR deep learning[Title/Abstract]", max_results=max_per_source)
            all_papers.extend(pubmed_papers)
            time.sleep(1)  # Rate limiting
        
        return all_papers
