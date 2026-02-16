/**
 * Deezer API integration service.
 * Fetches music data from Deezer and normalizes it to our Song model.
 */
import { Injectable, Logger } from '@nestjs/common';

const DEEZER_API_BASE = 'https://api.deezer.com';

export interface DeezerTrack {
  id: number;
  title: string;
  title_short?: string;
  duration: number;
  preview?: string;
  artist: {
    id: number;
    name: string;
  };
  album: {
    id: number;
    title: string;
    cover_medium?: string;
    cover_big?: string;
    cover?: string;
  };
  genre?: {
    id: number;
    name: string;
  };
  rank?: number; // Chart position
  position?: number; // Chart position (alternative)
}

export interface DeezerSearchResponse {
  data: DeezerTrack[];
  total: number;
  next?: string;
}

export interface DeezerChartResponse {
  tracks: {
    data: DeezerTrack[];
    total: number;
  };
}

export interface NormalizedSong {
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  duration: number;
  previewUrl: string | null;
  genre: string;
  popularity: number;
  deezerId: number;
}

@Injectable()
export class DeezerService {
  private readonly logger = new Logger(DeezerService.name);

  /**
   * Search Deezer for tracks.
   */
  async search(query: string, limit = 50): Promise<NormalizedSong[]> {
    try {
      const url = `${DEEZER_API_BASE}/search?q=${encodeURIComponent(query)}&limit=${limit}`;
      const response = await fetch(url);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Deezer API error: ${response.status} - ${errorText.substring(0, 100)}`);
      }
      const data: any = await response.json();
      
      // Handle response structure
      const tracks: DeezerTrack[] = data.data || [];
      if (tracks.length === 0) {
        this.logger.warn(`No tracks found for query: ${query}`);
      }
      
      return tracks.map((track, index) => this.normalizeTrack(track, index));
    } catch (error) {
      this.logger.error(`Deezer search failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Fetch trending tracks from Deezer charts.
   * Falls back to popular search if charts endpoint fails.
   */
  async getTrending(limit = 50): Promise<NormalizedSong[]> {
    try {
      // Try charts endpoint first
      const url = `${DEEZER_API_BASE}/chart/0/tracks?limit=${limit}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Deezer API error: ${response.status}`);
      }
      const data: any = await response.json();
      
      // Handle different response structures
      let tracks: DeezerTrack[] = [];
      if (data.tracks?.data) {
        tracks = data.tracks.data;
      } else if (data.data) {
        tracks = data.data;
      } else if (Array.isArray(data)) {
        tracks = data;
      }
      
      // If we got tracks, return them
      if (tracks.length > 0) {
        return tracks.map((track, index) =>
          this.normalizeTrack(track, index, true)
        );
      }
      
      // Fallback: use popular search query
      this.logger.warn('Charts endpoint returned no tracks, falling back to popular search');
      return this.search('popular', limit);
    } catch (error) {
      this.logger.warn(`Deezer charts failed, using fallback: ${error.message}`);
      // Fallback to popular search
      try {
        return await this.search('popular', limit);
      } catch (fallbackError) {
        this.logger.error(`Deezer charts and fallback failed: ${fallbackError.message}`);
        throw fallbackError;
      }
    }
  }

  /**
   * Fetch tracks by genre.
   */
  async getByGenre(genreId: number, limit = 50): Promise<NormalizedSong[]> {
    try {
      const url = `${DEEZER_API_BASE}/genre/${genreId}/tracks?limit=${limit}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Deezer API error: ${response.status}`);
      }
      const data: any = await response.json();
      
      // Handle different response structures
      let tracks: DeezerTrack[] = [];
      if (data.tracks?.data) {
        tracks = data.tracks.data;
      } else if (data.data) {
        tracks = data.data;
      } else if (Array.isArray(data)) {
        tracks = data;
      } else {
        this.logger.warn('Unexpected Deezer response structure:', JSON.stringify(data).substring(0, 200));
        throw new Error('Unexpected Deezer API response structure');
      }
      
      return tracks.map((track, index) =>
        this.normalizeTrack(track, index)
      );
    } catch (error) {
      this.logger.error(`Deezer genre failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Normalize Deezer track to our Song model.
   * @param track Deezer track object
   * @param index Position in results (for popularity calculation)
   * @param isChart Whether this is from charts endpoint
   */
  private normalizeTrack(
    track: DeezerTrack,
    index: number,
    isChart = false
  ): NormalizedSong {
    // Title: use short version if available, fallback to full title
    const title = track.title_short?.trim() || track.title?.trim() || 'Unknown';

    // Artist: extract name
    const artist = track.artist?.name?.trim() || 'Unknown Artist';

    // Album: extract title
    const album = track.album?.title?.trim() || 'Unknown Album';

    // Cover URL: prefer big, fallback to medium, then default
    const coverUrl =
      track.album?.cover_big ||
      track.album?.cover_medium ||
      track.album?.cover ||
      'https://via.placeholder.com/500x500?text=No+Cover';

    // Duration: convert to seconds (Deezer provides in seconds)
    const duration = track.duration || 0;

    // Preview URL: may be null
    const previewUrl = track.preview?.trim() || null;

    // Genre: extract from track or fallback
    const genre = track.genre?.name?.trim() || 'Other';

    // Popularity: calculate based on position
    // Charts: higher rank = higher popularity (100 - position/10)
    // Search: default to 50, adjust slightly by position
    let popularity = 50;
    if (isChart) {
      const position = track.rank || track.position || index + 1;
      popularity = Math.max(0, Math.min(100, 100 - Math.floor(position / 10)));
    } else {
      // Search results: first results are more relevant
      popularity = Math.max(30, Math.min(70, 50 - Math.floor(index / 10)));
    }

    return {
      title,
      artist,
      album,
      coverUrl,
      duration,
      previewUrl,
      genre,
      popularity,
      deezerId: track.id,
    };
  }
}
