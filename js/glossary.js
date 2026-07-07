// ---- Glossary ----
// Flat A-Z list of every keyword in data.json, for quick scanning/searching.

const CATEGORY_LABELS = { cinematic: "Cinematic", styles: "Styles", motion: "Motion" };

const $ = (sel) => document.querySelector(sel);

fetch("data.json")
  .then((r) => r.json())
  .then((data) => {
    const sorted = [...data].sort((a, b) => a.keyword.localeCompare(b.keyword));
    render(sorted);
  })
  .catch((err) => {
    $("#glossary-list").innerHTML =
      '<p class="empty">Could not load data.json. If opening the file directly, run a local server (see README).</p>';
    console.error(err);
  });

function render(entries) {
  $("#count").textContent = `${entries.length} keyword${entries.length === 1 ? "" : "s"}`;
  const list = $("#glossary-list");
  list.innerHTML = entries
    .map(
      (e) => `
      <li class="glossary-item">
        <span class="glossary-keyword">${e.keyword}</span>
        <span class="badge">${CATEGORY_LABELS[e.category] || e.category}</span>
        <p class="glossary-note">${e.note || ""}</p>
      </li>`
    )
    .join("");
}
