"""
Enhanced Deezer API client for fetching songs by genre.
Fetches at least 100 songs per genre using Deezer's search and chart endpoints.
"""

from __future__ import annotations

import time
import logging
from typing import Any

import requests

log = logging.getLogger("deezer_client")

# Deezer API base URL
DEEZER_API_BASE = "https://api.deezer.com"
REQUEST_DELAY_SEC = 0.2  # Rate limiting

# Genre mapping: our genre names -> Deezer genre IDs or search terms
GENRE_MAPPING = {
    "all": None,  # Use charts
    "rock": 132,
    "pop": 132,  # Pop charts
    "jazz": 129,
    "hip hop": 116,
    "rap": 116,
    "electronic": 106,
    "r&b": 165,
    "indie": 85,
    "metal": 152,
    "classical": 98,
    "country": 84,
}

# Alternative: use search terms if genre IDs don't work well
GENRE_SEARCH_TERMS = {
    "all": None,
    "rock": "rock",
    "pop": "pop",
    "jazz": "jazz",
    "hip hop": "hip hop",
    "rap": "rap",
    "electronic": "electronic",
    "r&b": "r&b",
    "indie": "indie",
    "metal": "metal",
    "classical": "classical",
    "country": "country",
}


def normalize_genre(genre: str) -> str:
    """Normalize genre name to lowercase."""
    return genre.lower().strip()


def fetch_tracks_by_genre(genre: str, limit: int = 100) -> list[dict[str, Any]]:
    """
    Fetch tracks from Deezer API for a specific genre.
    
    Args:
        genre: Genre name (will be normalized)
        limit: Maximum number of tracks to fetch (default 100)
    
    Returns:
        List of normalized song dicts with keys: deezer_id, title, artist, album, genre, cover_url, preview_url, duration
    """
    normalized_genre = normalize_genre(genre)
    result: list[dict[str, Any]] = []
    
    if normalized_genre == "all":
        # Use chart endpoint for "all"
        return fetch_chart_tracks(limit=limit)
    
    # Try genre-specific chart first
    genre_id = GENRE_MAPPING.get(normalized_genre)
    if genre_id:
        try:
            chart_url = f"{DEEZER_API_BASE}/genre/{genre_id}/artists"
            resp = requests.get(chart_url, timeout=10)
            if resp.status_code == 200:
                # Get top artists for this genre, then their tracks
                data = resp.json()
                artists = data.get("data", [])[:10]  # Top 10 artists
                for artist in artists:
                    artist_id = artist.get("id")
                    if artist_id:
                        tracks = fetch_artist_top_tracks(artist_id, limit_per_artist=10)
                        result.extend(tracks)
                        if len(result) >= limit:
                            break
                        time.sleep(REQUEST_DELAY_SEC)
        except Exception as e:
            log.warning("Genre chart fetch failed for %s: %s", genre, e)
    
    # Fallback to search if we don't have enough tracks
    if len(result) < limit:
        search_term = GENRE_SEARCH_TERMS.get(normalized_genre, normalized_genre)
        if search_term:
            search_results = fetch_search_tracks(search_term, limit=limit - len(result))
            result.extend(search_results)
    
    # Normalize and deduplicate by deezer_id
    seen_ids = set()
    normalized_result = []
    for track in result:
        deezer_id = str(track.get("deezer_id") or track.get("id", ""))
        if deezer_id and deezer_id not in seen_ids:
            seen_ids.add(deezer_id)
            normalized_result.append(track)
            if len(normalized_result) >= limit:
                break
    
    return normalized_result[:limit]


def fetch_chart_tracks(limit: int = 100) -> list[dict[str, Any]]:
    """Fetch tracks from Deezer's global chart."""
    result: list[dict[str, Any]] = []
    
    try:
        # Fetch multiple pages to get enough tracks
        page = 0
        per_page = 25
        while len(result) < limit:
            resp = requests.get(
                f"{DEEZER_API_BASE}/chart/0/tracks",
                params={"index": page * per_page, "limit": per_page},
                timeout=10
            )
            resp.raise_for_status()
            data = resp.json()
            tracks = data.get("data", [])
            if not tracks:
                break
            
            for track in tracks:
                normalized = normalize_track(track, genre="all")
                if normalized:
                    result.append(normalized)
                    if len(result) >= limit:
                        break
            
            page += 1
            if page >= 10:  # Safety limit
                break
            time.sleep(REQUEST_DELAY_SEC)
    except Exception as e:
        log.exception("fetch_chart_tracks failed: %s", e)
    
    return result[:limit]


