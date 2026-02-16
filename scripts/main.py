"""
FastAPI app for music recommendation: /init, /listen, /recommend, /songs, /trending, /history.
Run from project root: uvicorn main:app --reload
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

# Ensure this directory is on path when loaded by root main.py
_scripts_dir = Path(__file__).resolve().parent
if str(_scripts_dir) not in sys.path:
    sys.path.insert(0, str(_scripts_dir))

from dotenv import load_dotenv
load_dotenv()
load_dotenv(dotenv_path=_scripts_dir / ".env")
load_dotenv(dotenv_path=_scripts_dir.parent / ".env")
# Load backend/.env so GOOGLE_API_KEY is found when running from project root
load_dotenv(dotenv_path=_scripts_dir.parent / "backend" / ".env")

import logging
import asyncio
import time
from contextlib import asynccontextmanager
from typing import Any

logging.basicConfig(level=logging.INFO, stream=sys.stdout, format="%(levelname)s [%(name)s] %(message)s")
log = logging.getLogger("main")

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from data_ingestion import fetch_deezer_data, enrich_song_data
from recommendation_engine import (
    Recommender,
    assign_primary_genre,
    compute_genre_vectors,
    HISTORY_SIZE,
    RECOMMEND_K,
    TRENDING_SIZE,
)
from vector_store import MusicVectorStore
from db import (
    get_db_pool,
    close_db_pool,
    get_songs as db_get_songs,
    get_trending_songs as db_get_trending_songs,
    get_discover_songs as db_get_discover_songs,
    get_song_by_id as db_get_song_by_id,
    log_listen as db_log_listen,
    get_listen_history as db_get_listen_history,
    get_song_count,
)
from ingest_songs import ingest_all_genres, ingest_genre

print("THIS BACKEND INSTANCE IS ACTIVE", flush=True)

# SAFE_MODE: Bypass all vector store and recommender logic, return mock data instantly
# Set to False to use real data from Postgres
SAFE_MODE = False
print(f"SAFE_MODE SET TO: {SAFE_MODE}", flush=True)

_store: MusicVectorStore | None = None
_recommender: Recommender | None = None
_initializing = False
_init_error: str | None = None


def _do_init(api_key_override: str | None = None) -> None:
    global _store, _recommender, _initializing, _init_error
    _initializing = True
    _init_error = None
    log.info("Init started.")
    effective_key = api_key_override or os.getenv("GOOGLE_API_KEY")
    if not effective_key:
        _initializing = False
        _init_error = "GOOGLE_API_KEY is missing. Set it in .env or pass ?api_key=YOUR_KEY to GET /init."
        return
    try:
        songs = fetch_deezer_data(limit=50)
        if not songs:
            log.warning("Deezer API returned 0 tracks – using seed songs.")
            songs = _get_seed_songs()
        else:
            enrich_song_data(songs)
        _store = MusicVectorStore()
        _store.add_songs(songs)
        count = _store.count()
        print("Chroma collection count after init:", count)
        log.info("Init OK. Store has %d songs.", count)
        if count == 0:
            log.warning("Store still empty after add_songs – seeding 2 test songs.")
            seed_songs = _get_seed_songs()
            _store.add_songs(seed_songs)
            inserted = _store.count()
            print("Seeded", len(seed_songs), "songs. New count:", inserted)
        count = _store.count()
        if count == 0:
            log.warning("Store still empty – retrying seed.")
            retry_seed = _get_seed_songs()
            _store.add_songs(retry_seed)
            print("Seeded", len(retry_seed), "songs. Count:", _store.count())
        print("FINAL COLLECTION COUNT:", _store.count(), flush=True)
        genre_vectors = compute_genre_vectors(effective_key)
        _recommender = Recommender(_store, genre_vectors=genre_vectors, history_size=HISTORY_SIZE)
    except Exception as e:
        _init_error = str(e)
        _store = None
        _recommender = None
        log.exception("Init failed: %s", e)
    finally:
        _initializing = False


def _get_seed_songs() -> list[dict[str, Any]]:
    """Return 2 minimal test songs when Deezer returns 0 or store would be empty."""
    return [
        {
            "id": "seed1",
            "title": "Test Song 1",
            "artist": "Test Artist",
            "image": "https://via.placeholder.com/200?text=Cover+1",
            "preview_url": "",
            "tags": "Pop, Test",
        },
        {
            "id": "seed2",
            "title": "Test Song 2",
            "artist": "Test Artist",
            "image": "https://via.placeholder.com/200?text=Cover+2",
            "preview_url": "",
            "tags": "Pop, Test",
        },
    ]


def _get_mock_songs() -> list[dict[str, Any]]:
    """Return mock songs in API format for SAFE_MODE. Never touches vector store or embeddings."""
    return [
        {
            "id": "mock1",
            "name": "Safe Mode Song 1",
            "artist": "Mock Artist",
            "preview_url": "",
            "image": "https://via.placeholder.com/200?text=Safe+1",
            "primary_genre": "Pop",
            "title": "Safe Mode Song 1",
            "tags": "Pop, Safe Mode",
        },
        {
            "id": "mock2",
            "name": "Safe Mode Song 2",
            "artist": "Mock Artist",
            "preview_url": "",
            "image": "https://via.placeholder.com/200?text=Safe+2",
            "primary_genre": "Rock",
            "title": "Safe Mode Song 2",
            "tags": "Rock, Safe Mode",
        },
        {
            "id": "mock3",
            "name": "Safe Mode Song 3",
            "artist": "Mock Band",
            "preview_url": "",
            "image": "https://via.placeholder.com/200?text=Safe+3",
            "primary_genre": "Jazz",
            "title": "Safe Mode Song 3",
            "tags": "Jazz, Safe Mode",
        },
        {
            "id": "mock4",
            "name": "Safe Mode Song 4",
            "artist": "Mock Band",
            "preview_url": "",
            "image": "https://via.placeholder.com/200?text=Safe+4",
            "primary_genre": "Electronic",
            "title": "Safe Mode Song 4",
            "tags": "Electronic, Safe Mode",
        },
        {
            "id": "mock5",
            "name": "Safe Mode Song 5",
            "artist": "Mock Solo",
            "preview_url": "",
            "image": "https://via.placeholder.com/200?text=Safe+5",
            "primary_genre": "Hip Hop",
            "title": "Safe Mode Song 5",
            "tags": "Hip Hop, Safe Mode",
        },
    ]


def get_store() -> MusicVectorStore | None:
    return _store


def _lazy_seed(store: MusicVectorStore) -> None:
    """If Chroma is empty, add 2 test songs so endpoints can return data."""
    if store.count() > 0:
        return
    try:
        log.warning("Chroma count is 0 – lazy seeding 2 test songs.")
        store.add_songs(_get_seed_songs())
        print("Seeded 2 test songs into Chroma. New count:", store.count())
    except Exception as e:
        log.exception("Lazy seed failed: %s", e)


def get_recommender() -> Recommender | None:
    return _recommender


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _store, _recommender, _initializing, _init_error
    # Initialize database connection pool
    await get_db_pool()
    
    # Wait for init to finish before accepting requests (so store exists when home page loads)
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, lambda: _do_init(api_key_override=None))
    if _store is not None:
        count = _store.count()
        if count == 0:
            print("Collection empty at startup – seeding.", flush=True)
            _lazy_seed(_store)
            print("Songs inserted by lazy_seed. Count:", _store.count(), flush=True)
        print("FINAL COLLECTION COUNT:", _store.count(), flush=True)
        print("Startup complete. Chroma count:", _store.count())
    elif _init_error:
        print("Startup complete but init failed:", _init_error)
    yield
    await close_db_pool()
    _store = None
    _recommender = None
    _initializing = False
    _init_error = None


app = FastAPI(title="Music Recommendation API", lifespan=lifespan, debug=True)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Log full traceback. For song endpoints return 200 + empty so API never 500s."""
    print("EXCEPTION PATH:", request.url.path, flush=True)
    log.error("Unhandled exception for %s %s: %s", request.method, request.url.path, exc, exc_info=True)
    print(f"[500] {request.method} {request.url.path}: {exc}", flush=True)
    import traceback
    traceback.print_exc()
    path = request.url.path.rstrip("/")
    if path in ("/api/songs", "/api/trending", "/api/recommend", "/api/history", "/api/recommendations") or path.startswith("/api/songs?") or path.startswith("/api/trending?") or path.startswith("/api/recommend?") or path.startswith("/api/recommendations?") or path.startswith("/api/history"):
        if "history" in path:
            return JSONResponse(status_code=200, content=[])
        return JSONResponse(status_code=200, content={"songs": []})
    return JSONResponse(
        status_code=500,
        content={
            "detail": str(exc),
            "type": type(exc).__name__,
        },
    )


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_request_time(request, call_next):
    """Log every request path and duration for performance debugging."""
    start = time.perf_counter()
    response = await call_next(request)
    duration = time.perf_counter() - start
    print(f"[DEBUG] {request.url.path} took {duration:.2f}s")
    return response


