// The four suits of Emberfall. Every suit is told apart by colour AND shape:
// Flame is a red triangle, Wave a blue droplet, Leaf a green diamond,
// Stone a gold square. No suit is ever identified by its name alone.
export const SUITS = {
  flame: { key: 'flame', name: 'Flame', shape: 'shape-flame', color: '#e5484d', verb: 'Strike', blurb: 'Deal {n} damage' },
  wave: { key: 'wave', name: 'Wave', shape: 'shape-wave', color: '#3e8fd9', verb: 'Mend', blurb: 'Heal {n} embers' },
  leaf: { key: 'leaf', name: 'Leaf', shape: 'shape-leaf', color: '#46a758', verb: 'Thorn', blurb: 'Deal {n} damage and heal 2' },
  stone: { key: 'stone', name: 'Stone', shape: 'shape-stone', color: '#d99a2b', verb: 'Ward', blurb: 'Gain {n} shield' },
};

export const SUIT_KEYS = ['flame', 'wave', 'leaf', 'stone'];

// Values printed on the cards. A deck holds ten of each suit.
export const DECK_VALUES = [2, 2, 3, 3, 4, 4, 5, 5, 6, 6];

let nextCardId = 1;

export function makeCard(suitKey, value) {
  return { id: nextCardId++, suit: suitKey, value };
}

// The human-readable effect line printed on a card, with the value filled in.
export function effectText(card) {
  return SUITS[card.suit].blurb.replace('{n}', String(card.value));
}

// What a card does when played. `power` is the card's value, doubled by a
// Surge. Returns a plain description of the outcome for the log line.
export function resolveCard(state, side, card, power) {
  const me = state[side];
  const foe = state[side === 'you' ? 'rook' : 'you'];
  const suit = SUITS[card.suit];
  if (card.suit === 'flame') {
    const dealt = damageFoe(foe, power);
    return `${suit.verb} ${power}: ${dealt} damage to ${foe.label}`;
  }
  if (card.suit === 'wave') {
    const healed = healSide(me, power);
    return `${suit.verb} ${power}: ${me.label} recovers ${healed} embers`;
  }
  if (card.suit === 'leaf') {
    const dealt = damageFoe(foe, power);
    const healed = healSide(me, 2);
    return `${suit.verb} ${power}: ${dealt} damage and ${healed} embers back`;
  }
  // stone
  me.shield += power;
  return `${suit.verb} ${power}: ${me.label} raises ${power} shield`;
}

// Damage lands on shield first, then on life. Returns damage actually dealt.
export function damageFoe(side, amount) {
  let left = amount;
  if (side.shield > 0) {
    const soaked = Math.min(side.shield, left);
    side.shield -= soaked;
    left -= soaked;
  }
  side.life = Math.max(0, side.life - left);
  return amount;
}

// Healing never passes the 20-ember cap. Returns embers actually recovered.
export function healSide(side, amount) {
  const before = side.life;
  side.life = Math.min(20, side.life + amount);
  return side.life - before;
}

// A card surges when its suit matches the suit its owner played last turn.
export function isSurge(state, side, card) {
  return state[side].lastSuit !== null && state[side].lastSuit === card.suit;
}
