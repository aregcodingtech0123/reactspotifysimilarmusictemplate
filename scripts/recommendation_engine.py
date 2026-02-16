"""
Genre vectors and recommender: user history (song_id, embedding, played_at), recommend by centroid.
"""
from __future__ import annotations

import logging
import os
from datetime import datetime, timezone
from typing import Any

try:
    import numpy as np
except ImportError:
    np = None  # type: ignore[assignment]

log = logging.getLogger("recommendation_engine")

EMBEDDING_MODEL = "models/gemini-embedding-001"
GENRE_PROTOTYPES = [
    "Rock", "Pop", "Jazz", "Hip Hop", "Rap", "Electronic", "Classical",
    "R&B", "Indie", "Metal", "Country", "Folk", "Reggae", "Latin", "Soul",
]
HISTORY_SIZE = 10
TRENDING_SIZE = 20
RECOMMEND_K = 20


def _cosine_similarity(a: Any, b: Any) -> float:
    if np is None:
        return 0.0
    na = np.linalg.norm(a)
    nb = np.linalg.norm(b)
    if na == 0 or nb == 0:
        return 0.0
    return float(np.dot(a, b) / (na * nb))


def compute_genre_vectors(api_key: str | None = None) -> dict[str, list[float]]:
    key = api_key or os.getenv("GOOGLE_API_KEY")
    if not key:
        return {}
    try:
        from google import genai
        from google.genai import types
        client = genai.Client(api_key=key)
        result = client.models.embed_content(
            model=EMBEDDING_MODEL,
            contents=GENRE_PROTOTYPES,
            config=types.EmbedContentConfig(task_type="SEMANTIC_SIMILARITY"),
        )
        out: dict[str, list[float]] = {}
        if result.embeddings and len(result.embeddings) == len(GENRE_PROTOTYPES):
            for genre, emb in zip(GENRE_PROTOTYPES, result.embeddings):
                if emb and emb.values:
                    out[genre] = list(emb.values)
        return out
    except Exception as e:
        log.exception("genre_vectors failed: %s", e)
        return {}


def assign_primary_genre(song_embedding: list[float], genre_vectors: dict[str, list[float]]) -> str:
    if not genre_vectors or not song_embedding:
        return "Unknown"
    if np is None:
        return "Unknown"
    arr = np.array(song_embedding, dtype=np.float64)
    best_genre, best_sim = "Unknown", -2.0
    for genre, vec in genre_vectors.items():
        sim = _cosine_similarity(arr, np.array(vec, dtype=np.float64))
        if sim > best_sim:
            best_sim, best_genre = sim, genre
    return best_genre


class Recommender:
    def __init__(
        self,
        db: Any,
        genre_vectors: dict[str, list[float]] | None = None,
        history_size: int = HISTORY_SIZE,
    ) -> None:
        self._db = db
        self._history_size = history_size
        self._history: list[tuple[Any, list[float], datetime]] = []
        self._genre_vectors = genre_vectors or {}

    def set_genre_vectors(self, genre_vectors: dict[str, list[float]]) -> None:
        self._genre_vectors = genre_vectors

    def log_listen(self, song_id: Any) -> None:
        if self._db is None:
            return
        try:
            embedding = self._db.get_embedding_for_song(song_id)
        except Exception as e:
            log.warning("log_listen get_embedding_for_song failed: %s", e)
            return
        if embedding is None:
            return
        played_at = datetime.now(timezone.utc)
        self._history.append((song_id, embedding, played_at))
        if len(self._history) > self._history_size:
            self._history = self._history[-self._history_size :]

    def get_history_ids(self) -> set[Any]:
        return {sid for (sid, _, _) in self._history}

    def get_history_song_ids_ordered(self, limit: int = 10) -> list[Any]:
        return [sid for (sid, _, _) in reversed(self._history)][:limit]

    def get_history_with_timestamps(self, limit: int = 20) -> list[tuple[Any, datetime]]:
        return [(sid, pt) for (sid, _, pt) in reversed(self._history)][:limit]

    def get_genre_vectors(self) -> dict[str, list[float]]:
        return self._genre_vectors

    def recommend_next(
        self,
        k: int = RECOMMEND_K,
        trending_fallback: list[dict[str, Any]] | None = None,
    ) -> list[dict[str, Any]]:
        if self._db is None:
            return (trending_fallback[:k] if trending_fallback and isinstance(trending_fallback, list) else [])
        if not getattr(self._db, "embeddings_enabled", True):
            return (trending_fallback[:k] if trending_fallback and isinstance(trending_fallback, list) else [])
        if not self._history and trending_fallback is not None:
            return (trending_fallback[:k] if isinstance(trending_fallback, list) else [])
        if not self._history:
            try:
                all_songs = self._db.get_all_songs() if hasattr(self._db, "get_all_songs") else []
            except Exception as e:
                log.warning("recommend_next get_all_songs failed: %s", e)
                return (trending_fallback[:k] if trending_fallback else [])
            return all_songs[:k]
        if np is None:
            return trending_fallback[:k] if trending_fallback else []
        try:
            vectors = np.array([v for (_, v, _) in self._history], dtype=np.float64)
            centroid = np.mean(vectors, axis=0).tolist()
            history_ids = self.get_history_ids()
            fetch_k = k + len(history_ids)
            docs = self._db.similarity_search_by_vector(centroid, k=fetch_k)
        except Exception as e:
            log.warning("recommend_next similarity_search_by_vector failed: %s", e)
            return (trending_fallback[:k] if trending_fallback else [])
        seen: set[Any] = set()
        out: list[dict[str, Any]] = []
        for doc in docs or []:
            meta = getattr(doc, "metadata", None) or {}
            sid = meta.get("id")
            if sid is None or sid in history_ids or sid in seen:
                continue
            seen.add(sid)
            out.append({
                "id": sid,
                "title": meta.get("name") or "",
                "artist": meta.get("artist") or "",
                "image": meta.get("image") or "",
                "preview_url": meta.get("preview_url") or "",
                "tags": meta.get("tags") or "",
                "primary_genre": meta.get("primary_genre") or "",
            })
            if len(out) >= k:
                break
        return out
