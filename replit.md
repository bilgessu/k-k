# replit.md

## Overview

AtaMind is an AI-powered Turkish children's education platform that helps parents create personalized stories and lullabies to teach cultural values to their children. The application combines voice recording capabilities, AI story generation, and audio playback to deliver culturally-rich educational content. Parents can record their own value-based messages, which are then transformed into age-appropriate stories featuring Turkish cultural elements and traditional values.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development and building
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management and caching
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules for type safety and modern JavaScript features
- **API Design**: RESTful APIs with structured error handling and logging middleware
- **File Uploads**: Multer middleware for handling audio file uploads
- **Session Management**: Express sessions with PostgreSQL storage using connect-pg-simple

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Connection**: Neon serverless PostgreSQL with WebSocket support
- **Schema**: Well-defined relational schema with tables for users, children, stories, recordings, and listening history
- **Migrations**: Drizzle Kit for database schema migrations and management

### Authentication and Authorization
- **Provider**: Replit's OpenID Connect (OIDC) authentication system
- **Strategy**: Passport.js with OpenID Client strategy for secure authentication flows
- **Session Storage**: PostgreSQL-backed sessions with configurable TTL and security headers
- **User Management**: Automatic user creation and profile management with Replit user claims

### Advanced Multi-Agent AI Architecture
- **Core Engine**: Google Gemini 2.5 Pro powering comprehensive multi-agent orchestration system
- **Agent Orchestrator**: Central coordinator managing specialized AI agents for holistic child education
- **Specialized AI Agents**:
  - **StorytellerAgent**: Ultra-personalized Turkish cultural story generation with child profile analysis
  - **ChildPsychologyAgent**: Developmental assessment, learning style analysis, and psychological insights
  - **GuardianAgent**: Multi-layered content safety validation and cultural appropriateness verification
  - **VoiceAgent**: Enhanced audio processing with personality-based voice optimization
- **Memory & Personalization**: ChildPersonalizationMemory system for learning child preferences and behavioral patterns
- **Advanced Features**:
  - Real-time emotion detection and cultural value extraction from parent voice recordings
  - Age-specific content adaptation with psychological development considerations
  - Multi-criteria safety scoring (age appropriateness, cultural alignment, educational value)
  - Comprehensive developmental analysis with parent guidance recommendations
  - Personalized voice synthesis based on child personality and age
  - Interactive learning analytics and engagement optimization
- **Cultural Intelligence**: Deep understanding of Turkish family values, traditional storytelling methods, and modern cultural adaptation
- **Analytics & Insights**: 
  - AI-powered psychological profiling and developmental tracking
  - Voice analytics with emotional tone and parenting style detection
  - Real-time performance metrics and predictive insights
  - Comprehensive AI architecture documentation and system transparency

### Audio Processing
- **Recording**: Browser-based MediaRecorder API for voice capture
- **Storage**: Temporary file storage with multer for processing uploaded audio
- **Playback**: Custom React audio player component with progress tracking and controls
- **Formats**: WAV format for recordings with conversion capabilities

## External Dependencies

### Core Services
- **Google Gemini API**: Gemini 2.5 Pro model for advanced Turkish cultural storytelling, multimodal voice analysis, and content generation
- **OpenAI API**: Text-to-speech capabilities for audio story generation
- **Neon Database**: Serverless PostgreSQL hosting with automatic scaling and WebSocket support
- **Replit Authentication**: OIDC-based authentication service for user management and secure login flows

### Development Tools
- **Vite**: Fast build tool with HMR, React plugin, and development server
- **Replit Integration**: Development environment plugins including error overlay and cartographer for enhanced debugging

### UI and Styling
- **Radix UI**: Comprehensive set of accessible, unstyled UI primitives for building the component library
- **Tailwind CSS**: Utility-first CSS framework with custom design system and dark mode support
- **Lucide React**: Icon library providing consistent iconography throughout the application

### Form and Validation
- **React Hook Form**: Performant form library with built-in validation and TypeScript support
- **Zod**: Runtime type validation for form inputs, API responses, and database schema validation

### State Management
- **TanStack React Query**: Powerful data fetching and caching library with optimistic updates and background synchronization