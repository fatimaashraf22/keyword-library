# Keyword Library — CLAUDE.md

A personal, static single-page gallery of AI-prompting technique keywords (image looks, video
motion, SVG/UI motion). Each entry pairs a keyword with an example image/video/GIF so the user can
recognize a look and grab the right word for prompting — not a prompt library, a visual dictionary.

## Stack

Vanilla web, no framework, no build step, no dependencies, no backend:

- `index.html` — page shell: header, filter/search controls, card grid, lightbox modal.
- `css/styles.css` — all styling (dark theme, CSS custom properties in `:root`).
- `js/app.js` — all logic: fetches `data.json`, renders cards, filters/search, modal/lightbox.
- `data.json` — the entire content of the library (array of keyword entries).
- `images/` — example media referenced by `data.json` entries.

## data.json entry schema

```json
{
  "keyword": "lens flare",
  "category": "image",   // must be "image" | "video" | "svg"
  "media": "images/lens-flare.jpg",  // optional; local image/gif/webp/mp4/webm path
  "youtube": "",          // optional; full URL, short link, or bare 11-char video id
  "note": "Short description of the technique.",
  "tags": ["lighting", "lens", "cinematic"]
}
```

- No `media` and no `youtube` → card shows a "No media yet" placeholder (this is fine, not an error).
- `.mp4`/`.webm` → rendered as an autoplaying, looped, muted `<video>` on cards.
- `youtube` → card shows the YouTube thumbnail + play badge; modal embeds the real player.
- Everything else (`.jpg/.png/.gif/.webp/.svg`) → rendered via `<img>`.

## How the app works (js/app.js)

1. On load, `fetch("data.json")` populates `ENTRIES`, then builds category filter buttons and renders
   the grid.
2. Filtering/search is entirely client-side and re-renders from the in-memory array — category match
   (`all`/`image`/`video`/`svg`) AND a substring search over `keyword + tags + note`.
3. Clicking a card opens `#modal` with full playback, note, tags, and a "Copy keyword" button
   (`navigator.clipboard`).
4. `youtubeId()` extracts a video ID from `youtu.be/…`, `?v=…`, `/embed/…`, `/shorts/…`, or a bare id.

## Running locally

Must be served over HTTP (fetch of `data.json` fails via `file://`):

```bash
python -m http.server 8000   # http://localhost:8000
npx serve
```

## Adding a new keyword

1. Drop an image/gif/video in `images/`.
2. Add an entry to `data.json` (see schema above).
3. Refresh — no build step.

## Deploying

GitHub Pages: Settings → Pages → Branch `main` / root. No CI/build needed since it's static.
