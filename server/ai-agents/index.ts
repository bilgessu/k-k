import { GoogleGenAI } from "@google/genai";
import { 
  sanitizePromptInput, 
  withTimeout, 
  geminiCircuitBreaker,
  AI_TIMEOUT_MS 
} from "../utils/ai-safety";
import { VectorStore, type VectorDocument } from "../utils/vector-store";
import { generateEmbedding, generateEmbeddingsBatch } from "../utils/embeddings";
import { randomUUID } from "crypto";

// Initialize Gemini 2.5 Pro for agent orchestration
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// Advanced memory store for child personalization with vector-based semantic search
export class ChildPersonalizationMemory {
  private childProfiles: Map<string, any> = new Map();
  private interactions: Map<string, any[]> = new Map();
  private vectorStore: VectorStore;
  
  // Memory limits to prevent OOM crashes
  private readonly MAX_CHILDREN = 1000;
  private readonly MAX_INTERACTIONS_PER_CHILD = 100;

  constructor() {
    // Initialize with vector store for semantic search
    this.vectorStore = new VectorStore(5000); // 5000 interaction embeddings
    console.log('ChildPersonalizationMemory: Initialized with vector store');
  }

  async addChildInteraction(childId: string, interaction: {
    story: string;
    reaction: string;
    preferences: string[];
    timestamp: Date;
  }) {
    // Get current interactions and apply size limit
    let interactions = this.interactions.get(childId) || [];
    
    // Keep only last N interactions (LRU within child)
    if (interactions.length >= this.MAX_INTERACTIONS_PER_CHILD) {
      interactions = interactions.slice(-this.MAX_INTERACTIONS_PER_CHILD + 1);
    }
    
    interactions.push(interaction);
    this.interactions.set(childId, interactions);
    
    // Update child profile
    const profile = this.childProfiles.get(childId) || { interactions: [], preferences: new Set() };
    profile.interactions = interactions; // Use bounded interactions
    interaction.preferences.forEach(pref => profile.preferences.add(pref));
    this.childProfiles.set(childId, profile);
    
    // LRU eviction if too many children
    if (this.interactions.size > this.MAX_CHILDREN) {
      const oldestChildId = this.interactions.keys().next().value;
      if (oldestChildId) {
        this.interactions.delete(oldestChildId);
        this.childProfiles.delete(oldestChildId);
        console.log(`Memory: Evicted oldest child profile (${oldestChildId}) - LRU limit reached`);
      }
    }

    // Add to vector store for semantic search
    try {
      const interactionText = `Story: ${interaction.story}\nReaction: ${interaction.reaction}\nPreferences: ${interaction.preferences.join(', ')}`;
      const embedding = await generateEmbedding(interactionText);
      
      const vectorDoc: VectorDocument = {
        id: randomUUID(),
        text: interactionText,
        embedding,
        metadata: {
          childId,
          timestamp: interaction.timestamp.getTime(),
          preferences: interaction.preferences,
          reaction: interaction.reaction
        },
        timestamp: interaction.timestamp.getTime()
      };

      await this.vectorStore.add(vectorDoc);
      console.log(`Memory: Added interaction to vector store for child ${childId}`);
    } catch (error) {
      console.error('Failed to add interaction to vector store:', error);
      // Non-blocking - continue even if vector indexing fails
    }
  }

  async getChildPersonalization(childId: string): Promise<{
    recentInteractions: any[];
    preferences: string[];
    personalityTraits: string[];
  }> {
    const profile = this.childProfiles.get(childId);
    if (!profile) {
      return { recentInteractions: [], preferences: [], personalityTraits: [] };
    }

    return {
      recentInteractions: profile.interactions.slice(-5),
      preferences: Array.from(profile.preferences),
      personalityTraits: this.analyzePersonalityTraits(profile.interactions)
    };
  }

