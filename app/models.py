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