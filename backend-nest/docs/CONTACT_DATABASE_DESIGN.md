# Contact Feature — Database Design

## 1. Overview

The Contact feature stores messages from both **logged-in users** and **anonymous visitors**. One table is enough: we store the message body, optional link to a user, and optional email for non-authenticated senders.

## 2. Table: `contact_messages` (Prisma model: `ContactMessage`)

| Column       | Type       | Purpose |
|-------------|------------|---------|
| `id`        | UUID (PK)  | Primary key. UUID for stable, non-sequential IDs. |
| `message`   | TEXT       | **Required.** The message body. |
| `userId`    | UUID (FK?) | **Optional.** Set when the sender is authenticated; references `users.id`. |
| `email`     | VARCHAR   | **Optional.** Set when the sender is not authenticated; used to reply. |
| `createdAt` | TIMESTAMP  | **Required.** When the message was submitted (audit + spam window). |

### Why these fields?

- **`message`** — Required. No message means nothing to store or reply to.
- **`userId`** — Optional. Present only for logged-in users; links to `User` for identity and future “my messages” / admin views.
- **`email`** — Optional. Required only when `userId` is null (anonymous). Validated as email format.
- **`createdAt`** — Required. Needed for ordering, support workflows, and rate limiting (e.g. “max 1 message per minute per user/email”).

### Relationships

- **User (optional):** `ContactMessage.userId` → `User.id`.  
  - One user can have many contact messages.  
  - `userId` is `NULL` for anonymous messages.

No other tables are required for the basic Contact feature.

## 3. Conventions

- **PostgreSQL** — Native UUID and timestamp types.
- **Prisma** — Model name `ContactMessage`; table name `contact_messages` (Prisma default).
- **Primary key** — `id` UUID, default `uuid()` (e.g. `gen_random_uuid()` in PostgreSQL).
- **Timestamps** — `createdAt` only; `updatedAt` omitted because messages are immutable.

## 4. Validation rules (application layer)

- **Authenticated:** `userId` set from JWT; `email` not required (can be ignored or optional).
- **Anonymous:** `userId` null; `email` required and must be a valid email.
- **Message:** Always required, non-empty (after trim).
- **Spam prevention:** At most one message per minute per `userId` (if set) or per `email` (if no user).

## 5. Spam prevention (implemented)

- At most **one message per minute** per authenticated user (`userId`) or per anonymous email (`email`).
- Enforced in the Contact service before creating a new row; returns HTTP 429 when limit exceeded.

## 6. Future extensions

- **Admin panel:** List/filter contact messages by `createdAt`, `userId`, `email`; mark as read/replied; optional dashboard.
- **Reply system:** Add a `replies` table (e.g. `contact_message_id`, `body`, `createdAt`, `is_staff`) or a `thread_id` on `contact_messages` for threading; notify user by email when staff replies.
- **Status:** Add `status` (e.g. `open` / `replied` / `closed`) on `contact_messages` for workflow and filtering.