  private analyzePersonalityTraits(interactions: any[]): string[] {
    // Simple analysis - in production, use more sophisticated ML
    const traits = new Set<string>();
    
    interactions.forEach(interaction => {
      if (interaction.reaction.includes('excited') || interaction.reaction.includes('happy')) {
        traits.add('enthusiastic');
      }
      if (interaction.reaction.includes('quiet') || interaction.reaction.includes('thoughtful')) {
        traits.add('reflective');
      }
      if (interaction.reaction.includes('questions') || interaction.reaction.includes('curious')) {
        traits.add('curious');
      }
    });

    return Array.from(traits);
  }

  /**
   * Semantic search: Find similar interactions based on content similarity
   */
  async findSimilarInteractions(
    query: string,
    childId?: string,
    topK: number = 5
  ): Promise<Array<{
    text: string;
    similarity: number;
    metadata: Record<string, any>;
  }>> {
    try {
      const queryEmbedding = await generateEmbedding(query);
      const results = await this.vectorStore.search(queryEmbedding, topK, 0.6);

      // Filter by childId if provided
      let filteredResults = results;
      if (childId) {
        filteredResults = results.filter(r => r.document.metadata.childId === childId);
      }

      return filteredResults.map(r => ({
        text: r.document.text,
        similarity: r.similarity,
        metadata: r.document.metadata
      }));
    } catch (error) {
      console.error('Semantic search error:', error);
      return [];
    }
  }

  /**
   * Find stories similar to given preferences
   */
  async findStoriesByPreferences(
    preferences: string[],
    childId?: string,
    topK: number = 3
  ): Promise<Array<{
    story: string;
    reaction: string;
    similarity: number;
  }>> {
    const preferenceQuery = preferences.join(' ');
    const similar = await this.findSimilarInteractions(preferenceQuery, childId, topK);

    return similar.map(s => ({
      story: s.metadata.story || s.text,
      reaction: s.metadata.reaction || '',
      similarity: s.similarity
    }));
  }

  /**
   * Get vector store statistics
   */
  getVectorStats(): {
    totalDocuments: number;
    maxCapacity: number;
    utilizationPercent: number;
  } {
    return this.vectorStore.getStats();
  }
}

// AI Agent for Advanced Story Creation with Multi-Agent Architecture
export class StorytellerAgent {
  constructor() {}

  async generatePersonalizedStory(params: {
    childName: string;
    childAge: number;
    parentMessage: string;
    culturalTheme: string;
    personalization: any;
  }) {
    // Sanitize user inputs to prevent prompt injection
    const safeParentMessage = sanitizePromptInput(params.parentMessage);
    const safeCulturalTheme = sanitizePromptInput(params.culturalTheme);
    const safeChildName = sanitizePromptInput(params.childName, 100);
    
    const systemPrompt = `Sen AtaMind'ın çoklu AI ajan sistemi içindeki Türk kültürü hikaye uzmanısın. 

GÖREV: Çocuk profili ve geçmiş etkileşimlere dayalı ultra-kişiselleştirilmiş hikayeler oluştur.

ÇOCUK PROFİLİ:
- İsim: ${safeChildName}
- Yaş: ${params.childAge} 
- Kişilik: ${params.personalization.personalityTraits.join(', ') || 'Meraklı, sevecen'}
- Tercihler: ${params.personalization.preferences.join(', ') || 'Hayvan hikayeleri, macera'}
- Geçmiş Tepkiler: ${params.personalization.recentInteractions.map((i: any) => `"${i.story}" -> ${i.reaction}`).join('\n') || 'İlk hikaye'}

Ebeveyn Mesajı: "${safeParentMessage}"
Kültürel Tema: ${safeCulturalTheme}

ÖZELLEŞTİRME TALİMATLARI:
1. Çocuğun yaş seviyesine ve kişiliğine tam uygun dil kullan
2. Geçmiş tepkilerinden öğrenilen tercihleri entegre et
3. Türk kültürü değerlerini doğal şekilde hikayeye dokuman
4. Çocuğun ismini ve özelliklerini hikayede organik olarak kullan
5. Ebeveynin değer mesajını çocuğun anlayacağı şekilde aktar

Yanıtını JSON formatında ver.`;

    try {
      // Wrap AI call with timeout and circuit breaker for reliability
      const response = await geminiCircuitBreaker.execute(() =>
        withTimeout(
          ai.models.generateContent({
            model: "gemini-2.5-pro",
            config: {
              systemInstruction: systemPrompt,
              responseMimeType: "application/json",
              responseSchema: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  content: { type: "string" },
                  moralLesson: { type: "string" },
                  personalizedElements: { type: "array", items: { type: "string" } },
                  culturalElements: { type: "array", items: { type: "string" } },
                  ageAppropriate: { type: "boolean" },
                  emotionalTone: { type: "string" },
                  interactiveCues: { type: "array", items: { type: "string" } }
                },
                required: ["title", "content", "moralLesson", "personalizedElements", "culturalElements", "ageAppropriate"]
              }
            },
            contents: `Yukarıdaki profil ve talimatları kullanarak ${safeChildName} için özel hikaye oluştur.`
          }),
          AI_TIMEOUT_MS,
          'Story generation timeout - AI took too long to respond'
        )
      );

