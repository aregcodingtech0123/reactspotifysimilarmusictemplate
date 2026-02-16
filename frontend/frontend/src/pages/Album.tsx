import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { fetchSongs } from '../services/songsService';
import type { Song } from '../services/songsService';
import SongItem from '../components/SongItem';

export function Album() {
  const { albumName } = useParams<{ albumName: string }>();
  const [searchParams] = useSearchParams();
  const artist = searchParams.get('artist') || '';
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const name = albumName ? decodeURIComponent(albumName) : '';

  useEffect(() => {
    if (!name) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    fetchSongs({ album: name, ...(artist ? { artist } : {}), limit: 100 }).then((res) => {
      if (cancelled) return;
      setLoading(false);
      if (res.ok) setSongs(res.data.songs);
    });
    return () => { cancelled = true; };
  }, [name, artist]);

  const first = songs[0];

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
          <div className="flex-shrink-0">
            <img
              src={first?.coverUrl}
              alt={name}
              className="w-full max-w-xs aspect-square object-cover rounded-lg shadow-lg"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-gray-400 text-sm uppercase tracking-wider mb-1">Album</p>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{name}</h1>
            {first?.artist && (
              <Link to={`/artist/${encodeURIComponent(first.artist)}`} className="text-purple-400 hover:underline text-lg">
                {first.artist}
              </Link>
            )}
            <p className="text-gray-400 mt-2">{songs.length} tracks</p>
          </div>
        </div>

        {songs.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-white mb-4">Tracks</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {songs.map((song) => (
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

        {!loading && songs.length === 0 && (
          <p className="text-gray-400">No tracks found for this album.</p>
        )}
      </div>
    </div>
  );
}
