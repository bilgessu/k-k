"""
Storyteller Agent - Specialized in creating Turkish cultural stories
"""

import json
from typing import Dict, List, Any, Optional
import google.generativeai as genai
from ..models import Child

class StorytellerAgent:
    """AI agent specialized in Turkish storytelling and cultural education"""
    
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-2.5-pro')
        
    async def create_story(
        self, 
        child_profile: Child, 
        child_analysis: Dict[str, Any],
        parent_message: str,
        voice_analysis: Dict[str, Any],
        safety_guidelines: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """Create personalized Turkish cultural story"""
        
        prompt = f"""
        Sen Türk kültürü ve değerlerinde uzman bir hikaye anlatıcısısın. 
        
        Çocuk Profili:
        - İsim: {child_profile.name}
        - Yaş: {child_profile.age}
        - İlgi Alanları: {child_profile.interests}
        - Öğrenme Stili: {child_profile.learning_style}
        - Kültürel Geçmiş: {child_profile.cultural_background}
        
        Ebeveyn Mesajı: "{parent_message}"
        
        Çocuk Analizi: {json.dumps(child_analysis, ensure_ascii=False)}
        Ses Analizi: {json.dumps(voice_analysis, ensure_ascii=False)}
        
        {f"Güvenlik Kuralları: {safety_guidelines}" if safety_guidelines else ""}
        
        Lütfen aşağıdaki kriterlere uygun bir hikaye oluştur:
        
        1. Yaşa uygun dil ve içerik
        2. Türk kültürü ve değerlerini içeren
        3. Ebeveynin iletmek istediği değerleri içeren
        4. Çocuğun ilgi alanlarına hitap eden
        5. Öğretici ve eğlenceli
        6. 3-5 dakika sürecek uzunlukta
        
        Türk kültürel öğeleri içer:
        - Geleneksel hikaye karakterleri (Nasreddin Hoca, Keloğlan, vs.)
        - Türk değerleri (saygı, yardımlaşma, doğruluk, vs.)
        - Kültürel referanslar (bayramlar, gelenekler, vs.)
        
        JSON formatında yanıt ver:
        {{
            "title": "Hikaye başlığı",
            "content": "Hikaye içeriği (paragraflar halinde)",
            "values_taught": ["öğretilen değerler listesi"],
            "cultural_elements": ["kullanılan kültürel öğeler"],
            "engagement_factors": ["çocuğun ilgisini çekecek öğeler"],
            "estimated_duration": "tahmini süre (dakika)",
            "moral_lesson": "ana öğüt/ders",
            "discussion_questions": ["hikaye sonrası sorular"]
        }}
        """
        
        response = await self.model.generate_content(prompt)
        return json.loads(response.text)
    
    async def create_micro_story(self, analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Create short micro-stories for learning sessions"""
        
        prompt = f"""
        Öğrenme seansı için kısa hikayeler oluştur:
        {json.dumps(analysis, ensure_ascii=False)}
        
        3 adet 1-2 dakikalık mini hikaye oluştur. Her biri farklı bir değer öğretsin.
        
        JSON formatında liste olarak yanıt ver.
        """
        
        response = await self.model.generate_content(prompt)
        return json.loads(response.text)
    
    async def adapt_story_difficulty(self, story: Dict[str, Any], target_difficulty: str) -> Dict[str, Any]:
        """Adapt story difficulty level"""
        
        prompt = f"""
        Bu hikayeyi {target_difficulty} seviyesine uyarla:
        {json.dumps(story, ensure_ascii=False)}
        
        Zorluk seviyeleri:
        - easy: 3-5 yaş, basit kelimeler, kısa cümleler
        - medium: 6-8 yaş, orta seviye kelimeler, orta uzunluk cümleler  
        - hard: 9-12 yaş, zengin kelime hazinesi, karmaşık cümleler
        
        JSON formatında adapt edilmiş hikayeyi döndür.
        """
        
        response = await self.model.generate_content(prompt)
        return json.loads(response.text)
    
    async def generate_story_variations(self, base_story: Dict[str, Any], count: int = 3) -> List[Dict[str, Any]]:
        """Generate variations of a base story"""
        
        prompt = f"""
        Bu temel hikayeden {count} farklı varyasyon oluştur:
        {json.dumps(base_story, ensure_ascii=False)}
        
        Her varyasyon:
        - Aynı temel değerleri öğretmeli
        - Farklı karakterler veya ortamlar kullanmalı
        - Farklı Türk kültürel öğeleri içermeli
        
        JSON array formatında {count} varyasyon döndür.
        """
        
        response = await self.model.generate_content(prompt)
        return json.loads(response.text)
    
    async def create_interactive_story(self, child_profile: Child, interaction_points: List[str]) -> Dict[str, Any]:
        """Create interactive story with choice points"""
        
        prompt = f"""
        {child_profile.name} için interaktif bir hikaye oluştur.
        
        Çocuk Profili:
        - Yaş: {child_profile.age}
        - İlgi Alanları: {child_profile.interests}
        
        İnteraksiyon Noktaları: {interaction_points}
        
        Hikayede 3-4 seçim noktası olsun. Her seçim hikayenin gidişatını değiştirsin.
        
        JSON formatında interaktif hikaye döndür:
        {{
            "title": "",
            "introduction": "",
            "choice_points": [
                {{
                    "scene": "",
                    "question": "",
                    "choices": [
                        {{"text": "", "leads_to": ""}},
                        {{"text": "", "leads_to": ""}}
                    ]
                }}
            ],
            "endings": {{
                "ending1": "",
                "ending2": "",
                "ending3": ""
            }}
        }}
        """
        
        response = await self.model.generate_content(prompt)
        return json.loads(response.text)