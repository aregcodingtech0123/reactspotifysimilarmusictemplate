/**
 * Seed script: Import songs from Deezer into the database.
 * 
 * Usage:
 *   npx ts-node scripts/seed-songs.ts trending
 *   npx ts-node scripts/seed-songs.ts search "queen"
 *   npx ts-node scripts/seed-songs.ts genre 132
 */
import { PrismaClient } from '@prisma/client';
import { DeezerService } from '../src/songs/deezer.service';

const prisma = new PrismaClient();
const deezer = new DeezerService();

async function seed(source: 'trending' | 'search' | 'genre', query?: string, genreId?: number) {
  console.log(`\n🌱 Seeding songs from Deezer (source: ${source})...\n`);

  let normalizedSongs;
  try {
    switch (source) {
      case 'trending':
        normalizedSongs = await deezer.getTrending(100);
        break;
      case 'search':
        if (!query) {
          throw new Error('Query required for search');
        }
        normalizedSongs = await deezer.search(query, 100);
        break;
      case 'genre':
        if (!genreId) {
          throw new Error('Genre ID required for genre');
        }
        normalizedSongs = await deezer.getByGenre(genreId, 100);
        break;
    }
  } catch (error) {
    console.error('❌ Failed to fetch from Deezer:', error.message);
    process.exit(1);
  }

  let imported = 0;
  let skipped = 0;

  for (const song of normalizedSongs) {
    try {
      const existing = await prisma.song.findUnique({
        where: { deezerId: BigInt(song.deezerId) },
      });

      if (existing) {
        skipped++;
        continue;
      }

      await prisma.song.create({
        data: {
          title: song.title,
          artist: song.artist,
          album: song.album,
          coverUrl: song.coverUrl,
          duration: song.duration,
          previewUrl: song.previewUrl,
          genre: song.genre,
          popularity: song.popularity,
          deezerId: BigInt(song.deezerId),
        },
      });
      imported++;
      console.log(`✅ Imported: ${song.title} by ${song.artist}`);
    } catch (error) {
      console.warn(`⚠️  Skipped ${song.deezerId}: ${error.message}`);
      skipped++;
    }
  }

  console.log(`\n✨ Seed complete: ${imported} imported, ${skipped} skipped\n`);
}

async function main() {
  const args = process.argv.slice(2);
  const source = args[0] as 'trending' | 'search' | 'genre';

  if (!source || !['trending', 'search', 'genre'].includes(source)) {
    console.error('Usage:');
    console.error('  npx ts-node scripts/seed-songs.ts trending');
    console.error('  npx ts-node scripts/seed-songs.ts search "queen"');
    console.error('  npx ts-node scripts/seed-songs.ts genre 132');
    process.exit(1);
  }

  const query = args[1];
  const genreId = args[1] ? parseInt(args[1], 10) : undefined;

  try {
    await seed(source, query, genreId);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
