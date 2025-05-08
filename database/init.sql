-- Ensure the users table exists (id, username, email, password, balance are essential)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  balance NUMERIC DEFAULT 0
);

-- Add statistics columns using ALTER TABLE IF NOT EXISTS (more robust)
-- Note: Standard SQL doesn't have IF NOT EXISTS for ADD COLUMN, so we use a common workaround
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'wins') THEN
        ALTER TABLE users ADD COLUMN wins INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'losses') THEN
        ALTER TABLE users ADD COLUMN losses INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'games_played') THEN
        ALTER TABLE users ADD COLUMN games_played INTEGER DEFAULT 0;
    END IF;
END $$;


-- Seed data (optional, will only insert if email doesn't exist)
-- Ensure this runs *after* potential ALTER TABLE commands
INSERT INTO users (username, email, password, balance, wins, losses, games_played)
VALUES ('testuser', 'test@example.com', 'hashed_password', 1000.0, 0, 0, 0)
ON CONFLICT(email) DO NOTHING;