class ListenBody(BaseModel):
    song_id: str | int


@app.get("/api/debug")
async def debug():
    store = get_store()
    count = store.count() if store else 0
    return {"initializing": _initializing, "init_error": _init_error, "store_count": count, "has_recommender": get_recommender() is not None}


@app.get("/api/debug-chroma")
async def debug_chroma():
    """Return Chroma count and a sample of songs for diagnostics."""
    store = get_store()
    if store is None:
        return {"count": 0, "sample": [], "message": "Store not initialized"}
    count = store.count()
    print("Chroma count:", count)
    sample = store.get_all_songs()[:3]
    return {"count": count, "sample": sample}


@app.get("/api/init")
async def init_pipeline(api_key: str | None = None):
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, lambda: _do_init(api_key_override=api_key))
    if _init_error:
        raise HTTPException(status_code=400 if "GOOGLE_API_KEY is missing" in _init_error else 500, detail=_init_error)
    n = len(_store.get_all_songs()) if _store else 0
    return {"status": "ok", "message": f"Initialized with {n} songs."}


@app.post("/api/listen")
async def listen(body: ListenBody, request: Request):
    """
    Log a listen event. Updates Postgres and optionally updates recommender history.
    """
    try:
        # Extract user_id from JWT if available (for now, support anonymous)
        user_id = None
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            # TODO: Validate JWT and extract user_id
            # For now, we'll support anonymous listens
            pass
        
        # Log to Postgres
        song_id_str = str(body.song_id)
        success = await db_log_listen(song_id_str, user_id)
        
        # Also update recommender if available (for in-memory history)
        recommender = get_recommender()
        if recommender:
            try:
                recommender.log_listen(body.song_id)
            except Exception as e:
                log.warning("Recommender log_listen failed: %s", e)
        
        if success:
            return {"status": "ok", "song_id": body.song_id}
        else:
            return {"status": "error", "song_id": body.song_id, "message": "Failed to log listen"}
    except Exception as e:
        log.exception("listen endpoint failed: %s", e)
        return {"status": "error", "song_id": body.song_id, "message": str(e)}


