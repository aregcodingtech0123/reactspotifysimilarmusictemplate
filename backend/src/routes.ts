/**
 * Central route registration: mounts all API modules under /api.
 */
import { Router, Request, Response } from 'express';
import { authRoutes } from './modules/auth/auth.routes';
import { userRoutes } from './modules/user/user.routes';
import { playlistRoutes } from './modules/playlist/playlist.routes';
import { contactRoutes } from './modules/contact/contact.routes';
import { prisma } from './config/db';

const router = Router();

// Health check endpoint - must be defined BEFORE other routes to avoid conflicts
router.get('/health', async (_req: Request, res: Response) => {
  console.log('[Routes] Health endpoint called');
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

// Simple test endpoint
router.get('/test', (_req: Request, res: Response) => {
  console.log('[Routes] Test endpoint called');
  res.json({ message: 'API routes are working!', timestamp: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/playlists', playlistRoutes);
router.use('/contact', contactRoutes);

// Log registered routes on startup
console.log('[Routes] API routes registered: /health, /test, /auth, /users, /playlists, /contact');

export const apiRoutes = router;
