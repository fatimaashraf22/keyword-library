// ---- Keyword Library ----
// Cards live in data.json; tabs, sections, notes and the site title live in
// site.json. This file renders them, filters them, and (when signed in with a
// GitHub token, see js/github.js) edits them.
//
// A card belongs to the section whose tab id matches its "category" and whose
// title matches its "heading".

let SITE = { title: "", tagline: "", tabs: [] };
let ENTRIES = [];
let activeCategory = "all";
let searchTerm = "";
// True once signed in and the data has loaded from the repo.
let EDITING = false;
// Pictures uploaded this session, shown from memory until GitHub Pages has
// published them.
const localMedia = {};

const $ = (sel) => document.querySelector(sel);

load();

async function load() {
  try {
    if (GH.signedIn()) {
      try {
        const files = await GH.readJSON(["data.json", "site.json"]);
        ENTRIES = files["data.json"];
        SITE = files["site.json"];
        EDITING = true;
      } catch (err) {
        if (err.status === 401) GH.signOut();
        else window.alert(`Couldn't load from GitHub, showing the published copy instead.\n\n${err.message}`);
      }
    }
    if (!EDITING) {
      const [data, site] = await Promise.all(["data.json", "site.json"].map((f) => fetch(f).then((r) => r.json())));
      ENTRIES = data;
      SITE = site;
    }
    adoptStrays();
    renderAll();
  } catch (err) {
    $("#grid").innerHTML =
      '<p class="empty">Could not load the library. If opening the file directly, run a local server (see README).</p>';
    console.error(err);
  }
}

// Cards whose tab or section isn't in site.json (added by hand) still need a
// home, so they get one at the end. It's written to site.json on the next save.
function adoptStrays() {
  ENTRIES.forEach((e) => {
    let tab = SITE.tabs.find((t) => t.id === e.category);
    if (!tab) {
      tab = { id: e.category, label: e.category, sections: [] };
      SITE.tabs.push(tab);
    }
    const heading = e.heading || "Other";
    if (!tab.sections.some((s) => s.title === heading)) tab.sections.push({ title: heading, description: "" });
  });
}

// ---- Small helpers ----

// Hidden things vanish for visitors; while signed in they stay in place, greyed.
const isShown = (item) => !item.hidden || EDITING;
const findTab = (id) => SITE.tabs.find((t) => t.id === id);
const tabLabel = (id) => (findTab(id) || { label: id }).label;
const inSection = (tab, sec) => (e) => e.category === tab.id && (e.heading || "Other") === sec.title;

