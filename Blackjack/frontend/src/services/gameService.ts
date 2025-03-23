const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

// 🔹 Tipas vienam žaidimui
export interface Game {
  user_id: number;
  result: "win" | "lose" | "draw";
  bet: number;
  balance_after: number;
}

// 🔹 Atsakymo tipas iš serverio
interface SaveGameResponse {
  message: string;
  game: {
    id: number;
    user_id: number;
    result: string;
    bet: number;
    balance_after: number;
    played_at: string;
  };
}

// 🔹 Pagrindinė funkcija
export async function saveGame(game: Game): Promise<SaveGameResponse> {
  try {
    const response = await fetch(`${API_URL}/games`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(game)
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Nepavyko išsaugoti žaidimo");

    return data;
  } catch (err: any) {
    console.error("❌ Klaida išsaugant žaidimą:", err.message);
    throw err;
  }
}
