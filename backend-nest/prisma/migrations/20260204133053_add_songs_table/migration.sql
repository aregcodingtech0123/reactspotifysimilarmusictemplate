-- CreateTable
CREATE TABLE "songs" (
    "id" TEXT NOT NULL,
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
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "songs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "songs_deezer_id_key" ON "songs"("deezer_id");

-- CreateIndex
CREATE INDEX "songs_genre_idx" ON "songs"("genre");

-- CreateIndex
CREATE INDEX "songs_popularity_idx" ON "songs"("popularity");

-- CreateIndex
CREATE INDEX "songs_created_at_idx" ON "songs"("created_at");

-- CreateIndex
CREATE INDEX "songs_artist_idx" ON "songs"("artist");
