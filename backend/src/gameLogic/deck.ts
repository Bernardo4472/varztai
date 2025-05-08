import { Card, Suit, Rank } from '../types/gameTypes';

const SUITS: Suit[] = ['H', 'D', 'C', 'S'];
const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

function getCardValue(rank: Rank): number {
  if (['T', 'J', 'Q', 'K'].includes(rank)) {
    return 10;
  }
  if (rank === 'A') {
    return 11; // Ace can be 1 or 11, initially 11
  }
  return parseInt(rank, 10);
}

export function createDeck(numberOfDecks: number = 1): Card[] {
  const deck: Card[] = [];
  for (let i = 0; i < numberOfDecks; i++) {
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        deck.push({
          suit,
          rank,
          value: getCardValue(rank),
          isFaceDown: false,
        });
      }
    }
  }
  return deck;
}

export function shuffleDeck(deck: Card[]): Card[] {
  // Fisher-Yates shuffle algorithm
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]]; // Swap elements
  }
  return deck;
}

export function dealCard(deck: Card[]): Card | undefined {
  return deck.pop(); // Removes and returns the last card from the deck
}

export function calculateHandScore(hand: Card[]): { score: number; isSoft: boolean } {
  let score = 0;
  let aceCount = 0;
  let isSoft = false;

  for (const card of hand) {
    if (card.isFaceDown) continue; // Don't count face-down cards

    score += card.value;
    if (card.rank === 'A') {
      aceCount++;
    }
  }

  // Adjust for Aces if score is over 21
  while (score > 21 && aceCount > 0) {
    score -= 10; // Change an Ace from 11 to 1
    aceCount--;
  }
  
  // Check if the hand is soft (an Ace is counted as 11)
  // This is true if, after adjusting for busts, there's still an Ace that could be 1 instead of 11
  // without changing the score from <= 21 to > 21.
  // More simply: if an Ace is present and the score is <= 21, it's soft if changing an Ace to 1 would lower the score.
  // For our purpose, if an Ace was counted as 11 and the total is <= 21, it's soft.
  // An Ace is counted as 11 by default by getCardValue. If score > 21, we convert it to 1.
  // So, if score <= 21 and there was an Ace in hand whose original value was 11, it's soft.
  isSoft = hand.some(card => card.rank === 'A' && card.value === 11) && score <= 21;
  // A more precise check for 'isSoft' for doubling down rules:
  // A hand is soft if it contains an Ace that is currently counted as 11.
  let tempScore = 0;
  let hasAceAsEleven = false;
  for (const card of hand) {
    if (card.isFaceDown) continue;
    tempScore += card.value;
    if (card.rank === 'A' && card.value === 11) hasAceAsEleven = true;
  }
  while (tempScore > 21 && hasAceAsEleven) {
    let aceFoundAndSwitched = false;
    for(const card of hand){ // find an ace that is 11
        if(card.rank === 'A' && card.value === 11){
            // if we switch this ace to 1, would score still be > 21?
            if (tempScore - 10 <= 21) {
                // if not, this ace remains 11 for now
            } else {
                tempScore -=10; // switch it
                aceFoundAndSwitched = true;
                break;
            }
        }
    }
    if (!aceFoundAndSwitched) break; // no more aces to switch or not beneficial
    hasAceAsEleven = hand.some(c => c.rank === 'A' && c.value === 11 && tempScore - (c.value - 1) <= 21);
  }
  isSoft = hasAceAsEleven && tempScore <= 21;


  return { score, isSoft };
}
