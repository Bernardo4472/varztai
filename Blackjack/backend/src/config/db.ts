import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const db = new Pool({
    user: process.env.DB_USER as string,
    host: process.env.DB_HOST as string,
    database: process.env.DB_NAME as string,
    password: process.env.DB_PASS as string,
    port: parseInt(process.env.DB_PORT as string, 10),
});

db.connect()
    .then(() => console.log("✅ Prisijungta prie PostgreSQL"))
    .catch((err: Error) => console.error("❌ DB klaida:", err));

export default db;