function slugify(str) {
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
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
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function linkify(text) {
  return escapeHTML(text).replace(
    /https?:\/\/[^\s<]+/g,
    (u) => `<a href="${u}" target="_blank" rel="noopener">${u}</a>`
  );
}

// Plain text → HTML. Blank lines start a new paragraph, lines starting "- "
// become a bullet list, and web addresses become links.
function richText(text) {
  const out = [];
  let para = [];
  let list = [];
  const flushPara = () => para.length && out.push(`<p>${para.join("<br>")}</p>`) && (para = []);
  const flushList = () => list.length && out.push(`<ul>${list.join("")}</ul>`) && (list = []);
  String(text || "")
    .split(/\r?\n/)
    .forEach((line) => {
      const bullet = line.match(/^\s*[-•]\s+(.*)$/);
      if (bullet) {
        flushPara();
        list.push(`<li>${linkify(bullet[1])}</li>`);
      } else if (!line.trim()) {
        flushPara();
        flushList();
      } else {
        flushList();
        para.push(linkify(line));
      }
    });
  flushPara();
  flushList();
  return out.join("");
}

const mediaSrc = (path) => localMedia[path] || path;

const placeholder = (kw) => `<div class="placeholder">No media yet<br>${escapeHTML(kw)}</div>`;
const onErrorPlaceholder = (kw) =>
  `onerror="this.parentNode.innerHTML='${placeholder(kw).replace(/'/g, "\\'").replace(/"/g, "&quot;")}'"`;

const ICONS = {
  trash: `<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v6M14 11v6"/>`,
  edit: `<path d="M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4"/>`,
  eye: `<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>`,
  eyeOff: `<path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.1M6.6 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7c1.9 0 3.6-.6 5-1.4M9.9 9.9a3 3 0 0 0 4.2 4.2"/>`,
};

function iconButton(icon, label, onClick, extraClass = "") {
  const b = document.createElement("button");
  b.type = "button";
  b.className = `tool-btn ${extraClass}`.trim();
  b.title = label;
  b.setAttribute("aria-label", label);
  b.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[icon]}</svg>`;
  b.onclick = (ev) => {
    ev.stopPropagation(); // don't open the card behind it
    onClick();
  };
  return b;
}

// Edit / hide / delete, as used on cards and section headings.
function toolButtons(name, item, { onEdit, onToggleHidden, onDelete }) {
  const wrap = document.createElement("span");
  wrap.className = "tools";
  wrap.append(
    iconButton("edit", `Edit ${name}`, onEdit),
    iconButton(item.hidden ? "eye" : "eyeOff", item.hidden ? `Unhide ${name}` : `Hide ${name}`, onToggleHidden),
    iconButton("trash", `Delete ${name}`, onDelete, "tool-danger")
  );
  return wrap;
}

// ---- Rendering ----

function renderAll() {
  const active = findTab(activeCategory);
  if (activeCategory !== "all" && (!active || !isShown(active))) activeCategory = "all";
  document.title = `${SITE.title || "Keyword Library"} — Visual Reference`;
  $("#site-title").textContent = SITE.title || "Keyword Library";
  $("#site-tagline").textContent = SITE.tagline || "";
  $("#sign-in-btn").hidden = EDITING;
  buildFilters();
  buildAdminBar();
  render();
}

function buildFilters() {
  const el = $("#filters");
  el.innerHTML = "";
  const tabs = [{ id: "all", label: "All" }, ...SITE.tabs.filter(isShown)];
  tabs.forEach((tab) => {
    const btn = document.createElement("button");
    btn.className =
      "filter-btn" + (tab.id === activeCategory ? " active" : "") + (tab.hidden ? " is-hidden" : "");
    btn.textContent = tab.label;
    btn.onclick = () => {
      activeCategory = tab.id;
      buildFilters();
      buildAdminBar();
      render();
    };
    el.appendChild(btn);
  });
  if (EDITING) {
    const add = document.createElement("button");
    add.className = "filter-btn filter-add";
    add.textContent = "+ Tab";
    add.onclick = openTabForm;
    el.appendChild(add);
  }
}

function buildAdminBar() {
  const bar = $("#admin-bar");
  bar.hidden = !EDITING;
  if (!EDITING) return;
  bar.innerHTML = "";

  const n = pendingCount();
  const status = document.createElement("span");
  status.className = "admin-status";
  status.id = "admin-status";
  status.textContent = n
    ? `${n} unpublished change${n === 1 ? "" : "s"}. Visitors see ${n === 1 ? "it" : "them"} after you publish.`
    : "Editing. Changes wait here until you publish.";

  const publishBtn = document.createElement("button");
  publishBtn.type = "button";
  publishBtn.className = "copy-btn";
  publishBtn.id = "publish-btn";
  publishBtn.textContent = n ? `Publish ${n} change${n === 1 ? "" : "s"}` : "Publish";
  publishBtn.disabled = !n;
  publishBtn.onclick = publish;

  const actions = document.createElement("span");
  actions.className = "admin-actions";
  const link = (label, fn) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "link-btn";
    b.textContent = label;
    b.onclick = fn;
    actions.appendChild(b);
  };
  const tab = findTab(activeCategory);
  if (tab) {
    link(`Rename tab`, () => openTabForm(tab));
    link(tab.hidden ? "Unhide tab" : "Hide tab", () =>
      stageOrAlert(`${tab.hidden ? "Unhide" : "Hide"} tab "${tab.label}"`, { site: true }, () => {
        if (tab.hidden) delete tab.hidden;
        else tab.hidden = true;
      })
    );
    link("Delete tab", () => deleteTab(tab));
  }
  link("Edit title & tagline", openSiteForm);
  if (n) {
    link("Discard changes", () => {
      if (window.confirm(`Throw away ${n} unpublished change${n === 1 ? "" : "s"}?`)) discardAndReload();
    });
  }
  link("Sign out", () => {
    if (n && !window.confirm(`Sign out and lose ${n} unpublished change${n === 1 ? "" : "s"}?`)) return;
    GH.signOut();
    discardAndReload();
  });

  bar.append(status, publishBtn, actions);
}

function setStatus(msg) {
  const el = $("#admin-status");
  if (el) el.textContent = msg;
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

// Card view: lightweight. Local video/svg/gif auto-loop to show the motion at a
// glance; YouTube shows its thumbnail with a play badge (player opens in modal).
function cardMediaHTML(entry) {
  const yt = youtubeId(entry.youtube);
  if (yt) {
    return `<img src="https://img.youtube.com/vi/${yt}/hqdefault.jpg" alt="${escapeHTML(entry.keyword)}" loading="lazy"
      ${onErrorPlaceholder(entry.keyword)}>
      <span class="play-badge">▶</span>`;
  }
  if (entry.media) {
    const src = escapeHTML(mediaSrc(entry.media));
    const e = ext(entry.media);
    if (e === "mp4" || e === "webm") {
      return `<video src="${src}" muted loop autoplay playsinline ${onErrorPlaceholder(entry.keyword)}></video>`;
    }
    // images, gif, webp, and animated svg all render fine via <img>
    return `<img src="${src}" alt="${escapeHTML(entry.keyword)}" loading="lazy" ${onErrorPlaceholder(entry.keyword)}>`;
  }
  return placeholder(entry.keyword);
}

// Modal view: full playback — YouTube becomes an embedded player with sound.
function modalMediaHTML(entry) {
  const yt = youtubeId(entry.youtube);
  if (yt) {
    return `<iframe src="https://www.youtube.com/embed/${yt}" title="${escapeHTML(entry.keyword)}"
      frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen></iframe>`;
  }
  if (entry.media) {
    const src = escapeHTML(mediaSrc(entry.media));
    const e = ext(entry.media);
    if (e === "mp4" || e === "webm") {
      return `<video src="${src}" controls muted loop autoplay playsinline></video>`;
    }
    return `<img src="${src}" alt="${escapeHTML(entry.keyword)}">`;
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

function matchesSearch(e) {
  const term = searchTerm.trim().toLowerCase();
  if (!term) return true;
  const haystack = (e.keyword + " " + (e.tags || []).join(" ") + " " + (e.note || "")).toLowerCase();
  return haystack.includes(term);
}

// Sections to draw, in site.json order. "All" shows every section that has
// cards, labelled "Tab — Section"; a single tab also shows its text-only
// sections (notes). While searching, sections without a match drop out.
function getGroups() {
  const groups = [];
  const tabs = activeCategory === "all" ? SITE.tabs.filter(isShown) : [findTab(activeCategory)];
  tabs.forEach((tab) => {
    tab.sections.filter(isShown).forEach((sec) => {
      const all = ENTRIES.filter(inSection(tab, sec)).filter(isShown);
      const entries = all.filter(matchesSearch);
      if (!entries.length && (activeCategory === "all" || searchTerm.trim())) return;
      groups.push({
        tab,
        sec,
        entries,
        label: activeCategory === "all" ? `${tab.label} — ${sec.title}` : sec.title,
      });
    });
  });
  return groups;
}

function render() {
  const grid = $("#grid");
  const groups = getGroups();
  const total = groups.reduce((n, g) => n + g.entries.length, 0);
  grid.innerHTML = "";

  $("#count").textContent = total ? `${total} keyword${total === 1 ? "" : "s"}` : "";
  $("#empty").hidden = groups.length !== 0;

  // Collect the live-demo containers and run them only AFTER the whole grid is
  // attached to the document. Some SVG demos measure stroke length with
  // getTotalLength(), which returns 0 while the element is still detached — so
  // running them too early leaves those cards static (they only "woke up" in the
  // modal, which is already in the DOM). Deferring keeps every card animating.
  const pendingDemos = [];
  const sections = [];

  groups.forEach((group, i) => {
    const { tab, sec, entries } = group;
    const section = document.createElement("section");
    section.id = `sec-${i}`;
    sections.push({ id: section.id, label: group.label });

    // A section with no cards is a block of reference text (the Notes tab).
    const isText = !entries.length && !ENTRIES.some(inSection(tab, sec));
    section.className = (isText ? "notes-block" : "group") + (sec.hidden ? " is-hidden" : "");

    const heading = document.createElement("h2");
    heading.className = isText ? "notes-heading" : "group-heading";
    heading.textContent = group.label;
    if (sec.linkUrl) {
      const link = document.createElement("a");
      link.className = "group-heading-link";
      link.href = sec.linkUrl;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = sec.linkLabel || "Link ↗";
      heading.appendChild(link);
    }
    if (EDITING) {
      heading.appendChild(
        toolButtons(`section ${sec.title}`, sec, {
          onEdit: () => openSectionForm(tab, sec),
          onToggleHidden: () =>
            stageOrAlert(`${sec.hidden ? "Unhide" : "Hide"} section "${sec.title}"`, { site: true }, () => {
              if (sec.hidden) delete sec.hidden;
              else sec.hidden = true;
            }),
          onDelete: () => deleteSection(tab, sec),
        })
      );
    }
    section.appendChild(heading);

    if (sec.description) {
      const desc = document.createElement("div");
      desc.className = isText ? "notes-text" : "group-sub";
      desc.innerHTML = richText(sec.description);
      section.appendChild(desc);
    }

    const cards = document.createElement("div");
    cards.className = "group-cards";
    entries.forEach((entry) => {
      const card = document.createElement("article");
      card.className = "card" + (entry.hidden ? " is-hidden" : "");
      card.innerHTML = `
        <div class="card-media"></div>
        <div class="card-body">
          <div class="card-keyword">${escapeHTML(entry.keyword)}</div>
          <div class="card-category">${escapeHTML(tabLabel(entry.category))}${
            entry.role ? `<span class="card-role">${escapeHTML(entry.role)}</span>` : ""
          }</div>
        </div>`;
      card.onclick = () => openModal(entry);

      // Tools live on the card rather than inside .card-media, because live
      // demos overwrite that container's contents.
      if (EDITING) {
        const tools = toolButtons(entry.keyword, entry, {
          onEdit: () => openEditModal(entry),
          onToggleHidden: () =>
            stageOrAlert(`${entry.hidden ? "Unhide" : "Hide"} "${entry.keyword}"`, { data: true }, () => {
              if (entry.hidden) delete entry.hidden;
              else entry.hidden = true;
            }),
          onDelete: () => deleteEntry(entry),
        });
        tools.classList.add("card-tools");
        card.appendChild(tools);
      }

      cards.appendChild(card);
      pendingDemos.push({ container: card.querySelector(".card-media"), entry });
    });

    // "+" tile at the end of every section, pre-filled with that section so a
    // new keyword lands in the right place.
    if (EDITING) {
      const add = document.createElement("button");
      add.type = "button";
      add.className = "card-add";
      add.innerHTML =
        `<span class="card-add-plus" aria-hidden="true">+</span>` +
        `<span class="card-add-label">Add to ${escapeHTML(sec.title)}</span>`;
      add.onclick = () => openAddModal(tab, sec);
      cards.appendChild(add);
    }

    if (cards.children.length) section.appendChild(cards);
    grid.appendChild(section);
  });

  if (EDITING && activeCategory !== "all" && !searchTerm.trim()) {
    const addSec = document.createElement("button");
    addSec.type = "button";
    addSec.className = "section-add";
    addSec.textContent = "+ Add section";
    addSec.onclick = () => openSectionForm(findTab(activeCategory), null);
    grid.appendChild(addSec);
  }

  buildSectionJump(sections);

  // Grid is now in the DOM — safe to build the live demos.
  pendingDemos.forEach(({ container, entry }) => renderMedia(container, entry, cardMediaHTML));
}

// ---- Saving ----
// Edits change the page straight away and queue up here. "Publish" sends the
// whole queue to GitHub as one commit, so a session of edits is one snapshot.
const pending = { messages: [], data: false, site: false, files: {} };
const pendingCount = () => pending.messages.length;

// Picture files on GitHub, fetched once and kept in step with each publish.
let repoImages = null;
async function imagesInRepo() {
  if (!repoImages) repoImages = new Set((await GH.listFolder("images")).map((n) => `images/${n}`));
  return repoImages;
}

// `files` may be a promise, so looking up which pictures to delete fails
// through the same error path as the edit itself.
async function stage(message, { data = false, site = false, files = {} }, mutate) {
  files = await files;
  mutate();
  pending.messages.push(message);
  pending.data = pending.data || data;
  pending.site = pending.site || site;
  for (const [path, content] of Object.entries(files)) {
    // A picture added and removed again before publishing never reaches GitHub.
    if (content === null && !repoImages.has(path)) delete pending.files[path];
    else pending.files[path] = content;
  }
  renderAll();
}

// stage() for buttons with no form to show the error in.
function stageOrAlert(...args) {
  return stage(...args).catch((err) => window.alert(`Couldn't make that change.\n\n${err.message}`));
}

