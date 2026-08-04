// ---- Keyword Library ----
// All content lives in data.json. This file just renders + filters it.

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "motion", label: "Motion" },
  { id: "ui", label: "UI / Web" },
  { id: "cinematic", label: "Cinematic" },
  { id: "styles", label: "Styles" },
  { id: "notes", label: "Notes" },
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
  "Visual Styles",
  "Aesthetic Styles",
  "Art Movements & Eras",
  "Iconic Artists",
  "Backgrounds",
  "GSAP Animation",
  "Motion Graphics Elements",
  "Text Animation",
  "Animation Concepts",
  "UI Styles & Surfaces",
  "UI Components",
  "UI Motion",
];

// One-line description shown under each section heading, so it's clear what
// kind of thing lives in that section (a look, a thing, a behavior, etc.).
const HEADING_DESCRIPTIONS = {
  "Lighting": "How a scene is lit — the mood and direction of light.",
  "Lens Effects": "Looks created by the camera lens itself (flares, blur, distortion).",
  "Camera Shots & Angles": "Where the camera sits and how tightly it frames the subject.",
  "Camera Movement & Effects": "How the camera itself moves through the scene.",
  "Composition": "How elements are arranged within the frame.",
  "Color & Grading": "The overall color treatment and mood of the image.",
  "Editing Transitions": "How one shot or scene cuts to the next.",
  "Visual Styles": "Surface treatments and textures applied to an image — how it's rendered, not what it depicts.",
  "Aesthetic Styles": "Recognizable overall visual styles or vibes.",
  "Backgrounds": "Patterns and surfaces that sit behind the content.",
  "Art Movements & Eras": "Looks borrowed from art history and past periods.",
  "Iconic Artists": "The signature style of a specific well-known artist.",
  "GSAP Animation": "Building blocks of the GSAP animation library (with live demos).",
  "Motion Graphics Elements": "Concrete things you put on screen — a chart, a lower third, a stat card.",
  "Text Animation": "Ways letters and words move — how text enters, reveals, and transforms on screen.",
  "Animation Concepts": "Behaviors and principles — how things move, not what they are.",
  "UI Motion": "Small interface animations — buttons, menus, page bits reacting.",
  "UI Styles & Surfaces": "The look of UI surfaces and backgrounds — glass, glow, gradients, textures.",
  "UI Components": "Concrete website/app pieces — chat bubbles, dashboards, cards, cursors.",
};

// Plain-text notes shown under the "Notes" tab (not cards — just reference text).
const NOTES = [
  {
    title: "High-End Keywords",
    intro:
      "When prompting models like Claude Code, Cursor, or GPT for implementation, sprinkle in terms like:",
    items: [
      "premium editorial",
      "award-winning portfolio",
      "Awwwards-inspired",
      "GSAP-quality motion",
      "Framer-level interactions",
      "cinematic scroll experience",
      "immersive storytelling",
      "kinetic typography",
      "SVG-first animation",
      "sophisticated motion system",
      "visual rhythm",
      "modular grid",
      "motion choreography",
      "interaction design",
      "premium creative agency aesthetic",
      "Apple-style polish",
      "smooth 120 FPS animations",
      "buttery scrolling",
      "responsive motion design",
      "tasteful microinteractions",
    ],
    outro:
      "These descriptors communicate the feel of the experience without instructing the model to imitate a specific website. They tend to produce designs that share the same polished, motion-driven aesthetic while remaining original.",
  },
  {
    title: "React Bits — Component Links",
    intro:
      "Each component has its own URL following a simple pattern: reactbits.dev/&lt;category&gt;/&lt;component&gt;. Some saved links:",
    items: [
      `<a href="https://reactbits.dev/text-animations/split-text" target="_blank" rel="noopener">reactbits.dev/text-animations/split-text</a>`,
      `<a href="https://reactbits.dev/backgrounds/aurora" target="_blank" rel="noopener">reactbits.dev/backgrounds/aurora</a>`,
      `<a href="https://reactbits.dev/animations/splash-cursor" target="_blank" rel="noopener">reactbits.dev/animations/splash-cursor</a>`,
      `<a href="https://reactbits.dev/components/tilted-card" target="_blank" rel="noopener">reactbits.dev/components/tilted-card</a>`,
    ],
  },
];

