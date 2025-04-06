-- schema.sql turinys čia
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  balance NUMERIC DEFAULT 0
);

-- seed.sql turinys čia (jei reikia)
INSERT INTO users (username, email, password, balance)
VALUES ('testuser', 'test@example.com', 'hashed_password', 100.0)
ON CONFLICT DO NOTHING;
