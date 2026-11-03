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
vm.runInContext(src + '\nthis.__api = { fits, fitsAnywhere, fullLines, applyPlacement, emptyBoard, trayIsEmpty, gameOverFor, advanceStreak, gainFor, isNewBest, N };', box);
const api = box.__api;

test('fits: empty cell accepted, occupied and OOB rejected', () => {
  const b = api.emptyBoard();
  assert.equal(api.fits(b, [[0, 0]], 0, 0), true);
  b[0][0] = 1;
  assert.equal(api.fits(b, [[0, 0]], 0, 0), false);
  assert.equal(api.fits(api.emptyBoard(), [[0, 0]], 8, 0), false);
  assert.equal(api.fits(api.emptyBoard(), [[0, 0], [0, 1]], 0, 7), false);
});

test('fitsAnywhere: room found on empty board, none on full board', () => {
  const sq2 = [[0,0],[0,1],[1,0],[1,1]];
  assert.equal(api.fitsAnywhere(api.emptyBoard(), sq2), true);
  const full = Array.from({ length: 8 }, () => Array(8).fill(1));
  assert.equal(api.fitsAnywhere(full, [[0, 0]]), false);
  const oneHole = full.map((row) => row.slice());
  oneHole[7][7] = 0;
  assert.equal(api.fitsAnywhere(oneHole, [[0, 0]]), true);
  assert.equal(api.fitsAnywhere(oneHole, [[0, 0], [0, 1]]), false);
});

test('fullLines + applyPlacement: row clear yields 8 cells, row+col yields 15 unique', () => {
  const b = api.emptyBoard();
  for (let c = 0; c < 7; c++) b[0][c] = 1;
  const r1 = api.applyPlacement(b, [[0, 0]], 0, 7, 1);
  assert.equal(r1.lines, 1);
  assert.equal(r1.clearedCells.length, 8);
  assert.ok(b[0].every((v) => !v));

  const b2 = api.emptyBoard();
  for (let c = 0; c < 7; c++) b2[3][c] = 1;
  for (let r = 0; r < 8; r++) if (r !== 3) b2[r][5] = 1;
  const r2 = api.applyPlacement(b2, [[0, 0]], 3, 7, 1);
  assert.equal(r2.lines, 2);
  assert.equal(r2.clearedCells.length, 15); // 8 + 8 - 1 shared, no double count
});

test('advanceStreak: builds only on consecutive clears, dry placement resets', () => {
  assert.equal(api.advanceStreak(0, 0), 0);
  assert.equal(api.advanceStreak(3, 0), 0);
  assert.equal(api.advanceStreak(0, 1), 1);
  assert.equal(api.advanceStreak(2, 1), 3);
});

test('gainFor: hand-computed placement + clear + multi-line + combo bonus', () => {
  assert.equal(api.gainFor(4, 0, 0, 0), 4);
  assert.equal(api.gainFor(2, 8, 1, 1), 82); // 2 + 8*10
  assert.equal(api.gainFor(2, 8, 1, 2), 122); // + streak 2*20
  assert.equal(api.gainFor(4, 15, 2, 2), 244); // 4 + 150 + 50 + 40
});

test('trayIsEmpty: refills exactly when all three slots used', () => {
  const used = [{ used: true }, { used: true }, { used: true }];
  const part = [{ used: true }, { used: false }, { used: true }];
  assert.equal(api.trayIsEmpty(used), true);
  assert.equal(api.trayIsEmpty(part), false);
  assert.equal(api.trayIsEmpty([null, { used: true }, { used: true }]), true);
});

test('gameOverFor: alive while any piece fits, dead only when none fit; fresh dead refill ends run', () => {
  const full = Array.from({ length: 8 }, () => Array(8).fill(1));
  const oneHole = full.map((row) => row.slice());
  oneHole[7][7] = 0;
  const single = [{ cells: [[0, 0]], used: false }];
  const domino = [{ cells: [[0, 0], [0, 1]], used: false }];
  assert.equal(api.gameOverFor(oneHole, single), false); // last-piece-fits keeps run alive
  assert.equal(api.gameOverFor(oneHole, domino), true); // no-fit-anywhere ends run
  assert.equal(api.gameOverFor(api.emptyBoard(), [{ used: true }]), false); // empty tray never game over (refill first)
  assert.equal(api.gameOverFor(full, single), true); // fresh refill that fits nowhere still ends run
});

test('isNewBest: strictly greater only, ties do not count', () => {
  assert.equal(api.isNewBest(10, 9), true);
  assert.equal(api.isNewBest(9, 9), false);
  assert.equal(api.isNewBest(8, 9), false);
});