def _to_recommendation_item(song: dict[str, Any]) -> dict[str, Any]:
    """
    Build a JSON-serializable dict for the API (ids and values as str/int/float only).
    Works with both old ChromaDB format and new Postgres format.
    """
    raw_id = song.get("id")
    id_val = str(raw_id) if raw_id is not None else ""
    title = song.get("title") or song.get("name") or ""
    artist = song.get("artist") or ""
    album = song.get("album") or ""
    genre = song.get("genre") or song.get("primary_genre") or ""
    cover_url = song.get("cover_url") or song.get("image") or ""
    preview_url = song.get("preview_url") or ""
    duration = song.get("duration", 0)
    
    return {
        "id": id_val,
        "name": str(title),
        "artist": str(artist),
        "album": str(album),
        "genre": str(genre),
        "preview_url": str(preview_url),
        "image": str(cover_url),
        "coverUrl": str(cover_url),  # Frontend expects coverUrl
        "primary_genre": str(genre),
        "title": str(title),
        "tags": str(song.get("tags") or ""),
        "duration": int(duration) if duration else 0,
    }


def _get_fallback_or_songs(store: MusicVectorStore | None, recommender: Any, genre: str | None, *, use_fallback_if_empty: bool = True):
    if store is None:
        log.warning("_get_fallback_or_songs: store is None – returning []")
        return []
    if use_fallback_if_empty and store.count() == 0:
        log.warning("_get_fallback_or_songs: store is empty – returning []")
        return []
    try:
        if recommender:
            gv = recommender.get_genre_vectors()
            out = store.get_all_songs_with_primary_genre(gv, assign_genre_fn=assign_primary_genre) if gv else store.get_all_songs()
        else:
            out = store.get_all_songs()
        if not out:
            out = store.get_all_songs()
        return [_to_recommendation_item(s) for s in out]
    except Exception as e:
        log.exception("_get_fallback_or_songs failed: %s", e)
        return []


