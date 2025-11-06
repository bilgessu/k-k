"""
Guardian Agent - Content safety and appropriateness validation
"""

import json
from typing import Dict, List, Any, Tuple
import google.generativeai as genai
from ..models import Child

class GuardianAgent:
    """AI agent specialized in content safety and cultural appropriateness"""
    
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-2.5-pro')
        
        # Define safety criteria
        self.safety_criteria = {
            "age_appropriate": {
                "3-5": ["simple_language", "no_fear", "basic_concepts"],
                "6-8": ["moderate_complexity", "mild_challenges", "moral_concepts"],
                "9-12": ["complex_themes", "real_world_issues", "abstract_concepts"]
            },
            "cultural_appropriate": [
                "turkish_values", "family_respect", "religious_sensitivity", 
                "cultural_traditions", "historical_accuracy"
            ],
            "educational_value": [
                "clear_moral", "positive_messaging", "learning_objectives", 
                "value_reinforcement", "character_development"
            ]
        }
    
    async def validate_content(self, story_content: Dict[str, Any], child_profile: Child) -> Dict[str, Any]:
        """Comprehensive content validation"""
        
        prompt = f"""
        Bu hikaye içeriğini çocuk güvenliği ve Türk kültürel değerleri açısından değerlendir:
        
        Hikaye: {json.dumps(story_content, ensure_ascii=False)}
        
        Çocuk Bilgileri:
        - Yaş: {child_profile.age}
        - Kültürel Geçmiş: {child_profile.cultural_background}
        
        Değerlendirme Kriterleri:
        1. Yaş Uygunluğu (0-100)
        2. Kültürel Uygunluk (0-100)
        3. Eğitici Değer (0-100)
        4. Güvenlik Skoru (0-100)
        5. Dil Uygunluğu (0-100)
        
        Potansiyel Riskler:
        - Korku verici içerik
        - Yaş üstü kavramlar
        - Kültürel duyarsızlık
        - Olumsuz rol modeller
        - Şiddet veya zararlı davranışlar
        
        JSON formatında yanıt ver:
        {{
            "is_safe": true/false,
            "safety_score": 0-100,
            "age_appropriateness": 0-100,
            "cultural_appropriateness": 0-100,
            "educational_value": 0-100,
            "language_appropriateness": 0-100,
            "identified_risks": ["risk listesi"],
            "recommendations": ["iyileştirme önerileri"],
            "approval_status": "approved/needs_review/rejected",
            "detailed_feedback": "detaylı geri bildirim"
        }}
        """
        
        response = await self.model.generate_content(prompt)
        return json.loads(response.text)
    
    async def ensure_age_appropriate_content(self, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Ensure content is age-appropriate"""
        
        prompt = f"""
        Bu öğrenme seansı analizi için yaş uygunluğu kontrolü yap:
        {json.dumps(analysis, ensure_ascii=False)}
        
        Yaş gruplarına göre uygun içerik önerileri:
        - 3-5 yaş: Basit kavramlar, renkli görseller, kısa dikkat süresi
        - 6-8 yaş: Orta karmaşıklık, problem çözme, sosyal beceriler
        - 9-12 yaş: Soyut düşünme, ahlaki ikilemler, tarihsel bağlam
        
        JSON formatında yaş uygun öneriler döndür.
        """
        
        response = await self.model.generate_content(prompt)
        return json.loads(response.text)
    
    async def check_cultural_sensitivity(self, content: str, cultural_context: str) -> Dict[str, Any]:
        """Check cultural sensitivity and appropriateness"""
        
        prompt = f"""
        Bu içeriği {cultural_context} kültürel bağlamında değerlendir:
        
        İçerik: {content}
        
        Kültürel Duyarlılık Kontrolleri:
        1. Stereotipler var mı?
        2. Kültürel değerler doğru yansıtılıyor mu?
        3. Dini hassasiyetler göz önünde bulundurulmuş mu?
        4. Geleneksel değerler saygıyla ele alınmış mı?
        5. Modern ve geleneksel dengeyi iyi kurmuş mu?
        
        JSON formatında değerlendirme döndür:
        {{
            "cultural_score": 0-100,
            "sensitivity_issues": ["sorun listesi"],
            "cultural_accuracy": 0-100,
            "value_alignment": 0-100,
            "improvement_suggestions": ["öneriler"]
        }}
        """
        
        response = await self.model.generate_content(prompt)
        return json.loads(response.text)
    
    async def validate_educational_content(self, content: Dict[str, Any]) -> Dict[str, Any]:
        """Validate educational value and learning objectives"""
        
        prompt = f"""
        Bu eğitici içeriğin pedagojik değerini analiz et:
        {json.dumps(content, ensure_ascii=False)}
        
        Eğitici Değer Kriterleri:
        1. Açık öğrenme hedefleri
        2. Yaş-uygun pedagojik yaklaşım
        3. Pozitif davranış modelleri
        4. Değer kazanımı
        5. Kalıcı öğrenme
        
        JSON formatında eğitici analiz döndür:
        {{
            "educational_score": 0-100,
            "learning_objectives": ["öğrenme hedefleri"],
            "pedagogical_approach": "",
            "value_transmission": ["aktarılan değerler"],
            "learning_effectiveness": 0-100,
            "engagement_potential": 0-100
        }}
        """
        
        response = await self.model.generate_content(prompt)
        return json.loads(response.text)
    
    async def content_moderation(self, user_input: str) -> Dict[str, Any]:
        """Moderate user-generated content"""
        
        prompt = f"""
        Bu kullanıcı girdisini çocuk platformu için moderasyon yap:
        
        Girdi: "{user_input}"
        
        Moderasyon Kontrolleri:
        1. Uygunsuz dil
        2. Zararlı içerik
        3. Yetişkin temaları
        4. Şiddet içeriği
        5. Korku verici unsurlar
        6. Kültürel duyarsızlık
        
        JSON formatında moderasyon raporu:
        {{
            "is_appropriate": true/false,
            "content_score": 0-100,
            "flagged_issues": ["sorun listesi"],
            "risk_level": "low/medium/high",
            "action_required": "none/filter/block",
            "filtered_content": "temizlenmiş versiyon"
        }}
        """
        
        response = await self.model.generate_content(prompt)
        return json.loads(response.text)
    
    async def real_time_safety_monitor(self, interaction_data: Dict[str, Any]) -> Dict[str, Any]:
        """Real-time safety monitoring during interactions"""
        
        prompt = f"""
        Gerçek zamanlı güvenlik izleme:
        {json.dumps(interaction_data, ensure_ascii=False)}
        
        İzleme Noktaları:
        - Çocuk tepkileri
        - Uygunsuz yanıtlar
        - Stres belirtileri
        - Öğrenme engelleri
        
        Acil müdahale gerekli mi? Ebeveyn bilgilendirilmeli mi?
        
        JSON formatında izleme raporu döndür.
        """
        
        response = await self.model.generate_content(prompt)
        return json.loads(response.text)