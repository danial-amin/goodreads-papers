from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import os
from dotenv import load_dotenv

from database import SessionLocal, engine, Base
from models import Paper, User, UserPaperInteraction
from schemas import (
    PaperCreate, PaperResponse, PaperUpdate,
    UserCreate, UserResponse,
    RecommendationResponse, InteractionCreate, InteractionResponse,
    Token, UserLogin,
    ChatRequest, ChatResponse, FetchPapersRequest, BibTeXUploadRequest,
    SignupStep1, SignupStep2, SignupStep3, GuestInteractionCreate,
    PaperURLUpdate,
    OnboardingData, OnboardingResponse,
    ReadingHabitsResponse, ExploreExploitResponse, DomainExpertiseResponse
)
from models import InteractionStatus
from recommendation_engine import RecommendationEngine
from paper_fetchers import PaperFetcherService, ArxivFetcher, PubMedFetcher
from chat_service import ChatService
from smart_tagger import SmartTagger
from topic_progression import TopicProgressionAnalyzer
from reading_patterns import ReadingPatternAnalyzer
from semantic_search import semantic_search_engine
from auto_fetch import auto_fetcher
from guest_session import GuestSessionManager
from reading_habits import ReadingHabitsTracker
from explore_exploit_advisor import ExploreExploitAdvisor
from auth import (
    get_password_hash, verify_password, create_access_token,
    verify_token, authenticate_user, get_user_by_username
)

from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

load_dotenv()

# Create database tables
Base.metadata.create_all(bind=engine)

# Run migration to add new columns
try:
    from migrate_db import migrate_database
    migrate_database()
except Exception as e:
    print(f"Migration note: {e}")

# Run v2 migration for onboarding and habits features
try:
    from migrate_v2 import migrate_v2
    migrate_v2()
except Exception as e:
    print(f"Migration v2 note: {e}")

# Run v3 migration for reflection questions
try:
    from migrate_v3 import migrate_v3
    migrate_v3()
except Exception as e:
    print(f"Migration v3 note: {e}")

app = FastAPI(
    title="PaperReads API",
    description="A modern research paper recommendation platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()
optional_security = HTTPBearer(auto_error=False)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Optional user dependency (for endpoints that work with or without auth)
async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(optional_security),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Get current user if authenticated, None otherwise"""
    if not credentials:
        return None
    try:
        token_data = verify_token(credentials.credentials)
        if token_data:
            user = db.query(User).filter(User.id == token_data.get("sub")).first()
            return user
    except:
        pass
    return None

# Dependency to get current user
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get current authenticated user"""
    token = credentials.credentials
    payload = verify_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    username: str = payload.get("sub")
    if username is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )
    user = get_user_by_username(db, username=username)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return user

# Initialize recommendation engine, chat service, and topic progression
rec_engine = RecommendationEngine()
chat_service = ChatService(rec_engine)
topic_progression = TopicProgressionAnalyzer()

