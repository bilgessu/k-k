"""
Analytics and Reporting System for AtaMind
"""

import json
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, and_

from .models import (
    Child, ActivityRating, UsageSession, BiweeklyReport, 
    VoiceRecording, Story, ListeningHistory
)

class AnalyticsEngine:
    """Analytics engine for tracking child usage and generating insights"""
    
    def __init__(self, db: Session):
        self.db = db
    
    async def record_activity_rating(
        self, 
        child_id: str, 
        activity_type: str, 
        rating: int,
        activity_id: Optional[str] = None,
        feedback_text: Optional[str] = None
    ) -> ActivityRating:
        """Record child's rating for an activity"""
        
        rating_record = ActivityRating(
            id=f"rating_{datetime.now().timestamp()}",
            child_id=child_id,
            activity_type=activity_type,
            activity_id=activity_id,
            rating=max(1, min(5, rating)),  # Ensure 1-5 range
            feedback_text=feedback_text
        )
        
        self.db.add(rating_record)
        self.db.commit()
        self.db.refresh(rating_record)
        
        # Update session statistics
        await self._update_session_stats(child_id, rating)
        
        return rating_record
    
    async def start_usage_session(self, child_id: str, parent_id: str) -> str:
        """Start a new usage session"""
        
        session_id = f"session_{child_id}_{datetime.now().timestamp()}"
        
        session = UsageSession(
            id=session_id,
            child_id=child_id,
            parent_id=parent_id,
            session_start=datetime.now()
        )
        
        self.db.add(session)
        self.db.commit()
        
        return session_id
    
    async def end_usage_session(self, session_id: str, activities_completed: int = 0):
        """End a usage session and calculate statistics"""
        
        session = self.db.query(UsageSession).filter(
            UsageSession.id == session_id
        ).first()
        
        if session:
            session.session_end = datetime.now()
            session.duration_minutes = (
                session.session_end - session.session_start
            ).total_seconds() / 60
            session.activities_completed = activities_completed
            
            # Calculate average rating for this session
            avg_rating = self.db.query(func.avg(ActivityRating.rating)).filter(
                and_(
                    ActivityRating.child_id == session.child_id,
                    ActivityRating.rated_at >= session.session_start
                )
            ).scalar()
            
            session.average_rating = avg_rating or 0
            self.db.commit()
    
    def get_usage_statistics(self, child_id: str) -> Dict[str, Any]:
        """Get comprehensive usage statistics for a child"""
        
        today = datetime.now().date()
        week_start = today - timedelta(days=7)
        
        # Today's stats
        today_sessions = self.db.query(UsageSession).filter(
            and_(
                UsageSession.child_id == child_id,
                func.date(UsageSession.session_start) == today
            )
        ).all()
        
        today_time = sum(s.duration_minutes or 0 for s in today_sessions)
        today_activities = sum(s.activities_completed or 0 for s in today_sessions)
        
        # Week's stats
        week_sessions = self.db.query(UsageSession).filter(
            and_(
                UsageSession.child_id == child_id,
                func.date(UsageSession.session_start) >= week_start
            )
        ).all()
        
        week_time = sum(s.duration_minutes or 0 for s in week_sessions)
        week_activities = sum(s.activities_completed or 0 for s in week_sessions)
        
        # Recent ratings
        recent_ratings = self.db.query(ActivityRating).filter(
            ActivityRating.child_id == child_id
        ).order_by(ActivityRating.rated_at.desc()).limit(10).all()
        
        # Average rating
        avg_rating = self.db.query(func.avg(ActivityRating.rating)).filter(
            ActivityRating.child_id == child_id
        ).scalar() or 0
        
        return {
            "total_time_today": round(today_time, 1),
            "total_time_week": round(week_time, 1),
            "activities_completed_today": today_activities,
            "activities_completed_week": week_activities,
            "average_rating": round(avg_rating, 1),
            "recent_ratings": [
                {
                    "id": r.id,
                    "activity_type": r.activity_type,
                    "rating": r.rating,
                    "feedback_text": r.feedback_text,
                    "rated_at": r.rated_at
                } for r in recent_ratings
            ]
        }
    
    async def generate_biweekly_report(self, child_id: str, parent_id: str) -> BiweeklyReport:
        """Generate comprehensive biweekly report"""
        
        end_date = datetime.now()
        start_date = end_date - timedelta(days=14)
        
        # Get child profile
        child = self.db.query(Child).filter(Child.id == child_id).first()
        
        # Usage statistics
        sessions = self.db.query(UsageSession).filter(
            and_(
                UsageSession.child_id == child_id,
                UsageSession.session_start >= start_date
            )
        ).all()
        
        total_time = sum(s.duration_minutes or 0 for s in sessions)
        total_activities = sum(s.activities_completed or 0 for s in sessions)
        avg_session_length = total_time / len(sessions) if sessions else 0
        
        # Activity ratings analysis
        ratings = self.db.query(ActivityRating).filter(
            and_(
                ActivityRating.child_id == child_id,
                ActivityRating.rated_at >= start_date
            )
        ).all()
        
        # Content type analysis
        content_types = {}
        for rating in ratings:
            content_type = rating.activity_type
            if content_type not in content_types:
                content_types[content_type] = {
                    "count": 0, 
                    "avg_rating": 0, 
                    "total_rating": 0
                }
            content_types[content_type]["count"] += 1
            content_types[content_type]["total_rating"] += rating.rating
        
        # Calculate averages
        for content_type in content_types:
            data = content_types[content_type]
            data["avg_rating"] = data["total_rating"] / data["count"]
        
        # Voice message specific analysis
        voice_ratings = [r for r in ratings if r.activity_type == "voice_message"]
        voice_analysis = {
            "total_voice_ratings": len(voice_ratings),
            "average_voice_rating": sum(r.rating for r in voice_ratings) / len(voice_ratings) if voice_ratings else 0,
            "voice_feedback": [r.feedback_text for r in voice_ratings if r.feedback_text],
            "improvement_suggestions": await self._generate_voice_improvement_suggestions(voice_ratings)
        }
        
        # AI-powered insights
        ai_insights = await self._generate_ai_insights(child, sessions, ratings)
        
        # Create report
        report = BiweeklyReport(
            id=f"report_{child_id}_{datetime.now().timestamp()}",
            child_id=child_id,
            parent_id=parent_id,
            report_period_start=start_date,
            report_period_end=end_date,
            total_time_spent=total_time,
            activities_completed=total_activities,
            average_session_length=avg_session_length,
            favorite_content_types=content_types,
            most_rated_activities=self._get_most_rated_activities(ratings),
            voice_message_ratings=voice_analysis,
            child_development_insights=ai_insights,
            engagement_patterns=self._analyze_engagement_patterns(sessions, ratings),
            recommended_activities=await self._generate_activity_recommendations(child, ratings)
        )
        
        self.db.add(report)
        self.db.commit()
        self.db.refresh(report)
        
        return report
    
    async def _update_session_stats(self, child_id: str, rating: int):
        """Update current session statistics"""
        
        # Get latest session
        latest_session = self.db.query(UsageSession).filter(
            and_(
                UsageSession.child_id == child_id,
                UsageSession.session_end.is_(None)
            )
        ).order_by(UsageSession.session_start.desc()).first()
        
        if latest_session:
            latest_session.activities_completed += 1
            self.db.commit()
    
    async def _generate_voice_improvement_suggestions(self, voice_ratings: List[ActivityRating]) -> List[str]:
        """Generate suggestions for improving parent voice messages"""
        
        if not voice_ratings:
            return ["Henüz sesli mesaj puanlaması yok."]
        
        avg_rating = sum(r.rating for r in voice_ratings) / len(voice_ratings)
        feedback_texts = [r.feedback_text for r in voice_ratings if r.feedback_text]
        
        prompt = f"""
        Ebeveyn sesli mesajları için iyileştirme önerileri oluştur:
        
        Ortalama Puan: {avg_rating}/5
        Çocuk Geri Bildirimleri: {feedback_texts}
        Toplam Puan Sayısı: {len(voice_ratings)}
        
        Türkçe olarak 3-5 pratik öneri ver:
        """
        
        try:
            import google.generativeai as genai
            model = genai.GenerativeModel('gemini-2.5-pro')
            response = await model.generate_content(prompt)
            suggestions = response.text.split('\n')
            return [s.strip() for s in suggestions if s.strip()]
        except:
            return [
                "Sesli mesajlarda daha fazla duygusal bağ kurun",
                "Çocuğunuzun yaşına uygun dil kullanın", 
                "Hikayelerde daha fazla etkileşim ekleyin"
            ]
    
    async def _generate_ai_insights(self, child: Child, sessions: List[UsageSession], ratings: List[ActivityRating]) -> Dict[str, Any]:
        """Generate AI-powered insights about child's development and engagement"""
        
        prompt = f"""
        Bu çocuk için gelişim analizi yap:
        
        Çocuk: {child.name}, {child.age} yaş
        İlgi Alanları: {child.interests}
        
        2 Haftalık Veriler:
        - Toplam Oturum: {len(sessions)}
        - Toplam Aktivite Puanı: {len(ratings)}
        - Ortalama Puan: {sum(r.rating for r in ratings) / len(ratings) if ratings else 0}
        
        JSON formatında analiz döndür:
        {{
            "gelişim_alanları": ["liste"],
            "güçlü_yönler": ["liste"],
            "dikkat_edilmesi_gerekenler": ["liste"],
            "önerilen_aktiviteler": ["liste"],
            "ebeveyn_rehberliği": ["liste"]
        }}
        """
        
        try:
            import google.generativeai as genai
            model = genai.GenerativeModel('gemini-2.5-pro')
            response = await model.generate_content(prompt)
            return json.loads(response.text)
        except:
            return {
                "gelişim_alanları": ["Yaratıcılık", "Problem çözme"],
                "güçlü_yönler": ["Hikaye dinleme", "Etkileşimli içerik"],
                "dikkat_edilmesi_gerekenler": ["Ekran süresi dengesi"],
                "önerilen_aktiviteler": ["Daha fazla sesli hikaye"],
                "ebeveyn_rehberliği": ["Günlük rutinlere entegrasyon"]
            }
    
    def _analyze_engagement_patterns(self, sessions: List[UsageSession], ratings: List[ActivityRating]) -> Dict[str, Any]:
        """Analyze child's engagement patterns"""
        
        # Time-based patterns
        session_times = [s.session_start.hour for s in sessions]
        peak_hours = {}
        for hour in session_times:
            peak_hours[hour] = peak_hours.get(hour, 0) + 1
        
        # Rating patterns
        rating_trends = []
        for rating in sorted(ratings, key=lambda x: x.rated_at):
            rating_trends.append({
                "date": rating.rated_at.date().isoformat(),
                "rating": rating.rating,
                "activity_type": rating.activity_type
            })
        
        return {
            "peak_usage_hours": peak_hours,
            "rating_trends": rating_trends,
            "favorite_activities": self._get_favorite_activities(ratings),
            "engagement_score": self._calculate_engagement_score(sessions, ratings)
        }
    
    def _get_favorite_activities(self, ratings: List[ActivityRating]) -> List[Dict[str, Any]]:
        """Get child's favorite activities based on ratings"""
        
        activity_scores = {}
        for rating in ratings:
            if rating.activity_type not in activity_scores:
                activity_scores[rating.activity_type] = []
            activity_scores[rating.activity_type].append(rating.rating)
        
        favorites = []
        for activity, scores in activity_scores.items():
            avg_score = sum(scores) / len(scores)
            favorites.append({
                "activity_type": activity,
                "average_rating": round(avg_score, 1),
                "total_ratings": len(scores)
            })
        
        return sorted(favorites, key=lambda x: x["average_rating"], reverse=True)
    
    def _calculate_engagement_score(self, sessions: List[UsageSession], ratings: List[ActivityRating]) -> float:
        """Calculate overall engagement score"""
        
        if not sessions and not ratings:
            return 0
        
        # Factors: session frequency, duration, rating consistency
        session_score = len(sessions) / 14 * 100  # Sessions per day * 100
        
        if ratings:
            rating_score = sum(r.rating for r in ratings) / len(ratings) / 5 * 100
        else:
            rating_score = 0
        
        avg_duration = sum(s.duration_minutes or 0 for s in sessions) / len(sessions) if sessions else 0
        duration_score = min(avg_duration / 30 * 100, 100)  # Optimal ~30 min sessions
        
        return round((session_score + rating_score + duration_score) / 3, 1)
    
    def _get_most_rated_activities(self, ratings: List[ActivityRating]) -> List[Dict[str, Any]]:
        """Get most rated activities"""
        
        activity_counts = {}
        for rating in ratings:
            key = f"{rating.activity_type}_{rating.activity_id or 'general'}"
            if key not in activity_counts:
                activity_counts[key] = {
                    "activity_type": rating.activity_type,
                    "activity_id": rating.activity_id,
                    "count": 0,
                    "avg_rating": 0,
                    "total_rating": 0
                }
            activity_counts[key]["count"] += 1
            activity_counts[key]["total_rating"] += rating.rating
        
        # Calculate averages and sort
        most_rated = []
        for data in activity_counts.values():
            data["avg_rating"] = data["total_rating"] / data["count"]
            most_rated.append(data)
        
        return sorted(most_rated, key=lambda x: x["count"], reverse=True)[:10]
    
    async def _generate_activity_recommendations(self, child: Child, ratings: List[ActivityRating]) -> List[str]:
        """Generate personalized activity recommendations"""
        
        high_rated_activities = [r for r in ratings if r.rating >= 4]
        low_rated_activities = [r for r in ratings if r.rating <= 2]
        
        prompt = f"""
        {child.name} ({child.age} yaş) için aktivite önerileri oluştur:
        
        Beğendiği Aktiviteler: {[r.activity_type for r in high_rated_activities]}
        Beğenmediği Aktiviteler: {[r.activity_type for r in low_rated_activities]}
        İlgi Alanları: {child.interests}
        
        5 kişiselleştirilmiş aktivite önerisi ver (Türkçe):
        """
        
        try:
            import google.generativeai as genai
            model = genai.GenerativeModel('gemini-2.5-pro')
            response = await model.generate_content(prompt)
            return response.text.split('\n')[:5]
        except:
            return [
                "Interaktif Türk masalları",
                "Sesli oyunlar ve bilmeceler", 
                "Yaratıcı hikaye tamamlama",
                "Kültürel değer oyunları",
                "Müzikli eğitim aktiviteleri"
            ]