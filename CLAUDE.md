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
- `scripts/serve.js` — local dev server (see below). Dev-only, never part of the published site.

## data.json entry schema

```json
{
  "keyword": "lens flare",
  "category": "cinematic",   // tab id: "cinematic" | "styles" | "motion" | "ui" (see CATEGORIES in js/app.js)
  "heading": "Lighting",     // section within the tab (see HEADING_ORDER in js/app.js)
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
node scripts/serve.js   # http://localhost:8000 — serves the site AND enables the "+" cards
```

Any static server (`python -m http.server 8000`, `npx serve`) also works for browsing; only
`serve.js` can save new keywords.

## Adding a new keyword

Through the UI, with `serve.js` running: click the **+** card at the end of any section. The form
takes a keyword, an image/video file *or* a YouTube URL, a description, and tags. On save the
server writes the file into `images/` (named from a slug of the keyword, never overwriting) and
appends the entry to `data.json`; the card appears immediately.

By hand: drop media in `images/`, add an entry to `data.json`, refresh.

## Editing an existing keyword

Open any card and click **Edit** (again, `serve.js` must be running). The same form opens
pre-filled, showing the current picture. Choosing a new file replaces it; **Remove picture** drops
it back to the "No media yet" placeholder. A file and a YouTube URL are mutually exclusive — picking
one clears the other, since a card can only show one.

Keys the form doesn't expose (`demo`, `role`, `prompt`, `types`) are carried through untouched, so
editing a live-demo card's description won't strip its demo.

## Deleting a keyword

Hover a card and click the bin in its top-right corner. It asks for confirmation, naming the
keyword and the picture file that goes with it. The entry leaves `data.json` and its picture leaves
`images/`. Nothing is kept.

### Save API (`scripts/serve.js`)

- `GET /api/status` → `{ok:true}`. `js/app.js` probes this on load and only renders the **+** and
  **Edit** buttons when it answers, so the published GitHub Pages site degrades to browse-only on
  its own.
- `POST /api/add` → JSON body with `keyword`, `category`, `heading`, optional `note`, `tags[]`,
  `youtube`, and `file: {name, data}` where `data` is base64. Media extensions are whitelisted.
- `POST /api/update` → same fields plus `index` (position in `data.json`), `originalKeyword`, and
  `clearMedia`.
- `POST /api/delete` → `index` and `originalKeyword` only.
- Both refuse the write unless the entry at `index` still carries `originalKeyword`, so a stale tab
  can't overwrite or delete the wrong row.
- Deleting an entry deletes its picture. Replacing a picture deletes the old file first, so the
  replacement takes the same filename rather than accumulating `-2`, `-3` suffixes.
- Bound to `127.0.0.1`. `data.json` is rewritten with `JSON.stringify(…, null, 2)`, matching the
  file's existing formatting so diffs stay one-entry-sized.

## Deploying

GitHub Pages: Settings → Pages → Branch `main` / root. No CI/build needed since it's static.
