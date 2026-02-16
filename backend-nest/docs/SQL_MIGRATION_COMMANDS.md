# SQL Migration Commands for Songs Table

## Option 1: Using Prisma Migrate (Recommended)

Run this command from the `backend-nest` folder:

```bash
cd backend-nest
npx prisma migrate dev --name add_songs_table
```

This will:
1. Create a migration file in `prisma/migrations/`
2. Apply it to your database
3. Regenerate the Prisma client

---

## Option 2: Manual SQL (If Prisma Migrate Fails)

Run this SQL directly in your PostgreSQL database:

```sql
-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create songs table
CREATE TABLE IF NOT EXISTS "songs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR(255) NOT NULL,
    "artist" VARCHAR(255) NOT NULL,
    "album" VARCHAR(255) NOT NULL,
    "cover_url" VARCHAR(500) NOT NULL,
    "duration" INTEGER NOT NULL,
    "preview_url" VARCHAR(500),
    "genre" VARCHAR(100) NOT NULL,
    "popularity" INTEGER NOT NULL DEFAULT 50,
    "deezer_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "songs_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint on deezer_id (prevents duplicates)
CREATE UNIQUE INDEX IF NOT EXISTS "songs_deezer_id_key" ON "songs"("deezer_id");

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "songs_genre_idx" ON "songs"("genre");
CREATE INDEX IF NOT EXISTS "songs_popularity_idx" ON "songs"("popularity");
CREATE INDEX IF NOT EXISTS "songs_created_at_idx" ON "songs"("created_at");
CREATE INDEX IF NOT EXISTS "songs_artist_idx" ON "songs"("artist");

-- Update updated_at trigger (optional, Prisma handles this)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_songs_updated_at BEFORE UPDATE ON "songs"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

After running SQL manually, regenerate Prisma client:

```bash
cd backend-nest
npx prisma generate
```

---

## Verification

Check that the table was created:

```sql
SELECT * FROM "songs" LIMIT 1;
```

Or use Prisma Studio:

```bash
cd backend-nest
npx prisma studio
```

---

## Next Steps

After migration:
1. ✅ Table `songs` exists
2. ✅ Prisma client regenerated
3. ✅ Restart NestJS server
4. ✅ Use `/api/songs` endpoints
