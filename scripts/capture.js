// Fills in images/ for Keyword Library entries.
//
// Two ways to describe what to capture, per item in targets.json:
//   { "keyword": "...", "url": "...", "selector": "optional CSS selector", "wait": optionalMs }
//     -> visits the URL and screenshots that selector (or the full page if no selector).
//   { "keyword": "...", "search": "some search text" }
//     -> screenshots the first image result for that search query (best-effort fallback
//        for gaps; always review the result before treating it as final).
//
// After each run, prints which keywords in data.json still have no media/youtube at all,
// so it's clear what's left to fill in by hand or with a better source URL.
//
// Usage: node capture.js [path-to-targets.json]  (defaults to targets.json)

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const IMAGES_DIR = path.join(ROOT, "images");
const DATA_PATH = path.join(ROOT, "data.json");
const targetsPath = path.resolve(process.cwd(), process.argv[2] || path.join(__dirname, "targets.json"));

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function captureUrl(page, target, outPath) {
  await page.goto(target.url, { waitUntil: target.waitUntil || "networkidle", timeout: 30000 });
  if (target.wait) await page.waitForTimeout(target.wait);

  if (target.selector) {
    const el = await page.locator(target.selector).first();
    await el.waitFor({ state: "visible", timeout: 10000 });
    await el.screenshot({ path: outPath });
  } else {
    await page.screenshot({ path: outPath });
  }
}

// NOTE: this is a best-effort fallback only. Bing sometimes serves an ad/carousel
// image in the same slot as real results, so the "first result" isn't always
// what it looks like. ALWAYS open the saved file and check it before trusting it —
// don't assume this produced the right picture.
async function captureSearch(page, target, outPath) {
  const q = encodeURIComponent(target.search);
  await page.goto(`https://www.bing.com/images/search?q=${q}`, { waitUntil: "networkidle", timeout: 30000 });
  const firstResult = page.locator("#mmComponent_images_1 .imgpt").first();
  await firstResult.waitFor({ state: "visible", timeout: 10000 });
  await firstResult.screenshot({ path: outPath });
}

async function main() {
  if (!fs.existsSync(targetsPath)) {
    console.error(`No targets file found at ${targetsPath}`);
    console.error("Copy scripts/targets.example.json to scripts/targets.json and fill it in.");
    process.exit(1);
  }

  const targets = JSON.parse(fs.readFileSync(targetsPath, "utf-8"));
  const entries = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));

  if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  const results = { ok: [], failed: [] };

  for (const target of targets) {
    const filename = `${slugify(target.keyword)}.png`;
    const outPath = path.join(IMAGES_DIR, filename);
    try {
      if (target.url) {
        await captureUrl(page, target, outPath);
      } else if (target.search) {
        await captureSearch(page, target, outPath);
      } else {
        throw new Error("target needs either 'url' or 'search'");
      }

      const match = entries.find((e) => e.keyword.toLowerCase() === target.keyword.toLowerCase());
      if (match) match.media = `images/${filename}`;

      results.ok.push(target.keyword);
      console.log(`✓ ${target.keyword} -> images/${filename}`);
    } catch (err) {
      results.failed.push({ keyword: target.keyword, error: err.message });
      console.error(`✗ ${target.keyword}: ${err.message}`);
    }
  }

  await browser.close();

  fs.writeFileSync(DATA_PATH, JSON.stringify(entries, null, 2) + "\n", "utf-8");

  const gaps = entries.filter((e) => !e.media && !e.youtube).map((e) => e.keyword);

  console.log("\n--- Summary ---");
  console.log(`Captured: ${results.ok.length}`);
  console.log(`Failed: ${results.failed.length}`);
  if (results.failed.length) console.log(results.failed);
  console.log(`\nStill missing an image (${gaps.length}):`);
  console.log(gaps.length ? gaps.join(", ") : "none — everything has media!");
}

main();
