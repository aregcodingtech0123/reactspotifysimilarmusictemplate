/**
 * Songs service: CRUD operations and Deezer integration.
 * All Prisma logic is here (not in controller).
 */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DeezerService, NormalizedSong } from './deezer.service';

export interface SongResponse {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  duration: number;
  previewUrl: string | null;
  genre: string;
  popularity: number;
  deezerId: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class SongsService {
  private readonly logger = new Logger(SongsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly deezer: DeezerService
  ) {}

  /**
   * Convert Prisma Song (with BigInt deezerId) to SongResponse (with number deezerId).
   */
  private toSongResponse(song: any): SongResponse {
    return {
      id: song.id,
      title: song.title,
      artist: song.artist,
      album: song.album,
      coverUrl: song.coverUrl,
      duration: song.duration,
      previewUrl: song.previewUrl,
      genre: song.genre,
      popularity: song.popularity,
      deezerId: Number(song.deezerId), // Convert BigInt to number
      createdAt: song.createdAt,
      updatedAt: song.updatedAt,
    };
  }

  /**
   * Get all songs with pagination and optional filters (genre, artist, album).
   */
  async findAll(
    page = 1,
    limit = 50,
    genre?: string,
    artist?: string,
    album?: string,
    sortBy: 'popularity' | 'createdAt' = 'popularity',
    order: 'asc' | 'desc' = 'desc'
  ): Promise<{ songs: SongResponse[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (genre) where.genre = genre;
    if (artist) where.artist = artist;
    if (album) where.album = album;

    const [songs, total] = await Promise.all([
      this.prisma.song.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: order },
      }),
      this.prisma.song.count({ where }),
    ]);

    return {
      songs: songs.map((song) => this.toSongResponse(song)),
      total,
      page,
      limit,
    };
  }

  /**
   * Get trending songs (sorted by popularity).
   */
  async getTrending(limit = 20): Promise<SongResponse[]> {
    const songs = await this.prisma.song.findMany({
      take: limit,
      orderBy: { popularity: 'desc' },
    });
    return songs.map((song) => this.toSongResponse(song));
  }

  /**
   * Get newest songs (sorted by createdAt).
   */
  async getNew(limit = 20): Promise<SongResponse[]> {
    const songs = await this.prisma.song.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
    return songs.map((song) => this.toSongResponse(song));
  }

  /**
   * Get songs by genre.
   */
  async getByGenre(genre: string, limit = 50): Promise<SongResponse[]> {
    const songs = await this.prisma.song.findMany({
      where: { genre },
      take: limit,
      orderBy: { popularity: 'desc' },
    });
    return songs.map((song) => this.toSongResponse(song));
  }

  /**
   * Search songs by query (title, artist, or album).
   */
  async search(q: string, limit = 30): Promise<SongResponse[]> {
    const query = (q || '').trim();
    if (!query) return [];
    const search = { contains: query, mode: 'insensitive' as const };
    const songs = await this.prisma.song.findMany({
      where: {
        OR: [
          { title: search },
          { artist: search },
          { album: search },
        ],
      },
      take: limit,
      orderBy: { popularity: 'desc' },
    });
    return songs.map((song) => this.toSongResponse(song));
  }

  /**
   * Get song by ID.
   */
  async getById(id: string): Promise<SongResponse> {
    const song = await this.prisma.song.findUnique({ where: { id } });
    if (!song) {
      throw new NotFoundException(`Song with ID ${id} not found`);
    }
    return this.toSongResponse(song);
  }

  /**
   * Seed songs from Deezer (search or charts).
   * Prevents duplicates using deezerId.
   */
  async seedFromDeezer(
    source: 'search' | 'trending' | 'genre',
    query?: string,
    genreId?: number
  ): Promise<{ imported: number; skipped: number }> {
    let normalizedSongs: NormalizedSong[];

    try {
      switch (source) {
        case 'search':
          if (!query) {
            throw new BadRequestException('Query is required for search');
          }
          normalizedSongs = await this.deezer.search(query, 100);
          break;
        case 'trending':
          normalizedSongs = await this.deezer.getTrending(100);
          break;
        case 'genre':
          if (!genreId) {
            throw new BadRequestException('Genre ID is required');
          }
          normalizedSongs = await this.deezer.getByGenre(genreId, 100);
          break;
        default:
          throw new BadRequestException(`Unknown source: ${source}`);
      }
    } catch (error) {
      this.logger.error(`Deezer fetch failed: ${error.message}`);
      throw error;
    }

    let imported = 0;
    let skipped = 0;

    for (const song of normalizedSongs) {
      try {
        // Check if song already exists (by deezerId)
        const existing = await this.prisma.song.findUnique({
          where: { deezerId: BigInt(song.deezerId) },
        });

        if (existing) {
          skipped++;
          continue;
        }

        // Create new song
        await this.prisma.song.create({
          data: {
            title: song.title,
            artist: song.artist,
            album: song.album,
            coverUrl: song.coverUrl,
            duration: song.duration,
            previewUrl: song.previewUrl,
            genre: song.genre,
            popularity: song.popularity,
            deezerId: BigInt(song.deezerId),
          },
        });
        imported++;
      } catch (error) {
        // Log but continue (might be duplicate constraint or other error)
        this.logger.warn(`Failed to import song ${song.deezerId}: ${error.message}`);
        skipped++;
      }
    }

    this.logger.log(
      `Seed complete: ${imported} imported, ${skipped} skipped`
    );
    return { imported, skipped };
  }
}
