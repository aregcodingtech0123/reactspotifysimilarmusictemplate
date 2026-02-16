/**
 * Playlist controller: maps HTTP to playlist service.
 */
import { Response, NextFunction } from 'express';
import { playlistService } from './playlist.service';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import type { ApiSuccessResponse } from '../../types/api.types';
import type { CreatePlaylistBody, AddTrackBody, PlaylistResponse, TrackResponse } from './playlist.types';

export const playlistController = {
  async create(
    req: AuthenticatedRequest & { body: CreatePlaylistBody },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }
      const result = await playlistService.create(req.user.id, req.body);
      const json: ApiSuccessResponse<PlaylistResponse> = { success: true, data: result };
      res.status(201).json(json);
    } catch (e) {
      next(e);
    }
  },

  async getMany(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }
      const result = await playlistService.getMany(req.user.id);
      const json: ApiSuccessResponse<PlaylistResponse[]> = { success: true, data: result };
      res.json(json);
    } catch (e) {
      next(e);
    }
  },

  async getById(
    req: AuthenticatedRequest & { params: { id: string } },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }
      const result = await playlistService.getById(req.params.id, req.user.id);
      const json: ApiSuccessResponse<PlaylistResponse> = { success: true, data: result };
      res.json(json);
    } catch (e) {
      next(e);
    }
  },

  async addTrack(
    req: AuthenticatedRequest & { params: { id: string }; body: AddTrackBody },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }
      const result = await playlistService.addTrack(req.params.id, req.user.id, req.body);
      const json: ApiSuccessResponse<TrackResponse> = { success: true, data: result };
      res.status(201).json(json);
    } catch (e) {
      next(e);
    }
  },

  async delete(
    req: AuthenticatedRequest & { params: { id: string } },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }
      await playlistService.delete(req.params.id, req.user.id);
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  },
};
