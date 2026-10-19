# Keyword Library

A personal **visual reference of technique keywords** — image looks, video motion,
and SVG/UI motion — each shown with an example so you can *see the look and grab
the word* when prompting.

Not a prompt library: a searchable dictionary of keywords + pictures.

## How it works

- **`data.json`** — every keyword card.
- **`site.json`** — the title, the tabs, and the sections inside each tab (Notes included).
- **`images/`** — example pictures, GIFs and videos.
- **`index.html` + `css/` + `js/`** — a single-page gallery with tabs and search.
  No build step, no dependencies, no server.

## Editing

Everything is edited on the site itself. Click **Sign in** in the footer and paste a
GitHub token:

1. Go to GitHub → Settings → Developer settings → **Fine-grained tokens** → Generate new token.
2. Repository access: **Only select repositories** → `keyword-library`.
3. Permissions: **Contents → Read and write**.

Signed in, you get a **+** to add cards, sections and tabs, plus edit / hide / delete
on everything. Each save is a commit to this repo; visitors see it about a minute
later, once GitHub Pages republishes.

## Run it locally

Because it loads JSON files, open it through a tiny local server (not by
double-clicking the file):

```bash
python -m http.server 8000      # then visit http://localhost:8000
```

## Publish (GitHub Pages)

**Settings → Pages → Branch: `main` / root → Save.**
The site goes live at `https://<your-username>.github.io/<repo-name>/`.
