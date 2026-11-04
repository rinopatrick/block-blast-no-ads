# 04: Phone QA sweep

**What to build:** A full manual pass on a real phone (Chrome + Safari) proving the game feels like the app: touch does what fingers expect, nothing fights the page, toggles and persistence all hold.

**Blocked by:** 02-deploy-vercel (needs the live URL to test on a real phone).

**Status:** done (verified on iPhone, 2026-11-04)

- [x] Drag placement works with finger, ghost preview tracks accurately
- [x] Tap-piece-then-tap-cell fallback places correctly, invalid taps flash and reject
- [x] Idle fit-hint appears after ~7s idle, clears on next input
- [x] Sound toggle silences/reenables; vibration toggle flips state, no haptic on iOS Safari (no navigator.vibrate support, code guards with feature check)
- [x] Pause freezes play, resume continues; restart resets cleanly
- [x] Best score + theme choice survive reload; rotation/resize never breaks layout
