// Deterministic screenshot setups, driven by the game's own ?shot= query.
// Each one builds a real game state through the engine, never by drawing
// over a picture: the screenshots are renders of the game's own code.
import { newGame, startDuel, playYouCard, playRookTurn } from './engine.js';
import { makeCard } from './cards.js';

// Play a few honest rounds so the table looks lived-in: the player strikes
// with their biggest Flame when they hold one, otherwise plays the first
// card in hand. Rook answers with the card he committed to.
export function setupMidGame(seed) {
  const state = newGame(seed);
  startDuel(state);
  for (let round = 0; round < 4 && state.phase === 'play'; round++) {
    const flame = state.you.hand.filter((c) => c.suit === 'flame').sort((a, b) => b.value - a.value)[0];
    const pick = flame || state.you.hand[0];
    playYouCard(state, pick.id);
    if (state.phase !== 'play') break;
    playRookTurn(state);
  }
  return state;
}

// A won duel: a mid-game table, Rook down to his last embers, and the
// player's Flame 6 to finish him.
export function setupWin(seed) {
  const state = setupMidGame(seed);
  if (state.phase !== 'play') return state;
  state.rook.life = 3;
  state.rook.shield = 0;
  const finisher = makeCard('flame', 6);
  state.you.hand.push(finisher);
  playYouCard(state, finisher.id);
  return state;
}

// A lost duel: a mid-game table, the player down to their last embers, and
// Rook's committed Flame 6 to finish them.
export function setupLoss(seed) {
  const state = setupMidGame(seed);
  if (state.phase !== 'play') return state;
  state.you.life = 3;
  state.you.shield = 0;
  const finisher = makeCard('flame', 6);
  state.rook.hand.push(finisher);
  state.rookCommitted = finisher;
  state.turn = 'rook';
  playRookTurn(state);
  return state;
}

export function setupShot(name, seed) {
  if (name === 'play') return setupMidGame(seed);
  if (name === 'win') return setupWin(seed);
  if (name === 'loss') return setupLoss(seed);
  return newGame(seed); // title: a fresh, undealt table under the title card
}
