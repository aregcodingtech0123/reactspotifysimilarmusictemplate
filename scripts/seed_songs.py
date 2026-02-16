"""
Seed script to populate the database with songs from Deezer API.
This replaces the old Node.js seedSongs.js script.

Usage:
    python scripts/seed_songs.py                    # Seed all genres
    python scripts/seed_songs.py rock               # Seed specific genre
    python scripts/seed_songs.py --all              # Seed all genres (explicit)
"""

import asyncio
import sys
import os
from pathlib import Path

# Add scripts directory to path
_scripts_dir = Path(__file__).resolve().parent
if str(_scripts_dir) not in sys.path:
    sys.path.insert(0, str(_scripts_dir))

from dotenv import load_dotenv
load_dotenv()
load_dotenv(dotenv_path=_scripts_dir / ".env")
load_dotenv(dotenv_path=_scripts_dir.parent / ".env")
load_dotenv(dotenv_path=_scripts_dir.parent / "backend" / ".env")

from db import get_db_pool, close_db_pool
from ingest_songs import ingest_all_genres, ingest_genre, ALL_GENRES

# Optional import - vector store may have compatibility issues
VECTOR_STORE_AVAILABLE = False
MusicVectorStore = None
try:
    from vector_store import MusicVectorStore
    VECTOR_STORE_AVAILABLE = True
except Exception as e:
    # Vector store not available (e.g., ChromaDB compatibility issues)
    pass


async def main():
    """Main entry point for seeding songs."""
    genre_arg = sys.argv[1] if len(sys.argv) > 1 else None
    
    # Initialize database pool
    pool = await get_db_pool()
    if not pool:
        print("ERROR: Failed to connect to database. Check DATABASE_URL in .env")
        return
    
    print("Database connection established")
    
    # Initialize vector store (optional)
    store = None
    if VECTOR_STORE_AVAILABLE:
        try:
            store = MusicVectorStore()
            if store and store.embeddings_enabled:
                print("Vector store initialized")
            else:
                print("WARNING: Vector store not initialized (embeddings disabled). Songs will be stored in DB but not indexed.")
        except Exception as e:
            print(f"WARNING: Vector store initialization failed: {e}")
            print("   Songs will be stored in DB but not indexed. You can index them later via API.")
            store = None
    else:
        print("WARNING: Vector store not available. Songs will be stored in DB but not indexed.")
    
    try:
        if genre_arg == "--all" or genre_arg is None:
            # Ingest all genres
            print(f"\nStarting ingestion for all genres: {', '.join(ALL_GENRES)}\n")
            results = await ingest_all_genres()
            
            total_inserted = 0
            total_updated = 0
            for genre, (inserted, updated) in results.items():
                total_inserted += inserted
                total_updated += updated
                print(f"  {genre}: {inserted} inserted, {updated} updated")
            
            print(f"\nTotal: {total_inserted} inserted, {total_updated} updated")
            
            # Index all songs into vector store (if available) - batch in chunks of 100
            if store and hasattr(store, 'embeddings_enabled') and store.embeddings_enabled:
                try:
                    print("\nIndexing songs into vector store (batched)...")
                    from db import get_songs as db_get_songs
                    all_songs = await db_get_songs(limit=10000)
                    if all_songs:
                        # Batch indexing in chunks of 100 to avoid API limits
                        BATCH_SIZE = 100
                        total_indexed = 0
                        for i in range(0, len(all_songs), BATCH_SIZE):
                            batch = all_songs[i:i + BATCH_SIZE]
                            try:
                                store.index_songs(batch)
                                total_indexed += len(batch)
                                print(f"  Indexed batch {i//BATCH_SIZE + 1}: {len(batch)} songs (total: {total_indexed}/{len(all_songs)})")
                            except Exception as e:
                                print(f"  WARNING: Failed to index batch {i//BATCH_SIZE + 1}: {e}")
                        print(f"Indexed {total_indexed} songs into vector store")
                        print(f"   Vector store count: {store.count()}")
                except Exception as e:
                    print(f"WARNING: Indexing failed: {e}")
                    print("   Songs are in DB but not indexed. You can index them later via API endpoint.")
        else:
            # Ingest specific genre
            genre = genre_arg.lower().strip()
            if genre not in ALL_GENRES:
                print(f"ERROR: Unknown genre: {genre}")
                print(f"   Available genres: {', '.join(ALL_GENRES)}")
                return
            
            print(f"\nStarting ingestion for genre: {genre}\n")
            inserted, updated = await ingest_genre(genre)
            print(f"{genre}: {inserted} inserted, {updated} updated")
            
            # Index songs for this genre (if available) - batch in chunks of 100
            if store and hasattr(store, 'embeddings_enabled') and store.embeddings_enabled:
                try:
                    print("\nIndexing songs into vector store (batched)...")
                    from db import get_songs as db_get_songs
                    genre_songs = await db_get_songs(genre=genre, limit=10000)
                    if genre_songs:
                        # Batch indexing in chunks of 100 to avoid API limits
                        BATCH_SIZE = 100
                        total_indexed = 0
                        for i in range(0, len(genre_songs), BATCH_SIZE):
                            batch = genre_songs[i:i + BATCH_SIZE]
                            try:
                                store.index_songs(batch)
                                total_indexed += len(batch)
                                print(f"  Indexed batch {i//BATCH_SIZE + 1}: {len(batch)} songs (total: {total_indexed}/{len(genre_songs)})")
                            except Exception as e:
                                print(f"  WARNING: Failed to index batch {i//BATCH_SIZE + 1}: {e}")
                        print(f"Indexed {total_indexed} songs into vector store")
                        print(f"   Vector store count: {store.count()}")
                except Exception as e:
                    print(f"WARNING: Indexing failed: {e}")
                    print("   Songs are in DB but not indexed. You can index them later via API endpoint.")
        
        print("\nSeeding complete!")
        
    except Exception as e:
        print(f"\nERROR during seeding: {e}")
        import traceback
        traceback.print_exc()
    finally:
        await close_db_pool()


if __name__ == "__main__":
    print("=" * 60)
    print("Deezer Song Ingestion Script")
    print("=" * 60)
    asyncio.run(main())