async function publish() {
  const n = pendingCount();
  if (!n) return;
  const files = { ...pending.files };
  if (pending.data) files["data.json"] = JSON.stringify(ENTRIES, null, 2) + "\n";
  if (pending.site) files["site.json"] = JSON.stringify(SITE, null, 2) + "\n";
  const message =
    n === 1 ? pending.messages[0] : `${n} changes\n\n` + pending.messages.map((m) => `- ${m}`).join("\n");

  $("#publish-btn").disabled = true;
  setStatus("Publishing…");
  try {
    await GH.commit(message, files);
    for (const [path, content] of Object.entries(pending.files)) {
      if (content === null) repoImages.delete(path);
      else repoImages.add(path);
    }
    Object.assign(pending, { messages: [], data: false, site: false, files: {} });
    buildAdminBar();
    setStatus(`Published ${n} change${n === 1 ? "" : "s"}. Visitors see ${n === 1 ? "it" : "them"} in about a minute.`);
  } catch (err) {
    buildAdminBar();
    setStatus(`Not published: ${err.message}`);
  }
}

// Leaving the page would lose anything not yet published.
let leaving = false;
window.addEventListener("beforeunload", (e) => {
  if (pendingCount() && !leaving) {
    e.preventDefault();
    e.returnValue = "";
  }
});

