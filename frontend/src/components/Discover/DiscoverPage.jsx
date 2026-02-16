import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SongItem from '../SongItem';
import MusicPlayer from '../MusicPlayer';
import { Compass, Sparkles, TrendingUp, Guitar, Music2, Mic2 } from 'lucide-react';

// Category section component
const CategorySection = ({ title, icon: Icon, iconColor, songs, onPlay, onSelect, favorites, toggleFavorite, linkTo }) => {
  const visibleSongs = songs.slice(0, 5);
  
  return (
    <div className="mb-10">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <Icon className={`w-6 h-6 ${iconColor}`} />
          <h2 className="text-xl md:text-2xl font-bold text-white">{title}</h2>
        </div>
        <Link 
          to={linkTo} 
          className="text-purple-400 hover:text-purple-300 font-medium transition-colors text-sm"
        >
          See All
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {visibleSongs.map(song => (
          <SongItem
            key={song.id}
            id={song.id}
            imageUrl={song.imageUrl}
            title={song.title}
            artist={song.artist}
            onPlay={() => onPlay(song)}
            onSelect={() => onSelect(song)}
            song={song}
            isFavorite={favorites[song.id] || false}
            onToggleFavorite={() => toggleFavorite(song.id)}
          />
        ))}
      </div>
    </div>
  );
};

const DiscoverPage = () => {
  const navigate = useNavigate();
  const [currentSong, setCurrentSong] = useState(null);
  const [favorites, setFavorites] = useState({});

  // Generate songs for each category
  const generateSongs = (prefix, category, count = 10) => 
    Array.from({ length: count }, (_, index) => ({
      id: `${prefix}-${index + 1}`,
      imageUrl: "/assets/exampleMusicImg.jpeg?v=1",
      title: `${category} Track ${index + 1}`,
      artist: `${category} Artist ${index + 1}`,
      category
    }));

  const newSongs = generateSongs('new', 'New');
  const trendingSongs = generateSongs('trending', 'Trending');
  const rockSongs = generateSongs('rock', 'Rock');
  const popSongs = generateSongs('pop', 'Pop');
  const jazzSongs = generateSongs('jazz', 'Jazz');
  const rapSongs = generateSongs('rap', 'Rap');

  const handlePlaySong = (song) => setCurrentSong(song);
  const handleClosePlayer = () => setCurrentSong(null);
  const handleSelectSong = (song) => navigate(`/song/${song.id}`, { state: { song } });
  const toggleFavorite = (songId) => setFavorites(prev => ({ ...prev, [songId]: !prev[songId] }));

  const sections = [
    { title: 'New Songs', icon: Sparkles, iconColor: 'text-yellow-400', songs: newSongs, linkTo: '/category/All' },
    { title: 'Trending', icon: TrendingUp, iconColor: 'text-green-400', songs: trendingSongs, linkTo: '/trendingsongsall' },
    { title: 'Rock', icon: Guitar, iconColor: 'text-red-400', songs: rockSongs, linkTo: '/category/rock' },
    { title: 'Pop', icon: Music2, iconColor: 'text-pink-400', songs: popSongs, linkTo: '/category/pop' },
    { title: 'Jazz', icon: Music2, iconColor: 'text-blue-400', songs: jazzSongs, linkTo: '/category/jazz' },
    { title: 'Rap', icon: Mic2, iconColor: 'text-orange-400', songs: rapSongs, linkTo: '/category/rap' },
  ];

  return (
    <div data-testid="discover-page" className="min-h-screen bg-gray-900 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Compass className="w-8 h-8 text-purple-400" />
          <h1 className="text-3xl md:text-4xl font-bold text-white">Discover</h1>
        </div>
        <p className="text-gray-400">Explore new music across different genres</p>
      </div>

      {/* Sections */}
      <div className="max-w-7xl mx-auto">
        {sections.map(section => (
          <CategorySection
            key={section.title}
            title={section.title}
            icon={section.icon}
            iconColor={section.iconColor}
            songs={section.songs}
            onPlay={handlePlaySong}
            onSelect={handleSelectSong}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            linkTo={section.linkTo}
          />
        ))}
      </div>

      {currentSong && <MusicPlayer song={currentSong} onClose={handleClosePlayer} />}
    </div>
  );
};

export default DiscoverPage;
