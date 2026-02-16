import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SongCard from './SongCard';
import { GENRES, matchGenre } from '../constants/genres';

const ITEMS_PER_PAGE = 5;

function getSeeMoreLink(activeCategory, sectionKey) {
  if (activeCategory === 'All') {
    if (sectionKey === 'recommended') return '/discover';
    if (sectionKey === 'trending') return '/trendingsongsall';
    if (sectionKey === 'discover') return '/discover';
    if (sectionKey === 'history') return '/trendingsongsall';
  }
  const slug = activeCategory.toLowerCase().replace(/\s+/g, '-');
  return `/category/${slug}`;
}

/**
 * Reusable home section: title, genre filters, grid of SongCards, loading/empty/error, See More.
 * songs = normalized list (with id, title/name, artist, image/coverUrl, preview_url, primary_genre).
 */
function HomeSection({
  title,
  songs = [],
  loading = false,
  error = null,
  emptyMessage = 'No songs yet – start listening!',
  seeMoreSectionKey = 'discover',
  genres = GENRES,
  itemsPerPage = ITEMS_PER_PAGE,
  onToggleFavorite,
  favorites = {},
}) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [startIndex, setStartIndex] = useState(0);

  const filteredSongs =
    activeCategory === 'All'
      ? songs
      : songs.filter((s) => matchGenre(s, activeCategory));

  const totalPages = Math.max(1, Math.ceil(filteredSongs.length / itemsPerPage));
  const currentPage = Math.floor(startIndex / itemsPerPage);
  const visibleSongs = filteredSongs.slice(startIndex, startIndex + itemsPerPage);

  const handlePrev = () => setStartIndex((i) => Math.max(0, i - itemsPerPage));
  const handleNext = () =>
    setStartIndex((i) =>
      Math.min(filteredSongs.length - itemsPerPage, i + itemsPerPage)
    );

  const seeMoreLink = getSeeMoreLink(activeCategory, seeMoreSectionKey);

  return (
    <section className="p-4 bg-gray-900 dark:bg-gray-900">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-wrap">
          <h2 className="text-2xl font-bold text-white dark:text-white">
            {title}
          </h2>
          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => (
              <button
                key={genre}
                type="button"
                onClick={() => {
                  setActiveCategory(genre);
                  setStartIndex(0);
                }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${
                  activeCategory === genre
                    ? 'bg-white text-black dark:bg-white dark:text-black'
                    : 'bg-gray-800 text-white hover:bg-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
        <Link
          to={seeMoreLink}
          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 px-6 py-3 rounded-lg text-white font-semibold shadow-md transition duration-300 ease-in-out transform hover:scale-105"
        >
          See More
        </Link>
      </div>

      {error && (
        <div className="text-center py-8 text-amber-400">
          {typeof error === 'string' ? error : 'Something went wrong. Try again.'}
        </div>
      )}

      {loading && !error && (
        <div className="flex justify-center py-12">
          <div
            className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"
            aria-hidden
          />
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="relative">
            {startIndex > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gray-800 hover:bg-gray-700 text-white rounded-full p-2 shadow-lg transition"
                aria-label="Previous"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {filteredSongs.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                {emptyMessage}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 py-2">
                {visibleSongs.map((song) => (
                  <SongCard
                    key={song.id ?? song.name}
                    song={song}
                    showGenre={true}
                    onToggleFavorite={onToggleFavorite}
                    isFavorite={favorites[song.id ?? song.name]}
                  />
                ))}
              </div>
            )}

            {filteredSongs.length > itemsPerPage && startIndex + itemsPerPage < filteredSongs.length && (
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gray-800 hover:bg-gray-700 text-white rounded-full p-2 shadow-lg transition"
                aria-label="Next"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>

          {totalPages > 1 && !loading && (
            <div className="flex justify-center mt-6 gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setStartIndex(i * itemsPerPage)}
                  className={`h-3 rounded-full transition-all ${
                    i === currentPage ? 'bg-purple-500 w-6' : 'bg-gray-600 hover:bg-gray-500 w-3'
                  }`}
                  aria-label={`Page ${i + 1}`}
                />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default HomeSection;
