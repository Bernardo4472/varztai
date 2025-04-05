import React, { useState, useEffect } from 'react';
// No need to import CSS files or reportWebVitals here as they're handled at the app level

// Define types for our card and game
interface Card {
  suit: string;
  rank: string;
}

// Card component to represent a single card
const Card: React.FC<{ card: Card }> = ({ card }) => {
  if (!card) return null;  // Early return if card is undefined
  const imagePath = `../../../assets/images/${card.suit}-${card.rank}.png`;

  return (
    <div className="card">
      <img src={imagePath} alt={`${card.suit}-${card.rank}`} />
    </div>
  );
};

// Function to play sound effects
const playSound = (soundFile: string): void => {
  const sound = new Audio(`../../../assets/sounds/${soundFile}`);
  sound.play();
};

// Blackjack Game component
const BlackjackGame: React.FC = () => {
  const suits = ['Hearts', 'Diamond', 'Clubs', 'Spades'];
  const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

  // Function to create a new deck of 52 cards
  const createDeck = (): Card[] => {
    const deck: Card[] = [];
    for (let suit of suits) {
      for (let rank of ranks) {
        deck.push({ rank, suit });
      }
    }
    return deck;
  };

  // Shuffle the deck before starting the game
  const shuffleDeck = (deck: Card[]): Card[] => {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];  // Swap cards
    }
    return deck;
  };

  // Game state
  const [deck, setDeck] = useState<Card[]>(shuffleDeck(createDeck()));
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [playerBust, setPlayerBust] = useState<boolean>(false);  // To track if player busts

  // Function to draw a card from the deck
  const drawCard = (): Card => {
    if (deck.length === 0) {
      // If deck is empty, reshuffle the deck
      const newDeck = shuffleDeck(createDeck());
      setDeck(newDeck);
      return newDeck[0]; // Return the first card of the new deck as a fallback
    }
    const card = deck.pop() as Card;
    setDeck([...deck]);  // Update deck state after drawing a card
    return card;
  };

  // Function to start the game
  const startGame = (): void => {
    playSound('button-click.mp3');  // Play button click sound
    const newDeck = shuffleDeck(createDeck());
    setDeck(newDeck);
    setPlayerHand([drawCard(), drawCard()]);
    setDealerHand([drawCard(), drawCard()]);
    setGameOver(false);
    setPlayerBust(false);  // Reset bust state
  };

  // Function to handle the player's hit action
  const hit = (): void => {
    playSound('card-draw.mp3');  // Play card draw sound
    const newPlayerHand = [...playerHand, drawCard()];
    setPlayerHand(newPlayerHand);

    const playerTotal = calculateHandValue(newPlayerHand);
    if (playerTotal > 21) {
      playSound('lose.wav');  // Play lose sound if player busts
      setPlayerBust(true);
      setGameOver(true);
    }
  };

  // Function to handle the player's stand action
  const stand = (): void => {
    playSound('button-click.mp3');  // Play button click sound when player stands
    dealerTurn();  // Trigger the dealer's turn when the player stands
  };

  // Function to handle the dealer's turn
  const dealerTurn = (): void => {
    let dealerTotal = calculateHandValue(dealerHand);

    // Dealer draws cards until they reach 17 or higher
    while (dealerTotal < 17) {
      const newCard = drawCard();
      setDealerHand((prevHand) => [...prevHand, newCard]);
      dealerTotal = calculateHandValue([...dealerHand, newCard]);
    }

    playSound('dealer-turn.mp3');  // Play sound for dealer's turn
    setGameOver(true);  // End the game after the dealer's turn
  };

  // Function to calculate the hand's total value
  const calculateHandValue = (hand: Card[]): number => {
    let total = 0;
    let aceCount = 0;

    hand.forEach(card => {
      if (!card) return;  // Skip undefined cards (just in case)
      if (card.rank === 'A') {
        total += 11;
        aceCount += 1;
      } else if (['K', 'Q', 'J'].includes(card.rank)) {
        total += 10;
      } else {
        total += parseInt(card.rank, 10);
      }
    });

    // Adjust for aces (if the total is greater than 21, we count aces as 1)
    while (total > 21 && aceCount > 0) {
      total -= 10;
      aceCount -= 1;
    }

    return total;
  };

  // Handle game logic after the player stands or busts
  const handleGameOver = (): string => {
    const playerTotal = calculateHandValue(playerHand);
    const dealerTotal = calculateHandValue(dealerHand);

    if (playerBust) {
      return "You busted! Dealer wins!";
    } else if (dealerTotal > 21) {
      playSound('win.wav');  // Play win sound if dealer busts
      return "Dealer busted! You win!";
    } else if (playerTotal > dealerTotal) {
      playSound('win.wav');  // Play win sound if player wins
      return "You win!";
    } else if (playerTotal < dealerTotal) {
      playSound('lose.wav');  // Play lose sound if dealer wins
      return "Dealer wins!";
    } else {
      return "It's a tie!";
    }
  };

  // Effect to handle dealer's turn after player stands
  useEffect(() => {
    // Only run dealerTurn when gameOver is set by the stand function
    // This prevents an infinite loop since dealerTurn also sets gameOver
    if (gameOver && !playerBust && dealerHand.length === 2) {
      dealerTurn();
    }
  }, [gameOver, playerBust, dealerHand.length]);

  return (
    <div className="game-container">
      {/* Dealer's Cards */}
      <div className="hand" id="dealer">
        <h2>Dealer's Hand</h2>
        {dealerHand.map((card, index) => {
          // Show the second card face down if the game is not over
          if (index === 1 && !gameOver) {
            return <div className="card" key={index}><img src="../../../assets/images/back.png" alt="card back" /></div>;
          }
          return <Card key={index} card={card} />;
        })}
        {/* Show the value of the dealer's first card */}
        {!gameOver && dealerHand.length > 0 && <p>Value: {calculateHandValue([dealerHand[0]])}</p>}
        {/* Only show the value of the dealer's hand if the game is over */}
        {gameOver && <p>Value: {calculateHandValue(dealerHand)}</p>}
      </div>

      {/* Player's Cards */}
      <div className="hand" id="user-hand">
        <h2>Your Hand</h2>
        {playerHand.map((card, index) => <Card key={index} card={card} />)}
        <p>Value: {calculateHandValue(playerHand)}</p>
      </div>

      {/* Game Actions */}
      <div className="actions">
        {gameOver ? (
          <div>
            <h3>{handleGameOver()}</h3>
            <button onClick={startGame}>Start New Game</button>
          </div>
        ) : (
          <div>
            <button onClick={hit}>Hit</button>
            <button onClick={stand}>Stand</button>
          </div>
        )}
      </div>

      {/* Start Game Button */}
      {!playerHand.length && !gameOver && (
        <button onClick={startGame}>Start Game</button>
      )}
    </div>
  );
};

export default BlackjackGame;
