import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import SongCard from './SongCard';
import { GENRES } from '../constants/genres';
import { fetchSongsFromPath } from '../services/recommendationApi';

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/200?text=No+Cover';

function toSongItem(song) {
  if (!song) return null;
  return {
    id: song.id ?? song.name,
    title: song.title ?? song.name ?? '',
    artist: song.artist ?? '',
    image: song.image ?? song.coverUrl ?? song.cover_url ?? song.image_url,
    coverUrl: song.image ?? song.coverUrl ?? song.cover_url ?? song.image_url,
    preview_url: song.preview_url ?? song.previewUrl,
    previewUrl: song.preview_url ?? song.previewUrl,
    primary_genre: song.primary_genre ?? song.genre ?? '',
    genre: song.genre ?? song.primary_genre ?? '',
    ...song,
  };
}

function getSeeMoreLink(activeCategory, sectionKey) {
  if (activeCategory === 'All') {
    if (sectionKey === 'recommended') return '/discover';
    if (sectionKey === 'trending') return '/trendingsongsall';
    if (sectionKey === 'discover') return '/discover';
    if (sectionKey === 'history') return '/trendingsongsall';
  }
  const slug = activeCategory.toLowerCase().replace(/\s+/g, '-');
  return `/category/${slug}`;
}

/**
 * Section that fetches from an endpoint on mount (and optionally when genre changes).
 * Renders genre pills, loading skeleton, empty state, and grid of SongCards.
 */
function MusicSection({
  title,
  endpoint,
  defaultGenre = 'All',
  genresList = GENRES,
  emptyMessage = 'No songs yet – start listening!',
  seeMoreSectionKey = 'discover',
  limit,
}) {
  const [activeGenre, setActiveGenre] = useState(defaultGenre);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState({});
  const fetchIdRef = useRef(0);

  const fetchData = useCallback(async () => {
    if (!endpoint) return;
    const sep = endpoint.includes('?') ? '&' : '?';
    const params = [];
    if (limit != null) params.push(`limit=${limit}`);
    if (activeGenre && String(activeGenre).trim() !== 'All') {
      params.push(`genre=${encodeURIComponent(activeGenre)}`);
    }
    const path = params.length ? `${endpoint}${sep}${params.join('&')}` : endpoint;
    const thisFetchId = ++fetchIdRef.current;
    console.log('[MusicSection] Fetching:', title, path);
    setLoading(true);
    setError(null);
    const clearLoading = () => setLoading(false);
    const safetyTimer = setTimeout(() => {
      console.warn('[MusicSection] Safety timeout (190s) – forcing loading false', title);
      clearLoading();
    }, 190000);
    try {
      const raw = await fetchSongsFromPath(path);
      clearTimeout(safetyTimer);
      if (thisFetchId !== fetchIdRef.current) {
        console.log('[MusicSection] Ignoring stale fetch:', title);
        return;
      }
      console.log('[MusicSection] RAW DATA FROM BACKEND:', title, Array.isArray(raw) ? `array(${raw.length})` : typeof raw, raw);
      const list = Array.isArray(raw) ? raw : (raw?.songs ?? raw?.results ?? []);
      const normalized = (Array.isArray(list) ? list : []).map(toSongItem).filter(Boolean);
      console.log('[MusicSection] SET SONGS CALLED:', normalized.length);
      setSongs(normalized);
      setLoading(false);
    } catch (err) {
      clearTimeout(safetyTimer);
      if (thisFetchId !== fetchIdRef.current) return;
      const msg = err?.message ?? String(err);
      const isTimeout = /timeout|timed out|slow|aborted/i.test(msg);
      const is500 = /internal server error|backend error|500/i.test(msg);
      console.error('[MusicSection] Fetch error:', title, msg);
      setError(
        is500 ? (msg || 'Backend error – check server logs') : isTimeout ? 'Backend timed out – check if it\'s running or slow' : (msg || 'Failed to load')
      );
      setLoading(false);
    }
  }, [endpoint, limit, activeGenre]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleFavorite = (songId) => {
    setFavorites((prev) => ({ ...prev, [songId]: !prev[songId] }));
  };

  const seeMoreLink = getSeeMoreLink(activeGenre, seeMoreSectionKey);

  return (
    <section className="p-4 bg-gray-900 dark:bg-gray-900">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-wrap">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <div className="flex flex-wrap gap-2">
            {genresList.map((genre) => (
              <button
                key={genre}
                type="button"
                onClick={() => setActiveGenre(genre)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${
                  activeGenre === genre
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
        <Link
          to={seeMoreLink}
          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 px-6 py-3 rounded-lg text-white font-semibold shadow-md transition duration-300 ease-in-out transform hover:scale-105"
        >
          See More
        </Link>
      </div>

      {error && (
        <div className="text-center py-8">
          <p className="text-amber-400 mb-4">Failed to load – check console.</p>
          <p className="text-gray-500 text-sm mb-4">{error}</p>
          <button
            type="button"
            onClick={() => fetchData()}
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition"
          >
            Retry
          </button>
        </div>
      )}

      {!error && (() => {
        const list = Array.isArray(songs) ? songs : [];
        console.log('[MusicSection] RENDER PHASE - loading:', loading, 'songs:', songs ? songs.length : 'undefined', list.length, 'first title:', songs?.[0]?.title ?? songs?.[0]?.name ?? 'no title');
        if (loading) {
          return (
            <div className="py-4" role="status" aria-label="Loading...">
              <p className="text-gray-500 text-sm mb-4">Loading real songs…</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="w-full aspect-square rounded-lg bg-gray-700" />
                    <div className="h-4 bg-gray-700 rounded mt-2 w-3/4" />
                    <div className="h-3 bg-gray-700 rounded mt-1 w-1/2" />
                  </div>
                ))}
              </div>
            </div>
          );
        }
        console.log('[MusicSection] PASSED LOADING - songs length:', list.length);
        if (!songs || list.length === 0) {
          return (
            <div className="text-center py-12 text-gray-400">
              No songs received from backend (check if Chroma has data)
            </div>
          );
        }
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-2" data-testid="song-grid">
            {list.map((song, index) => {
              console.log('[MusicSection] MAPPING SONG:', song?.title ?? song?.name ?? index);
              return (
                <SongCard
                  key={song.id ?? song.name ?? `song-${index}`}
                  song={song}
                  showGenre={true}
                  onToggleFavorite={toggleFavorite}
                  isFavorite={favorites[song.id ?? song.name]}
                />
              );
            })}
          </div>
        );
      })()}
    </section>
  );
}

export default MusicSection;
