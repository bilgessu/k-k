"""
API Routes for AtaMind
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import uuid
from datetime import datetime

from .database import get_db
from .auth import mock_get_current_user
from .models import *

# Authentication routes
auth_router = APIRouter()

@auth_router.get("/user", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(mock_get_current_user)):
    """Get current user information"""
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        first_name=current_user.get("name", "Test User"),
        last_name="",
        profile_image_url="https://images.unsplash.com/photo-1607346256330-dee7af15f7c5?w=100&h=100&fit=crop",
        created_at=datetime.now()
    )

# Children management routes
children_router = APIRouter()

@children_router.post("/", response_model=ChildResponse)
async def create_child(
    child_data: ChildCreate,
    current_user: dict = Depends(mock_get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new child profile"""
    child_id = str(uuid.uuid4())
    
    db_child = Child(
        id=child_id,
        parent_id=current_user["id"],
        name=child_data.name,
        age=child_data.age,
        interests=child_data.interests,
        learning_style=child_data.learning_style,
        cultural_background=child_data.cultural_background
    )
    
    db.add(db_child)
    db.commit()
    db.refresh(db_child)
    
    return ChildResponse(
        id=db_child.id,
        name=db_child.name,
        age=db_child.age,
        interests=db_child.interests,
        learning_style=db_child.learning_style,
        personality_traits=db_child.personality_traits,
        cultural_background=db_child.cultural_background,
        created_at=db_child.created_at
    )

@children_router.get("/", response_model=List[ChildResponse])
async def get_children(
    current_user: dict = Depends(mock_get_current_user),
    db: Session = Depends(get_db)
):
    """Get all children for current user"""
    children = db.query(Child).filter(Child.parent_id == current_user["id"]).all()
    
    return [ChildResponse(
        id=child.id,
        name=child.name,
        age=child.age,
        interests=child.interests or [],
        learning_style=child.learning_style,
        personality_traits=child.personality_traits,
        cultural_background=child.cultural_background,
        created_at=child.created_at
    ) for child in children]

@children_router.get("/{child_id}", response_model=ChildResponse)
async def get_child(
    child_id: str,
    current_user: dict = Depends(mock_get_current_user),
    db: Session = Depends(get_db)
):
    """Get specific child"""
    child = db.query(Child).filter(
        Child.id == child_id,
        Child.parent_id == current_user["id"]
    ).first()
    
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")
    
    return ChildResponse(
        id=child.id,
        name=child.name,
        age=child.age,
        interests=child.interests or [],
        learning_style=child.learning_style,
        personality_traits=child.personality_traits,
        cultural_background=child.cultural_background,
        created_at=child.created_at
    )

# Stories routes
stories_router = APIRouter()

@stories_router.get("/", response_model=List[StoryResponse])
async def get_stories(
    current_user: dict = Depends(mock_get_current_user),
    db: Session = Depends(get_db)
):
    """Get all stories for current user"""
    stories = db.query(Story).filter(Story.user_id == current_user["id"]).all()
    
    return [StoryResponse(
        id=story.id,
        title=story.title,
        content=story.content,
        values_taught=story.values_taught or [],
        audio_url=story.audio_url,
        image_url=story.image_url,
        duration=story.duration,
        difficulty_level=story.difficulty_level,
        cultural_elements=story.cultural_elements or [],
        created_at=story.created_at
    ) for story in stories]

@stories_router.get("/{story_id}", response_model=StoryResponse)
async def get_story(
    story_id: str,
    current_user: dict = Depends(mock_get_current_user),
    db: Session = Depends(get_db)
):
    """Get specific story"""
    story = db.query(Story).filter(
        Story.id == story_id,
        Story.user_id == current_user["id"]
    ).first()
    
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    
    return StoryResponse(
        id=story.id,
        title=story.title,
        content=story.content,
        values_taught=story.values_taught or [],
        audio_url=story.audio_url,
        image_url=story.image_url,
        duration=story.duration,
        difficulty_level=story.difficulty_level,
        cultural_elements=story.cultural_elements or [],
        created_at=story.created_at
    )

# Voice processing routes
voice_router = APIRouter()

@voice_router.post("/analyze")
async def analyze_voice(
    file: UploadFile = File(...),
    current_user: dict = Depends(mock_get_current_user)
):
    """Analyze uploaded voice recording"""
    
    # Save uploaded file
    file_path = f"uploads/voice_{current_user['id']}_{file.filename}"
    
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    # Mock voice analysis response
    return {
        "transcript": "Bu bir örnek sesli mesaj transkripsiyonudur.",
        "emotions": {
            "love": 0.8,
            "hope": 0.7,
            "determination": 0.6,
            "patience": 0.5
        },
        "values_extracted": ["saygı", "sevgi", "sorumluluk"],
        "parenting_style": "Destekleyici",
        "recommendations": [
            "Çocuğunuzla hikaye okuma zamanlarını artırın",
            "Türk kültürel değerlerini günlük hayata entegre edin",
            "Sabırlı ve anlayışlı yaklaşımınızı devam ettirin"
        ]
    }

@voice_router.post("/record")
async def save_voice_recording(
    file: UploadFile = File(...),
    transcript: str = "",
    current_user: dict = Depends(mock_get_current_user),
    db: Session = Depends(get_db)
):
    """Save voice recording to database"""
    
    # Save file
    file_path = f"uploads/voice_{current_user['id']}_{datetime.now().timestamp()}_{file.filename}"
    
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    # Save to database
    recording_id = str(uuid.uuid4())
    
    db_recording = VoiceRecording(
        id=recording_id,
        user_id=current_user["id"],
        file_path=file_path,
        transcript=transcript,
        emotion_analysis={"positive": 0.8},
        values_extracted=["sevgi", "sabır"],
        duration=30.0
    )
    
    db.add(db_recording)
    db.commit()
    
    return {"id": recording_id, "file_path": file_path, "status": "saved"}