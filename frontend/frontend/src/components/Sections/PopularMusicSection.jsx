/**
 * PopularMusicSection - Shows trending songs from backend API
 * NO MOCK DATA - Only renders if backend returns real data
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SongItem from '../SongItem';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchTrending } from '../../services/songsService';

const PopularMusicSection = () => {
  const navigate = useNavigate();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startIndex, setStartIndex] = useState(0);
  const [favorites, setFavorites] = useState({});
  
  const itemsPerPage = 5;
  // Ensure songs is always an array before calling slice
  const songsArray = Array.isArray(songs) ? songs : [];
  const visibleSongs = songsArray.slice(startIndex, startIndex + itemsPerPage);
  const canGoBack = startIndex > 0;
  const canGoForward = startIndex + itemsPerPage < songsArray.length;

  useEffect(() => {
    console.log('[PopularMusicSection] Fetching trending songs from API...');
    let cancelled = false;
    fetchTrending(15)
      .then((res) => {
        if (cancelled) return;
        console.log('[PopularMusicSection] API Response:', { ok: res.ok, dataLength: res.ok ? res.data?.length : 0 });
        if (res.ok && res.data) {
          // Ensure data is an array
          const songsData = Array.isArray(res.data) ? res.data : [];
          console.log('[PopularMusicSection] SONGS FROM API:', songsData);
          setSongs(songsData);
        } else {
          console.error('[PopularMusicSection] Failed to fetch songs:', res.error);
          setSongs([]); // Empty array - will show "No songs available"
        }
        setLoading(false);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error('[PopularMusicSection] Fetch error:', error);
        setSongs([]);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const handlePrevious = () => {
    if (canGoBack) setStartIndex(prev => Math.max(0, prev - itemsPerPage));
  };

  const handleNext = () => {
    if (canGoForward) setStartIndex(prev => prev + itemsPerPage);
  };

  const handleSelectSong = (song) => navigate(`/song/${song.id}`);
  const toggleFavorite = (songId) => setFavorites(prev => ({ ...prev, [songId]: !prev[songId] }));
  const isFavorite = (songId) => favorites[songId] || false;

  // FAIL FAST: Show message if no data
  if (!loading && songsArray.length === 0) {
    return (
      <section data-testid="popular-music-section" className="py-8 px-4 md:px-8 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white">Popular Music</h2>
            <Link 
              to="/discover" 
              data-testid="popular-see-all"
              className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
            >
              See All
            </Link>
          </div>
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No songs available</p>
            <p className="text-gray-500 text-sm mt-2">Make sure backend is running and database is seeded</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section data-testid="popular-music-section" className="py-8 px-4 md:px-8 bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white">Popular Music</h2>
          <Link 
            to="/discover" 
            data-testid="popular-see-all"
            className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
          >
            See All
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <div className="relative">
            {canGoBack && (
              <button
                onClick={handlePrevious}
                data-testid="popular-prev-btn"
                className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-gray-800 hover:bg-gray-700 text-white rounded-full p-2 shadow-lg transition-all"
              >
                <ChevronLeft size={24} />
              </button>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {visibleSongs.map(song => (
                <SongItem
                  key={song.id}
                  id={song.id}
                  coverUrl={song.coverUrl}
                  title={song.title}
                  artist={song.artist}
                  album={song.album}
                  onSelect={handleSelectSong}
                  song={song}
                  isFavorite={isFavorite(song.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>

            {canGoForward && (
              <button
                onClick={handleNext}
                data-testid="popular-next-btn"
                className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-gray-800 hover:bg-gray-700 text-white rounded-full p-2 shadow-lg transition-all"
              >
                <ChevronRight size={24} />
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default PopularMusicSection;
