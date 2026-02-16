"""
Data ingestion script for music recommendation system.
Fetches chart tracks from the Deezer API, enriches with BPM, and adds mood/genre tags via Google Gemini.
"""

from __future__ import annotations

import os
import time
from typing import Any

import requests

try:
    from langchain_google_genai import ChatGoogleGenerativeAI
except ImportError:
    ChatGoogleGenerativeAI = None  # type: ignore[misc, assignment]

CHART_URL = "https://api.deezer.com/chart/0/tracks"
TRACK_URL = "https://api.deezer.com/track/{track_id}"
REQUEST_DELAY_SEC = 0.2
DEFAULT_TAGS = "Pop, General"
GEMINI_REQUEST_DELAY_SEC = 0.3


def _get_track_bpm(track_id: int) -> float | None:
    """Fetch BPM for a single track. Returns None on failure or if not available."""
    try:
        resp = requests.get(TRACK_URL.format(track_id=track_id), timeout=10)
        resp.raise_for_status()
        data = resp.json()
        return data.get("bpm")
    except (requests.RequestException, KeyError, TypeError):
        return None


def fetch_deezer_data(limit: int = 50) -> list[dict[str, Any]]:
    """
    Fetch chart tracks from Deezer API with selected fields and BPM.

    Fields per track: id, title, artist, image, preview_url, bpm.
    Uses a second request per track to get BPM, with a short delay to respect rate limits.

    Args:
        limit: Maximum number of tracks to return (default 50).

    Returns:
        List of dicts with keys: id, title, artist, image, preview_url, bpm.
    """
    result: list[dict[str, Any]] = []

    try:
        resp = requests.get(CHART_URL, params={"limit": limit}, timeout=10)
        resp.raise_for_status()
        payload = resp.json()
    except requests.RequestException as e:
        raise RuntimeError(f"Failed to fetch chart data: {e}") from e

    tracks = payload.get("data") or []
    if not isinstance(tracks, list):
        return result

    for i, track in enumerate(tracks):
        if i >= limit:
            break

        if not isinstance(track, dict):
            continue

        try:
            artist_name = None
            artist_obj = track.get("artist")
            if isinstance(artist_obj, dict):
                artist_name = artist_obj.get("name")

            image_url = None
            album_obj = track.get("album")
            if isinstance(album_obj, dict):
                image_url = album_obj.get("cover_medium")

            track_id = track.get("id")
            if track_id is None:
                continue

            # Delay before detail request to avoid rate limits
            if i > 0:
                time.sleep(REQUEST_DELAY_SEC)

            bpm = _get_track_bpm(int(track_id))

            result.append({
                "id": track_id,
                "title": track.get("title") or "",
                "artist": artist_name or "",
                "image": image_url or "",
                "preview_url": track.get("preview") or "",
                "bpm": bpm,
            })
        except (TypeError, ValueError):
            continue

    return result


def _get_tags_for_song(llm: Any, title: str, artist: str) -> str:
    """Call Gemini to generate mood/genre tags. Returns DEFAULT_TAGS on any failure."""
    prompt = (
        f"Generate 5 comma-separated mood/genre tags for the song '{title}' by '{artist}'. "
        "Output ONLY the tags."
    )
    try:
        response = llm.invoke(prompt)
        text = (response.content or "").strip() if hasattr(response, "content") else str(response).strip()
        return text if text else DEFAULT_TAGS
    except Exception:
        return DEFAULT_TAGS


def enrich_song_data(song_list: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """
    Enrich each song with mood/genre tags from Google Gemini.

    Adds a "tags" key to each song dict. Uses GOOGLE_API_KEY from the environment.
    On Gemini API errors or missing key, uses default tags "Pop, General" for that song.

    Args:
        song_list: List of song dicts with at least "title" and "artist" keys.

    Returns:
        The same list with each song updated with a "tags" key (in place and returned).
    """
    if ChatGoogleGenerativeAI is None:
        for song in song_list:
            song["tags"] = DEFAULT_TAGS
        return song_list

    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("DEBUG: API KEY NOT FOUND IN ENV")
        for song in song_list:
            song["tags"] = DEFAULT_TAGS
        return song_list

    try:
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=api_key,
        )
    except Exception:
        for song in song_list:
            song["tags"] = DEFAULT_TAGS
        return song_list

    for i, song in enumerate(song_list):
        if i > 0:
            time.sleep(GEMINI_REQUEST_DELAY_SEC)
        title = song.get("title") or ""
        artist = song.get("artist") or ""
        song["tags"] = _get_tags_for_song(llm, title, artist)

    return song_list


def main() -> None:
    """Example usage: fetch tracks, enrich with Gemini tags, and print a short summary."""
    print("Fetching Deezer chart data (limit=50)...")
    try:
        data = fetch_deezer_data(limit=50)
        print(f"Fetched {len(data)} tracks.")
        print("Enriching with Gemini mood/genre tags...")
        enrich_song_data(data)
        for i, t in enumerate(data[:3], 1):
            print(f"  {i}. {t['title']} — {t['artist']} (BPM: {t.get('bpm')}) Tags: {t.get('tags', '')}")
    except RuntimeError as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    main()
