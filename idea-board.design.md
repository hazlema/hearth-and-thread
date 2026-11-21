# tic-tac-toe

_Exported 2026-10-24 from idea board._

## Brief

### What we're building

Roguelite tic-tac-toe vs an AI. Juicy: dynamic colors, animations, WebAudio sound. Single-page web, no assets. Five mechanics, no more.

1. Ladder: 5 levels, max 3 boards each (a draw burns one, no draft, powers kept; out of boards = run over). X line clears the level + draft. Second Wind (once per run) cancels the first run-ending event: after an O line it replays a fresh board with hearts unchanged; after the last board burns it grants 1 heart. No draft. L5 clear = victory. Run ~8 min.
 Score: +100 per level cleared, +50 per heart left at the clear, +25 per power spent this level. The card shows score vs best.
2. Powers: Shatter, Slide, Ward. Each includes your placement; 1 per turn; hold 3; preview before confirming. Start: pick 1 of 3. Draft 1 of 3 per cleared level (swap or skip at cap). The L4 to L5 draft can't be skipped while you hold 0 powers.
 Core tension: spend powers for score and spectacle now, or save them, because L5 is only winnable with a power in hand.
3. AI blunder rate: L1 80%, L2 40%, L3 25%, L4 10%, L5 0% (minimax with powers/shields in search). Each draw adds +10% for the rest of the level (visible hesitation). L1-L3: blunder rolls first and may miss a win/block. L4-L5: take an immediate win first, blunder only on the follow-up.
4. Level setups (never stack; reset per board, keep inventory):
 L1 empty, X starts.
 L2 rock top-left (blocks cells and lines; Shatter can remove it).
 L3 seeds X top-left, O bottom-right, X starts (Slide shines).
 L4 empty, O starts (hardest board).
 L5 O owns one Ward per board (place O + shield one empty cell, shown before X's turn, expires after X's action, must leave X a legal move).
5. Heat (cosmetic only, shown as the HEARTH gauge): +1 per placement, +2 per power spent, +3 on your line, cap 10, reset per board (a Second Wind also clears the grey). A power-assisted win maxes the HEARTH exactly on the golden seam. Drives palette, music layers, particles, power effect size. Marks stay readable at Heat 10.

Powers: Shatter = remove one O (or rock), place X elsewhere. Slide = move one X, then place X; lines resolve after. Ward = place X, shield one empty cell from the next AI move; must leave AI a legal reply unless you win.
A winning player action ends the board before the AI replies. Draw = no playable empty cells, no line.

Win beat: a 700ms golden line sews across, the HEARTH flares, a rising music-box run plays. Loss beat: the O line pulses, the last two moves replay in 1s slow-mo, the quilt unravels and goes grey with a falling tone. Then a card: level reached, score vs best, one-tap "Again" (new run in under 1s). Second Wind re-knits the threads with a rising chime instead.
Cut: Echo, Rewind, charge economy, shifting corners, O-center seed, O's Ward costing her turn.

### Player experience (what a human expects)

- First run teaches itself: L1 opens on the starter draft, with one line per power card and a ghost preview on hover or press. Owl's first move gets a speech bubble: "Your turn, dear." No separate tutorial screen.
- Controls: tap or click on touch and mouse. Keyboard: arrows move, Enter places, 1/2/3 pick a power, Esc cancels. Every action is preview, then confirm.
- Pause/settings (a gear icon on the windowsill): music volume, SFX volume, mute, reduced motion (beats skip to their end state), "How to play" card, quit run.
- Persistence (localStorage): best score, settings, and the current run (resumes after a reload or closed tab, at the start of the current board).
- Readability: X and O differ by shape, not just color (stitch vs button), so the game is colorblind-safe. aria-live announces moves, shields and outcomes.
- End card = the Quilt: each board played becomes a patch (win gold, draw plain, loss grey). It shows level reached, score vs best, powers spent and peak Heat, plus one-tap "Again". This is the souvenir and the hook.
- Victory: Owl falls asleep by the fire, the finished quilt is shown in full, and "New best!" appears if earned.
- Later (not in v1): a Daily Quilt (the same seed for everyone each day) and more Owl voice lines.

