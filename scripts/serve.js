// Local dev + save server for the Keyword Library.
//
// Serves the site over HTTP (data.json can't be fetched from file://) and adds a
// small save API so the "+" card in each section can write real files:
//
//   GET  /api/status  -> tells the page saving is available (the "+" and "Edit"
//                        buttons only show up when this answers)
//   POST /api/add     -> writes the uploaded image/video into images/ and
//                        appends the new entry to data.json
//   POST /api/update  -> rewrites one entry in place, swapping in a new picture
//                        and deleting the old one once nothing else uses it
//   POST /api/delete  -> drops one entry and its picture
//
// Local only, bound to 127.0.0.1. The published GitHub Pages site still works —
// it just never sees /api/status, so it renders without the "+" cards.
//
//   node scripts/serve.js        -> http://localhost:8000

const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const IMAGES_DIR = path.join(ROOT, "images");
const DATA_FILE = path.join(ROOT, "data.json");
const PORT = Number(process.env.PORT) || 8000;
const MAX_BODY = 96 * 1024 * 1024; // 96 MB — room for a short video clip

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
};

// Only these land in images/ — keeps the upload endpoint from writing anything
// executable or otherwise unexpected into the repo.
const ALLOWED_MEDIA = new Set(["jpg", "jpeg", "png", "gif", "webp", "svg", "mp4", "webm"]);

function sendJSON(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store",
  });
  res.end(body);
}

