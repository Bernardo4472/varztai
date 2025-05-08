import { v4 as uuidv4 } from 'uuid';
import {
  BlackjackGameState,
  PlayerGameState,
  DealerGameState,
  GamePhase,
  Card,
  PlayerStatus,
  Rank, // Import Rank for creating card string
  Suit, // Import Suit for creating card string
} from '../types/gameTypes';
import { createDeck, shuffleDeck, dealCard, calculateHandScore } from './deck';

// This will store the game state for all active rooms
// Key: roomId, Value: BlackjackGameState
// Exported for potential direct access or for helper functions if needed by server.ts,
// but ideally, all modifications go through GameManager functions.
export const roomGameStates: Map<string, BlackjackGameState> = new Map();

const DEFAULT_MIN_BET = 10; // Matches frontend
const DEFAULT_MAX_BET = 100; // Example, can be configured
const NUMBER_OF_DECKS = 6; // Common for Blackjack, can be configured

// Helper to create a string representation for a card, similar to frontend
function getCardString(card: Card): string {
  return `${card.suit}-${card.rank}`; // e.g., "H-A" or "S-10"
}

function initializePlayerState(
  playerId: string,
  playerName: string = 'Player',
  initialBalance: number = 1000 // Default starting balance
): PlayerGameState {
  return {
    id: playerId,
    name: playerName,
    hand: [],
    score: 0,
    bet: null,
    balance: initialBalance,
    status: 'waiting', // Will change to 'betting' when betting phase starts
    canHit: false,
    canStand: false,
    canDouble: false,
    canSplit: false,
  };
}

function initializeDealerState(): DealerGameState {
  return {
    hand: [],
    score: 0,
    status: 'waiting',
  };
}

export function initializeNewGame(
  roomId: string,
  playerDetails: Array<{ id: string; name: string; balance?: number }> // Array of player objects
): BlackjackGameState | null {
  if (playerDetails.length === 0) {
    console.error(`[GameManager] Room ${roomId}: Cannot initialize game with no players.`);
    return null;
  }

  const initialDeck = shuffleDeck(createDeck(NUMBER_OF_DECKS));
  const players: { [playerId: string]: PlayerGameState } = {};

  playerDetails.forEach(pDetail => {
    players[pDetail.id] = initializePlayerState(pDetail.id, pDetail.name, pDetail.balance);
  });

  const newGameState: BlackjackGameState = {
    deck: initialDeck,
    players,
    dealer: initializeDealerState(),
    gamePhase: 'waiting_for_players', // Initial phase
    currentPlayerTurn: null,
    messageLog: [`Game room ${roomId} initialized. Waiting for players to be ready or bets.`],
    roundId: uuidv4(),
    minBet: DEFAULT_MIN_BET,
    maxBet: DEFAULT_MAX_BET,
    lastActionTime: Date.now(),
  };

  roomGameStates.set(roomId, newGameState);
  console.log(`[GameManager] Room ${roomId}: New game state initialized.`);
  return newGameState;
}

export function getGameState(roomId: string): BlackjackGameState | undefined {
  return roomGameStates.get(roomId);
}

// This function should be called by server.ts whenever a game state change needs to be broadcasted.
// The actual emitting of socket events will happen in server.ts.
export function updateAndReturnGameState(roomId: string, updatedState: BlackjackGameState): BlackjackGameState {
  roomGameStates.set(roomId, updatedState);
  return updatedState;
}

export function removeGameState(roomId: string): void {
  roomGameStates.delete(roomId);
  console.log(`[GameManager] Room ${roomId}: Game state removed.`);
}


