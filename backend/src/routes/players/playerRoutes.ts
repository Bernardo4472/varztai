import { Router, Request, Response } from "express";
import db from "../../config/db"; // Assuming db is correctly configured Pool instance

const router = Router();

// PATCH route to adjust balance by a certain amount
router.patch("/:id/balance", async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  // Expecting changeAmount (can be positive or negative)
  const { changeAmount } = req.body as { changeAmount: number };

  if (typeof changeAmount !== 'number') {
    return res.status(400).json({ message: "Invalid changeAmount provided" });
  }

  try {
    // Update balance by adding the changeAmount
    // Ensure balance doesn't go below zero (or handle as needed)
    const result = await db.query(
      `UPDATE users 
       SET balance = GREATEST(0, balance + $1) 
       WHERE id = $2 
       RETURNING id, username, email, balance`, // Return updated user info
      [changeAmount, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Log the updated balance before sending response
    console.log(`DEBUG: Balance updated for user ${id}. New data:`, result.rows[0]); 

    res.status(200).json({ message: "Balansas atnaujintas", data: result.rows[0] });
  } catch (err) {
    console.error("❌ Klaida atnaujinant balansą:", err); // Original Lithuanian: Error updating balance
    res.status(500).json({ message: "Serverio klaida" });
  }
});

// GET route to fetch user details (including balance) by ID
router.get("/:id", async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;

  // Basic validation for ID
  if (!/^\d+$/.test(id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
  }

  try {
    const result = await db.query(
      "SELECT id, username, email, balance FROM users WHERE id = $1",
      [parseInt(id, 10)] // Ensure ID is treated as a number
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return only the user data, not wrapped in another 'data' object unless intended
    res.status(200).json(result.rows[0]); 
  } catch (err) {
    console.error("❌ Error fetching user data:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH route to update player game statistics
router.patch("/:id/stats", async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;
    // Expecting 'result' which can be 'win', 'loss', or 'push'/'tie'
    const { result: gameResult } = req.body as { result: 'win' | 'loss' | 'push' | 'tie' };

    let winIncrement = 0;
    let lossIncrement = 0;

    if (gameResult === 'win') {
        winIncrement = 1;
    } else if (gameResult === 'loss') {
        lossIncrement = 1;
    } else if (gameResult === 'push' || gameResult === 'tie') {
        // No win/loss increment, but still increment games played
    } else {
        return res.status(400).json({ message: "Invalid game result provided" });
    }

    try {
        // Increment wins, losses, and games_played in one query
        const updateResult = await db.query(
            `UPDATE users 
             SET 
               wins = wins + $1, 
               losses = losses + $2, 
               games_played = games_played + 1 
             WHERE id = $3
             RETURNING id, username, wins, losses, games_played`, // Return updated stats
            [winIncrement, lossIncrement, id]
        );

        if (updateResult.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        console.log(`DEBUG: Stats updated for user ${id}. New stats:`, updateResult.rows[0]);
        res.status(200).json({ message: "Statistika atnaujinta", data: updateResult.rows[0] }); // Lithuanian: Statistics updated

    } catch (err) {
        console.error("❌ Klaida atnaujinant statistiką:", err); // Lithuanian: Error updating statistics
        res.status(500).json({ message: "Serverio klaida" });
    }
});


export default router;
