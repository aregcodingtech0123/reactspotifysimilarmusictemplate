import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/200?text=No+Cover';

/**
 * Reusable song card: cover, title, artist, optional genre pill.
 * Hover: play button; click card → song detail. Uses global player for preview_url.
 */
function SongCard({ song, showGenre = true, onToggleFavorite, isFavorite }) {
  const navigate = useNavigate();
  const { play, currentSong, isPlaying } = usePlayer();

  const id = song?.id ?? song?.name;
  const coverUrl =
    (song?.image ?? song?.coverUrl ?? song?.cover_url ?? song?.image_url) || PLACEHOLDER_IMAGE;
  const title = song?.title ?? song?.name ?? '';
  const artist = song?.artist ?? '';
  const genre = (song?.primary_genre ?? song?.genre ?? '').toString().trim();
  const previewUrl = song?.preview_url ?? song?.previewUrl ?? song?.audioUrl;
  const hasPlayable = Boolean(previewUrl);

  const isCurrentPlaying = currentSong?.id === id && isPlaying;

  const handleCardClick = (e) => {
    if (e.target.closest('.play-button') || e.target.closest('.heart-button')) return;
    if (id) navigate(`/song/${id}`);
  };

  const handlePlay = (e) => {
    e.stopPropagation();
    if (hasPlayable && song) play(song);
  };

  const handleArtistClick = (e) => {
    e.stopPropagation();
    if (artist) navigate(`/artist/${encodeURIComponent(artist)}`);
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (onToggleFavorite) onToggleFavorite(id);
  };

  return (
    <div
      className="relative group cursor-pointer transition-all duration-300 hover:scale-[1.02] rounded-lg overflow-hidden"
      onClick={handleCardClick}
    >
      <div className="relative overflow-hidden rounded-lg bg-gray-800/80 dark:bg-gray-800">
        <img
          src={coverUrl || PLACEHOLDER_IMAGE}
          alt={title}
          className="w-full aspect-square object-cover transition-transform duration-300 group-hover:brightness-75 group-hover:scale-105"
          loading="lazy"
        />
        <div
          className="play-button absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          onClick={handlePlay}
        >
          <div
            className={`rounded-full p-3 transform transition duration-300 scale-110 ${
              hasPlayable
                ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg'
                : 'bg-gray-600 text-gray-300'
            }`}
          >
            {isCurrentPlaying ? (
              <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </div>
        </div>
        {onToggleFavorite && (
          <div
            className="heart-button absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleFavoriteClick}
          >
            <div className="bg-black/50 rounded-full p-1.5">
              {isFavorite ? (
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5 text-white hover:text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="p-2 flex justify-between items-start gap-2 min-w-0">
        <div className="overflow-hidden min-w-0 flex-1">
          <h3 className="text-white font-medium truncate dark:text-white">{title}</h3>
          <button
            type="button"
            onClick={handleArtistClick}
            className="text-gray-400 text-sm truncate hover:text-purple-400 hover:underline text-left w-full"
          >
            {artist}
          </button>
          {showGenre && genre && (
            <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 dark:bg-purple-500/30 dark:text-purple-200">
              {genre}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default SongCard;
