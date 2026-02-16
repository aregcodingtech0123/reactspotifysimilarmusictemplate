import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SongItem from '../SongItem';
import { Compass, Guitar, Music2, Mic2, Disc } from 'lucide-react';
import { fetchAllSongs } from '../../services/recommendationApi';

const GENRE_KEYWORDS = {
  rock: ['rock'],
  pop: ['pop'],
  jazz: ['jazz'],
  rap: ['rap', 'hip hop', 'hip-hop'],
};

function groupSongsByGenre(songs) {
  const categories = { rock: [], pop: [], jazz: [], rap: [], other: [] };
  for (const song of songs) {
    const tags = (song.tags || '').toLowerCase();
    let placed = false;
    for (const [key, keywords] of Object.entries(GENRE_KEYWORDS)) {
      if (keywords.some((kw) => tags.includes(kw))) {
        categories[key].push(song);
        placed = true;
        break;
      }
    }
    if (!placed) categories.other.push(song);
  }
  return categories;
}

function catalogToItem(song) {
  return {
    id: song.id,
    coverUrl: song.image,
    title: song.title,
    artist: song.artist,
    album: '',
    previewUrl: song.preview_url,
    preview_url: song.preview_url,
    ...song,
  };
}

const GENRE_TABS = [
  { key: 'rock', label: 'Rock', icon: Guitar, iconColor: 'text-red-400' },
  { key: 'pop', label: 'Pop', icon: Music2, iconColor: 'text-pink-400' },
  { key: 'jazz', label: 'Jazz', icon: Music2, iconColor: 'text-blue-400' },
  { key: 'rap', label: 'Rap', icon: Mic2, iconColor: 'text-orange-400' },
  { key: 'other', label: 'Other', icon: Disc, iconColor: 'text-gray-400' },
];

const DiscoverPage = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState({});
  const [categories, setCategories] = useState({
    rock: [],
    pop: [],
    jazz: [],
    rap: [],
    other: [],
  });
  const [selectedGenre, setSelectedGenre] = useState('rock');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchAllSongs().then((songs) => {
      if (cancelled) return;
      const grouped = groupSongsByGenre(songs);
      setCategories(grouped);
      setLoading(false);
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const handleSelectSong = (song) => {
    navigate(`/song/${song.id}`);
  };

  const toggleFavorite = (songId) => {
    setFavorites((prev) => ({ ...prev, [songId]: !prev[songId] }));
  };

  const currentSongs = (categories[selectedGenre] || []).map(catalogToItem);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121826] p-4 md:p-8 flex items-center justify-center">
        <p className="text-white text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <div data-testid="discover-page" className="min-h-screen bg-[#121826] p-4 md:p-8">
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Compass className="w-8 h-8 text-purple-400" />
          <h1 className="text-3xl md:text-4xl font-bold text-white">Discover</h1>
        </div>
        <p className="text-gray-400">Explore new music across different genres</p>
      </div>

      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Genre tabs">
          {GENRE_TABS.map(({ key, label, icon: Icon, iconColor }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={selectedGenre === key}
              onClick={() => setSelectedGenre(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors ${
                selectedGenre === key
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700/60 text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${iconColor}`} />
              {label}
              <span className="text-sm opacity-80">({(categories[key] || []).length})</span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {currentSongs.length === 0 ? (
          <p className="text-gray-400 text-center py-12">No songs found in this genre.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {currentSongs.map((song) => (
              <SongItem
                key={song.id}
                id={song.id}
                coverUrl={song.coverUrl}
                imageUrl={song.image}
                title={song.title}
                artist={song.artist}
                album={song.album}
                song={song}
                onSelect={handleSelectSong}
                isFavorite={favorites[song.id] || false}
                onToggleFavorite={toggleFavorite ? (() => toggleFavorite(song.id)) : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscoverPage;
