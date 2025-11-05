# Local Authentication Module

This module provides a simplified authentication system for local development of KökÖğreti.

## Purpose

The main application uses Replit's OpenID Connect authentication (`server/replitAuth.ts`), which only works when the application is running on Replit's platform. When developing locally, you need a different authentication strategy.

## What It Does

This module provides:

1. **Auto-login**: Automatically creates and logs in a test user
2. **Session Management**: Uses in-memory session storage (no database required for sessions)
3. **Compatible API**: Exports the same functions as `replitAuth.ts` so routes don't need to change

## Test User

When using local authentication, you'll be automatically logged in as:
- **ID**: `local-dev-user-1`
- **Email**: `test@local.dev`
- **Name**: Test User

This user is automatically created in your database the first time you access the application.

## How to Use

1. In `server/routes.ts`, change the import line:

```typescript
// For Replit deployment:
import { setupAuth, isAuthenticated } from "./replitAuth";

// For local development:
import { setupAuth, isAuthenticated } from "./localAuth";
```

2. Run the application locally:
```bash
npm run dev
```

3. The app will automatically log you in as the test user

## Security Notes

⚠️ **WARNING**: This authentication module is **ONLY** for local development!

- No password protection
- Auto-login for convenience
- In-memory session storage
- Not suitable for production use

**Never deploy this to production!** Always use `./replitAuth` when deploying to Replit or any public environment.

## Architecture

The module provides three main exports:

### `getSession()`
Returns an Express session middleware configured with:
- In-memory session store (MemoryStore)
- 7-day session TTL
- Secure cookies disabled for local HTTP

### `setupAuth(app)`
Sets up authentication routes:
- `GET /api/login` - Creates and logs in test user
- `GET /api/logout` - Destroys session

### `isAuthenticated`
Middleware that:
- Checks for existing session
- Auto-creates test user if no session exists
- Sets `req.user` for route compatibility

## Session Structure

The session stores a user object matching the Replit auth structure:
```typescript
{
  claims: {
    sub: 'local-dev-user-1',  // User ID
    email: 'test@local.dev',
    first_name: 'Test',
    last_name: 'User',
    profile_image_url: null
  }
}
```

This ensures all routes that expect `req.user.claims.sub`, `req.user.claims.email`, etc. will work correctly.

## Troubleshooting

### Issue: "Session not persisting"
- Solution: MemoryStore resets when server restarts. This is expected behavior for local dev.

### Issue: "Want to test with different users"
- Solution: Modify the `testUser` object in `server/localAuth.ts` to create different test users, or add manual user creation logic.

### Issue: "Getting 401 Unauthorized"
- Solution: The middleware should auto-login. Check that you're using `./localAuth` in routes.ts and the server restarted after the change.

## Comparison with Replit Auth

| Feature | LocalAuth | ReplitAuth |
|---------|-----------|------------|
| Login Method | Auto-login | OpenID Connect |
| User Management | Single test user | Real Replit users |
| Session Storage | In-memory | PostgreSQL |
| Security | None (dev only) | Full OAuth2/OIDC |
| Cookie Security | HTTP only | HTTPS required |
| Token Refresh | N/A | Automatic |

## Files

- `server/localAuth.ts` - This authentication module
- `server/replitAuth.ts` - Production authentication (Replit OIDC)
- `server/routes.ts` - Where you change the import to switch auth systems
