-- 🔹 1. Sukuriame duomenų bazės vartotoją
CREATE USER blackjack_user WITH PASSWORD 'supersecurepassword';

-- 🔹 2. Sukuriame duomenų bazę
CREATE DATABASE blackjack WITH OWNER blackjack_user;

-- 🔹 3. Prisijungiame prie šios duomenų bazės
\c blackjack

-- 🔹 4. Suteikiame visas teises šiai duombazei
GRANT ALL PRIVILEGES ON DATABASE blackjack TO blackjack_user;

-- 🔹 5. Sukuriame lentelę „users“
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    balance INTEGER DEFAULT 1000
);

-- 🔹 6. Sukuriame lentelę „games“
CREATE TABLE games (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    result TEXT NOT NULL,             -- Pvz: 'win', 'lose', 'draw'
    bet INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 🔹 7. Suteikiame teises lentelėms ir sekoms
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO blackjack_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO blackjack_user;
