import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchSongById } from '../services/songsService';
import type { Song } from '../services/songsService';
import { usePlayer } from '../context/PlayerContext';

export function SongDetail() {
  const { id } = useParams<{ id: string }>();
  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const { play, currentSong, isPlaying } = usePlayer();

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    fetchSongById(id).then((res) => {
      if (cancelled) return;
      setLoading(false);
      if (res.ok) setSong(res.data);
    });
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121826] flex items-center justify-center">
        <p className="text-white text-xl">Loading...</p>
      </div>
    );
  }

  if (!song) {
    return (
      <div className="min-h-screen bg-[#121826] p-6">
        <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg p-6">
          <h1 className="text-2xl text-white mb-4">Song not found</h1>
          <Link to="/discover" className="text-purple-400 hover:underline">← Back to Discover</Link>
        </div>
      </div>
    );
  }

  const isCurrentPlaying = currentSong?.id === song.id && isPlaying;

  return (
    <div className="min-h-screen bg-[#121826] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/discover" className="text-gray-400 hover:text-white text-sm mb-6 inline-block">← Back to Discover</Link>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-shrink-0">
            <img
              src={song.coverUrl || '/assets/exampleMusicImg.jpeg'}
              alt={song.title}
              className="w-full max-w-xs aspect-square object-cover rounded-lg shadow-lg"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-gray-400 text-sm uppercase tracking-wider mb-1">Song</p>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{song.title}</h1>
            <p className="text-gray-300 mb-2">
              <span className="text-gray-500">Artist: </span>
              <Link to={`/artist/${encodeURIComponent(song.artist)}`} className="text-purple-400 hover:underline">
                {song.artist}
              </Link>
            </p>
            <p className="text-gray-300 mb-4">
              <span className="text-gray-500">Album: </span>
              <Link to={`/album/${encodeURIComponent(song.album)}?artist=${encodeURIComponent(song.artist)}`} className="text-purple-400 hover:underline">
                {song.album}
              </Link>
            </p>
            <p className="text-gray-400 text-sm mb-4">
              {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')} · {song.genre}
            </p>
            <button
              onClick={() => (song.previewUrl || song.audioUrl) && play(song)}
              disabled={!song.previewUrl && !song.audioUrl}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition ${(song.previewUrl || song.audioUrl) ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}
            >
              {isCurrentPlaying ? (
                <>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                  Pause
                </>
              ) : (
                <>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  {(song.previewUrl || song.audioUrl) ? 'Play preview' : 'Preview not available'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
