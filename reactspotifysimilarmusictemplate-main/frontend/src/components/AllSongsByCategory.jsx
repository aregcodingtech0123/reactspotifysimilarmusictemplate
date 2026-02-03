import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SongItem from "./SongItem";
import MusicPlayer from "./MusicPlayer"; // MusicPlayer'ı ekledik

const AllSongsByCategory = () => {
  const { category = "All" } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [songs, setSongs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentSong, setCurrentSong] = useState(null); // Seçili şarkıyı saklıyoruz
  const [favorites, setFavorites] = useState({});
  const songsPerPage = 10;

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      const allSongs = Array.from({ length: 50 }, (_, index) => ({
        id: index + 1,
        imageUrl: "/assets/exampleMusicImg.jpeg?v=1",
        title: `Song Title ${index + 1}`,
        artist: `Artist ${index + 1}`,
        category: ["All", "Rock", "Pop", "Jazz", "Rap"][Math.floor(Math.random() * 5)],
      }));

      const filteredSongs = category === "All" ? allSongs : allSongs.filter((song) => song.category === category);

      setSongs(filteredSongs);
      setIsLoading(false);
    }, 500);
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
    navigate(`/song/${song.id}`, { state: { song } });
  };

  const handlePlaySong = (song) => {
    setCurrentSong(song); // Seçili şarkıyı güncelliyoruz
  };

  const closePlayer = () => {
    setCurrentSong(null); // Şarkı çalmayı durduruyoruz
  };

  const toggleFavorite = (songId) => {
    setFavorites((prev) => ({
      ...prev,
      [songId]: !prev[songId],
    }));
  };

  const isFavorite = (songId) => favorites[songId] || false;

  return (
    <div className="p-6 bg-gray-900 min-h-screen pb-20"> {/* pb-20 ile alttaki müzik çalar için boşluk bırakıyoruz */}
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
        ) : (
          <>
            {songs.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {currentSongs.map((song) => (
                    <SongItem
                      key={song.id}
                      id={song.id}
                      imageUrl={song.imageUrl}
                      title={song.title}
                      artist={song.artist}
                      onPlay={handlePlaySong} // Oynatma fonksiyonunu buraya bağladık
                      onSelect={handleSelectSong}
                      song={song}
                      isFavorite={isFavorite(song.id)}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-64">
                <p className="text-xl text-white mb-4">No songs found in this category.</p>
                <button
                  onClick={() => window.history.back()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200"
                >
                  Go Back
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Music Player */}
      {currentSong && <MusicPlayer song={currentSong} onClose={closePlayer} />}
    </div>
  );
};

export default AllSongsByCategory;