export function transitionToBetting(roomId: string): BlackjackGameState | null {
  let gameState = getGameState(roomId);
  if (!gameState) {
    console.error(`[GameManager] Room ${roomId}: No game state found to start betting.`);
    return null;
  }

  // Reset hands and statuses for a new round
  for (const playerId in gameState.players) {
    gameState.players[playerId].hand = [];
    gameState.players[playerId].score = 0;
    gameState.players[playerId].status = 'betting'; // All players go to betting status
    gameState.players[playerId].bet = null; // Clear previous bets
    // Reset action flags
    gameState.players[playerId].canHit = false;
    gameState.players[playerId].canStand = false;
    gameState.players[playerId].canDouble = false;
    gameState.players[playerId].canSplit = false;
  }

  gameState.dealer.hand = [];
  gameState.dealer.score = 0;
  gameState.dealer.status = 'waiting';
  
  gameState.gamePhase = 'betting';
  gameState.currentPlayerTurn = null; // No specific player's turn during betting
  gameState.messageLog.push('Betting phase has started. Place your bets!');
  gameState.roundId = uuidv4(); // New ID for the new round
  gameState.lastActionTime = Date.now();
  
  console.log(`[GameManager] Room ${roomId}: Transitioned to betting phase.`);
  return updateAndReturnGameState(roomId, gameState);
}

// Further game logic functions will be added here:
// - dealInitialCardsAndTransition
// --- Helper function to advance turn ---
function advanceTurn(roomId: string, currentGameState: BlackjackGameState): BlackjackGameState {
    const playerIds = Object.keys(currentGameState.players);
    const currentPlayerId = currentGameState.currentPlayerTurn;
    
    // Clear action flags for the player who just finished
    if (currentPlayerId && currentGameState.players[currentPlayerId]) {
        currentGameState.players[currentPlayerId].canHit = false;
        currentGameState.players[currentPlayerId].canStand = false;
        currentGameState.players[currentPlayerId].canDouble = false;
        currentGameState.players[currentPlayerId].canSplit = false;
    }

    const currentPlayerIndex = currentPlayerId ? playerIds.indexOf(currentPlayerId) : -1;
    let nextPlayerId: string | null = null;

    // Find the next player in order who is still 'playing'
    for (let i = 1; i < playerIds.length; i++) {
        const nextIndex = (currentPlayerIndex + i) % playerIds.length;
        const potentialNextPlayerId = playerIds[nextIndex];
        if (currentGameState.players[potentialNextPlayerId]?.status === 'playing') {
            nextPlayerId = potentialNextPlayerId;
            break;
        }
    }

    if (nextPlayerId) {
        // Found next player
        currentGameState.currentPlayerTurn = nextPlayerId;
        const nextPlayer = currentGameState.players[nextPlayerId];
        nextPlayer.canHit = true; 
        nextPlayer.canStand = true;
        // Check if the next player can double (only on first 2 cards, sufficient balance)
        // Note: This check might be better placed in dealInitialCardsAndTransition
        // If we advance turn *after* a hit, canDouble should already be false.
        // Let's ensure canDouble is set correctly *only* after initial deal.
        // nextPlayer.canDouble = nextPlayer.hand.length === 2 && (nextPlayer.balance ?? 0) >= (nextPlayer.bet ?? 0);
        // nextPlayer.canSplit = false; // TODO: Implement split logic

        currentGameState.messageLog.push(`It's ${nextPlayer.name}'s turn.`);
        console.log(`[GameManager] Room ${roomId}: Advanced turn to ${nextPlayerId}`);
    } else {
        // No more players are 'playing', move to dealer's turn
        currentGameState.currentPlayerTurn = null; // Indicate dealer's turn or round end processing
        currentGameState.gamePhase = 'dealer_turn';
        currentGameState.messageLog.push("All players finished. Dealer's turn.");
        console.log(`[GameManager] Room ${roomId}: All players done. Transitioning to dealer_turn.`);
        // TODO: Call playDealerTurn(roomId) here eventually
    }
    currentGameState.lastActionTime = Date.now();
    return currentGameState;
}


// --- Player Action Handlers ---

