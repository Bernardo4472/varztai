import { Router, Request, Response } from "express";
import db from "../../config/db";

const router = Router();

router.put("/:id/balance", async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const { newBalance } = req.body as { newBalance: number };

  try {
    const result = await db.query(
      "UPDATE users SET balance = $1 WHERE id = $2 RETURNING id, balance",
      [newBalance, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Vartotojas nerastas" });
    }

    res.status(200).json({ message: "Balansas atnaujintas", data: result.rows[0] });
  } catch (err) {
    console.error("❌ Klaida atnaujinant balansą:", err);
    res.status(500).json({ message: "Serverio klaida" });
  }
});

export default router;
