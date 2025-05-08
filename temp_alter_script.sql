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
