import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import { searchSongs } from '../../services/songsService';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState({ songs: [], artists: [], albums: [] });
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults({ songs: [], artists: [], albums: [] });
      setOpen(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setLoading(true);
      searchSongs(searchTerm.trim(), 20).then((res) => {
        setLoading(false);
        if (!res.ok) {
          setResults({ songs: [], artists: [], albums: [] });
          return;
        }
        const songs = res.data;
        const artists = Array.from(new Set(songs.map((s) => s.artist))).slice(0, 5).map((name) => ({ name }));
        const albumSet = new Map();
        songs.forEach((s) => {
          if (!albumSet.has(s.album)) albumSet.set(s.album, { name: s.album, artist: s.artist, coverUrl: s.coverUrl });
        });
        const albums = Array.from(albumSet.values()).slice(0, 5);
        setResults({ songs: songs.slice(0, 5), artists, albums });
        setOpen(true);
      });
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const go = (path) => {
    setOpen(false);
    setSearchTerm('');
    navigate(path);
  };

  const hasResults = results.songs.length > 0 || results.artists.length > 0 || results.albums.length > 0;

  return (
    <div className="w-full max-w-md px-2 relative" ref={containerRef}>
      <div className="flex items-center gap-3 border rounded-2xl px-3 py-2 shadow-sm bg-white">
        <FaSearch className="w-5 h-5 flex-shrink-0 text-gray-500" />
        <input
          className="w-full outline-none bg-transparent text-sm md:text-base text-gray-900"
          type="text"
          placeholder="Search songs, artists, albums..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => searchTerm.trim() && setOpen(true)}
        />
      </div>
      {open && searchTerm.trim() && (
        <div className="absolute top-full left-2 right-2 mt-1 bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden z-50 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-gray-400 text-center">Searching...</div>
          ) : !hasResults ? (
            <div className="p-4 text-gray-400 text-center">No results</div>
          ) : (
            <div className="py-2">
              {results.songs.length > 0 && (
                <div className="px-3 py-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Songs</p>
                  {results.songs.map((song) => (
                    <button
                      key={song.id}
                      onClick={() => go(`/song/${song.id}`)}
                      className="w-full flex items-center gap-3 p-2 rounded hover:bg-gray-700 text-left"
                    >
                      <img src={song.coverUrl || '/assets/exampleMusicImg.jpeg'} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-white font-medium truncate">{song.title}</p>
                        <p className="text-gray-400 text-sm truncate">{song.artist}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {results.artists.length > 0 && (
                <div className="px-3 py-2 border-t border-gray-700">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Artists</p>
                  {results.artists.map((a) => (
                    <button
                      key={a.name}
                      onClick={() => go(`/artist/${encodeURIComponent(a.name)}`)}
                      className="w-full flex items-center gap-3 p-2 rounded hover:bg-gray-700 text-left"
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {a.name.charAt(0)}
                      </div>
                      <p className="text-white font-medium truncate">{a.name}</p>
                    </button>
                  ))}
                </div>
              )}
              {results.albums.length > 0 && (
                <div className="px-3 py-2 border-t border-gray-700">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Albums</p>
                  {results.albums.map((alb) => (
                    <button
                      key={`${alb.artist}-${alb.name}`}
                      onClick={() => go(`/album/${encodeURIComponent(alb.name)}?artist=${encodeURIComponent(alb.artist)}`)}
                      className="w-full flex items-center gap-3 p-2 rounded hover:bg-gray-700 text-left"
                    >
                      <img src={alb.coverUrl || '/assets/exampleMusicImg.jpeg'} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-white font-medium truncate">{alb.name}</p>
                        <p className="text-gray-400 text-sm truncate">{alb.artist}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
