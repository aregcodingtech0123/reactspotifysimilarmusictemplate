/**
 * Central route registration: mounts all API modules under /api.
 */
import { Router } from 'express';
import { authRoutes } from './modules/auth/auth.routes';
import { userRoutes } from './modules/user/user.routes';
import { playlistRoutes } from './modules/playlist/playlist.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/playlists', playlistRoutes);

export const apiRoutes = router;