let ENTRIES = [];
let activeCategory = "all";
let searchTerm = "";
// True only when the local save server (scripts/serve.js) is answering. Adding
// keywords writes real files, so it can't work on the published static site —
// there the "+" cards simply never appear.
let SAVE_ENABLED = false;

const $ = (sel) => document.querySelector(sel);

// Ask the save server whether it's there. Silence (404 / connection refused) is
// the normal answer on GitHub Pages, so failures are ignored.
fetch("api/status")
  .then((r) => (r.ok ? r.json() : null))
  .then((d) => {
    if (d && d.ok) {
      SAVE_ENABLED = true;
      if (ENTRIES.length) render();
    }
  })
  .catch(() => {});

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

// Fill the "Menu" dropdown panel with whatever sections are currently on
// screen. Hidden when there's nothing (or only one) to jump between.
function buildSectionJump(sections) {
  const panel = $("#menu-panel");
  const wrap = $("#section-jump-wrap");
  if (!panel || !wrap) return;
  if (sections.length < 2) {
    wrap.hidden = true;
    panel.innerHTML = "";
    closeMenu();
    return;
  }
  wrap.hidden = false;
  panel.innerHTML =
    `<div class="menu-panel-count">${sections.length} sections</div>` +
    sections
      .map(
        (s) =>
          `<button type="button" class="menu-panel-item" role="menuitem" data-target="${s.id}">${escapeHTML(
            s.label
          )}</button>`
      )
      .join("");
}