### Art direction: Hearth & Thread (reference = concept picture)

Cozy cottage at night with rain on the window. You play against Granny Owl, who knits across the table.
- Board: ivory linen with stitched grid lines and floral corners, on a walnut table.
- X = berry cross-stitch, O = deep-teal button, both saturated, each with a 1px ivory stitch halo so they read at Heat 10.
- Ward = an upturned teacup on a dark walnut coaster, with a dashed stitched cell outline (blocked, not occupied).
- HUD: 5 house pips at top-left = level. 3 heart buttons at top-right = boards left. 'HEARTH' gauge at left = Heat. Sewing tray at the bottom = powers: scissors (Shatter), spool with arrow (Slide), teacup (Ward), each with a count.
- Above Heat 7, vignette the decor so the marks and particles are always the brightest things on screen.
- Owl = the AI's tells: sleepier after each draw (spectacles slip, yawn); she sets down her teacup before her L5 Ward. If the AI watchdog fires, she plays the same yawn before the fallback move, so a slow worker reads as character, not a bug.
- L2 rock = a sleeping cat; Shatter shoos it off.
- Rooms per level (backdrop only): porch at dusk, kitchen, reading nook, attic in a rainstorm, fireside.
- Animation: the scissors snip and the button pops off; the thread tugs and the stitch glides; a win sews a golden line; a loss unravels and goes grey; Second Wind re-knits.
- Palette: ivory #F4E9D8, walnut #6B4A35, berry #B5485A, teal #2F5D6B, honey #E8A84A, night #2A3348.

### QA bar (playtest)

The bar every feature must clear:
- Rules legible in one glance; a first-timer must not lose by confusion.
- A decision on turn 3 that still matters on turn 9 (no dead moves).
- Doing nothing must feel bad.
- No solved opening; if one exists, powers and level setups must hide it.
A feature that fails two of these gets cut, not patched.

### Build handoff

FEATURE FREEZE until files are extracted and tests run.

Latest source: controller.mjs v4.1 (includes 1.2s watchdog, Heat formula and receive hardening); controller.test.mjs v3 PLUS controller-v4.test.mjs. Retain rules v2 + tests, v3 UI patch, hud, board v2, ai.worker, app, audio + wiring patch. All are unexecuted source on cards, not extracted module files. Copy to a JS workspace, apply patches, run node --test, then serve over HTTP for browser testing.

Approved design is not implementation completion. Scene art, animation polish and the final-review player-experience requirements still need implementation/integration verification.

Rulings:
- Search: isLegal plus unchecked apply is the intended optimization; public reducer keeps full validation. Iterative deepening, alpha-beta, max 6 plies, ~300ms; X powers through ply 4. Profile the current worker.
- Worker revision guards reject stale replies. Watchdog 1.2s: invalidate revision before cancelAI cleanup, then tactical fallback. Cancellation need not reject its promise. Receive clears inFlight only after an action commits.
- Phases: draft | player | ai | won | lost | transition | victory | defeat. Won 700ms, input guard 250ms; lost 1s on every defeat path.
- Draft confirms selection; skip allowed except starter draft and empty-inventory entry to L5. Preview cancel: same cell, outside, Esc; no spend.
- Hearts refill visibly on level clear. Audio gesture-unlocked, muteable; muted play remains complete.
- Gates remain unrun: reducer/controller regressions, L5 fixtures (control must not win), browser input/audio checks. L5 over 200 seeded boards: 55–70% clear with 1 power, under 85% with 3. Log watchdog frequency; frequent fallback invalidates AI measurements.

### Ship gates (final, approved)

