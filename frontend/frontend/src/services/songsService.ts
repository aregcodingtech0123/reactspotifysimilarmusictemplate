/**
 * Songs API service. Fetches from backend only (no external APIs).
 */

import { apiRequest } from './api';
import { getApiUrl } from '../config/apiConfig';

export interface Song {
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
  createdAt: string;
  updatedAt: string;
}

export interface SongsListResponse {
  songs: Song[];
  total: number;
  page: number;
  limit: number;
}

const SONGS_BASE = '/songs';

export async function fetchSongs(params?: {
  page?: number;
  limit?: number;
  genre?: string;
  artist?: string;
  album?: string;
  sortBy?: 'popularity' | 'createdAt';
  order?: 'asc' | 'desc';
  type?: 'trending' | 'discover';
}): Promise<{ ok: true; data: SongsListResponse } | { ok: false; error: { message: string } }> {
  const search = new URLSearchParams();
  if (params?.page) search.set('page', String(params.page));
  if (params?.limit) search.set('limit', String(params.limit));
  if (params?.genre) search.set('genre', params.genre);
  if (params?.type) search.set('type', params.type);
  if (params?.artist) search.set('artist', params.artist);
  if (params?.album) search.set('album', params.album);
  if (params?.sortBy) search.set('sortBy', params.sortBy);
  if (params?.order) search.set('order', params.order);
  const qs = search.toString();
  // Use AI service for songs
  const url = getApiUrl(`${SONGS_BASE}${qs ? `?${qs}` : ''}`, 'ai');
  const result = await apiRequest<{ songs?: Song[] } | Song[]>(url);
  if (!result.ok) return result;
  // Backend returns {"songs": [...]}, extract the array
  const songs = Array.isArray(result.data) 
    ? result.data 
    : (result.data as { songs?: Song[] })?.songs ?? [];
  return { ok: true, data: { songs, total: songs.length, page: params?.page || 1, limit: params?.limit || 50 } };
}

export async function fetchTrending(limit = 20): Promise<{ ok: true; data: Song[] } | { ok: false; error: { message: string } }> {
  const url = getApiUrl(`/trending?limit=${limit}`, 'ai');
  const result = await apiRequest<{ songs?: Song[] } | Song[]>(url);
  if (!result.ok) return result;
  // Backend returns {"songs": [...]}, extract the array
  const songs = Array.isArray(result.data) 
    ? result.data 
    : (result.data as { songs?: Song[] })?.songs ?? [];
  return { ok: true, data: songs };
}

export async function fetchNew(limit = 20): Promise<{ ok: true; data: Song[] } | { ok: false; error: { message: string } }> {
  const url = getApiUrl(`${SONGS_BASE}?new=true&limit=${limit}`, 'ai');
  return apiRequest<Song[]>(url);
}

export async function fetchByGenre(genre: string, limit = 50): Promise<{ ok: true; data: Song[] } | { ok: false; error: { message: string } }> {
  const url = getApiUrl(`${SONGS_BASE}?genre=${encodeURIComponent(genre)}&limit=${limit}`, 'ai');
  return apiRequest<Song[]>(url);
}

export async function fetchSongById(id: string): Promise<{ ok: true; data: Song } | { ok: false; error: { message: string } }> {
  const url = getApiUrl(`${SONGS_BASE}/${encodeURIComponent(id)}`, 'ai');
  return apiRequest<Song>(url);
}

export async function fetchDiscover(genre?: string, limit = 20): Promise<{ ok: true; data: Song[] } | { ok: false; error: { message: string } }> {
  const search = new URLSearchParams();
  if (genre) search.set('genre', genre);
  search.set('limit', String(limit));
  const url = getApiUrl(`/discover?${search.toString()}`, 'ai');
  const result = await apiRequest<{ songs?: Song[] } | Song[]>(url);
  if (!result.ok) return result;
  const songs = Array.isArray(result.data) 
    ? result.data 
    : (result.data as { songs?: Song[] })?.songs ?? [];
  return { ok: true, data: songs };
}

export async function searchSongs(q: string, limit = 30): Promise<{ ok: true; data: Song[] } | { ok: false; error: { message: string } }> {
  if (!q?.trim()) return { ok: true, data: [] };
  const url = getApiUrl(`${SONGS_BASE}?q=${encodeURIComponent(q.trim())}&limit=${limit}`, 'ai');
  return apiRequest<Song[]>(url);
}

export async function fetchSongsByArtist(artist: string, limit = 50): Promise<{ ok: true; data: Song[] } | { ok: false; error: { message: string } }> {
  const res = await fetchSongs({ artist, limit, sortBy: 'popularity', order: 'desc' });
  if (!res.ok) return res;
  return { ok: true, data: res.data.songs };
}

export async function fetchSongsByAlbum(album: string, artist?: string, limit = 50): Promise<{ ok: true; data: SongsListResponse } | { ok: false; error: { message: string } }> {
  return fetchSongs({ album, ...(artist ? { artist } : {}), limit });
}
