INSERT INTO "User" (id, username, email, password, "createdAt")
VALUES
  (gen_random_uuid()::text, 'alex_rivers', 'alex.rivers@example.com', 'hashed_password_1', now()),
  (gen_random_uuid()::text, 'jordan_beck', 'jordan.beck@example.com', 'hashed_password_2', now()),
  (gen_random_uuid()::text, 'sam_chen', 'sam.chen@example.com', 'hashed_password_3', now()),
  (gen_random_uuid()::text, 'morgan_lee', 'morgan.lee@example.com', 'hashed_password_4', now()),
  (gen_random_uuid()::text, 'casey_wood', 'casey.wood@example.com', 'hashed_password_5', now()),
  (gen_random_uuid()::text, 'riley_nguyen', 'riley.nguyen@example.com', 'hashed_password_6', now()),
  (gen_random_uuid()::text, 'quinn_foster', 'quinn.foster@example.com', 'hashed_password_7', now()),
  (gen_random_uuid()::text, 'skyler_hall', 'skyler.hall@example.com', 'hashed_password_8', now()),
  (gen_random_uuid()::text, 'taylor_kim', 'taylor.kim@example.com', 'hashed_password_9', now()),
  (gen_random_uuid()::text, 'reese_parker', 'reese.parker@example.com', 'hashed_password_10', now());

INSERT INTO "Playlist" (id, name, "userId", "createdAt")
VALUES
  (gen_random_uuid()::text, 'Chill Lofi Beats', (SELECT id FROM "User" WHERE username = 'alex_rivers' LIMIT 1), now()),
  (gen_random_uuid()::text, 'Workout Energy', (SELECT id FROM "User" WHERE username = 'jordan_beck' LIMIT 1), now()),
  (gen_random_uuid()::text, 'Late Night Coding', (SELECT id FROM "User" WHERE username = 'sam_chen' LIMIT 1), now()),
  (gen_random_uuid()::text, 'Rainy Day Vibes', (SELECT id FROM "User" WHERE username = 'morgan_lee' LIMIT 1), now()),
  (gen_random_uuid()::text, 'Road Trip Hits', (SELECT id FROM "User" WHERE username = 'casey_wood' LIMIT 1), now()),
  (gen_random_uuid()::text, 'Focus & Study', (SELECT id FROM "User" WHERE username = 'riley_nguyen' LIMIT 1), now()),
  (gen_random_uuid()::text, 'Summer Party Mix', (SELECT id FROM "User" WHERE username = 'quinn_foster' LIMIT 1), now()),
  (gen_random_uuid()::text, 'Acoustic Sessions', (SELECT id FROM "User" WHERE username = 'skyler_hall' LIMIT 1), now()),
  (gen_random_uuid()::text, 'Indie Discoveries', (SELECT id FROM "User" WHERE username = 'taylor_kim' LIMIT 1), now()),
  (gen_random_uuid()::text, '90s Throwbacks', (SELECT id FROM "User" WHERE username = 'reese_parker' LIMIT 1), now());

INSERT INTO "Track" (id, title, artist, "playlistId")
VALUES
  (gen_random_uuid()::text, 'Starlight', 'The Midnight', (SELECT id FROM "Playlist" WHERE name = 'Chill Lofi Beats' LIMIT 1)),
  (gen_random_uuid()::text, 'Stronger', 'Kanye West', (SELECT id FROM "Playlist" WHERE name = 'Workout Energy' LIMIT 1)),
  (gen_random_uuid()::text, 'Code Red', 'Perturbator', (SELECT id FROM "Playlist" WHERE name = 'Late Night Coding' LIMIT 1)),
  (gen_random_uuid()::text, 'Holocene', 'Bon Iver', (SELECT id FROM "Playlist" WHERE name = 'Rainy Day Vibes' LIMIT 1)),
  (gen_random_uuid()::text, 'Blinding Lights', 'The Weeknd', (SELECT id FROM "Playlist" WHERE name = 'Road Trip Hits' LIMIT 1)),
  (gen_random_uuid()::text, 'Weightless', 'Marconi Union', (SELECT id FROM "Playlist" WHERE name = 'Focus & Study' LIMIT 1)),
  (gen_random_uuid()::text, 'Levitating', 'Dua Lipa', (SELECT id FROM "Playlist" WHERE name = 'Summer Party Mix' LIMIT 1)),
  (gen_random_uuid()::text, 'The Scientist', 'Coldplay', (SELECT id FROM "Playlist" WHERE name = 'Acoustic Sessions' LIMIT 1)),
  (gen_random_uuid()::text, 'Breezeblocks', 'Alt-J', (SELECT id FROM "Playlist" WHERE name = 'Indie Discoveries' LIMIT 1)),
  (gen_random_uuid()::text, 'Smells Like Teen Spirit', 'Nirvana', (SELECT id FROM "Playlist" WHERE name = '90s Throwbacks' LIMIT 1));
