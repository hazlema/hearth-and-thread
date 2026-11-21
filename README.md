# Hearth & Thread

Roguelite tic-tac-toe against Granny Owl, built from `idea-board.design.md`. Single page, no build step, no assets:
the art is inline SVG and the sound is WebAudio synthesis.

## Run

```sh
npm start          # http://localhost:5173 (module workers need HTTP, not file://)
npm test           # rules, controller v3/v4 cards, run/save tests, L5 fixtures
npm run sim:l5 -- 200 1 look2   # L5 clear rate: runs, powers held, player model (look2|look3|look4|perfect)
```

## Layout

| File | Role |
| --- | --- |
| `src/rules.mjs` | Pure reducer (rules v2) plus `applyUnchecked`, the search-only fast path |
| `src/controller.mjs` | Controller v4.1 plus save/resume, quilt patches, Owl policy, live reduced motion |
| `src/ai.worker.mjs` | Minimax worker (alpha-beta, iterative deepening, 300 ms budget) |
| `src/app.mjs` | Wiring: persistent worker, thinking pause, persistence, audio cues, announcements |
| `src/board.mjs` | Quilt board: preview then confirm, keyboard, stitch/pop/glide/seam/unravel beats |
| `src/hud.mjs`, `src/owl.mjs`, `src/overlays.mjs`, `src/fx.mjs`, `src/audio.mjs`, `src/art.mjs` | HUD, Granny Owl, draft/end card/settings, particles, sound, SVG art |
| `tools/solver.mjs` | Exhaustive solver used by the fixtures and the balance tools |

Saves live in `localStorage` (`hearth-run`, `hearth-best`, `hearth-settings`). Only stable states are saved:
a board start or a draft. A loss saves its resolved outcome, so reloading during the unravel can't dodge it.
`globalThis.hearthQA` exposes worker timings and the controller for playtest logging.

## Deploy (Netlify)

`netlify.toml` copies `index.html` and `src/` into `dist/` and publishes that, so only the game goes live.
The idea-board exports, tests and tools stay out of the site. Connect the repo in Netlify, or run `netlify deploy --prod` from this folder.
