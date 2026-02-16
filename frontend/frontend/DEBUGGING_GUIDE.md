# 🔍 DEBUGGING GUIDE - Data Flow Verification

## STEP 1: Verify Backend API (MANDATORY)

### Option A: Use the test script
```bash
cd frontend
node test-api.js
```

### Option B: Manual curl tests
```bash
# Test trending songs
curl http://localhost:4001/api/songs/trending?limit=5

# Test all songs
curl http://localhost:4001/api/songs?limit=5

# Test by genre
curl http://localhost:4001/api/songs/genre/Rock?limit=5
```

### Expected Response Structure:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-string",
      "title": "Song Title",
      "artist": "Artist Name",
      "album": "Album Name",
      "coverUrl": "https://...",
      "duration": 180,
      "previewUrl": "https://...",
      "genre": "Rock",
      "popularity": 85,
      "deezerId": 123456,
      "createdAt": "2025-02-03T...",
      "updatedAt": "2025-02-03T..."
    }
  ]
}
```

### ❌ If backend returns empty arrays:
The database needs to be seeded. Run:
```bash
curl -X POST http://localhost:4001/api/songs/seed \
  -H "Content-Type: application/json" \
  -d '{"source":"trending"}'
```

---

## STEP 2: Check Browser Console

Open browser DevTools (F12) and check the Console tab. You should see:

### Expected Logs:
```
[API] Requesting: http://localhost:4001/api/songs/trending?limit=10
[API] Response [200]: { ok: true, status: 200, ... }
[API] Extracted data: { hasData: true, type: 'array', length: 10, ... }
[songsService] fetchTrending result: { ok: true, data: [...] }
[DiscoverPage] All fetches completed: { ... }
[DiscoverPage] Setting trendingSongs: [...]
[CategorySection:Trending] { songsLength: 10, visibleSongsLength: 5, ... }
```

### ❌ If you see errors:
- **Network error**: Backend not running or wrong port
- **CORS error**: Backend CORS not configured
- **404**: Wrong API path
- **Empty arrays**: Database not seeded

---

## STEP 3: Check Network Tab

1. Open DevTools → Network tab
2. Filter by "Fetch/XHR"
3. Reload the page
4. Look for requests to `/api/songs/*`

### Expected:
- Status: 200 OK
- Response contains `{ success: true, data: [...] }`
- Response has real song data

### ❌ If requests fail:
- Check Status code (404, 500, etc.)
- Check Response preview for error message
- Verify backend is running on port 4001

---

## STEP 4: Verify Data Rendering

On the Discover page, you should see:
1. A DEBUG DATA section (in development) showing raw JSON
2. Console logs showing data arrays
3. Song cards with real titles/artists

### ❌ If no data shows:
- Check DEBUG DATA section - is it empty `[]`?
- Check console - are arrays empty?
- Verify state is being set: `console.log(newSongs)` in component

---

## STEP 5: Test Navigation

1. Click on a song card
2. Check console for: `[SongItem] handleItemClick: { songId: "...", ... }`
3. Check console for: `[SongItem] Navigating to: /song/...`
4. URL should change to `/song/:id`
5. SongDetail page should load

### ❌ If clicking does nothing:
- Check console for errors
- Verify `song` prop is passed to SongItem
- Check router is installed: `npm list react-router-dom`

---

## STEP 6: Test Audio Playback

1. Hover over a song card
2. Click the play button
3. Check console for: `[SongItem] handlePlayClick: { previewUrl: "...", ... }`
4. Check console for: `[PlayerContext] play() called: { ... }`
5. Audio should start playing
6. MusicPlayer bar should appear at bottom

### ❌ If playback fails:
- Check console for: `[PlayerContext] Cannot play: no previewUrl`
- Verify `song.previewUrl` exists in data
- Check browser console for audio errors

---

## Common Issues & Fixes

### Issue: "No data showing"
**Check:**
1. Backend running? `curl http://localhost:4001/api/songs/trending`
2. Database seeded? Check backend logs
3. API base URL correct? Check `frontend/src/services/api.ts` (should be `http://localhost:4001`)

### Issue: "Clicking does nothing"
**Check:**
1. Console logs show `[SongItem] handleItemClick`?
2. `song` prop passed to SongItem?
3. Router installed? Check `package.json`

### Issue: "Play button does nothing"
**Check:**
1. `song.previewUrl` exists?
2. Console shows `[PlayerContext] play()` called?
3. Audio element created? Check MusicPlayer component

---

## Next Steps After Debugging

Once you identify the issue:
1. Document the exact error/behavior
2. Check the relevant component/service
3. Fix the root cause
4. Remove debug logs (or keep them for now)
