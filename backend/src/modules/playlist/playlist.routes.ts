/**
 * Playlist routes: CRUD + add track. All protected.
 */
import { Router } from 'express';
import { playlistController } from './playlist.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/', (req, res, next) => playlistController.create(req as any, res, next));
router.get('/', (req, res, next) => playlistController.getMany(req as any, res, next));
router.get('/:id', (req, res, next) => playlistController.getById(req as any, res, next));
router.post('/:id/tracks', (req, res, next) => playlistController.addTrack(req as any, res, next));
router.delete('/:id', (req, res, next) => playlistController.delete(req as any, res, next));

export const playlistRoutes = router;
