// Bootstrap: wires the engine to the table, the mouse, and the keyboard.
// A duel is played by clicking a card (or pressing 1–5), Rook answers after
// a short pause, and either end screen offers the rematch.
import { newGame, startDuel, playYouCard, playRookTurn } from './engine.js';
import { renderAll, showTitle, hideTitle, showEnd, hideEnd } from './render.js';
import { setupShot } from './shots.js';
import {
  soundPlayCard, soundDamage, soundHeal, soundShield, soundSurge,
  soundWin, soundLose, soundClick, toggleMuted,
} from './audio.js';

const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');
const seed = Number.parseInt(params.get('seed') || '7', 10) || 7;

let state = shotName ? setupShot(shotName, seed) : newGame((Date.now() % 2147483647) || 7);
window.__emberfall = { state };

// Sound for the card that was just played, by what it did.
function soundFor(card) {
  if (card.suit === 'flame' || card.suit === 'leaf') soundDamage();
  else if (card.suit === 'wave') soundHeal();
  else soundShield();
}

function afterPlay() {
  renderAll(state, hooks);
  if (state.phase === 'won' || state.phase === 'lost') {
    endDuel();
    return;
  }
  if (state.turn === 'rook') {
    window.setTimeout(() => {
      if (state.phase !== 'play') return;
      playRookTurn(state);
      const card = state.rook.lastCard;
      if (card) soundFor(card);
      if (state.surge && state.surge.side === 'rook') soundSurge();
      renderAll(state, hooks);
      if (state.phase === 'won' || state.phase === 'lost') endDuel();
    }, 950);
  }
}

function endDuel() {
  renderAll(state, hooks);
  window.setTimeout(() => {
    if (state.phase === 'won') soundWin();
    else soundLose();
    showEnd(state);
  }, 650);
}

const hooks = {
  onPlayCard(cardId) {
    if (state.phase !== 'play' || state.turn !== 'you') return;
    const card = state.you.hand.find((c) => c.id === cardId);
    if (!card) return;
    const wasSurge = state.you.lastSuit === card.suit;
    if (playYouCard(state, cardId)) {
      soundPlayCard();
      if (wasSurge) soundSurge();
      else soundFor(card);
      afterPlay();
    }
  },
};

function beginDuel() {
  soundClick();
  hideTitle();
  hideEnd();
  startDuel(state);
  renderAll(state, hooks);
}

function freshDuel() {
  soundClick();
  hideEnd();
  state = newGame((Date.now() % 2147483647) || 7);
  window.__emberfall.state = state;
  showTitle();
  renderAll(state, hooks);
}

document.getElementById('start-btn').addEventListener('click', beginDuel);
document.getElementById('again-btn').addEventListener('click', freshDuel);
document.getElementById('sound-btn').addEventListener('click', (event) => {
  const muted = toggleMuted();
  event.currentTarget.textContent = muted ? 'Sound: off' : 'Sound: on';
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !document.getElementById('title-overlay').hidden) {
    beginDuel();
    return;
  }
  if (event.key.toLowerCase() === 'r' && !document.getElementById('end-overlay').hidden) {
    freshDuel();
    return;
  }
  const digit = Number.parseInt(event.key, 10);
  if (digit >= 1 && digit <= 5 && state.phase === 'play' && state.turn === 'you') {
    const card = state.you.hand[digit - 1];
    if (card) hooks.onPlayCard(card.id);
  }
});

if (shotName) {
  if (shotName === 'title') showTitle();
  else hideTitle();
  renderAll(state, hooks);
  if (state.phase === 'won' || state.phase === 'lost') showEnd(state);
} else {
  showTitle();
  renderAll(state, hooks);
}

window.__emberfallReady = true;
