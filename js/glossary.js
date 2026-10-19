// ---- Glossary ----
// Every visible keyword in data.json, grouped by tab (from site.json) into
// collapsible lists.

const $ = (sel) => document.querySelector(sel);

Promise.all(["data.json", "site.json"].map((f) => fetch(f).then((r) => r.json())))
  .then(([data, site]) => render(data, site))
  .catch((err) => {
    $("#glossary-list").innerHTML =
      '<p class="empty">Could not load the library. If opening the file directly, run a local server (see README).</p>';
    console.error(err);
  });

function escapeHTML(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function render(entries, site) {
  // Leave out anything hidden on the main page: the card itself, or the tab or
  // section it sits in.
  const tabs = site.tabs.filter((t) => !t.hidden);
  const visible = entries.filter((e) => {
    const tab = tabs.find((t) => t.id === e.category);
    const sec = tab && tab.sections.find((s) => s.title === (e.heading || "Other"));
    return !e.hidden && tab && !(sec && sec.hidden);
  });

  $("#count").textContent = `${visible.length} keyword${visible.length === 1 ? "" : "s"}`;

  $("#glossary-list").innerHTML = tabs
    .map((tab) => {
      const items = visible
        .filter((e) => e.category === tab.id)
        .sort((a, b) => a.keyword.localeCompare(b.keyword));
      if (!items.length) return "";
      return `
      <details class="glossary-group" open>
        <summary class="glossary-summary">
          <span class="glossary-group-title">${escapeHTML(tab.label)}</span>
          <span class="glossary-group-count">${items.length}</span>
        </summary>
        <ul class="glossary-items">
          ${items
            .map(
              (e) => `
            <li class="glossary-item">
              <span class="glossary-keyword">${escapeHTML(e.keyword)}</span>
              <p class="glossary-note">${escapeHTML(e.note)}</p>
            </li>`
            )
            .join("")}
        </ul>
      </details>`;
    })
    .join("");
}
