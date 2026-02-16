import React from 'react';
import { usePlayer } from '../context/PlayerContext';

/**
 * Global audio player bar. Uses previewUrl from backend; one song at a time.
 */
const MusicPlayer = () => {
  const { currentSong, isPlaying, currentTime, duration, togglePlayPause, stop, seek } = usePlayer();

  if (!currentSong) return null;

  const handleSeek = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    seek(pct * (duration || 0));
  };

  const formatTime = (sec) => {
    if (sec == null || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/90 text-white p-2 shadow-lg border-t border-gray-800 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0 w-1/4">
          <img
            src={currentSong.coverUrl || '/assets/exampleMusicImg.jpeg'}
            alt={currentSong.title}
            className="h-12 w-12 object-cover rounded flex-shrink-0"
          />
          <div className="truncate min-w-0">
            <p className="font-medium truncate">{currentSong.title}</p>
            <p className="text-gray-400 text-sm truncate">{currentSong.artist}</p>
          </div>
        </div>

        <div className="flex flex-col items-center flex-1 min-w-0">
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlayPause}
              className="bg-white rounded-full p-2 hover:bg-gray-200 transition text-black"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m-9-8h14" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </button>
          </div>
          <div className="w-full flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-400 w-10">{formatTime(currentTime)}</span>
            <div
              className="h-1 flex-1 bg-gray-700 rounded-full cursor-pointer"
              onClick={handleSeek}
            >
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>
            <span className="text-xs text-gray-400 w-10">{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center w-1/4 justify-end">
          <button onClick={stop} className="text-gray-400 hover:text-white transition" aria-label="Close">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
