export type Suit = 'H' | 'D' | 'C' | 'S'; // Hearts, Diamonds, Clubs, Spades
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
  value: number; // Numerical value for scoring (T,J,Q,K = 10; A = 1 or 11)
  image?: string; // Optional: path to card image if you have assets
  isFaceDown?: boolean; // For dealer's hole card
}

export type PlayerStatus =
  | 'waiting'      // Waiting for game to start or for their turn
  | 'betting'      // Player is currently placing a bet
  | 'playing'      // Player's turn to hit or stand
  | 'busted'       // Player's hand value exceeds 21
  | 'stood'        // Player has chosen to stand
  | 'blackjack'    // Player has a natural Blackjack (21 with first two cards)
  | 'won'          // Player won the round
  | 'lost'         // Player lost the round
  | 'push';        // Player tied with the dealer

export interface PlayerGameState {
  id: string; // socket.id or a persistent user ID
  name: string; // Display name
  hand: Card[];
  score: number;
  bet: number | null; // Current bet amount for the round
  balance?: number; // Optional: player's total balance if tracking chips
  status: PlayerStatus;
  canHit?: boolean; // UI hint
  canStand?: boolean; // UI hint
  canDouble?: boolean; // UI hint
  canSplit?: boolean; // UI hint (advanced)
}

export interface DealerGameState {
  hand: Card[];
  score: number;
  status: 'waiting' | 'playing' | 'busted' | 'blackjack' | 'stood'; // Dealer stands on 17+
}

export type GamePhase =
  | 'waiting_for_players' // Room created, waiting for enough players
  | 'betting'             // Players place their bets
  | 'dealing_initial'     // Initial two cards are dealt
  | 'player_turns'        // Players take their turns (hit/stand)
  | 'dealer_turn'         // Dealer reveals hole card and plays
  | 'round_over'          // Round finished, payouts calculated
  | 'game_over';          // Optional: if playing a set number of rounds or a tournament

export interface BlackjackGameState {
  deck: Card[];
  players: { [playerId: string]: PlayerGameState }; // Map socket.id to player game state
  dealer: DealerGameState;
  gamePhase: GamePhase;
  currentPlayerTurn?: string | null; // socket.id of the player whose turn it is, or null/dealer
  messageLog: string[]; // Log of significant game events for display
  roundId: string; // Unique ID for the current round
  minBet: number;
  maxBet: number;
  lastActionTime?: number; // For timeouts
}
