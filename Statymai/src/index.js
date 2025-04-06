import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './style.css';
import reportWebVitals from './reportWebVitals';

const Card = ({ card }) => {
  if (!card) return null;
  const imagePath = `/images/${card.suit.toLowerCase()}-${card.rank.toLowerCase()}.png`;

  return (
    <div className="card">
      <img src={imagePath} alt={`${card.suit}-${card.rank}`} />
    </div>
  );
};

const playSound = (soundFile) => {
  const sound = new Audio(soundFile);
  sound.play();
};

const BlackjackGame = () => {
  const suits = ['Hearts', 'Diamond', 'Clubs', 'Spades'];
  const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

  const createDeck = () => {
    const deck = [];
    for (let suit of suits) {
      for (let rank of ranks) {
        deck.push({ rank, suit });
      }
    }
    return deck;
  };

  const shuffleDeck = (deck) => {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  };

  const [deck, setDeck] = useState(shuffleDeck(createDeck()));
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [playerBust, setPlayerBust] = useState(false);

  const [balance, setBalance] = useState(100);
  const [bet, setBet] = useState(0);
  const [resultMessage, setResultMessage] = useState('');

  const drawCard = () => {
    if (deck.length === 0) {
      const newDeck = shuffleDeck(createDeck());
      setDeck(newDeck);
    }
    const card = deck.pop();
    setDeck([...deck]);
    return card;
  };

  const calculateHandValue = (hand) => {
    let total = 0;
    let aceCount = 0;

    hand.forEach(card => {
      if (!card) return;
      if (card.rank === 'A') {
        total += 11;
        aceCount += 1;
      } else if (['K', 'Q', 'J'].includes(card.rank)) {
        total += 10;
      } else {
        total += parseInt(card.rank, 10);
      }
    });

    while (total > 21 && aceCount > 0) {
      total -= 10;
      aceCount -= 1;
    }

    return total;
  };

  const startGame = () => {
    if (bet <= 0 || bet > balance) {
      alert('Invalid bet amount!');
      return;
    }

    playSound('/sounds/button-click.mp3');
    const newDeck = shuffleDeck(createDeck());
    setDeck(newDeck);

    const playerCards = [newDeck.pop(), newDeck.pop()];
    const dealerCards = [newDeck.pop(), newDeck.pop()];

    setPlayerHand(playerCards);
    setDealerHand(dealerCards);
    setGameOver(false);
    setPlayerBust(false);
    setResultMessage('');
  };

  const hit = () => {
    playSound('/sounds/card-draw.mp3');
    const newCard = drawCard();
    const newHand = [...playerHand, newCard];
    setPlayerHand(newHand);

    const total = calculateHandValue(newHand);
    if (total > 21) {
      playSound('/sounds/lose.wav');
      setPlayerBust(true);
      endGame(newHand, dealerHand, true);
    }
  };

  const stand = () => {
    playSound('/sounds/button-click.mp3');
    dealerTurn();
  };

  const dealerTurn = () => {
    let newDealerHand = [...dealerHand];
    let dealerTotal = calculateHandValue(newDealerHand);

    while (dealerTotal < 17) {
      const newCard = drawCard();
      newDealerHand.push(newCard);
      dealerTotal = calculateHandValue(newDealerHand);
    }

    setDealerHand(newDealerHand);
    playSound('/sounds/dealer-turn.mp3');
    endGame(playerHand, newDealerHand, false);
  };

  const endGame = (playerHandFinal, dealerHandFinal, playerBusted) => {
    const playerTotal = calculateHandValue(playerHandFinal);
    const dealerTotal = calculateHandValue(dealerHandFinal);

    let message = '';

    if (playerBusted) {
      setBalance(prev => prev - bet);
      message = "You busted! Dealer wins!";
    } else if (dealerTotal > 21) {
      setBalance(prev => prev + bet);
      playSound('/sounds/win.wav');
      message = "Dealer busted! You win!";
    } else if (playerTotal > dealerTotal) {
      setBalance(prev => prev + bet);
      playSound('/sounds/win.wav');
      message = "You win!";
    } else if (playerTotal < dealerTotal) {
      setBalance(prev => prev - bet);
      playSound('/sounds/lose.wav');
      message = "Dealer wins!";
    } else {
      message = "It's a tie!";
    }

    setResultMessage(message);
    setGameOver(true);
  };

  return (
    <div className="game-container">
      <h1>Blackjack</h1>
      <p>Balance: ${balance}</p>

      {!playerHand.length && !gameOver && (
        <div className="betting">
          <input
            type="number"
            value={bet}
            onChange={(e) => setBet(parseInt(e.target.value))}
            placeholder="Place your bet"
            min="1"
            max={balance}
          />
          <button onClick={startGame} disabled={bet <= 0 || bet > balance}>
            Start Game
          </button>
        </div>
      )}

      <div className="hand" id="dealer">
        <h2>Dealer's Hand</h2>
        {dealerHand.map((card, index) => {
          if (index === 1 && !gameOver) {
            return <div className="card" key={index}><img src="/images/back.png" alt="card back" /></div>;
          }
          return <Card key={index} card={card} />;
        })}
        {!gameOver && dealerHand.length > 0 && <p>Value: {calculateHandValue([dealerHand[0]])}</p>}
        {gameOver && <p>Value: {calculateHandValue(dealerHand)}</p>}
      </div>

      <div className="hand" id="user-hand">
        <h2>Your Hand</h2>
        {playerHand.map((card, index) => <Card key={index} card={card} />)}
        {playerHand.length > 0 && <p>Value: {calculateHandValue(playerHand)}</p>}
      </div>

      <div className="actions">
        {playerHand.length > 0 && !gameOver && (
          <div>
            <button onClick={hit}>Hit</button>
            <button onClick={stand}>Stand</button>
          </div>
        )}

        {gameOver && (
          <div>
            <h3>{resultMessage}</h3>
            <button onClick={() => {
              setPlayerHand([]);
              setDealerHand([]);
              setGameOver(false);
              setResultMessage('');
              setBet(0);
            }}>Start New Game</button>
          </div>
        )}
      </div>
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

reportWebVitals();