function openMenu() {
  $("#menu-panel").hidden = false;
  $("#menu-btn").classList.add("open");
  $("#menu-btn").setAttribute("aria-expanded", "true");
}
function closeMenu() {
  const panel = $("#menu-panel");
  if (panel) panel.hidden = true;
  const btn = $("#menu-btn");
  if (btn) {
    btn.classList.remove("open");
    btn.setAttribute("aria-expanded", "false");
  }
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

// Escape user text before dropping it into innerHTML.
function escapeHTML(s) {
  return (s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const placeholder = (kw) => `<div class="placeholder">No media yet<br>${kw}</div>`;

const TRASH_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
  stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v6M14 11v6"/></svg>`;

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

// If an entry has a "demo" key and a matching live GSAP demo is registered
// (js/demos.js), run the real animation instead of showing a static picture.
function renderMedia(container, entry, fallbackHTML) {
  const demo = entry.demo && window.KEYWORD_DEMOS && window.KEYWORD_DEMOS[entry.demo];
  if (demo) {
    // A single broken demo must never take down the rest of the grid. If it
    // throws, log it and fall back to the static media/placeholder for that card.
    try {
      demo(container);
    } catch (err) {
      console.error(`Keyword demo "${entry.demo}" failed to run:`, err);
      container.innerHTML = fallbackHTML(entry);
    }
  } else {
    container.innerHTML = fallbackHTML(entry);
  }
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

// The "Notes" tab is plain reference text, not a card grid.
function renderNotes(grid) {
  grid.innerHTML = "";
  $("#count").textContent = "";
  $("#empty").hidden = true;
  const sections = [];
  NOTES.forEach((n, i) => {
    const sec = document.createElement("section");
    sec.className = "notes-block";
    sec.id = `sec-${i}`;
    sections.push({ id: sec.id, label: n.title });
    sec.innerHTML = `
      <h2>${n.title}</h2>
      ${n.intro ? `<p>${n.intro}</p>` : ""}
      ${n.items ? `<ul>${n.items.map((i) => `<li>${i}</li>`).join("")}</ul>` : ""}
      ${n.outro ? `<p>${n.outro}</p>` : ""}`;
    grid.appendChild(sec);
  });
  buildSectionJump(sections);
}

function render() {
  const grid = $("#grid");
  if (activeCategory === "notes") {
    renderNotes(grid);
    return;
  }
  const filtered = getFiltered();
  grid.innerHTML = "";

  $("#count").textContent = `${filtered.length} keyword${filtered.length === 1 ? "" : "s"}`;
  $("#empty").hidden = filtered.length !== 0;

  // Collect the live-demo containers and run them only AFTER the whole grid is
  // attached to the document. Some SVG demos measure stroke length with
  // getTotalLength(), which returns 0 while the element is still detached — so
  // running them too early leaves those cards static (they only "woke up" in the
  // modal, which is already in the DOM). Deferring keeps every card animating.
  const pendingDemos = [];
  const sections = [];

  groupEntries(filtered).forEach((group, i) => {
    const section = document.createElement("section");
    section.className = "group";
    section.id = `sec-${i}`;
    sections.push({ id: section.id, label: group.key });

    const heading = document.createElement("h2");
    heading.className = "group-heading";
    heading.textContent = group.key;
    // For the GSAP Animation section, add a link to the GSAP resources page.
    if (group.key.split(" — ").pop() === "GSAP Animation") {
      const link = document.createElement("a");
      link.className = "group-heading-link";
      link.href = "https://gsap.com/resources/";
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = "GSAP resources ↗";
      heading.appendChild(link);
    }
    section.appendChild(heading);

    // One-line description of what this section is about.
    const desc = HEADING_DESCRIPTIONS[group.key.split(" — ").pop()];
    if (desc) {
      const sub = document.createElement("p");
      sub.className = "group-sub";
      sub.textContent = desc;
      section.appendChild(sub);
    }

    const cards = document.createElement("div");
    cards.className = "group-cards";
    group.entries.forEach((entry) => {
      const card = document.createElement("article");
      card.className = "card";
      card.innerHTML = `
        <div class="card-media"></div>
        <div class="card-body">
          <div class="card-keyword">${entry.keyword}</div>
          <div class="card-category">${categoryLabel(entry.category)}${
            entry.role ? `<span class="card-role">${entry.role}</span>` : ""
          }</div>
        </div>`;
      card.onclick = () => openModal(entry);

      // Bin, revealed on hover. Lives on the card rather than inside
      // .card-media, because live demos overwrite that container's contents.
      if (SAVE_ENABLED) {
        const del = document.createElement("button");
        del.type = "button";
        del.className = "card-delete";
        del.title = `Delete "${entry.keyword}"`;
        del.setAttribute("aria-label", `Delete ${entry.keyword}`);
        del.innerHTML = TRASH_ICON;
        del.onclick = (ev) => {
          ev.stopPropagation(); // don't open the card behind it
          deleteEntry(entry);
        };
        card.appendChild(del);
      }

      cards.appendChild(card);
      pendingDemos.push({ container: card.querySelector(".card-media"), entry });
    });

    // "+" tile at the end of every section, pre-filled with that section so a
    // new keyword lands in the right place.
    if (SAVE_ENABLED) {
      const sectionHeading = group.key.split(" — ").pop();
      const sectionCategory = group.entries[0] ? group.entries[0].category : activeCategory;
      const add = document.createElement("button");
      add.type = "button";
      add.className = "card-add";
      add.innerHTML =
        `<span class="card-add-plus" aria-hidden="true">+</span>` +
        `<span class="card-add-label">Add to ${escapeHTML(sectionHeading)}</span>`;
      add.onclick = () => openAddModal(sectionCategory, sectionHeading);
      cards.appendChild(add);
    }

    section.appendChild(cards);

    grid.appendChild(section);
  });

  buildSectionJump(sections);

  // Grid is now in the DOM — safe to build the live demos.
  pendingDemos.forEach(({ container, entry }) => renderMedia(container, entry, cardMediaHTML));
}

// ---- Add / edit a keyword ----
// One form serves both. It posts to the local save server, which writes any
// media file into images/ and adds or rewrites the entry in data.json. The card
// then updates immediately without a reload.
//
// Entries are addressed by their position in ENTRIES, which mirrors data.json.
// The original keyword rides along so the server can confirm it's rewriting the
// row the page meant.
let formContext = { mode: "add", category: null, heading: null, entry: null, index: -1 };

function openAddModal(category, heading) {
  formContext = { mode: "add", category, heading, entry: null, index: -1 };
  $("#add-form").reset();
  $("#add-title").textContent = "Add a keyword";
  $("#add-submit").textContent = "Save keyword";
  $("#add-section").textContent = `${categoryLabel(category)} · ${heading}`;
  finishOpeningForm();
}

function openEditModal(entry) {
  formContext = {
    mode: "edit",
    category: entry.category,
    heading: entry.heading || "Other",
    entry,
    index: ENTRIES.indexOf(entry),
  };
  $("#add-form").reset();
  $("#add-title").textContent = "Edit keyword";
  $("#add-submit").textContent = "Save changes";
  $("#add-section").textContent = `${categoryLabel(entry.category)} · ${formContext.heading}`;
  $("#add-keyword").value = entry.keyword || "";
  $("#add-youtube").value = entry.youtube || "";
  $("#add-note").value = entry.note || "";
  $("#add-tags").value = (entry.tags || []).join(", ");
  finishOpeningForm();
}

function finishOpeningForm() {
  mediaCleared = false;
  renderAddPreview();
  setAddError("");
  $("#add-modal").hidden = false;
  $("#add-keyword").focus();
}

function closeAddModal() {
  $("#add-modal").hidden = true;
  $("#add-preview").innerHTML = ""; // stop any previewing video
  $("#add-preview").hidden = true;
}

function setAddError(msg) {
  const el = $("#add-error");
  el.textContent = msg;
  el.hidden = !msg;
}

// When editing, this tracks whether the existing picture has been dropped
// without a replacement being chosen.
let mediaCleared = false;

// Show what the card will look like before saving — catches a wrong file or a
// mistyped YouTube link straight away. When editing with nothing new picked, it
// shows the picture the entry already has.
function renderAddPreview() {
  const box = $("#add-preview");
  const note = $("#add-preview-note");
  const file = $("#add-file").files[0];
  const yt = youtubeId($("#add-youtube").value);
  const current = !mediaCleared && formContext.entry ? formContext.entry.media : null;

  let html = "";
  let label = "";

  if (file) {
    const url = URL.createObjectURL(file);
    html = /^video\//.test(file.type)
      ? `<video src="${url}" muted loop autoplay playsinline></video>`
      : `<img src="${url}" alt="">`;
    label = current ? "New picture — replaces the current one on save." : "";
  } else if (yt) {
    html = `<img src="https://img.youtube.com/vi/${yt}/hqdefault.jpg" alt="">`;
  } else if (current) {
    html = /\.(mp4|webm)$/i.test(current)
      ? `<video src="${current}" muted loop autoplay playsinline></video>`
      : `<img src="${current}" alt="">`;
    label = "Current picture — pick a file above to replace it.";
  }

  box.innerHTML = html;
  box.hidden = !html;

  // The remove option only makes sense while an existing picture is still there.
  const canRemove = Boolean(current) && !file;
  $("#add-preview-label").textContent = label;
  $("#add-remove-media").hidden = !canRemove;
  note.hidden = !label && !canRemove;
}

// Strip the "data:…;base64," prefix — the server wants the raw base64 only.
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1]);
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.readAsDataURL(file);
  });
}

