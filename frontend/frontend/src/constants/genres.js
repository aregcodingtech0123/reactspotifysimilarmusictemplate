/**
 * Genre filter options for sections (semantic primary_genre matching).
 * Keep in sync with backend GENRE_PROTOTYPES where applicable.
 */
export const GENRES = [
  'All',
  'Rock',
  'Pop',
  'Jazz',
  'Hip Hop',
  'Rap',
  'Electronic',
  'R&B',
  'Indie',
  'Metal',
  'Classical',
  'Country',
];

/**
 * Filter a song by primary_genre (no string/tag matching).
 */
export function matchGenre(song, genre) {
  if (genre === 'All') return true;
  const primary = (song?.primary_genre || '').trim();
  if (!primary) return false;
  return primary.toLowerCase() === genre.toLowerCase();
}
