import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../../config/db";

const router = Router();
router.get("/register", (_req: Request, res: Response) => {
  res.send("✅ Register endpoint gyvas! Naudok POST, ne GET.");
});
router.post("/register", async (req: Request, res: Response): Promise<any> => {
  const { username, email, password } = req.body as {
    username: string;
    email: `${string}@${string}.com`;
    password: string;
  };

  try {
    const userExists = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: "Toks el. paštas jau naudojamas." });
    }
    if (! email.includes("@")) {
      return res.status(400).json({ message: "Blogas el. pašto formatas" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    // Add balance and stats to the INSERT statement with default values
    await db.query(
      "INSERT INTO users (username, email, password, balance, wins, losses, games_played) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [username, email, hashedPassword, 1000, 0, 0, 0] // Set initial balance and stats
    );

    res.status(201).json({ message: "Registracija sėkminga!" });
  } catch (err) {
    console.error("❌ REG klaida:", err);
    res.status(500).json({ message: "Serverio klaida" });
  }
});

router.post("/login", async (req: Request, res: Response): Promise<any> => {
  const { email, password } = req.body as {
    email: string;
    password: string;
  };

  try {
    const userResult = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = userResult.rows[0];

    if (!user) {
      return res.status(400).json({ message: "Vartotojas nerastas" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Neteisingas slaptažodis" });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, {
      expiresIn: "7d",
    });

    res.status(200).json({
      message: "Prisijungimas sėkmingas",
      token,
      userId: user.id, // Add userId to the response
      username: user.username,
      balance: user.balance,
    });
  } catch (err) {
    console.error("❌ LOGIN klaida:", err);
    res.status(500).json({ message: "Serverio klaida" });
  }
});

export default router;