function discardAndReload() {
  leaving = true;
  location.reload();
}

// Media files of the given cards that exist on GitHub or are waiting to be
// published (some demo cards name a picture that was never added).
async function mediaToDelete(entries) {
  const paths = entries.map((e) => e.media).filter((m) => m && m.startsWith("images/"));
  if (!paths.length) return {};
  const present = await imagesInRepo();
  return Object.fromEntries(
    paths.filter((p) => present.has(p) || pending.files[p]).map((p) => [p, null])
  );
}

// ---- Generic form (tabs, sections, site text, sign-in) ----

let formSubmit = null;

function openForm({ badge = "", title, submit = "Save", fields, onSubmit }) {
  $("#form-badge").textContent = badge;
  $("#form-badge").hidden = !badge;
  $("#form-title").textContent = title;
  $("#form-submit").textContent = submit;
  const box = $("#form-fields");
  box.innerHTML = "";
  fields.forEach((f) => {
    const row = document.createElement("div");
    row.className = "form-row";
    const input = document.createElement(f.type === "textarea" ? "textarea" : "input");
    input.className = "form-input";
    input.id = `field-${f.id}`;
    input.autocomplete = "off";
    if (f.type === "textarea") input.rows = f.rows || 4;
    else input.type = f.type || "text";
    if (f.placeholder) input.placeholder = f.placeholder;
    if (f.required) input.required = true;
    input.value = f.value || "";
    row.innerHTML = `<label class="form-label" for="${input.id}">${escapeHTML(f.label)}</label>`;
    row.appendChild(input);
    if (f.help) row.insertAdjacentHTML("beforeend", `<p class="form-help">${f.help}</p>`);
    box.appendChild(row);
  });
  setFormError("");
  formSubmit = async () => {
    const values = {};
    fields.forEach((f) => (values[f.id] = $(`#field-${f.id}`).value.trim()));
    await onSubmit(values);
  };
  $("#form-modal").hidden = false;
  const first = box.querySelector("input, textarea");
  if (first) first.focus();
}