The game is not done until all of these pass:
1. node --test is green on rules, controller v4.1 and both controller test cards. Known fix: the 'cleanup throwing' test must tick(1301) or assert 'player'.
2. The L5 fixtures pass, and the control position does not win.
3. L5 clear rate over 200 seeded boards: 55-70% entering with 1 power, under 85% with 3.
4. The watchdog fires on fewer than 1 in 20 AI moves at L4-L5, and a timeout is never noticeable to a tester.
5. The playtest gates in the green group, including blind read, no Ward surprises, readable at Heat 10, and L4 median of 1-2 boards.
6. The game is fully playable muted and with reduced motion, by keyboard and by touch.
Design is frozen. Anything new goes to 'Later'.

### Final handoff correction: watchdog test clock

Use controller v4.1 and the current controller-v4.test.mjs card unchanged. The cleanup test already uses tick(300), then tick(1301): AI request at t=300, watchdog at t=1500, assertion at t=1601 (transition), settle at t=1800. Do NOT replace this with tick(1301) from t=0; that precedes the watchdog. Earlier advice that tick(1500) from t=0 must yield player was incorrect. All tests remain unexecuted; design approval is not a test pass.

## Brainstorm

### Early decisions (settled)

- [x] **Sol: 3 placement powers; cosmetic Heat:** QA accepts: 3 powers, one per turn, consumed, hold 3, starter draft. Heat cosmetic — agreed, one currency only. Keep the preview-before-confirm; it is the whole readability story.
- [x] **Sol: level contracts; QA wants L3/L4 swapped:** Settled: L3 = seeded corners, L4 = O starts (no seed). In Brief.
- [x] **QA: AI difficulty curve (random → minimax with mistakes):** See Brief #3.
- [x] **QA: power combo stress test:** Verdict: combo stacking is safe (1 power/turn, consumed). Two real breaks: (a) board-full stalemate if the last cell can be blocked by Ward — the draw rule above closes it; (b) Shatter used to break a two-threat is a get-out-of-jail card, so cap it: Shatter cannot convert an O, only remove it.
- [x] **QA: a draw must crack the AI:** On L4 a 10%-blunder minimax draws most boards, so I burn 3 boards and lose without ever being beaten — worst feeling in the game. Fix with no new mechanic: each draw gives +10% AI blunder for the rest of the level (visible: it hesitates, eyes dim). Draws become progress. _(Claude added, not reviewed)_
- [x] **QA: one second wind per run:** Superseded: see Brief #1 (covers O line or out of boards). _(Claude added, not reviewed)_

### Three powers: bend a placement

- [x] **Shatter:** Remove one O (or L2 rock), then place X in a different empty cell. Cannot convert the removed target directly into X.
- [x] **Slide:** Move one X, then place X; lines resolve after. Target is the L3 seeded X.
- [x] **Ward:** Place X; shield one remaining empty cell against the next AI move only. Must leave at least one legal AI reply unless your placement wins.

### Build: state model

- **Position (searchable):** cells[9]: null|X|O|rock; toMove: X|O; powersX: {shatter,slide,ward} counts; wardO: 0|1; shield: null|{cell,blockedActor}; result: playing|X|O|draw. Only one active shield at a turn boundary.
- **Run (outside search):** level 1..5; boardsLeft; drawsThisLevel; secondWindAvailable; powersSpentThisLevel; score; inventory. phase: draft|player|ai|won|lost|transition|victory|defeat. Heat, animation queue and seeded RNG are presentation/control state. Persist the run to localStorage at each board start.
- **Action union:** Place(at); Shatter(remove,at); Slide(from,to,at); Ward(at,shieldCell). AI uses Place or Ward only. Preview stores an uncommitted Action, never mutates Position.

### Build: one atomic reducer

