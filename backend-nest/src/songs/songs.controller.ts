/**
 * Songs controller: API endpoints for music discovery.
 * All endpoints return data from our database (not Deezer directly).
 */
import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { SongsService } from './songs.service';
import { SeedSongsDto } from './dto/seed-songs.dto';

@Controller('songs')
export class SongsController {
  constructor(private readonly songs: SongsService) {}

  /**
   * GET /api/songs
   * Get all songs with pagination, filtering, and sorting.
   */
  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('genre') genre?: string,
    @Query('artist') artist?: string,
    @Query('album') album?: string,
    @Query('sortBy') sortBy?: 'popularity' | 'createdAt',
    @Query('order') order?: 'asc' | 'desc'
  ) {
    const result = await this.songs.findAll(
      page,
      limit,
      genre,
      artist,
      album,
      sortBy || 'popularity',
      order || 'desc'
    );
    return { success: true, data: result };
  }

  /**
   * GET /api/songs/trending
   * Get trending songs (sorted by popularity).
   */
  @Get('trending')
  async getTrending(@Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number) {
    const songs = await this.songs.getTrending(limit);
    return { success: true, data: songs };
  }

  /**
   * GET /api/songs/new
   * Get newest songs (sorted by createdAt).
   */
  @Get('new')
  async getNew(@Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number) {
    const songs = await this.songs.getNew(limit);
    return { success: true, data: songs };
  }

  /**
   * GET /api/songs/search?q=...
   * Search songs by title, artist, or album.
   */
  @Get('search')
  async search(
    @Query('q') q: string,
    @Query('limit', new DefaultValuePipe(30), ParseIntPipe) limit: number
  ) {
    const songs = await this.songs.search(q || '', limit);
    return { success: true, data: songs };
  }

  /**
   * GET /api/songs/genre/:genre
   * Get songs by genre.
   */
  @Get('genre/:genre')
  async getByGenre(
    @Param('genre') genre: string,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number
  ) {
    const songs = await this.songs.getByGenre(genre, limit);
    return { success: true, data: songs };
  }

  /**
   * GET /api/songs/:id
   * Get a single song by ID.
   */
  @Get(':id')
  async getById(@Param('id') id: string) {
    const song = await this.songs.getById(id);
    return { success: true, data: song };
  }

  /**
   * POST /api/songs/seed
   * Seed songs from Deezer API (admin/script endpoint).
   * This is a one-time or periodic operation to populate the database.
   */
  @Post('seed')
  @HttpCode(HttpStatus.CREATED)
  async seedSongs(@Body() dto: SeedSongsDto) {
    const result = await this.songs.seedFromDeezer(
      dto.source,
      dto.query,
      dto.genreId
    );
    return { success: true, data: result };
  }
}
