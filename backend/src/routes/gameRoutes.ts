import express, { Request, Response } from "express";
import db from "../config/db";

const router = express.Router();
 
interface GameCreateRequestBody {
  user_id: number;
  result: string;
  bet: number;
  balance_after: number;
}

// 🔹 Įrašyti žaidimo rezultatą
router.post("/", async (req: Request, res: Response): Promise<any> => {
  const { user_id, result, bet, balance_after } = req.body as {
    user_id: number;
    result: string;
    bet: number;
    balance_after: number;
  };

  if (!user_id || !result || !bet || !balance_after) {
    return res.status(400).json({ message: "Trūksta laukų." });
  }

  try {
    const insert = await db.query(
      "INSERT INTO games (user_id, result, bet, balance_after) VALUES ($1, $2, $3, $4) RETURNING *",
      [user_id, result, bet, balance_after]
    );

    res.status(201).json({ message: "🎲 Žaidimo rezultatas išsaugotas", game: insert.rows[0] });
  } catch (err) {
    console.error("❌ Klaida įrašant žaidimą:", err);
    res.status(500).json({ message: "Serverio klaida" });
  }
});

// 🔹 Gauti visus žaidimus vieno vartotojo
router.get("/:user_id", async (req: Request<{ user_id: string }>, res: Response) => {
  const { user_id } = req.params;

  try {
    const games = await db.query(
      "SELECT * FROM games WHERE user_id = $1 ORDER BY played_at DESC",
      [user_id]
    );
    res.status(200).json(games.rows);
  } catch (err) {
    console.error("❌ Klaida gaunant žaidimus:", err);
    res.status(500).json({ message: "Serverio klaida" });
  }
});

export default router;
