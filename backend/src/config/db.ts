import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const db = new Pool({
    connectionString: process.env.DATABASE_URL,
});

db.connect()
    .then(() => console.log("✅ Prisijungta prie PostgreSQL"))
    .catch((err: Error) => console.error("❌ DB klaida:", err));

export default db;
