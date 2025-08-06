"""
AtaMind - AI-powered Turkish children's education platform
Main FastAPI application
"""

from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import uvicorn
import os
from pathlib import Path

# Import our modules
from app.database import get_db, create_tables
from app.auth import mock_get_current_user

# Initialize FastAPI app
app = FastAPI(
    title="AtaMind",
    description="AI-powered Turkish children's education platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Basic API endpoints
@app.get("/api/health")
async def api_health():
    return {"status": "healthy", "service": "AtaMind Python API"}

@app.get("/api/auth/user")
async def get_user(current_user: dict = Depends(mock_get_current_user)):
    return {
        "id": current_user["id"],
        "email": current_user["email"],
        "name": current_user.get("name", "Test User"),
        "profile_image_url": "https://images.unsplash.com/photo-1607346256330-dee7af15f7c5?w=100&h=100&fit=crop"
    }

# Serve static files
app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    create_tables()
    print("🌈 AtaMind Python backend started successfully! 🌈")

@app.get("/")
async def read_root():
    """Serve the main application"""
    return FileResponse("static/index.html")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "AtaMind"}

@app.post("/api/generate-story")
async def generate_story(
    child_name: str,
    parent_message: str,
    current_user: dict = Depends(mock_get_current_user)
):
    """Generate AI-powered story (simplified version)"""
    return {
        "id": f"story_{child_name}_001",
        "title": f"{child_name} ve Büyük Keşif",
        "content": f"Bir zamanlar {child_name} adında çok meraklı bir çocuk varmış. Bu çocuk her gün yeni şeyler öğrenmeyi çok severmiş...",
        "values_taught": ["merak", "öğrenme", "cesaret"],
        "cultural_elements": ["Türk masalları", "aile değerleri"],
        "audio_url": "/uploads/story_audio.mp3",
        "image_url": "https://images.unsplash.com/photo-1544376798-89aa6b82c6ce?w=400&h=300&fit=crop",
        "duration": 5.2,
        "difficulty_level": "easy"
    }

@app.post("/api/upload-voice")
async def upload_voice(
    file: UploadFile = File(...),
    current_user: dict = Depends(mock_get_current_user)
):
    """Upload and process voice recording (simplified version)"""
    return {
        "transcript": "Sesli mesaj başarıyla analiz edildi.",
        "emotions": {"love": 0.8, "hope": 0.7, "patience": 0.6},
        "values_extracted": ["sevgi", "sabır", "anlayış"],
        "recommendations": ["Çocuğunuzla daha fazla zaman geçirin", "Hikaye anlatımını günlük rutininize ekleyin"]
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )