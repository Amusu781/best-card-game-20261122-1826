// The table: everything the player sees is built here from the game state.
// Cards are real DOM, so they stay legible at thumbnail size, and every suit
// is shown by colour and by shape together, never by its name alone.
import { SUITS, effectText, isSurge } from './cards.js';
import { cardName, MAX_LIFE } from './engine.js';
import { intentLine } from './opponent.js';

const $ = (id) => document.getElementById(id);

function suitShapeEl(suitKey) {
  const shape = document.createElement('div');
  shape.className = `suit-shape ${SUITS[suitKey].shape}`;
  shape.setAttribute('aria-hidden', 'true');
  return shape;
}

// One face-up card. `opts.big` renders the larger played-card version;
// `opts.tag` stamps a small label under it ("YOU PLAYED", "ROOK PLAYED").
export function cardEl(card, opts = {}) {
  const suit = SUITS[card.suit];
  const el = document.createElement('div');
  el.className = `card ${card.suit}${opts.big ? ' big' : ''}`;
  el.setAttribute('role', 'button');
  el.setAttribute('aria-label', `${suit.name} ${card.value}, ${effectText(card)}`);
  const key = document.createElement('span');
  key.className = 'key';
  key.textContent = opts.keyLabel || '';
  const cost = document.createElement('span');
  cost.className = 'cost';
  cost.textContent = opts.costLabel || '';
  const val = document.createElement('div');
  val.className = 'val';
  val.textContent = String(card.value);
  const name = document.createElement('div');
  name.className = 'suit-name';
  name.textContent = suit.name;
  const effect = document.createElement('div');
  effect.className = 'effect';
  effect.textContent = effectText(card);
  el.append(key, cost, val, suitShapeEl(card.suit), name, effect);
  if (opts.tag) {
    const tag = document.createElement('span');
    tag.className = 'played-tag';
    tag.textContent = opts.tag;
    el.append(tag);
  }
  return el;
}

function renderLife(state, side) {
  const me = state[side];
  const prefix = side === 'you' ? 'you' : 'rook';
  $(`${prefix}-life-fill`).style.width = `${(me.life / MAX_LIFE) * 100}%`;
  $(`${prefix}-life-num`).textContent = `${me.life} / ${MAX_LIFE} embers`;
  $(`${prefix}-shield`).textContent = me.shield > 0 ? `Shield ${me.shield}` : '';
}

function renderLastCard(state, side) {
  const me = state[side];
  const el = side === 'you' ? $('you-last') : $('rook-last');
  if (!me.lastCard) {
    el.innerHTML = '';
    return;
  }
  const suit = SUITS[me.lastCard.suit];
  el.innerHTML = `Last card: <b>${cardName(me.lastCard)}</b><br>Last suit: <b style="color:${suit.color}">${suit.name}</b>`;
}

export function renderAll(state, hooks) {
  renderLife(state, 'you');
  renderLife(state, 'rook');
  renderLastCard(state, 'you');
  renderLastCard(state, 'rook');

  // Rook's hand stays face down: backs only, one per card he holds.
  const foeHand = $('foe-hand');
  foeHand.innerHTML = '';
  for (let i = 0; i < state.rook.hand.length; i++) {
    const back = document.createElement('div');
    back.className = 'cardback';
    back.textContent = 'E';
    foeHand.append(back);
  }

  // The player's hand, fanned left to right, each card clickable.
  const hand = $('hand');
  hand.innerHTML = '';
  state.you.hand.forEach((card, i) => {
    const el = cardEl(card, { keyLabel: String(i + 1) });
    el.style.animationDelay = `${i * 0.07}s`;
    if (state.phase === 'play' && state.turn === 'you' && isSurge(state, 'you', card)) {
      el.classList.add('surgeable');
    }
    el.addEventListener('click', () => hooks.onPlayCard(card.id));
    hand.append(el);
  });

  // The two cards on the table, newest play on each side.
  const playedYou = $('played-you');
  const playedRook = $('played-rook');
  playedYou.innerHTML = '';
  playedRook.innerHTML = '';
  if (state.you.lastCard) playedYou.append(cardEl(state.you.lastCard, { big: true, tag: 'YOU PLAYED' }));
  if (state.rook.lastCard) playedRook.append(cardEl(state.rook.lastCard, { big: true, tag: 'ROOK PLAYED' }));

  // Rook's telegraph: the suit he committed to while the player decides.
  $('intent-bubble').textContent = state.phase === 'play' && state.turn === 'you' ? intentLine(state) : '';

  // The Surge banner above the table, shown on the turn a Surge lands.
  const banner = $('surge-banner');
  banner.textContent = state.surge ? `SURGE ×2 — ${SUITS[state.surge.suit].name.toUpperCase()}!` : '';

  $('deck-count').textContent = `${state.you.deck.length} cards left`;
  $('turn-pill').textContent =
    state.phase === 'won' ? 'You win!' :
    state.phase === 'lost' ? 'Rook wins' :
    state.turn === 'you' ? `Round ${state.round} — Your move` : `Round ${state.round} — Rook is thinking…`;

  const log = $('log');
  const last = state.log[state.log.length - 1] || '';
  const prev = state.log[state.log.length - 2] || '';
  log.innerHTML = '';
  if (prev) {
    const span = document.createElement('span');
    span.textContent = `${prev}  ·  `;
    log.append(span);
  }
  const strong = document.createElement('b');
  strong.textContent = last;
  log.append(strong);

  $('status').textContent = last;
}

export function showTitle() {
  $('title-overlay').hidden = false;
  $('end-overlay').hidden = true;
}

export function hideTitle() {
  $('title-overlay').hidden = true;
}

export function showEnd(state) {
  const panel = $('end-panel');
  const won = state.phase === 'won';
  panel.classList.toggle('win', won);
  panel.classList.toggle('lose', !won);
  $('end-title').textContent = won ? 'VICTORY' : 'DEFEAT';
  $('end-sub').textContent = won ? 'THE EMBERS ARE YOURS' : 'ROOK KEEPS THE FLAME';
  $('end-text').textContent = won
    ? 'Rook’s last ember sputters out and the table goes quiet. The four sparks bow to the Spark Keeper — you.'
    : 'Your last ember fades to ash. Rook tips his hat, gathers the sparks, and waits for the rematch.';
  $('end-score').textContent = `Final embers — You ${state.you.life} · Rook ${state.rook.life} · ${state.round} rounds`;
  $('end-overlay').hidden = false;
  if (won) spawnEmbers($('embers'));
}

export function hideEnd() {
  $('end-overlay').hidden = true;
  $('embers').innerHTML = '';
}

// The win flourish: embers rising off the table, each on its own timing.
export function spawnEmbers(container) {
  container.innerHTML = '';
  for (let i = 0; i < 26; i++) {
    const ember = document.createElement('i');
    ember.style.left = `${(i * 37) % 100}%`;
    ember.style.animationDelay = `${(i % 13) * 0.26}s`;
    ember.style.animationDuration = `${2.6 + (i % 5) * 0.35}s`;
    container.append(ember);
  }
}
