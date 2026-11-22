// Rook, the Ember Fox: an opponent whose choices can be read and countered.
// He commits to his next card at the end of his turn, and the table shows the
// suit he gathered, so the player can ward against Flame or strike while he
// mends. His pick follows a plain heuristic, never a hidden coin flip.
import { SUITS } from './cards.js';

// Score every card in Rook's hand against the table as it stands, and return
// the card he plays. He surges when he can, heals when he is burning low,
// and finishes the player off the moment a Flame card can do it.
export function chooseRookCard(state) {
  const rook = state.rook;
  const you = state.you;
  let best = null;
  let bestScore = -Infinity;
  for (const card of rook.hand) {
    let score = card.value;
    if (rook.lastSuit === card.suit) score += 4; // a Surge is worth chasing
    if (card.suit === 'flame' && card.value * (rook.lastSuit === 'flame' ? 2 : 1) >= you.life + you.shield) {
      score += 100; // the killing blow always wins
    }
    if (card.suit === 'wave' && rook.life <= 9) score += 6;
    if (card.suit === 'wave' && rook.life >= 18) score -= 5;
    if (card.suit === 'stone' && you.life <= 6) score -= 3; // no need to hide when ahead
    if (card.suit === 'stone' && rook.shield >= 8) score -= 4;
    if (card.suit === 'leaf' && you.shield > 0) score += 2; // Thorns bite through a ward
    if (score > bestScore) {
      bestScore = score;
      best = card;
    }
  }
  return best;
}

// Rook commits to his next card right after he plays, so the table can show
// the suit he is gathering while the player takes their turn.
export function commitRookIntent(state) {
  const card = chooseRookCard(state);
  state.rookIntent = card ? card.suit : null;
  state.rookCommitted = card;
}

// The telegraph line shown above the table while the player decides.
export function intentLine(state) {
  if (!state.rookIntent) return '';
  const suit = SUITS[state.rookIntent];
  if (state.rookIntent === 'flame') return `Rook gathers ${suit.name} — ward up, or strike first.`;
  if (state.rookIntent === 'wave') return `Rook gathers ${suit.name} — he is about to mend. Strike now.`;
  if (state.rookIntent === 'leaf') return `Rook gathers ${suit.name} — thorns are coming through your ward.`;
  return `Rook gathers ${suit.name} — he is raising a ward. Save your big Flame.`;
}
