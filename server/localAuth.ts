/**
 * Local Development Authentication
 * 
 * This file provides a simple authentication solution for local development.
 * It bypasses Replit's OpenID Connect authentication which only works on Replit.
 * 
 * IMPORTANT: This should ONLY be used for local development, never in production!
 */

import session from "express-session";
import type { Express, RequestHandler } from "express";
import { storage } from "./storage";

// Simple in-memory session store for local development
const MemoryStore = require('memorystore')(session);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  return session({
    secret: process.env.SESSION_SECRET || 'local-dev-secret-change-this',
    store: new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to false for local development (http)
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.use(getSession());

  // Auto-login endpoint for local development
  app.get('/api/login', async (req, res) => {
    // Create a default test user for local development
    const testUser = {
      id: 'local-dev-user-1',
      email: 'test@local.dev',
      firstName: 'Test',
      lastName: 'User',
      profileImageUrl: null,
    };

    // Save user to database
    await storage.upsertUser(testUser);

    // Save user in session
    (req.session as any).user = {
      claims: {
        sub: testUser.id,
        email: testUser.email,
        first_name: testUser.firstName,
        last_name: testUser.lastName,
        profile_image_url: testUser.profileImageUrl,
      }
    };

    res.redirect('/');
  });

  // Logout endpoint
  app.get('/api/logout', (req, res) => {
    req.session.destroy(() => {
      res.redirect('/');
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = (req.session as any).user;

  if (!user) {
    // Auto-login for local development
    const testUser = {
      id: 'local-dev-user-1',
      email: 'test@local.dev',
      firstName: 'Test',
      lastName: 'User',
      profileImageUrl: null,
    };

    // Save user to database
    await storage.upsertUser(testUser);

    // Save user in session
    (req.session as any).user = {
      claims: {
        sub: testUser.id,
        email: testUser.email,
        first_name: testUser.firstName,
        last_name: testUser.lastName,
        profile_image_url: testUser.profileImageUrl,
      }
    };

    // Set req.user for compatibility with route handlers
    (req as any).user = (req.session as any).user;
    
    return next();
  }

  // Set req.user for compatibility with route handlers
  (req as any).user = user;
  next();
};
