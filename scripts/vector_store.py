"""
Vector store for enriched song data using ChromaDB and Google Gemini embeddings.
Uses the official Gemini SDK (google-genai) and v1 API — no Vertex paths (publishers/google/...).
"""

from __future__ import annotations

import logging
import os
import traceback
from typing import Any

import chromadb

log = logging.getLogger("vector_store")
from google import genai
from google.genai import types
from langchain_chroma import Chroma
from langchain_core.documents import Document
from langchain_core.embeddings import Embeddings

PERSIST_DIR = "./music_db"
COLLECTION_NAME = "music"
# Chroma get() without limit returns only ~10 items; use explicit limit to get full catalog.
GET_ALL_LIMIT = 2000


# text-embedding-004 is widely supported; gemini-embedding-001 can 404 in some regions/SDK versions
_EMBEDDING_MODEL = "text-embedding-004"

_VALID_EMBEDDING_MODELS = frozenset({
    "text-embedding-004", "models/text-embedding-004",
    "models/gemini-embedding-001", "gemini-embedding-001",
})


def _normalize_embedding_model_from_env() -> str:
    """If EMBEDDING_MODEL is set, use it; otherwise use default (text-embedding-004)."""
    raw = os.getenv("EMBEDDING_MODEL", "").strip()
    if not raw:
        return _EMBEDDING_MODEL
    normalized = raw.replace("publishers/google/models/", "").replace("models/", "").strip()
    if normalized in _VALID_EMBEDDING_MODELS:
        return raw
    if normalized == "gemini-embedding-001":
        return "models/gemini-embedding-001"
    return _EMBEDDING_MODEL


def _log_available_embedding_models(api_key: str) -> None:
    """List embedding-capable models via the new Gemini SDK (google-genai)."""
    try:
        client = genai.Client(api_key=api_key)
        for m in client.models.list():
            name = getattr(m, "name", None) or ""
            if name and "embedding" in name.lower():
                print(f"Available Embedding Model: {name}")
    except ImportError:
        print("google-genai not installed; skip listing embedding models.")
    except Exception as e:
        print(f"Could not list embedding models: {e}")


class GeminiEmbeddings(Embeddings):
    """Embeddings using the new Gemini SDK (google-genai). Uses default API version (v1beta) for embedContent."""

    def __init__(self, *, api_key: str, model: str = _EMBEDDING_MODEL) -> None:
        self._model = model
        # Do not set api_version: SDK default is v1beta for API-key clients; embedContent is supported there.
        self._client = genai.Client(api_key=api_key)

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        """
        Embed documents in batches of 100 (Gemini API limit).
        """
        if not texts:
            return []
        
        # Gemini API allows max 100 items per batch
        BATCH_SIZE = 100
        out: list[list[float]] = []
        
        for i in range(0, len(texts), BATCH_SIZE):
            batch = texts[i:i + BATCH_SIZE]
            try:
                result = self._client.models.embed_content(
                    model=self._model,
                    contents=batch,
                    config=types.EmbedContentConfig(task_type="RETRIEVAL_DOCUMENT"),
                )
                for e in result.embeddings or []:
                    vals = e.values if e else None
                    out.append(list(vals) if vals else [])
            except Exception as e:
                log.exception("embed_documents failed for batch %d-%d: %s", i, i + len(batch), e)
                # Add empty embeddings for failed batch to maintain list length
                out.extend([[] for _ in batch])
        
        return out

    def embed_query(self, text: str) -> list[float]:
        try:
            result = self._client.models.embed_content(
                model=self._model,
                contents=text,
                config=types.EmbedContentConfig(task_type="RETRIEVAL_QUERY"),
            )
            if result.embeddings and len(result.embeddings) > 0 and result.embeddings[0].values:
                return list(result.embeddings[0].values)
        except Exception as e:
            log.exception("embed_query failed: %s", e)
        return []


