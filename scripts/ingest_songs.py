"""
Song ingestion pipeline: fetch from Deezer, upsert to Postgres, trigger embeddings.
"""

from __future__ import annotations

import logging
from typing import Any

from deezer_client import fetch_all_genres, normalize_genre
from db import upsert_song

log = logging.getLogger("ingest_songs")

# All genres to fetch
ALL_GENRES = [
    "all",
    "rock",
    "pop",
    "jazz",
    "hip hop",
    "rap",
    "electronic",
    "r&b",
    "indie",
    "metal",
    "classical",
    "country",
]

SONGS_PER_GENRE = 100


async def ingest_genre(genre: str, songs_per_genre: int = SONGS_PER_GENRE) -> tuple[int, int]:
    """
    Ingest songs for a single genre.
    
    Returns:
        Tuple of (inserted_count, updated_count)
    """
    normalized_genre = normalize_genre(genre)
    log.info("Starting ingestion for genre: %s", normalized_genre)
    
    # Fetch songs from Deezer
    from deezer_client import fetch_tracks_by_genre
    songs = fetch_tracks_by_genre(normalized_genre, limit=songs_per_genre)
    log.info("Fetched %d songs from Deezer for genre: %s", len(songs), normalized_genre)
    
    inserted = 0
    updated = 0
    
    # Upsert each song to Postgres
    for song in songs:
        deezer_id = song.get("deezer_id")
        if not deezer_id:
            continue
        
        # Check if this is a new insert or update
        existing_id = await upsert_song(
            deezer_id=deezer_id,
            title=song.get("title", ""),
            artist=song.get("artist", ""),
            album=song.get("album"),
            genre=normalized_genre,
            cover_url=song.get("cover_url", ""),
            preview_url=song.get("preview_url"),
            duration=song.get("duration", 0),
        )
        
        if existing_id:
            # Check if it was newly created (would need a separate query, but for now assume update)
            # In a production system, you'd track this better
            updated += 1
        else:
            inserted += 1
    
    log.info("Ingestion complete for genre %s: %d inserted, %d updated", normalized_genre, inserted, updated)
    return inserted, updated


async def ingest_all_genres(genres: list[str] | None = None, songs_per_genre: int = SONGS_PER_GENRE) -> dict[str, tuple[int, int]]:
    """
    Ingest songs for all specified genres.
    
    Returns:
        Dict mapping genre -> (inserted_count, updated_count)
    """
    if genres is None:
        genres = ALL_GENRES
    
    results: dict[str, tuple[int, int]] = {}
    
    for genre in genres:
        try:
            inserted, updated = await ingest_genre(genre, songs_per_genre)
            results[genre] = (inserted, updated)
        except Exception as e:
            log.exception("Ingestion failed for genre %s: %s", genre, e)
            results[genre] = (0, 0)
    
    return results


async def ingest_single_song(song_data: dict[str, Any]) -> str | None:
    """
    Ingest a single song (useful for real-time additions).
    
    Returns:
        Song UUID if successful, None otherwise
    """
    deezer_id = song_data.get("deezer_id")
    if not deezer_id:
        return None
    
    genre = normalize_genre(song_data.get("genre", "all"))
    
    song_id = await upsert_song(
        deezer_id=str(deezer_id),
        title=song_data.get("title", ""),
        artist=song_data.get("artist", ""),
        album=song_data.get("album"),
        genre=genre,
        cover_url=song_data.get("cover_url", ""),
        preview_url=song_data.get("preview_url"),
        duration=song_data.get("duration", 0),
    )
    
    return song_id
