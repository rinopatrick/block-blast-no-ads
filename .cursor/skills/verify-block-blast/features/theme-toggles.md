# Theme and toggles

Theme and toggles let the player switch cute/classic looks (remembered across visits), mute sound, disable vibration, and pause/resume mid-run without losing state.

## Sub-features

- `theme-switch` flips cute ↔ classic palettes, title, and particles; choice persists.
- `toggle-sound` mutes/unmutes synthesized audio; choice persists.
- `toggle-vib` enables/disables vibration; choice persists.
- `pause-resume` freezes play behind an overlay and resumes exactly where it left off.

## How to get to it (user POV)

- Header buttons: `#btn-theme` (🎀/🧱), `#btn-sound` (🔊/🔇), `#btn-vib`, `#btn-pause`; `#btn-resume` on the pause overlay.

## Driving it with agent_browser

Preconditions:

- Fresh page load, default cute theme (`#title` reads `💖 Princess Blast`, `document.documentElement.dataset.theme === 'cute'`).
- Doctor check passes. Record opening toggle states + `localStorage` (`bb_theme`, `bb_sound`, `bb_vib`).

- **Theme switch.** Act on `#btn-theme`. `data-theme` flips to `classic`, `#title` reads `🧱 Block Blast`, board `.cell` backgrounds switch to the slate palette, `#btn-theme` shows 🧱. Reload: theme is still classic (`bb_theme` read-back matches). Switch back and confirm cute returns.
- **Sound toggle.** Act on `#btn-sound`. Button shows 🔇 with class `off`; `bb_sound` is `false`. No audio assertion possible headless — state + no-throw is the proof. Toggle back on (🔊, class removed).
- **Vibration toggle.** Act on `#btn-vib`. Class `off` appears; `bb_vib` is `false`. Toggle back.
- **Pause/resume.** Make at least one placement (nonzero score), then act on `#btn-pause`. `#ov-pause` gains `show`, tray taps do nothing (score unchanged, no `selected` class). Act on `#btn-resume`: overlay hides, placement works again, score/board state is exactly as before the pause.
- **Proof.** Pre/post screenshots per toggle (palette difference visible), `localStorage` read-backs, pause-state board snapshot to `verify-artifacts/theme-toggles/` with values in `notes.md`.

## Gotchas

- `#btn-pause` while game-over is a no-op (guard `if(over) return`) — pause needs a live run.
- The personalization placeholder (`princess` nickname, `--cute-*` colors) is a one-edit swap in the file head, not a runtime setting. Do not file it as a theme bug.
- `pokeIdle` hint timer is cleared on pause and re-armed on resume — a hint appearing mid-pause-overlay is a bug.
- AudioContext resumes on first `pointerdown`; headless silence is expected and is NOT a failure.
