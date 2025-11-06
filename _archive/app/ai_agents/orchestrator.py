"""
AI Orchestrator - Central coordinator for multi-agent AI system
"""

import json
import asyncio
from typing import Dict, List, Any, Optional
import google.generativeai as genai
import openai
import os
from datetime import datetime

from .storyteller_agent import StorytellerAgent
from .guardian_agent import GuardianAgent  
from .child_psychology_agent import ChildPsychologyAgent
from .voice_agent import VoiceAgent
from ..models import Child, VoiceAnalysis, AIInsights

class AIOrchestrator:
    """Central orchestrator for AtaMind's multi-agent AI system"""
    
    def __init__(self):
        # Initialize AI services
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        openai.api_key = os.getenv("OPENAI_API_KEY")
        
        # Initialize specialized agents
        self.storyteller = StorytellerAgent()
        self.guardian = GuardianAgent()
        self.psychology = ChildPsychologyAgent()
        self.voice = VoiceAgent()
        
        # Core Gemini model
        self.model = genai.GenerativeModel('gemini-2.5-pro')
        
    async def generate_story(self, child_profile: Child, parent_message: str, user_id: str) -> Dict[str, Any]:
        """Generate comprehensive story using multi-agent system"""
        
        # Step 1: Analyze child psychology and development
        child_analysis = await self.psychology.analyze_child_profile(child_profile)
        
        # Step 2: Extract values and emotions from parent message
        voice_analysis = await self.voice.analyze_parent_message(parent_message)
        
        # Step 3: Generate story content
        story_content = await self.storyteller.create_story(
            child_profile=child_profile,
            child_analysis=child_analysis,
            parent_message=parent_message,
            voice_analysis=voice_analysis
        )
        
        # Step 4: Safety validation
        safety_check = await self.guardian.validate_content(story_content, child_profile)
        
        if not safety_check["is_safe"]:
            # Regenerate story with safety recommendations
            story_content = await self.storyteller.create_story(
                child_profile=child_profile,
                child_analysis=child_analysis,
                parent_message=parent_message,
                voice_analysis=voice_analysis,
                safety_guidelines=safety_check["recommendations"]
            )
        
        # Step 5: Generate audio narration
        audio_url = await self._generate_audio(story_content["content"])
        
        # Step 6: Create story image
        image_url = await self._generate_image(story_content["title"], story_content["cultural_elements"])
        
        return {
            "id": f"story_{datetime.now().timestamp()}",
            "title": story_content["title"],
            "content": story_content["content"],
            "values_taught": story_content["values_taught"],
            "cultural_elements": story_content["cultural_elements"],
            "audio_url": audio_url,
            "image_url": image_url,
            "duration": story_content["estimated_duration"],
            "difficulty_level": child_analysis["recommended_difficulty"],
            "ai_analysis": {
                "child_insights": child_analysis,
                "voice_analysis": voice_analysis,
                "safety_score": safety_check["safety_score"],
                "engagement_predictions": story_content["engagement_factors"]
            }
        }
    
    async def analyze_voice(self, file_path: str) -> VoiceAnalysis:
        """Comprehensive voice analysis"""
        return await self.voice.analyze_voice_file(file_path)
    
    async def get_child_insights(self, child_profile: Child) -> AIInsights:
        """Get comprehensive child development insights"""
        return await self.psychology.get_comprehensive_insights(child_profile)
    
    async def _generate_audio(self, text: str) -> str:
        """Generate audio narration using OpenAI TTS"""
        try:
            response = await openai.Audio.acreate(
                model="tts-1",
                voice="nova",  # Child-friendly voice
                input=text
            )
            
            # Save audio file
            audio_filename = f"story_audio_{datetime.now().timestamp()}.mp3"
            audio_path = f"uploads/{audio_filename}"
            
            with open(audio_path, "wb") as f:
                f.write(response.content)
            
            return f"/uploads/{audio_filename}"
            
        except Exception as e:
            print(f"Audio generation error: {e}")
            return None
    
    async def _generate_image(self, title: str, cultural_elements: List[str]) -> str:
        """Generate story illustration using Gemini"""
        try:
            prompt = f"""
            Create a beautiful, child-friendly illustration for a Turkish children's story titled "{title}".
            Include these cultural elements: {', '.join(cultural_elements)}.
            Style: Colorful, warm, family-friendly, Turkish cultural themes.
            """
            
            response = await self.model.generate_content([
                {"role": "user", "parts": [{"text": prompt}]},
            ], config={
                "response_modalities": ["TEXT", "IMAGE"],
            })
            
            # Save generated image
            if response.candidates and response.candidates[0].content.parts:
                for part in response.candidates[0].content.parts:
                    if hasattr(part, 'inline_data') and part.inline_data:
                        image_filename = f"story_image_{datetime.now().timestamp()}.png"
                        image_path = f"uploads/{image_filename}"
                        
                        with open(image_path, "wb") as f:
                            f.write(part.inline_data.data)
                        
                        return f"/uploads/{image_filename}"
            
            return None
            
        except Exception as e:
            print(f"Image generation error: {e}")
            return None
    
    async def orchestrate_learning_session(self, child_id: str, session_data: Dict[str, Any]) -> Dict[str, Any]:
        """Orchestrate a complete learning session"""
        
        # Analyze session requirements
        session_analysis = await self._analyze_session_needs(session_data)
        
        # Generate personalized content
        content_recommendations = await self._generate_session_content(session_analysis)
        
        # Real-time adaptation based on engagement
        adaptive_responses = await self._create_adaptive_responses(session_analysis)
        
        return {
            "session_id": f"session_{datetime.now().timestamp()}",
            "content_recommendations": content_recommendations,
            "adaptive_responses": adaptive_responses,
            "expected_outcomes": session_analysis["learning_outcomes"],
            "engagement_metrics": session_analysis["engagement_predictions"]
        }
    
    async def _analyze_session_needs(self, session_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze learning session requirements"""
        
        prompt = f"""
        Analyze this learning session request for a Turkish child:
        {json.dumps(session_data, indent=2)}
        
        Provide comprehensive analysis including:
        1. Learning objectives
        2. Appropriate content difficulty
        3. Cultural integration opportunities
        4. Engagement strategies
        5. Expected learning outcomes
        
        Respond in JSON format.
        """
        
        response = await self.model.generate_content(prompt)
        return json.loads(response.text)
    
    async def _generate_session_content(self, analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate personalized session content"""
        
        # Use multiple agents to create diverse content
        tasks = [
            self.storyteller.create_micro_story(analysis),
            self.psychology.suggest_activities(analysis),
            self.guardian.ensure_age_appropriate_content(analysis)
        ]
        
        results = await asyncio.gather(*tasks)
        
        return {
            "stories": results[0],
            "activities": results[1], 
            "safety_guidelines": results[2]
        }
    
    async def _create_adaptive_responses(self, analysis: Dict[str, Any]) -> Dict[str, List[str]]:
        """Create adaptive responses for different engagement levels"""
        
        return {
            "high_engagement": [
                "Harika! Hikayeyi çok güzel takip ediyorsun!",
                "Sen gerçekten akıllı bir çocuksun!",
                "Bu değerleri çok iyi anlıyorsun!"
            ],
            "medium_engagement": [
                "Devam edelim, çok güzel gidiyoruz!",
                "Bu hikayeyi birlikte keşfedelim!",
                "Seninle bu değerleri öğrenmek çok güzel!"
            ],
            "low_engagement": [
                "Birlikte daha eğlenceli hale getirelim!",
                "Sen nasıl hissediyorsun bu hikaye hakkında?",
                "Başka bir şey denemek ister misin?"
            ]
        }