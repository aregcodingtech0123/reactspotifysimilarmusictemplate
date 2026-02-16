# Command Execution Guide — Where & When to Run Commands

## 📁 Folder Structure

```
reactspotifysimilarmusictemplate-main/
└── backend-nest/          ← Run commands HERE
    ├── prisma/
    ├── src/
    ├── scripts/
    └── package.json
```

---

## ⏰ Execution Order (Step-by-Step)

### **STEP 1: Database Migration** (BEFORE starting the project)

**Folder:** `backend-nest`

```bash
cd "C:\Users\User-pc\Desktop\kendi projelerim\reactspotifysimilarmusictemplate-main\reactspotifysimilarmusictemplate-main\backend-nest"

# Create the songs table
npx prisma migrate dev --name add_songs_table

# Regenerate Prisma client
npx prisma generate
```

**When:** ✅ **BEFORE** starting the NestJS server  
**Why:** The database needs the `songs` table to exist before the app can use it.

---

### **STEP 2: Start the NestJS Server** (AFTER migration)

**Folder:** `backend-nest`

```bash
# Make sure you're still in backend-nest folder
npm run start:dev
```

**When:** ✅ **AFTER** migration  
**Why:** The server needs the Prisma client and database schema to be ready.

**Keep this terminal running** — the server should stay active.

---

### **STEP 3: Seed Songs** (AFTER server is running)

You have **two options**:

#### **Option A: Using curl (API endpoint)** ⭐ Recommended

**Folder:** Any folder (curl works from anywhere)

**When:** ✅ **AFTER** the server is running (Step 2)

Open a **NEW terminal** (keep the server running in the first terminal):

```bash
# From ANY folder (PowerShell or Command Prompt)
curl -X POST http://localhost:4001/api/songs/seed -H "Content-Type: application/json" -d "{\"source\": \"trending\"}"
```

**Why after server starts:** The `/api/songs/seed` endpoint only works when the server is running.

---

#### **Option B: Using seed script**

**Folder:** `backend-nest`

**When:** ✅ **AFTER** the server is running (or anytime, but server must be running for API to work)

```bash
cd "C:\Users\User-pc\Desktop\kendi projelerim\reactspotifysimilarmusictemplate-main\reactspotifysimilarmusictemplate-main\backend-nest"

# Install ts-node if needed (one-time)
npm install -D ts-node

# Run seed script
npx ts-node scripts/seed-songs.ts trending
```

**Why after server starts:** The script connects to the database, which should be ready.

---

### **STEP 4: Test Endpoints** (AFTER seeding)

**Folder:** Any folder

**When:** ✅ **AFTER** seeding songs (Step 3)

```bash
# From ANY folder
curl http://localhost:4001/api/songs/trending
```

**Why after seeding:** You need songs in the database to get results.

---

## 📋 Complete Workflow Summary

```
1. ✅ Open Terminal 1
   cd backend-nest
   npx prisma migrate dev --name add_songs_table
   npx prisma generate
   npm run start:dev
   (Keep this running)

2. ✅ Open Terminal 2 (new terminal)
   cd backend-nest  (if using seed script)
   OR
   (any folder if using curl)
   
   # Seed songs
   curl -X POST http://localhost:4001/api/songs/seed -H "Content-Type: application/json" -d "{\"source\": \"trending\"}"
   
   # OR
   npx ts-node scripts/seed-songs.ts trending

3. ✅ Test (same Terminal 2 or new terminal)
   curl http://localhost:4001/api/songs/trending
```

---

## 🎯 Quick Reference

| Command | Folder | When | Server Running? |
|---------|--------|------|-----------------|
| `npx prisma migrate dev` | `backend-nest` | **BEFORE** | ❌ No |
| `npx prisma generate` | `backend-nest` | **BEFORE** | ❌ No |
| `npm run start:dev` | `backend-nest` | **AFTER** migration | ❌ No (starts it) |
| `curl ... /api/songs/seed` | **Any** | **AFTER** server starts | ✅ Yes |
| `npx ts-node scripts/seed-songs.ts` | `backend-nest` | **AFTER** server starts | ✅ Yes |
| `curl ... /api/songs/trending` | **Any** | **AFTER** seeding | ✅ Yes |

---

## ⚠️ Common Mistakes

### ❌ Running seed BEFORE migration
**Error:** `Table "songs" does not exist`  
**Fix:** Run migration first (Step 1)

### ❌ Running seed BEFORE server starts
**Error (curl):** `Connection refused` or `ECONNREFUSED`  
**Fix:** Start server first (Step 2)

### ❌ Running seed script from wrong folder
**Error:** `Cannot find module` or `File not found`  
**Fix:** Make sure you're in `backend-nest` folder

### ❌ Testing endpoints BEFORE seeding
**Result:** Empty array `[]`  
**Fix:** Seed songs first (Step 3)

---

## 🔄 Daily Development Workflow

**First time setup:**
1. Migration (one-time)
2. Start server
3. Seed songs (one-time, or whenever you need fresh data)

**Every day after:**
1. Start server (`npm run start:dev`)
2. Use endpoints (songs are already in DB from previous seed)

**Re-seed when needed:**
- Run seed command again (it skips duplicates automatically)

---

## 💡 Pro Tips

1. **Keep server running** — Don't close Terminal 1 after `npm run start:dev`
2. **Use separate terminals** — One for server, one for commands
3. **Check server logs** — Terminal 1 shows if seed requests arrive
4. **Verify database** — Use `npx prisma studio` to see songs table
