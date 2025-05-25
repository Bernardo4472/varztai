import React, { useState, useEffect } from 'react';
import styles from "./BlackjackGame.module.css";
// Removed useAuth and getPlayerDetails as we rely on gameState now
// import { useAuth } from '../../../context/AuthContext';
// import { getPlayerDetails } from '../../../services/playerService';
import { BlackjackGameState, PlayerGameState, Card as GameCard } from '../../../types/gameTypes'; // Use types from frontend
import { useAuth } from "../../../context/AuthContext";

// Define Props interface
interface BlackjackGameProps {
  gameState: BlackjackGameState;
  myPlayerId: string | null;
  roomId?: string; // Optional, for display
  onPlayerAction: (action: { actionType: string; payload?: any }) => void;
}

// --- Constants ---
const DEFAULT_BET = 10; // Default for the input field, maybe use gameState.minBet

// Card component using GameCard type from import
// Helper to map backend suit codes to frontend/filename suits
const suitMap: { [key: string]: string } = {
  H: 'Hearts',
  D: 'Diamond',
  C: 'Clubs',
  S: 'Spades',
};

const CardComponent: React.FC<{ card: GameCard | 'back' }> = ({ card }) => {
  if (!card) return null;
  
  // Map rank 'T' to '10' for filename consistency
  const fileRank = (card !== 'back' && card.rank === 'T') ? '10' : (card !== 'back' ? card.rank : '');
  // Map backend suit ('H', 'D', etc.) to full name ('Hearts', 'Diamond', etc.)
  const fileSuit = (card !== 'back' && suitMap[card.suit]) ? suitMap[card.suit] : (card !== 'back' ? card.suit : ''); // Fallback just in case

  // Use mapped suit and rank for the image path
  const imagePath = card === 'back' ? `/images/back.png` : `/images/${fileSuit}-${fileRank}.png`;
  
  return (
    <div className={styles.card}>
      <img src={imagePath} alt={card === 'back' ? 'Card Back' : `${card.suit}-${card.rank}`} style={{ width: '100%', height: 'auto' }}/>
    </div>
  );
};

// Function to play sound effects
const playSound = (soundFile: string): void => {
  const sound = new Audio(`/sounds/${soundFile}`);
  sound.play().catch(e => console.error("Error playing sound:", e));
};

