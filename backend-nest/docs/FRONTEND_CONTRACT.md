# Frontend Contract — Songs API

## Overview

The frontend should **never call Deezer API directly**. All music data comes from our backend endpoints (`/api/songs/*`).

---

## Base URL

All endpoints are under `/api/songs` (global prefix is `api`).

Example: `http://localhost:4001/api/songs`

---

## Endpoints

### 1. GET /api/songs

Get all songs with pagination, filtering, and sorting.

**Query Parameters:**
- `page` (number, default: 1) — Page number
- `limit` (number, default: 50) — Items per page
- `genre` (string, optional) — Filter by genre (e.g. "Rock", "Pop")
- `sortBy` (string, optional) — Sort field: `"popularity"` or `"createdAt"` (default: `"popularity"`)
- `order` (string, optional) — Sort order: `"asc"` or `"desc"` (default: `"desc"`)

**Response:**
```json
{
  "success": true,
  "data": {
    "songs": [
      {
        "id": "uuid",
        "title": "Bohemian Rhapsody",
        "artist": "Queen",
        "album": "A Night at the Opera",
        "coverUrl": "https://...",
        "duration": 355,
        "previewUrl": "https://cdns-preview-...",
        "genre": "Rock",
        "popularity": 95,
        "deezerId": 123456,
        "createdAt": "2025-02-03T...",
        "updatedAt": "2025-02-03T..."
      }
    ],
    "total": 150,
    "page": 1,
    "limit": 50
  }
}
```

---

### 2. GET /api/songs/trending

Get trending songs (sorted by popularity, descending).

**Query Parameters:**
- `limit` (number, default: 20) — Number of songs to return

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "...",
      "artist": "...",
      // ... same fields as above
    }
  ]
}
```

---

### 3. GET /api/songs/new

Get newest songs (sorted by createdAt, descending).

**Query Parameters:**
- `limit` (number, default: 20) — Number of songs to return

**Response:** Same as `/trending` (array of songs)

---

### 4. GET /api/songs/genre/:genre

Get songs by genre.

**URL Parameters:**
- `genre` (string) — Genre name (e.g. "Rock", "Pop", "Jazz")

**Query Parameters:**
- `limit` (number, default: 50) — Number of songs to return

**Response:** Same as `/trending` (array of songs)

**Example:** `GET /api/songs/genre/Rock?limit=30`

---

### 5. GET /api/songs/:id

Get a single song by ID.

**URL Parameters:**
- `id` (UUID string) — Song ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "...",
    // ... all song fields
  }
}
```

---

## Field Usage Guide

### Required Fields (Always Present)

- **`id`** — Use for unique identification, linking to playlists, favorites, etc.
- **`title`** — Display song title
- **`artist`** — Display artist name
- **`album`** — Display album name
- **`coverUrl`** — Use as `<img src={song.coverUrl} />` for album art
- **`duration`** — Display as `formatDuration(song.duration)` (e.g. "5:55")
- **`genre`** — Use for filtering, badges, category pages
- **`popularity`** — Use for sorting, trending indicators (0-100 scale)
- **`createdAt`** — Use for "new releases" sections

### Optional Fields

- **`previewUrl`** — May be `null`. If present, use for 30-second audio preview:
  ```jsx
  <audio src={song.previewUrl} controls />
  ```
  - **Important:** This is a 30-second preview, not the full track.
  - If `null`, show "Preview not available" or disable preview button.

---

## Preview Playback

### Implementation

```jsx
function SongPreview({ song }) {
  if (!song.previewUrl) {
    return <button disabled>Preview not available</button>;
  }

  return (
    <audio controls src={song.previewUrl}>
      Your browser does not support audio playback.
    </audio>
  );
}
```

### Best Practices

1. **Always check `previewUrl`** before rendering audio element.
2. **Handle errors** — Preview URLs may expire (rare). Show fallback UI.
3. **30-second limit** — Inform users it's a preview, not full track.
4. **Loading state** — Show spinner while audio loads.

---

## Error Handling

All endpoints return consistent error format:

```json
{
  "success": false,
  "error": {
    "message": "Song with ID xyz not found"
  }
}
```

**HTTP Status Codes:**
- `200` — Success
- `404` — Song not found
- `400` — Bad request (invalid parameters)
- `500` — Server error

---

## Example Frontend Usage

```typescript
// Fetch trending songs
const response = await fetch('http://localhost:4001/api/songs/trending?limit=20');
const { success, data } = await response.json();
if (success) {
  const songs = data; // Array of songs
}

// Fetch songs by genre
const response = await fetch('http://localhost:4001/api/songs/genre/Rock?limit=50');
const { success, data } = await response.json();

// Fetch single song
const response = await fetch('http://localhost:4001/api/songs/uuid-here');
const { success, data } = await response.json();
if (success) {
  const song = data; // Single song object
}
```

---

## Important Notes

1. **Never call Deezer API** — All data comes from `/api/songs`.
2. **Use `id` (UUID)** — Not `deezerId` for internal references.
3. **`previewUrl` can be null** — Always check before using.
4. **`popularity` is 0-100** — Higher = more popular.
5. **`duration` is in seconds** — Convert to MM:SS format for display.

---

## Data Flow

```
Frontend Request
    ↓
GET /api/songs/trending
    ↓
Backend (SongsService)
    ↓
PostgreSQL (songs table)
    ↓
Response (normalized Song objects)
    ↓
Frontend (displays songs, plays previews)
```

No Deezer API calls from frontend. ✅
