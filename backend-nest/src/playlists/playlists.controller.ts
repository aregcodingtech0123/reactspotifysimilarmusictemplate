/**
 * Playlists controller: CRUD + add track. All protected.
 */
import { Controller, Post, Get, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { PlaylistsService, PlaylistResponse, TrackResponse } from './playlists.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { AddTrackDto } from './dto/add-track.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

export interface UserPayload {
  id: string;
  username: string;
  email: string;
}

@Controller('playlists')
@UseGuards(JwtAuthGuard)
export class PlaylistsController {
  constructor(private readonly playlists: PlaylistsService) {}

  @Post()
  async create(
    @CurrentUser() user: UserPayload,
    @Body() dto: CreatePlaylistDto,
  ): Promise<{ success: true; data: PlaylistResponse }> {
    const data = await this.playlists.create(user.id, dto);
    return { success: true, data };
  }

  @Get()
  async getMany(@CurrentUser() user: UserPayload): Promise<{ success: true; data: PlaylistResponse[] }> {
    const data = await this.playlists.getMany(user.id);
    return { success: true, data };
  }

  @Get(':id')
  async getById(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
  ): Promise<{ success: true; data: PlaylistResponse }> {
    const data = await this.playlists.getById(id, user.id);
    return { success: true, data };
  }

  @Post(':id/tracks')
  async addTrack(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Body() dto: AddTrackDto,
  ): Promise<{ success: true; data: TrackResponse }> {
    const data = await this.playlists.addTrack(id, user.id, dto);
    return { success: true, data };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@CurrentUser() user: UserPayload, @Param('id') id: string): Promise<void> {
    await this.playlists.delete(id, user.id);
  }
}
