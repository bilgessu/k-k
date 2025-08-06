"""
Database models for AtaMind
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Float, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

Base = declarative_base()

# SQLAlchemy Models
class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    first_name = Column(String)
    last_name = Column(String)
    profile_image_url = Column(String)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    children = relationship("Child", back_populates="parent")
    stories = relationship("Story", back_populates="user")
    voice_recordings = relationship("VoiceRecording", back_populates="user")

class Child(Base):
    __tablename__ = "children"
    
    id = Column(String, primary_key=True)
    parent_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    interests = Column(JSON)  # List of interests
    learning_style = Column(String)  # visual, auditory, kinesthetic
    personality_traits = Column(JSON)  # Personality analysis
    cultural_background = Column(String, default="Turkish")
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    parent = relationship("User", back_populates="children")
    stories = relationship("Story", back_populates="child")
    listening_history = relationship("ListeningHistory", back_populates="child")

class Story(Base):
    __tablename__ = "stories"
    
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    child_id = Column(String, ForeignKey("children.id"), nullable=False)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    values_taught = Column(JSON)  # List of values/morals
    audio_url = Column(String)
    image_url = Column(String)
    duration = Column(Float)  # Story duration in minutes
    difficulty_level = Column(String)  # easy, medium, hard
    cultural_elements = Column(JSON)  # Turkish cultural references
    ai_analysis = Column(JSON)  # AI-generated insights
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="stories")
    child = relationship("Child", back_populates="stories")
    listening_history = relationship("ListeningHistory", back_populates="story")

class VoiceRecording(Base):
    __tablename__ = "voice_recordings"
    
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    file_path = Column(String, nullable=False)
    transcript = Column(Text)
    emotion_analysis = Column(JSON)  # Detected emotions
    values_extracted = Column(JSON)  # Extracted values/messages
    duration = Column(Float)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="voice_recordings")

class ListeningHistory(Base):
    __tablename__ = "listening_history"
    
    id = Column(String, primary_key=True)
    child_id = Column(String, ForeignKey("children.id"), nullable=False)
    story_id = Column(String, ForeignKey("stories.id"), nullable=False)
    duration_listened = Column(Float)  # Minutes listened
    completion_rate = Column(Float)  # Percentage completed
    engagement_score = Column(Float)  # AI-calculated engagement
    listened_at = Column(DateTime, default=func.now())
    
    # Relationships
    child = relationship("Child", back_populates="listening_history")
    story = relationship("Story", back_populates="listening_history")

class ActivityRating(Base):
    __tablename__ = "activity_ratings"
    
    id = Column(String, primary_key=True)
    child_id = Column(String, ForeignKey("children.id"), nullable=False)
    activity_type = Column(String, nullable=False)  # story, voice_message, game, etc.
    activity_id = Column(String)  # Reference to specific content
    rating = Column(Integer, nullable=False)  # 1-5 stars
    feedback_text = Column(Text)  # Optional child feedback
    rated_at = Column(DateTime, default=func.now())
    
    # Relationships
    child = relationship("Child")

class UsageSession(Base):
    __tablename__ = "usage_sessions"
    
    id = Column(String, primary_key=True)
    child_id = Column(String, ForeignKey("children.id"), nullable=False)
    parent_id = Column(String, ForeignKey("users.id"), nullable=False)
    session_start = Column(DateTime, default=func.now())
    session_end = Column(DateTime)
    duration_minutes = Column(Float)
    activities_completed = Column(Integer, default=0)
    average_rating = Column(Float)
    
    # Relationships
    child = relationship("Child")
    parent = relationship("User")

class BiweeklyReport(Base):
    __tablename__ = "biweekly_reports"
    
    id = Column(String, primary_key=True)
    child_id = Column(String, ForeignKey("children.id"), nullable=False)
    parent_id = Column(String, ForeignKey("users.id"), nullable=False)
    report_period_start = Column(DateTime, nullable=False)
    report_period_end = Column(DateTime, nullable=False)
    
    # Usage Statistics
    total_time_spent = Column(Float)  # Total minutes
    activities_completed = Column(Integer)
    average_session_length = Column(Float)
    
    # Content Analytics
    favorite_content_types = Column(JSON)
    most_rated_activities = Column(JSON)
    learning_progress = Column(JSON)
    
    # Voice Message Analytics
    voice_message_ratings = Column(JSON)
    parent_voice_feedback = Column(JSON)
    recommended_improvements = Column(JSON)
    
    # AI Insights
    child_development_insights = Column(JSON)
    engagement_patterns = Column(JSON)
    recommended_activities = Column(JSON)
    
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    child = relationship("Child")
    parent = relationship("User")

# Pydantic Models for API
class UserCreate(BaseModel):
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    profile_image_url: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    email: str
    first_name: Optional[str]
    last_name: Optional[str]
    profile_image_url: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

class ChildCreate(BaseModel):
    name: str
    age: int
    interests: Optional[List[str]] = []
    learning_style: Optional[str] = "visual"
    cultural_background: Optional[str] = "Turkish"

class ChildResponse(BaseModel):
    id: str
    name: str
    age: int
    interests: Optional[List[str]]
    learning_style: Optional[str]
    personality_traits: Optional[Dict[str, Any]]
    cultural_background: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

class StoryCreate(BaseModel):
    child_id: str
    parent_message: str
    values_to_teach: Optional[List[str]] = []

class StoryResponse(BaseModel):
    id: str
    title: str
    content: str
    values_taught: Optional[List[str]]
    audio_url: Optional[str]
    image_url: Optional[str]
    duration: Optional[float]
    difficulty_level: Optional[str]
    cultural_elements: Optional[List[str]]
    created_at: datetime
    
    class Config:
        from_attributes = True

class VoiceAnalysis(BaseModel):
    transcript: str
    emotions: Dict[str, float]
    values_extracted: List[str]
    parenting_style: str
    recommendations: List[str]

class AIInsights(BaseModel):
    child_development_stage: str
    recommended_values: List[str]
    learning_preferences: Dict[str, Any]
    engagement_tips: List[str]
    cultural_recommendations: List[str]

class ActivityRatingCreate(BaseModel):
    activity_type: str
    activity_id: Optional[str] = None
    rating: int  # 1-5
    feedback_text: Optional[str] = None

class ActivityRatingResponse(BaseModel):
    id: str
    activity_type: str
    rating: int
    feedback_text: Optional[str]
    rated_at: datetime
    
    class Config:
        from_attributes = True

class UsageStatsResponse(BaseModel):
    total_time_today: float
    total_time_week: float
    activities_completed_today: int
    activities_completed_week: int
    average_rating: float
    recent_ratings: List[ActivityRatingResponse]

class BiweeklyReportResponse(BaseModel):
    id: str
    report_period_start: datetime
    report_period_end: datetime
    total_time_spent: float
    activities_completed: int
    average_session_length: float
    favorite_content_types: Dict[str, Any]
    voice_message_ratings: Dict[str, Any]
    child_development_insights: Dict[str, Any]
    engagement_patterns: Dict[str, Any]
    recommended_activities: List[str]
    
    class Config:
        from_attributes = True