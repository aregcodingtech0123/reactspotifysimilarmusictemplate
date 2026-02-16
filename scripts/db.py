"""
PostgreSQL database access layer for FastAPI.
Uses asyncpg for async database operations, sharing the same DATABASE_URL as Prisma.
"""

from __future__ import annotations

import os
import logging
from typing import Any
from datetime import datetime, timezone
from uuid import uuid4

try:
    import asyncpg
except ImportError:
    asyncpg = None  # type: ignore[assignment]

log = logging.getLogger("db")

_db_pool: asyncpg.Pool | None = None


async def get_db_pool() -> asyncpg.Pool | None:
    """Get or create the database connection pool."""
    global _db_pool
    if _db_pool is not None:
        return _db_pool
    
    if asyncpg is None:
        log.error("asyncpg not installed. Install with: pip install asyncpg")
        return None
    
    database_url = os.getenv("DATABASE_URL") or os.getenv("BACKEND_DATABASE_URL")
    if not database_url:
        log.error("DATABASE_URL not found in environment")
        return None
    
    try:
        # Parse DATABASE_URL (postgresql://user:pass@host:port/dbname)
        # asyncpg uses postgresql:// but Prisma uses postgresql://, so we keep it
        _db_pool = await asyncpg.create_pool(
            database_url,
            min_size=1,
            max_size=10,
            command_timeout=60,
        )
        log.info("Database connection pool created")
        return _db_pool
    except Exception as e:
        log.exception("Failed to create database pool: %s", e)
        return None


async def close_db_pool() -> None:
    """Close the database connection pool."""
    global _db_pool
    if _db_pool:
        await _db_pool.close()
        _db_pool = None
        log.info("Database connection pool closed")


async def upsert_song(
    deezer_id: str,
    title: str,
    artist: str,
    album: str | None,
    genre: str,
    cover_url: str,
    preview_url: str | None,
    duration: int,
) -> str | None:
    """
    Upsert a song by deezer_id. Returns the song's UUID if successful, None otherwise.
    """
    pool = await get_db_pool()
    if not pool:
        return None
    
    try:
        async with pool.acquire() as conn:
            # Check if song exists
            existing = await conn.fetchrow(
                "SELECT id FROM songs WHERE deezer_id = $1",
                deezer_id
            )
            
            if existing:
                # Update existing song
                song_id = existing["id"]
                await conn.execute(
                    """
                    UPDATE songs 
                    SET title = $1, artist = $2, album = $3, genre = $4, 
                        cover_url = $5, preview_url = $6, duration = $7, updated_at = NOW()
                    WHERE id = $8
                    """,
                    title, artist, album, genre, cover_url, preview_url, duration, song_id
                )
                return str(song_id)
            else:
                # Insert new song
                song_id = uuid4()
                await conn.execute(
                    """
                    INSERT INTO songs (id, deezer_id, title, artist, album, genre, 
                                     cover_url, preview_url, duration, created_at, updated_at)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
                    """,
                    song_id, deezer_id, title, artist, album, genre, cover_url, preview_url, duration
                )
                return str(song_id)
    except Exception as e:
        log.exception("upsert_song failed: %s", e)
        return None


async def get_song_by_id(song_id: str) -> dict[str, Any] | None:
    """Get a song by UUID."""
    pool = await get_db_pool()
    if not pool:
        return None
    
    try:
        async with pool.acquire() as conn:
            row = await conn.fetchrow(
                """
                SELECT id, deezer_id, title, artist, album, genre, cover_url, 
                       preview_url, duration, play_count, last_played_at, created_at
                FROM songs WHERE id = $1
                """,
                song_id
            )
            if not row:
                return None
            return dict(row)
    except Exception as e:
        log.exception("get_song_by_id failed: %s", e)
        return None


