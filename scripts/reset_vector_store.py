"""
Reset the ChromaDB vector store collection to fix dimension mismatches.
This deletes the old collection so a new one can be created with the correct embedding dimensions.
"""

import chromadb

PERSIST_DIR = "./music_db"
COLLECTION_NAME = "music"

try:
    client = chromadb.PersistentClient(path=PERSIST_DIR)
    try:
        client.delete_collection(name=COLLECTION_NAME)
        print(f"Successfully deleted collection '{COLLECTION_NAME}'")
        print("A new collection will be created with the correct embedding dimensions on next indexing.")
    except Exception as e:
        print(f"Collection '{COLLECTION_NAME}' does not exist or could not be deleted: {e}")
except Exception as e:
    print(f"Error connecting to ChromaDB: {e}")
