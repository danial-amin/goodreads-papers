from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, Enum, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from database import Base

class InteractionStatus(str, enum.Enum):
    WANT_TO_READ = "want_to_read"
    READING = "reading"
    READ = "read"
    FAVORITE = "favorite"

class Paper(Base):
    __tablename__ = "papers"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    authors = Column(String, nullable=False)
    abstract = Column(Text, nullable=False)
    venue = Column(String)  # Conference or journal
    year = Column(Integer)
    url = Column(String)
    doi = Column(String)
    keywords = Column(String)  # Comma-separated
    smart_tags = Column(String)  # Auto-generated tags
    domains = Column(String)  # Research domains
    citation_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    interactions = relationship("UserPaperInteraction", back_populates="paper")

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String)  # Hashed password
    name = Column(String)
    bio = Column(Text)
    research_interests = Column(String)  # Comma-separated
    preferred_domains = Column(String)  # Preferred research domains
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    interactions = relationship("UserPaperInteraction", back_populates="user")

class UserPaperInteraction(Base):
    __tablename__ = "user_paper_interactions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    paper_id = Column(Integer, ForeignKey("papers.id"), nullable=False)
    rating = Column(Integer)  # 1-5 stars
    status = Column(Enum(InteractionStatus), default=InteractionStatus.WANT_TO_READ)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    user = relationship("User", back_populates="interactions")
    paper = relationship("Paper", back_populates="interactions")
