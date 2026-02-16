import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SongItem from '../SongItem';
import MusicPlayer from '../MusicPlayer';
import { TrendingUp, Flame, ChevronDown } from 'lucide-react';

const TrendingSongsPage = () => {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState('popular');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [favorites, setFavorites] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [songs, setSongs] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Today', 'This Week', 'This Month'];

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      const generatedSongs = Array.from({ length: 30 }, (_, index) => ({
        id: `trending-${index + 1}`,
        imageUrl: "/assets/exampleMusicImg.jpeg?v=1",
        title: `Trending Hit #${index + 1}`,
        artist: `Trending Artist ${Math.floor(index / 3) + 1}`,
        category: ['Pop', 'Rock', 'Jazz', 'Rap'][Math.floor(Math.random() * 4)],
        plays: Math.floor(Math.random() * 5000000) + 500000,
        trend: Math.floor(Math.random() * 100) + 1,
        releaseDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28))
      }));
      setSongs(generatedSongs);
      setIsLoading(false);
    }, 300);
  }, []);

  // Sort songs based on selected option
  const sortedSongs = [...songs].sort((a, b) => {
    if (sortBy === 'popular') return b.plays - a.plays;
    if (sortBy === 'newest') return b.releaseDate - a.releaseDate;
    return 0;
  });

  const handlePlaySong = (song) => setCurrentSong(song);
  const handleClosePlayer = () => setCurrentSong(null);
  const handleSelectSong = (song) => navigate(`/song/${song.id}`, { state: { song } });
  const toggleFavorite = (songId) => setFavorites(prev => ({ ...prev, [songId]: !prev[songId] }));
  const isFavorite = (songId) => favorites[songId] || false;

  return (
    <div data-testid="trending-songs-page" className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-green-900/50 via-gray-900 to-gray-900 py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30">
              <TrendingUp size={40} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white">Trending Songs</h1>
              <p className="text-green-400 font-medium flex items-center gap-2">
                <Flame size={18} />
                What's hot right now
              </p>
            </div>
          </div>
          <p className="text-gray-300 max-w-2xl text-lg">
            Discover the most popular tracks that everyone is listening to. Updated in real-time.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          {/* Time Filters */}
          <div className="flex gap-2 flex-wrap">
            {filters.map(filter => (
              <button
                key={filter}
                data-testid={`filter-${filter.toLowerCase().replace(' ', '-')}`}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeFilter === filter
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              data-testid="trending-sort-dropdown"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <span>{sortBy === 'popular' ? 'Most Popular' : 'Newest'}</span>
              <ChevronDown size={18} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-gray-800 rounded-lg shadow-xl z-20 overflow-hidden">
                <button
                  data-testid="trending-sort-popular"
                  onClick={() => { setSortBy('popular'); setIsDropdownOpen(false); }}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors ${sortBy === 'popular' ? 'text-green-400 bg-gray-700' : 'text-white'}`}
                >
                  Most Popular
                </button>
                <button
                  data-testid="trending-sort-newest"
                  onClick={() => { setSortBy('newest'); setIsDropdownOpen(false); }}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors ${sortBy === 'newest' ? 'text-green-400 bg-gray-700' : 'text-white'}`}
                >
                  Newest
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Songs Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {sortedSongs.map((song, index) => (
              <div key={song.id} className="relative">
                {index < 3 && (
                  <div className="absolute -top-2 -left-2 z-10 w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    {index + 1}
                  </div>
                )}
                <SongItem
                  id={song.id}
                  imageUrl={song.imageUrl}
                  title={song.title}
                  artist={song.artist}
                  onPlay={handlePlaySong}
                  onSelect={handleSelectSong}
                  song={song}
                  isFavorite={isFavorite(song.id)}
                  onToggleFavorite={toggleFavorite}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {currentSong && <MusicPlayer song={currentSong} onClose={handleClosePlayer} />}
    </div>
  );
};

export default TrendingSongsPage;
