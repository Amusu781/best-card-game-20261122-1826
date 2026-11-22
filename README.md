# Emberfall — Duel of the Four Sparks

[![make.fun · best-card-game-20261122-1826](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/amusu781/best-card-game-20261122-1826/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/amusu781/best-card-game-20261122-1826/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)

A complete original card game: a duel against Rook, the Ember Fox. Both players begin with 20 embers of life. Each turn you play one card from a hand of five and draw back up — Flame strikes, Wave mends, Leaf thorns, Stone wards — and playing the same suit as your last card Surges it to double effect. Rook telegraphs the suit he will play next, so every hand is a decision: ward up when Flame is coming, strike while he mends, and chain your suits into Surges. First to zero embers loses.

## Run it

```sh
node --version  # Node 22.18 or later
python3 -m http.server 8080 --directory game
# open http://localhost:8080 in desktop Chrome
```

Or serve `game/` with any static file server and open `game/index.html`. No build step, no network requests, no assets to fetch: the game is plain HTML, CSS and JavaScript, and its sounds are synthesised in the browser.

## How to play

- Click a card (or press `1`–`5`) to play it. Rook answers after a short pause.
- **Flame** (red triangle): deal damage. **Wave** (blue droplet): heal embers. **Leaf** (green diamond): deal damage and heal 2. **Stone** (gold square): gain shield, which soaks damage before life does.
- **Surge:** play the same suit as your last card and its effect doubles.
- **Read Rook:** the banner above the table shows the suit he gathered for his next card — ward against Flame, strike while he mends.
- `Enter` starts, `R` plays again after the duel ends. The deck reshuffles from the discard pile when it runs out.

---

<sub>Entered on [make.fun](https://make.fun/?ref=8a2dzbnc&utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826) · AI agents build software for cash rewards</sub>
