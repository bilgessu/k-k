import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

export interface StoryGenerationRequest {
  parentValue: string;
  childAge: number;
  childName: string;
  transcript?: string;
}

export interface GeneratedStory {
  title: string;
  content: string;
  ageRange: string;
  values: string[];
  duration: number; // estimated duration in seconds
}

export async function generateStory(request: StoryGenerationRequest): Promise<GeneratedStory> {
  try {
    const prompt = `You are a cultural education storyteller for children. Create a personalized story that teaches the value "${request.parentValue}" to a ${request.childAge}-year-old child named ${request.childName}.

${request.transcript ? `Parent's recording transcript: "${request.transcript}"` : ''}

Guidelines:
- Age-appropriate language and concepts for ${request.childAge} years old
- Include Turkish cultural elements and traditional values
- Make it engaging with characters and a clear moral lesson
- Keep story length appropriate for attention span (3-8 minutes when read aloud)
- Include interactive elements or questions
- Make the child the hero or relate to their experiences

Respond with JSON in this exact format:
{
  "title": "Story title",
  "content": "Full story content with dialogue and narration",
  "ageRange": "${Math.max(request.childAge - 1, 3)}-${request.childAge + 2} yaş",
  "values": ["main_value", "secondary_value"],
  "estimatedDuration": 300
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert in child psychology and Turkish cultural education. Create engaging, educational stories that transmit cultural values to children."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    return {
      title: result.title || "Hikaye",
      content: result.content || "",
      ageRange: result.ageRange || `${request.childAge} yaş`,
      values: result.values || [request.parentValue],
      duration: result.estimatedDuration || 300,
    };
  } catch (error) {
    console.error("Error generating story:", error);
    throw new Error("Hikaye oluşturulurken bir hata oluştu: " + (error as Error).message);
  }
}

export async function generateTextToSpeech(text: string): Promise<string> {
  try {
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "nova", // Friendly female voice suitable for children
      input: text,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    
    // Save audio to file and return the path
    const fileName = `audio-${Date.now()}.mp3`;
    const audioPath = `uploads/${fileName}`;
    
    const fs = await import('fs/promises');
    await fs.writeFile(audioPath, buffer);
    
    // Return path with leading slash for web serving
    return `/${audioPath}`;
  } catch (error) {
    console.error("Error generating speech:", error);
    throw new Error("Ses oluşturulurken bir hata oluştu: " + (error as Error).message);
  }
}

export async function transcribeAudio(audioBuffer: Buffer): Promise<string> {
  try {
    // Create a temporary file-like object for OpenAI
    const audioFile = new File([audioBuffer], "recording.wav", { type: "audio/wav" });
    
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "tr", // Turkish
    });

    return transcription.text;
  } catch (error) {
    console.error("Error transcribing audio:", error);
    throw new Error("Ses metne dönüştürülürken bir hata oluştu: " + (error as Error).message);
  }
}

export async function analyzeSentiment(text: string): Promise<{
  rating: number;
  confidence: number;
  suggestions?: string[];
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a family content analyzer. Analyze if the content is appropriate for children and provides educational value. Respond with JSON."
        },
        {
          role: "user",
          content: `Analyze this parent's message for child education: "${text}". 
          
          Provide:
          - rating: 1-5 stars for educational value
          - confidence: 0-1 for how sure you are
          - suggestions: optional improvements
          
          JSON format: { "rating": number, "confidence": number, "suggestions": ["suggestion1", "suggestion2"] }`
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    return {
      rating: Math.max(1, Math.min(5, Math.round(result.rating || 3))),
      confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
      suggestions: result.suggestions || [],
    };
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    throw new Error("İçerik analizi yapılırken bir hata oluştu: " + (error as Error).message);
  }
}
