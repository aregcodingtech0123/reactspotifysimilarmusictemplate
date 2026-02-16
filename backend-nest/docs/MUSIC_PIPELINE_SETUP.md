# Music Data Pipeline — Setup Guide

## Quick Start

### 1. Database Migration

Run Prisma migration to create the `songs` table:

```bash
cd backend-nest
npx prisma migrate dev --name add_songs_table
```

**OR** run SQL manually (see `SQL_MIGRATION_COMMANDS.md`).

---

### 2. Regenerate Prisma Client

```bash
npx prisma generate
```

---

### 3. Seed Songs from Deezer

**Option A: Using API endpoint (recommended for testing)**

```bash
# Seed trending songs
curl -X POST http://localhost:4001/api/songs/seed \
  -H "Content-Type: application/json" \
  -d '{"source": "trending"}'

# Seed by search query
curl -X POST http://localhost:4001/api/songs/seed \
  -H "Content-Type: application/json" \
  -d '{"source": "search", "query": "queen"}'

# Seed by genre (Rock = 132, Pop = 116, etc.)
curl -X POST http://localhost:4001/api/songs/seed \
  -H "Content-Type: application/json" \
  -d '{"source": "genre", "genreId": 132}'
```

**Option B: Using seed script**

```bash
# Install ts-node if not already installed
npm install -D ts-node

# Run seed script
npx ts-node scripts/seed-songs.ts trending
npx ts-node scripts/seed-songs.ts search "queen"
npx ts-node scripts/seed-songs.ts genre 132
```

---

### 4. Restart NestJS Server

```bash
npm run start:dev
```

---

### 5. Test Endpoints

```bash
# Get all songs
curl http://localhost:4001/api/songs

# Get trending songs
curl http://localhost:4001/api/songs/trending?limit=20

# Get new songs
curl http://localhost:4001/api/songs/new?limit=20

# Get songs by genre
curl http://localhost:4001/api/songs/genre/Rock?limit=30

# Get single song
curl http://localhost:4001/api/songs/{song-id}
```

---

## Architecture Overview

```
┌─────────────┐
│  Deezer API │
└──────┬──────┘
       │
       │ (fetch & normalize)
       ▼
┌──────────────────┐
│  DeezerService   │
│  (normalization) │
└──────┬───────────┘
       │
       │ (save to DB)
       ▼
┌──────────────────┐
│  SongsService    │
│  (Prisma logic)  │
└──────┬───────────┘
       │
       │ (query)
       ▼
┌─────────────┐
│ PostgreSQL  │
│  (songs)    │
└──────┬──────┘
       │
       │ (GET /api/songs)
       ▼
┌─────────────┐
│  Frontend   │
│  (consumes) │
└─────────────┘
```

---

## Key Features

✅ **Normalized data** — Consistent format regardless of Deezer source  
✅ **Duplicate prevention** — `deezerId` unique constraint  
✅ **Internal popularity** — Calculated independently of Deezer  
✅ **Genre fallback** — Always has a genre (even if "Other")  
✅ **Preview URLs** — Safe to store (30-second previews)  
✅ **Indexed queries** — Fast filtering by genre, popularity, etc.  

---

## Common Deezer Genre IDs

- **Rock**: 132
- **Pop**: 116
- **Hip-Hop**: 116
- **Jazz**: 129
- **Electronic**: 106
- **R&B**: 165
- **Country**: 84
- **Classical**: 98

Find more at: https://api.deezer.com/genre

---

## Production Considerations

1. **Rate Limiting** — Deezer API has rate limits. Seed in batches.
2. **Error Handling** — Network failures are handled gracefully.
3. **Caching** — Consider caching popular queries (future enhancement).
4. **Background Jobs** — Use a job queue (BullMQ, Bull) for periodic seeding.
5. **Monitoring** — Log Deezer API failures and import statistics.

---

## Troubleshooting

### "Table songs does not exist"
→ Run migration: `npx prisma migrate dev`

### "Deezer API error"
→ Check internet connection. Deezer API is public but may have rate limits.

### "Duplicate key violation"
→ Normal — means song already exists. Skipped automatically.

### "Preview URL is null"
→ Normal — not all Deezer tracks have previews. Handle in frontend.

---

## Next Steps

1. ✅ Database migration
2. ✅ Seed songs
3. ✅ Test endpoints
4. 🔄 Integrate frontend (see `FRONTEND_CONTRACT.md`)
5. 🔄 Add user favorites (future)
6. 🔄 Add play history (future)
