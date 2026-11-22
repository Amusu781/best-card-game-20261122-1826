// The deck: forty cards, ten of each suit, shuffled with the game's own
// seeded generator. When the draw pile runs dry the discard pile is shuffled
// back in, so a duel never stalls.
import { SUITS, SUIT_KEYS, DECK_VALUES, makeCard } from './cards.js';
import { shuffleInPlace } from './rng.js';

export function buildDeck(rng) {
  const cards = [];
  for (const suit of SUIT_KEYS) {
    for (const value of DECK_VALUES) {
      cards.push(makeCard(suit, value));
    }
  }
  return shuffleInPlace(cards, rng);
}

export function drawFrom(state, side) {
  const pile = state[side];
  if (pile.deck.length === 0) {
    if (pile.discard.length === 0) return null;
    pile.deck = shuffleInPlace(pile.discard, state.rng);
    pile.discard = [];
    state.log.push('The discard pile is shuffled back into the deck.');
  }
  return pile.deck.pop();
}

export function drawUpTo(state, side, count) {
  const pile = state[side];
  while (pile.hand.length < count) {
    const card = drawFrom(state, side);
    if (!card) break;
    pile.hand.push(card);
  }
}

// Sort a hand so the table reads well: suit first, then value.
export function sortHand(hand) {
  const order = { flame: 0, wave: 1, leaf: 2, stone: 3 };
  hand.sort((a, b) => order[a.suit] - order[b.suit] || a.value - b.value);
}

export { SUITS };
