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

export default router;