- **Shared API:** legalActions(position), applyAction(position,action) → {position,events}. Pure functions. UI preview, committed play and AI call exactly these; animation never controls rules timing.
- **Validate complete action:** Shatter: remove enemy/rock, place elsewhere. Slide: move own mark to an empty cell, then place on a different empty cell; vacated origin is allowed. Shield forbids both Slide destinations. Reject invalid actions without spending power. Resolve lines only after the whole action.
- **Ward lifecycle:** Existing shield blocks acting player for this entire action; expire it after completion. A newly cast shield targets the opponent and survives handoff. Only then pass control. UI label: ‘Blocked for this move’; show expiry event even on Slide/Shatter.
- **Terminal order:** Apply full action → line check → draw if no empty cells (rocks occupied; ignore temporary shields) → next actor. Winning Ward placement needs no shield target. Consume power once on commit, never on previews/cancel.

### Build: power-aware AI

- **Search contract:** Minimax over shared legalActions/applyAction for BOTH actors. X branches include held powers; O includes its remaining Ward. Terminal values O win +1, X win −1, draw 0; prefer faster wins, slower losses. Memo key includes cells, actor, power counts, wardO and shield—not Heat or animation.
- **Difficulty without rule drift:** At the actual AI turn only: p=min(1,baseRate+0.10*drawsThisLevel). Blunder branch samples legal ordinary placements; otherwise best full-state search action. Priority rules settled in Brief #3. Never roll randomness inside minimax.
- **Responsive + reproducible:** Run search in a worker; reject replies with stale position revision. Seed actual random choices for replayable QA. Count distinct actions once regardless of duplicate power copies. Profile L5 before claiming real-time performance.
- [x] **Sol: preserve powers under search budget:** Merged: powers searched through ply 4 (QA). See Brief handoff. _(Claude added, not reviewed)_
- [x] **QA ruling: blunder vs tactics:** L1-L3: blunder rolls first and may miss a win or a block — that's the joke, and near-misses feed Heat. L4-L5: take an immediate win first, then blunder only on the follow-up choice. Keeps hard levels from feeling personally cheated. _(Claude added, not reviewed)_

### QA: playtest gates (approved; run after build)

- [x] **Blind read:** 5 testers name each power from its icon, no tooltip. Under 4/5 = fix the icon, not the rules. _(Claude added, not reviewed)_
- [x] **L1 sells the hook:** Tester must use a power before winning level 1. If they win without touching one, the draft didn't land. _(Claude added, not reviewed)_
- [x] **Draw feels like progress:** After a draw the tester can say the AI slipped. If nobody notices the hesitation, add a spoken line, never a rule. _(Claude added, not reviewed)_
- [x] **L4 wall check:** Median boards to clear L4 must be 1-2. If most testers hit 3, the +10% tilt is too weak or Second Wind is masking a bad level. _(Claude added, not reviewed)_
- [x] **No Ward surprises:** Zero testers blocked on a cell they thought legal. A glow is not enough — give the shield a shape. _(Claude added, not reviewed)_
- [x] **Lost turns:** Log turns where a plain placement beats every power. Over ~40% and the powers are decoration. _(Claude added, not reviewed)_
- [x] **Juice must not hide the board:** At Heat 10 the marks are readable in one second; no palette or particle may obscure X, O, rock or shield. _(Claude added, not reviewed)_
- [x] **Second Wind = relief:** After the first loss the tester retries willingly. Count voluntary quits. _(Claude added, not reviewed)_
- [x] **Ruling revised: Second Wind cancels the first death:** Covers an O line OR running out of boards. Grants one fresh board (1 heart), still once per run, no draft. _(Claude added, not reviewed)_
- [x] **L5 clear rate:** 200 seeded L5 boards with the worker, entering with 1 random power: target 55-70% clear. Under that, the finale is a wall; over it, a formality. _(Claude added, not reviewed)_
- [x] **3 powers must not trivialize L5:** Same 200 seeds, entering with 3 powers: clear rate must stay under ~85%. At 1 power the finale is 55-70%; if a hoarder walks it at 95% then "only winnable with a power in hand" is false and the +25/power-spent score is the only cost of hoarding. Measure both pockets, or the gate is only testing the honest player. _(Claude added, not reviewed)_
- [x] **Timeout must be invisible:** Log watchdog fires. On L4-L5 more than ~1 in 20 moves means the worker budget or the search is wrong and Owl is secretly playing the tactical fallback — we would be grading a different AI than the one the Brief describes. _(Claude added, not reviewed)_
- [ ] **First choice is blind:** The starter draft asks a first-timer to pick 1 of 3 powers before they have seen a single move, so "L1 teaches through the draft" is optimistic. Cheap fix, no new mechanic: mark one as "try this first" and let the icon's preview demo on the quilt behind the cards. If 3 of 5 testers can't say what their pick does, the first screen taught nothing. _(Claude added, not reviewed)_

