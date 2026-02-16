/**
 * PopularArtistsSection - Extracts unique artists from trending songs
 * NO MOCK DATA - Only renders if backend returns real data
 */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { fetchTrending } from '../../services/songsService';

const PopularArtistsSection = () => {
  const navigate = useNavigate();
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startIndex, setStartIndex] = useState(0);
  
  const itemsPerPage = 6;
  const visibleArtists = artists.slice(startIndex, startIndex + itemsPerPage);
  const canGoBack = startIndex > 0;
  const canGoForward = startIndex + itemsPerPage < artists.length;

  useEffect(() => {
    console.log('[PopularArtistsSection] Fetching songs to extract artists...');
    let cancelled = false;
    fetchTrending(50)
      .then((res) => {
        if (cancelled) return;
        if (res.ok && res.data && Array.isArray(res.data)) {
          console.log('[PopularArtistsSection] SONGS FROM API:', res.data);
          // Extract unique artists from songs
          const artistMap = new Map();
          res.data.forEach(song => {
            if (song.artist && !artistMap.has(song.artist)) {
              artistMap.set(song.artist, {
                id: song.artist, // Use artist name as ID for routing
                name: song.artist,
                coverUrl: song.coverUrl, // Use first song's cover as artist image
                genre: song.genre || 'Unknown'
              });
            }
          });
          const uniqueArtists = Array.from(artistMap.values()).slice(0, 12);
          console.log('[PopularArtistsSection] Extracted artists:', uniqueArtists);
          setArtists(uniqueArtists);
        } else {
          console.error('[PopularArtistsSection] Failed to fetch songs:', res.error);
          setArtists([]);
        }
        setLoading(false);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error('[PopularArtistsSection] Fetch error:', error);
        setArtists([]);
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

  const handleArtistClick = (artistName) => {
    navigate(`/artist/${encodeURIComponent(artistName)}`);
  };

  // FAIL FAST: Show message if no data
  if (!loading && artists.length === 0) {
    return (
      <section data-testid="popular-artists-section" className="py-8 px-4 md:px-8 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <Users className="w-7 h-7 text-pink-400" />
              <h2 className="text-2xl md:text-3xl font-bold text-white">Popular Artists</h2>
            </div>
            <Link 
              to="/discover" 
              data-testid="artists-see-all"
              className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
            >
              See All
            </Link>
          </div>
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No artists available</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section data-testid="popular-artists-section" className="py-8 px-4 md:px-8 bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Users className="w-7 h-7 text-pink-400" />
            <h2 className="text-2xl md:text-3xl font-bold text-white">Popular Artists</h2>
          </div>
          <Link 
            to="/discover" 
            data-testid="artists-see-all"
            className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
          >
            See All
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
          </div>
        ) : (
          <div className="relative">
            {canGoBack && (
              <button
                onClick={handlePrevious}
                data-testid="artists-prev-btn"
                className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-gray-800 hover:bg-gray-700 text-white rounded-full p-2 shadow-lg transition-all"
              >
                <ChevronLeft size={24} />
              </button>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
              {visibleArtists.map(artist => (
                <div
                  key={artist.id}
                  data-testid={`artist-card-${artist.id}`}
                  onClick={() => handleArtistClick(artist.name)}
                  className="group cursor-pointer text-center"
                >
                  <div className="relative mb-3">
                    <div className="w-full aspect-square rounded-full overflow-hidden bg-gray-800 ring-4 ring-transparent group-hover:ring-purple-500/50 transition-all duration-300">
                      <img
                        src={artist.coverUrl || '/assets/exampleMusicImg.jpeg'}
                        alt={artist.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  </div>
                  <h3 className="text-white font-medium truncate group-hover:text-purple-400 transition-colors">
                    {artist.name}
                  </h3>
                  <p className="text-gray-400 text-sm">{artist.genre}</p>
                </div>
              ))}
            </div>

            {canGoForward && (
              <button
                onClick={handleNext}
                data-testid="artists-next-btn"
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

export default PopularArtistsSection;