      const rawJson = response.text;
      if (rawJson) {
        return JSON.parse(rawJson);
      }
    } catch (error) {
      console.error('Storyteller Agent Error:', error);
      // Re-throw to allow caller to handle
      throw error;
    }

    // Fallback
    return {
      title: `${params.childName} için Özel Hikaye`,
      content: `Bir zamanlar ${params.childName} adında çok özel bir çocuk varmış...`,
      moralLesson: params.culturalTheme,
      personalizedElements: [`${params.childName}'a özel hikaye`],
      culturalElements: ["Türk kültürü değerleri"],
      ageAppropriate: true,
      emotionalTone: "Sevgi dolu ve öğretici",
      interactiveCues: ["Ne düşünüyorsun?", "Sen olsan ne yapardın?"]
    };
  }
}

// AI Agent for Advanced Child Psychology Analysis
export class ChildPsychologyAgent {
  constructor() {}

  async analyzeChildDevelopment(params: {
    childName: string;
    childAge: number;
    interactions: any[];
    behaviorPatterns: string[];
  }) {
    const systemPrompt = `Sen AtaMind çoklu-ajan sistemindeki çocuk gelişim psychology uzmanısın.

GÖREV: Çocuğun hikaye etkileşimlerini analiz ederek gelişimsel durumu ve ihtiyaçlarını belirle.

ÇOCUK VERİLERİ:
- İsim: ${params.childName}
- Yaş: ${params.childAge}
- Etkileşim Geçmişi: ${params.interactions.map(i => `"${i.story}" -> Tepki: ${i.reaction}`).join('\n')}
- Davranış Kalıpları: ${params.behaviorPatterns.join(', ')}

ANALİZ KRİTERLERİ:
1. Yaşına göre gelişimsel seviye (dil, bilişsel, sosyal-duygusal)
2. Öğrenme stili tercihleri ve kapasitesi
3. Duygusal ihtiyaçlar ve güçlü yönler
4. Dikkat süresi ve ilgi alanları
5. Kültürel değerlere yaklaşım ve kavrayış

TÜRK KÜLTÜRÜ BAĞLAMI:
- Aile değerleri kavrayışı
- Saygı ve sevgi ifadesi
- Geleneksel hikayelerle bağlantı
- Sosyal beceri gelişimi

Kapsamlı analiz ve pratik öneriler sun.`;

    try {
      // Wrap AI call with timeout and circuit breaker
      const response = await geminiCircuitBreaker.execute(() =>
        withTimeout(
          ai.models.generateContent({
            model: "gemini-2.5-pro",
            config: {
              systemInstruction: systemPrompt,
              responseMimeType: "application/json",
              responseSchema: {
                type: "object",
                properties: {
                  developmentalAssessment: { type: "string" },
                  learningStyle: { type: "string" },
                  emotionalNeeds: { type: "array", items: { type: "string" } },
                  parentRecommendations: { type: "array", items: { type: "string" } },
                  nextStoryThemes: { type: "array", items: { type: "string" } },
                  culturalReadiness: { type: "string" },
                  engagementTips: { type: "array", items: { type: "string" } },
                  developmentalGoals: { type: "array", items: { type: "string" } }
                },
                required: ["developmentalAssessment", "learningStyle", "emotionalNeeds", "parentRecommendations", "nextStoryThemes"]
              }
            },
            contents: `${params.childName} için detaylı gelişimsel analiz yap.`
          }),
          AI_TIMEOUT_MS,
          'Child development analysis timeout - AI took too long'
        )
      );

      const rawJson = response.text;
      if (rawJson) {
        return JSON.parse(rawJson);
      }
    } catch (error) {
      console.error('Psychology Agent Error:', error);
      // Fall through to age-based fallback
    }

    // Fallback based on age
    const ageBasedAnalysis = this.getAgeBasedAnalysis(params.childAge);
    return {
      developmentalAssessment: `${params.childAge} yaş grubu için ${ageBasedAnalysis.stage}`,
      learningStyle: ageBasedAnalysis.learningStyle,
      emotionalNeeds: ageBasedAnalysis.needs,
      parentRecommendations: ageBasedAnalysis.recommendations,
      nextStoryThemes: ageBasedAnalysis.themes,
      culturalReadiness: ageBasedAnalysis.cultural,
      engagementTips: ageBasedAnalysis.engagement,
      developmentalGoals: ageBasedAnalysis.goals
    };
  }

