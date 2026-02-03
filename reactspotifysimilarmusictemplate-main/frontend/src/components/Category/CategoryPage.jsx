import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import SongItem from '../SongItem';
import MusicPlayer from '../MusicPlayer';
import { Guitar, Music2, Mic2, ChevronDown } from 'lucide-react';

// Category configuration with unique hero styles
const categoryConfig = {
  rock: {
    title: 'Rock',
    icon: Guitar,
    heroGradient: 'from-red-900 via-gray-900 to-black',
    accentColor: 'text-red-400',
    buttonColor: 'bg-red-600 hover:bg-red-700',
    tagline: 'Feel the power of electric guitars',
    description: 'Turn up the volume and let the raw energy of rock music move your soul.'
  },
  pop: {
    title: 'Pop',
    icon: Music2,
    heroGradient: 'from-pink-900 via-purple-900 to-black',
    accentColor: 'text-pink-400',
    buttonColor: 'bg-pink-600 hover:bg-pink-700',
    tagline: 'Catchy beats, unforgettable melodies',
    description: 'The hits that define the charts and dominate the airwaves.'
  },
  jazz: {
    title: 'Jazz',
    icon: Music2,
    heroGradient: 'from-blue-900 via-indigo-900 to-black',
    accentColor: 'text-blue-400',
    buttonColor: 'bg-blue-600 hover:bg-blue-700',
    tagline: 'Smooth rhythms, sophisticated sounds',
    description: 'Experience the elegance and improvisation of timeless jazz.'
  },
  rap: {
    title: 'Rap',
    icon: Mic2,
    heroGradient: 'from-orange-900 via-amber-900 to-black',
    accentColor: 'text-orange-400',
    buttonColor: 'bg-orange-600 hover:bg-orange-700',
    tagline: 'Words that hit hard, beats that slap',
    description: 'The rhythm and poetry of hip-hop culture.'
  }
};

const CategoryPage = () => {
  const { category } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract category from URL path (works for both /category/:category and /category/rock style routes)
  const getCategoryFromPath = () => {
    const pathParts = location.pathname.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    return lastPart.toLowerCase();
  };
  
  const categoryKey = category ? category.toLowerCase() : getCategoryFromPath();
  const config = categoryConfig[categoryKey] || categoryConfig.rock;
  const Icon = config.icon;

  const [sortBy, setSortBy] = useState('popular');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [favorites, setFavorites] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const generatedSongs = Array.from({ length: 20 }, (_, index) => ({
        id: `${categoryKey}-song-${index + 1}`,
        imageUrl: "/assets/exampleMusicImg.jpeg?v=1",
        title: `${config.title} Hit ${index + 1}`,
        artist: `${config.title} Artist ${Math.floor(index / 2) + 1}`,
        category: config.title,
        plays: Math.floor(Math.random() * 1000000) + 100000,
        releaseDate: new Date(2024 - Math.floor(index / 5), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28))
      }));
      setSongs(generatedSongs);
      setIsLoading(false);
    }, 300);
  }, [categoryKey, config.title]);

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
    <div data-testid={`category-page-${categoryKey}`} className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <div className={`relative bg-gradient-to-b ${config.heroGradient} py-16 px-4 md:px-8`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-4 rounded-2xl bg-black/30 backdrop-blur-sm ${config.accentColor}`}>
              <Icon size={48} />
            </div>
            <div>
              <h1 data-testid={`category-title-${categoryKey}`} className="text-4xl md:text-5xl font-bold text-white">{config.title}</h1>
              <p data-testid={`category-tagline-${categoryKey}`} className={`text-lg ${config.accentColor} font-medium`}>{config.tagline}</p>
            </div>
          </div>
          <p className="text-gray-300 max-w-2xl text-lg">{config.description}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Sort Controls */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">
            All {config.title} Songs
          </h2>
          
          {/* Sort Dropdown */}
          <div className="relative">
            <button
              data-testid="sort-dropdown-btn"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <span>{sortBy === 'popular' ? 'Most Popular' : 'Newest'}</span>
              <ChevronDown size={18} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-gray-800 rounded-lg shadow-xl z-20 overflow-hidden">
                <button
                  data-testid="sort-popular-btn"
                  onClick={() => { setSortBy('popular'); setIsDropdownOpen(false); }}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors ${sortBy === 'popular' ? 'text-purple-400 bg-gray-700' : 'text-white'}`}
                >
                  Most Popular
                </button>
                <button
                  data-testid="sort-newest-btn"
                  onClick={() => { setSortBy('newest'); setIsDropdownOpen(false); }}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors ${sortBy === 'newest' ? 'text-purple-400 bg-gray-700' : 'text-white'}`}
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
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {sortedSongs.map(song => (
              <SongItem
                key={song.id}
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
            ))}
          </div>
        )}
      </div>

      {currentSong && <MusicPlayer song={currentSong} onClose={handleClosePlayer} />}
    </div>
  );
};

export default CategoryPage;
