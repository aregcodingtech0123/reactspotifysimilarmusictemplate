/**
 * This script has been replaced with a Python-based ingestion system.
 * 
 * Please use the new Python script instead:
 * 
 *   python scripts/seed_songs.py              # Seed all genres
 *   python scripts/seed_songs.py rock         # Seed specific genre
 * 
 * The new system:
 * - Fetches songs from Deezer API
 * - Stores them in PostgreSQL
 * - Supports AI embeddings via ChromaDB
 * 
 * For more information, see the implementation in:
 * - scripts/seed_songs.py (main script)
 * - scripts/deezer_client.py (Deezer API client)
 * - scripts/ingest_songs.py (ingestion pipeline)
 * - scripts/db.py (database access layer)
 */

console.log('='.repeat(60));
console.log('⚠️  This script has been replaced!');
console.log('='.repeat(60));
console.log('');
console.log('The old seedSongs.js has been replaced with a Python-based system.');
console.log('');
console.log('To seed songs, please use:');
console.log('');
console.log('  python scripts/seed_songs.py              # Seed all genres');
console.log('  python scripts/seed_songs.py rock         # Seed specific genre');
console.log('  python scripts/seed_songs.py pop          # Seed pop songs');
console.log('  python scripts/seed_songs.py jazz         # Seed jazz songs');
console.log('');
console.log('Available genres:');
console.log('  all, rock, pop, jazz, hip hop, rap, electronic, r&b, indie, metal, classical, country');
console.log('');
console.log('='.repeat(60));
process.exit(1);