def fetch_artist_top_tracks(artist_id: int, limit_per_artist: int = 10) -> list[dict[str, Any]]:
    """Fetch top tracks for a specific artist."""
    result: list[dict[str, Any]] = []
    
    try:
        resp = requests.get(
            f"{DEEZER_API_BASE}/artist/{artist_id}/top",
            params={"limit": limit_per_artist},
            timeout=10
        )
        resp.raise_for_status()
        data = resp.json()
        tracks = data.get("data", [])
        
        for track in tracks:
            normalized = normalize_track(track)
            if normalized:
                result.append(normalized)
    except Exception as e:
        log.warning("fetch_artist_top_tracks failed for artist %d: %s", artist_id, e)
    
    return result


def fetch_search_tracks(query: str, limit: int = 100) -> list[dict[str, Any]]:
    """Search for tracks using Deezer search API."""
    result: list[dict[str, Any]] = []
    
    try:
        page = 0
        per_page = 25
        while len(result) < limit:
            resp = requests.get(
                f"{DEEZER_API_BASE}/search/track",
                params={"q": query, "index": page * per_page, "limit": per_page},
                timeout=10
            )
            resp.raise_for_status()
            data = resp.json()
            tracks = data.get("data", [])
            if not tracks:
                break
            
            for track in tracks:
                normalized = normalize_track(track)
                if normalized:
                    result.append(normalized)
                    if len(result) >= limit:
                        break
            
            page += 1
            if page >= 10:  # Safety limit
                break
            time.sleep(REQUEST_DELAY_SEC)
    except Exception as e:
        log.exception("fetch_search_tracks failed for query '%s': %s", query, e)
    
    return result[:limit]


def normalize_track(track: dict[str, Any], genre: str | None = None) -> dict[str, Any] | None:
    """
    Normalize a Deezer track object into our standard format.
    
    Returns:
        Dict with: deezer_id, title, artist, album, genre, cover_url, preview_url, duration
        or None if track is invalid
    """
    if not isinstance(track, dict):
        return None
    
    track_id = track.get("id")
    if not track_id:
        return None
    
    # Extract artist name
    artist_name = ""
    artist_obj = track.get("artist")
    if isinstance(artist_obj, dict):
        artist_name = artist_obj.get("name", "")
    
    # Extract album info
    album_name = ""
    cover_url = ""
    album_obj = track.get("album")
    if isinstance(album_obj, dict):
        album_name = album_obj.get("title", "")
        cover_url = album_obj.get("cover_medium") or album_obj.get("cover", "") or ""
    
    # Extract duration (in seconds)
    duration = track.get("duration", 0)  # Deezer returns duration in seconds
    
    # Extract preview URL
    preview_url = track.get("preview", "") or None
    
    # Determine genre from track or use provided
    track_genre = genre or "all"
    if not genre:
        # Try to get genre from album or use "all"
        if album_obj and isinstance(album_obj, dict):
            genre_obj = album_obj.get("genre")
            if isinstance(genre_obj, dict):
                genre_name = genre_obj.get("name", "")
                if genre_name:
                    track_genre = normalize_genre(genre_name)
    
    return {
        "deezer_id": str(track_id),
        "title": track.get("title", "") or "",
        "artist": artist_name,
        "album": album_name,
        "genre": track_genre,
        "cover_url": cover_url,
        "preview_url": preview_url,
        "duration": duration,
    }


def fetch_all_genres(genres: list[str], songs_per_genre: int = 100) -> dict[str, list[dict[str, Any]]]:
    """
    Fetch songs for multiple genres.
    
    Returns:
        Dict mapping genre -> list of normalized song dicts
    """
    result: dict[str, list[dict[str, Any]]] = {}
    
    for genre in genres:
        normalized = normalize_genre(genre)
        log.info("Fetching %d songs for genre: %s", songs_per_genre, normalized)
        songs = fetch_tracks_by_genre(normalized, limit=songs_per_genre)
        result[normalized] = songs
        log.info("Fetched %d songs for genre: %s", len(songs), normalized)
        time.sleep(REQUEST_DELAY_SEC * 2)  # Extra delay between genres
    
    return result
