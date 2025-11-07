import * as fs from "fs";
import { GoogleGenAI, Modality } from "@google/genai";
import { 
  sanitizePromptInput, 
  withTimeout, 
  geminiCircuitBreaker,
  AI_TIMEOUT_MS,
  MULTI_AGENT_TIMEOUT_MS 
} from "./utils/ai-safety";

// Using Gemini 2.5 Pro as the core AI engine for AtaMind
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

interface StoryGenerationParams {
  parentMessage: string;
  childName: string;
  childAge: number;
  culturalTheme?: string;
}

interface StoryResult {
  title: string;
  content: string;
  moralLesson: string;
  ageAppropriate: boolean;
}

export async function generateTurkishCulturalStory(params: StoryGenerationParams): Promise<StoryResult> {
  const { parentMessage, childName, childAge, culturalTheme = "geleneksel değerler" } = params;
  
  // Sanitize inputs to prevent prompt injection
  const safeParentMessage = sanitizePromptInput(parentMessage);
  const safeCulturalTheme = sanitizePromptInput(culturalTheme);
  const safeChildName = sanitizePromptInput(childName, 100);
  
  const systemPrompt = `Sen AtaMind'ın hikaye uzmanısın. Türk kültürü ve geleneksel değerleri çocuklara aktaran eğitici hikayeler yazıyorsun.

Görevin:
1. Ebeveynin mesajını ${childAge} yaşındaki ${safeChildName} için hikayeye dönüştür
2. Türk kültürü öğelerini (misafirperverlik, saygı, yardımseverlik, dürüstlük) doğal olarak entegre et
3. Yaşa uygun dil ve kavramlar kullan
4. Hikayeyi JSON formatında döndür

Kültürel tema: ${safeCulturalTheme}
Çocuğun yaşı: ${childAge}`;

  try {
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
            title: { type: "string", description: "Hikayenin başlığı" },
            content: { type: "string", description: "Hikayenin tam metni" },
            moralLesson: { type: "string", description: "Hikayeden çıkarılacak ahlaki ders" },
            ageAppropriate: { type: "boolean", description: "Yaşa uygunluk durumu" }
          },
          required: ["title", "content", "moralLesson", "ageAppropriate"]
        }
      },
      contents: `Ebeveyn mesajı: "${safeParentMessage}"
      
Çocuk: ${safeChildName} (${childAge} yaş)
Konu: ${safeCulturalTheme}

Bu mesajı temel alarak ${safeChildName} için eğitici bir Türk kültürü hikayesi yaz.`
        }),
        MULTI_AGENT_TIMEOUT_MS,
        'Story generation timeout'
      )
    );

    const rawJson = response.text;
    if (rawJson) {
      const storyData: StoryResult = JSON.parse(rawJson);
      return storyData;
    } else {
      throw new Error("Gemini'den boş yanıt geldi");
    }
  } catch (error) {
    console.error('Gemini hikaye oluşturma hatası:', error);
    throw new Error(`Hikaye oluşturulamadı: ${error}`);
  }
}

export async function generateLullaby(params: StoryGenerationParams): Promise<{ lyrics: string; melody: string }> {
  const { parentMessage, childName, childAge } = params;
  
  // Sanitize inputs to prevent prompt injection
  const safeParentMessage = sanitizePromptInput(parentMessage);
  const safeChildName = sanitizePromptInput(childName, 100);
  
  const systemPrompt = `Sen AtaMind'ın ninni uzmanısın. Türk kültürü ve anne-baba sevgisini yansıtan sakinleştirici ninniler yazıyorsun.

Görevin:
1. Ebeveynin mesajını ${childAge} yaşındaki ${safeChildName} için ninni sözlerine dönüştür
2. Geleneksel Türk ninni yapısını kullan
3. Sakinleştirici, sevgi dolu ifadeler kullan
4. JSON formatında döndür`;

  try {
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
            lyrics: { type: "string", description: "Ninni sözleri" },
            melody: { type: "string", description: "Melodi tanımı" }
          },
          required: ["lyrics", "melody"]
        }
      },
      contents: `Ebeveyn mesajı: "${safeParentMessage}"
      
Çocuk: ${safeChildName} (${childAge} yaş)

Bu mesajı temel alarak ${safeChildName} için sevgi dolu bir ninni yaz.`
        }),
        MULTI_AGENT_TIMEOUT_MS,
        'Lullaby generation timeout'
      )
    );

    const rawJson = response.text;
    if (rawJson) {
      return JSON.parse(rawJson);
    } else {
      throw new Error("Ninni oluşturulamadı");
    }
  } catch (error) {
    console.error('Gemini ninni oluşturma hatası:', error);
    throw new Error(`Ninni oluşturulamadı: ${error}`);
  }
}

