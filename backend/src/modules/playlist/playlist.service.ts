/**
 * Playlist service: business logic using playlist repository.
 */
import { playlistRepository } from './playlist.repository';
import { AppError } from '../../middlewares/error.middleware';
import type { CreatePlaylistBody, AddTrackBody, PlaylistResponse, TrackResponse } from './playlist.types';

export const playlistService = {
  async create(userId: string, body: CreatePlaylistBody): Promise<PlaylistResponse> {
    const name = body.name?.trim();
    if (!name) {
      throw new AppError(400, 'Playlist name is required');
    }
    return playlistRepository.create(userId, name);
  },

  async getMany(userId: string): Promise<PlaylistResponse[]> {
    return playlistRepository.findManyByUserId(userId);
  },

  async getById(playlistId: string, userId: string): Promise<PlaylistResponse> {
    const playlist = await playlistRepository.findById(playlistId);
    if (!playlist) {
      throw new AppError(404, 'Playlist not found');
    }
    if (playlist.userId !== userId) {
      throw new AppError(403, 'Forbidden');
    }
    return playlist;
  },

  async addTrack(
    playlistId: string,
    userId: string,
    body: AddTrackBody
  ): Promise<TrackResponse> {
    const owned = await playlistRepository.existsAndOwnedBy(playlistId, userId);
    if (!owned) {
      throw new AppError(404, 'Playlist not found');
    }
    const title = body.title?.trim();
    const artist = body.artist?.trim();
    if (!title || !artist) {
      throw new AppError(400, 'Title and artist are required');
    }
    return playlistRepository.addTrack(playlistId, title, artist);
  },

  async delete(playlistId: string, userId: string): Promise<void> {
    const owned = await playlistRepository.existsAndOwnedBy(playlistId, userId);
    if (!owned) {
      throw new AppError(404, 'Playlist not found');
    }
    await playlistRepository.delete(playlistId);
  },
};
