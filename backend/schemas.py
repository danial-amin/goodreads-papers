# ... existing code ...
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from models import InteractionStatus

class PaperBase(BaseModel):
    title: str
    authors: str
    abstract: str
    venue: Optional[str] = None
    year: Optional[int] = None
    url: Optional[str] = None
    doi: Optional[str] = None
    keywords: Optional[str] = None

class PaperCreate(PaperBase):
    pass

class PaperUpdate(BaseModel):
    title: Optional[str] = None
    authors: Optional[str] = None
    abstract: Optional[str] = None
    venue: Optional[str] = None
    year: Optional[int] = None
    url: Optional[str] = None
    doi: Optional[str] = None
    keywords: Optional[str] = None
    smart_tags: Optional[str] = None
    domains: Optional[str] = None

class PaperResponse(PaperBase):
    id: int
    smart_tags: Optional[str] = None
    domains: Optional[str] = None
    citation_count: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class UserBase(BaseModel):
    username: str
    email: EmailStr
    name: Optional[str] = None
    bio: Optional[str] = None
    research_interests: Optional[str] = None
    preferred_domains: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Multi-step signup schemas
class SignupStep1(BaseModel):
    """Basic signup - username, email, password"""
    username: str
    email: EmailStr
    password: str

class SignupStep2(BaseModel):
    """Research interests and domains"""
    research_interests: Optional[str] = None
    preferred_domains: Optional[List[str]] = None
    academic_level: Optional[str] = None  # undergraduate, graduate, postdoc, faculty, industry
    primary_field: Optional[str] = None

class SignupStep3(BaseModel):
    """Additional preferences"""
    reading_goals: Optional[str] = None  # stay current, deep dive, explore new areas
    preferred_venues: Optional[List[str]] = None
    topics_of_interest: Optional[List[str]] = None

class GuestInteractionCreate(BaseModel):
    """Guest interaction (stored in session, migrated on signup)"""
    paper_id: int
    rating: Optional[int] = None
    status: Optional[InteractionStatus] = InteractionStatus.WANT_TO_READ
    notes: Optional[str] = None
    guest_session_id: Optional[str] = None  # For tracking guest sessions

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class InteractionCreate(BaseModel):
    user_id: int
    paper_id: int
    rating: Optional[int] = None
    status: Optional[InteractionStatus] = InteractionStatus.WANT_TO_READ
    notes: Optional[str] = None

class RecommendationResponse(BaseModel):
    paper: PaperResponse
    score: float
    reason: str

class ChatRequest(BaseModel):
    user_id: int
    message: str
    limit: Optional[int] = 5

class ChatResponse(BaseModel):
    recommendations: List[RecommendationResponse]
    message: str

class FetchPapersRequest(BaseModel):
    sources: List[str] = ["arxiv"]
    query: Optional[str] = None
    max_per_source: int = 20

class BibTeXUploadRequest(BaseModel):
    bibtex_content: str

class PaperURLUpdate(BaseModel):
    url: Optional[str] = None
    doi: Optional[str] = None

class UserReadingPatternResponse(BaseModel):
    total_papers: int
    read_count: int
    favorite_count: int
    reading_velocity: float
    favorite_domains: List[str]
    favorite_venues: List[str]
    top_keywords: List[str]
    reading_timeline: List[dict]
    insights: List[str]