export function handlePlayerHit(
    roomId: string,
    playerId: string
): BlackjackGameState | { error: string } | null {
    let gameState = getGameState(roomId);
    if (!gameState) return { error: `Game state not found for room ${roomId}.` };
    if (gameState.gamePhase !== 'player_turns') return { error: 'Not in player turn phase.' };
    if (gameState.currentPlayerTurn !== playerId) return { error: "It's not your turn." };
    
    const player = gameState.players[playerId];
    if (!player) return { error: `Player ${playerId} not found.` };
    if (player.status !== 'playing') return { error: `Player is not in 'playing' status (${player.status}).` };
    if (!player.canHit) return { error: 'Player cannot hit right now.' };

    const card = dealCard(gameState.deck);
    if (!card) {
        // This shouldn't happen if we check deck size before dealing initial, but handle defensively
        console.error(`[GameManager] Room ${roomId}: Deck empty during hit for player ${playerId}!`);
        gameState.messageLog.push("Error: Deck empty!");
        // Maybe reshuffle here? Or end round? For now, return error state.
        return { error: "Deck is empty." };
    }

    player.hand.push(card);
    const handData = calculateHandScore(player.hand);
    player.score = handData.score;
    gameState.messageLog.push(`${player.name} hits and gets a ${card.rank}. Score: ${player.score}`);
    console.log(`[GameManager] Room ${roomId}: Player ${playerId} hits, gets ${card.rank}, score ${player.score}`);

    // Player busts
    if (player.score > 21) {
        player.status = 'busted';
        player.canHit = false;
        player.canStand = false;
        gameState.messageLog.push(`${player.name} busts!`);
        console.log(`[GameManager] Room ${roomId}: Player ${playerId} busted.`);
        gameState = advanceTurn(roomId, gameState); // Advance turn immediately after bust
    } else if (player.score === 21) {
        // Auto-stand on 21
        player.status = 'stood';
        player.canHit = false;
        player.canStand = false;
        gameState.messageLog.push(`${player.name} has 21! Standing.`);
        console.log(`[GameManager] Room ${roomId}: Player ${playerId} hit 21, auto-standing.`);
        gameState = advanceTurn(roomId, gameState); // Advance turn immediately after hitting 21
    } else {
        // Player can still hit or stand after a non-busting, non-21 hit
        player.canHit = true;
        player.canStand = true;
        // IMPORTANT: Disable doubling/splitting after the first hit
        player.canDouble = false; 
        player.canSplit = false;
    }

    return updateAndReturnGameState(roomId, gameState);
}

export function handlePlayerStand(
    roomId: string,
    playerId: string
): BlackjackGameState | { error: string } | null {
     let gameState = getGameState(roomId);
    if (!gameState) return { error: `Game state not found for room ${roomId}.` };
    if (gameState.gamePhase !== 'player_turns') return { error: 'Not in player turn phase.' };
    if (gameState.currentPlayerTurn !== playerId) return { error: "It's not your turn." };
    
    const player = gameState.players[playerId];
    if (!player) return { error: `Player ${playerId} not found.` };
    if (player.status !== 'playing') return { error: `Player is not in 'playing' status (${player.status}).` };
    if (!player.canStand) return { error: 'Player cannot stand right now.' };

    player.status = 'stood';
    player.canHit = false;
    player.canStand = false;
    player.canDouble = false;
    player.canSplit = false;
    gameState.messageLog.push(`${player.name} stands with score ${player.score}.`);
    console.log(`[GameManager] Room ${roomId}: Player ${playerId} stands.`);

    gameState = advanceTurn(roomId, gameState); // Advance turn

    return updateAndReturnGameState(roomId, gameState);
}

