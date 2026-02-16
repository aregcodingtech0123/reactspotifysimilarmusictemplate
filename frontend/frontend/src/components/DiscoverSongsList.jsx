import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SongItem from './SongItem';
import SpecialBtn from './SpecialBtn';

const categories = ['All', 'Rock', 'Pop', 'Jazz', 'Rap'];

function seeMoreLink(activeCategory) {
  if (activeCategory === 'All') return '/discover';
  return `/category/${activeCategory.toLowerCase()}`;
}

function matchGenre(song, genre) {
  if (genre === 'All') return true;
  const tags = (song.tags || '').toLowerCase();
  const g = genre.toLowerCase();
  return tags.includes(g) || (g === 'rap' && (tags.includes('hip hop') || tags.includes('hip-hop')));
}

const DiscoverSongsList = ({ isLogged, songs: songsProp, loading: loadingProp }) => {
  const navigate = useNavigate();
  const [allSongs, setAllSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  const itemsPerPage = 5;
  const [startIndex, setStartIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [favorites, setFavorites] = useState({});

  useEffect(() => {
    if (songsProp !== undefined) {
      setAllSongs(Array.isArray(songsProp) ? songsProp : []);
      setLoading(loadingProp ?? false);
    }
  }, [songsProp, loadingProp]);

  const filteredSongs = activeCategory === 'All'
    ? allSongs
    : allSongs.filter((song) => matchGenre(song, activeCategory));

  const totalPages = Math.ceil(filteredSongs.length / itemsPerPage);
  const currentPage = Math.floor(startIndex / itemsPerPage);
  const visibleSongs = filteredSongs.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevious = () => {
    if (isAnimating || startIndex === 0) return;
    setIsAnimating(true);
    setStartIndex((prev) => Math.max(0, prev - itemsPerPage));
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleNext = () => {
    if (isAnimating || startIndex + itemsPerPage >= filteredSongs.length) return;
    setIsAnimating(true);
    setStartIndex((prev) => Math.min(filteredSongs.length - itemsPerPage, prev + itemsPerPage));
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
    setStartIndex(0);
  };

  const handleSelectSong = (song) => navigate(`/song/${song.id}`);
  const toggleFavorite = (songId) => setFavorites((prev) => ({ ...prev, [songId]: !prev[songId] }));
  const isFavorite = (songId) => favorites[songId] || false;

  return (
    <div className="p-4 bg-gray-900 mt-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-2 sm:pb-0">
          <h2 className="text-2xl font-bold text-white">Discover more songs</h2>
          <div className="flex space-x-2 overflow-x-auto pb-2 sm:pb-0">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${
                  activeCategory === category ? 'bg-white text-black' : 'bg-gray-800 text-white hover:bg-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        <div>
          <SpecialBtn btnTxt="See More" link={seeMoreLink(activeCategory)} />
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

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500" />
          </div>
        ) : (
          <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 py-2 transition-opacity duration-300 ${isAnimating ? 'opacity-50' : 'opacity-100'}`}>
            {visibleSongs.length > 0 ? (
              visibleSongs.map((song) => (
                <SongItem
                  key={song.id}
                  id={song.id}
                  coverUrl={song.coverUrl}
                  imageUrl={song.image}
                  title={song.title}
                  artist={song.artist}
                  album={song.album}
                  onSelect={handleSelectSong}
                  song={song}
                  isFavorite={isFavorite(song.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-white">No songs found in this category.</div>
            )}
          </div>
        )}

        {!loading && startIndex + itemsPerPage < filteredSongs.length && (
          <button onClick={handleNext} disabled={isAnimating} className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-800 hover:bg-gray-700 text-white rounded-full p-2 z-10 shadow-lg transition-all duration-300" aria-label="Next items">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {!loading && filteredSongs.length > itemsPerPage && (
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
    </div>
  );
};

export default DiscoverSongsList;
