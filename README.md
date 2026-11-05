<img src="assets/icon.svg" width="64" height="64" alt="Princess Blast icon">

# Princess Blast (block-blast-no-ads)

An ad-free Block Blast clone in a single self-contained `index.html`. No dependencies, no build step, no third-party requests. Open it or deploy the folder to any static host.

## Play

Open `index.html` in a phone browser, or serve the folder:

```
python -m http.server 8000
```

Then open `http://127.0.0.1:8000/index.html`. Drag pieces onto the 8x8 board, or tap a piece then tap the board. Full rows and columns clear with combos.

## Verify

```
node --test tests/rules-conformance.test.mjs tests/juice-tuning.test.mjs
```

Behavioral checks run against the pure-logic seam extracted from `index.html`. No test runner to install. Phone-driven checks use the `verify-block-blast` skill in `.cursor/skills/`.

## Personalize

Search `index.html` for `princess` to swap the nickname, and edit the `--cute-*` CSS variables for her colors.
