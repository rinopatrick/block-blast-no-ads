# Clear lines and combos

Clear lines lets a player complete full rows or columns so they vanish with animation and particles, earn 10 points per cleared cell plus line bonuses, and build a streak bonus for clears on consecutive moves.

## Sub-features

- `clear-row` completes a full row and it clears with animation.
- `clear-col` completes a full column and it clears with animation.
- `clear-multi` completes 2+ lines at once for stacked line bonus (shared cell counted once).
- `clear-combo` clears on consecutive moves to build streak bonus (`streak × 20`).

## How to get to it (user POV)

- Fill the last hole in a nearly-full row or column by placing a piece there.
- Chain clears on back-to-back moves to grow the combo readout (`Combo x2!`, ...).

## Driving it with agent_browser

Preconditions:

- Fresh page load. No seed exists for a near-complete line through the UI, so set one up through REAL placements: place pieces to fill 7 of 8 cells in row 0, leaving `[0][7]` empty. (Direct `board` mutation is forbidden — build the state by playing.)
- Doctor check passes. Note the tray is random per load; the recipe may need several placements to shape the board.

- **Row clear.** Select a piece covering the lone hole and tap so it fills `[0][7]`. Row 0 cells flash `clearing` class, particles (`💖✨⭐💕` in cute, `✦` in classic) spawn, `#score` jumps by cells-placed + cleared×10 + line bonus (hand-check: `gainFor` — 2-cell piece + 8 cleared + 1 line + streak 1 = 82).
- **Column clear.** Same shape vertically: fill 7 of 8 in a column, place the last cell. Column clears with the same animation path.
- **Multi-line.** Fill row 3 to 7/8 AND column 5 to 7/8 with `[3][7]` shared-empty, then place a single cell there. Two lines clear, 15 unique cells (`clearing` on all 15, shared cell once), score includes the +50 second-line bonus.
- **Combo.** Clear on two consecutive moves (dry placement resets streak via `advanceStreak`). After the second straight clear the `combo-pop` element shows `Combo x2!` and score includes `streak × 20`.
- **Proof.** Snapshot + screenshot mid-`clearing` animation AND after settle to `verify-artifacts/clear-combo/`; record pre/post `#score` values and the hand-computed expectation in `notes.md`.

## Gotchas

- Tray pieces are random — the recipe cannot name exact slots in advance. Read the tray via snapshot first, then plan placements around what was dealt.
- `endCheck` settles 180ms after a clear; the `clearing` class and particles are transient (~950ms). Capture the mid-animation screenshot quickly.
- A full-board clear triggers the `Board Clear!` variant, not the combo popup. Do not confuse the two.
- Score math lives in `gainFor` and is pinned by `rules-conformance.test.mjs` — recompute by hand from the test vectors, never trust the UI number alone.
