import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Music, Heart, Clock, Settings, Edit2, Camera } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import SongItem from '../SongItem';
import MusicPlayer from '../MusicPlayer';

const ProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentSong, setCurrentSong] = useState(null);
  const [favorites, setFavorites] = useState({});
  const [activeTab, setActiveTab] = useState('playlists');

  // Mock data for user's content
  const userPlaylists = [
    { id: 1, name: 'My Favorites', songCount: 24, imageUrl: '/assets/exampleMusicImg.jpeg?v=1' },
    { id: 2, name: 'Workout Mix', songCount: 18, imageUrl: '/assets/exampleMusicImg.jpeg?v=1' },
    { id: 3, name: 'Chill Vibes', songCount: 32, imageUrl: '/assets/exampleMusicImg.jpeg?v=1' },
    { id: 4, name: 'Road Trip', songCount: 45, imageUrl: '/assets/exampleMusicImg.jpeg?v=1' },
  ];

  const favoriteSongs = Array.from({ length: 8 }, (_, index) => ({
    id: `fav-${index + 1}`,
    imageUrl: '/assets/exampleMusicImg.jpeg?v=1',
    title: `Favorite Song ${index + 1}`,
    artist: `Artist ${index + 1}`,
    category: ['Pop', 'Rock', 'Jazz'][index % 3]
  }));

  const listeningHistory = Array.from({ length: 6 }, (_, index) => ({
    id: `history-${index + 1}`,
    imageUrl: '/assets/exampleMusicImg.jpeg?v=1',
    title: `Recently Played ${index + 1}`,
    artist: `Artist ${index + 1}`,
    playedAt: `${index + 1}h ago`
  }));

  const handlePlaySong = (song) => setCurrentSong(song);
  const handleClosePlayer = () => setCurrentSong(null);
  const handleSelectSong = (song) => navigate(`/song/${song.id}`, { state: { song } });
  const toggleFavorite = (songId) => setFavorites(prev => ({ ...prev, [songId]: !prev[songId] }));
  const isFavorite = (songId) => favorites[songId] || false;

  return (
    <div data-testid="profile-page" className="min-h-screen bg-gray-900">
      {/* Profile Header */}
      <div className="bg-gradient-to-b from-purple-900/50 via-gray-900 to-gray-900">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Profile Picture */}
            <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden bg-gray-800 ring-4 ring-purple-500/30">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600">
                    <User size={64} className="text-white" />
                  </div>
                )}
              </div>
              <button 
                data-testid="edit-profile-photo-btn"
                className="absolute bottom-2 right-2 p-2 bg-gray-800 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-700"
              >
                <Camera size={16} className="text-white" />
              </button>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  {user?.username || 'Music Lover'}
                </h1>
                <Link
                  to="/profilesettings"
                  data-testid="edit-profile-btn"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-full transition-colors"
                >
                  <Edit2 size={14} />
                  Edit Profile
                </Link>
              </div>
              
              <div className="flex items-center justify-center md:justify-start gap-2 text-gray-400 mb-4">
                <Mail size={16} />
                <span>{user?.email || 'user@example.com'}</span>
              </div>

              {/* Stats */}
              <div className="flex justify-center md:justify-start gap-8 text-center">
                <div>
                  <div className="text-2xl font-bold text-white">{userPlaylists.length}</div>
                  <div className="text-sm text-gray-400">Playlists</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{favoriteSongs.length}</div>
                  <div className="text-sm text-gray-400">Favorites</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">128</div>
                  <div className="text-sm text-gray-400">Following</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="border-b border-gray-800 mb-6">
          <nav className="flex gap-8">
            {[
              { id: 'playlists', label: 'Playlists', icon: Music },
              { id: 'favorites', label: 'Favorites', icon: Heart },
              { id: 'history', label: 'History', icon: Clock },
            ].map(tab => (
              <button
                key={tab.id}
                data-testid={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-400'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="pb-8">
          {/* Playlists Tab */}
          {activeTab === 'playlists' && (
            <div data-testid="playlists-content" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
              {userPlaylists.map(playlist => (
                <div
                  key={playlist.id}
                  className="group cursor-pointer"
                >
                  <div className="relative mb-3 rounded-lg overflow-hidden bg-gray-800">
                    <img
                      src={playlist.imageUrl}
                      alt={playlist.name}
                      className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="bg-green-500 rounded-full p-3">
                        <Music size={24} className="text-white" />
                      </div>
                    </div>
                  </div>
                  <h3 className="text-white font-medium truncate group-hover:text-purple-400 transition-colors">
                    {playlist.name}
                  </h3>
                  <p className="text-gray-400 text-sm">{playlist.songCount} songs</p>
                </div>
              ))}
            </div>
          )}

          {/* Favorites Tab */}
          {activeTab === 'favorites' && (
            <div data-testid="favorites-content" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
              {favoriteSongs.map(song => (
                <SongItem
                  key={song.id}
                  id={song.id}
                  imageUrl={song.imageUrl}
                  title={song.title}
                  artist={song.artist}
                  onPlay={handlePlaySong}
                  onSelect={handleSelectSong}
                  song={song}
                  isFavorite={true}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div data-testid="history-content" className="space-y-3">
              {listeningHistory.map(song => (
                <div
                  key={song.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors cursor-pointer group"
                  onClick={() => handlePlaySong(song)}
                >
                  <img
                    src={song.imageUrl}
                    alt={song.title}
                    className="w-14 h-14 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium truncate group-hover:text-purple-400 transition-colors">
                      {song.title}
                    </h4>
                    <p className="text-gray-400 text-sm truncate">{song.artist}</p>
                  </div>
                  <div className="text-gray-500 text-sm flex items-center gap-1">
                    <Clock size={14} />
                    {song.playedAt}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {currentSong && <MusicPlayer song={currentSong} onClose={handleClosePlayer} />}
    </div>
  );
};

export default ProfilePage;