async def get_songs(
    genre: str | None = None,
    type: str | None = None,
    limit: int = 50,
    offset: int = 0,
) -> list[dict[str, Any]]:
    """
    Get songs with optional genre filter and type ordering.
    type: 'trending' (by play_count), 'discover' (random/least played), None (default)
    """
    pool = await get_db_pool()
    if not pool:
        return []
    
    try:
        async with pool.acquire() as conn:
            query = "SELECT id, deezer_id, title, artist, album, genre, cover_url, preview_url, duration, play_count FROM songs"
            conditions = []
            params: list[Any] = []
            param_idx = 1
            
            if genre and genre.lower() != "all":
                conditions.append(f"genre = ${param_idx}")
                params.append(genre.lower())
                param_idx += 1
            
            if conditions:
                query += " WHERE " + " AND ".join(conditions)
            
            # Ordering
            if type == "trending":
                query += " ORDER BY play_count DESC, last_played_at DESC NULLS LAST"
            elif type == "discover":
                query += " ORDER BY play_count ASC, RANDOM()"
            else:
                query += " ORDER BY created_at DESC"
            
            query += f" LIMIT ${param_idx} OFFSET ${param_idx + 1}"
            params.extend([limit, offset])
            
            rows = await conn.fetch(query, *params)
            return [dict(row) for row in rows]
    except Exception as e:
        log.exception("get_songs failed: %s", e)
        return []


async def get_trending_songs(genre: str | None = None, limit: int = 20) -> list[dict[str, Any]]:
    """Get trending songs ordered by play_count."""
    return await get_songs(genre=genre, type="trending", limit=limit)


async def get_discover_songs(genre: str | None = None, limit: int = 20) -> list[dict[str, Any]]:
    """Get discover songs (least played or random)."""
    return await get_songs(genre=genre, type="discover", limit=limit)


async def log_listen(song_id: str, user_id: str | None = None) -> bool:
    """
    Log a listen event. Increments play_count and updates last_played_at.
    Returns True if successful.
    """
    pool = await get_db_pool()
    if not pool:
        return False
    
    try:
        async with pool.acquire() as conn:
            async with conn.transaction():
                # Insert listen record
                listen_id = uuid4()
                await conn.execute(
                    """
                    INSERT INTO listens (id, user_id, song_id, played_at)
                    VALUES ($1, $2, $3, NOW())
                    """,
                    listen_id, user_id, song_id
                )
                
                # Update song play statistics
                await conn.execute(
                    """
                    UPDATE songs 
                    SET play_count = play_count + 1, last_played_at = NOW()
                    WHERE id = $1
                    """,
                    song_id
                )
                
                return True
    except Exception as e:
        log.exception("log_listen failed: %s", e)
        return False


async def get_listen_history(user_id: str | None = None, limit: int = 10) -> list[dict[str, Any]]:
    """
    Get listen history for a user, ordered by most recent.
    Returns list of songs with played_at timestamp.
    """
    pool = await get_db_pool()
    if not pool:
        return []
    
    try:
        async with pool.acquire() as conn:
            if user_id:
                query = """
                    SELECT DISTINCT ON (s.id) 
                        s.id, s.deezer_id, s.title, s.artist, s.album, s.genre,
                        s.cover_url, s.preview_url, s.duration, l.played_at
                    FROM listens l
                    JOIN songs s ON l.song_id = s.id
                    WHERE l.user_id = $1
                    ORDER BY s.id, l.played_at DESC
                    LIMIT $2
                """
                rows = await conn.fetch(query, user_id, limit)
                return [dict(row) for row in rows]
            else:
                # For anonymous users, return empty or use a cookie-based approach
                return []
    except Exception as e:
        log.exception("get_listen_history failed: %s", e)
        return []


async def get_song_count(genre: str | None = None) -> int:
    """Get total count of songs, optionally filtered by genre."""
    pool = await get_db_pool()
    if not pool:
        return 0
    
    try:
        async with pool.acquire() as conn:
            if genre and genre.lower() != "all":
                count = await conn.fetchval(
                    "SELECT COUNT(*) FROM songs WHERE genre = $1",
                    genre.lower()
                )
            else:
                count = await conn.fetchval("SELECT COUNT(*) FROM songs")
            return int(count) if count else 0
    except Exception as e:
        log.exception("get_song_count failed: %s", e)
        return 0
