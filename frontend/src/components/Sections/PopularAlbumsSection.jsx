import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Disc3 } from 'lucide-react';

const PopularAlbumsSection = () => {
  const albums = Array.from({ length: 10 }, (_, index) => ({
    id: `album-${index + 1}`,
    title: `Album Title ${index + 1}`,
    artist: `Artist ${index + 1}`,
    imageUrl: "/assets/exampleMusicImg.jpeg?v=1",
    year: 2024 - Math.floor(Math.random() * 3),
    tracks: Math.floor(Math.random() * 8) + 8
  }));

  const itemsPerPage = 5;
  const [startIndex, setStartIndex] = useState(0);

  const visibleAlbums = albums.slice(startIndex, startIndex + itemsPerPage);
  const canGoBack = startIndex > 0;
  const canGoForward = startIndex + itemsPerPage < albums.length;

  const handlePrevious = () => {
    if (canGoBack) setStartIndex(prev => Math.max(0, prev - itemsPerPage));
  };

  const handleNext = () => {
    if (canGoForward) setStartIndex(prev => prev + itemsPerPage);
  };

  return (
    <section data-testid="popular-albums-section" className="py-8 px-4 md:px-8 bg-gray-900 pb-16">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Disc3 className="w-7 h-7 text-cyan-400" />
            <h2 className="text-2xl md:text-3xl font-bold text-white">Popular Albums</h2>
          </div>
          <Link 
            to="/category/All" 
            data-testid="albums-see-all"
            className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
          >
            See All
          </Link>
        </div>

        <div className="relative">
          {canGoBack && (
            <button
              onClick={handlePrevious}
              data-testid="albums-prev-btn"
              className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-gray-800 hover:bg-gray-700 text-white rounded-full p-2 shadow-lg transition-all"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {visibleAlbums.map(album => (
              <div
                key={album.id}
                data-testid={`album-card-${album.id}`}
                className="group cursor-pointer"
              >
                <div className="relative mb-3 rounded-lg overflow-hidden bg-gray-800 shadow-lg group-hover:shadow-xl group-hover:shadow-purple-500/20 transition-all duration-300">
                  <img
                    src={album.imageUrl}
                    alt={album.title}
                    className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <div>
                      <p className="text-white text-sm font-medium">{album.tracks} tracks</p>
                      <p className="text-gray-300 text-xs">{album.year}</p>
                    </div>
                  </div>
                </div>
                <h3 className="text-white font-medium truncate group-hover:text-purple-400 transition-colors">
                  {album.title}
                </h3>
                <p className="text-gray-400 text-sm truncate">{album.artist}</p>
              </div>
            ))}
          </div>

          {canGoForward && (
            <button
              onClick={handleNext}
              data-testid="albums-next-btn"
              className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-gray-800 hover:bg-gray-700 text-white rounded-full p-2 shadow-lg transition-all"
            >
              <ChevronRight size={24} />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default PopularAlbumsSection;
