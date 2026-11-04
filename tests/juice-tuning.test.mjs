import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Extract the shipped pure-logic seam from index.html (no copies, no mocks).
const html = fs.readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'index.html'),
  'utf8'
);
const src = html.slice(html.indexOf('const N = 8;'), html.indexOf('/* ============ ADAPTERS'));
assert.ok(src.includes('function fits('), 'pure-logic seam missing from index.html');
const box = {};
vm.createContext(box);
vm.runInContext(src + '\nthis.__api = { JUICE, particleCountFor, pickParticleCells, calloutKindFor, soundPlanFor, voiceRoom, claimVoices };', box);
// clone vm-realm objects into host realm (deepStrictEqual checks prototypes)
const raw = box.__api;
const clone = (v) => JSON.parse(JSON.stringify(v));
const api = {
  JUICE: clone(raw.JUICE),
  particleCountFor: (...a) => raw.particleCountFor(...a),
  pickParticleCells: (...a) => clone(raw.pickParticleCells(...a)),
  calloutKindFor: (...a) => raw.calloutKindFor(...a),
  soundPlanFor: (...a) => clone(raw.soundPlanFor(...a)),
  voiceRoom: (...a) => raw.voiceRoom(...a),
  claimVoices: (...a) => clone(raw.claimVoices(...a)),
};

test('JUICE caps: anims never block placement, density/voices bounded', () => {
  assert.ok(api.JUICE.CLEAR_MS <= 180, `CLEAR_MS=${api.JUICE.CLEAR_MS} must not block next placement`);
  assert.ok(api.JUICE.DROP_MS <= 200, `DROP_MS=${api.JUICE.DROP_MS}`);
  assert.ok(api.JUICE.COMBO_MS <= 1000, `COMBO_MS=${api.JUICE.COMBO_MS}`);
  assert.ok(api.JUICE.PARTICLE_MAX <= 24, `PARTICLE_MAX=${api.JUICE.PARTICLE_MAX} must not obscure board`);
  assert.ok(api.JUICE.VOICES_MAX <= 5, `VOICES_MAX=${api.JUICE.VOICES_MAX} must not clip`);
  assert.ok(api.JUICE.STAGGER_MIN >= 0.05, 'stacked tones need >=50ms stagger');
});

test('particleCountFor: scales with clear, hard-capped', () => {
  assert.equal(api.particleCountFor(8, true), 16);
  assert.equal(api.particleCountFor(15, true), 18); // 30 capped to PARTICLE_MAX
  assert.equal(api.particleCountFor(8, false), 8);
  assert.equal(api.particleCountFor(0, true), 0);
  assert.equal(api.particleCountFor(100, false), 18);
});

test('pickParticleCells: short list untouched, long list evenly sampled', () => {
  const few = [[0, 0], [1, 1]];
  assert.deepEqual(api.pickParticleCells(few, 6), few);
  const many = Array.from({ length: 15 }, (_, i) => [i, 0]);
  assert.deepEqual(api.pickParticleCells(many, 6),
    [[0, 0], [2, 0], [5, 0], [7, 0], [10, 0], [12, 0]]);
});

test('calloutKindFor: one kind per clear, board-clear wins, dry move silent', () => {
  const noClear = { lines: 0, streakAfter: 0, boardCleared: false, clearedCount: 0 };
  assert.equal(api.calloutKindFor(noClear), null);
  assert.equal(api.calloutKindFor({ lines: 2, streakAfter: 3, boardCleared: true, clearedCount: 15 }), 'board-clear');
  assert.equal(api.calloutKindFor({ lines: 1, streakAfter: 2, boardCleared: false, clearedCount: 8 }), 'combo');
  assert.equal(api.calloutKindFor({ lines: 2, streakAfter: 1, boardCleared: false, clearedCount: 16 }), 'multi');
  assert.equal(api.calloutKindFor({ lines: 1, streakAfter: 1, boardCleared: false, clearedCount: 8 }), 'encourage');
});

