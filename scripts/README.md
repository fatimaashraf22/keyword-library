# Image capture tool

Not part of the published website — just a helper Claude runs to fill in `images/` for
keywords that don't have a picture yet.

## What it does

1. Reads `scripts/targets.json` — a list of `{ keyword, url }` (screenshot a specific page,
   optionally just one element via `selector`) or `{ keyword, search }` (best-effort: screenshots
   the first image-search result for that text — always worth a quick look before publishing).
2. Saves each screenshot into `images/`.
3. Updates the matching entry in `data.json` to point at the new file.
4. Prints a list of any keywords still missing an image, so it's clear what's left.

## One-time setup

```bash
cd scripts
npm install
npx playwright install chromium
```

## Running

```bash
cp targets.example.json targets.json   # then edit targets.json with real entries
node capture.js
```
