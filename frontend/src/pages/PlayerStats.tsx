import React, { useState, useEffect } from 'react';
import styles from "./BlackjackGame.module.css";

interface PlayerStatsProps {
  playerId: string;
  gameState: any; // Tiesiog pateikiame bet kokio tipo objektą, priklausomai nuo žaidimo logikos
}

const PlayerStats: React.FC<PlayerStatsProps> = ({ playerId, gameState }) => {
  const [stats, setStats] = useState({
    wins: 0,
    losses: 0,
    totalWon: 0,
    totalLost: 0,
  });

  // Atnaujinti statistiką po kiekvieno žaidimo
  useEffect(() => {
    const playerStats = gameState.players[playerId]?.stats;
    if (playerStats) {
      setStats(playerStats);
    }
  }, [gameState, playerId]); // Atnaujinti kai gameState arba playerId pasikeičia

  return (
    <div className={styles.playerStats}>
      <h3>Player Stats</h3>
      <p>Wins: {stats.wins}</p>
      <p>Losses: {stats.losses}</p>
      <p>Total Won: {stats.totalWon}$</p>
      <p>Total Lost: {stats.totalLost}$</p>
    </div>
  );
};

export default PlayerStats;
