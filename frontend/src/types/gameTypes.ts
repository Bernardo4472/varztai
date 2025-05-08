// Copied from backend/src/types/gameTypes.ts for frontend use
// Ideally, use a shared package in a monorepo structure.

export type Suit = 'Hearts' | 'Diamond' | 'Clubs' | 'Spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
  value: number; // Keep value if needed for display logic, but score comes from server state
  image?: string;
  isFaceDown?: boolean;
}

export type PlayerStatus =
  | 'waiting' | 'betting' | 'playing' | 'busted' | 'stood'
  | 'blackjack' | 'won' | 'lost' | 'push';

export interface PlayerGameState {
  id: string;
  name: string;
  hand: Card[];
  score: number; // Received from server
  bet: number | null;
  balance?: number;
  status: PlayerStatus;
  canHit?: boolean;
  canStand?: boolean;
  canDouble?: boolean;
  canSplit?: boolean;
}

export interface DealerGameState {
  hand: Card[];
  score: number; // Received from server
  status: 'waiting' | 'playing' | 'busted' | 'blackjack' | 'stood';
}

export type GamePhase =
  | 'waiting_for_players' | 'betting' | 'dealing_initial' | 'player_turns'
  | 'dealer_turn' | 'round_over' | 'game_over';

export interface BlackjackGameState {
  // Frontend might not need the full deck state
  // deck: Card[];
  players: { [playerId: string]: PlayerGameState };
  dealer: DealerGameState;
  gamePhase: GamePhase;
  currentPlayerTurn?: string | null;
  messageLog: string[];
  roundId: string;
  minBet: number;
  maxBet: number;
  lastActionTime?: number;
}