function closeForm() {
  $("#form-modal").hidden = true;
}

function setFormError(msg) {
  $("#form-error").textContent = msg;
  $("#form-error").hidden = !msg;
}

$("#form-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = $("#form-submit");
  const label = btn.textContent;
  btn.disabled = true;
  btn.textContent = "Saving…";
  setFormError("");
  try {
    await formSubmit();
    closeForm();
  } catch (err) {
    setFormError(err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = label;
  }
});
document.addEventListener("click", (e) => {
  if (e.target.hasAttribute("data-form-close")) closeForm();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeForm();
});

// ---- Sign in ----

$("#sign-in-btn").addEventListener("click", () =>
  openForm({
    title: "Sign in to edit",
    submit: "Sign in",
    fields: [
      {
        id: "token",
        label: "GitHub token",
        type: "password",
        required: true,
        help:
          `Make one at <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener">GitHub → Fine-grained tokens</a>: ` +
          `only the <code>${escapeHTML(window.REPO.name)}</code> repo, with Contents set to Read and write. ` +
          `It stays in this browser.`,
      },
    ],
    onSubmit: async ({ token }) => {
      await GH.signIn(token);
      location.reload();
    },
  })
);

// ---- Tabs ----

function openTabForm(tab) {
  const editing = Boolean(tab && tab.id);
  openForm({
    title: editing ? "Rename tab" : "Add a tab",
    fields: [{ id: "label", label: "Tab name", value: editing ? tab.label : "", required: true }],
    onSubmit: async ({ label }) => {
      if (!label) throw new Error("Give the tab a name.");
      if (editing) {
        await stage(`Rename tab "${tab.label}" to "${label}"`, { site: true }, () => (tab.label = label));
        return;
      }
      // The id is what cards store as their "category", so it never changes
      // after the tab is made, even if the tab is renamed.
      const base = slugify(label) || "tab";
      let id = base;
      for (let n = 2; id === "all" || findTab(id); n++) id = `${base}-${n}`;
      await stage(`Add tab "${label}"`, { site: true }, () => {
        SITE.tabs.push({ id, label, sections: [] });
        activeCategory = id;
      });
    },
  });
}