def build_song_text(song: dict[str, Any]) -> str:
    """
    Build unified text representation for embedding: "{title} {artist} {album} {genre}".
    Works with both old format (id, title, artist, tags) and new Postgres format.
    """
    title = song.get("title") or song.get("name") or ""
    artist = song.get("artist") or ""
    album = song.get("album") or ""
    genre = song.get("genre") or song.get("primary_genre") or ""
    
    # Build text representation
    parts = [title, artist, album, genre]
    text = " ".join(p for p in parts if p)
    return text


def _song_to_document(song: dict[str, Any]) -> Document:
    """
    Build a LangChain Document from a song dict: page_content for search, metadata for retrieval.
    Supports both old format and new Postgres format.
    """
    title = song.get("title") or song.get("name") or ""
    artist = song.get("artist") or ""
    album = song.get("album") or ""
    genre = song.get("genre") or song.get("primary_genre") or ""
    bpm = song.get("bpm")
    bpm_str = str(bpm) if bpm is not None else ""
    tags = song.get("tags") or ""
    
    # Use unified text representation for embedding
    page_content = build_song_text(song)
    if bpm_str:
        page_content += f" BPM: {bpm_str}"
    if tags:
        page_content += f" Tags: {tags}"

    # Get song ID (could be UUID string or deezer_id)
    song_id = song.get("id") or song.get("deezer_id") or ""
    
    metadata = {
        "id": str(song_id),
        "deezer_id": str(song.get("deezer_id") or song_id),
        "preview_url": song.get("preview_url") or "",
        "image": song.get("image") or song.get("cover_url") or "",
        "name": title,
        "artist": artist,
        "album": album or "",
        "genre": genre,
        "tags": tags,
    }

    return Document(page_content=page_content, metadata=metadata)


