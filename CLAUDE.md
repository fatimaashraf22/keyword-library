# Keyword Library — CLAUDE.md

A personal, static single-page gallery of AI-prompting technique keywords (image looks, video
motion, SVG/UI motion). Each entry pairs a keyword with an example image/video/GIF so the user can
recognize a look and grab the right word for prompting — not a prompt library, a visual dictionary.

## Stack

Vanilla web, no framework, no build step, no dependencies, no server. GitHub is the backend:

- `index.html` — page shell: header, filter/search controls, editing bar, card grid, modals.
- `css/styles.css` — all styling (dark theme, CSS custom properties in `:root`).
- `js/app.js` — rendering, filters/search, modal/lightbox, and every editing action.
- `js/github.js` — `GH`: sign-in and saving, as commits through the GitHub API.
- `js/config.js` — which repo and branch the site saves into.
- `data.json` — every card (array of keyword entries).
- `site.json` — title, tagline, tabs, and the sections inside each tab (including the Notes text).
- `images/` — example media referenced by `data.json` entries.

## site.json

```json
{
  "title": "Keyword Library",
  "tagline": "…",
  "tabs": [
    {
      "id": "cinematic",          // what cards store as "category"; never changes after creation
      "label": "Cinematic",       // button text, renamable
      "hidden": true,             // optional
      "sections": [
        {
          "title": "Lighting",    // what cards store as "heading"; unique within a tab
          "description": "…",     // plain text: blank line = paragraph, "- " = bullet, URLs autolink
          "linkUrl": "…", "linkLabel": "…",   // optional link beside the heading
          "hidden": true          // optional
        }
      ]
    }
  ]
}
```

Order of tabs and sections is their order in the file. "All" is built from every tab, not stored.
A section with no cards renders as a text block — that's what the Notes tab is.
Cards whose `category`/`heading` aren't in `site.json` get a section appended at the end (and
written into `site.json` on the next save).

## data.json entry schema

```json
{
  "keyword": "lens flare",
  "category": "cinematic",   // tab id from site.json
  "heading": "Lighting",     // section title within that tab
  "media": "images/lens-flare.jpg",  // optional; local image/gif/webp/mp4/webm path
  "youtube": "",          // optional; full URL, short link, or bare 11-char video id
  "note": "Short description of the technique.",
  "prompt": "…",          // optional sample prompt
  "role": "…",            // optional badge on the card
  "types": [],            // optional list shown under the description
  "tags": ["lighting", "lens", "cinematic"],
  "demo": "…",            // optional; names a live animation in js/demos.js
  "hidden": true          // optional
}
```

- No `media` and no `youtube` → card shows a "No media yet" placeholder (this is fine, not an error).
- `.mp4`/`.webm` → rendered as an autoplaying, looped, muted `<video>` on cards.
- `youtube` → card shows the YouTube thumbnail + play badge; modal embeds the real player.
- Everything else (`.jpg/.png/.gif/.webp/.svg`) → rendered via `<img>`.

## Editing on the live site

The **Sign in** link in the footer takes a fine-grained GitHub token (this repo only, Contents:
read and write). `GH.signIn` checks it can push, then keeps it in `localStorage` for this browser
only. Visitors never see editing controls.

Signed in, the page reads `data.json` and `site.json` straight from the repo via the API (the
published copy lags each save by a minute or so), and shows:

- **+ Tab** after the tab buttons; **+ Add section** at the end of a tab; a **+** card at the end of
  every section.
- Edit / hide / delete icons on every card (on hover) and section heading.
- An editing bar: Show hidden switch, rename/hide/delete the current tab, edit title & tagline,
  sign out.

Hidden items vanish for everyone; while signed in, **Show hidden** brings them back faded. The repo
is public, so hidden isn't secret, only out of view.

### How a save works (`persist` in app.js → `GH.commit`)

- The change is applied in memory, then committed as one commit holding `data.json`, `site.json`
  and any added or deleted `images/` file. If the commit fails, the in-memory change is rolled back.
- `GH.commit` refuses if `data.json`/`site.json` changed on GitHub since this page loaded them, so a
  stale tab can't overwrite newer edits.
- New pictures are named from a slug of the keyword, never overwriting another file. Replacing a
  picture deletes the old file in the same commit, so the replacement can take the same name.
  Deleting a card, section or tab deletes its pictures.
- Renaming a section rewrites `heading` on its cards in the same commit.
- Keys the form doesn't expose (`demo`, `hidden`) are carried through untouched.
- Uploads are capped at 100 MB (GitHub's per-file limit).
- JSON is written with `JSON.stringify(…, null, 2) + "\n"`, matching the files' formatting so diffs
  stay small.

Editing from a local copy works the same way — it also commits to GitHub — so `git pull` afterwards
to bring local files up to date.

## Running locally

Must be served over HTTP (fetch of the JSON files fails via `file://`):

```bash
python -m http.server 8000   # http://localhost:8000
```

## Deploying

GitHub Pages: Settings → Pages → Branch `main` / root. No CI/build needed since it's static. Every
save from the page is a commit to `main`, which Pages republishes in about a minute.