// Blackjack Game component accepting props
const BlackjackGame: React.FC<BlackjackGameProps> = ({
  gameState,
  myPlayerId,
  roomId,
  onPlayerAction
}) => {

  // --- Local UI State ---
  const [betAmountInput, setBetAmountInput] = useState<string>(String(gameState.minBet || DEFAULT_BET));
  const [error, setError] = useState<string | null>(null); // Keep for local UI errors
  const { user } = useAuth();
  // Update bet input default when minBet changes (e.g., first gameState received)
  useEffect(() => {
    setBetAmountInput(String(gameState.minBet || DEFAULT_BET));
  }, [gameState.minBet]);

  // --- Game Actions (Use onPlayerAction prop) ---
  const hit = (): void => {
    playSound('card-draw.mp3');
    onPlayerAction({ actionType: 'HIT' });
  };

  const stand = (): void => {
    playSound('button-click.mp3');
    onPlayerAction({ actionType: 'STAND' });
  };

  const doubleDown = (): void => {
    // Optional: Add sound effect for double down
    playSound('button-click.mp3'); // Reuse click sound or add specific one
    onPlayerAction({ actionType: 'DOUBLE_DOWN' });
  };

  // --- Betting Actions (Use onPlayerAction prop) ---
  const changeBetInput = (amount: number): void => {
    playSound('button-click.mp3');
    const myBalance = myPlayerId ? gameState.players[myPlayerId]?.balance : null;
    setBetAmountInput((prev) => {
        const currentVal = parseInt(prev, 10) || 0;
        const newVal = currentVal + amount;
        const validatedVal = Math.max(gameState.minBet, Math.min(newVal, myBalance ?? Infinity, gameState.maxBet));
        return String(validatedVal);
    });
  };

  const handlePlaceBetAction = (): void => {
    const amount = parseInt(betAmountInput, 10);
    const myBalance = myPlayerId ? gameState.players[myPlayerId]?.balance : null;

    if (isNaN(amount) || amount < gameState.minBet || amount > gameState.maxBet) {
        setError(`Invalid bet amount. Must be between ${gameState.minBet} and ${gameState.maxBet}.`);
        return;
    }
    if (myBalance !== undefined && myBalance !== null && amount > myBalance) {
         setError("Insufficient balance.");
         return;
    }

    playSound('button-click.mp3');
    onPlayerAction({ actionType: 'PLACE_BET', payload: { amount } });
    setError(null);
  };

  // --- Render Logic (Adapted for gameState prop) ---
  const renderPlayerSpots = () => {
    const players = gameState.players;
    const dealer = gameState.dealer;
    const allPlayerIds = Object.keys(players);
    const otherPlayerIds = allPlayerIds.filter(id => id !== myPlayerId);

    const playerSpotStyles = [
      styles.playerSelfSpot, styles.playerOtherSpot1, styles.playerOtherSpot2,
      styles.playerOtherSpot3, styles.playerOtherSpot4, styles.playerOtherSpot5,
      styles.playerOtherSpot6,
    ];

    const playerElements: React.ReactNode[] = [];
    let assignedSpots = 0;

    // Render self
    if (myPlayerId && players[myPlayerId]) {
      const player = players[myPlayerId];
      const isActive = gameState.currentPlayerTurn === player.id;
      playerElements.push(
        <div key={player.id} className={`${styles.playerSpot} ${playerSpotStyles[0]} ${isActive ? styles.activeTurn : ''}`}>
          {/* Hand Container now inside player spot */}
          <div className={`${styles.handContainer}`}> 
            {player.hand.map((card, index) => (
              <CardComponent key={`player-${player.id}-${index}`} card={card} />
            ))}
          </div>
          {/* Player Info Below Cards */}
          <div className={styles.playerInfo}>
            {user?.username} (You)
            {player.balance !== undefined && <div className={styles.balance}>{player.balance}$</div>}
            {player.bet !== null && <div className={styles.betIndicator}>Bet: {player.bet}$</div>}
            {player.hand.length > 0 && (
              <span className={styles.handValue}>Total: {player.score} ({player.status})</span>
            )}
          </div>
        </div>
      );
      assignedSpots++;
    }

    // Render others
    otherPlayerIds.forEach(playerId => {
      if (assignedSpots >= playerSpotStyles.length) return;
      const player = players[playerId];
      const isActive = gameState.currentPlayerTurn === player.id;
      playerElements.push(
         <div key={player.id} className={`${styles.playerSpot} ${playerSpotStyles[assignedSpots]} ${isActive ? styles.activeTurn : ''}`}>
           {/* Hand Container now inside player spot */}
           <div className={`${styles.handContainer}`}>
            {player.hand.map((card, index) => (
              <CardComponent key={`player-${player.id}-${index}`} card={card} />
            ))}
          </div>
           {/* Player Info Below Cards */}
           <div className={styles.playerInfo}>
            {player.name}
            {player.balance !== undefined && <div className={styles.balance}>{player.balance}$</div>}
            {player.bet !== null && <div className={styles.betIndicator}>Bet: {player.bet}$</div>}
            {player.hand.length > 0 && (
              <span className={styles.handValue}>Total: {player.score} ({player.status})</span>
            )}
          </div>
        </div>
      );
      assignedSpots++;
    });

     // Fill remaining spots with placeholders
     while (assignedSpots < playerSpotStyles.length) {
        playerElements.push(
            <div key={`empty-${assignedSpots}`} className={`${styles.playerSpot} ${playerSpotStyles[assignedSpots]}`}>
                No Player
            </div>
        );
        assignedSpots++;
     }

    return (
      <>
        {/* Dealer - Also move hand inside */}
        <div className={`${styles.playerSpot} ${styles.dealerSpot}`}>
           {/* Hand Container now inside dealer spot */}
           <div className={`${styles.handContainer}`}>
            {dealer.hand.map((card, index) => (
              <CardComponent key={`dealer-${index}`} card={card} />
            ))}
          </div>
           {/* Dealer Info Below Cards */}
           <div className={styles.playerInfo}>
            Dealer
            {(gameState.gamePhase !== 'player_turns' || dealer.status === 'blackjack') && dealer.hand.length > 0 && (
              <span className={styles.handValue}>Total: {dealer.score} ({dealer.status})</span>
            )}
            {gameState.gamePhase === 'player_turns' && dealer.hand.length > 0 && !dealer.hand[0]?.isFaceDown && (
               <span className={styles.handValue}>Shows: {dealer.hand[0]?.value === 11 ? 'A' : dealer.hand[0]?.value}</span>
            )}
          </div>
        </div>
        {/* Render player elements */}
        {playerElements}
      </>
    );
  };

  // --- Effects ---
  // Removed useEffect for fetching player details - rely on gameState

  // --- Loading & Error States ---
  // Removed loading/error checks related to local data fetching

  // --- Render Controls Logic ---
  const renderControls = () => {
    const myPlayerState = myPlayerId ? gameState.players[myPlayerId] : null;
    // If myPlayerState is null (maybe briefly during join/leave), don't render controls
    if (!myPlayerState) return null; 

    const isMyTurn = gameState.currentPlayerTurn === myPlayerId;

    // Betting Phase Controls
    if (gameState.gamePhase === 'betting' && myPlayerState.status === 'betting') {
      return (
        <>
          <div className={styles.bettingControls}>
            <div className={styles.betSection}>Adjust Bet:</div>
            <div className={styles.betSection}><button className={styles.betChangeButton} onClick={() => changeBetInput(-50)}>- 50</button></div>
            <div className={styles.betSection}><button className={styles.betChangeButton} onClick={() => changeBetInput(-10)}>- 10</button></div>
            <div className={styles.betSection}><button className={styles.betChangeButton} onClick={() => changeBetInput(10)}>+ 10</button></div>
            <div className={styles.betSection}><button className={styles.betChangeButton} onClick={() => changeBetInput(50)}>+ 50</button></div>
            <div className={styles.betSection}><button className={styles.betChangeButton} onClick={handlePlaceBetAction}>Set Bet: {betAmountInput}$</button></div>
          </div>
        </>
      );
    }

    // Player's Turn Controls
    if (gameState.gamePhase === 'player_turns' && isMyTurn && myPlayerState.status === 'playing') {
       const canHit = myPlayerState.canHit ?? false;
       const canStand = myPlayerState.canStand ?? false;
       const canDouble = myPlayerState.canDouble ?? false; // Get canDouble flag

      return (
        <>
          {myPlayerState.bet !== null && <div className={styles.bettingControls}><div className={styles.betSection}>Bet Placed: <span className={styles.betAmountDisplay}>{myPlayerState.bet}$</span></div></div>}
          <div className={styles.readyControls}>
            <button className={styles.betButton} onClick={hit} disabled={!canHit}>Hit</button>
            <button className={styles.betButton} onClick={stand} disabled={!canStand}>Stand</button>
            {/* Add Double Down Button */}
            <button className={styles.betButton} onClick={doubleDown} disabled={!canDouble}>Double</button> 
          </div>
        </>
      );
    }

    // Round Over / Waiting for Next Round Controls
    if (gameState.gamePhase === 'round_over') {
      return (
          <div className={styles.readyControls}>
              Waiting for next round...
          </div>
      );
    }

    // Default: Show bet if placed, otherwise status
    if (myPlayerState.bet !== null) {
         return <div className={styles.bettingControls}><div className={styles.betSection}>Bet Placed: <span className={styles.betAmountDisplay}>{myPlayerState.bet}$</span></div></div>;
    }
    // Check if myPlayerState exists before accessing status (already checked above)
    return <div className={styles.readyControls}><span style={{ color: '#aaa' }}>{myPlayerState.status}...</span></div>;

  };

  // --- Main Component Return ---
  return (
    <div className={styles.gameScreen}>
      <div className={styles.gameTable}>
        <div className={styles.tableCenterText}><h2>Blackjack pays 3 to 2</h2><p>Dealer must stand on 17</p></div>
        {renderPlayerSpots()}
        {/* Message log is now moved below controlsArea */}
      </div>
      <div className={styles.controlsArea}>
        {error && <div style={{ color: 'red', marginBottom: '10px' }}>Error: {error}</div>}
        {renderControls()}
        <div className={styles.roomIdDisplay}>Room ID: {roomId || 'N/A'}</div>
      </div>
      {/* New Message Log Area */}
      <div className={styles.messageLogArea}>
        <h3>Game Log</h3>
        <div className={styles.messageLogContent}>
          {gameState.messageLog && gameState.messageLog.slice(-4).map((msg, index) => ( // Display last 4 messages
            <p key={`log-${gameState.roundId}-${gameState.messageLog.length - 4 + index}`} className={styles.messageLogEntry}>
              {msg}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlackjackGame;
