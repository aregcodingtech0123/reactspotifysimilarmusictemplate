import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SongItem from '../SongItem';
import MusicPlayer from '../MusicPlayer';
import { ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';

const TrendingMusicSection = () => {
  const navigate = useNavigate();
  const trendingSongs = Array.from({ length: 15 }, (_, index) => ({
    id: `trending-${index + 1}`,
    imageUrl: "/assets/exampleMusicImg.jpeg?v=1",
    title: `Trending Track ${index + 1}`,
    artist: `Rising Star ${index + 1}`,
    category: ['Pop', 'Rock', 'Jazz', 'Rap'][Math.floor(Math.random() * 4)],
    trend: Math.floor(Math.random() * 50) + 10
  }));

  const itemsPerPage = 5;
  const [startIndex, setStartIndex] = useState(0);
  const [currentSong, setCurrentSong] = useState(null);
  const [favorites, setFavorites] = useState({});

  const visibleSongs = trendingSongs.slice(startIndex, startIndex + itemsPerPage);
  const canGoBack = startIndex > 0;
  const canGoForward = startIndex + itemsPerPage < trendingSongs.length;

  const handlePrevious = () => {
    if (canGoBack) setStartIndex(prev => Math.max(0, prev - itemsPerPage));
  };

  const handleNext = () => {
    if (canGoForward) setStartIndex(prev => prev + itemsPerPage);
  };

  const handlePlaySong = (song) => setCurrentSong(song);
  const handleClosePlayer = () => setCurrentSong(null);
  const handleSelectSong = (song) => navigate(`/song/${song.id}`, { state: { song } });
  const toggleFavorite = (songId) => setFavorites(prev => ({ ...prev, [songId]: !prev[songId] }));
  const isFavorite = (songId) => favorites[songId] || false;

  return (
    <section data-testid="trending-music-section" className="py-8 px-4 md:px-8 bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-7 h-7 text-green-400" />
            <h2 className="text-2xl md:text-3xl font-bold text-white">Trending Now</h2>
          </div>
          <Link 
            to="/trendingsongsall" 
            data-testid="trending-see-all"
            className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
          >
            See All
          </Link>
        </div>

        <div className="relative">
          {canGoBack && (
            <button
              onClick={handlePrevious}
              data-testid="trending-prev-btn"
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

          {canGoForward && (
            <button
              onClick={handleNext}
              data-testid="trending-next-btn"
              className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-gray-800 hover:bg-gray-700 text-white rounded-full p-2 shadow-lg transition-all"
            >
              <ChevronRight size={24} />
            </button>
          )}
        </div>
      </div>

      {currentSong && <MusicPlayer song={currentSong} onClose={handleClosePlayer} />}
    </section>
  );
};

export default TrendingMusicSection;
