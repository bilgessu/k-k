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
from app.analytics import AnalyticsEngine
from app.models import ActivityRatingCreate, UsageStatsResponse, BiweeklyReportResponse

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

# Activity Rating Endpoints
@app.post("/api/activity-rating")
async def rate_activity(
    child_id: str,
    rating_data: ActivityRatingCreate,
    current_user: dict = Depends(mock_get_current_user),
    db: Session = Depends(get_db)
):
    """Çocuk aktivite puanlaması"""
    analytics = AnalyticsEngine(db)
    
    rating_record = await analytics.record_activity_rating(
        child_id=child_id,
        activity_type=rating_data.activity_type,
        rating=rating_data.rating,
        activity_id=rating_data.activity_id,
        feedback_text=rating_data.feedback_text
    )
    
    return {
        "id": rating_record.id,
        "message": f"Aktivite {rating_data.rating} yıldız ile puanlandı!",
        "child_encouragement": "Harika! Puanını kaydettik. Teşekkürler! ⭐" * rating_data.rating
    }

@app.get("/api/child/{child_id}/usage-stats", response_model=UsageStatsResponse)
async def get_usage_stats(
    child_id: str,
    current_user: dict = Depends(mock_get_current_user),
    db: Session = Depends(get_db)
):
    """Çocuğun uygulama kullanım istatistikleri"""
    analytics = AnalyticsEngine(db)
    stats = analytics.get_usage_statistics(child_id)
    return stats

@app.post("/api/start-session")
async def start_session(
    child_id: str,
    current_user: dict = Depends(mock_get_current_user),
    db: Session = Depends(get_db)
):
    """Uygulama oturumu başlat"""
    analytics = AnalyticsEngine(db)
    session_id = await analytics.start_usage_session(child_id, current_user["id"])
    
    return {
        "session_id": session_id,
        "message": f"Oturum başlatıldı! Eğlenceli dakikalar geçirin! 🌈"
    }

@app.post("/api/end-session")
async def end_session(
    session_id: str,
    activities_completed: int = 0,
    current_user: dict = Depends(mock_get_current_user),
    db: Session = Depends(get_db)
):
    """Uygulama oturumu bitir"""
    analytics = AnalyticsEngine(db)
    await analytics.end_usage_session(session_id, activities_completed)
    
    return {
        "message": f"Oturum tamamlandı! {activities_completed} aktivite bitirdin. Aferin! 🎉"
    }

@app.post("/api/child/{child_id}/generate-report", response_model=BiweeklyReportResponse)
async def generate_biweekly_report(
    child_id: str,
    current_user: dict = Depends(mock_get_current_user),
    db: Session = Depends(get_db)
):
    """2 haftalık kapsamlı rapor oluştur"""
    analytics = AnalyticsEngine(db)
    report = await analytics.generate_biweekly_report(child_id, current_user["id"])
    
    return BiweeklyReportResponse(
        id=report.id,
        report_period_start=report.report_period_start,
        report_period_end=report.report_period_end,
        total_time_spent=report.total_time_spent,
        activities_completed=report.activities_completed,
        average_session_length=report.average_session_length,
        favorite_content_types=report.favorite_content_types or {},
        voice_message_ratings=report.voice_message_ratings or {},
        child_development_insights=report.child_development_insights or {},
        engagement_patterns=report.engagement_patterns or {},
        recommended_activities=report.recommended_activities or []
    )

@app.get("/api/child/{child_id}/reports")
async def get_child_reports(
    child_id: str,
    current_user: dict = Depends(mock_get_current_user),
    db: Session = Depends(get_db)
):
    """Çocuğun tüm raporlarını getir"""
    from app.models import BiweeklyReport
    
    reports = db.query(BiweeklyReport).filter(
        BiweeklyReport.child_id == child_id,
        BiweeklyReport.parent_id == current_user["id"]
    ).order_by(BiweeklyReport.created_at.desc()).all()
    
    return [
        {
            "id": r.id,
            "period_start": r.report_period_start,
            "period_end": r.report_period_end,
            "total_time": r.total_time_spent,
            "activities": r.activities_completed,
            "voice_rating_avg": r.voice_message_ratings.get("average_voice_rating", 0) if r.voice_message_ratings else 0,
            "created_at": r.created_at
        } for r in reports
    ]

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )