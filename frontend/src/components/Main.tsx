import React, { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import { saveGame, Game } from "../services/gameService";

interface Player {
  id: string;
  balance: number;
}

const socket: typeof io.Socket = io("http://localhost:3000");

const userId = 1; // Ateityje paimsi iš auth konteksto
const defaultBet = 200;

// 🔹 End game funkcija
function endGame(result: Game["result"], newBalance: number): void {
  saveGame({
    user_id: userId,
    result: result,         // "win" | "lose" | "draw"
    bet: defaultBet,
    balance_after: newBalance,
  })
    .then((res) => {
      console.log("✅ Žaidimas išsaugotas:", res);
    })
    .catch((err: any) => {
      console.error("❌ Nepavyko išsaugoti žaidimo:", err.message);
    });
}

const Main: React.FC = () => {
  const [players, setPlayers] = useState<Record<string, Player>>({});

  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ Prisijungta prie serverio!");
    });

    socket.on("players", (playersData: Record<string, Player>) => {
      setPlayers(playersData);
    });

    return () => {
      socket.off("players");
    };
  }, []);

  const placeBet = (amount: number): void => {
    socket.emit("bet", amount);
  };

  return (
    <div>
      <h1>Blackjack žaidimas</h1>
      <button onClick={() => placeBet(100)}>Statyti 100</button>

      <h2>Žaidėjai:</h2>
      <pre>{JSON.stringify(players, null, 2)}</pre>
    </div>
  );
};

export default Main;
