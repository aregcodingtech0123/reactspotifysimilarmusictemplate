/**
 * API service for the FastAPI recommendation backend (AI service on port 8000).
 * Handles: Songs, Recommendations, History, Trending
 */
import { getApiUrl } from '../config/apiConfig';

const FETCH_TIMEOUT_MS = 180000; // 180s (3 min) — backend can be very slow (Gemini embed, Chroma init on first request)

/** Normalize API response: array, { songs }, { data }, { results }, etc. */
function toArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object') {
    const o = data as Record<string, unknown>;
    if (Array.isArray(o.songs)) return o.songs as T[];
    if (Array.isArray(o.results)) return o.results as T[];
    if (o.data !== undefined) {
      const d = o.data;
      if (Array.isArray(d)) return d as T[];
      if (d && typeof d === 'object' && Array.isArray((d as Record<string, unknown>).songs))
        return (d as Record<string, T[]>).songs;
    }
  }
  return [];
}

export interface RecommendationSong {
  id?: string | number;
  name: string;
  artist: string;
  preview_url: string;
  image: string;
  primary_genre?: string;
  title?: string;
  tags?: string;
}

export interface CatalogSong {
  id: string | number;
  title: string;
  artist: string;
  image: string;
  preview_url: string;
  tags: string;
  primary_genre?: string;
}

/** History item from GET /history: song metadata + played_at (ISO string). */
export interface HistorySong extends RecommendationSong {
  played_at?: string;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  // All recommendation API calls go to AI service (port 8000)
  const url = getApiUrl(path, 'ai');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  const fetchOptions: RequestInit = { ...options, headers, signal: controller.signal };

  console.log('Starting fetch:', url, `(timeout ${FETCH_TIMEOUT_MS / 1000}s)`);
  console.log('FULL REQUEST URL:', url);
  try {
    const res = await fetch(url, fetchOptions);
    clearTimeout(timeoutId);
    const text = await res.text();
    let data: T;
    try {
      data = (text ? JSON.parse(text) : {}) as T;
    } catch {
      throw new Error('Invalid JSON from server');
    }

    if (!res.ok) {
      const body = data as { detail?: string; type?: string };
      const message = body?.detail ?? res.statusText;
      const msg = typeof message === 'string' ? message : JSON.stringify(message);
      if (res.status === 500) {
        console.error('[API] Backend 500:', url, body?.detail ?? msg, body?.type ?? '');
        throw new Error(msg || 'Backend error – check server logs');
      }
      throw new Error(msg);
    }

    const preview = Array.isArray(data) ? `array(${(data as unknown[]).length})` : typeof data;
    console.log('[API] Success:', url, res.status, preview);
    if (Array.isArray(data)) {
      const arr = data as unknown[];
      console.log('BACKEND RETURNED:', { length: arr.length, first: arr[0] });
      if (arr.length === 0) console.log('Backend empty (Chroma may have no data)');
    } else if (data && typeof data === 'object') {
      const o = data as Record<string, unknown>;
      const songsLen = Array.isArray(o.songs) ? o.songs.length : 0;
      console.log('BACKEND RETURNED:', { songs: songsLen, keys: Object.keys(o) });
      if (songsLen === 0) console.log('Backend empty (Chroma may have no data)');
    }
    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    const isAbort = err instanceof Error && err.name === 'AbortError';
    const msg = err instanceof Error ? err.message : String(err);
    const isTimeout = isAbort || /timeout|timed out|aborted/i.test(msg);
    if (isTimeout) {
      console.warn('[API] Timeout after', FETCH_TIMEOUT_MS / 1000, 's – backend slow:', url);
      throw new Error('Backend timed out – check if it\'s running or slow');
    }
    console.error('[API] Fetch failed:', url, msg);
    const isNetworkError = /failed to fetch|networkerror|connection refused|econnrefused|load failed/i.test(msg);
    if (isNetworkError) {
      throw new Error(
        'Backend not running. In another terminal run: uvicorn main:app --reload --host 0.0.0.0 (from project root)'
      );
    }
    if (err instanceof Error) throw err;
    throw new Error('Recommendation service unavailable');
  }
}

/** Fetch all songs from the recommendation backend (catalog). */
export async function fetchAllSongs(): Promise<CatalogSong[]> {
  try {
    const raw = await request<CatalogSong[] | { songs?: CatalogSong[] }>('/songs');
    return toArray<CatalogSong>(raw);
  } catch (e) {
    console.error('[API] fetchAllSongs failed:', e);
    return [];
  }
}

/** Fetch trending songs. */
export async function fetchTrending(): Promise<RecommendationSong[]> {
  try {
    const raw = await request<RecommendationSong[] | { songs?: RecommendationSong[] }>('/trending');
    return toArray<RecommendationSong>(raw);
  } catch (e) {
    console.error('[API] fetchTrending failed:', e);
    return [];
  }
}

/** Fetch recent listened songs (most recent first). Each item includes played_at (ISO UTC). */
export async function fetchHistory(limit = 20): Promise<HistorySong[]> {
  try {
    const raw = await request<HistorySong[] | { songs?: HistorySong[] }>(`/history?limit=${limit}`);
    return toArray<HistorySong>(raw);
  } catch (e) {
    console.error('[API] fetchHistory failed:', e);
    return [];
  }
}

/** Fetch recommended songs for the current user. */
export async function fetchRecommendations(_userId?: string, genre?: string): Promise<RecommendationSong[]> {
  try {
    const path = genre ? `/recommend?genre=${encodeURIComponent(genre)}` : '/recommend';
    const raw = await request<RecommendationSong[] | { songs?: RecommendationSong[] }>(path);
    return toArray<RecommendationSong>(raw);
  } catch (e) {
    console.error('[API] fetchRecommendations failed:', e);
    return [];
  }
}

/** Fetch discover songs (random/least played). */
export async function fetchDiscover(genre?: string, limit = 20): Promise<RecommendationSong[]> {
  try {
    const path = genre ? `/discover?genre=${encodeURIComponent(genre)}&limit=${limit}` : `/discover?limit=${limit}`;
    const raw = await request<RecommendationSong[] | { songs?: RecommendationSong[] }>(path);
    return toArray<RecommendationSong>(raw);
  } catch (e) {
    console.error('[API] fetchDiscover failed:', e);
    return [];
  }
}

/** Generic fetch for a path; returns normalized song array. */
export async function fetchSongsFromPath(
  path: string,
  options: RequestInit = {}
): Promise<RecommendationSong[]> {
  try {
    const raw = await request<RecommendationSong[] | { songs?: RecommendationSong[] }>(path, options);
    return toArray<RecommendationSong>(raw);
  } catch (e) {
    console.error('[API] fetchSongsFromPath failed:', path, e);
    throw e;
  }
}

/** Log that the user listened to a song (updates history for recommendations). */
export async function logListen(songId: string | number): Promise<{ status: string; song_id: string | number }> {
  const body = await request<{ status: string; song_id: string | number }>('/listen', {
    method: 'POST',
    body: JSON.stringify({ song_id: songId }),
  });
  return body;
}

// Export API base URL for compatibility
export const BASE_URL = '/api';
