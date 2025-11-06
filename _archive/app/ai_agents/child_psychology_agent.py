"""
Child Psychology Agent - Developmental analysis and learning optimization
"""

import json
from typing import Dict, List, Any
import google.generativeai as genai
from ..models import Child, AIInsights

class ChildPsychologyAgent:
    """AI agent specialized in child psychology and developmental analysis"""
    
    def __init__(self):
        # Configure Gemini
        import os
        genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
        self.model = genai.GenerativeModel('gemini-2.5-pro')
        
        # Developmental milestones database
        self.developmental_stages = {
            "3-4": {
                "cognitive": ["symbolic_thinking", "basic_categorization", "simple_problem_solving"],
                "social": ["parallel_play", "basic_empathy", "rule_understanding"],
                "emotional": ["emotion_identification", "self_regulation_beginning", "attachment_security"],
                "language": ["vocabulary_expansion", "sentence_formation", "story_comprehension"]
            },
            "5-6": {
                "cognitive": ["logical_reasoning", "number_concepts", "cause_effect"],
                "social": ["cooperative_play", "friendship_concepts", "social_rules"],
                "emotional": ["emotion_regulation", "moral_development", "independence"],
                "language": ["complex_sentences", "narrative_skills", "reading_readiness"]
            },
            "7-8": {
                "cognitive": ["concrete_operations", "conservation", "classification"],
                "social": ["peer_relationships", "team_work", "competition_understanding"],
                "emotional": ["self_concept", "achievement_motivation", "stress_management"],
                "language": ["reading_fluency", "writing_skills", "abstract_concepts"]
            },
            "9-12": {
                "cognitive": ["abstract_thinking", "metacognition", "complex_problem_solving"],
                "social": ["group_dynamics", "leadership", "cultural_identity"],
                "emotional": ["identity_formation", "value_systems", "emotional_intelligence"],
                "language": ["advanced_literacy", "critical_thinking", "communication_skills"]
            }
        }
    
    async def analyze_child_profile(self, child_profile: Child) -> Dict[str, Any]:
        """Comprehensive psychological and developmental analysis"""
        
        # Get age-appropriate developmental stage
        stage_key = self._get_stage_key(int(child_profile.age))
        expected_milestones = self.developmental_stages.get(stage_key, {})
        
        prompt = f"""
        Bu çocuk profili için kapsamlı psikolojik ve gelişimsel analiz yap:
        
        Çocuk Bilgileri:
        - İsim: {child_profile.name}
        - Yaş: {child_profile.age}
        - İlgi Alanları: {child_profile.interests}
        - Öğrenme Stili: {child_profile.learning_style}
        - Kişilik Özellikleri: {child_profile.personality_traits}
        
        Bu yaş grubu için beklenen gelişim aşamaları:
        {json.dumps(expected_milestones, ensure_ascii=False)}
        
        Analiz edilecek alanlar:
        1. Bilişsel Gelişim Düzeyi
        2. Sosyal-Duygusal Gelişim
        3. Dil ve İletişim Becerileri
        4. Öğrenme Tercih ve Stilleri
        5. Motivasyon Faktörleri
        6. Potansiyel Gelişim Alanları
        7. Kültürel Kimlik Gelişimi
        
        JSON formatında analiz döndür:
        {{
            "developmental_stage": "",
            "cognitive_level": "",
            "social_emotional_status": "",
            "learning_preferences": {{}},
            "motivation_factors": [],
            "strengths": [],
            "growth_areas": [],
            "recommended_difficulty": "",
            "optimal_session_length": "",
            "engagement_strategies": [],
            "cultural_development": "",
            "parent_guidance": []
        }}
        """
        
        response = await self.model.generate_content(prompt)
        return json.loads(response.text)
    
    async def get_comprehensive_insights(self, child_profile: Child) -> AIInsights:
        """Get comprehensive insights for child development"""
        
        analysis = await self.analyze_child_profile(child_profile)
        
        prompt = f"""
        Bu analiz temelinde çocuk için kapsamlı öngörüler ve öneriler oluştur:
        {json.dumps(analysis, ensure_ascii=False)}
        
        Çıktı formatı:
        {{
            "child_development_stage": "",
            "recommended_values": [],
            "learning_preferences": {{}},
            "engagement_tips": [],
            "cultural_recommendations": []
        }}
        """
        
        response = await self.model.generate_content(prompt)
        insights_data = json.loads(response.text)
        
        return AIInsights(**insights_data)
    
    async def suggest_activities(self, analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Suggest age-appropriate activities based on analysis"""
        
        prompt = f"""
        Bu analiz temelinde yaş ve gelişim uygun aktiviteler öner:
        {json.dumps(analysis, ensure_ascii=False)}
        
        Aktivite kategorileri:
        1. Bilişsel Gelişim Aktiviteleri
        2. Sosyal-Duygusal Aktiviteler  
        3. Yaratıcılık ve Hayal Gücü
        4. Fiziksel Koordinasyon
        5. Kültürel Değer Aktiviteleri
        
        Her aktivite için:
        - Yaş uygunluğu
        - Öğrenme hedefi
        - Gerekli materyaller
        - Süre
        - Başarı kriterleri
        
        JSON array formatında 10 aktivite döndür.
        """
        
        response = await self.model.generate_content(prompt)
        return json.loads(response.text)
    
    async def assess_emotional_state(self, interaction_data: Dict[str, Any]) -> Dict[str, Any]:
        """Assess child's emotional state from interaction data"""
        
        prompt = f"""
        Bu etkileşim verilerinden çocuğun duygusal durumunu analiz et:
        {json.dumps(interaction_data, ensure_ascii=False)}
        
        Duygusal göstergeler:
        - Yanıt süreleri
        - Seçim kalıpları
        - Dikkat süresi
        - Etkileşim sıklığı
        
        JSON formatında duygusal durum raporu:
        {{
            "emotional_state": "",
            "engagement_level": 0-100,
            "stress_indicators": [],
            "positive_indicators": [],
            "recommended_adjustments": [],
            "intervention_needed": true/false
        }}
        """
        
        response = await self.model.generate_content(prompt)
        return json.loads(response.text)
    
    async def track_learning_progress(self, child_id: str, session_history: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Track and analyze learning progress over time"""
        
        prompt = f"""
        Bu öğrenme seansı geçmişini analiz ederek ilerleme raporu oluştur:
        
        Çocuk ID: {child_id}
        Seans Geçmişi: {json.dumps(session_history, ensure_ascii=False)}
        
        İlerleme analizi:
        1. Öğrenme hızı trendi
        2. Güçlenen beceri alanları
        3. Gelişim gereken alanlar
        4. Motivasyon değişimleri
        5. Optimal öğrenme zamanları
        
        JSON formatında ilerleme raporu döndür:
        {{
            "overall_progress": 0-100,
            "learning_velocity": "",
            "skill_improvements": {{}},
            "challenge_areas": [],
            "optimal_learning_times": [],
            "motivation_trends": [],
            "next_goals": [],
            "parent_recommendations": []
        }}
        """
        
        response = await self.model.generate_content(prompt)
        return json.loads(response.text)
    
    async def personalize_content(self, child_profile: Child, content_options: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Personalize content based on psychological profile"""
        
        prompt = f"""
        Bu çocuk profili için içerik seçeneklerini kişiselleştir:
        
        Çocuk: {child_profile.name}, {child_profile.age} yaş
        İlgi Alanları: {child_profile.interests}
        Öğrenme Stili: {child_profile.learning_style}
        
        İçerik Seçenekleri:
        {json.dumps(content_options, ensure_ascii=False)}
        
        Kişiselleştirme kriterleri:
        - Öğrenme stili uyumu
        - İlgi alanı örtüşmesi
        - Zorluk seviyesi uygunluğu
        - Motivasyon faktörleri
        
        JSON formatında kişiselleştirilmiş öneri döndür.
        """
        
        response = await self.model.generate_content(prompt)
        return json.loads(response.text)
    
    def _get_stage_key(self, age: int) -> str:
        """Get developmental stage key based on age"""
        if 3 <= age <= 4:
            return "3-4"
        elif 5 <= age <= 6:
            return "5-6"
        elif 7 <= age <= 8:
            return "7-8"
        elif 9 <= age <= 12:
            return "9-12"
        else:
            return "9-12"  # Default to oldest category