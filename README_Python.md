# AtaMind Python Backend

🌈 **AI-Powered Turkish Children Education Platform** 🌈

## Overview

AtaMind has been completely rewritten in Python using FastAPI to provide a high-performance, scalable backend for AI-powered Turkish children's education. The system features a sophisticated multi-agent AI architecture powered by Google Gemini 2.5 Pro.

## 🚀 Features

### Core AI Agents
- **StorytellerAgent**: Creates personalized Turkish cultural stories
- **GuardianAgent**: Ensures content safety and cultural appropriateness  
- **ChildPsychologyAgent**: Analyzes child development and learning patterns
- **VoiceAgent**: Processes voice recordings and emotional analysis
- **AIOrchestrator**: Coordinates all agents for comprehensive education

### Technical Stack
- **Backend**: FastAPI with Python 3.11
- **Database**: PostgreSQL with SQLAlchemy ORM
- **AI**: Google Gemini 2.5 Pro + OpenAI
- **Authentication**: JWT-based security
- **API**: RESTful with automatic OpenAPI documentation

## 🎨 Colorful Design

The platform features a super vibrant, child-friendly design:
- Rainbow gradient backgrounds with animations
- Colorful pulse effects and floating elements
- Happy family images from Unsplash
- Interactive sparkle animations
- Child-friendly icons and typography

## 📁 Project Structure

```
AtaMind/
├── app/
│   ├── ai_agents/
│   │   ├── orchestrator.py       # Central AI coordinator
│   │   ├── storyteller_agent.py  # Story generation
│   │   ├── guardian_agent.py     # Content safety
│   │   ├── child_psychology_agent.py  # Development analysis
│   │   └── voice_agent.py        # Voice processing
│   ├── models.py                 # Database models
│   ├── database.py              # Database configuration
│   ├── auth.py                  # Authentication
│   └── routes.py                # API endpoints
├── static/
│   └── index.html               # Colorful landing page
├── uploads/                     # File storage
├── main.py                      # FastAPI application
├── start_python.py             # Startup script
└── test_python.py              # Test script
```

## 🔧 Setup Instructions

### 1. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Add your API keys to .env
GEMINI_API_KEY=your_gemini_key_here
OPENAI_API_KEY=your_openai_key_here
DATABASE_URL=your_postgres_url_here
```

### 2. Install Dependencies
```bash
# Dependencies are already installed via Replit packager
# Includes: fastapi, uvicorn, sqlalchemy, google-generativeai, openai, etc.
```

### 3. Test the Installation
```bash
python test_python.py
```

### 4. Start the Server
```bash
# Option 1: Using the startup script
python start_python.py

# Option 2: Direct uvicorn command
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Option 3: Simple python run
python main.py
```

## 🌐 API Endpoints

### Authentication
- `GET /api/auth/user` - Get current user info

### Stories
- `POST /api/generate-story` - Generate AI-powered story
- `GET /api/stories` - List user stories
- `GET /api/stories/{id}` - Get specific story

### Children Management
- `POST /api/children` - Create child profile
- `GET /api/children` - List children
- `GET /api/children/{id}` - Get child details

### Voice Processing
- `POST /api/upload-voice` - Upload voice recording
- `POST /api/voice/analyze` - Analyze voice emotions

### Health & Documentation
- `GET /health` - Health check
- `GET /api/health` - API health check
- `GET /docs` - Interactive API documentation (FastAPI auto-generated)

## 🎯 AI Multi-Agent Architecture

### Agent Coordination Flow
1. **Input Processing**: Parent voice/text → VoiceAgent analysis
2. **Child Analysis**: ChildPsychologyAgent → Developmental insights
3. **Story Creation**: StorytellerAgent → Culturally-rich stories
4. **Safety Validation**: GuardianAgent → Content appropriateness
5. **Output Generation**: AIOrchestrator → Complete personalized content

### Cultural Intelligence
- Deep Turkish cultural knowledge integration
- Traditional storytelling methods with modern adaptation
- Family values and cultural identity development
- Age-appropriate content with psychological insights

## 🎨 Visual Design Features

### Colorful Elements
- **Rainbow Gradients**: Dynamic color shifting backgrounds
- **Pulse Animations**: Vibrant button and card effects
- **Floating Elements**: Smooth CSS animations
- **Interactive Sparkles**: JavaScript-generated effects
- **Happy Family Images**: Professional Unsplash photography

### Child-Friendly UI
- Large, clear typography
- Intuitive navigation
- Bright, engaging colors
- Safe, educational content presentation

## 🔒 Security Features

- JWT-based authentication
- Content safety validation
- Age-appropriate filtering
- Cultural sensitivity checks
- Secure file upload handling

## 📊 Analytics & Insights

- Child development tracking
- Learning progress analytics
- Engagement optimization
- Voice emotion analysis
- Cultural value transmission metrics

## 🌍 Deployment

The application is designed for easy deployment:
- FastAPI provides automatic scaling
- PostgreSQL database support
- Static file serving
- Environment-based configuration
- Health check endpoints

## 🤝 Contributing

This project focuses on Turkish children's education with cultural values integration. All contributions should maintain the colorful, child-friendly design and educational mission.

---

**AtaMind** - Bridging traditional Turkish values with modern AI technology for the next generation! 🌈🇹🇷✨