class MusicVectorStore:
    """
    ChromaDB-backed vector store for songs with Google Gemini embeddings.
    Persists to ./music_db via PersistentClient (avoids nofile/Settings errors).
    """

    def __init__(
        self,
        persist_directory: str = PERSIST_DIR,
        collection_name: str = COLLECTION_NAME,
        api_key: str | None = None,
    ) -> None:
        self._vector_store = None
        self._embeddings = None
        self._persist_directory = persist_directory
        self._collection_name = collection_name
        self.embeddings_enabled = False
        api_key = api_key or os.getenv("GOOGLE_API_KEY")
        if not api_key:
            log.warning("Embeddings disabled (no API key)")
            self.embeddings_enabled = False
            self._vector_store = None
            return
        is_dev = (
            os.getenv("ENV") == "development"
            or os.getenv("ENVIRONMENT") == "development"
        )
        if is_dev:
            log.warning("Embeddings disabled (development environment)")
            self.embeddings_enabled = False
            self._vector_store = None
            return
        self.embeddings_enabled = True
        persist_path = os.path.abspath(persist_directory)
        try:
            os.makedirs(persist_path, exist_ok=True)
        except Exception as e:
            log.exception("Failed to create persist directory: %s", e)
            self._vector_store = None
            return
        try:
            _log_available_embedding_models(api_key)
            model = _normalize_embedding_model_from_env()
            print(f"Using embedding model: {model}")
            self._embeddings = GeminiEmbeddings(api_key=api_key, model=model)
            persistent_client = chromadb.PersistentClient(path=persist_path)
            
            # Check if collection exists and has wrong dimension
            try:
                existing_collection = persistent_client.get_collection(name=collection_name)
                # Get embedding dimension from a test embedding
                test_emb = self._embeddings.embed_query("test")
                expected_dim = len(test_emb) if test_emb else 3072
                
                # Check collection metadata for dimension mismatch
                # If mismatch, delete and recreate
                try:
                    # Try to get one item to check dimension
                    sample = existing_collection.get(limit=1, include=["embeddings"])
                    if sample.get("embeddings") and len(sample["embeddings"]) > 0:
                        actual_dim = len(sample["embeddings"][0])
                        if actual_dim != expected_dim:
                            log.warning(
                                "Collection dimension mismatch: expected %d, got %d. Deleting old collection.",
                                expected_dim, actual_dim
                            )
                            persistent_client.delete_collection(name=collection_name)
                except Exception:
                    # Collection might be empty or error, continue
                    pass
            except Exception:
                # Collection doesn't exist, that's fine
                pass
            
            self._vector_store = Chroma(
                client=persistent_client,
                embedding_function=self._embeddings,
                collection_name=collection_name,
            )
        except Exception as e:
            log.exception("Chroma/vector store initialization failed: %s", e)
            traceback.print_exc()
            self._vector_store = None

    def add_songs(self, songs_list: list[dict[str, Any]]) -> None:
        """
        Convert each song to a Document and add to the vector store.
        page_content: "{title} {artist} {album} {genre}"
        metadata: id, deezer_id, preview_url, image, name, artist, album, genre, tags.
        """
        if not getattr(self, "embeddings_enabled", True):
            log.debug("add_songs: embeddings disabled, skipping")
            return
        if not songs_list:
            log.warning("add_songs called with empty list")
            return
        if self._vector_store is None:
            log.warning("add_songs: vector store not initialized, skipping")
            return
        try:
            documents = [_song_to_document(s) for s in songs_list]
            log.info("Adding %d documents to Chroma (embedding with %s)", len(documents), getattr(self._embeddings, "_model", "gemini-embedding-004"))
            self._vector_store.add_documents(documents)
            n = self.count()
            log.info("Chroma count after add_songs: %d", n)
        except Exception as e:
            log.exception("add_songs failed (embedding or Chroma): %s", e)

    def index_songs(self, songs: list[dict[str, Any]]) -> None:
        """
        Index a list of songs from Postgres into the vector store.
        Alias for add_songs for consistency with plan naming.
        """
        self.add_songs(songs)

    def index_song(self, song: dict[str, Any]) -> None:
        """
        Index a single song from Postgres into the vector store.
        """
        self.add_songs([song])

    def get_retriever(self, **kwargs: Any):
        """Return a LangChain retriever over the music vector store for similarity search."""
        if not getattr(self, "embeddings_enabled", True):
            log.debug("get_retriever: embeddings disabled")
            return None
        if self._vector_store is None:
            log.debug("get_retriever: no collection")
            return None
        try:
            return self._vector_store.as_retriever(**kwargs)
        except Exception as e:
            log.warning("get_retriever failed: %s", e)
            return None

    def get_embedding_for_song(self, song_id: Any) -> list[float] | None:
        """Return the stored embedding vector for a song by its id, or None if not found."""
        if not getattr(self, "embeddings_enabled", True):
            return None
        if self._vector_store is None:
            log.debug("get_embedding_for_song: no collection")
            return None
        collection = getattr(self._vector_store, "_collection", None)
        if collection is None:
            log.debug("get_embedding_for_song: no collection")
            return None
        try:
            # Chroma where: simple equality where={"id": value} or explicit $eq
            result = collection.get(where={"id": song_id}, include=["embeddings"])
            if result and result.get("embeddings") and len(result["embeddings"]) > 0:
                emb = result["embeddings"][0]
                log.debug("get_embedding_for_song: found embedding for id=%s dim=%d", song_id, len(emb) if emb else 0)
                return emb
            log.debug("get_embedding_for_song: no document for id=%s", song_id)
        except Exception as e:
            log.warning("get_embedding_for_song failed for id=%s: %s", song_id, e)
        return None

    def count(self) -> int:
        """Return the number of documents in the store. Safe when collection is empty or missing."""
        if self._vector_store is None:
            return 0
        collection = getattr(self._vector_store, "_collection", None)
        if collection is None:
            return 0
        try:
            result = collection.get(include=[], limit=GET_ALL_LIMIT)
            ids = result.get("ids") or []
            return len(ids)
        except Exception:
            return 0

    def similarity_search_by_vector(self, embedding: list[float], k: int = 5):
        """Return the k nearest documents to the given embedding vector. Returns [] if DB is empty."""
        if not getattr(self, "embeddings_enabled", True):
            return []
        if self._vector_store is None:
            return []
        collection = getattr(self._vector_store, "_collection", None)
        if collection is None:
            return []
        if self.count() == 0:
            return []
        try:
            return self._vector_store.similarity_search_by_vector(embedding, k=k)
        except Exception as e:
            log.warning("similarity_search_by_vector failed: %s", e)
            return []

    def get_songs_by_vector(
        self,
        embedding: list[float],
        k: int = 30,
        primary_genre_label: str = "",
    ) -> list[dict[str, Any]]:
        """
        Semantic genre filter: query Chroma by genre prototype embedding, return nearest songs.
        Used for ?genre=Rock etc. primary_genre_label is the requested genre (e.g. "Rock").
        """
        if not getattr(self, "embeddings_enabled", True):
            return []
        if self._vector_store is None:
            return []
        docs = self.similarity_search_by_vector(embedding, k=k)
        out: list[dict[str, Any]] = []
        for doc in docs:
            meta = getattr(doc, "metadata", None) or {}
            if not isinstance(meta, dict):
                continue
            out.append({
                "id": meta.get("id"),
                "title": meta.get("name") or "",
                "artist": meta.get("artist") or "",
                "image": meta.get("image") or "",
                "preview_url": meta.get("preview_url") or "",
                "tags": meta.get("tags") or "",
                "primary_genre": primary_genre_label,
            })
        return out

    def get_all_songs(self) -> list[dict[str, Any]]:
        """
        Return all documents in the ChromaDB as a list of song dicts.
        Each dict has: id, title, artist, image, preview_url, tags.
        """
        if self._vector_store is None:
            return []
        collection = getattr(self._vector_store, "_collection", None)
        if collection is None:
            return []
        try:
            result = collection.get(include=["metadatas"], limit=GET_ALL_LIMIT)
            ids = result.get("ids") or []
            metadatas = result.get("metadatas") or []
            out: list[dict[str, Any]] = []
            for i, meta in enumerate(metadatas):
                if not isinstance(meta, dict):
                    continue
                out.append({
                    "id": meta.get("id"),
                    "title": meta.get("name") or "",
                    "artist": meta.get("artist") or "",
                    "image": meta.get("image") or "",
                    "preview_url": meta.get("preview_url") or "",
                    "tags": meta.get("tags") or "",
                })
            log.debug("get_all_songs: got %d from Chroma (ids=%d)", len(out), len(ids))
            return out
        except Exception as e:
            log.warning("get_all_songs failed: %s", e)
            return []

    def get_all_songs_with_primary_genre(
        self,
        genre_vectors: dict[str, list[float]],
        assign_genre_fn: Any,
    ) -> list[dict[str, Any]]:
        """
        Return all songs with primary_genre set by vector similarity to genre_vectors.
        assign_genre_fn(song_embedding, genre_vectors) -> genre_name.
        Chroma embeddings are 3072 (gemini-embedding-004).
        """
        if not getattr(self, "embeddings_enabled", True):
            return []
        if not genre_vectors:
            return self.get_all_songs()
        if self._vector_store is None:
            return []
        collection = getattr(self._vector_store, "_collection", None)
        if collection is None:
            return []
        try:
            result = collection.get(include=["metadatas", "embeddings"], limit=GET_ALL_LIMIT)
            metadatas = result.get("metadatas") or []
            embeddings_list = result.get("embeddings") or []
            out: list[dict[str, Any]] = []
            for i, meta in enumerate(metadatas):
                if not isinstance(meta, dict):
                    continue
                emb = embeddings_list[i] if i < len(embeddings_list) else None
                primary_genre = "Unknown"
                if emb and assign_genre_fn and genre_vectors:
                    try:
                        primary_genre = assign_genre_fn(emb, genre_vectors)
                    except Exception:
                        pass
                out.append({
                    "id": meta.get("id"),
                    "title": meta.get("name") or "",
                    "artist": meta.get("artist") or "",
                    "image": meta.get("image") or "",
                    "preview_url": meta.get("preview_url") or "",
                    "tags": meta.get("tags") or "",
                    "primary_genre": primary_genre,
                })
            return out
        except Exception:
            return self.get_all_songs()