async function submitAdd(e) {
  e.preventDefault();
  const editing = formContext.mode === "edit";
  const btn = $("#add-submit");
  const originalLabel = btn.textContent;
  const keyword = $("#add-keyword").value.trim();
  const youtube = $("#add-youtube").value.trim();
  const file = $("#add-file").files[0];

  if (!keyword) return setAddError("Give it a keyword first.");
  if (youtube && !youtubeId(youtube)) return setAddError("That doesn't look like a YouTube link.");
  if (editing && formContext.index < 0) {
    return setAddError("Lost track of that keyword. Refresh the page and try again.");
  }

  setAddError("");
  btn.disabled = true;
  btn.textContent = "Saving…";

  try {
    const payload = {
      keyword,
      category: formContext.category,
      heading: formContext.heading,
      youtube,
      note: $("#add-note").value.trim(),
      tags: $("#add-tags").value.split(",").map((t) => t.trim()).filter(Boolean),
    };
    if (file) payload.file = { name: file.name, data: await fileToBase64(file) };
    if (editing) {
      payload.index = formContext.index;
      payload.originalKeyword = formContext.entry.keyword;
      payload.clearMedia = mediaCleared;
    }

    const res = await fetch(editing ? "api/update" : "api/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const out = await res.json();
    if (!res.ok || !out.ok) throw new Error(out.error || "Save failed.");

    if (editing) ENTRIES[formContext.index] = out.entry;
    else ENTRIES.push(out.entry);

    closeAddModal();
    closeModal(); // the detail view behind an edit is now stale
    render();
  } catch (err) {
    setAddError(err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = originalLabel;
  }
}

// Deleting rewrites data.json and bins the picture, so it asks first and names
// what's going.
async function deleteEntry(entry) {
  const index = ENTRIES.indexOf(entry);
  if (index < 0) return;

  const warning =
    `Delete "${entry.keyword}"?\n\n` +
    `This removes it from data.json` +
    (entry.media ? ` and deletes ${entry.media}` : "") +
    `. It can't be undone from this page.`;
  if (!window.confirm(warning)) return;

  try {
    const res = await fetch("api/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ index, originalKeyword: entry.keyword }),
    });
    const out = await res.json();
    if (!res.ok || !out.ok) throw new Error(out.error || "Delete failed.");

    ENTRIES.splice(index, 1);
    closeModal();
    render();
  } catch (err) {
    window.alert(err.message);
  }
}

$("#add-form").addEventListener("submit", submitAdd);
// A card shows either a file or a YouTube video, never both — so picking one
// clears the other rather than silently letting YouTube win.
$("#add-file").addEventListener("change", () => {
  if ($("#add-file").files[0]) {
    $("#add-youtube").value = "";
    mediaCleared = false;
  }
  renderAddPreview();
});
$("#add-youtube").addEventListener("input", () => {
  if ($("#add-youtube").value.trim() && $("#add-file").files[0]) $("#add-file").value = "";
  renderAddPreview();
});
$("#add-remove-media").addEventListener("click", () => {
  mediaCleared = true;
  $("#add-file").value = "";
  renderAddPreview();
});
document.addEventListener("click", (e) => {
  if (e.target.hasAttribute("data-add-close")) closeAddModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeAddModal();
});

// ---- Modal ----
function openModal(entry) {
  renderMedia($("#modal-media"), entry, modalMediaHTML);
  $("#modal-category").textContent =
    categoryLabel(entry.category) + (entry.role ? ` · ${entry.role}` : "");
  $("#modal-keyword").textContent = entry.keyword;
  // Description area: the note, then (if present) a "Types" list and a
  // "Sample Prompt", each after a line break with a bold label. Built as HTML
  // so labels can be bold; text is escaped so stray < > & can't break markup.
  let noteHTML = escapeHTML(entry.note || "");
  if (entry.types && entry.types.length) {
    noteHTML +=
      `<br><br><strong class="sample-prompt-label">Types</strong><br>` +
      escapeHTML(entry.types.join(", "));
  }
  if (entry.prompt) {
    noteHTML +=
      `<br><br><strong class="sample-prompt-label">Sample Prompt</strong><br>` +
      escapeHTML(entry.prompt);
  }
  $("#modal-note").innerHTML = noteHTML;
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

  // Editing rewrites data.json, so it's only on offer when the save server is up.
  const editBtn = $("#modal-edit");
  editBtn.hidden = !SAVE_ENABLED;
  editBtn.onclick = () => openEditModal(entry);

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

// Menu dropdown: toggle open, jump on item click, close on outside click / Esc.
$("#menu-btn").addEventListener("click", (e) => {
  e.stopPropagation();
  $("#menu-panel").hidden ? openMenu() : closeMenu();
});
$("#menu-panel").addEventListener("click", (e) => {
  const item = e.target.closest(".menu-panel-item");
  if (!item) return;
  const el = document.getElementById(item.dataset.target);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  closeMenu();
});
document.addEventListener("click", (e) => {
  if (!e.target.closest("#section-jump-wrap")) closeMenu();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMenu();
});
