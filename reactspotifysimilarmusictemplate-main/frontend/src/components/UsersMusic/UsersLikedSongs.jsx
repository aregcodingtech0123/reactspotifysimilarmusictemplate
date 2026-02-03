import React, { useState } from 'react';
import { Play, MoreHorizontal, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MusicPlayer from '../MusicPlayer';

const UsersLikedSongs = () => {
  const [songs, setSongs] = useState([
    { id: 1, title: "Glow", artist: "Mr.Kitty", album: "Time", addedAt: "21 saat önce", duration: "3:42", cover: "/api/placeholder/60/60" },
    { id: 2, title: "Despacito", artist: "Luis Fonsi, Daddy Yankee", album: "VIDA", addedAt: "2 gün önce", duration: "3:49", cover: "/api/placeholder/60/60", hasVideo: true },
    { id: 3, title: "Goth", artist: "Sidewalks and Skeletons", album: "White Light", addedAt: "3 gün önce", duration: "3:27", cover: "/api/placeholder/60/60", isPlaying: true },
    { id: 4, title: "Suffocation", artist: "Crystal Castles", album: "Crystal Castles (II)", addedAt: "3 gün önce", duration: "4:02", cover: "/api/placeholder/60/60" },
    { id: 5, title: "Vanished", artist: "Crystal Castles", album: "Crystal Castles", addedAt: "3 gün önce", duration: "4:02", cover: "/api/placeholder/60/60" },
    { id: 6, title: "Neglect", artist: "Mr.Kitty", album: "Time", addedAt: "3 gün önce", duration: "3:36", cover: "/api/placeholder/60/60" },
  ]);

  const [showMusicPlayer, setShowMusicPlayer] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const navigate = useNavigate();

  const playSong = (song) => {
    setCurrentSong(song);
    setShowMusicPlayer(true);
  };

  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const removeSong = (id) => {
    setSongs(songs.filter(song => song.id !== id));
    setOpenMenuId(null);
  };

  const viewSongDetails = (id) => {
    navigate(`/songdetail/${id}`);
    setOpenMenuId(null);
  };

  const addToPlaylist = (id) => {
    // This would integrate with your playlist functionality
    console.log(`Added song ${id} to playlist`);
    setOpenMenuId(null);
  };

  const handleCloseMusicPlayer = () => {
    setShowMusicPlayer(false);
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen p-4">
      <div className="flex items-center mb-6">
        <div className="bg-green-500 rounded-full p-4 mr-4">
          <Play fill="white" size={28} />
        </div>
        <h1 className="text-3xl font-bold">Beğenilen Şarkılar</h1>
      </div>

      <div className="mb-4">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400 text-left">
              <th className="py-2 px-4 w-12">#</th>
              <th className="py-2 px-4">Başlık</th>
              <th className="py-2 px-4">Albüm</th>
              <th className="py-2 px-4">Eklenme tarihi</th>
              <th className="py-2 px-4 text-right"><Clock size={18} /></th>
              <th className="py-2 px-4 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {songs.map((song, index) => (
              <tr key={song.id} className={`hover:bg-gray-800 ${song.isPlaying ? 'bg-gray-800' : ''}`}>
                <td className="py-3 px-4 text-center">
                  {/* Show only the track number here */}
                  <span className={song.isPlaying ? 'text-green-500' : ''}>
                    {index + 1}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    <div className="relative mr-3">
                      <img 
                        src={song.cover} 
                        alt={song.title} 
                        className="w-10 h-10"
                      />
                      {/* Play button overlaid on the album image */}
                      <button 
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100"
                        onClick={() => playSong(song)}
                      >
                        <Play size={16} fill="white" />
                      </button>
                    </div>
                    <div>
                      <div className={`font-medium ${song.isPlaying ? 'text-green-500' : ''}`}>
                        {song.title}
                      </div>
                      <div className="text-gray-400 text-sm flex items-center">
                        {song.hasVideo && (
                          <div className="bg-gray-700 text-xs mr-2 px-1 rounded flex items-center">
                            <Play size={10} className="mr-1" /> Müzik videosu
                          </div>
                        )}
                        {song.artist}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-400">{song.album}</td>
                <td className="py-3 px-4 text-gray-400">{song.addedAt}</td>
                <td className="py-3 px-4 text-gray-400 text-right">{song.duration}</td>
                <td className="py-3 px-4 relative">
                  <button 
                    className="text-gray-400 hover:text-white" // Removed opacity-0 class to make it always visible
                    onClick={() => toggleMenu(song.id)}
                  >
                    <MoreHorizontal size={20} />
                  </button>
                  
                  {openMenuId === song.id && (
                    <div className="absolute right-12 z-10 mt-2 bg-gray-800 rounded shadow-lg py-1 w-48">
                      <button 
                        className="text-white w-full text-left px-4 py-2 hover:bg-gray-700"
                        onClick={() => removeSong(song.id)}
                      >
                        Favorilerden kaldır
                      </button>
                      <button 
                        className="text-white w-full text-left px-4 py-2 hover:bg-gray-700"
                        onClick={() => viewSongDetails(song.id)}
                      >
                        Şarkı detaylarını gör
                      </button>
                      <button 
                        className="text-white w-full text-left px-4 py-2 hover:bg-gray-700"
                        onClick={() => addToPlaylist(song.id)}
                      >
                        Çalma listesine ekle
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showMusicPlayer && <MusicPlayer song={currentSong} onClose={handleCloseMusicPlayer} />}
    </div>
  );
};

export default UsersLikedSongs;