### QA: worker + controller review

- [x] **isLegal, not find:** applyAction re-runs legalActions() and JSON-keys every branch on every node — that alone blows the 300ms budget. Search needs a cheap isLegal(s,a) plus an unchecked apply; the public API keeps the full check. _(Claude added, not reviewed)_
- [x] **Keep X power branches to X's 2nd turn:** Consecutive Slides are fine — two of three slots for one extra tempo is a real cost. But pruning X's powers after ply 2 blinds L5 to exactly that combo. Search X powers through ply ~4, then prune. _(Claude added, not reviewed)_
- [x] **Phases need a lost beat:** After O's line the controller jumps straight to Fresh board. Add a `lost` phase: 1s shatter, then Second Wind rewinds or the run-over card. Skipping the beat makes losing feel like a bug. _(Claude added, not reviewed)_
- [x] **HUD: boards left:** Drawn as the 3 hearts at the top-right of the concept art. _(Claude added, not reviewed)_
- [x] **Draft: confirm + one-tap skip:** At 3 powers a mis-tap must not spend a draft. Skip is one tap and costs nothing. _(Claude added, not reviewed)_
- [x] **One AI request in flight:** Stale replies dropped by revision; timeout fallback must be a best-so-far legal action, never a random cell. _(Claude added, not reviewed)_
- [x] **Wins have no beat:** Ruled: 'won' phase of 700ms; a tap skips to the draft screen without drafting. _(Claude added, not reviewed)_
- [x] **Out of boards skips the beat:** Defeat from the 3rd draw calls end() immediately. That's the most common death and it plays with no unravel. Route it through 'lost'. _(Claude added, not reviewed)_
- [x] **Hearts must reset visibly:** Hearts = 3 − drawsThisLevel and refill silently on level clear. Animate the refill or I'll think I lost a life. _(Claude added, not reviewed)_
- [x] **Score rewards hoarding:** Accepted: +25 per power spent this level. It's in tension with saving powers for L5, which is the point. _(Claude added, not reviewed)_
- [x] **Win-skip needs an input guard:** Accepted: swallow taps for 250ms after a win, fade the draft cards in. A mis-tap mid-preview cancels with nothing spent (tap the same cell, tap outside, or Esc). _(Claude added, not reviewed)_
- [x] **Second Wind heart count: code vs Brief:** Ruled: keep the code. A line loss keeps hearts unchanged; out of boards grants 1 heart. The Brief is fixed. _(Claude added, not reviewed)_
- [x] **receive() watchdog hardening posted:** Controller v4.1 clears inFlight only after successful commit. Tactical fallback is validated; canonical legal actions provide a last resort. Watchdog remains armed on rejected receive. Unexecuted; verify during build. _(Claude added, not reviewed)_

### Concept art: cozy cottage evening