export function playDealerTurn(
    roomId: string
): BlackjackGameState | { error: string } | null {
    let gameState = getGameState(roomId);
    if (!gameState) return { error: `Game state not found for room ${roomId}.` };
    if (gameState.gamePhase !== 'dealer_turn') return { error: 'Not in dealer turn phase.' };

    const dealer = gameState.dealer;

    // Reveal face-down card
    const faceDownCard = dealer.hand.find(card => card.isFaceDown);
    if (faceDownCard) {
        faceDownCard.isFaceDown = false;
        gameState.messageLog.push(`Dealer reveals ${faceDownCard.rank}.`);
    }

    let handData = calculateHandScore(dealer.hand);
    dealer.score = handData.score;
    console.log(`[GameManager] Room ${roomId}: Dealer's initial hand score: ${dealer.score}`);

    // Dealer hits on 16 or less (including soft 17 depending on rules, standard is stand on soft 17)
    while (dealer.score < 17) {
        gameState.messageLog.push(`Dealer hits.`);
        const card = dealCard(gameState.deck);
        if (!card) {
             console.error(`[GameManager] Room ${roomId}: Deck empty during dealer turn!`);
             gameState.messageLog.push("Error: Deck empty!");
             // End turn prematurely if deck is empty
             break; 
        }
        dealer.hand.push(card);
        handData = calculateHandScore(dealer.hand);
        dealer.score = handData.score;
        gameState.messageLog.push(`Dealer draws ${card.rank}. Score: ${dealer.score}`);
        console.log(`[GameManager] Room ${roomId}: Dealer hits, gets ${card.rank}, score ${dealer.score}`);
    }

    if (dealer.score > 21) {
        dealer.status = 'busted';
        gameState.messageLog.push(`Dealer busts with ${dealer.score}!`);
        console.log(`[GameManager] Room ${roomId}: Dealer busted.`);
    } else {
        dealer.status = 'stood';
        gameState.messageLog.push(`Dealer stands with ${dealer.score}.`);
        console.log(`[GameManager] Room ${roomId}: Dealer stands.`);
    }

    gameState.gamePhase = 'round_over';
    gameState.currentPlayerTurn = null; // No one's turn
    gameState.lastActionTime = Date.now();
    gameState.messageLog.push("Round over. Determining results...");
    console.log(`[GameManager] Room ${roomId}: Dealer turn finished. Transitioning to round_over.`);

    // Call resolveRound immediately after dealer turn finishes
    const finalState = resolveRound(roomId);
    if (finalState && 'error' in finalState) {
        console.error(`[GameManager] Error resolving round for room ${roomId}: ${finalState.error}`);
        // Fallback: return state after dealer turn but before resolution attempt
        return updateAndReturnGameState(roomId, gameState); 
    }
    
    return finalState ?? updateAndReturnGameState(roomId, gameState); // Return resolved state or state after dealer turn if resolution failed
}

