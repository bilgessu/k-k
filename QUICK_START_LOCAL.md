# Quick Start - Running KökÖğreti Locally

This is a condensed guide for experienced developers. For detailed instructions, see [LOCAL_SETUP.md](./LOCAL_SETUP.md).

## Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Gemini API Key
- OpenAI API Key

## Quick Setup (5 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Switch to local authentication
./switch-auth.sh local  # Mac/Linux
# or
switch-auth.bat local   # Windows

# 3. Set up environment
cp .env.example .env
# Edit .env and add your API keys

# 4. Create database
createdb kokogretim
npm run db:push

# 5. Run the app
npm run dev
```

Open http://localhost:5000

## What's Different Locally?

| Feature | Replit | Local |
|---------|--------|-------|
| Auth | OpenID Connect | Auto-login test user |
| Database | Neon (cloud) | Local PostgreSQL |
| Env Vars | Replit Secrets | `.env` file |

## Key Commands

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run db:push      # Update database schema
./switch-auth.sh     # Toggle auth mode
```

## Going Back to Replit

```bash
# Switch back to Replit authentication
./switch-auth.sh replit

# Commit your changes
git add .
git commit -m "Your changes"
git push
```

## Test User

When running locally, you're automatically logged in as:
- Email: `test@local.dev`
- Name: Test User

## Common Issues

**Port 5000 in use?**
```bash
# Mac/Linux
lsof -ti:5000 | xargs kill -9
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**Database connection failed?**
- Check PostgreSQL is running
- Verify `DATABASE_URL` in `.env`
- Make sure database `kokogretim` exists

**TypeScript errors?**
```bash
npm run check  # See all errors
```

## Project Structure

```
kokogretim/
├── client/           # React frontend
│   └── src/
│       ├── pages/    # Page components
│       └── components/
├── server/           # Express backend
│   ├── routes.ts     # API routes (change auth here)
│   ├── replitAuth.ts # Replit authentication
│   └── localAuth.ts  # Local authentication
├── shared/
│   └── schema.ts     # Database schema
└── .env              # Your secrets (create this)
```

## Need Help?

- Detailed setup: [LOCAL_SETUP.md](./LOCAL_SETUP.md)
- Auth documentation: [server/localAuth.README.md](./server/localAuth.README.md)
- Main README: [README.md](./README.md)

---

**Ready to code!** 🚀
