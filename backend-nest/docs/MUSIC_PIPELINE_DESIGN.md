# Music Data Pipeline — Database Design

## 1. Overview

This document explains the database design for storing music data fetched from Deezer API. The goal is to normalize external data, add internal metrics, and provide a consistent API for the frontend.

---

## 2. Database Table: `songs` (Prisma model: `Song`)

### Table Purpose

Store normalized music tracks fetched from Deezer API. This table serves as the **single source of truth** for music data consumed by the frontend.

---

## 3. Field Breakdown

| Field | Type | Purpose | Source |
|-------|------|---------|--------|
| **`id`** | UUID (PK) | Primary key. Stable, non-sequential identifier. | **Internal** (generated) |
| **`title`** | VARCHAR(255) | Song title (e.g. "Bohemian Rhapsody"). | **Deezer** (`title`) |
| **`artist`** | VARCHAR(255) | Artist name (e.g. "Queen"). | **Deezer** (`artist.name`) |
| **`album`** | VARCHAR(255) | Album name (e.g. "A Night at the Opera"). | **Deezer** (`album.title`) |
| **`coverUrl`** | VARCHAR(500) | Album cover image URL. | **Deezer** (`album.cover_medium` or `album.cover_big`) |
| **`duration`** | INTEGER | Duration in seconds (e.g. 355). | **Deezer** (`duration`) |
| **`previewUrl`** | VARCHAR(500) | 30-second preview audio URL (MP3). | **Deezer** (`preview`) |
| **`genre`** | VARCHAR(100) | Genre name (e.g. "Rock", "Pop"). | **Deezer** (`genre.name`) or **Internal** (fallback) |
| **`popularity`** | INTEGER | Internal popularity score (0-100). Higher = more popular. | **Internal** (calculated) |
| **`deezerId`** | BIGINT (unique) | Deezer track ID. Used to prevent duplicates. | **Deezer** (`id`) |
| **`createdAt`** | TIMESTAMP | When the song was first imported. | **Internal** (auto) |
| **`updatedAt`** | TIMESTAMP | Last update time (for future metadata refreshes). | **Internal** (auto) |

---

## 4. Why These Fields?

### From Deezer (External)

- **`title`, `artist`, `album`** — Core metadata users expect.
- **`coverUrl`** — Visual representation; Deezer provides CDN URLs.
- **`duration`** — Needed for UI (progress bars, time remaining).
- **`previewUrl`** — 30-second preview MP3; safe to store (Deezer CDN).
- **`genre`** — Categorization; may be missing/null in Deezer, so we use fallback logic.
- **`deezerId`** — Unique Deezer identifier; prevents duplicate imports.

### Internal Fields

- **`id`** — Our UUID primary key (not Deezer's ID).
- **`popularity`** — **Why internal?**
  - Deezer doesn't provide a consistent popularity score.
  - We calculate it based on:
    - Chart position (if from charts endpoint)
    - Search rank (if from search)
    - Play count (future: from our analytics)
  - Allows us to rank songs independently of Deezer's algorithm.
- **`createdAt`** — Audit trail; useful for "new releases" queries.
- **`updatedAt`** — Future: refresh metadata if Deezer updates it.

---

## 5. Why `previewUrl` is Safe

- Deezer preview URLs are **public CDN links** (e.g. `https://cdns-preview-X.dzcdn.net/...`).
- They are **30-second previews only** (not full tracks).
- They are **intended for embedding** in third-party apps.
- Storing them is **standard practice** and **legally safe** (preview, not full track).
- If a URL expires (rare), we can refresh it from Deezer API.

---

## 6. Indexes

- **`deezerId`** — UNIQUE index (prevent duplicates).
- **`genre`** — Index (for filtering by genre).
- **`popularity`** — Index (for sorting trending/new songs).
- **`createdAt`** — Index (for "new releases" queries).
- **`artist`** — Index (for artist search/filtering).

---

## 7. Relationships (Future)

- **Playlists** — Songs can be added to playlists (many-to-many via junction table).
- **User favorites** — Users can favorite songs (many-to-many).
- **Play history** — Track user listening history (separate table).

For now, we keep `Song` standalone; relationships can be added later.

---

## 8. Data Flow

```
Deezer API (search/charts)
    ↓
Backend Service (normalize, calculate popularity)
    ↓
PostgreSQL (songs table)
    ↓
Frontend API (GET /api/songs)
    ↓
Frontend UI (displays songs, plays previews)
```

---

## 9. Duplicate Prevention

- **`deezerId` UNIQUE constraint** ensures the same Deezer track isn't imported twice.
- On import: check if `deezerId` exists; if yes, skip or update metadata.

---

## 10. Genre Fallback Logic

If Deezer doesn't provide a genre:
1. Check album genre.
2. Check artist genre.
3. Use "Unknown" or "Other" as fallback.

This ensures every song has a genre (even if generic).

---

## 11. Popularity Calculation

**Initial implementation:**
- If from charts: `popularity = 100 - (chart_position / 10)` (clamped 0-100).
- If from search: `popularity = 50` (default).
- Future: adjust based on play counts, user favorites, etc.

This gives us control over trending/new song rankings independent of Deezer.