def _genre_key(genre_vectors: dict, genre_param: str | None) -> str | None:
    if not genre_param or not str(genre_param).strip():
        return None
    clean = str(genre_param).strip()
    if clean.lower() == "all":
        return None
    for key in genre_vectors:
        if key.lower() == clean.lower():
            return key
    return None


@app.get("/api/history")
async def history(request: Request, limit: int = 10):
    """
    Get listen history for authenticated user. Returns last N distinct songs ordered by most recent.
    """
    if SAFE_MODE:
        print("SAFE MODE ACTIVE:", request.url.path, flush=True)
        return []
    start = time.perf_counter()
    try:
        # Extract user_id from JWT if available
        user_id = None
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            # TODO: Validate JWT and extract user_id
            # For now, return empty for anonymous users
            pass
        
        if not user_id:
            # Anonymous users: return empty or use cookie-based ID
            log.info("GET /history – anonymous user, returning []")
            return []
        
        # Get history from Postgres
        history_songs = await db_get_listen_history(user_id, limit=limit)
        
        # Convert to API format
        result = [_to_recommendation_item(song) for song in history_songs]
        
        log.info("GET /history – returning %d songs for user %s", len(result), user_id)
        print(f"[ENDPOINT /history] took {time.perf_counter() - start:.2f}s, returned {len(result)} songs")
        return result
    except Exception as e:
        log.exception("/history failed: %s", e)
        print(f"[ENDPOINT /history] took {time.perf_counter() - start:.2f}s, error: {e}", flush=True)
        return []


@app.get("/api/trending")
async def trending(request: Request, genre: str | None = None, limit: int = TRENDING_SIZE):
    """
    Get trending songs ordered by play_count DESC.
    Optionally filtered by genre.
    """
    if SAFE_MODE:
        print("SAFE MODE ACTIVE:", request.url.path, flush=True)
        return {"songs": _get_mock_songs()}
    print("TRENDING ROUTE HIT:", request.url.path, flush=True)
    start = time.perf_counter()
    try:
        # Normalize genre
        normalized_genre = None
        if genre and str(genre).strip().lower() != "all":
            normalized_genre = str(genre).strip().lower()
        
        # Get trending songs from Postgres
        songs = await db_get_trending_songs(genre=normalized_genre, limit=limit)
        
        # Convert to API format
        result = [_to_recommendation_item(song) for song in songs]
        
        log.info("GET /trending – returning %d songs (genre=%s)", len(result), normalized_genre or "all")
        print(f"[ENDPOINT /trending] took {time.perf_counter() - start:.2f}s, returned {len(result)} songs")
        return {"songs": result}
    except Exception as e:
        log.exception("/trending failed: %s", e)
        print(f"[ENDPOINT /trending] took {time.perf_counter() - start:.2f}s, error: {e}", flush=True)
        return {"songs": []}