export function resolveRound(
    roomId: string
): BlackjackGameState | { error: string } | null {
    let gameState = getGameState(roomId);
    if (!gameState) return { error: `Game state not found for room ${roomId}.` };
    // Ensure dealer turn is actually finished before resolving
    if (gameState.gamePhase !== 'round_over') return { error: 'Not in round over phase.' };

    const dealer = gameState.dealer;
    // Use the final dealer score, considering busts
    const dealerScore = dealer.status === 'busted' ? 0 : dealer.score; 

    gameState.messageLog.push(`--- Round Results (Dealer: ${dealer.status} ${dealer.score}) ---`);

    for (const playerId in gameState.players) {
        const player = gameState.players[playerId];
        
        // Skip players who didn't bet or already resolved (e.g., blackjack payout might happen earlier)
        if (player.bet === null || ['won', 'lost', 'push'].includes(player.status)) {
            continue; 
        }

        let result: PlayerStatus = 'lost'; // Default to loss
        let payoutMultiplier = -1; // Lose the bet

        if (player.status === 'busted') {
            result = 'lost';
            payoutMultiplier = -1;
            gameState.messageLog.push(`${player.name} busted (${player.score}). Loses ${player.bet}.`);
        } else if (player.status === 'blackjack') {
            // Blackjack vs Dealer Blackjack
            if (dealer.status === 'blackjack') {
                result = 'push';
                payoutMultiplier = 0; // Bet returned
                gameState.messageLog.push(`${player.name} pushes with Blackjack vs Dealer Blackjack.`);
            } else {
                result = 'won';
                payoutMultiplier = 1.5; // Blackjack pays 3:2
                gameState.messageLog.push(`${player.name} wins with Blackjack! Wins ${player.bet * payoutMultiplier}.`);
            }
        } else if (dealer.status === 'busted') {
            result = 'won';
            payoutMultiplier = 1; // Win even money
            gameState.messageLog.push(`${player.name} wins (${player.score}) vs dealer bust. Wins ${player.bet}.`);
        } else if (player.score > dealer.score) {
            result = 'won';
            payoutMultiplier = 1;
            gameState.messageLog.push(`${player.name} wins (${player.score} vs ${dealer.score}). Wins ${player.bet}.`);
        } else if (player.score < dealer.score) {
            result = 'lost';
            payoutMultiplier = -1;
            gameState.messageLog.push(`${player.name} loses (${player.score} vs ${dealer.score}). Loses ${player.bet}.`);
        } else { // player.score === dealer.score
            result = 'push';
            payoutMultiplier = 0;
            gameState.messageLog.push(`${player.name} pushes (${player.score} vs ${dealer.score}).`);
        }
        
        player.status = result;
        
        // Update player balance within the current game state
        if (player.balance !== undefined && player.bet !== null) {
            const winnings = player.bet * payoutMultiplier;
            player.balance += winnings;
             gameState.messageLog.push(`${player.name} balance updated by ${winnings}. New balance: ${player.balance}`);
             console.log(`[GameManager] ${player.name} balance updated by ${winnings}. New balance: ${player.balance}`);
             // TODO: Trigger actual DB update via playerService here or in server.ts
        } else {
             console.warn(`[GameManager] Could not update balance for ${player.name} (Balance: ${player.balance}, Bet: ${player.bet})`);
        }
    }
    
    console.log(`[GameManager] Room ${roomId}: Round resolved.`);
    // Game remains in 'round_over' phase until next round starts

    return updateAndReturnGameState(roomId, gameState);
}

export function handlePlayerDoubleDown(
    roomId: string,
    playerId: string
): BlackjackGameState | { error: string } | null {
    let gameState = getGameState(roomId);
    if (!gameState) return { error: `Game state not found for room ${roomId}.` };
    if (gameState.gamePhase !== 'player_turns') return { error: 'Not in player turn phase.' };
    if (gameState.currentPlayerTurn !== playerId) return { error: "It's not your turn." };
    
    const player = gameState.players[playerId];
    if (!player) return { error: `Player ${playerId} not found.` };
    if (player.status !== 'playing') return { error: `Player is not in 'playing' status (${player.status}).` };
    if (!player.canDouble) return { error: 'Player cannot double down right now.' };
    if (player.bet === null) return { error: 'Cannot double down without an initial bet.' }; 
    // Validate balance: Need enough balance to cover the *additional* bet (equal to the original bet)
    if ((player.balance ?? 0) < player.bet) {
         return { error: `Insufficient balance (${player.balance}) to double down (requires additional ${player.bet}).` };
    }

    // Double the bet
    const originalBet = player.bet;
    player.bet *= 2;
    // Note: Balance deduction happens implicitly via payout calculation in resolveRound based on the doubled bet.
    // If strict balance tracking per action is needed, deduct originalBet from player.balance here.
    // player.balance -= originalBet; // Optional: Deduct here if needed immediately

    gameState.messageLog.push(`${player.name} doubles down! Bet is now ${player.bet}.`);
    console.log(`[GameManager] Room ${roomId}: Player ${playerId} doubles down. Bet: ${player.bet}`);

    // Deal exactly one more card
    const card = dealCard(gameState.deck);
    if (!card) {
        console.error(`[GameManager] Room ${roomId}: Deck empty during double down for player ${playerId}!`);
        gameState.messageLog.push("Error: Deck empty!");
        // Revert bet? Or just end turn? End turn seems safer.
        player.bet = originalBet; // Revert bet if card dealing fails
        player.status = 'stood'; // Force stand if card cannot be dealt
        player.canHit = false;
        player.canStand = false;
        player.canDouble = false;
        player.canSplit = false;
        gameState = advanceTurn(roomId, gameState);
        return updateAndReturnGameState(roomId, gameState); // Return state after forced stand
    }

    player.hand.push(card);
    const handData = calculateHandScore(player.hand);
    player.score = handData.score;
    gameState.messageLog.push(`${player.name} gets a ${card.rank}. Final Score: ${player.score}`);
    console.log(`[GameManager] Room ${roomId}: Player ${playerId} gets ${card.rank} on double down. Score: ${player.score}`);

    // Determine status after double down card
    if (player.score > 21) {
        player.status = 'busted';
        gameState.messageLog.push(`${player.name} busts on double down!`);
        console.log(`[GameManager] Room ${roomId}: Player ${playerId} busted on double down.`);
    } else {
        player.status = 'stood'; // Player must stand after doubling down
        gameState.messageLog.push(`${player.name} stands with ${player.score} after doubling.`);
        console.log(`[GameManager] Room ${roomId}: Player ${playerId} stands after double down.`);
    }

    // Turn always ends after doubling down
    player.canHit = false;
    player.canStand = false;
    player.canDouble = false;
    player.canSplit = false;
    gameState = advanceTurn(roomId, gameState); 

    return updateAndReturnGameState(roomId, gameState);
}


