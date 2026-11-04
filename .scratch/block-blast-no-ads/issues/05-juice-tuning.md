# 05: Juice tuning

**What to build:** Animation timing, particle density, combo thresholds, and encouragement frequency tuned so clears feel rewarding but never slow down play on a mid-range phone.

**Blocked by:** 04-phone-qa-sweep (tune against real-device feel, not desktop).

**Status:** done (verified logic via node tests, real-device feel pass still open on next phone QA)

- [x] Clear/pop animations complete fast enough to never block the next placement
- [x] Particles read clearly on both themes without obscuring the board
- [x] Combo and board-clear callouts fire at the right moments, never double-fire
- [x] 60fps held during clears on a mid-range phone (transform/opacity-only animations)
- [x] Sound layering (place/clear/combo/fanfare) never clips or stacks harshly

**Notes (2026-11-04):** pure juice policy added to logic seam (`JUICE`, `particleCountFor`, `pickParticleCells`, `calloutKindFor`, `soundPlanFor`) with `tests/juice-tuning.test.mjs` (7 tests). CLEAR_MS 350→180, DROP 180→150, one `playPlan` + one `calloutKindFor` switch per clear, particles live-capped at PARTICLE_MAX=18 with `will-change`, tones capped VOICES_MAX=5 / vol 0.15 / stagger ≥60ms.

**Review revision (same day):** code-review Spec axis found 4 majors + 1 minor, all fixed: (W1) `filter:brightness` removed from `pop`/`hintPulse` keyframes — all anims transform/opacity-only; (W2) CLEAR_MS 220→180, back at/below original 180 gap; (W3) live voice ledger (`voiceRoom`/`claimVoices`, VOICE_WINDOW_MS 600) caps overlapping tones across rapid placements, `sfx.over()` routed via `playPlan`; (W4) classic-theme particles get glow `text-shadow` for contrast on dark board; (W5) streak pitch rise restored (`+40Hz` per streak above COMBO_AT), COMBO_MS 900 wired to CSS comboPop .9s.

**Gap-fix revision (same day):** follow-up review found 3 open gaps, all closed in code: (G1) steal guarantee — `claimVoices` drops the oldest live voice and hands its slot to the new plan's head, so a clear always makes sound (never `[]` for a nonempty plan); (G2) encouragement throttle — `encourageDue`/`lastEncourageAt` with ENCOURAGE_MS 1500, so rapid single-line clears no longer spam callouts; (G3) `big` flag renamed to `isBigClear` in `particleCountFor` and `particles`. Remaining: real-device feel pass on next phone QA (human gate, not automatable).