  private getAgeBasedAnalysis(age: number) {
    if (age <= 4) {
      return {
        stage: "erken çocukluk dönemi",
        learningStyle: "Görsel, dokunsal ve ritimsel öğrenme",
        needs: ["Güvenlik", "Rutinler", "Basit hikayeler"],
        recommendations: ["Kısa hikayeler", "Tekrarlı aktiviteler", "Görsel destekler"],
        themes: ["Hayvanlar", "Aile", "Basit değerler"],
        cultural: "Temel aile değerleri kavramaya başlıyor",
        engagement: ["15 dakika maksimum", "Etkileşimli sorular"],
        goals: ["Dil gelişimi", "Sosyal beceriler", "Hayal kurma"]
      };
    } else if (age <= 7) {
      return {
        stage: "okul öncesi dönem",
        learningStyle: "Hikaye temelli öğrenme ve rol yapma",
        needs: ["Arkadaşlık", "Keşfetme", "Yaratıcılık"],
        recommendations: ["Daha uzun hikayeler", "Ahlaki çelişkiler", "Kahraman hikayeleri"],
        themes: ["Arkadaşlık", "Adalet", "Cesaret", "Paylaşım"],
        cultural: "Türk kültürü değerlerini anlayıp benimsemeye başlıyor",
        engagement: ["20-25 dakika", "Soru-cevap etkileşimi"],
        goals: ["Ahlaki gelişim", "Empati kurma", "Kültürel kimlik"]
      };
    } else {
      return {
        stage: "ilkokul dönemi",
        learningStyle: "Analitik düşünme ve problem çözme",
        needs: ["Başarı", "Tanınma", "Sorumluluk"],
        recommendations: ["Karmaşık hikayeler", "Tarihsel kahramanlar", "Değer çelişkileri"],
        themes: ["Tarih", "Bilim", "Liderlik", "Sorumluluk"],
        cultural: "Türk tarihini ve kültürünü derinlemesine anlayabiliyor",
        engagement: ["30+ dakika", "Tartışma ve analiz"],
        goals: ["Eleştirel düşünme", "Kültürel gurur", "Liderlik becerileri"]
      };
    }
  }
}

// AI Agent for Content Guardian/Safety - Multi-layered Protection System
export class GuardianAgent {
  constructor() {}