// "Lens Flare!" -> "lens-flare", so filenames stay predictable and safe.
function slugify(s) {
  return (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "entry";
}

// Never clobber an existing picture: lens-flare.jpg, then lens-flare-2.jpg, …
function uniqueName(dir, base, ext) {
  let name = `${base}.${ext}`;
  let n = 2;
  while (fs.existsSync(path.join(dir, name))) {
    name = `${base}-${n}.${ext}`;
    n++;
  }
  return name;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (c) => {
      size += c.length;
      if (size > MAX_BODY) {
        reject(new Error("File too large — keep uploads under 96 MB."));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function readData() {
  const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  if (!Array.isArray(data)) throw new Error("data.json is not a list of entries.");
  return data;
}

// Matches the file's existing 2-space formatting, so adding or editing one
// keyword produces a one-entry-sized diff rather than reformatting everything.
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2) + "\n", "utf8");
}

// Decode an uploaded file and write it into images/ under a slug of the keyword.
function saveMedia(file, keyword) {
  const ext = String(file.name || "").split(".").pop().toLowerCase();
  if (!ALLOWED_MEDIA.has(ext)) {
    throw new Error(`Can't save a .${ext} file. Use jpg, png, gif, webp, svg, mp4 or webm.`);
  }
  const buf = Buffer.from(file.data, "base64");
  if (!buf.length) throw new Error("That file came through empty.");
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
  const name = uniqueName(IMAGES_DIR, slugify(keyword), ext);
  fs.writeFileSync(path.join(IMAGES_DIR, name), buf);
  return `images/${name}`;
}

function removeMedia(mediaPath) {
  if (!mediaPath || !mediaPath.startsWith("images/")) return;
  const file = path.resolve(ROOT, mediaPath);
  if (!file.startsWith(IMAGES_DIR)) return;
  fs.rmSync(file, { force: true });
  console.log(`  - removed ${mediaPath}`);
}

// Build the entry from the form payload. `base` is the existing entry when
// editing, so untouched keys (demo, role, prompt, types…) survive the round trip.
function buildEntry(payload, base) {
  const keyword = String(payload.keyword || "").trim();
  if (!keyword) throw new Error("A keyword is required.");

  const category = String(payload.category || "").trim();
  const heading = String(payload.heading || "").trim();
  if (!category || !heading) throw new Error("Missing section — reopen the form from a card.");

  const entry = Object.assign({}, base, { keyword, category, heading });

  if (payload.file && payload.file.data) {
    entry.media = saveMedia(payload.file, keyword);
  }

  const youtube = String(payload.youtube || "").trim();
  if (youtube) entry.youtube = youtube;
  else delete entry.youtube;

  const note = String(payload.note || "").trim();
  if (note) entry.note = note;
  else delete entry.note;

  const tags = (payload.tags || []).map((t) => String(t).trim()).filter(Boolean);
  if (tags.length) entry.tags = tags;
  else delete entry.tags;

  return entry;
}

function handleAdd(req, res) {
  readBody(req)
    .then((raw) => {
      const payload = JSON.parse(raw || "{}");
      const entry = buildEntry(payload, null);
      const data = readData();
      data.push(entry);
      writeData(data);
      console.log(`  + added "${entry.keyword}" to ${entry.category} / ${entry.heading}`);
      sendJSON(res, 200, { ok: true, entry });
    })
    .catch((err) => {
      console.error("  ! add failed:", err.message);
      sendJSON(res, 400, { ok: false, error: err.message });
    });
}

// The page addresses entries by position, so confirm the entry sitting there is
// still the one it meant — a stale tab must not overwrite or delete a different
// keyword.
function entryAt(data, payload) {
  const existing = data[Number(payload.index)];
  if (!existing) throw new Error("That keyword is no longer in data.json. Refresh and try again.");
  if (existing.keyword !== payload.originalKeyword) {
    throw new Error(`Expected "${payload.originalKeyword}" here but found "${existing.keyword}". Refresh and try again.`);
  }
  return existing;
}

function handleUpdate(req, res) {
  readBody(req)
    .then((raw) => {
      const payload = JSON.parse(raw || "{}");
      const data = readData();

      const index = Number(payload.index);
      const existing = entryAt(data, payload);
      const oldMedia = existing.media;
      const replacing = Boolean(payload.file && payload.file.data);

      // Bin the old picture BEFORE writing the new one, so the replacement can
      // take the same filename instead of piling up lens-flare-2.jpg.
      if (replacing || payload.clearMedia) removeMedia(oldMedia);

      const entry = buildEntry(payload, existing);
      if (payload.clearMedia && !replacing) delete entry.media;

      data[index] = entry;
      writeData(data);

      console.log(`  ~ updated "${entry.keyword}"`);
      sendJSON(res, 200, { ok: true, entry, index });
    })
    .catch((err) => {
      console.error("  ! update failed:", err.message);
      sendJSON(res, 400, { ok: false, error: err.message });
    });
}

function handleDelete(req, res) {
  readBody(req)
    .then((raw) => {
      const payload = JSON.parse(raw || "{}");
      const data = readData();
      const existing = entryAt(data, payload);

      data.splice(Number(payload.index), 1);
      writeData(data);
      removeMedia(existing.media);

      console.log(`  x deleted "${existing.keyword}"`);
      sendJSON(res, 200, { ok: true, index: Number(payload.index) });
    })
    .catch((err) => {
      console.error("  ! delete failed:", err.message);
      sendJSON(res, 400, { ok: false, error: err.message });
    });
}

function serveStatic(req, res, urlPath) {
  let rel = decodeURIComponent(urlPath.split("?")[0]);
  if (rel.endsWith("/")) rel += "index.html";
  const file = path.join(ROOT, rel);

  // Refuse anything that resolves outside the project folder.
  if (!file.startsWith(ROOT)) {
    res.writeHead(403).end("Forbidden");
    return;
  }
  fs.stat(file, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain" }).end("Not found");
      return;
    }
    res.writeHead(200, {
      "Content-Type": MIME[path.extname(file).toLowerCase()] || "application/octet-stream",
      "Content-Length": stat.size,
      // A replaced picture keeps its filename, so a cached copy would still show
      // the old image. Nothing here is cached — it's a local dev server.
      "Cache-Control": "no-store",
    });
    fs.createReadStream(file).pipe(res);
  });
}

http
  .createServer((req, res) => {
    const urlPath = req.url === "/" ? "/index.html" : req.url;

    if (urlPath.startsWith("/api/status")) {
      sendJSON(res, 200, { ok: true });
      return;
    }
    const api = { "/api/add": handleAdd, "/api/update": handleUpdate, "/api/delete": handleDelete };
    const handler = Object.keys(api).find((route) => urlPath.startsWith(route));
    if (handler) {
      if (req.method !== "POST") {
        sendJSON(res, 405, { ok: false, error: "Use POST." });
        return;
      }
      api[handler](req, res);
      return;
    }
    serveStatic(req, res, urlPath);
  })
  .listen(PORT, "127.0.0.1", () => {
    console.log(`Keyword Library running at http://localhost:${PORT}`);
    console.log(`Saving is on — the "+" card in each section writes to images/ and data.json.`);
  });
