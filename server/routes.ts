import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { generateTurkishCulturalStory, transcribeAndAnalyzeVoice, generateLullaby, generateStoryImage, analyzeCulturalContent } from "./gemini";
import { AgentOrchestrator, childMemory } from "./ai-agents";
import { generateTextToSpeech } from "./openai";
import { 
  insertChildSchema, 
  insertValueRecordingSchema, 
  insertStorySchema,
  insertListeningHistorySchema,
  insertLullabySchema 
} from "@shared/schema";
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const upload = multer({ dest: 'uploads/' });

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Kullanıcı bilgileri alınamadı" });
    }
  });

  // Child profile routes
  app.get('/api/children', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const children = await storage.getChildren(userId);
      res.json(children);
    } catch (error) {
      console.error("Error fetching children:", error);
      res.status(500).json({ message: "Çocuk profilleri alınamadı" });
    }
  });

  app.post('/api/children', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertChildSchema.parse({
        ...req.body,
        parentId: userId,
      });
      
      const child = await storage.createChild(validatedData);
      res.json(child);
    } catch (error) {
      console.error("Error creating child:", error);
      res.status(500).json({ message: "Çocuk profili oluşturulamadı" });
    }
  });

  app.get('/api/children/:id', isAuthenticated, async (req: any, res) => {
    try {
      const child = await storage.getChild(req.params.id);
      if (!child) {
        return res.status(404).json({ message: "Çocuk profili bulunamadı" });
      }
      
      // Check if user owns this child profile
      if (child.parentId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Bu profile erişim yetkiniz yok" });
      }
      
      res.json(child);
    } catch (error) {
      console.error("Error fetching child:", error);
      res.status(500).json({ message: "Çocuk profili alınamadı" });
    }
  });

  // Voice recording routes
  app.post('/api/recordings', isAuthenticated, upload.single('audio'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { title, description, childId } = req.body;
      
      if (!req.file) {
        return res.status(400).json({ message: "Ses dosyası gerekli" });
      }

      // Read audio file
      const audioBuffer = fs.readFileSync(req.file.path);
      
      // Transcribe and analyze audio with Gemini
      const analysis = await transcribeAndAnalyzeVoice(req.file.path);
      
      // Create recording record
      const recording = await storage.createValueRecording({
        parentId: userId,
        childId: childId || null,
        title,
        description,
        transcript: analysis.transcription,
        audioUrl: `/uploads/${req.file.filename}`, // In production, upload to cloud storage
      });

      // Clean up temp file
      fs.unlinkSync(req.file.path);

      res.json({
        ...recording,
        analysis,
      });
    } catch (error) {
      console.error("Error processing recording:", error);
      res.status(500).json({ message: "Kayıt işlenirken hata oluştu" });
    }
  });

  app.get('/api/recordings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const recordings = await storage.getValueRecordings(userId);
      res.json(recordings);
    } catch (error) {
      console.error("Error fetching recordings:", error);
      res.status(500).json({ message: "Kayıtlar alınamadı" });
    }
  });

  // Story generation and management
  app.post('/api/stories/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { recordingId, childId, parentValue, childAge, childName } = req.body;
      
      let transcript = "";
      if (recordingId) {
        const recording = await storage.getValueRecordings(userId);
        const targetRecording = recording.find(r => r.id === recordingId);
        if (targetRecording) {
          transcript = targetRecording.transcript || "";
        }
      }

      // Generate story using Gemini's Turkish cultural storytelling
      const storyResult = await generateTurkishCulturalStory({
        parentMessage: parentValue || transcript,
        childName,
        childAge: parseInt(childAge),
        culturalTheme: "Türk geleneksel değerleri"
      });

      // Analyze cultural content quality
      const contentAnalysis = await analyzeCulturalContent(storyResult.content);

      // Generate audio for the story
      const audioBuffer = await generateTextToSpeech(storyResult.content);
      
      // Save audio file (in production, upload to cloud storage)
      const audioFilename = `story_${Date.now()}.mp3`;
      const audioPath = path.join('uploads', audioFilename);
      fs.writeFileSync(audioPath, audioBuffer);

      // Generate story illustration
      await generateStoryImage(storyResult.title, storyResult.content);

      // Create story record
      const story = await storage.createStory({
        valueRecordingId: recordingId || null,
        childId,
        title: storyResult.title,
        content: storyResult.content,
        audioUrl: `/uploads/${audioFilename}`,
        duration: Math.ceil(storyResult.content.length / 200), // Estimated reading time
        ageRange: `${childAge}-${childAge + 2}`,
        values: [storyResult.moralLesson],
      });

      res.json(story);
    } catch (error) {
      console.error("Error generating story:", error);
      res.status(500).json({ message: "Hikaye oluşturulurken hata oluştu" });
    }
  });

  app.get('/api/stories', isAuthenticated, async (req: any, res) => {
    try {
      const { childId } = req.query;
      const stories = await storage.getStories(childId as string);
      res.json(stories);
    } catch (error) {
      console.error("Error fetching stories:", error);
      res.status(500).json({ message: "Hikayeler alınamadı" });
    }
  });

  app.get('/api/stories/:id', isAuthenticated, async (req: any, res) => {
    try {
      const story = await storage.getStory(req.params.id);
      if (!story) {
        return res.status(404).json({ message: "Hikaye bulunamadı" });
      }
      res.json(story);
    } catch (error) {
      console.error("Error fetching story:", error);
      res.status(500).json({ message: "Hikaye alınamadı" });
    }
  });

  // Multi-agent AI story generation with comprehensive analysis
  app.post('/api/stories/generate-advanced', isAuthenticated, upload.single('voiceRecording'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { childId, culturalTheme, childName, childAge } = req.body;

      if (!childId && !childName) {
        return res.status(400).json({ error: 'Child ID or name required for advanced story generation' });
      }

      // Get child information if ID provided
      let child = null;
      if (childId) {
        child = await storage.getChild(parseInt(childId));
        if (!child) {
          return res.status(404).json({ error: 'Child not found' });
        }
      }

      let parentMessage = "";
      
      // Process voice recording if provided
      if (req.file) {
        console.log(`Processing voice recording with multi-agent analysis: ${req.file.filename}`);
        const analysis = await transcribeAndAnalyzeVoice(req.file.path);
        parentMessage = analysis.message;
        console.log(`Extracted message with emotion: ${parentMessage}`);
      } else if (req.body.parentMessage) {
        parentMessage = req.body.parentMessage;
      }

      if (!parentMessage) {
        return res.status(400).json({ error: 'Either voice recording or parent message is required' });
      }

      // Initialize multi-agent orchestrator
      const orchestrator = new AgentOrchestrator();
      
      // Generate comprehensive story with all agents
      const comprehensiveResult = await orchestrator.generateComprehensiveStory({
        childId: childId?.toString() || 'demo',
        childName: child?.name || childName || 'Sevgili Çocuk',
        childAge: child?.age || parseInt(childAge) || 5,
        parentMessage,
        culturalTheme: culturalTheme || 'Türk aile değerleri'
      });

      // Save audio file
      const audioFilename = `story_advanced_${Date.now()}.mp3`;
      const audioPath = path.join('uploads', audioFilename);
      fs.writeFileSync(audioPath, comprehensiveResult.audioBuffer);

      // Save story to database if child exists
      let story = null;
      if (child) {
        story = await storage.createStory({
          valueRecordingId: null,
          childId: parseInt(childId),
          title: comprehensiveResult.story.title,
          content: comprehensiveResult.story.content,
          audioUrl: `/uploads/${audioFilename}`,
          duration: Math.ceil(comprehensiveResult.story.content.length / 200),
          ageRange: `${child.age}-${child.age + 2}`,
          values: [comprehensiveResult.story.moralLesson],
        });
      }

      // Store interaction for future personalization
      await childMemory.addChildInteraction(childId?.toString() || 'demo', {
        story: comprehensiveResult.story.title,
        reaction: 'Generated successfully', // Would be updated based on child feedback
        preferences: comprehensiveResult.story.personalizedElements || [],
        timestamp: new Date()
      });

      res.json({
        story: story || {
          title: comprehensiveResult.story.title,
          content: comprehensiveResult.story.content,
          audioUrl: `/uploads/${audioFilename}`,
          moralLesson: comprehensiveResult.story.moralLesson
        },
        audioUrl: `/uploads/${audioFilename}`,
        culturalAnalysis: comprehensiveResult.story.culturalElements,
        moralLesson: comprehensiveResult.story.moralLesson,
        agentInsights: comprehensiveResult.agentInsights,
        validation: {
          safetyScore: comprehensiveResult.validation.safetyScore,
          ageAppropriate: comprehensiveResult.validation.ageAppropriateScore,
          culturalAlignment: comprehensiveResult.validation.culturalAlignmentScore,
          approved: comprehensiveResult.validation.approved,
          concerns: comprehensiveResult.validation.concerns,
          strengths: comprehensiveResult.validation.strengths
        },
        psychologyAnalysis: {
          developmentalAssessment: comprehensiveResult.psychAnalysis.developmentalAssessment,
          learningStyle: comprehensiveResult.psychAnalysis.learningStyle,
          recommendedThemes: comprehensiveResult.psychAnalysis.nextStoryThemes,
          engagementTips: comprehensiveResult.psychAnalysis.engagementTips
        },
        personalization: {
          level: comprehensiveResult.agentInsights.personalizationLevel,
          traits: comprehensiveResult.personalization.personalityTraits,
          preferences: comprehensiveResult.personalization.preferences
        }
      });

    } catch (error) {
      console.error('Error in multi-agent story generation:', error);
      res.status(500).json({ 
        error: 'Failed to generate story with multi-agent system',
        details: error.message
      });
    }
  });

  // Listening history
  app.post('/api/listening-history', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertListeningHistorySchema.parse(req.body);
      const history = await storage.createListeningHistory(validatedData);
      res.json(history);
    } catch (error) {
      console.error("Error creating listening history:", error);
      res.status(500).json({ message: "Dinleme geçmişi kaydedilemedi" });
    }
  });

  app.get('/api/listening-history/:childId', isAuthenticated, async (req: any, res) => {
    try {
      const history = await storage.getListeningHistory(req.params.childId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching listening history:", error);
      res.status(500).json({ message: "Dinleme geçmişi alınamadı" });
    }
  });

  // Lullaby routes
  app.post('/api/lullabies/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { parentMessage, childId, childName, childAge } = req.body;
      
      // Generate personalized lullaby with Gemini
      const lullabyResult = await generateLullaby({
        parentMessage,
        childName,
        childAge: parseInt(childAge)
      });

      // Generate audio for the lullaby
      const audioBuffer = await generateTextToSpeech(lullabyResult.lyrics);
      
      // Save audio file
      const audioFilename = `lullaby_${Date.now()}.mp3`;
      const audioPath = path.join('uploads', audioFilename);
      fs.writeFileSync(audioPath, audioBuffer);

      const lullaby = await storage.createLullaby({
        parentId: userId,
        childId: childId || null,
        title: `${childName} için özel ninni`,
        audioUrl: `/uploads/${audioFilename}`,
      });

      res.json({
        ...lullaby,
        lyrics: lullabyResult.lyrics,
        melody: lullabyResult.melody
      });
    } catch (error) {
      console.error("Error generating lullaby:", error);
      res.status(500).json({ message: "Ninni oluşturulamadı" });
    }
  });

  app.post('/api/lullabies', isAuthenticated, upload.single('audio'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { title, childId } = req.body;
      
      if (!req.file) {
        return res.status(400).json({ message: "Ses dosyası gerekli" });
      }

      const lullaby = await storage.createLullaby({
        parentId: userId,
        childId: childId || null,
        title,
        audioUrl: `/uploads/${req.file.filename}`,
      });

      res.json(lullaby);
    } catch (error) {
      console.error("Error creating lullaby:", error);
      res.status(500).json({ message: "Ninni kaydedilemedi" });
    }
  });

  app.get('/api/lullabies', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { childId } = req.query;
      const lullabies = await storage.getLullabies(userId, childId as string);
      res.json(lullabies);
    } catch (error) {
      console.error("Error fetching lullabies:", error);
      res.status(500).json({ message: "Ninniler alınamadı" });
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  const httpServer = createServer(app);
  return httpServer;
}
