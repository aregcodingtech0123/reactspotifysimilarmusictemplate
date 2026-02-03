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