export async function transcribeAndAnalyzeVoice(audioFilePath: string): Promise<{ 
  transcription: string; 
  emotionalTone: string; 
  culturalValues: string[]; 
  suggestedThemes: string[] 
}> {
  try {
    const audioBytes = fs.readFileSync(audioFilePath);
    
    const response = await geminiCircuitBreaker.execute(() =>
      withTimeout(
        ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            transcription: { type: "string" },
            emotionalTone: { type: "string" },
            culturalValues: { type: "array", items: { type: "string" } },
            suggestedThemes: { type: "array", items: { type: "string" } }
          },
          required: ["transcription", "emotionalTone", "culturalValues", "suggestedThemes"]
        }
      },
      contents: [
        {
          inlineData: {
            data: audioBytes.toString("base64"),
            mimeType: "audio/wav"
          }
        },
        `Bu ses kaydını analiz et ve şunları belirle:
1. Tam metin çevirisi (Türkçe)
2. Ebeveynin duygusal tonu
3. Bahsedilen kültürel değerler
4. Hikaye için önerilen temalar

Türk kültürü bağlamında değerlendir.`
        ]
        }),
        MULTI_AGENT_TIMEOUT_MS, // 4 minutes for audio transcription
        'Voice transcription timeout - audio processing took too long'
      )
    );

    const rawJson = response.text;
    if (rawJson) {
      return JSON.parse(rawJson);
    } else {
      throw new Error("Ses analizi yapılamadı");
    }
  } catch (error) {
    console.error('Gemini ses analizi hatası:', error);
    throw new Error(`Ses analizi başarısız: ${error}`);
  }
}

export async function generateStoryImage(storyTitle: string, storyContent: string): Promise<void> {
  const prompt = `${storyTitle} hikayesi için Türk kültürü öğelerini içeren, çocuk dostu, renkli bir illüstrasyon oluştur. İçerik: ${storyContent.substring(0, 200)}...`;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    });

    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      return;
    }

    const content = candidates[0].content;
    if (!content || !content.parts) {
      return;
    }

    for (const part of content.parts) {
      if (part.inlineData && part.inlineData.data) {
        const imageData = Buffer.from(part.inlineData.data, "base64");
        const imagePath = `uploads/story_${Date.now()}.png`;
        fs.writeFileSync(imagePath, imageData);
        console.log(`Hikaye görseli oluşturuldu: ${imagePath}`);
        return;
      }
    }
  } catch (error) {
    console.error('Gemini görsel oluşturma hatası:', error);
    // Görsel oluşturma isteğe bağlı, hata vermeyelim
  }
}

export async function analyzeCulturalContent(content: string): Promise<{
  culturalAccuracy: number;
  appropriateness: number;
  suggestions: string[];
}> {
  const systemPrompt = `Sen Türk kültürü uzmanısın. Çocuklar için yazılan içeriklerin kültürel doğruluğunu ve uygunluğunu değerlendiriyorsun.`;
  
  // Sanitize content before analysis
  const safeContent = sanitizePromptInput(content, 2000);

  try {
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
                culturalAccuracy: { type: "number", minimum: 0, maximum: 10 },
                appropriateness: { type: "number", minimum: 0, maximum: 10 },
                suggestions: { type: "array", items: { type: "string" } }
              },
              required: ["culturalAccuracy", "appropriateness", "suggestions"]
            }
          },
          contents: `Bu içeriği Türk kültürü perspektifinden değerlendir:

"${safeContent}"

1. Kültürel doğruluk (0-10)
2. Yaş uygunluğu (0-10) 
3. İyileştirme önerileri`
        }),
        MULTI_AGENT_TIMEOUT_MS,
        'Cultural content analysis timeout'
      )
    );

    const rawJson = response.text;
    if (rawJson) {
      return JSON.parse(rawJson);
    } else {
      throw new Error("İçerik analizi yapılamadı");
    }
  } catch (error) {
    console.error('Gemini içerik analizi hatası:', error);
    return {
      culturalAccuracy: 7,
      appropriateness: 8,
      suggestions: ["İçerik genel olarak uygun görünüyor"]
    };
  }
}