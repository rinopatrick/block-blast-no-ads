# Block Blast verification map

This directory is the maintained source for verifying the user-facing behavior of Block Blast. Read this index before driving the app, then use the matching feature file as the recipe.

## Baseline preconditions

- Serve the repo root at `http://127.0.0.1:8000/index.html` with a server started by this run.
- Use a disposable browser profile (or clear `bb_best`, `bb_theme`, `bb_sound`, `bb_vib` first) so runs do not share state.
- Run the doctor check: 64 board cells, 3 tray slots, numeric score/best, zero failed network requests.
- Never drive an instance that was not started by this verification run.
- `node --test tests/rules-conformance.test.mjs` stays green (8 tests) — pure-logic seam proof; this map covers the DOM/input side it cannot reach.

## Driving conventions

- Start every recipe from a fresh page load unless its preconditions say otherwise.
- Prefer IDs and `data-r`/`data-c` attributes over CSS position or pixel coordinates.
- Treat every command as literal. Keep IDs and key names unchanged.
- Drive taps through `agent_browser` snapshot refs or `preview_evaluate` DOM queries on the real elements.
- Never call `doPlace()`, `applyPlacement()`, or `reset()` to simulate a move — drive the tap/drag path the player uses.
- Restore toggled settings after a mutation. Do not remove proof artifacts during cleanup.

## Proof and skip reporting

- Capture the user action and the resulting state, not only the final screen.
- UI proof includes a snapshot and a screenshot with score, tray, and board visible.
- Persistence proof includes a read-back of the `localStorage` key matching the UI value.
- Record the feature ID and entry point used with every artifact.
- Report an unreachable path with the attempted command and the unmet precondition.
- Do not report a skipped entry point as verified through a different path.

## Feature entry contract

Each feature file starts with an H1 title and one paragraph describing the user-visible behavior. It then uses exactly four H2 sections in this order.

1. `Sub-features` lists short IDs with one line for each behavior.
2. `How to get to it (user POV)` lists every user entry point.
3. `Driving it with agent_browser` starts with `Preconditions:` and uses labeled bullets that pair each user action with an exact command and observable result.
4. `Gotchas` lists traps that can waste or invalidate a verification run.

Keep implementation details out of the map. Name only user paths, stable handles, required state, commands, and observable proof.

## Features

- [Place pieces](./place-pieces.md) covers tap-to-select + tap-board placement, invalid rejection, tray refill, and score update.
- [Clear lines and combos](./clear-combo.md) covers row/column clears, multi-line clears, combo streak bonus, and clear animations.
- [Game over and restart](./game-over.md) covers the no-fit verdict, overlay with score/best, one-tap restart, and best-score persistence.
- [Theme and toggles](./theme-toggles.md) covers cute/classic switch with persistence, sound/vibration toggles, and pause/resume.