test('soundPlanFor: exact hand-computed plans for place/clear/combo/fanfare', () => {
  assert.deepEqual(
    api.soundPlanFor({ lines: 0, streakAfter: 0, boardCleared: false, clearedCount: 0 }),
    [
      { freq: 420, dur: 0.1, delay: 0, type: 'sine', vol: 0.15 },
      { freq: 630, dur: 0.12, delay: 0.06, type: 'sine', vol: 0.15 },
    ]
  );
  assert.deepEqual(
    api.soundPlanFor({ lines: 1, streakAfter: 1, boardCleared: false, clearedCount: 8 }),
    [{ freq: 520, dur: 0.14, delay: 0, type: 'sine', vol: 0.15 }]
  );
  assert.deepEqual(
    api.soundPlanFor({ lines: 2, streakAfter: 1, boardCleared: false, clearedCount: 16 }),
    [
      { freq: 520, dur: 0.14, delay: 0, type: 'sine', vol: 0.15 },
      { freq: 660, dur: 0.14, delay: 0.07, type: 'sine', vol: 0.15 },
    ]
  );
  assert.deepEqual(
    api.soundPlanFor({ lines: 1, streakAfter: 2, boardCleared: false, clearedCount: 8 }),
    [
      { freq: 660, dur: 0.12, delay: 0, type: 'triangle', vol: 0.14 },
      { freq: 840, dur: 0.12, delay: 0.06, type: 'triangle', vol: 0.14 },
      { freq: 1020, dur: 0.12, delay: 0.12, type: 'triangle', vol: 0.14 },
    ]
  );
  // streak pitch rises: higher streaks sound distinct
  const p3 = api.soundPlanFor({ lines: 1, streakAfter: 3, boardCleared: false });
  assert.equal(p3[0].freq, 700);
  assert.deepEqual(
    api.soundPlanFor({ lines: 2, streakAfter: 4, boardCleared: true, clearedCount: 15 }),
    [
      { freq: 523, dur: 0.16, delay: 0, type: 'triangle', vol: 0.14 },
      { freq: 659, dur: 0.16, delay: 0.09, type: 'triangle', vol: 0.14 },
      { freq: 784, dur: 0.16, delay: 0.18, type: 'triangle', vol: 0.14 },
      { freq: 1047, dur: 0.16, delay: 0.27, type: 'triangle', vol: 0.14 },
    ]
  );
});

test('voice ledger: rapid placements share one VOICES_MAX window, stale voices expire', () => {
  const full = [
    { freq: 520, dur: 0.14, delay: 0 },
    { freq: 660, dur: 0.14, delay: 0.07 },
    { freq: 800, dur: 0.14, delay: 0.14 },
    { freq: 940, dur: 0.14, delay: 0.21 },
    { freq: 1080, dur: 0.14, delay: 0.28 },
  ];
  assert.equal(api.claimVoices(full, 0).length, 5);
  assert.equal(api.voiceRoom(100), 0); // window still full 100ms later
  assert.deepEqual(api.claimVoices(full, 100), []); // second rapid clear gets nothing: no stack
  assert.equal(api.voiceRoom(900), 5); // window expired: room again
  assert.equal(api.claimVoices(full.slice(0, 2), 900).length, 2);
});

test('soundPlanFor: every plan capped, staggered, and quiet enough to never clip', () => {
  const plans = [
    api.soundPlanFor({ lines: 0, streakAfter: 0, boardCleared: false, clearedCount: 0 }),
    api.soundPlanFor({ lines: 8, streakAfter: 1, boardCleared: false, clearedCount: 64 }),
    api.soundPlanFor({ lines: 3, streakAfter: 9, boardCleared: false, clearedCount: 24 }),
    api.soundPlanFor({ lines: 8, streakAfter: 9, boardCleared: true, clearedCount: 64 }),
  ];
  for (const p of plans) {
    assert.ok(p.length >= 1 && p.length <= api.JUICE.VOICES_MAX, `voice count ${p.length}`);
    for (const t of p) assert.ok(t.vol <= 0.15, `vol ${t.vol} must not clip`);
    const ds = p.map((t) => t.delay).sort((a, b) => a - b);
    for (let i = 1; i < ds.length; i++) {
      assert.ok(ds[i] - ds[i - 1] >= api.JUICE.STAGGER_MIN - 1e-9,
        `stagger ${ds[i] - ds[i - 1]} too tight, stacks harshly`);
    }
  }
});
