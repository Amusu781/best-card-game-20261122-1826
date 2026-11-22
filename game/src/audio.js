// Sound, made, not fetched: every tone is synthesised with the Web Audio
// API, so the game loads no audio file and makes no network request.
let audioCtx = null;
let muted = false;

function ctx() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function tone(freq, dur, type, gain, when = 0) {
  if (muted) return;
  const ac = ctx();
  if (!ac) return;
  const osc = ac.createOscillator();
  const amp = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  amp.gain.setValueAtTime(0.0001, ac.currentTime + when);
  amp.gain.exponentialRampToValueAtTime(gain, ac.currentTime + when + 0.02);
  amp.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + when + dur);
  osc.connect(amp).connect(ac.destination);
  osc.start(ac.currentTime + when);
  osc.stop(ac.currentTime + when + dur + 0.05);
}

export function soundPlayCard() { tone(520, 0.16, 'triangle', 0.18); tone(780, 0.12, 'sine', 0.1, 0.05); }
export function soundDamage() { tone(140, 0.22, 'sawtooth', 0.16); tone(90, 0.28, 'square', 0.1, 0.04); }
export function soundHeal() { tone(660, 0.2, 'sine', 0.12); tone(880, 0.26, 'sine', 0.1, 0.08); }
export function soundShield() { tone(330, 0.18, 'triangle', 0.14); tone(440, 0.2, 'triangle', 0.1, 0.07); }
export function soundSurge() { tone(587, 0.12, 'triangle', 0.16); tone(880, 0.12, 'triangle', 0.16, 0.08); tone(1175, 0.22, 'sine', 0.14, 0.16); }
export function soundWin() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.3, 'triangle', 0.16, i * 0.13)); }
export function soundLose() { [392, 330, 262, 196].forEach((f, i) => tone(f, 0.32, 'sine', 0.13, i * 0.16)); }
export function soundClick() { tone(700, 0.06, 'sine', 0.08); }

export function toggleMuted() {
  muted = !muted;
  return muted;
}

export function isMuted() { return muted; }