// - etc.

export function handlePlayerBet(
  roomId: string,
  playerId: string,
  betAmount: number
): BlackjackGameState | { error: string } | null {
  let gameState = getGameState(roomId);
  if (!gameState) {
    return { error: `Game state not found for room ${roomId}.` };
  }
  if (gameState.gamePhase !== 'betting') {
    return { error: 'Not in betting phase.' };
  }
  const player = gameState.players[playerId];
  if (!player) {
    return { error: `Player ${playerId} not found in room ${roomId}.` };
  }
  if (player.status !== 'betting') {
    return { error: `Player ${playerId} is not in a 'betting' state.`};
  }
  // Validate bet amount against limits
  if (betAmount < gameState.minBet || betAmount > gameState.maxBet) {
    return { error: `Bet amount ${betAmount} is outside the allowed limits (${gameState.minBet}-${gameState.maxBet}).` };
  }
  // Validate bet amount against player balance
  if (player.balance !== undefined && betAmount > player.balance) {
     return { error: `Insufficient balance (${player.balance}) for bet ${betAmount}.` };
  }

  player.bet = betAmount;
  player.status = 'waiting'; // Player has bet, now waiting for others or dealing
  gameState.messageLog.push(`${player.name} bets ${betAmount}.`);
  gameState.lastActionTime = Date.now();

  // Check if all active players (those who haven't left) have placed bets
  const activePlayers = Object.values(gameState.players).filter(p => p.status === 'betting' || p.bet !== null);
  const allBetsPlaced = activePlayers.every(p => p.bet !== null || p.status !== 'betting'); // if status is not betting, they must have a bet

  if (allBetsPlaced && activePlayers.length > 0) {
    console.log(`[GameManager] Room ${roomId}: All bets placed. Proceeding to deal initial cards.`);
    return dealInitialCardsAndTransition(roomId); // Call the new function
  }

  return updateAndReturnGameState(roomId, gameState);
}

