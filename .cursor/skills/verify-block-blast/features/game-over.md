# Game over and restart

Game over ends the run with a clear verdict when none of the remaining tray pieces fit anywhere, shows an overlay with score and best plus one-tap restart, and persists a new best across reloads.

## Sub-features

- `over-verdict` ends the run exactly when no remaining piece fits anywhere.
- `over-overlay` shows score, best, message, and a restart button.
- `over-restart` restarts into a fresh run with one tap.
- `over-best` persists a new best in `localStorage` (`bb_best`) across reloads.

## How to get to it (user POV)

- Keep playing until the board is so full no tray piece fits — the overlay appears ~450ms later.
- Tap the restart button (`#btn-again`) on the overlay, or `#btn-restart` in the header anytime.
- Reload the page — the header `#best` still shows the record.

## Driving it with agent_browser

Preconditions:

- Fresh page load. Reaching a true no-fit state through real play takes many moves; budget for a long drive or play to fill the board deliberately with large pieces.
- Doctor check passes. Record the opening `#best` value first.

- **Verdict.** Play until no tray piece fits. The overlay `#ov-over` gains class `show` (~450ms delay), `#final-score` equals the header `#score` at death, `#over-emoji` reads `💖 Game Over!` (cute) or `Game Over` (classic).
- **Overlay.** Snapshot the overlay: `#final-best`, `#over-msg` (new-best path shows `🎉 new best, princess! 🎉`), `#btn-again` present and clickable.
- **Restart.** Act on `#btn-again`. Board returns to 64 empty cells, `#score` reads `0`, tray shows 3 fresh pieces, overlay hides (`.show` removed). Header `#btn-restart` does the same mid-run without the overlay.
- **Best persists.** If score beat best: `preview_evaluate` `localStorage.getItem('bb_best')` equals the final score as JSON; reload the page and header `#best` shows the same value. Ties do NOT count (`isNewBest` is strict `>`).
- **Proof.** Overlay screenshot + snapshot, post-restart empty-board screenshot, `localStorage` read-back, all to `verify-artifacts/game-over/` with values in `notes.md`.

## Gotchas

- The 450ms overlay delay is real — snapshot too early and the overlay is absent. Wait for `.show` before asserting.
- An empty tray is NOT game over — `endCheck` refills first, then checks the fresh batch. Only a fresh batch that fits nowhere ends the run.
- The pause overlay `#ov-pause` is a different element; assert `#ov-over` specifically.
- `reset()` clears `newbest` text and both overlays — a restart that leaves stale overlay state is a bug, check for it.
