/**
 * Playlist repository: data access only.
 */
import { prisma } from '../../config/db';
import type { PlaylistResponse, TrackResponse } from './playlist.types';

export const playlistRepository = {
  async create(userId: string, name: string): Promise<PlaylistResponse> {
    const playlist = await prisma.playlist.create({
      data: { name, userId },
    });
    return playlist as PlaylistResponse;
  },

  async findManyByUserId(userId: string): Promise<PlaylistResponse[]> {
    const playlists = await prisma.playlist.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return playlists as PlaylistResponse[];
  },

  async findById(id: string): Promise<PlaylistResponse | null> {
    const playlist = await prisma.playlist.findUnique({
      where: { id },
      include: { tracks: true },
    });
    if (!playlist) return null;
    return {
      id: playlist.id,
      name: playlist.name,
      userId: playlist.userId,
      createdAt: playlist.createdAt ?? new Date(),
      tracks: playlist.tracks as TrackResponse[],
    };
  },

  async addTrack(playlistId: string, title: string, artist: string): Promise<TrackResponse> {
    const track = await prisma.track.create({
      data: { playlistId, title, artist },
    });
    return track as TrackResponse;
  },

  async delete(id: string): Promise<void> {
    await prisma.playlist.delete({ where: { id } });
  },

  async existsAndOwnedBy(playlistId: string, userId: string): Promise<boolean> {
    const playlist = await prisma.playlist.findFirst({
      where: { id: playlistId, userId },
    });
    return !!playlist;
  },
};
