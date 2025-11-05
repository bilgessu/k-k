# KökÖğreti - Local Development Setup

This guide will help you run KökÖğreti on your local computer.

## Prerequisites

Before you start, make sure you have these installed on your computer:

1. **Node.js** (version 18 or higher)
   - Download from: https://nodejs.org/
   - To check if you have it: `node --version`

2. **PostgreSQL** (version 14 or higher)
   - Download from: https://www.postgresql.org/download/
   - Or use Docker: `docker run -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres`

3. **Git** (optional, for cloning)
   - Download from: https://git-scm.com/

## Step 1: Get the Project Files

### Option A: Download from Replit
1. In Replit, click the three dots menu
2. Select "Download as zip"
3. Extract the zip file to a folder on your computer

### Option B: Clone from Git (if available)
```bash
git clone <your-repository-url>
cd kokogretim
```

## Step 2: Install Dependencies

Open a terminal in the project folder and run:

```bash
npm install
```

This will install all the required packages (might take a few minutes).

## Step 3: Configure Authentication for Local Development

The application uses Replit's OpenID Connect authentication by default, which only works on Replit. For local development, we need to switch to a simplified authentication system.

### Option A: Using the Automated Script (Recommended)

**On Mac/Linux:**
```bash
./switch-auth.sh local
```

**On Windows:**
```batch
switch-auth.bat local
```

### Option B: Manual Configuration

1. Open `server/routes.ts` in your text editor

2. Find this line (around line 5):
```typescript
import { setupAuth, isAuthenticated } from "./replitAuth";
```

3. Change it to:
```typescript
import { setupAuth, isAuthenticated } from "./localAuth";
```

4. Save the file

**Important:** When deploying back to Replit, use `./switch-auth.sh replit` or change the line back to `"./replitAuth"` manually

## Step 4: Set Up Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Open the `.env` file and fill in your values:

```env
# Database Connection
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/kokogretim

# AI API Keys (get these from the providers)
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# Session Secret (use any random string)
SESSION_SECRET=your_super_secret_random_string_here

# Development Settings
NODE_ENV=development
HOST=0.0.0.0
PORT=5000
```

### How to Get API Keys:

**Gemini API Key:**
1. Go to https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key to your `.env` file

**OpenAI API Key:**
1. Go to https://platform.openai.com/api-keys
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key to your `.env` file

## Step 5: Set Up the Database

1. **Create the database:**
```bash
# Connect to PostgreSQL
psql -U postgres

# In the PostgreSQL prompt:
CREATE DATABASE kokogretim;
\q
```

2. **Push the database schema:**
```bash
npm run db:push
```

This will create all the necessary tables in your database.

## Step 6: Run the Application

Start the development server:

```bash
npm run dev
```

You should see:
```
Server running on http://0.0.0.0:5000
Vite dev server started
```

## Step 7: Open the Application

Open your web browser and go to:
```
http://localhost:5000
```

You should see the KökÖğreti application!

**Note:** When running locally, you'll be automatically logged in as a test user (`test@local.dev`). This is for development purposes only.

## Common Issues and Solutions

### Issue 1: Port 5000 is already in use
**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**
- Windows: `netstat -ano | findstr :5000` then `taskkill /PID <PID> /F`
- Mac/Linux: `lsof -ti:5000 | xargs kill -9`
- Or change the PORT in `.env` to a different number (like 3000)

### Issue 2: Database connection fails
**Error:** `connection refused` or `password authentication failed`

**Solution:**
- Make sure PostgreSQL is running
- Check your DATABASE_URL in `.env`
- Try: `postgresql://postgres:postgres@localhost:5432/kokogretim`
- Make sure the database `kokogretim` exists

### Issue 3: Missing API keys
**Error:** API calls fail or return errors

**Solution:**
- Make sure you've added your GEMINI_API_KEY and OPENAI_API_KEY to `.env`
- Restart the server after adding keys: `Ctrl+C` then `npm run dev`

### Issue 4: Dependencies won't install
**Error:** Various npm install errors

**Solution:**
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and package-lock.json
- Run `npm install` again
- Make sure you have Node.js 18 or higher

### Issue 5: TypeScript errors
**Error:** Type errors in the console

**Solution:**
- Run: `npm run check` to see all TypeScript errors
- Most errors won't prevent the app from running in development mode

## Development Commands

```bash
# Start development server (with hot reload)
npm run dev

# Build for production
npm run build

# Start production server (after build)
npm start

# Type check
npm run check

# Push database schema changes
npm run db:push
```

## Project Structure

```
kokogretim/
├── client/               # React frontend
│   ├── src/
│   │   ├── pages/       # Page components
│   │   ├── components/  # Reusable components
│   │   └── lib/         # Utilities and helpers
├── server/              # Express backend
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API routes
│   └── storage.ts       # Database operations
├── shared/              # Shared code
│   └── schema.ts        # Database schema
├── .env                 # Environment variables (create this)
└── package.json         # Dependencies
```

## Next Steps

After the application is running:

1. **Create an account** - The first user will be created automatically
2. **Add a child profile** - Click "Çocuk Profili Ekle"
3. **Record a voice message** - Use "Ses Kaydı" to record your voice
4. **Generate a story** - The AI will create a personalized story
5. **Listen in child mode** - Switch to child mode to listen to stories

## Updating the Project

When you make changes:

1. **Database schema changes:**
   - Edit `shared/schema.ts`
   - Run `npm run db:push`

2. **Code changes:**
   - The dev server will auto-reload
   - If it doesn't, restart with `Ctrl+C` and `npm run dev`

3. **New dependencies:**
   - Add with `npm install package-name`
   - Example: `npm install axios`

## Getting Help

If you encounter issues:

1. Check the console for error messages
2. Look at the terminal where `npm run dev` is running
3. Check the browser console (F12)
4. Make sure all environment variables are set correctly

## Production Deployment

For deploying to production:

1. **Restore Replit authentication** (if you changed it for local dev):
   - In `server/routes.ts`, change the import back to:
   ```typescript
   import { setupAuth, isAuthenticated } from "./replitAuth";
   ```

2. Build the application:
```bash
npm run build
```

3. Set environment variables on your server

4. Start the production server:
```bash
npm start
```

5. Use a process manager like PM2:
```bash
npm install -g pm2
pm2 start dist/index.js --name kokogretim
```

## Quick Reference

### Running the App
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run check        # Check TypeScript errors
npm run db:push      # Update database schema
```

### Important Files
- `server/routes.ts` - Change auth import here for local/Replit
- `.env` - Your environment variables (don't commit this!)
- `shared/schema.ts` - Database schema definitions
- `client/src/pages/` - React page components
- `server/storage.ts` - Database operations

### Local vs Replit Setup

| Feature | Local | Replit |
|---------|-------|--------|
| Authentication | `./localAuth` | `./replitAuth` |
| Database | Local PostgreSQL | Neon (cloud) |
| Environment | `.env` file | Replit secrets |
| Test User | `test@local.dev` | Real Replit users |

---

**Happy coding!** 🎉

If you have any questions or run into issues, feel free to ask for help.