async function deleteTab(tab) {
  const cards = ENTRIES.filter((e) => e.category === tab.id);
  const warning =
    `Delete the "${tab.label}" tab?\n\n` +
    `This removes its ${tab.sections.length} section${tab.sections.length === 1 ? "" : "s"}` +
    (cards.length ? ` and ${cards.length} card${cards.length === 1 ? "" : "s"} with their pictures` : "") +
    `. It can't be undone from this page.`;
  if (!window.confirm(warning)) return;
  await stageOrAlert(`Delete tab "${tab.label}"`, { data: true, site: true, files: mediaToDelete(cards) }, () => {
    ENTRIES = ENTRIES.filter((e) => e.category !== tab.id);
    SITE.tabs = SITE.tabs.filter((t) => t !== tab);
    activeCategory = "all";
  });
}

// ---- Sections ----

function openSectionForm(tab, sec) {
  openForm({
    badge: tab.label,
    title: sec ? "Edit section" : "Add a section",
    fields: [
      { id: "title", label: "Section title", value: sec ? sec.title : "", required: true },
      {
        id: "description",
        label: "Description",
        type: "textarea",
        rows: 6,
        value: sec ? sec.description : "",
        help:
          "Shown under the title. A section with no cards shows as a block of notes. " +
          "Leave a blank line for a new paragraph, start a line with “- ” for a bullet point, and web addresses become links.",
      },
      { id: "linkUrl", label: "Link (optional)", value: sec ? sec.linkUrl : "", placeholder: "https://…" },
      { id: "linkLabel", label: "Link text", value: sec ? sec.linkLabel : "", placeholder: "Resources ↗" },
    ],
    onSubmit: async ({ title, description, linkUrl, linkLabel }) => {
      if (!title) throw new Error("Give the section a title.");
      // Cards find their section by title, so titles must be unique in a tab.
      if (tab.sections.some((s) => s !== sec && s.title === title)) {
        throw new Error(`"${tab.label}" already has a section called "${title}".`);
      }
      const apply = (s) => {
        s.title = title;
        s.description = description;
        if (linkUrl) {
          s.linkUrl = linkUrl;
          s.linkLabel = linkLabel;
        } else {
          delete s.linkUrl;
          delete s.linkLabel;
        }
      };
      if (!sec) {
        await stage(`Add section "${title}" to ${tab.label}`, { site: true }, () => {
          const s = {};
          apply(s);
          tab.sections.push(s);
        });
        return;
      }
      const renamed = sec.title !== title;
      await stage(`Edit section "${sec.title}"`, { site: true, data: renamed }, () => {
        if (renamed) {
          ENTRIES.filter(inSection(tab, sec)).forEach((e) => (e.heading = title));
        }
        apply(sec);
      });
    },
  });
}

