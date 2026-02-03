import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SongItem from './SongItem';
import SpecialBtn from './SpecialBtn';
import MusicPlayer from './MusicPlayer';

const SongsByMoodList = ({ isLogged }) => {
  const navigate = useNavigate();
  const allSongs = Array.from({ length: 20 }, (_, index) => ({
    id: index + 1,
    imageUrl: "/assets/exampleMusicImg.jpeg?v=1",
    title: `Song Title ${index + 1}`,
    artist: `Artist ${index + 1}`,
    category: ['All', 'Happy', 'Sad', 'Calm', 'Energetic'][Math.floor(Math.random() * 5)]
  }));

  const itemsPerPage = 5;
  const [startIndex, setStartIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [currentSong, setCurrentSong] = useState(null);
  const [favorites, setFavorites] = useState({}); // Track favorite songs

  const categories = ['All', 'Happy', 'Sad', 'Calm', 'Energetic'];

  // Filter songs based on active category
  const filteredSongs = activeCategory === 'All' 
    ? allSongs 
    : allSongs.filter(song => song.category === activeCategory);

  const totalPages = Math.ceil(filteredSongs.length / itemsPerPage);
  const currentPage = Math.floor(startIndex / itemsPerPage);

  const visibleSongs = filteredSongs.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevious = () => {
    if (isAnimating || startIndex === 0) return;
    setIsAnimating(true);
    setStartIndex(prevIndex => Math.max(0, prevIndex - itemsPerPage));
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleNext = () => {
    if (isAnimating || startIndex + itemsPerPage >= filteredSongs.length) return;
    setIsAnimating(true);
    setStartIndex(prevIndex => Math.min(filteredSongs.length - itemsPerPage, prevIndex + itemsPerPage));
    setTimeout(() => setIsAnimating(false), 300);
  };

  const goToPage = (pageIndex) => {
    if (isAnimating || pageIndex === currentPage) return;
    setIsAnimating(true);
    setStartIndex(pageIndex * itemsPerPage);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setStartIndex(0); // Reset to first page when changing category
  };

  // Function to handle playing a song
  const handlePlaySong = (song) => {
    setCurrentSong(song);
  };

  // Function to close the music player
  const handleClosePlayer = () => {
    setCurrentSong(null);
  };

  // Function to navigate to song detail page
  const handleSelectSong = (song) => {
    // Navigate to song detail page with song ID
    navigate(`/song/${song.id}`, { state: { song } });
  };

  // Function to toggle favorite status
  const toggleFavorite = (songId) => {
    setFavorites(prev => ({
      ...prev,
      [songId]: !prev[songId]
    }));
  };

  // Check if a song is favorited
  const isFavorite = (songId) => {
    return favorites[songId] || false;
  };

  return (
    <div className="p-4 bg-gray-900">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-2 sm:mb-0">
          <h2 className="text-2xl font-bold text-white">How is your mood today?</h2>
          
          {/* Category filters */}
          <div className="flex space-x-2 overflow-x-auto pb-2 sm:pb-0">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${
                  activeCategory === category
                    ? 'bg-white text-black'
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        
        <div>
        <SpecialBtn btnTxt="See More" link={`/category/${activeCategory}`} />
        </div>
      </div>
      
      <div className="relative">
        {startIndex > 0 && (
          <button onClick={handlePrevious} disabled={isAnimating} className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-800 hover:bg-gray-700 text-white rounded-full p-2 z-10 shadow-lg transition-all duration-300" aria-label="Previous items">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 py-2 transition-opacity duration-300 ${isAnimating ? 'opacity-50' : 'opacity-100'}`}>
          {visibleSongs.length > 0 ? (
            visibleSongs.map(song => (
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
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-white">
              No songs found in this category.
            </div>
          )}
        </div>

        {startIndex + itemsPerPage < filteredSongs.length && (
          <button onClick={handleNext} disabled={isAnimating} className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-800 hover:bg-gray-700 text-white rounded-full p-2 z-10 shadow-lg transition-all duration-300" aria-label="Next items">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
      
      {filteredSongs.length > itemsPerPage && (
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button 
              key={index} 
              onClick={() => goToPage(index)} 
              disabled={isAnimating} 
              className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentPage ? 'bg-blue-500 w-6' : 'bg-gray-600 hover:bg-gray-500'}`} 
              aria-label={`Go to page ${index + 1}`} 
            />
          ))}
        </div>
      )}
      
      {/* Music Player */}
      {currentSong && (
        <MusicPlayer 
          song={currentSong} 
          onClose={handleClosePlayer}
        />
      )}
    </div>
  );
};

export default SongsByMoodList;