@app.get("/api/recommend")
async def recommend(request: Request, genre: str | None = None):
    """
    AI-based recommendations: get last N listens, compute average embedding, query vector DB for similar songs.
    Excludes already listened songs and optionally filters by genre.
    """
    if SAFE_MODE:
        print("SAFE MODE ACTIVE:", request.url.path, flush=True)
        return {"songs": _get_mock_songs()}
    start = time.perf_counter()
    try:
        # Extract user_id from JWT if available
        user_id = None
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            # TODO: Validate JWT and extract user_id
            pass
        
        recommender = get_recommender()
        store = get_store()
        
        if recommender is None or store is None:
            # Fallback to trending if no recommender
            log.warning("GET /recommend – not initialized, falling back to trending")
            normalized_genre = None
            if genre and str(genre).strip().lower() != "all":
                normalized_genre = str(genre).strip().lower()
            songs = await db_get_trending_songs(genre=normalized_genre, limit=RECOMMEND_K)
            result = [_to_recommendation_item(song) for song in songs]
            return {"songs": result}
        
        # Get listen history from Postgres
        listen_history = []
        if user_id:
            listen_history = await db_get_listen_history(user_id, limit=HISTORY_SIZE)
        
        # If no history, fallback to trending
        if not listen_history:
            log.info("GET /recommend – no history, falling back to trending")
            normalized_genre = None
            if genre and str(genre).strip().lower() != "all":
                normalized_genre = str(genre).strip().lower()
            songs = await db_get_trending_songs(genre=normalized_genre, limit=RECOMMEND_K)
            result = [_to_recommendation_item(song) for song in songs]
            return {"songs": result}
        
        # Get embeddings for listened songs and compute average
        listened_song_ids = {str(song.get("id")) for song in listen_history}
        embeddings_list = []
        for song in listen_history:
            song_id = str(song.get("id"))
            emb = store.get_embedding_for_song(song_id)
            if emb:
                embeddings_list.append(emb)
        
        if not embeddings_list:
            # No embeddings found, fallback to trending
            log.info("GET /recommend – no embeddings found, falling back to trending")
            normalized_genre = None
            if genre and str(genre).strip().lower() != "all":
                normalized_genre = str(genre).strip().lower()
            songs = await db_get_trending_songs(genre=normalized_genre, limit=RECOMMEND_K)
            result = [_to_recommendation_item(song) for song in songs]
            return {"songs": result}
        
        # Compute average embedding
        try:
            import numpy as np
            avg_embedding = np.mean(embeddings_list, axis=0).tolist()
        except ImportError:
            log.warning("numpy not available, using first embedding")
            avg_embedding = embeddings_list[0]
        
        # Query vector store for similar songs
        similar_docs = store.similarity_search_by_vector(avg_embedding, k=RECOMMEND_K + len(listened_song_ids))
        
        # Convert to song format and filter out listened songs
        result: list[dict[str, Any]] = []
        seen_ids = set(listened_song_ids)
        
        for doc in similar_docs:
            meta = getattr(doc, "metadata", None) or {}
            song_id = str(meta.get("id") or "")
            if song_id and song_id not in seen_ids:
                seen_ids.add(song_id)
                # Get full song data from Postgres
                song_data = await db_get_song_by_id(song_id)
                if song_data:
                    result.append(_to_recommendation_item(song_data))
                elif meta:
                    # Fallback to metadata if Postgres lookup fails
                    result.append(_to_recommendation_item({
                        "id": song_id,
                        "title": meta.get("name") or "",
                        "artist": meta.get("artist") or "",
                        "album": meta.get("album") or "",
                        "genre": meta.get("genre") or "",
                        "cover_url": meta.get("image") or "",
                        "preview_url": meta.get("preview_url") or "",
                    }))
                if len(result) >= RECOMMEND_K:
                    break
        
        # Apply genre filter if specified
        normalized_genre = None
        if genre and str(genre).strip().lower() != "all":
            normalized_genre = str(genre).strip().lower()
            result = [s for s in result if (s.get("genre") or "").lower() == normalized_genre]
        
        # If not enough results, fill with trending
        if len(result) < RECOMMEND_K:
            trending = await db_get_trending_songs(genre=normalized_genre, limit=RECOMMEND_K - len(result))
            trending_ids = {str(s.get("id")) for s in trending}
            for song in trending:
                song_id = str(song.get("id"))
                if song_id not in seen_ids and song_id not in trending_ids:
                    result.append(_to_recommendation_item(song))
                    if len(result) >= RECOMMEND_K:
                        break
        
        log.info("GET /recommend – returning %d songs (genre=%s)", len(result), normalized_genre or "all")
        print(f"[ENDPOINT /recommend] took {time.perf_counter() - start:.2f}s, returned {len(result)} songs")
        return {"songs": result[:RECOMMEND_K]}
    except Exception as e:
        log.exception("/recommend failed: %s", e)
        print(f"[ENDPOINT /recommend] took {time.perf_counter() - start:.2f}s, error: {e}", flush=True)
        # Fallback to trending on error
        try:
            normalized_genre = None
            if genre and str(genre).strip().lower() != "all":
                normalized_genre = str(genre).strip().lower()
            songs = await db_get_trending_songs(genre=normalized_genre, limit=RECOMMEND_K)
            result = [_to_recommendation_item(song) for song in songs]
            return {"songs": result}
        except Exception:
            return {"songs": []}


@app.get("/api/recommendations")
async def recommendations(request: Request, genre: str | None = None):
    return await recommend(request, genre)


