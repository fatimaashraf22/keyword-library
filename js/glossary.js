// ---- Glossary ----
// Every keyword in data.json, grouped by category into collapsible lists.

const CATEGORY_LABELS = { cinematic: "Cinematic", styles: "Styles", motion: "Motion" };
// Order the sections appear in. Any unknown category is appended after these.
const CATEGORY_ORDER = ["cinematic", "styles", "motion"];

const $ = (sel) => document.querySelector(sel);

fetch("data.json")
  .then((r) => r.json())
  .then((data) => render(data))
  .catch((err) => {
    $("#glossary-list").innerHTML =
      '<p class="empty">Could not load data.json. If opening the file directly, run a local server (see README).</p>';
    console.error(err);
  });

function render(entries) {
  $("#count").textContent = `${entries.length} keyword${entries.length === 1 ? "" : "s"}`;

  // Group entries by category.
  const groups = {};
  for (const e of entries) {
    (groups[e.category] || (groups[e.category] = [])).push(e);
  }

  // Ordered list of categories: known ones first, then any extras alphabetically.
  const categories = [
    ...CATEGORY_ORDER.filter((c) => groups[c]),
    ...Object.keys(groups).filter((c) => !CATEGORY_ORDER.includes(c)).sort(),
  ];

  const list = $("#glossary-list");
  list.innerHTML = categories
    .map((cat) => {
      const items = groups[cat].sort((a, b) => a.keyword.localeCompare(b.keyword));
      const label = CATEGORY_LABELS[cat] || cat;
      return `
      <details class="glossary-group" open>
        <summary class="glossary-summary">
          <span class="glossary-group-title">${label}</span>
          <span class="glossary-group-count">${items.length}</span>
        </summary>
        <ul class="glossary-items">
          ${items
            .map(
              (e) => `
            <li class="glossary-item">
              <span class="glossary-keyword">${e.keyword}</span>
              <p class="glossary-note">${e.note || ""}</p>
            </li>`
            )
            .join("")}
        </ul>
      </details>`;
    })
    .join("");
}
