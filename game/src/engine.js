// The duel itself: state, turns, Surges, and the win and loss conditions.
// Rendering lives in render.js; this file only changes the state.
import { resolveCard, isSurge } from './cards.js';
import { buildDeck, drawFrom, drawUpTo, sortHand } from './deck.js';
import { makeRng } from './rng.js';
import { chooseRookCard, commitRookIntent } from './opponent.js';

export const MAX_LIFE = 20;
export const HAND_SIZE = 5;

export function newSide(label) {
  return { label, life: MAX_LIFE, shield: 0, hand: [], deck: [], discard: [], lastSuit: null, lastCard: null };
}

export function newGame(seed) {
  const rng = makeRng(seed);
  const state = {
    seed,
    rng,
    phase: 'title',
    turn: 'you',
    round: 1,
    you: newSide('You'),
    rook: newSide('Rook'),
    rookIntent: null,
    rookCommitted: null,
    surge: null,
    log: [],
    winner: null,
  };
  state.you.deck = buildDeck(rng);
  state.rook.deck = buildDeck(rng);
  drawUpTo(state, 'you', HAND_SIZE);
  drawUpTo(state, 'rook', HAND_SIZE);
  sortHand(state.you.hand);
  sortHand(state.rook.hand);
  return state;
}

export function startDuel(state) {
  state.phase = 'play';
  state.log = ['The duel begins. Your move — play a card.'];
  state.turn = 'you';
}

// The player plays one card from their hand. Returns false when the move is
// not allowed (not their turn, or the duel is over).
export function playYouCard(state, cardId) {
  if (state.phase !== 'play' || state.turn !== 'you') return false;
  const index = state.you.hand.findIndex((c) => c.id === cardId);
  if (index < 0) return false;
  const card = state.you.hand[index];
  state.you.hand.splice(index, 1);
  state.you.discard.push(card);
  const surge = isSurge(state, 'you', card);
  const power = surge ? card.value * 2 : card.value;
  state.surge = surge ? { side: 'you', suit: card.suit } : null;
  const outcome = resolveCard(state, 'you', card, power);
  state.you.lastSuit = card.suit;
  state.you.lastCard = card;
  state.log.push(`You play ${cardName(card)}${surge ? ' — SURGE ×2' : ''}: ${outcome}.`);
  const drawn = drawFrom(state, 'you');
  if (drawn) state.you.hand.push(drawn);
  sortHand(state.you.hand);
  if (checkEnd(state)) return true;
  state.turn = 'rook';
  return true;
}

// Rook takes his turn with the card he committed to while the player decided.
// If he has none committed (an old save, or a fresh start), he picks now.
export function playRookTurn(state) {
  if (state.phase !== 'play' || state.turn !== 'rook') return false;
  const card = state.rookCommitted || chooseRookCard(state);
  if (!card) return false;
  const index = state.rook.hand.findIndex((c) => c.id === card.id);
  if (index >= 0) state.rook.hand.splice(index, 1);
  state.rook.discard.push(card);
  const surge = isSurge(state, 'rook', card);
  const power = surge ? card.value * 2 : card.value;
  state.surge = surge ? { side: 'rook', suit: card.suit } : null;
  const outcome = resolveCard(state, 'rook', card, power);
  state.rook.lastSuit = card.suit;
  state.rook.lastCard = card;
  state.log.push(`Rook plays ${cardName(card)}${surge ? ' — SURGE ×2' : ''}: ${outcome}.`);
  const drawn = drawFrom(state, 'rook');
  if (drawn) state.rook.hand.push(drawn);
  sortHand(state.rook.hand);
  if (checkEnd(state)) return true;
  commitRookIntent(state);
  state.round += 1;
  state.turn = 'you';
  return true;
}

// A duel ends the moment either side's embers reach zero.
export function checkEnd(state) {
  if (state.rook.life <= 0) {
    state.phase = 'won';
    state.winner = 'you';
    state.log.push('Rook’s last ember goes out. You win the duel.');
    return true;
  }
  if (state.you.life <= 0) {
    state.phase = 'lost';
    state.winner = 'rook';
    state.log.push('Your last ember goes out. Rook keeps the flame.');
    return true;
  }
  return false;
}

export function cardName(card) {
  const suitNames = { flame: 'Flame', wave: 'Wave', leaf: 'Leaf', stone: 'Stone' };
  return `${suitNames[card.suit]} ${card.value}`;
}
