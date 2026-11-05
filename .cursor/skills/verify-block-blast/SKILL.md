---
name: verify-block-blast
description: Drive the Block Blast no-ads web game the way a player does (launch, place pieces, verify clears/game-over) via agent_browser. Use when verifying any gameplay, theme, toggle, or persistence change to index.html.
---

# Verify Block Blast

Single self-contained `index.html`, zero dependencies, zero external requests. The player surface is a phone-first portrait web UI: 8x8 `#board` grid, `#tray` with 3 piece slots, header buttons (theme/sound/vibration/pause/restart), pause and game-over overlays.

## Launch

Serve the repo root over loopback (no build step exists):

```
python -m http.server 8000
```

or `npx http-server -p 8000`, from the repo root. Then:

```
open http://127.0.0.1:8000/index.html
```

**Ready means usable:** `#board` contains 64 `.cell` divs and `#tray` contains 3 `.tray-slot` divs, one with a `.piece` child. A bare HTTP 200 is not enough — snapshot and confirm the board rendered. Startup needs no env vars, seed data, auth, or migrations.

**Teardown:** stop only the server process you started. Never kill by process name; track the PID or job handle. Proof artifacts in `verify-artifacts/` survive teardown.

## Doctor

One read-only check before driving, whenever anything looks off:

1. `get url` returns `http://127.0.0.1:8000/index.html` (your instance, not a stray tab).
2. Snapshot: `#board` has 64 cells, `#tray` has 3 slots, `#score` and `#best` show numbers, `#title` reads `Princess Blast` (cute default) or `Block Blast` (classic).
3. `preview_evaluate`: `document.querySelectorAll('.cell').length === 64` and no failed network requests (`performance.getEntriesByType('resource').length === 0` — the zero-third-party-requests invariant).

If any check fails, fix the instance before driving. Never drive a tab you did not open for this run.

## Drive

Use `agent_browser` against your own tab. Stable handles, in preference order:

- **Board cells:** `.cell` divs with `data-r` / `data-c` attributes (`cellAt(r,c)` in source). Prefer `preview_evaluate` with `document.querySelector('.cell[data-r="3"][data-c="5"]')` for state reads.
- **Buttons:** `#btn-theme`, `#btn-sound`, `#btn-vib`, `#btn-pause`, `#btn-restart`, `#btn-resume`, `#btn-again` (aria refs from snapshot; titles: Theme/Sound/Vibration/Pause/Restart).
- **Overlays:** `#ov-pause` / `#ov-over` with `.show` class when visible; `#final-score`, `#final-best`, `#over-msg`.
- **Tray pieces:** `.tray-slot` > `.piece[data-i]`, tap via `#tray` pointer events. For scripted placement verification, call the real user path through `preview_evaluate`: select via tray tap, place via board tap — or dispatch PointerEvents on the exact elements. Never call `doPlace()` / `applyPlacement()` directly; those are internal setters, not the user path.

Ghost preview: `.cell.ghost-ok` / `.cell.ghost-bad` classes appear during drag. Invalid taps flash `ghost-bad` for 250ms.

**Isolation:** two instances can run side by side only on different ports with separate browser profiles (localStorage holds `bb_best`, `bb_theme`, `bb_sound`, `bb_vib`). Default runs are single-instance on port 8000; do not open a second tab against the same server + profile while one run is driving.

## Evidence

Proof standards:

- Exercise the real user path (tap/drag on rendered elements), never internal functions or test-only endpoints (there are none — keep it that way).
- Capture the action AND the resulting state: ARIA snapshot + screenshot showing score/tray/board after the move, not just the final screen.
- Verify side effects: `localStorage` values (`bb_best`, `bb_theme`) read back via `preview_evaluate`, matching what the UI shows.
- Mocks: none. No network exists to mock. Sound/vibration are verified by toggle state + no-throw, not by audio output.
- The existing `node --test tests/rules-conformance.test.mjs` covers the pure-logic seam (8 tests, must stay green). This skill covers what it cannot: rendering, input, theme, persistence, overlays.

Artifacts go in `verify-artifacts/<feature-id>/`: `<step>.aria.txt` (snapshot), `<step>.png` (screenshot), `notes.md` (commands run + observed values). Proof artifacts survive cleanup.

## Cleanup

1. Stop the HTTP server you started (your PID/job only).
2. Clear verification-touched localStorage keys only if the run changed them (`bb_best`, `bb_theme`) — via the page itself or `preview_evaluate localStorage.removeItem`, never by wiping the whole profile.
3. Confirm `verify-artifacts/<feature-id>/` still exists with snapshots + screenshots after teardown. A cleanup that eats the proof fails the run.
4. Close your preview tab.

## Helpers

No helper scripts ship with this skill — `agent_browser` + `preview_evaluate` + `node --test` cover launch/doctor/drive/evidence. If a repeated multi-step drive earns a script, add it here as an executable file with its exact invocation shown in this section.

## Feature map

Read `features/README.md` first, then the matching feature file as the recipe. One mapped feature per proof run is enough; the map exists so later runs cover the rest.