  async validateContent(content: string, childAge: number, childPersonality?: string[]) {
    // Sanitize content before validation (prevent injection via content field)
    const safeContent = sanitizePromptInput(content, 2000); // Allow longer content for stories
    
    const systemPrompt = `Sen AtaMind çoklu-ajan sistemindeki içerik güvenlik uzmanısın.

GÖREV: İçeriklerin çok katmanlı analizi ile çocuk güvenliği ve Türk aile değerleri uygunluğunu değerlendir.

DEĞERLENDİRİLECEK İÇERİK:
"${safeContent}"

ÇOCUK PROFİLİ:
- Yaş: ${childAge}
- Kişilik Özellikleri: ${childPersonality?.join(', ') || 'Genel profil'}

DEĞERLENDİRME KRİTERLERİ:
1. Yaş Uygunluğu (Bilişsel seviye, dil karmaşıklığı, kavram zorluğu)
2. Kültürel Uyum (Türk aile değerleri, geleneksel öğretiler, modern değerlerle uyum)
3. Psikolojik Güvenlik (Travma riski, korku unsurları, duygusal etki)
4. Eğitsel Değer (Öğretici içerik, ahlaki dersler, gelişimsel katkı)
5. Sosyal Uygunluk (Toplumsal normlar, rol modeller, davranış örnekleri)
6. İçerik Kalitesi (Dil kullanımı, anlaşılırlık, etkileşim potansiyeli)

TÜRK KÜLTÜRÜ REFERANSLARI:
- Aile yapısı ve değerleri
- Misafirperverlik ve saygı kültürü
- Geleneksel ahlak öğretileri
- Modern Türkiye'nin değerleri

Kapsamlı güvenlik değerlendirmesi yap.`;

    try {
      // Wrap AI call with timeout and circuit breaker
      const response = await geminiCircuitBreaker.execute(() =>
        withTimeout(
          ai.models.generateContent({
            model: "gemini-2.5-pro",
            config: {
              systemInstruction: systemPrompt,
              responseMimeType: "application/json",
              responseSchema: {
                type: "object",
                properties: {
                  approved: { type: "boolean" },
                  overallScore: { type: "number", minimum: 0, maximum: 10 },
                  ageAppropriateScore: { type: "number", minimum: 0, maximum: 10 },
                  culturalAlignmentScore: { type: "number", minimum: 0, maximum: 10 },
                  safetyScore: { type: "number", minimum: 0, maximum: 10 },
                  educationalValue: { type: "number", minimum: 0, maximum: 10 },
                  concerns: { type: "array", items: { type: "string" } },
                  improvements: { type: "array", items: { type: "string" } },
                  strengths: { type: "array", items: { type: "string" } },
                  parentGuidance: { type: "array", items: { type: "string" } },
                  ageAdjustments: { type: "string" }
                },
                required: ["approved", "overallScore", "ageAppropriateScore", "culturalAlignmentScore", "safetyScore", "concerns", "improvements"]
              }
            },
            contents: `Bu içeriği ${childAge} yaşındaki çocuk için kapsamlı olarak değerlendir.`
          }),
          AI_TIMEOUT_MS,
          'Content validation timeout - AI safety check took too long'
        )
      );

      const rawJson = response.text;
      if (rawJson) {
        const result = JSON.parse(rawJson);
        
        // Additional safety check - auto-reject if scores too low
        if (result.safetyScore < 6 || result.ageAppropriateScore < 5) {
          result.approved = false;
          result.concerns.push("Güvenlik veya yaş uygunluğu skorları minimum eşiğin altında");
        }
        
        return result;
      }
    } catch (error) {
      console.error('Guardian Agent Error:', error);
      throw error; // Re-throw to enforce safety - don't approve if validation fails
    }

    // Conservative fallback
    return {
      approved: false,
      overallScore: 5,
      ageAppropriateScore: 6,
      culturalAlignmentScore: 7,
      safetyScore: 6,
      educationalValue: 6,
      concerns: ["İçerik analizi tamamlanamadı, güvenlik nedeniyle manuel inceleme gerekli"],
      improvements: ["İçeriği daha basit ve yaş uygun hale getirin"],
      strengths: [],
      parentGuidance: ["Ebeveyn rehberliğinde dinletilmesi önerilir"],
      ageAdjustments: "Yaş seviyesine uygun düzenlemeler yapılmalı"
    };
  }
}