async function deleteSection(tab, sec) {
  const cards = ENTRIES.filter(inSection(tab, sec));
  const warning =
    `Delete the "${sec.title}" section?\n\n` +
    (cards.length
      ? `Its ${cards.length} card${cards.length === 1 ? "" : "s"} and their pictures go too. `
      : "") +
    `It can't be undone from this page.`;
  if (!window.confirm(warning)) return;
  await stageOrAlert(
    `Delete section "${sec.title}"`,
    { data: cards.length > 0, site: true, files: mediaToDelete(cards) },
    () => {
      ENTRIES = ENTRIES.filter((e) => !cards.includes(e));
      tab.sections = tab.sections.filter((s) => s !== sec);
    }
  );
}

// ---- Site title ----

function openSiteForm() {
  openForm({
    title: "Title & tagline",
    fields: [
      { id: "title", label: "Title", value: SITE.title, required: true },
      { id: "tagline", label: "Tagline", value: SITE.tagline },
    ],
    onSubmit: ({ title, tagline }) =>
      stage("Edit title and tagline", { site: true }, () => {
        SITE.title = title;
        SITE.tagline = tagline;
      }),
  });
}

// ---- Add / edit a keyword ----
// One form serves both. A new picture is committed into images/ alongside the
// data.json change, in the same commit.
let formContext = { mode: "add", tab: null, sec: null, entry: null };

function openAddModal(tab, sec) {
  formContext = { mode: "add", tab, sec, entry: null };
  $("#add-form").reset();
  $("#add-title").textContent = "Add a keyword";
  $("#add-submit").textContent = "Save keyword";
  $("#add-section").textContent = `${tab.label} · ${sec.title}`;
  finishOpeningForm();
}

function openEditModal(entry) {
  const tab = findTab(entry.category);
  const sec = tab.sections.find((s) => s.title === (entry.heading || "Other"));
  formContext = { mode: "edit", tab, sec, entry };
  $("#add-form").reset();
  $("#add-title").textContent = "Edit keyword";
  $("#add-submit").textContent = "Save changes";
  $("#add-section").textContent = `${tab.label} · ${sec.title}`;
  $("#add-keyword").value = entry.keyword || "";
  $("#add-youtube").value = entry.youtube || "";
  $("#add-note").value = entry.note || "";
  $("#add-prompt").value = entry.prompt || "";
  $("#add-role").value = entry.role || "";
  $("#add-types").value = (entry.types || []).join(", ");
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
    const src = escapeHTML(mediaSrc(current));
    html = /\.(mp4|webm)$/i.test(current)
      ? `<video src="${src}" muted loop autoplay playsinline></video>`
      : `<img src="${src}" alt="">`;
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

// Strip the "data:…;base64," prefix — GitHub wants the raw base64 only.
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1]);
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.readAsDataURL(file);
  });
}

const MEDIA_EXTS = ["jpg", "jpeg", "png", "gif", "webp", "svg", "mp4", "webm"];
// GitHub refuses single files over 100 MB.
const MAX_BYTES = 100 * 1024 * 1024;

