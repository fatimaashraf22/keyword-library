# Keyword Library

A personal **visual reference of technique keywords** — image looks, video motion,
and SVG/UI motion — each shown with an example so you can *see the look and grab
the word* when prompting.

Not a prompt library: a searchable dictionary of keywords + pictures.

## How it works

- **`data.json`** — the whole library. One entry per keyword.
- **`images/`** — your example pictures / GIFs.
- **`index.html` + `css/` + `js/`** — a single-page gallery with category filters
  and search. No build step, no dependencies.

## Add a new keyword

1. Drop an image in `images/` (e.g. `images/lens-flare.jpg`).
2. Add an entry to `data.json`:

   ```json
   {
     "keyword": "lens flare",
     "category": "image",
     "media": "images/lens-flare.jpg",
     "note": "Bright streaks/halos from light hitting the lens.",
     "tags": ["lighting", "lens", "cinematic"]
   }
   ```

   `category` must be one of: `image`, `video`, `svg`.
3. Save. Refresh the page. Done. (No image yet? It still works — shows a placeholder.)

## Run it locally

Because it loads `data.json`, open it through a tiny local server (not by
double-clicking the file):

```bash
# from this folder — pick one:
python -m http.server 8000      # then visit http://localhost:8000
npx serve                       # if you have Node
```

## Publish (GitHub Pages)

After pushing to GitHub: **Settings → Pages → Branch: `main` / root → Save.**
Your site goes live at `https://<your-username>.github.io/<repo-name>/`.
