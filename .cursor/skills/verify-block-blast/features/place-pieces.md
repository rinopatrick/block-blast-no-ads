# Place pieces

Place pieces lets a player select a tray piece by tapping it, place it on the 8x8 board by tapping a cell, get clear rejection feedback for invalid spots, receive a fresh batch of 3 when the tray empties, and see the score update on every placement.

## Sub-features

- `place-tap` selects a tray piece by tap, then places it by tapping a board cell.
- `place-invalid` rejects off-board or occupied placements with visible feedback and no state change.
- `place-refill` deals a fresh batch of 3 pieces when the tray empties.
- `place-score` updates the score readout immediately on every accepted placement.

## How to get to it (user POV)

- Tap a piece in the tray (it highlights `selected`), then tap a board cell to drop it there.
- Drag a piece from the tray onto the board (mouse on desktop, finger on phone).
- Open `http://127.0.0.1:8000/index.html` — the tray always starts with 3 fresh pieces.

## Driving it with agent_browser

Preconditions:

- Fresh page load, `#tray` shows 3 `.tray-slot` divs with `.piece` children, `#score` reads `0`.
- Doctor check passes (64 cells, zero failed requests).

- **Select piece.** Tap the first tray piece. Snapshot the tray, act on the `.piece[data-i="0"]` ref, or run `preview_evaluate`: `document.querySelector('.piece[data-i="0"]').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}))`. The parent `.tray-slot` gains class `selected`.
- **Place on board.** Tap an empty board cell via the `#board` pointer path: `preview_evaluate` dispatching `pointerdown` on `.cell[data-r="0"][data-c="0"]` (the board handler maps the tapped cell onto the piece with a forgiving anchor search). The cells fill (`filled` class), `#score` increases by the piece's cell count, the tray slot empties.
- **Invalid placement.** Select another piece and tap a cell where it cannot fit (e.g. occupied cells from the first placement, or a corner for a wide piece). The tapped cell flashes `ghost-bad` for ~250ms, score is unchanged, the piece stays selected in the tray.
- **Refill.** Place all 3 tray pieces on empty board regions. After the third placement the tray shows 3 fresh `.piece` elements (new batch dealt by `endCheck`).
- **Proof.** Snapshot + screenshot with board, tray, and score visible to `verify-artifacts/place-pieces/`; read `#score` text via `preview_evaluate` and record it in `notes.md`.

## Gotchas

- Tap-then-tap uses a forgiving anchor: tapping ANY cell covered by the placed shape works, not just the top-left. Do not assert a single anchor cell.
- Dispatch the full `pointerdown` + `pointerup` pair on tray pieces. A lone `pointerdown` leaves a stuck drag (`drag-layer` stays `display:grid`, z-50) that swallows all later hit-testing. Recovery: set `drag=null`, hide `drag-layer`, call `clearGhost()`.
- Scroll the tray into view before driving it: on wide viewports it sits below the fold and `elementFromPoint` returns null even though the element exists.
- The idle hint fires after 7s (`hint-glow` + "psst" text) — it is cosmetic, not a placement; ignore it or reset the timer by tapping first.
- Clear animations delay `endCheck` by 180ms — wait for the tray to re-render before asserting refill.
- Drag path lifts the piece ~2.2 cells above the finger (`boardAnchorFromPoint`); tap path has no lift. Verify the path the recipe names.