@app.get("/")
async def root():
    return {"message": "PaperReads API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Paper endpoints
@app.post("/api/papers", response_model=PaperResponse, status_code=status.HTTP_201_CREATED)
async def create_paper(paper: PaperCreate, db: Session = Depends(get_db)):
    """Create a new paper with smart tagging"""
    paper_data = paper.dict()
    
    # Apply smart tagging
    tag_result = SmartTagger.tag_paper(
        title=paper_data["title"],
        abstract=paper_data["abstract"],
        existing_keywords=paper_data.get("keywords")
    )
    
    # Update paper data with smart tags
    paper_data["keywords"] = tag_result["keywords"]
    paper_data["smart_tags"] = tag_result["smart_tags"]
    paper_data["domains"] = ", ".join(tag_result["domains"]) if tag_result["domains"] else None
    
    db_paper = Paper(**paper_data)
    db.add(db_paper)
    db.commit()
    db.refresh(db_paper)
    return db_paper

@app.get("/api/papers", response_model=List[PaperResponse])
async def get_papers(
    skip: int = 0,
    limit: int = 20,
    search: Optional[str] = None,
    search_arxiv: bool = False,
    db: Session = Depends(get_db)
):
    """
    Get all papers with optional semantic search
    
    Args:
        search: Search query (uses semantic search if available)
        search_arxiv: If True, also search arXiv directly and include results
    """
    papers = []
    
    if search:
        # First, search local database with semantic search
        all_local_papers = db.query(Paper).all()
        if all_local_papers:
            # Use semantic search
            local_results = semantic_search_engine.search(search, all_local_papers, top_k=limit * 2)
            papers.extend(local_results[:limit])
        
        # If search_arxiv is True, also search arXiv directly
        if search_arxiv:
            try:
                arxiv_results = ArxivFetcher.search(search, max_results=limit)
                # Convert to Paper objects (don't save, just return)
                for arxiv_paper in arxiv_results:
                    # Check if already in results
                    if not any(p.title == arxiv_paper.get("title") for p in papers):
                        # Create temporary Paper object for response
                        temp_paper = Paper(
                            title=arxiv_paper.get("title", ""),
                            authors=arxiv_paper.get("authors", ""),
                            abstract=arxiv_paper.get("abstract", ""),
                            venue=arxiv_paper.get("venue", "arXiv"),
                            year=arxiv_paper.get("year"),
                            url=arxiv_paper.get("url", ""),
                            doi=arxiv_paper.get("doi"),
                            keywords=arxiv_paper.get("keywords"),
                            citation_count=arxiv_paper.get("citation_count", 0)
                        )
                        temp_paper.id = -1  # Mark as external
                        papers.append(temp_paper)
            except Exception as e:
                print(f"Error searching arXiv: {e}")
        
        # If no results from local DB, try arXiv
        if not papers and not search_arxiv:
            try:
                arxiv_results = ArxivFetcher.search(search, max_results=limit)
                for arxiv_paper in arxiv_results:
                    temp_paper = Paper(
                        title=arxiv_paper.get("title", ""),
                        authors=arxiv_paper.get("authors", ""),
                        abstract=arxiv_paper.get("abstract", ""),
                        venue=arxiv_paper.get("venue", "arXiv"),
                        year=arxiv_paper.get("year"),
                        url=arxiv_paper.get("url", ""),
                        doi=arxiv_paper.get("doi"),
                        keywords=arxiv_paper.get("keywords"),
                        citation_count=arxiv_paper.get("citation_count", 0)
                    )
                    temp_paper.id = -1
                    papers.append(temp_paper)
            except Exception as e:
                print(f"Error searching arXiv: {e}")
    else:
        # No search - get recent papers first, then popular ones
        # Get recently added papers
        recent_papers = db.query(Paper).order_by(Paper.created_at.desc()).limit(limit // 2).all()
        papers.extend(recent_papers)
        
        # Fill remaining with popular papers
        remaining = limit - len(papers)
        if remaining > 0:
            popular_papers = db.query(Paper).order_by(Paper.citation_count.desc()).limit(remaining).all()
            # Avoid duplicates
            recent_ids = {p.id for p in recent_papers}
            papers.extend([p for p in popular_papers if p.id not in recent_ids])
    
    return papers[:limit]

@app.get("/api/papers/graph")
async def get_papers_graph(
    search: Optional[str] = None,
    limit: int = 2000,  # Increased to show thousands of papers
    user_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Get papers data formatted for graph visualization
    
    - If no user: returns general trends (popular papers by domain)
    - If user with no reads: returns papers in user's preferred domains
    - If user with reads: returns papers user has read + related papers
    """
    try:
        # Determine which papers to show
        if current_user:
            # Check if user has read any papers
            interactions = db.query(UserPaperInteraction).filter(
                UserPaperInteraction.user_id == current_user.id,
                UserPaperInteraction.status == InteractionStatus.READ
            ).all()
            
            if interactions:
                # User has read papers - show read papers + related
                read_paper_ids = [i.paper_id for i in interactions]
                query = db.query(Paper).filter(Paper.id.in_(read_paper_ids))
                
                # Also include related papers (same domain or similar)
                read_papers = db.query(Paper).filter(Paper.id.in_(read_paper_ids)).all()
                if read_papers:
                    # Get domains from read papers
                    read_domains = set()
                    for paper in read_papers:
                        if paper.domains:
                            read_domains.update([d.strip() for d in paper.domains.split(',')])
                    
                    # Add papers in same domains
                    if read_domains:
                        domain_query = db.query(Paper).filter(
                            Paper.domains.contains(list(read_domains)[0])
                        ).limit(limit // 2)
                        related_papers = domain_query.all()
                        related_ids = [p.id for p in related_papers if p.id not in read_paper_ids]
                        if related_ids:
                            query = db.query(Paper).filter(
                                (Paper.id.in_(read_paper_ids)) | (Paper.id.in_(related_ids))
                            )
            else:
                # User has no reads - show papers in their preferred domains
                if current_user.preferred_domains:
                    domains = [d.strip() for d in current_user.preferred_domains.split(',')]
                    query = db.query(Paper)
                    # Filter by any of the preferred domains
                    domain_filters = [Paper.domains.contains(domain) for domain in domains]
                    if domain_filters:
                        from sqlalchemy import or_
                        query = query.filter(or_(*domain_filters))
                else:
                    # No preferred domains - show general popular papers
                    query = db.query(Paper).order_by(Paper.citation_count.desc())
        else:
            # No user logged in - show best papers from history
            # Prioritize papers that have been read/studied by users (community engagement)
            # combined with high citation counts
            
            from sqlalchemy import func, case, desc
            
            # Get all papers with their engagement scores
            # Calculate engagement score based on user interactions
            engagement_subquery = db.query(
                UserPaperInteraction.paper_id,
                func.sum(
                    case(
                        (UserPaperInteraction.status == InteractionStatus.CITED, 5),
                        (UserPaperInteraction.status == InteractionStatus.IMPLEMENTED, 4),
                        (UserPaperInteraction.status == InteractionStatus.STUDIED, 3),
                        (UserPaperInteraction.status == InteractionStatus.READ, 2),
                        (UserPaperInteraction.status == InteractionStatus.READING, 1),
                        else_=0
                    )
                ).label('engagement_score')
            ).group_by(UserPaperInteraction.paper_id).subquery()
            
            # Get papers with engagement scores, ordered by combined score
            papers_with_scores = db.query(
                Paper.id,
                Paper,
                func.coalesce(engagement_subquery.c.engagement_score, 0).label('engagement')
            ).outerjoin(
                engagement_subquery, Paper.id == engagement_subquery.c.paper_id
            ).order_by(
                # Combined score: engagement (weighted) + normalized citation count
                (
                    func.coalesce(engagement_subquery.c.engagement_score, 0) * 10 +
                    func.coalesce(Paper.citation_count, 0) / 10.0
                ).desc(),
                Paper.citation_count.desc()
            ).limit(limit).all()
            
            # Extract paper IDs in order
            if papers_with_scores:
                paper_ids = [row[0] for row in papers_with_scores]
                # Re-query papers in the correct order
                from sqlalchemy import case as sql_case
                order_case = sql_case(
                    {pid: idx for idx, pid in enumerate(paper_ids)},
                    value=Paper.id
                )
                query = db.query(Paper).filter(Paper.id.in_(paper_ids)).order_by(order_case)
            else:
                # Fallback: just get papers by citation count
                query = db.query(Paper).order_by(Paper.citation_count.desc())
        
        if search:
            query = query.filter(
                (Paper.title.contains(search)) |
                (Paper.abstract.contains(search)) |
                (Paper.authors.contains(search))
            )
        
        # Execute query - should return Paper objects directly
        papers = query.limit(limit).all()
        
        # Build graph structure
        nodes = []
        links = []
        
        # Create nodes
        paper_map = {}
        for paper in papers:
            node = {
                "id": int(paper.id),
                "label": paper.title[:50] + "..." if len(paper.title) > 50 else paper.title,
                "title": paper.title,
                "authors": paper.authors or "",
                "venue": paper.venue or "",
                "year": int(paper.year) if paper.year else None,
                "keywords": paper.keywords or "",
                "url": paper.url or "",
                "doi": paper.doi or "",
                "group": paper.venue or "Other" if paper.venue else "Other"
            }
            nodes.append(node)
            paper_map[paper.id] = paper
        
        # Create links based on topic progression (primary) and other criteria
        # For large datasets, limit link creation to avoid performance issues
        max_links = min(5000, len(papers) * 10)  # Cap at 5000 links or 10 per paper
        link_count = 0
        
        if len(papers) > 0:
            try:
                # 1. Topic progression paths (PRIMARY - most important) - limit for performance
                if len(papers) <= 500:
                    progression_links = topic_progression.create_progression_paths(papers, max_paths_per_paper=4)
                    links.extend(progression_links[:max_links])
                    link_count += len(progression_links)
                else:
                    # For large datasets, skip expensive topic progression
                    progression_links = []
                
                # Track which pairs already have progression links
                progression_pairs = set()
                for link in progression_links:
                    progression_pairs.add(tuple(sorted([link["source"], link["target"]])))
                
                # 2. Domain/topic-based links (for papers without progression paths)
                domain_groups = {}
                for paper in papers:
                    if paper.domains:
                        for domain in paper.domains.split(','):
                            domain = domain.strip()
                            if domain:
                                if domain not in domain_groups:
                                    domain_groups[domain] = []
                                domain_groups[domain].append(paper.id)
                
                # Connect papers in same domain (if no progression link exists)
                # Limit connections per domain to avoid explosion
                for domain, paper_ids in domain_groups.items():
                    if len(paper_ids) > 1 and link_count < max_links:
                        # Limit to connecting each paper to max 5 others in same domain
                        for i, pid1 in enumerate(paper_ids[:100]):  # Limit domain size
                            if link_count >= max_links:
                                break
                            connected = 0
                            for pid2 in paper_ids[i+1:]:
                                if connected >= 5 or link_count >= max_links:
                                    break
                                pair_key = tuple(sorted([pid1, pid2]))
                                if pair_key not in progression_pairs and pid1 in paper_map and pid2 in paper_map:
                                    if not any((l["source"] == pid1 and l["target"] == pid2) or 
                                              (l["source"] == pid2 and l["target"] == pid1) for l in links):
                                        links.append({
                                            "source": int(pid1),
                                            "target": int(pid2),
                                            "value": 1,
                                            "type": "domain"
                                        })
                                        link_count += 1
                                        connected += 1
                
                # 3. Venue-based links (for additional context) - skip for very large datasets
                if len(papers) <= 1000:
                    venue_groups = {}
                    for paper in papers:
                        if paper.venue:
                            if paper.venue not in venue_groups:
                                venue_groups[paper.venue] = []
                            venue_groups[paper.venue].append(paper.id)
                    
                    # Connect papers from same venue (if no other link exists)
                    for venue, paper_ids in venue_groups.items():
                        if len(paper_ids) > 1 and link_count < max_links:
                            for i, pid1 in enumerate(paper_ids[:50]):  # Limit venue size
                                if link_count >= max_links:
                                    break
                                for pid2 in paper_ids[i+1:i+6]:  # Max 5 connections per paper
                                    if link_count >= max_links:
                                        break
                                    pair_key = tuple(sorted([pid1, pid2]))
                                    if pair_key not in progression_pairs and pid1 in paper_map and pid2 in paper_map:
                                        if not any((l["source"] == pid1 and l["target"] == pid2) or 
                                                  (l["source"] == pid2 and l["target"] == pid1) for l in links):
                                            links.append({
                                                "source": int(pid1),
                                                "target": int(pid2),
                                                "value": 0.5,
                                                "type": "venue"
                                            })
                                            link_count += 1
            except Exception as e:
                print(f"Error creating links: {e}")
                import traceback
                traceback.print_exc()
                # Continue without links if similarity fails
        
        return {
            "nodes": nodes,
            "links": links
        }
    except Exception as e:
        print(f"Error in get_papers_graph: {e}")
        return {"nodes": [], "links": []}

@app.get("/api/papers/{paper_id}", response_model=PaperResponse)
async def get_paper(paper_id: int, db: Session = Depends(get_db)):
    """Get a specific paper"""
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    return paper

@app.put("/api/papers/{paper_id}/url", response_model=PaperResponse)
async def update_paper_url(
    paper_id: int,
    update: PaperURLUpdate,
    db: Session = Depends(get_db)
):
    """Update paper URL or DOI (useful for BibTeX papers with missing URLs)"""
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    if update.url:
        paper.url = update.url
    if update.doi:
        paper.doi = update.doi
    db.commit()
    db.refresh(paper)
    return paper

@app.put("/api/papers/{paper_id}", response_model=PaperResponse)
async def update_paper(
    paper_id: int,
    paper_update: PaperUpdate,
    db: Session = Depends(get_db)
):
    """Update a paper"""
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    
    for key, value in paper_update.dict(exclude_unset=True).items():
        setattr(paper, key, value)
    
    db.commit()
    db.refresh(paper)
    return paper

@app.delete("/api/papers/{paper_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_paper(paper_id: int, db: Session = Depends(get_db)):
    """Delete a paper"""
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    db.delete(paper)
    db.commit()
    return None

# Authentication endpoints
@app.post("/api/auth/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if username exists
    if get_user_by_username(db, user.username):
        raise HTTPException(status_code=400, detail="Username already registered")
    
    # Check if email exists
    existing_email = db.query(User).filter(User.email == user.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user_data = user.dict()
    password = user_data.pop("password")
    user_data["password_hash"] = get_password_hash(password)
    db_user = User(**user_data)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/api/auth/register/step1", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_step1(step1: SignupStep1, db: Session = Depends(get_db)):
    """Step 1: Basic signup (username, email, password)"""
    if get_user_by_username(db, step1.username):
        raise HTTPException(status_code=400, detail="Username already registered")
    existing_email = db.query(User).filter(User.email == step1.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    password_hash = get_password_hash(step1.password)
    db_user = User(username=step1.username, email=step1.email, password_hash=password_hash)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.put("/api/auth/register/step2/{user_id}", response_model=UserResponse)
async def register_step2(user_id: int, step2: SignupStep2, db: Session = Depends(get_db)):
    """Step 2: Research interests and domains"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if step2.research_interests:
        user.research_interests = step2.research_interests
    if step2.preferred_domains:
        user.preferred_domains = ", ".join(step2.preferred_domains)
    additional_info = []
    if step2.academic_level:
        additional_info.append(f"Academic Level: {step2.academic_level}")
    if step2.primary_field:
        additional_info.append(f"Primary Field: {step2.primary_field}")
    if additional_info:
        user.bio = "; ".join(additional_info)
    db.commit()
    db.refresh(user)
    return user

@app.put("/api/auth/register/step3/{user_id}", response_model=UserResponse)
async def register_step3(
    user_id: int,
    step3: SignupStep3,
    guest_interactions: Optional[List[GuestInteractionCreate]] = None,
    db: Session = Depends(get_db)
):
    """Step 3: Additional preferences and migrate guest interactions"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if step3.reading_goals:
        user.bio = (user.bio or "") + f"; Reading Goals: {step3.reading_goals}"
    if step3.preferred_venues:
        venues_str = ", ".join(step3.preferred_venues)
        user.research_interests = (user.research_interests or "") + f"; Preferred Venues: {venues_str}"
    if guest_interactions:
        interactions_data = [interaction.dict() for interaction in guest_interactions]
        migrated = GuestSessionManager.migrate_guest_interactions(db, user_id, interactions_data)
        print(f"Migrated {migrated} guest interactions to user {user_id}")
    db.commit()
    db.refresh(user)
    return user

@app.post("/api/auth/migrate-guest-interactions/{user_id}")
async def migrate_guest_interactions(
    user_id: int,
    interactions: List[GuestInteractionCreate],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Migrate guest interactions to user account after signup"""
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    interactions_data = [interaction.dict() for interaction in interactions]
    migrated = GuestSessionManager.migrate_guest_interactions(db, user_id, interactions_data)
    return {"message": f"Migrated {migrated} interactions", "count": migrated}

@app.post("/api/auth/login", response_model=Token)
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Login and get access token"""
    user = authenticate_user(db, credentials.username, credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.username})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse.model_validate(user)
    }

@app.get("/api/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return current_user

# User endpoints
@app.post("/api/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    """Create a new user (legacy endpoint - use /api/auth/register)"""
    return await register(user, db)

@app.get("/api/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, db: Session = Depends(get_db)):
    """Get a specific user"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.get("/api/users/{user_id}/profile")
async def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    """Get user profile with reading patterns"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get reading statistics
    reading_stats = ReadingPatternAnalyzer.get_reading_stats(user_id, db)
    insights = ReadingPatternAnalyzer.get_reading_insights(user_id, db)
    
    return {
        "user": UserResponse.model_validate(user),
        "reading_stats": reading_stats,
        "insights": insights
    }

@app.put("/api/users/{user_id}/profile")
async def update_user_profile(
    user_id: int,
    research_interests: Optional[str] = None,
    preferred_domains: Optional[str] = None,
    name: Optional[str] = None,
    bio: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update user profile (must be authenticated)"""
    # Only allow users to update their own profile
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if research_interests is not None:
        user.research_interests = research_interests
    if preferred_domains is not None:
        user.preferred_domains = preferred_domains
    if name is not None:
        user.name = name
    if bio is not None:
        user.bio = bio
    
    db.commit()
    db.refresh(user)
    return UserResponse.model_validate(user)

# Interaction endpoints
@app.post("/api/interactions", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_interaction(
    interaction: InteractionCreate,
    db: Session = Depends(get_db)
):
    """Record user interaction with a paper"""
    # Check if interaction already exists
    existing = db.query(UserPaperInteraction).filter(
        UserPaperInteraction.user_id == interaction.user_id,
        UserPaperInteraction.paper_id == interaction.paper_id
    ).first()
    
    if existing:
        existing.rating = interaction.rating
        existing.status = interaction.status
        if interaction.notes is not None:
            existing.notes = interaction.notes
        if interaction.what_is_about is not None:
            existing.what_is_about = interaction.what_is_about
        if interaction.is_relevant is not None:
            existing.is_relevant = interaction.is_relevant
        if interaction.where_can_use is not None:
            existing.where_can_use = interaction.where_can_use
        db.commit()
        db.refresh(existing)
        return {"message": "Interaction updated", "interaction": InteractionResponse.model_validate(existing)}
    
    db_interaction = UserPaperInteraction(**interaction.dict())
    db.add(db_interaction)
    db.commit()
    db.refresh(db_interaction)
    return {"message": "Interaction created", "interaction": InteractionResponse.model_validate(db_interaction)}

@app.post("/api/guest/interactions", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_guest_interaction(
    interaction: GuestInteractionCreate,
    db: Session = Depends(get_db)
):
    """
    Record guest interaction with a paper (stored in session, not database)
    Returns the interaction data to be stored in frontend session
    """
    # For guest users, we don't store in DB, just return the data
    # Frontend will store this in localStorage/sessionStorage
    return {
        "message": "Guest interaction recorded",
        "interaction": {
            "paper_id": interaction.paper_id,
            "rating": interaction.rating,
            "status": interaction.status.value if isinstance(interaction.status, InteractionStatus) else interaction.status,
            "notes": interaction.notes,
            "guest_session_id": interaction.guest_session_id or GuestSessionManager.create_guest_session()
        }
    }

@app.get("/api/users/{user_id}/interactions")
async def get_user_interactions(user_id: int, db: Session = Depends(get_db)):
    """Get all interactions for a user"""
    interactions = db.query(UserPaperInteraction).filter(
        UserPaperInteraction.user_id == user_id
    ).all()
    return interactions

@app.get("/api/users/{user_id}/read-papers")
async def get_read_papers(
    user_id: int,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Get papers that the user has read"""
    interactions = db.query(UserPaperInteraction).filter(
        UserPaperInteraction.user_id == user_id,
        UserPaperInteraction.status == InteractionStatus.READ
    ).order_by(UserPaperInteraction.updated_at.desc()).limit(limit).all()
    
    read_papers = []
    for interaction in interactions:
        paper = db.query(Paper).filter(Paper.id == interaction.paper_id).first()
        if paper:
            read_papers.append({
                "paper": PaperResponse.model_validate(paper),
                "interaction": InteractionResponse.model_validate(interaction),
                "read_at": interaction.updated_at or interaction.created_at
            })
    
    return read_papers

# Recommendation endpoints
@app.get("/api/users/{user_id}/recommendations", response_model=List[RecommendationResponse])
async def get_recommendations(
    user_id: int,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Get personalized paper recommendations for a user"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    recommendations = rec_engine.get_recommendations(user_id, db, limit)
    return recommendations

@app.get("/api/papers/{paper_id}/similar", response_model=List[PaperResponse])
async def get_similar_papers(
    paper_id: int,
    limit: int = 5,
    db: Session = Depends(get_db)
):
    """Get papers similar to a given paper"""
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    
    similar = rec_engine.get_similar_papers(paper_id, db, limit)
    return similar

# BibTeX upload endpoint
@app.post("/api/papers/upload-bibtex", response_model=List[PaperResponse])
async def upload_bibtex(
    request: BibTeXUploadRequest,
    db: Session = Depends(get_db)
):
    """Upload papers from BibTeX format"""
    try:
        from bibtex_parser import BibTeXParser
        
        papers_data = BibTeXParser.parse_bibtex(request.bibtex_content)
        
        saved_papers = []
        for paper_data in papers_data:
            # Enhanced tagging based on keywords from BibTeX
            existing_keywords = paper_data.get("keywords", "")
            tag_result = SmartTagger.tag_paper(
                title=paper_data.get("title", ""),
                abstract=paper_data.get("abstract", ""),
                existing_keywords=existing_keywords
            )
            # Merge BibTeX keywords with smart tags
            if existing_keywords:
                bibtex_keywords = [k.strip() for k in existing_keywords.split(',')]
                smart_keywords = [k.strip() for k in tag_result["keywords"].split(',') if k.strip()]
                all_keywords = list(dict.fromkeys(bibtex_keywords + smart_keywords))
                paper_data["keywords"] = ", ".join(all_keywords[:15])
            else:
                paper_data["keywords"] = tag_result["keywords"]
            paper_data["smart_tags"] = tag_result["smart_tags"]
            paper_data["domains"] = ", ".join(tag_result["domains"]) if tag_result["domains"] else None
            
            # Check if paper already exists by title
            existing = db.query(Paper).filter(Paper.title == paper_data.get("title", "")).first()
            if existing:
                # Update existing paper with new data (especially URL if missing)
                if not existing.url and paper_data.get("url"):
                    existing.url = paper_data["url"]
                if not existing.doi and paper_data.get("doi"):
                    existing.doi = paper_data["doi"]
                if not existing.abstract and paper_data.get("abstract"):
                    existing.abstract = paper_data["abstract"]
                existing.keywords = paper_data["keywords"]
                existing.smart_tags = paper_data["smart_tags"]
                existing.domains = paper_data["domains"]
                saved_papers.append(existing)
            else:
                db_paper = Paper(**paper_data)
                db.add(db_paper)
                saved_papers.append(db_paper)
        
        db.commit()
        
        # Refresh all papers
        for paper in saved_papers:
            db.refresh(paper)
        
        return saved_papers
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing BibTeX: {str(e)}")

# External paper fetching endpoints
@app.post("/api/papers/fetch", response_model=List[PaperResponse])
async def fetch_external_papers(
    request: FetchPapersRequest,
    db: Session = Depends(get_db)
):
    """Fetch papers from external sources (arXiv, PubMed)"""
    try:
        papers = []
        
        if request.query:
            # Search with query
            if "arxiv" in request.sources:
                try:
                    arxiv_papers = ArxivFetcher.search(request.query, max_results=request.max_per_source)
                    papers.extend(arxiv_papers)
                except Exception as e:
                    print(f"Error fetching from arXiv: {e}")
            
            if "pubmed" in request.sources:
                try:
                    pubmed_papers = PubMedFetcher.search(request.query, max_results=request.max_per_source)
                    papers.extend(pubmed_papers)
                except Exception as e:
                    print(f"Error fetching from PubMed: {e}")
        else:
            # Fetch recent papers
            try:
                papers = PaperFetcherService.fetch_recent_papers(
                    sources=request.sources,
                    max_per_source=request.max_per_source
                )
            except Exception as e:
                print(f"Error fetching recent papers: {e}")
        
        if not papers:
            return []
        
        # Save papers to database (avoid duplicates)
        saved_papers = []
        for paper_data in papers:
            # Ensure required fields exist
            if not paper_data.get("title") or not paper_data.get("authors"):
                continue
                
            # Check if paper already exists by title
            existing = db.query(Paper).filter(Paper.title == paper_data["title"]).first()
            if not existing:
                db_paper = Paper(**paper_data)
                db.add(db_paper)
                saved_papers.append(db_paper)
            else:
                saved_papers.append(existing)
        
        db.commit()
        
        # Refresh all papers
        for paper in saved_papers:
            db.refresh(paper)
        
        return saved_papers
    except Exception as e:
        print(f"Error in fetch_external_papers: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching papers: {str(e)}")

# Chat endpoint for conversational recommendations
@app.post("/api/chat/recommendations", response_model=ChatResponse)
async def chat_recommendations(
    request: ChatRequest,
    db: Session = Depends(get_db)
):
    """Get recommendations through conversational interface"""
    result = chat_service.get_conversational_recommendations(
        user_id=request.user_id,
        message=request.message,
        db=db,
        limit=request.limit
    )
    
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    
    return ChatResponse(**result)

# ============================================
# ONBOARDING ENDPOINTS
# ============================================

@app.post("/api/onboarding/complete", response_model=OnboardingResponse)
async def complete_onboarding(
    data: OnboardingData,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Complete user onboarding with preferences"""
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Update user with onboarding data
    user.user_type = data.user_type
    user.primary_goal = data.primary_goal
    user.weekly_paper_goal = data.weekly_paper_goal
    user.experience_level = data.experience_level
    user.onboarding_completed = True

    if data.research_interests:
        user.research_interests = data.research_interests
    if data.preferred_domains:
        user.preferred_domains = ", ".join(data.preferred_domains)

    db.commit()
    db.refresh(user)

    return OnboardingResponse(
        user=UserResponse.model_validate(user),
        message="Onboarding completed successfully!",
        suggested_papers_count=10
    )


@app.get("/api/onboarding/status")
async def get_onboarding_status(
    current_user: User = Depends(get_current_user)
):
    """Check if user has completed onboarding"""
    return {
        "onboarding_completed": current_user.onboarding_completed or False,
        "user_type": current_user.user_type.value if current_user.user_type else None,
        "primary_goal": current_user.primary_goal.value if current_user.primary_goal else None,
    }


# ============================================
# READING HABITS ENDPOINTS
# ============================================

@app.get("/api/users/{user_id}/reading-habits", response_model=ReadingHabitsResponse)
async def get_reading_habits(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user's reading habits and streak data"""
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    habits = ReadingHabitsTracker.get_reading_habits(user_id, db)
    return ReadingHabitsResponse(**habits)


@app.put("/api/users/{user_id}/weekly-goal")
async def update_weekly_goal(
    user_id: int,
    weekly_goal: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update user's weekly paper reading goal"""
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    result = ReadingHabitsTracker.update_weekly_goal(user_id, weekly_goal, db)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


# ============================================
# EXPLORE/EXPLOIT ADVISOR ENDPOINTS
# ============================================

@app.get("/api/users/{user_id}/explore-exploit", response_model=ExploreExploitResponse)
async def get_explore_exploit_analysis(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get explore/exploit analysis and recommendations"""
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    analysis = ExploreExploitAdvisor.analyze_user(user_id, db)
    return ExploreExploitResponse(**analysis)


@app.get("/api/users/{user_id}/domain-expertise", response_model=DomainExpertiseResponse)
async def get_domain_expertise(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get domain expertise radar data"""
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    analysis = ExploreExploitAdvisor.analyze_user(user_id, db)

    # Transform for radar chart
    domains = analysis.get("domain_expertise", [])
    max_papers = max((d["papers"] for d in domains), default=1)

    radar_domains = []
    for d in domains[:8]:  # Max 8 domains for radar
        radar_domains.append({
            "name": d["domain"],
            "value": round(d["papers"] / max_papers, 2) if max_papers > 0 else 0,
            "papers_count": d["papers"],
            "depth": d["depth"],
        })

    # Determine expertise level
    total_papers = sum(d["papers"] for d in domains)
    avg_depth = sum(d["depth"] for d in domains) / len(domains) if domains else 0

    if total_papers >= 50 and avg_depth >= 0.6:
        expertise_level = "expert"
    elif total_papers >= 20 and avg_depth >= 0.4:
        expertise_level = "proficient"
    elif total_papers >= 5:
        expertise_level = "developing"
    else:
        expertise_level = "novice"

    # Identify strong and growth areas
    strong_areas = [d["domain"] for d in domains if d["depth"] >= 0.6][:3]
    growth_areas = [d["domain"] for d in domains if d["depth"] < 0.4 and d["papers"] >= 2][:3]

    return DomainExpertiseResponse(
        domains=radar_domains,
        total_domains=len(domains),
        expertise_level=expertise_level,
        growth_areas=growth_areas,
        strong_areas=strong_areas,
    )


# ============================================
# UNDERSTANDING LEVELS ENDPOINT
# ============================================

@app.get("/api/understanding-levels")
async def get_understanding_levels():
    """Get all available understanding levels with descriptions"""
    return {
        "levels": [
            {
                "value": "want_to_read",
                "label": "Want to Read",
                "description": "Queued for future reading",
                "icon": "bookmark",
                "color": "gray"
            },
            {
                "value": "skimmed",
                "label": "Skimmed",
                "description": "Glanced at, got the gist",
                "icon": "eye",
                "color": "yellow"
            },
            {
                "value": "reading",
                "label": "Reading",
                "description": "Currently working through",
                "icon": "book-open",
                "color": "blue"
            },
            {
                "value": "read",
                "label": "Read",
                "description": "Understood main contribution",
                "icon": "check",
                "color": "green"
            },
            {
                "value": "studied",
                "label": "Studied",
                "description": "Deep understanding, could explain to others",
                "icon": "graduation-cap",
                "color": "purple"
            },
            {
                "value": "implemented",
                "label": "Implemented",
                "description": "Built on or reproduced the work",
                "icon": "code",
                "color": "indigo"
            },
            {
                "value": "cited",
                "label": "Cited",
                "description": "Used in own publications",
                "icon": "quote",
                "color": "pink"
            }
        ]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
