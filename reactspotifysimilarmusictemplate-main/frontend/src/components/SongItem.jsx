import React from 'react';

const SongItem = ({ 
  id, 
  imageUrl, 
  title, 
  artist, 
  onPlay, 
  onSelect, 
  song, 
  isFavorite, 
  onToggleFavorite 
}) => {
  const handleItemClick = (e) => {
    // Check if clicking on the play button or heart icon
    if (e.target.closest('.play-button') || e.target.closest('.heart-button')) {
      return; // Let their specific click handlers handle this
    }
    
    // Navigate to song detail page
    onSelect(song);
  };

  const handlePlayClick = (e) => {
    e.stopPropagation(); // Prevent triggering the item click
    onPlay(song);
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation(); // Prevent triggering the item click
    onToggleFavorite(id);
  };

  return (
    <div 
      className="relative group cursor-pointer transition-all duration-300 hover:scale-105"
      onClick={handleItemClick}
    >
      <div className="relative overflow-hidden rounded-lg bg-gray-800">
        <img 
          src={imageUrl} 
          alt={title} 
          className="w-full aspect-square object-cover transition-transform duration-300 group-hover:brightness-75"
        />
        
        {/* Play button in the middle */}
        <div 
          className="play-button absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          onClick={handlePlayClick}
        >
          <div className="bg-green-500 hover:bg-green-600 text-white rounded-full p-3 transform transition-transform duration-300 hover:scale-110">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        
        {/* Heart icon for favorites - top right */}
        <div 
          className="heart-button absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          onClick={handleFavoriteClick}
        >
          {isFavorite ? (
            <div className="bg-black bg-opacity-50 rounded-full p-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </div>
          ) : (
            <div className="bg-black bg-opacity-50 rounded-full p-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-2 flex justify-between items-center">
        <div className="overflow-hidden">
          <h3 className="text-white font-medium truncate">{title}</h3>
          <p className="text-gray-400 text-sm truncate">{artist}</p>
        </div>
        
        {/* Heart button always visible in the song info area */}
        <button 
          className="heart-button flex-shrink-0 text-white"
          onClick={handleFavoriteClick}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          {isFavorite ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default SongItem;