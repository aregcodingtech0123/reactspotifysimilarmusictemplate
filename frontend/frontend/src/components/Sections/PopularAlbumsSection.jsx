/**
 * PopularAlbumsSection - Extracts unique albums from trending songs
 * NO MOCK DATA - Only renders if backend returns real data
 */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Disc3 } from 'lucide-react';
import { fetchTrending } from '../../services/songsService';

const PopularAlbumsSection = () => {
  const navigate = useNavigate();
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startIndex, setStartIndex] = useState(0);
  
  const itemsPerPage = 5;
  const visibleAlbums = albums.slice(startIndex, startIndex + itemsPerPage);
  const canGoBack = startIndex > 0;
  const canGoForward = startIndex + itemsPerPage < albums.length;

  useEffect(() => {
    console.log('[PopularAlbumsSection] Fetching songs to extract albums...');
    let cancelled = false;
    fetchTrending(50)
      .then((res) => {
        if (cancelled) return;
        if (res.ok && res.data && Array.isArray(res.data)) {
          console.log('[PopularAlbumsSection] SONGS FROM API:', res.data);
          // Extract unique albums from songs
          const albumMap = new Map();
          res.data.forEach(song => {
            if (song.album && song.artist) {
              const key = `${song.album}|${song.artist}`;
              if (!albumMap.has(key)) {
                albumMap.set(key, {
                  id: key,
                  title: song.album,
                  artist: song.artist,
                  coverUrl: song.coverUrl,
                  // Count tracks for this album (approximate)
                  tracks: res.data.filter(s => s.album === song.album && s.artist === song.artist).length
                });
              }
            }
          });
          const uniqueAlbums = Array.from(albumMap.values()).slice(0, 10);
          console.log('[PopularAlbumsSection] Extracted albums:', uniqueAlbums);
          setAlbums(uniqueAlbums);
        } else {
          console.error('[PopularAlbumsSection] Failed to fetch songs:', res.error);
          setAlbums([]);
        }
        setLoading(false);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error('[PopularAlbumsSection] Fetch error:', error);
        setAlbums([]);
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

  const handleAlbumClick = (album) => {
    navigate(`/album/${encodeURIComponent(album.title)}?artist=${encodeURIComponent(album.artist)}`);
  };

  // FAIL FAST: Show message if no data
  if (!loading && albums.length === 0) {
    return (
      <section data-testid="popular-albums-section" className="py-8 px-4 md:px-8 bg-gray-900 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <Disc3 className="w-7 h-7 text-cyan-400" />
              <h2 className="text-2xl md:text-3xl font-bold text-white">Popular Albums</h2>
            </div>
            <Link 
              to="/discover" 
              data-testid="albums-see-all"
              className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
            >
              See All
            </Link>
          </div>
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No albums available</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section data-testid="popular-albums-section" className="py-8 px-4 md:px-8 bg-gray-900 pb-16">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Disc3 className="w-7 h-7 text-cyan-400" />
            <h2 className="text-2xl md:text-3xl font-bold text-white">Popular Albums</h2>
          </div>
          <Link 
            to="/discover" 
            data-testid="albums-see-all"
            className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
          >
            See All
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
          </div>
        ) : (
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
                  onClick={() => handleAlbumClick(album)}
                  className="group cursor-pointer"
                >
                  <div className="relative mb-3 rounded-lg overflow-hidden bg-gray-800 shadow-lg group-hover:shadow-xl group-hover:shadow-purple-500/20 transition-all duration-300">
                    <img
                      src={album.coverUrl || '/assets/exampleMusicImg.jpeg'}
                      alt={album.title}
                      className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <div>
                        <p className="text-white text-sm font-medium">{album.tracks} tracks</p>
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
        )}
      </div>
    </section>
  );
};

export default PopularAlbumsSection;