const commaList = (s) => s.split(",").map((t) => t.trim()).filter(Boolean);

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
  if (file && !MEDIA_EXTS.includes(ext(file.name))) {
    return setAddError("That file type isn't supported. Use JPG, PNG, GIF, WEBP, SVG, MP4 or WEBM.");
  }
  if (file && file.size > MAX_BYTES) return setAddError("That file is over 100 MB, which GitHub won't take.");

  setAddError("");
  btn.disabled = true;
  btn.textContent = "Saving…";

  try {
    const { tab, sec, entry: old } = formContext;
    // Keys the form doesn't show (demo, hidden, …) carry through untouched.
    const entry = editing ? { ...old } : {};
    entry.keyword = keyword;
    entry.category = tab.id;
    entry.heading = sec.title;
    const text = {
      note: $("#add-note").value.trim(),
      prompt: $("#add-prompt").value.trim(),
      role: $("#add-role").value.trim(),
      youtube,
      types: commaList($("#add-types").value),
      tags: commaList($("#add-tags").value),
    };
    for (const [k, v] of Object.entries(text)) {
      if (v.length) entry[k] = v;
      else delete entry[k];
    }

    const files = {};
    const oldMedia = old && old.media;
    // A card shows one thing: a new file, a YouTube video, or neither.
    const dropOld = oldMedia && (file || youtube || mediaCleared);
    if (dropOld) Object.assign(files, await mediaToDelete([old]));
    if (dropOld) delete entry.media;

    if (file) {
      // Named after the keyword, never overwriting another card's file. A
      // replaced picture is deleted in the same publish, so its name is free.
      const taken = new Set(await imagesInRepo());
      for (const [p, c] of Object.entries(pending.files)) c === null ? taken.delete(p) : taken.add(p);
      if (oldMedia) taken.delete(oldMedia);
      const base = slugify(keyword) || "media";
      const fileExt = ext(file.name);
      let name = `images/${base}.${fileExt}`;
      for (let n = 2; taken.has(name); n++) name = `images/${base}-${n}.${fileExt}`;
      files[name] = { base64: await fileToBase64(file) };
      localMedia[name] = URL.createObjectURL(file);
      entry.media = name;
    }

    await stage(editing ? `Edit "${keyword}"` : `Add "${keyword}" to ${sec.title}`, { data: true, files }, () => {
      if (editing) ENTRIES[ENTRIES.indexOf(old)] = entry;
      else ENTRIES.push(entry);
    });

    closeAddModal();
    closeModal(); // the detail view behind an edit is now stale
  } catch (err) {
    setAddError(err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = originalLabel;
  }
}

// Deleting removes the entry and bins its picture, so it asks first and names
// what's going.
async function deleteEntry(entry) {
  const warning =
    `Delete "${entry.keyword}"?\n\n` +
    `This removes the card` +
    (entry.media ? ` and deletes ${entry.media}` : "") +
    `. It can't be undone from this page.`;
  if (!window.confirm(warning)) return;
  await stageOrAlert(`Delete "${entry.keyword}"`, { data: true, files: mediaToDelete([entry]) }, () => {
    ENTRIES = ENTRIES.filter((e) => e !== entry);
    closeModal();
  });
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
  $("#modal-category").textContent = tabLabel(entry.category) + (entry.role ? ` · ${entry.role}` : "");
  $("#modal-keyword").textContent = entry.keyword;
  // Description area: the note, then (if present) a "Types" list and a
  // "Sample Prompt", each after a line break with a bold label. Built as HTML
  // so labels can be bold; text is escaped so stray < > & can't break markup.
  let noteHTML = linkify(entry.note || "").replace(/\n/g, "<br>");
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
  $("#modal-tags").innerHTML = (entry.tags || []).map((t) => `<span>${escapeHTML(t)}</span>`).join("");

  const copyBtn = $("#modal-copy");
  copyBtn.textContent = "Copy keyword";
  copyBtn.classList.remove("copied");
  copyBtn.onclick = () => {
    navigator.clipboard.writeText(entry.keyword).then(() => {
      copyBtn.textContent = "Copied!";
      copyBtn.classList.add("copied");
    });
  };

  const editBtn = $("#modal-edit");
  editBtn.hidden = !EDITING;
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
