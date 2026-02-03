/**
 * Playlists service: same business logic as Express playlist service.
 */
import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { AddTrackDto } from './dto/add-track.dto';

export interface PlaylistResponse {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
  tracks?: TrackResponse[];
}

export interface TrackResponse {
  id: string;
  title: string;
  artist: string;
  playlistId: string;
}

@Injectable()
export class PlaylistsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreatePlaylistDto): Promise<PlaylistResponse> {
    const name = dto.name?.trim();
    if (!name) throw new BadRequestException('Playlist name is required');
    const playlist = await this.prisma.playlist.create({
      data: { name, userId },
    });
    return playlist as PlaylistResponse;
  }

  async getMany(userId: string): Promise<PlaylistResponse[]> {
    const playlists = await this.prisma.playlist.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return playlists as PlaylistResponse[];
  }

  async getById(playlistId: string, userId: string): Promise<PlaylistResponse> {
    const playlist = await this.prisma.playlist.findUnique({
      where: { id: playlistId },
      include: { tracks: true },
    });
    if (!playlist) throw new NotFoundException('Playlist not found');
    if (playlist.userId !== userId) throw new ForbiddenException('Forbidden');
    return {
      id: playlist.id,
      name: playlist.name,
      userId: playlist.userId,
      createdAt: playlist.createdAt,
      tracks: playlist.tracks as TrackResponse[],
    };
  }

  async addTrack(playlistId: string, userId: string, dto: AddTrackDto): Promise<TrackResponse> {
    const playlist = await this.prisma.playlist.findFirst({
      where: { id: playlistId, userId },
    });
    if (!playlist) throw new NotFoundException('Playlist not found');
    const title = dto.title?.trim();
    const artist = dto.artist?.trim();
    if (!title || !artist) throw new BadRequestException('Title and artist are required');
    const track = await this.prisma.track.create({
      data: { playlistId, title, artist },
    });
    return track as TrackResponse;
  }

  async delete(playlistId: string, userId: string): Promise<void> {
    const playlist = await this.prisma.playlist.findFirst({
      where: { id: playlistId, userId },
    });
    if (!playlist) throw new NotFoundException('Playlist not found');
    await this.prisma.playlist.delete({ where: { id: playlistId } });
  }
}
