import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { generateTurkishCulturalStory, transcribeAndAnalyzeVoice, generateLullaby, generateStoryImage, analyzeCulturalContent } from "./gemini";
import { AgentOrchestrator, childMemory } from "./ai-agents";
import { generateTextToSpeech } from "./openai";
import { observability, geminiCircuitBreaker, openaiCircuitBreaker } from "./utils/ai-safety";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { insertChildSchema, insertStorySchema, insertValueRecordingSchema, insertListeningHistorySchema, insertLullabySchema } from "../shared/schema";

const upload = multer({ dest: 'uploads/' });

export async function registerRoutes(app: express.Express): Promise<Server> {
  const httpServer = createServer(app);

  // Setup authentication (will use localAuth when running locally)
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Observability & Metrics routes
  app.get('/api/metrics/health', isAuthenticated, async (req: any, res) => {
    try {
      const health = observability.getSystemHealth();
      const geminiStatus = geminiCircuitBreaker.getStatus();
      const openaiStatus = openaiCircuitBreaker.getStatus();
      
      res.json({
        ...health,
        circuitBreakers: {
          gemini: geminiStatus,
          openai: openaiStatus
        },
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/metrics/latency', isAuthenticated, async (req: any, res) => {
    try {
      const { operation, agent } = req.query;
      const stats = observability.getLatencyStats(
        operation as string | undefined,
        agent as string | undefined
      );
      res.json(stats || { message: 'No data available' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/metrics/errors', isAuthenticated, async (req: any, res) => {
    try {
      const { operation, agent, window } = req.query;
      const windowMs = window ? parseInt(window as string) : 300000;
      
      const errorRate = observability.getErrorRate(
        operation as string | undefined,
        agent as string | undefined,
        windowMs
      );
      
      res.json({ 
        errorRate,
        windowMs,
        operation: operation || 'all',
        agent: agent || 'all'
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/metrics/tokens', isAuthenticated, async (req: any, res) => {
    try {
      const { operation, agent } = req.query;
      const totalTokens = observability.getTotalTokensUsed(
        operation as string | undefined,
        agent as string | undefined
      );
      
      res.json({ 
        totalTokens,
        operation: operation || 'all',
        agent: agent || 'all'
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/metrics/recent', isAuthenticated, async (req: any, res) => {
    try {
      const { limit } = req.query;
      const limitNum = limit ? parseInt(limit as string) : 50;
      const metrics = observability.getRecentMetrics(limitNum);
      res.json(metrics);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Child profile routes
  app.get('/api/children', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const children = await storage.getChildren(userId);
      res.json(children);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/children', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertChildSchema.parse({
        ...req.body,
        userId,
      });
      const child = await storage.createChild(validatedData);
      res.json(child);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get('/api/children/:id', isAuthenticated, async (req: any, res) => {
    try {
      const child = await storage.getChild(req.params.id);
      if (!child) {
        return res.status(404).json({ message: 'Child not found' });
      }
      
      // Get AI-powered child profile analysis
      const profile = await childMemory.getChildPersonalization(req.params.id);
      
      res.json({
        ...child,
        aiProfile: profile
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Voice recording routes
  app.post('/api/recordings', isAuthenticated, upload.single('audio'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { title, description, childId } = req.body;
      
      if (!req.file) {
        return res.status(400).json({ message: 'No audio file provided' });
      }

      // Save to permanent location
      const fileName = `${Date.now()}-${req.file.originalname}`;
      const audioPath = path.join('uploads', fileName);
      await fs.rename(req.file.path, audioPath);

      const validatedData = insertValueRecordingSchema.parse({
        userId,
        childId,
        title,
        description,
        audioUrl: audioPath,
        duration: 0, // Could be calculated from audio file
      });

      const recording = await storage.createValueRecording(validatedData);
      res.json(recording);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get('/api/recordings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const recordings = await storage.getValueRecordings(userId);
      res.json(recordings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Story generation and management
  app.post('/api/stories/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { recordingId, childId, parentValue, childAge, childName, culturalTheme } = req.body;

      // Generate story using AI
      const storyResult = await generateTurkishCulturalStory({
        parentMessage: parentValue,
        childName,
        childAge,
        culturalTheme
      });

      // Analyze content for safety
      const analysis = await analyzeCulturalContent(storyResult.content);

      // Generate TTS audio
      const audioUrl = await generateTextToSpeech(storyResult.content);

      const validatedData = insertStorySchema.parse({
        userId,
        childId,
        recordingId,
        title: storyResult.title,
        content: storyResult.content,
        audioUrl,
        ageAppropriate: storyResult.ageAppropriate,
        culturallyAppropriate: analysis.appropriateness > 7,
      });

      const savedStory = await storage.createStory(validatedData);
      res.json(savedStory);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/stories', isAuthenticated, async (req: any, res) => {
    try {
      const { childId } = req.query;
      const stories = await storage.getStories(childId as string);
      res.json(stories);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/stories/:id', isAuthenticated, async (req: any, res) => {
    try {
      const story = await storage.getStory(req.params.id);
      if (!story) {
        return res.status(404).json({ message: 'Story not found' });
      }
      res.json(story);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Multi-agent AI story generation with comprehensive analysis
  app.post('/api/stories/generate-advanced', isAuthenticated, upload.single('voiceRecording'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { childId, culturalTheme, childName, childAge } = req.body;

      let parentVoiceUrl = null;
      if (req.file) {
        const fileName = `${Date.now()}-${req.file.originalname}`;
        const audioPath = path.join('uploads', fileName);
        await fs.rename(req.file.path, audioPath);
        parentVoiceUrl = audioPath;
      }

      // Get child data
      const child = await storage.getChild(childId);
      if (!child) {
        return res.status(404).json({ message: 'Child not found' });
      }

      // Initialize multi-agent orchestrator
      const orchestrator = new AgentOrchestrator();

      // Extract values from parent voice if provided
      let parentMessage = '';
      if (parentVoiceUrl) {
        const voiceAnalysis = await transcribeAndAnalyzeVoice(parentVoiceUrl);
        parentMessage = voiceAnalysis.transcription;
      }

      // Generate comprehensive story with multi-agent analysis
      const result = await orchestrator.generateComprehensiveStory({
        childId,
        childName: childName || child.name,
        childAge: parseInt(childAge) || child.age,
        parentMessage: parentMessage || culturalTheme || 'Turkish traditional values',
        culturalTheme: culturalTheme || 'Turkish traditional values',
      });

      // Generate TTS audio
      const audioUrl = await generateTextToSpeech(result.story.content);

      // Generate story image
      const imageUrl = await generateStoryImage(result.story.title, result.story.content);

      // Save story to database
      const validatedData = insertStorySchema.parse({
        userId,
        childId,
        recordingId: null,
        title: result.story.title,
        content: result.story.content,
        audioUrl,
        imageUrl,
        ageAppropriate: result.validation.ageAppropriateScore >= 7,
        culturallyAppropriate: result.validation.culturalAlignmentScore >= 7,
      });

      const savedStory = await storage.createStory(validatedData);

      // Return comprehensive result
      res.json({
        story: savedStory,
        aiAnalysis: {
          psychologicalProfile: result.psychAnalysis,
          safetyCheck: result.validation,
          agentInsights: result.agentInsights,
        }
      });
    } catch (error: any) {
      console.error('Advanced story generation error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Listening history
  app.post('/api/listening-history', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertListeningHistorySchema.parse(req.body);
      const history = await storage.createListeningHistory(validatedData);
      res.json(history);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get('/api/listening-history/:childId', isAuthenticated, async (req: any, res) => {
    try {
      const history = await storage.getListeningHistory(req.params.childId);
      res.json(history);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Lullaby routes
  app.post('/api/lullabies/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { parentMessage, childId, childName, childAge } = req.body;

      // Generate lullaby using AI
      const lullabyResult = await generateLullaby({
        parentMessage,
        childName,
        childAge
      });

      // Generate TTS audio for lullaby
      const audioUrl = await generateTextToSpeech(lullabyResult.lyrics);

      const validatedData = insertLullabySchema.parse({
        userId,
        childId,
        title: `${childName} için Ninni`,
        content: lullabyResult.lyrics,
        audioUrl,
      });

      const savedLullaby = await storage.createLullaby(validatedData);
      res.json(savedLullaby);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/lullabies', isAuthenticated, upload.single('audio'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { title, childId } = req.body;

      if (!req.file) {
        return res.status(400).json({ message: 'No audio file provided' });
      }

      const fileName = `${Date.now()}-${req.file.originalname}`;
      const audioPath = path.join('uploads', fileName);
      await fs.rename(req.file.path, audioPath);

      const validatedData = insertLullabySchema.parse({
        userId,
        childId,
        title,
        audioUrl: audioPath,
      });

      const lullaby = await storage.createLullaby(validatedData);
      res.json(lullaby);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get('/api/lullabies', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { childId } = req.query;
      const lullabies = await storage.getLullabies(childId as string);
      res.json(lullabies);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  return httpServer;
}
