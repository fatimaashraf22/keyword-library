// ---- Keyword Library ----
// All content lives in data.json. This file just renders + filters it.

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "cinematic", label: "Cinematic" },
  { id: "styles", label: "Styles" },
  { id: "motion", label: "Motion" },
];

// Controls the order headings appear in within a category (unlisted headings
// fall to the end, in whatever order they're first seen).
const HEADING_ORDER = [
  "Lighting",
  "Lens Effects",
  "Camera Shots & Angles",
  "Camera Movement & Effects",
  "Composition",
  "Color & Grading",
  "Editing Transitions",
  "Aesthetic Styles",
  "Art Movements & Eras",
  "Iconic Artists",
  "GSAP Animation",
  "Motion Graphics Elements",
  "UI Motion",
];

let ENTRIES = [];
let activeCategory = "all";
let searchTerm = "";

const $ = (sel) => document.querySelector(sel);

// Fetch the data
fetch("data.json")
  .then((r) => r.json())
  .then((data) => {
    ENTRIES = data;
    buildFilters();
    render();
  })
  .catch((err) => {
    $("#grid").innerHTML =
      '<p class="empty">Could not load data.json. If opening the file directly, run a local server (see README).</p>';
    console.error(err);
  });

function buildFilters() {
  const el = $("#filters");
  el.innerHTML = "";
  CATEGORIES.forEach((cat) => {
    const btn = document.createElement("button");
    btn.className = "filter-btn" + (cat.id === activeCategory ? " active" : "");
    btn.textContent = cat.label;
    btn.onclick = () => {
      activeCategory = cat.id;
      buildFilters();
      render();
    };
    el.appendChild(btn);
  });
}

function categoryLabel(id) {
  const c = CATEGORIES.find((c) => c.id === id);
  return c ? c.label : id;
}

// Pull a YouTube video id out of a full URL, short link, or a raw id.
function youtubeId(val) {
  if (!val) return null;
  const m = val.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([A-Za-z0-9_-]{11})/);
  if (m) return m[1];
  if (/^[A-Za-z0-9_-]{11}$/.test(val)) return val; // already a bare id
  return null;
}

function ext(path) {
  return (path || "").split(".").pop().toLowerCase();
}

const placeholder = (kw) => `<div class="placeholder">No media yet<br>${kw}</div>`;

// Card view: lightweight. Local video/svg/gif auto-loop to show the motion at a
// glance; YouTube shows its thumbnail with a play badge (player opens in modal).
function cardMediaHTML(entry) {
  const yt = youtubeId(entry.youtube);
  if (yt) {
    return `<img src="https://img.youtube.com/vi/${yt}/hqdefault.jpg" alt="${entry.keyword}" loading="lazy"
      onerror="this.parentNode.innerHTML='${placeholder(entry.keyword).replace(/"/g, "&quot;")}'">
      <span class="play-badge">▶</span>`;
  }
  if (entry.media) {
    const e = ext(entry.media);
    if (e === "mp4" || e === "webm") {
      return `<video src="${entry.media}" muted loop autoplay playsinline
        onerror="this.parentNode.innerHTML='${placeholder(entry.keyword).replace(/"/g, "&quot;")}'"></video>`;
    }
    // images, gif, webp, and animated svg all render fine via <img>
    return `<img src="${entry.media}" alt="${entry.keyword}" loading="lazy"
      onerror="this.parentNode.innerHTML='${placeholder(entry.keyword).replace(/"/g, "&quot;")}'">`;
  }
  return placeholder(entry.keyword);
}

// Modal view: full playback — YouTube becomes an embedded player with sound.
function modalMediaHTML(entry) {
  const yt = youtubeId(entry.youtube);
  if (yt) {
    return `<iframe src="https://www.youtube.com/embed/${yt}" title="${entry.keyword}"
      frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen></iframe>`;
  }
  if (entry.media) {
    const e = ext(entry.media);
    if (e === "mp4" || e === "webm") {
      return `<video src="${entry.media}" controls muted loop autoplay playsinline></video>`;
    }
    return `<img src="${entry.media}" alt="${entry.keyword}">`;
  }
  return placeholder(entry.keyword);
}

function getFiltered() {
  const term = searchTerm.trim().toLowerCase();
  return ENTRIES.filter((e) => {
    const catOk = activeCategory === "all" || e.category === activeCategory;
    if (!catOk) return false;
    if (!term) return true;
    const haystack = (e.keyword + " " + (e.tags || []).join(" ") + " " + (e.note || "")).toLowerCase();
    return haystack.includes(term);
  });
}

// Group entries into sections: heading within a category tab, or
// "Category — Heading" when browsing "All". Sections are ordered by
// HEADING_ORDER (falling back to first-seen order for unlisted headings).
function groupEntries(filtered) {
  const groups = new Map();
  filtered.forEach((entry) => {
    const heading = entry.heading || "Other";
    const key = activeCategory === "all" ? `${categoryLabel(entry.category)} — ${heading}` : heading;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(entry);
  });

  const keys = [...groups.keys()].sort((a, b) => {
    const ha = a.split(" — ").pop();
    const hb = b.split(" — ").pop();
    const ia = HEADING_ORDER.indexOf(ha);
    const ib = HEADING_ORDER.indexOf(hb);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

  return keys.map((key) => ({ key, entries: groups.get(key) }));
}

function render() {
  const grid = $("#grid");
  const filtered = getFiltered();
  grid.innerHTML = "";

  $("#count").textContent = `${filtered.length} keyword${filtered.length === 1 ? "" : "s"}`;
  $("#empty").hidden = filtered.length !== 0;

  groupEntries(filtered).forEach((group) => {
    const section = document.createElement("section");
    section.className = "group";

    const heading = document.createElement("h2");
    heading.className = "group-heading";
    heading.textContent = group.key;
    section.appendChild(heading);

    const cards = document.createElement("div");
    cards.className = "group-cards";
    group.entries.forEach((entry) => {
      const card = document.createElement("article");
      card.className = "card";
      card.innerHTML = `
        <div class="card-media">${cardMediaHTML(entry)}</div>
        <div class="card-body">
          <div class="card-keyword">${entry.keyword}</div>
          <div class="card-category">${categoryLabel(entry.category)}</div>
        </div>`;
      card.onclick = () => openModal(entry);
      cards.appendChild(card);
    });
    section.appendChild(cards);

    grid.appendChild(section);
  });
}

// ---- Modal ----
function openModal(entry) {
  $("#modal-media").innerHTML = modalMediaHTML(entry);
  $("#modal-category").textContent = categoryLabel(entry.category);
  $("#modal-keyword").textContent = entry.keyword;
  $("#modal-note").textContent = entry.note || "";
  $("#modal-tags").innerHTML = (entry.tags || []).map((t) => `<span>${t}</span>`).join("");

  const copyBtn = $("#modal-copy");
  copyBtn.textContent = "Copy keyword";
  copyBtn.classList.remove("copied");
  copyBtn.onclick = () => {
    navigator.clipboard.writeText(entry.keyword).then(() => {
      copyBtn.textContent = "Copied!";
      copyBtn.classList.add("copied");
    });
  };

  $("#modal").hidden = false;
}

function closeModal() {
  $("#modal").hidden = true;
  $("#modal-media").innerHTML = ""; // stop any playing video / YouTube audio
}

document.addEventListener("click", (e) => {
  if (e.target.hasAttribute("data-close")) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

$("#search").addEventListener("input", (e) => {
  searchTerm = e.target.value;
  render();
});
