// Emberfall — the program that hands the game in (Node 22, standard library
// only). It assembles /output from this repository: the static game/ files,
// the screenshots/ the maker took of the game running, and dossier.json,
// the summary the judge reads, written by the vendored make.fun library.
//
// The output directory is created up front and only its contents are ever
// cleared: the grader mounts it read-only, so this program must never try
// to remove the directory itself.
//
// Run it outside the grader with MAKEFUN_OUTPUT_DIR in place of /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Create the output directory first, then empty only what is inside it.
mkdirSync(outDir, { recursive: true });
for (const entry of readdirSync(outDir)) {
  rmSync(join(outDir, entry), { recursive: true, force: true });
}

cpSync(join(repoRoot, 'game'), join(outDir, 'game'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });
}

// The caps the scorer enforces: the dossier text stays under 160 KiB, at
// most 4 screenshots of 256 KiB each, and game/ stays under 993 files and
// 48 MiB with no path over 1000 bytes.
const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);
