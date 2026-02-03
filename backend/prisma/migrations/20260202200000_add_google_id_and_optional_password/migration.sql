-- Add google_id and make password nullable on users (for Google OAuth and email signup)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "google_id" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "users_google_id_key" ON "users"("google_id");
ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL;