export function dealInitialCardsAndTransition(roomId: string): BlackjackGameState | { error: string } | null {
  let gameState = getGameState(roomId);
  if (!gameState) {
    return { error: `Game state not found for room ${roomId}.` };
  }
  if (gameState.gamePhase !== 'betting' && gameState.gamePhase !== 'dealing_initial') { // Can be called if already in dealing_initial from handlePlayerBet
    return { error: 'Not in correct phase to deal initial cards.' };
  }

  // Ensure deck has enough cards (e.g., 2 for each player + 2 for dealer)
  const playersWithBets = Object.values(gameState.players).filter(p => p.bet !== null);
  if (playersWithBets.length === 0) {
    gameState.messageLog.push("No bets placed. Round cannot start.");
    // Optionally transition back to betting or handle error
    return updateAndReturnGameState(roomId, gameState);
  }
  const requiredCards = (playersWithBets.length * 2) + 2;
  if (gameState.deck.length < requiredCards) {
    gameState.messageLog.push("Reshuffling deck...");
    gameState.deck = shuffleDeck(createDeck(NUMBER_OF_DECKS));
    console.log(`[GameManager] Room ${roomId}: Deck reshuffled.`);
  }
  
  // Deal first card to each player
  playersWithBets.forEach(player => {
    const card = dealCard(gameState.deck);
    if (card) player.hand.push(card);
  });
  // Deal first card to dealer (face up)
  const dealerCard1 = dealCard(gameState.deck);
  if (dealerCard1) gameState.dealer.hand.push(dealerCard1);

  // Deal second card to each player
  playersWithBets.forEach(player => {
    const card = dealCard(gameState.deck);
    if (card) player.hand.push(card);
  });
  // Deal second card to dealer (face down)
  const dealerCard2 = dealCard(gameState.deck);
  if (dealerCard2) {
    dealerCard2.isFaceDown = true;
    gameState.dealer.hand.push(dealerCard2);
  }

  // Calculate initial scores and check for player Blackjacks
  let firstPlayerId: string | null = null;
  playersWithBets.forEach((player, index) => {
    const handData = calculateHandScore(player.hand);
    player.score = handData.score;
    if (player.score === 21 && player.hand.length === 2) {
      player.status = 'blackjack';
      gameState.messageLog.push(`${player.name} has Blackjack!`);
    } else {
      player.status = 'playing'; // Ready for their turn
    }
    if (index === 0) { // Determine first player (can be more sophisticated)
        firstPlayerId = player.id;
    }
  });
  
  // Calculate dealer's initial score (only showing card is considered for now)
  // Full score will be calculated when dealer plays their turn.
  // For display purposes, often only the upcard's value is shown or no score.
  // We'll calculate it fully but only reveal when appropriate.
  const dealerHandData = calculateHandScore(gameState.dealer.hand.filter(c => !c.isFaceDown)); // Score of up-card
  gameState.dealer.score = dealerHandData.score; // This is just the up-card score for now
  if (calculateHandScore(gameState.dealer.hand).score === 21 && gameState.dealer.hand.length === 2) {
      gameState.dealer.status = 'blackjack';
      // If dealer has blackjack, game might end or proceed differently.
      // This logic will be expanded in resolveRound.
      gameState.messageLog.push("Dealer checks for Blackjack...");
  }


  gameState.gamePhase = 'player_turns';
  gameState.currentPlayerTurn = firstPlayerId; // Set to the first player who placed a bet
  gameState.messageLog.push("Cards dealt. Player turns begin.");
  gameState.lastActionTime = Date.now();

  // Set action flags for the current player
  if (firstPlayerId && gameState.players[firstPlayerId]) {
    const currentPlayer = gameState.players[firstPlayerId];
    if (currentPlayer.status === 'playing') { 
        currentPlayer.canHit = true;
        currentPlayer.canStand = true;
        // Set canDouble flag if conditions met (2 cards, sufficient balance)
        currentPlayer.canDouble = currentPlayer.hand.length === 2 && (currentPlayer.balance ?? 0) >= (currentPlayer.bet ?? 0);
        currentPlayer.canSplit = false; // TODO: Implement split logic
        if(currentPlayer.canDouble) {
             console.log(`[GameManager] Player ${currentPlayer.id} can double down.`);
        }
    } else {
        // If player has blackjack, they cannot hit/stand/double/split
        currentPlayer.canHit = false;
        currentPlayer.canStand = false;
        currentPlayer.canDouble = false;
        currentPlayer.canSplit = false;
    }
  }
  
  console.log(`[GameManager] Room ${roomId}: Initial cards dealt. Phase: ${gameState.gamePhase}. Current turn: ${gameState.currentPlayerTurn}`);
  return updateAndReturnGameState(roomId, gameState);
}