@app.get("/api/songs")
async def get_songs(
    request: Request,
    genre: str | None = None,
    type: str | None = None,
    limit: int = 50,
    offset: int = 0,
):
    """
    Get songs with optional genre filter and type ordering.
    type: 'trending' (by play_count), 'discover' (random/least played), None (default: latest)
    """
    if SAFE_MODE:
        print("SAFE MODE ACTIVE:", request.url.path, flush=True)
        return {"songs": _get_mock_songs()}
    print("REQUEST HIT:", request.url.path, flush=True)
    start = time.perf_counter()
    try:
        # Normalize genre
        normalized_genre = None
        if genre and str(genre).strip().lower() != "all":
            normalized_genre = str(genre).strip().lower()
        
        # Get songs from Postgres
        songs = await db_get_songs(
            genre=normalized_genre,
            type=type,
            limit=limit,
            offset=offset,
        )
        
        # Convert to API format
        result = [_to_recommendation_item(song) for song in songs]
        
        log.info("GET /songs – returning %d songs (genre=%s, type=%s)", len(result), normalized_genre or "all", type or "default")
        print(f"[ENDPOINT /songs] took {time.perf_counter() - start:.2f}s, returned {len(result)} songs")
        return {"songs": result}
    except Exception as e:
        log.exception("/songs failed: %s", e)
        print(f"[ENDPOINT /songs] took {time.perf_counter() - start:.2f}s, error: {e}", flush=True)
        return {"songs": []}


@app.get("/api/songs/{song_id}")
async def get_song_by_id(song_id: str):
    """Get a single song by ID."""
    try:
        song = await db_get_song_by_id(song_id)
        if not song:
            raise HTTPException(status_code=404, detail="Song not found")
        return _to_recommendation_item(song)
    except HTTPException:
        raise
    except Exception as e:
        log.exception("get_song_by_id failed: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/admin/deezer/refresh")
async def refresh_deezer_data(genre: str | None = None):
    """
    Admin endpoint to trigger Deezer ingestion for a specific genre or all genres.
    Fetches songs from Deezer, upserts to Postgres, and triggers embedding.
    """
    try:
        store = get_store()
        if not store:
            raise HTTPException(status_code=503, detail="Vector store not initialized")
        
        # Ingest songs
        if genre:
            inserted, updated = await ingest_genre(genre)
            total = inserted + updated
        else:
            results = await ingest_all_genres()
            total = sum(ins + upd for ins, upd in results.values())
        
        # After ingestion, index new songs into vector store (batched)
        # Get all songs from Postgres and index them in batches of 100
        all_songs = await db_get_songs(limit=10000)  # Get all songs
        if all_songs:
            BATCH_SIZE = 100
            total_indexed = 0
            for i in range(0, len(all_songs), BATCH_SIZE):
                batch = all_songs[i:i + BATCH_SIZE]
                try:
                    store.index_songs(batch)
                    total_indexed += len(batch)
                    log.info("Indexed batch %d: %d songs (total: %d/%d)", i//BATCH_SIZE + 1, len(batch), total_indexed, len(all_songs))
                except Exception as e:
                    log.warning("Failed to index batch %d: %s", i//BATCH_SIZE + 1, e)
            log.info("Indexed %d songs into vector store", total_indexed)
        
        return {
            "status": "ok",
            "message": f"Ingested {total} songs",
            "genre": genre or "all",
            "vector_store_count": store.count(),
        }
    except Exception as e:
        log.exception("refresh_deezer_data failed: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/discover")
async def discover(request: Request, genre: str | None = None, limit: int = 20):
    """
    Discover more songs: returns random songs or less frequently played songs.
    """
    if SAFE_MODE:
        print("SAFE MODE ACTIVE:", request.url.path, flush=True)
        return {"songs": _get_mock_songs()}
    
    try:
        normalized_genre = None
        if genre and str(genre).strip().lower() != "all":
            normalized_genre = str(genre).strip().lower()
        
        # Get discover songs (random/least played)
        songs = await db_get_discover_songs(genre=normalized_genre, limit=limit)
        
        result = [_to_recommendation_item(song) for song in songs]
        return {"songs": result}
    except Exception as e:
        log.exception("/discover failed: %s", e)
        return {"songs": []}
