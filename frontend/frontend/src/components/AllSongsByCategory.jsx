/**
 * AllSongsByCategory - Shows songs by category from backend API
 * NO MOCK DATA - Only renders if backend returns real data
 */
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SongItem from "./SongItem";
import { fetchSongs, fetchByGenre } from "../services/songsService";

const AllSongsByCategory = () => {
  const { category = "All" } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [songs, setSongs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState({});
  const songsPerPage = 10;

  useEffect(() => {
    console.log('[AllSongsByCategory] Fetching songs for category:', category);
    setIsLoading(true);
    let cancelled = false;
    
    // Fetch songs based on category
    const fetchData = category === "All" 
      ? fetchSongs({ limit: 50 })
      : fetchByGenre(category, 50);
    
    fetchData.then((res) => {
      if (cancelled) return;
      console.log('[AllSongsByCategory] API Response:', { ok: res.ok, dataLength: res.ok ? (Array.isArray(res.data) ? res.data.length : res.data?.songs?.length) : 0 });
      if (res.ok && res.data) {
        // Handle both array response and object with songs property
        const songsData = Array.isArray(res.data) ? res.data : res.data.songs || [];
        console.log('[AllSongsByCategory] SONGS FROM API:', songsData);
        setSongs(songsData);
      } else {
        console.error('[AllSongsByCategory] Failed to fetch songs:', res.error);
        setSongs([]);
      }
      setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, [category]);

  const totalPages = Math.ceil(songs.length / songsPerPage);
  const indexOfLastSong = currentPage * songsPerPage;
  const indexOfFirstSong = indexOfLastSong - songsPerPage;
  const currentSongs = songs.slice(indexOfFirstSong, indexOfLastSong);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
  };

  const handleSelectSong = (song) => {
    navigate(`/song/${song.id}`);
  };

  const toggleFavorite = (songId) => {
    setFavorites((prev) => ({
      ...prev,
      [songId]: !prev[songId],
    }));
  };

  const isFavorite = (songId) => favorites[songId] || false;

  return (
    <div className="p-6 bg-gray-900 min-h-screen pb-20">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            {category === "All" ? "All Music" : `${category} Music`}
          </h1>
          <div className="flex space-x-2">
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md transition-colors duration-200"
            >
              Back
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : songs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-xl text-white mb-4">No songs found in this category.</p>
            <p className="text-gray-400 text-sm mb-4">Make sure backend is running and database is seeded.</p>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200"
            >
              Go Back
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {currentSongs.map((song) => (
                <SongItem
                  key={song.id}
                  id={song.id}
                  coverUrl={song.coverUrl}
                  title={song.title}
                  artist={song.artist}
                  album={song.album}
                  onSelect={handleSelectSong}
                  song={song}
                  isFavorite={isFavorite(song.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
            
            {totalPages > 1 && (
              <div className="flex justify-center mt-8 space-x-2">
                {Array.from({ length: totalPages }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => paginate(index + 1)}
                    className={`px-4 py-2 rounded ${
                      currentPage === index + 1
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AllSongsByCategory;
