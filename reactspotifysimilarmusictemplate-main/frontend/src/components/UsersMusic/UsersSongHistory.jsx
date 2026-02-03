import React, { useState, useEffect } from 'react';
import { Play, MoreHorizontal, Clock, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MusicPlayer from '../MusicPlayer';
import { useAuth } from '../../context/AuthContext.jsx';

const UsersSongHistory = () => {
  const { user } = useAuth();
  const displayUsername = user?.username || 'user';

  const [songs, setSongs] = useState([
    { id: 1, title: "Midnight Sky", artist: "Miley Cyrus", album: "Plastic Hearts", playedAt: "2 hours ago", duration: "3:42", cover: "/api/placeholder/60/60" },
    { id: 2, title: "Blinding Lights", artist: "The Weeknd", album: "After Hours", playedAt: "Yesterday", duration: "3:20", cover: "/api/placeholder/60/60" },
    { id: 3, title: "Dance Monkey", artist: "Tones and I", album: "The Kids Are Coming", playedAt: "2 days ago", duration: "3:29", cover: "/api/placeholder/60/60", hasVideo: true },
    { id: 4, title: "Physical", artist: "Dua Lipa", album: "Future Nostalgia", playedAt: "3 days ago", duration: "3:42", cover: "/api/placeholder/60/60" },
    { id: 5, title: "Watermelon Sugar", artist: "Harry Styles", album: "Fine Line", playedAt: "4 days ago", duration: "2:54", cover: "/api/placeholder/60/60" },
    { id: 6, title: "Don't Start Now", artist: "Dua Lipa", album: "Future Nostalgia", playedAt: "5 days ago", duration: "3:03", cover: "/api/placeholder/60/60" },
  ]);

  const [showMusicPlayer, setShowMusicPlayer] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (displayUsername) {
      // Here you would typically fetch the user's song history from an API
    }
  }, [displayUsername]);

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

  const addToFavorites = (id) => {
    console.log(`Added song ${id} to favorites`);
    setOpenMenuId(null);
  };

  const addToPlaylist = (id) => {
    console.log(`Added song ${id} to playlist`);
    setOpenMenuId(null);
  };

  const handleCloseMusicPlayer = () => {
    setShowMusicPlayer(false);
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen p-4">
      <div className="flex items-center mb-6">
        <div className="bg-blue-500 rounded-full p-4 mr-4">
          <History size={28} color="white" />
        </div>
        <h1 className="text-3xl font-bold">{displayUsername}'s Recently Played</h1>
      </div>

      <div className="mb-4">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400 text-left">
              <th className="py-2 px-4 w-12">#</th>
              <th className="py-2 px-4">Title</th>
              <th className="py-2 px-4">Album</th>
              <th className="py-2 px-4">Played</th>
              <th className="py-2 px-4 text-right"><Clock size={18} /></th>
              <th className="py-2 px-4 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {songs.map((song, index) => (
              <tr key={song.id} className="hover:bg-gray-800">
                <td className="py-3 px-4 text-center">
                  {index + 1}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    <div className="relative mr-3">
                      <img 
                        src={song.cover} 
                        alt={song.title} 
                        className="w-10 h-10"
                      />
                      <button 
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100"
                        onClick={() => playSong(song)}
                      >
                        <Play size={16} fill="white" />
                      </button>
                    </div>
                    <div>
                      <div className="font-medium">
                        {song.title}
                      </div>
                      <div className="text-gray-400 text-sm flex items-center">
                        {song.hasVideo && (
                          <div className="bg-gray-700 text-xs mr-2 px-1 rounded flex items-center">
                            <Play size={10} className="mr-1" /> Music video
                          </div>
                        )}
                        {song.artist}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-400">{song.album}</td>
                <td className="py-3 px-4 text-gray-400">{song.playedAt}</td>
                <td className="py-3 px-4 text-gray-400 text-right">{song.duration}</td>
                <td className="py-3 px-4 relative">
                  <button 
                    className="text-gray-400 hover:text-white"
                    onClick={() => toggleMenu(song.id)}
                  >
                    <MoreHorizontal size={20} />
                  </button>
                  
                  {openMenuId === song.id && (
                    <div className="absolute right-12 z-10 mt-2 bg-gray-800 rounded shadow-lg py-1 w-48">
                      <button 
                        className="text-white w-full text-left px-4 py-2 hover:bg-gray-700"
                        onClick={() => addToFavorites(song.id)}
                      >
                        Add to favorites
                      </button>
                      <button 
                        className="text-white w-full text-left px-4 py-2 hover:bg-gray-700"
                        onClick={() => removeSong(song.id)}
                      >
                        Remove from history
                      </button>
                      <button 
                        className="text-white w-full text-left px-4 py-2 hover:bg-gray-700"
                        onClick={() => viewSongDetails(song.id)}
                      >
                        View song details
                      </button>
                      <button 
                        className="text-white w-full text-left px-4 py-2 hover:bg-gray-700"
                        onClick={() => addToPlaylist(song.id)}
                      >
                        Add to playlist
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

export default UsersSongHistory;