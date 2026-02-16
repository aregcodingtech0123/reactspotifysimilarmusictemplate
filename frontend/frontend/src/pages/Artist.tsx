import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchSongsByArtist } from '../services/songsService';
import type { Song } from '../services/songsService';
import SongItem from '../components/SongItem';

export function Artist() {
  const { name } = useParams<{ name: string }>();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const artistName = name ? decodeURIComponent(name) : '';

  useEffect(() => {
    if (!artistName) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    fetchSongsByArtist(artistName, 50).then((res) => {
      if (cancelled) return;
      setLoading(false);
      if (res.ok) setSongs(res.data);
    });
    return () => { cancelled = true; };
  }, [artistName]);

  const albums = Array.from(new Set(songs.map((s) => s.album))).slice(0, 12);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121826] flex items-center justify-center">
        <p className="text-white text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121826] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8 mb-10">
          <div className="w-48 h-48 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
            <span className="text-6xl font-bold text-gray-500">{artistName.charAt(0)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-gray-400 text-sm uppercase tracking-wider mb-1">Artist</p>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{artistName}</h1>
            <p className="text-gray-400">{songs.length} songs</p>
          </div>
        </div>

        {songs.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-bold text-white mb-4">Popular songs</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {songs.slice(0, 10).map((song) => (
                <SongItem
                  key={song.id}
                  id={song.id}
                  coverUrl={song.coverUrl}
                  title={song.title}
                  artist={song.artist}
                  album={song.album}
                  song={song}
                />
              ))}
            </div>
          </section>
        )}

        {albums.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-white mb-4">Albums</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {albums.map((album) => {
                const first = songs.find((s) => s.album === album);
                return (
                  <Link
                    key={album}
                    to={`/album/${encodeURIComponent(album)}?artist=${encodeURIComponent(artistName)}`}
                    className="group block rounded-lg overflow-hidden bg-gray-800 hover:ring-2 hover:ring-purple-500 transition"
                  >
                    <img
                      src={first?.coverUrl}
                      alt={album}
                      className="w-full aspect-square object-cover group-hover:brightness-75"
                    />
                    <div className="p-2">
                      <p className="text-white font-medium truncate">{album}</p>
                      <p className="text-gray-400 text-sm truncate">{artistName}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {!loading && songs.length === 0 && (
          <p className="text-gray-400">No songs found for this artist.</p>
        )}
      </div>
    </div>
  );
}
