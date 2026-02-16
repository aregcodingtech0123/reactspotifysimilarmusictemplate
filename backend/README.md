# Phase 1 – Express + TypeScript Backend

Production-ready backend with layered architecture (Controller → Service → Repository), JWT auth, and Prisma + PostgreSQL.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   - Copy `.env.example` to `.env`
   - Set `DATABASE_URL` for your PostgreSQL instance
   - Set `JWT_SECRET` (use a strong secret in production)

3. **Database**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

4. **Run**
   ```bash
   npm run dev    # development (ts-node-dev)
   npm run build && npm start   # production
   ```

Server runs at `http://localhost:4000` (or `PORT` from `.env`).

## API Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register (username, email, password) |
| POST | `/api/auth/login` | No | Login (email, password) → `accessToken` |
| GET | `/api/auth/me` | Bearer | Current user |
| GET | `/api/users/me` | Bearer | Current user (alias) |
| POST | `/api/playlists` | Bearer | Create playlist `{ name }` |
| GET | `/api/playlists` | Bearer | List current user's playlists |
| GET | `/api/playlists/:id` | Bearer | Get playlist with tracks |
| POST | `/api/playlists/:id/tracks` | Bearer | Add track `{ title, artist }` |
| DELETE | `/api/playlists/:id` | Bearer | Delete playlist |

All success responses: `{ success: true, data: ... }`. Errors: `{ success: false, error: { message } }`.

## Frontend usage

Send JWT in the header:

```
Authorization: Bearer <accessToken>
```

Use the same base URL (e.g. `http://localhost:4000`) for API requests.

## Troubleshooting

### "The table \`(not available)\` does not exist in the current database"

This means the database that the Express backend uses does not have the expected tables (`users`, `playlists`, `tracks`), or the Prisma client is out of sync.

**Fix:**

1. Ensure `backend/.env` has the correct `DATABASE_URL` pointing to your PostgreSQL instance.
2. From the **backend** folder, run:
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```
   (Use `npx prisma migrate dev` if you are developing and want to create new migrations.)
3. Restart the Express server.

**Note:** If you use the same database for both the Express backend and the NestJS backend, run only one backend’s migrations against that database (they use different table names/schemas). Prefer a separate database per backend, or a single shared schema.