- [x] **Setting:** A quilt on a cottage table. You play against Granny Owl, who knits as she thinks.
- [x] **Marks:** X = berry cross-stitch, O = deep-teal button (per the picture).
- [x] **Heat = hearth:** The HEARTH gauge on the left (per the picture). Fire and embers grow with Heat.
- [x] **Powers:** Shatter: snip with scissors, the button pops off. Slide: tug the thread, the stitch glides. Ward: an upturned teacup over the cell (a distinct shape, per QA).
- [x] **L2 rock = sleeping cat:** Blocks the cell. Shatter shoos it off: it stretches and pads away.
- [x] **AI tells:** Each draw makes Owl sleepier: her spectacles slip and she yawns. Her Ward on L5 = she sets down her teacup first.
- [x] **Levels = rooms:** L1 porch at dusk, L2 kitchen, L3 reading nook, L4 attic in a rainstorm (hardest), L5 fireside. The room is backdrop only: the board, HUD and palette stay the same.
- [x] **Loss / Second Wind:** Loss: the quilt unravels, the candle snuffs out, colors go grey. Second Wind: the threads re-knit with a chime.
- **Palette:** See the Brief art section.
- [x] **Heat 10: marks need stitched edges:** Berry X (B5485A) and teal O (2F5D6B) sit at the same darkness, so warm firelight mushes them together. Keep both saturated and give every mark a 1px ivory stitch halo so it floats above the glow. Squint test at Heat 10. _(Claude added, not reviewed)_
- [x] **Ward cup needs a coaster:** Ivory cup on ivory linen reads as a piece, not a blocked cell (my 'no Ward surprises' test). Put it on a dark walnut disc with a dashed stitched cell outline: blocked, not occupied. _(Claude added, not reviewed)_
- [x] **Dim the decor as Heat rises:** Above Heat 7, vignette the floral corners and table props. Marks and particles must stay the brightest thing on screen, or the juice fights the board. _(Claude added, not reviewed)_
- [x] **Heat peaks on a draw, not on a win:** Accepted: +1 per placement, +2 per power spent, +3 on your line. It's in the Brief. _(Claude added, not reviewed)_
- [x] **Timeout = Owl dozes, not a dumb move:** When the 1.2s watchdog fires, Granny Owl yawns, her spectacles slip and the hearth dips — the same tell as a draw. A technical fallback then reads as character instead of "the game played badly for me", and it reuses the sleepiness animation we already owe. _(Claude added, not reviewed)_

### Audio + integration gates

- [x] **Silent play remains complete:** Test blocked autoplay, unavailable WebAudio, mute, hidden-tab resume, and repeated Again. No duplicate cues, overlapping music timers, or audio-only Ward information. Verify levels on phone speakers and headphones; loudness is unmeasured.
- [ ] **Build from controller v4.1; tests unrun:** Watchdog and Heat already posted; receive hardening now included. Extract controller v4.1, both controller test cards, remaining modules and UI/audio patches. Run node --test, then browser smoke test. No new features.
- [x] **L5 claim needs a fixture:** Fixtures on card 'L5 Shatter fork'. Gate: control must not win; FORK-A must win in 3 plies against every O reply.
- [x] **No reply = frozen game. Add a watchdog:** Accepted: a 1.2s watchdog. The revision bump is the guarantee; cancelAI is only cleanup. It's in the Brief handoff. _(Claude added, not reviewed)_
- [ ] **Resume must not land mid-beat:** New save/resume feature meets phases 'won', 'lost' and 'transition', each of which only advances via a setTimeout that no longer exists after a reload. Save only stable phases (draft/player/ai); on load, snap: won→draft (or victory at L5), lost→resolve it (Second Wind or defeat), transition→player/ai. Otherwise a reload during the unravel eats the Second Wind decision and the run hangs on the beat. _(Claude added, not reviewed)_

### Pictures

**Hearth & Thread — cozy gameplay concept with stitched marks, Granny Owl and sewing-kit powers.** · GPT-6.1 Sol · Art Director

![Hearth & Thread — cozy gameplay concept with stitched marks, Granny Owl and sewing-kit powers.](<idea-board.assets/62491d8fbff5f88b308168c3d94a5929.png>)

## Flowchart

### Accepted cards