// Advanced Voice Processing with ElevenLabs Integration
export class VoiceAgent {
  constructor() {}

  async enhanceVoiceOutput(text: string, voiceProfile: {
    age: number;
    personality: string[];
    culturalBackground: string;
  }) {
    // Enhanced voice synthesis parameters based on child profile
    const voiceSettings = this.getVoiceSettings(voiceProfile);
    
    try {
      // If ElevenLabs API available, use it for enhanced voice
      if (process.env.ELEVENLABS_API_KEY) {
        return await this.generateElevenLabsAudio(text, voiceSettings);
      }
      
      // Fallback to OpenAI with optimized settings
      return await this.generateOptimizedOpenAIAudio(text, voiceSettings);
    } catch (error) {
      console.error('Voice Agent Error:', error);
      throw new Error('Ses oluşturulamadı');
    }
  }

  private getVoiceSettings(profile: any) {
    const baseSettings = {
      speed: profile.age <= 5 ? 0.8 : 0.9, // Slower for younger children
      pitch: profile.age <= 7 ? 'higher' : 'normal',
      emotion: profile.personality.includes('energetic') ? 'excited' : 'calm',
      style: 'storytelling'
    };

    return baseSettings;
  }

  private async generateElevenLabsAudio(text: string, settings: any) {
    // Placeholder for ElevenLabs integration
    // Would implement actual API calls here
    throw new Error('ElevenLabs entegrasyonu geliştirme aşamasında');
  }

  private async generateOptimizedOpenAIAudio(text: string, settings: any) {
    // Enhanced OpenAI TTS with optimizations
    const { generateTextToSpeech } = await import('../openai');
    return await generateTextToSpeech(text);
  }
}

// Agent Orchestrator - Coordinates all AI agents
export class AgentOrchestrator {
  constructor() {}

  async generateComprehensiveStory(params: {
    childId: string;
    childName: string;
    childAge: number;
    parentMessage: string;
    culturalTheme: string;
  }) {
    try {
      // Step 1: Get child personalization data
      const personalization = await childMemory.getChildPersonalization(params.childId);
      
      // Step 2: Generate personalized story
      const story = await storytellerAgent.generatePersonalizedStory({
        ...params,
        personalization
      });
      
      // Step 3: Validate content safety
      const validation = await guardianAgent.validateContent(
        story.content, 
        params.childAge,
        personalization.personalityTraits
      );
      
      if (!validation.approved) {
        throw new Error(`İçerik güvenlik kontrolünden geçemedi: ${validation.concerns.join(', ')}`);
      }
      
      // Step 4: Get psychological insights
      const psychAnalysis = await psychologyAgent.analyzeChildDevelopment({
        childName: params.childName,
        childAge: params.childAge,
        interactions: personalization.recentInteractions,
        behaviorPatterns: personalization.personalityTraits
      });
      
      // Step 5: Generate enhanced voice
      const voiceAgent = new VoiceAgent();
      const audioBuffer = await voiceAgent.enhanceVoiceOutput(story.content, {
        age: params.childAge,
        personality: personalization.personalityTraits,
        culturalBackground: 'Turkish'
      });
      
      return {
        story,
        validation,
        psychAnalysis,
        audioBuffer,
        personalization,
        agentInsights: {
          storytellerConfidence: validation.overallScore,
          psychologicalSuitability: psychAnalysis.developmentalAssessment,
          safetyCleared: validation.approved,
          personalizationLevel: personalization.preferences.length > 0 ? 'high' : 'standard'
        }
      };
      
    } catch (error) {
      console.error('Agent Orchestrator Error:', error);
      throw error;
    }
  }
}

// Initialize global instances
export const childMemory = new ChildPersonalizationMemory();
export const storytellerAgent = new StorytellerAgent();
export const psychologyAgent = new ChildPsychologyAgent();
export const guardianAgent = new GuardianAgent();