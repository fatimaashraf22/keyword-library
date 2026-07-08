// One-off batch runner: takes scripts/targets-visual.json (explicit
// { keyword, filename, search }) and screenshots the first Bing image result
// for each into images/<filename>, exactly as named. Does NOT touch data.json
// (paths already point at these filenames).
//
// Same caveat as capture.js's search mode: always spot-check results before
// trusting them.

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const IMAGES_DIR = path.join(ROOT, "images");
const targetsPath = path.join(__dirname, "targets-visual.json");

async function main() {
  const targets = JSON.parse(fs.readFileSync(targetsPath, "utf-8"));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  const results = { ok: [], failed: [] };

  for (const target of targets) {
    const outPath = path.join(IMAGES_DIR, target.filename);
    try {
      const q = encodeURIComponent(target.search);
      await page.goto(`https://www.bing.com/images/search?q=${q}`, { waitUntil: "networkidle", timeout: 30000 });
      const firstResult = page.locator("#mmComponent_images_1 .imgpt, .imgpt").first();
      await firstResult.waitFor({ state: "visible", timeout: 10000 });
      await firstResult.screenshot({ path: outPath });
      results.ok.push(target.keyword);
      console.log(`✓ ${target.keyword} -> images/${target.filename}`);
    } catch (err) {
      results.failed.push({ keyword: target.keyword, error: err.message });
      console.error(`✗ ${target.keyword}: ${err.message}`);
    }
  }

  await browser.close();
  console.log(`\nCaptured: ${results.ok.length}, Failed: ${results.failed.length}`);
  if (results.failed.length) console.log(results.failed);
}

main();