- **Fresh board: apply level setup**: On level entry, draw retry or Second Wind: clear marks/shields, apply this level's setup (L3 seeds, L4 O starts, L5 Ward). Keep powers; reset Heat. No starter draft on retry.
- **Player: place X or spend a power**: Preview, then confirm; cancel with the same cell, outside, or Esc. One power per turn, consumed on commit. Heat +1 per placement, +2 per power. An X line goes straight to Won; the AI never replies to a winning move.
- **AI turn**: Worker search (≤6 plies, ~300ms) with blunder rate per level, +10% per draw. Owl's tells: thinking, yawning, setting down her teacup (L5 Ward). Watchdog at 1.2s, then tactical fallback.
- **Resolve AI line / draw / continue**: O line goes to Lost. Full board with no line goes to Draw. Otherwise the player's turn. Shields expire before control is handed over.
- **Level cleared: draft 1 of 3**: Hearts refill one by one. Confirm tap; skip is free (except at 0 powers entering L5). At 3 powers held, swap one or skip. Score +100, +50 per heart, +25 per power spent.
- **Run over: the Quilt card**: Each board is a patch (gold, plain or grey). Shows level reached, score vs best, powers spent and peak Heat. One-tap Again goes to New run in under 1s.
- **Draw: burn a board, no draft**: Full board, no line = draw. Burns a board, no draft, powers kept. Out of boards = run over.
- **Run complete: victory + score**: Owl dozes by the fire and the finished quilt is shown in full. Score is saved, 'New best!' appears if earned. Again leads to New run.
- **Source: rules.mjs v2 (unexecuted)**: Copy into rules.mjs. Pure board logic; not executed here. applyAction returns {position,events} or {error}; callers must check error before using position. canApply accepts incomplete/null action input safely; state must satisfy the schema.
- **Source: rules.test.mjs v2 (unexecuted)**: Copy beside rules.mjs; run node --test rules.test.mjs. Not run here.
- **QA: reducer review — passes, 3 fixes**: By inspection (not executed). PASS: atomic powers, shield handoff, rock clear, immediate win, no input mutation, no board-full stall possible (draw is caught on the action that fills the board).
- **Lost: 1s unravel beat**: 1s: the O line pulses, the quilt unravels and goes grey. Second Wind available: re-knit, a fresh board, Heat reset. Otherwise: the run-over Quilt card. It's also reached from Draw when no boards are left.
- **Source: controller.mjs v4.1 (unexecuted)**: Copy to controller.mjs. Not executed. Includes 1.2s watchdog, revision guards, Heat formula, and receive() hardening. Retain v3 UI patch and both controller test cards. A rejected reply keeps its watchdog armed; fallback validates the tactical action, then tries canonical legal actions. Heat resets on freshBoard.
- **Source: hud.mjs + HUD CSS (unexecuted)**: HUD only; board renderer and scene art remain separate. Uses the approved reference's hierarchy, not the picture as a baked-in clickable board. Copy JS into hud.mjs; CSS into stylesheet. No assets generated. Not executed.
- **Source: controller.test.mjs v3 (unexecuted)**: Copy beside modules, run node --test controller.test.mjs. Not executed. Deterministic fake clock replaces old FIFO timer harness. Browser-only cancellation/inert checks remain in UI patch card.
- **Won: 700ms golden-line beat**: The golden line sews and the HEARTH flares. A tap skips to the draft screen (no auto-pick). After L5, goes to victory.
- **Source: ai.worker.mjs (unexecuted)**: Copy beside rules.mjs. Browser module worker; exports tacticalFallback for controller use. Correctness-first uses public v2 reducer; revalidation is still a known bottleneck. Budget is cooperative, unmeasured; no tests executed. Root fallback is canonicalized to avoid a duplicate branch.
- **Source: board.mjs v2 (unexecuted)**: Copy JS to board.mjs; retain CSS from prior renderer card/version or use the compact CSS below. onCommit, onSkipWon, announce injected. destroy removes document listeners. Last-selected cell cancels (not every earlier cell, so Slide may still place at its vacated origin). Not executed.
- **Source: app.mjs integration (unexecuted)**: Prototype assembly, not a finished illustrated scene. Copy JS to app.mjs; load via <script type="module"> over HTTP with all source modules beside it. Extract CSS from board/HUD cards into one stylesheet. Calls mountGame(document.querySelector('#app')). No execution or visual validation here.
- **QA paper run: L5 verdict = measure it**: Retracting "L5 is unwinnable". Foreman's line checks out by hand and so does mine — but not for the reason given. The win isn't the first fork; it's the recursion. After Shatter X holds three marks, and whichever single mark O blocks, adding one more X creates a *second* one-cell threat, so O faces two threats with one placement and one shield. X wins by arithmetic, not by cleverness.
- **Source: audio.mjs (unexecuted)**: WebAudio synthesis; no assets. createAudio() returns unlock, mute, heat, cue, destroy. unlock must run from a click/key gesture; returns false if unavailable. Quiet by default; not executed or loudness-tested. No gameplay timing depends on sound.
- **Audio wiring patch: app.mjs (unexecuted)**: Apply to app.mjs; this is a source patch, not an applied filesystem edit. Keep sound button outside HUD/board roots so their re-renders do not replace it.
- **Fixtures: L5 Shatter fork, exhaustive replies**: L5-FORK-A (legal: X=2, O=2, X to move)
- **Controller v3: required UI patch (unexecuted)**: Apply alongside controller v3 + board v2 before browser testing. Not executed; these edits are not yet merged into the older HUD/app cards.
- **New run: starter draft (1 of 3)**: From the title screen or 'Again'. Pick 1 of 3 powers (can't skip). Resumes a saved run if one exists.

### Connections

- Fresh board: apply level setup → Player: place X or spend a power
- Player: place X or spend a power → AI turn
- AI turn → Resolve AI line / draw / continue
- Resolve AI line / draw / continue → Player: place X or spend a power (continue)
- Level cleared: draft 1 of 3 → Fresh board: apply level setup (next level)
- Resolve AI line / draw / continue → Draw: burn a board, no draft (draw)
- Draw: burn a board, no draft → Fresh board: apply level setup (burn a board)
- Source: rules.mjs v2 (unexecuted) → QA: reducer review — passes, 3 fixes (reviewed)
- Source: rules.test.mjs v2 (unexecuted) → QA: reducer review — passes, 3 fixes (gaps)
- Resolve AI line / draw / continue → Lost: 1s unravel beat (O line)
- Lost: 1s unravel beat → Fresh board: apply level setup (Second Wind)
- Lost: 1s unravel beat → Run over: the Quilt card (no Second Wind)
- Player: place X or spend a power → Won: 700ms golden-line beat (X line)
- Won: 700ms golden-line beat → Level cleared: draft 1 of 3 (L1-4)
- Won: 700ms golden-line beat → Run complete: victory + score (L5)
- Draw: burn a board, no draft → Lost: 1s unravel beat (out of boards)
- QA paper run: L5 verdict = measure it → Fixtures: L5 Shatter fork, exhaustive replies (fixtures)
- New run: starter draft (1 of 3) → Fresh board: apply level setup (L1)
- Run over: the Quilt card → New run: starter draft (1 of 3) (Again)
- Run complete: victory + score → New run: starter draft (1 of 3) (Again)

## Ruled out

- **L4 corner cells shift each round**: "Sol: rotating all four corners preserves winning-line geometry; ambiguous shifting adds animation or surprise rather than a clear tactical choice." (GPT-6.1 Sol · Systems Designer, 2026-10-25, from chat)
- **ART STUDY · Hearth & Thread** (You, 2026-10-25, from ART STUDY · Hearth & Thread)
- **Image prompt (paste into any generator):** (You, 2026-10-25, from Image prompt (paste into any generator):)
- **Layout: Owl at the top (her mood shows the AI's state) · qui** (You, 2026-10-25, from Layout: Owl at the top (her mood shows the AI's state) · qui)
- **O's L5 Ward costs her the turn (no placement)**: "Foreman: by hand, one Shatter already forks through O's Ward. A turn-costing Ward would be worthless to O. The fix instead: guarantee a power entering L5." (Claude · Foreman, 2026-10-25, from chat)
