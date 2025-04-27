import React, { useState, useEffect } from 'react';
import styles from "./BlackjackGame.module.css";
import { useAuth } from '../../../context/AuthContext'; // Import useAuth hook
import { getPlayerDetails, updatePlayerBalance } from '../../../services/playerService'; // Adjust path if needed

// Define types for our card and game state
interface Card {
  suit: string;
  rank: string;
}
   


// --- Constants ---
const MOCK_ROOM_ID = "AFJA"; // Keep Room ID for now
const MIN_BET = 10;
const DEFAULT_BET = 50;
// --- End Constants ---

// Card component
const CardComponent: React.FC<{ card: Card | 'back' }> = ({ card }) => {
  if (!card) return null;
  const imagePath = card === 'back' ? `/images/back.png` : `/images/${card.suit}-${card.rank}.png`;
  return (
    <div className={styles.card}>
      <img src={imagePath} alt={card === 'back' ? 'Card Back' : `${card.suit}-${card.rank}`} />
    </div>
  );
};

// Function to play sound effects
const playSound = (soundFile: string): void => {
  const sound = new Audio(`/sounds/${soundFile}`);
  sound.play().catch(e => console.error("Error playing sound:", e));
};

// Blackjack Game component
const BlackjackGame: React.FC = () => {
  // --- Auth State ---
  const { user, token, isLoading: isAuthLoading } = useAuth();
  const userId = user?.id;

  // --- Game State ---
  const suits = ['Hearts', 'Diamond', 'Clubs', 'Spades'];
  const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [gameOver, setGameOver] = useState<boolean>(true);
  const [gameMessage, setGameMessage] = useState<string>("Start a new game to play!");

  // --- Player & Betting State ---
  const [currentBet, setCurrentBet] = useState<number>(DEFAULT_BET);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [isAutoReady, setIsAutoReady] = useState<boolean>(false);
  const [lockedBet, setLockedBet] = useState<number | null>(null);
  const [playerBalance, setPlayerBalance] = useState<number | null>(null);
  const [playerName, setPlayerName] = useState<string>("");
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // --- Deck and Hand Logic ---
  const createDeck = (): Card[] => {
    const newDeck: Card[] = [];
    suits.forEach(suit => { ranks.forEach(rank => { newDeck.push({ rank, suit }); }); });
    return newDeck;
  };

  const shuffleDeck = (deckToShuffle: Card[]): Card[] => {
    let shuffledDeck = [...deckToShuffle];
    for (let i = shuffledDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
    }
    return shuffledDeck;
  };

  const drawCard = (currentDeck: Card[]): { card: Card | null, updatedDeck: Card[] } => {
    if (currentDeck.length === 0) { console.warn("Deck empty."); return { card: null, updatedDeck: [] }; }
    const deckCopy = [...currentDeck];
    const card = deckCopy.pop() as Card;
    return { card, updatedDeck: deckCopy };
  };

  const calculateHandValue = (hand: Card[]): number => {
    let total = 0; let aceCount = 0;
    hand.forEach(card => {
      if (!card) return;
      if (card.rank === 'A') { total += 11; aceCount += 1; }
      else if (['K', 'Q', 'J'].includes(card.rank)) { total += 10; }
      else { total += parseInt(card.rank, 10); }
    });
    while (total > 21 && aceCount > 0) { total -= 10; aceCount -= 1; }
    return total;
  };

  // --- Game Actions ---
  const startNewRound = (): void => {
    if (playerBalance === null) { setError("Cannot start: Balance not loaded."); return; }
    playSound('button-click.mp3');
    setDeck(shuffleDeck(createDeck()));
    setPlayerHand([]); setDealerHand([]); setGameOver(false);
    setGameMessage("Place your bet!"); setIsReady(false); setLockedBet(null);
    // Reset bet clamped between MIN_BET and playerBalance
    const newBetOnRoundStart = Math.max(MIN_BET, Math.min(DEFAULT_BET, playerBalance));
    console.log(`DEBUG: startNewRound - Setting currentBet to: ${newBetOnRoundStart} (Balance: ${playerBalance})`);
    setCurrentBet(newBetOnRoundStart);
  };

  const dealInitialCards = (): void => {
    let currentDeck = deck; let pHand: Card[] = []; let dHand: Card[] = [];
    let card1, card2, card3, card4;
    ({ card: card1, updatedDeck: currentDeck } = drawCard(currentDeck));
    ({ card: card2, updatedDeck: currentDeck } = drawCard(currentDeck));
    ({ card: card3, updatedDeck: currentDeck } = drawCard(currentDeck));
    ({ card: card4, updatedDeck: currentDeck } = drawCard(currentDeck));
    if (card1) pHand.push(card1); if (card2) dHand.push(card2);
    if (card3) pHand.push(card3); if (card4) dHand.push(card4);
    setDeck(currentDeck); setPlayerHand(pHand); setDealerHand(dHand); setGameMessage("");
    if (calculateHandValue(pHand) === 21) { console.log("Player Blackjack!"); }
  };

  const hit = (): void => {
    if (gameOver || lockedBet === null || playerHand.length === 0) return;
    playSound('card-draw.mp3');
    const { card, updatedDeck } = drawCard(deck);
    if (card) {
      const newPlayerHand = [...playerHand, card];
      setPlayerHand(newPlayerHand); setDeck(updatedDeck);
      if (calculateHandValue(newPlayerHand) > 21) { determineWinner(newPlayerHand, dealerHand); setGameOver(true); }
    }
  };

  const stand = (): void => {
    if (gameOver || lockedBet === null || playerHand.length === 0) return;
    playSound('button-click.mp3');
    dealerTurn(deck, dealerHand, playerHand);
  };

  const dealerTurn = (currentDeck: Card[], currentDealerHand: Card[], currentPlayerHand: Card[]): void => {
    let hand = [...currentDealerHand]; let deckAfterDraws = [...currentDeck];
    let dealerTotal = calculateHandValue(hand);
    while (dealerTotal < 17) {
      playSound('card-draw.mp3');
      const { card, updatedDeck } = drawCard(deckAfterDraws);
      if (!card) break;
      hand = [...hand, card]; dealerTotal = calculateHandValue(hand); deckAfterDraws = updatedDeck;
    }
    setDealerHand(hand); setDeck(deckAfterDraws); playSound('dealer-turn.mp3');
    determineWinner(currentPlayerHand, hand); setGameOver(true);
  };

  const determineWinner = (pHand: Card[], dHand: Card[]): void => {
    const playerTotal = calculateHandValue(pHand); const dealerTotal = calculateHandValue(dHand);
    let roundMessage = ""; let balanceChange = 0; const currentLockedBet = lockedBet ?? 0;
    const playerHasBlackjack = playerTotal === 21 && pHand.length === 2;
    const dealerHasBlackjack = dealerTotal === 21 && dHand.length === 2;

    if (playerHasBlackjack && dealerHasBlackjack) { roundMessage = "Push! Both Blackjack!"; balanceChange = 0; }
    else if (playerHasBlackjack) { roundMessage = "Blackjack! You win!"; playSound('win.wav'); balanceChange = Math.floor(currentLockedBet * 1.5); }
    else if (dealerHasBlackjack) { roundMessage = "Dealer Blackjack! Dealer wins!"; playSound('lose.wav'); balanceChange = -currentLockedBet; }
    else if (playerTotal > 21) { roundMessage = "You busted! Dealer wins!"; playSound('lose.wav'); balanceChange = -currentLockedBet; }
    else if (dealerTotal > 21) { roundMessage = "Dealer busted! You win!"; playSound('win.wav'); balanceChange = currentLockedBet; }
    else if (playerTotal > dealerTotal) { roundMessage = "You win!"; playSound('win.wav'); balanceChange = currentLockedBet; }
    else if (playerTotal < dealerTotal) { roundMessage = "Dealer wins!"; playSound('lose.wav'); balanceChange = -currentLockedBet; }
    else { roundMessage = "It's a push (tie)!"; balanceChange = 0; }

    setGameMessage(roundMessage);

    if (userId && token && balanceChange !== 0) {
      updatePlayerBalance(userId, balanceChange, token)
        .then(response => {
            // Ensure balance from response is treated as a number
            const updatedBalance = Number(response.data.balance);
            setPlayerBalance(updatedBalance);
            console.log("Balance updated successfully:", updatedBalance);
        })
        .catch(err => { console.error("Balance update failed:", err); setError("Balance update failed."); });
    } else if (balanceChange === 0) { console.log("Balance unchanged."); }
    else { console.error("Cannot update balance: Auth missing."); setError("Auth error."); }
  };

  // --- Betting Actions ---
  const changeBet = (amount: number): void => {
    playSound('button-click.mp3');
    if (lockedBet !== null || playerBalance === null) return;
    setCurrentBet((prev: number) => Math.max(MIN_BET, Math.min(playerBalance, prev + amount)));
  };

  const handleSetBet = (): void => {
    if (playerBalance === null || currentBet > playerBalance) { setGameMessage("Insufficient balance!"); return; }
    if (currentBet >= MIN_BET) {
      playSound('button-click.mp3'); setLockedBet(currentBet);
      setGameMessage(`Bet of ${currentBet}$ placed. Click Ready.`);
      console.log(`Bet set to: ${currentBet}`);
    }
  };

  const handleReadyClick = (): void => {
    if (lockedBet === null) { setGameMessage("Please set bet first!"); return; }
    playSound('button-click.mp3'); setIsReady(true);
    console.log("Player ready status set to: true");
  };

  const handleAutoReadyChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setIsAutoReady(e.target.checked); console.log("Auto Ready:", e.target.checked);
  };

  // --- Render Logic ---
  const renderPlayerSpots = () => {
    const otherPlayerSpots = [
      { id: 'p1', name: 'No Player', style: styles.playerOtherSpot1 }, { id: 'p2', name: 'No Player', style: styles.playerOtherSpot2 },
      { id: 'p3', name: 'No Player', style: styles.playerOtherSpot3 }, { id: 'p4', name: 'No Player', style: styles.playerOtherSpot4 },
      { id: 'p5', name: 'No Player', style: styles.playerOtherSpot5 }, { id: 'p6', name: 'No Player', style: styles.playerOtherSpot6 },
    ];
    return (
      <>
        <div className={`${styles.playerSpot} ${styles.dealerSpot}`}>Dealer
          <div className={`${styles.handContainer} ${styles.dealerHand}`}>
            {dealerHand.map((card, index) => ((index === 0 && !gameOver && playerHand.length > 0 && dealerHand.length > 1) ? <CardComponent key={`dealer-back-${index}`} card='back' /> : <CardComponent key={`dealer-${index}`} card={card} />))}
          </div>
          {!gameOver && playerHand.length > 0 && dealerHand.length > 1 && (<span className={styles.handValue}>Shows: {calculateHandValue([dealerHand[1]])}</span>)}
          {gameOver && dealerHand.length > 0 && (<span className={styles.handValue}>Total: {calculateHandValue(dealerHand)}</span>)}
        </div>
        <div className={`${styles.playerSpot} ${styles.playerSelfSpot}`}>{playerName || "Player"}
          <div className={styles.balance}>{playerBalance !== null ? `${playerBalance}$` : "Loading..."}</div>
          <div className={`${styles.handContainer} ${styles.playerSelfHand}`}>
            {playerHand.map((card, index) => (<CardComponent key={`player-${index}`} card={card} />))}
          </div>
          {playerHand.length > 0 && (<span className={styles.handValue}>Total: {calculateHandValue(playerHand)}</span>)}
        </div>
        {otherPlayerSpots.map(spot => (<div key={spot.id} className={`${styles.playerSpot} ${spot.style}`}>{spot.name}</div>))}
      </>
    );
  };

  // --- Effects ---
  useEffect(() => { // Fetch initial player details
    if (userId && token && playerBalance === null && !isAuthLoading) {
      setIsLoadingData(true); setError(null);
      getPlayerDetails(userId, token)
        .then(data => {
            // Ensure fetched balance is treated as a number
            const fetchedBalance = Number(data.balance);
            setPlayerBalance(fetchedBalance);
            setPlayerName(data.username || "Player");
            // Set initial bet clamped correctly using the numeric balance
            const initialBet = Math.max(MIN_BET, Math.min(DEFAULT_BET, fetchedBalance));
            console.log(`DEBUG: useEffect - Fetched Balance: ${fetchedBalance}, Setting initial currentBet to: ${initialBet}`);
            setCurrentBet(initialBet);
            setIsLoadingData(false);
        })
        .catch(err => { console.error("Fetch details failed:", err); setError("Failed to load player data."); setIsLoadingData(false); });
    } else if (!isAuthLoading && !userId) { setError("User not authenticated."); setIsLoadingData(false); }
    else if (playerBalance !== null) { setIsLoadingData(false); }
  }, [userId, token, playerBalance, isAuthLoading]);

  useEffect(() => { // Deal cards when ready
    if (isReady && !gameOver && lockedBet !== null && playerHand.length === 0) {
      console.log("Ready state triggered dealing.");
      dealInitialCards();
    }
  }, [isReady, gameOver, lockedBet, playerHand.length]); // Note: dealInitialCards is stable

  // --- Loading & Error States ---
  if (isAuthLoading || isLoadingData) return <div className={styles.gameScreen}>Loading...</div>;
  if (error && !userId) return <div className={styles.gameScreen}>Error: {error} Please log in.</div>;
  if (playerBalance === null) return <div className={styles.gameScreen}>Error: Could not load player balance. {error}</div>;

  // --- Render Controls Logic ---
  const renderControls = () => {
    // Betting Phase
    if (!gameOver && lockedBet === null && playerHand.length === 0) {
        // Add diagnostic logging here
        console.log("DEBUG: RenderControls - Betting Phase Active", {
            currentBet,
            playerBalance, // Should be number now
            lockedBet,
            gameOver,
            playerHandLength: playerHand.length,
            // Evaluate disabled conditions directly for logging
            disableMinus50: lockedBet !== null || currentBet <= 50,
            disableMinus10: lockedBet !== null || currentBet <= MIN_BET,
            disablePlus10: lockedBet !== null || playerBalance === null || currentBet + 10 > Number(playerBalance), // Explicit cast
            disablePlus50: lockedBet !== null || playerBalance === null || currentBet + 50 > Number(playerBalance), // Explicit cast
            disableSetBet: lockedBet !== null || playerBalance === null || currentBet < MIN_BET || currentBet > Number(playerBalance) // Explicit cast
        });
      return (
        <>
          <div className={styles.bettingControls}>
            <div className={styles.betSection}>Current Bet: <span className={styles.betAmountDisplay}>{currentBet}$</span></div>
            <div className={styles.betSection}>Change Bet:</div>
            {/* Refined disabled logic */}
            <div className={styles.betSection}><button className={styles.betChangeButton} onClick={() => changeBet(-50)} disabled={lockedBet !== null || currentBet <= 50}>- 50</button></div>
            <div className={styles.betSection}><button className={styles.betChangeButton} onClick={() => changeBet(-10)} disabled={lockedBet !== null || currentBet <= MIN_BET}>- 10</button></div>
            {/* Explicitly cast playerBalance to Number in disabled checks */}
            <div className={styles.betSection}><button className={styles.betChangeButton} onClick={() => changeBet(10)} disabled={lockedBet !== null || playerBalance === null || currentBet + 10 > Number(playerBalance)}>+ 10</button></div>
            <div className={styles.betSection}><button className={styles.betChangeButton} onClick={() => changeBet(50)} disabled={lockedBet !== null || playerBalance === null || currentBet + 50 > Number(playerBalance)}>+ 50</button></div>
            <div className={styles.betSection}><button className={styles.betChangeButton} onClick={handleSetBet} disabled={lockedBet !== null || playerBalance === null || currentBet < MIN_BET || currentBet > Number(playerBalance)}>Set Bet: {currentBet}$</button></div>
          </div>
          <div className={styles.readyControls}><span style={{ color: '#aaa' }}>Set your bet.</span></div>
        </>
      );
    }
    // Waiting Phase (Bet Locked, No Cards)
    if (!gameOver && lockedBet !== null && playerHand.length === 0) {
      return (
        <>
          <div className={styles.bettingControls}><div className={styles.betSection}>Bet Placed: <span className={styles.betAmountDisplay}>{lockedBet}$</span></div></div>
          <div className={styles.readyControls}>
            <button className={styles.readyButton} onClick={handleReadyClick} disabled={isReady}>{isReady ? "Waiting..." : `Ready (${lockedBet}$)`}</button>
            <label><input type="checkbox" checked={isAutoReady} onChange={handleAutoReadyChange} /> Auto Ready</label>
          </div>
        </>
      );
    }
    // Player's Turn (Bet Locked, Cards Dealt)
    if (!gameOver && lockedBet !== null && playerHand.length > 0) {
      return (
        <>
          <div className={styles.bettingControls}><div className={styles.betSection}>Bet Placed: <span className={styles.betAmountDisplay}>{lockedBet}$</span></div></div>
          <div className={styles.readyControls}>
            <button className={styles.betButton} onClick={hit}>Hit</button>
            <button className={styles.betButton} onClick={stand}>Stand</button>
          </div>
        </>
      );
    }
    // Game Over
    if (gameOver) {
      return (
        <div className={styles.readyControls}>
          <button className={styles.readyButton} onClick={startNewRound}>Start New Game</button>
        </div>
      );
    }
    return null; // Fallback
  };

  // --- Main Component Return ---
  return (
    <div className={styles.gameScreen}>
      <div className={styles.gameTable}>
        <div className={styles.tableCenterText}><h2>Blackjack pays 3 to 2</h2><p>Dealer must stand on 17</p></div>
        {renderPlayerSpots()}
        {gameMessage && <div className={styles.resultText}>{gameMessage}</div>}
      </div>
      <div className={styles.controlsArea}>
        {renderControls()}
        <div className={styles.roomIdDisplay}>Room ID: {MOCK_ROOM_ID}</div>
      </div>
    </div>
  );
};

export default BlackjackGame;
