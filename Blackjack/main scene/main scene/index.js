import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';  // Make sure the path to your styles is correct
import './style.css';  // Make sure the path to your styles is correct
import reportWebVitals from './reportWebVitals';

// Card component to represent a single card
const Card = ({ card }) => {

  const imagePath = `/images/${card.suit.toLowerCase()}-${card.rank.toLowerCase()}.png`;

  return (
    <div className="card">
      <img src={imagePath} alt={`${card.suit}-${card.rank}`} />
    </div>
  );
};

//Zaidimo logika cia
//kolkas ima kortas is eiles kaip sudetos /public/images kataloge

// Blackjack Game component
const BlackjackGame = () => {
  const suits = ['Hearts', 'Diamond', 'Clubs', 'Spades'];
  const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'j', 'q', 'k', 'a'];

  // Function to create a new deck of 52 cards
  const createDeck = () => {
    const deck = [];
    for (let suit of suits) {
      for (let rank of ranks) {
        deck.push({ rank, suit });
      }
    }
    return deck;
  };

  // Game state
  const [deck, setDeck] = useState(createDeck());
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [gameOver, setGameOver] = useState(false);

  // Function to draw a card from the deck
  const drawCard = () => {
    const card = deck.pop();
    setDeck([...deck]);  // Update deck state after drawing a card
    return card;
  };

  // Function to start the game
  const startGame = () => {
    const newDeck = createDeck();
    setDeck(newDeck);
    setPlayerHand([drawCard(), drawCard()]);
    setDealerHand([drawCard(), drawCard()]);
    setGameOver(false);
  };

  // Function to handle the player's hit action
  const hit = () => {
    setPlayerHand([...playerHand, drawCard()]);
  };

  // Function to handle the player's stand action
  const stand = () => {
    setGameOver(true);
  };

  // Function to calculate the hand's total value
  const calculateHandValue = (hand) => {
    let total = 0;
    let aceCount = 0;

    hand.forEach(card => {
      if (card.rank === 'a') {
        total += 11;
        aceCount += 1;
      } else if (['k', 'q', 'j'].includes(card.rank)) {
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

  // Handle game logic after the player stands
  const handleGameOver = () => {
    const playerTotal = calculateHandValue(playerHand);
    const dealerTotal = calculateHandValue(dealerHand);

    if (playerTotal > 21) {
      return "You busted! Dealer wins!";
    } else if (dealerTotal > 21) {
      return "Dealer busted! You win!";
    } else if (playerTotal > dealerTotal) {
      return "You win!";
    } else if (playerTotal < dealerTotal) {
      return "Dealer wins!";
    } else {
      return "It's a tie!";
    }
  };

  
  return (
    <div className="game-container">
      

      {/* Dealer's Cards */}
      <div className="hand" id="dealer">
        <h2>Dealer's Hand</h2>
        {dealerHand.map((card, index) => <Card key={index} card={card} />)}
        {!gameOver && <p>Value: {calculateHandValue(dealerHand)}</p>}
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

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BlackjackGame />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
