# Phase 2 – NestJS Backend (Migration from Express)

Same business logic and API as the Express backend, implemented with NestJS modules, Passport JWT, guards, and DTOs.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   - Copy `.env.example` to `.env`
   - Use the same `DATABASE_URL` and `JWT_SECRET` as the Express backend (or a new DB)
   - Default `PORT=4001` to run alongside Express

3. **Database**
   - Uses the same Prisma schema as the Express backend.
   - If you already ran migrations in `backend/`, point `DATABASE_URL` to the same database.
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init   # only if using a new DB
   ```

4. **Run**
   ```bash
   npm run start:dev   # development (watch)
   npm run build && npm run start:prod   # production
   ```

Server runs at `http://localhost:4001` (or `PORT` from `.env`).

## API (same as Express)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register |
| POST | `/api/auth/login` | No | Login |
| GET | `/api/auth/me` | Bearer | Current user |
| GET | `/api/users/me` | Bearer | Current user |
| POST | `/api/playlists` | Bearer | Create playlist |
| GET | `/api/playlists` | Bearer | List playlists |
| GET | `/api/playlists/:id` | Bearer | Get playlist with tracks |
| POST | `/api/playlists/:id/tracks` | Bearer | Add track |
| DELETE | `/api/playlists/:id` | Bearer | Delete playlist |

Response format: `{ success: true, data: ... }` / `{ success: false, error: { message } }`.

## Structure

- **Prisma**: `PrismaModule` (global), `PrismaService` (connect/disconnect lifecycle).
- **Auth**: `AuthModule` (JwtModule, PassportModule), `JwtStrategy`, `JwtAuthGuard`, `CurrentUser` decorator, DTOs with `class-validator`.
- **Users / Playlists**: Services and controllers; protected routes use `JwtAuthGuard`.
- **Global**: `ValidationPipe` (whitelist, transform), `HttpExceptionFilter` for consistent error responses.

You can run this NestJS app against the same PostgreSQL database as the Express backend; no schema changes required.
