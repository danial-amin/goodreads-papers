from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from models import InteractionStatus, UserType, UserGoal

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
    user_type: Optional[UserType] = None
    primary_goal: Optional[UserGoal] = None
    weekly_paper_goal: Optional[int] = 3
    experience_level: Optional[str] = None
    onboarding_completed: Optional[bool] = False
    current_streak: Optional[int] = 0
    longest_streak: Optional[int] = 0

    class Config:
        from_attributes = True


# Onboarding schemas
class OnboardingData(BaseModel):
    """Complete onboarding data submitted at once"""
    user_type: UserType
    primary_goal: UserGoal
    weekly_paper_goal: int = 3
    experience_level: str  # beginner, intermediate, expert
    research_interests: Optional[str] = None
    preferred_domains: Optional[List[str]] = None


class OnboardingResponse(BaseModel):
    user: UserResponse
    message: str
    suggested_papers_count: int = 0

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


# Reading Habits Dashboard schemas
class ReadingHabitsResponse(BaseModel):
    """Comprehensive reading habits data"""
    # Streak info
    current_streak: int
    longest_streak: int
    streak_status: str  # "on_track", "at_risk", "broken"

    # Weekly progress
    weekly_goal: int
    papers_this_week: int
    week_progress_percent: float

    # Understanding levels breakdown
    understanding_breakdown: dict  # {status: count}

    # Velocity metrics
    papers_last_7_days: int
    papers_last_30_days: int
    avg_papers_per_week: float

    # Timeline for charts
    weekly_history: List[dict]  # [{week: "2024-W01", count: 5}, ...]

    # Insights
    habit_insights: List[str]


# Explore/Exploit Advisor schemas
class ExploreExploitResponse(BaseModel):
    """Explore vs Exploit analysis and recommendations"""
    # Current mode
    current_mode: str  # "exploring", "exploiting", "balanced"
    mode_confidence: float  # 0-1

    # Metrics
    domain_diversity_score: float  # 0-1, higher = more diverse
    depth_score: float  # 0-1, higher = deeper in primary domain
    breadth_score: float  # number of distinct domains

    # Domain breakdown
    domain_expertise: List[dict]  # [{domain: "NLP", papers: 15, depth: 0.8}, ...]
    primary_domain: Optional[str]
    emerging_interests: List[str]

    # Recommendation
    recommendation: str  # "go_deep", "explore_adjacent", "cross_pollinate", "maintain_balance"
    recommendation_reason: str
    suggested_domains: List[str]

    # Actionable suggestions
    suggested_actions: List[dict]  # [{action: "Read foundational X paper", priority: "high"}, ...]


# Domain Expertise Radar schemas
class DomainExpertiseResponse(BaseModel):
    """Radar chart data for domain expertise"""
    domains: List[dict]  # [{name: "NLP", value: 0.8, papers_count: 15}, ...]
    total_domains: int
    expertise_level: str  # "novice", "developing", "proficient", "expert"
    growth_areas: List[str]
    strong_areas: List[str]
