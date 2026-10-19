// ---- Saving to GitHub ----
// The site has no server. Edits are written straight into the repo through
// GitHub's API, each save one commit, and GitHub Pages republishes. Signing in
// means pasting a fine-grained access token limited to this repo; it is kept
// in this browser only.

const GH = (() => {
  const { owner, name, branch } = window.REPO;
  const API = `https://api.github.com/repos/${owner}/${name}`;
  const TOKEN_KEY = "keyword-library-github-token";

  let token = null;
  try {
    token = localStorage.getItem(TOKEN_KEY);
  } catch {}

  // Blob ids of the data files as last loaded or saved. A save is refused if
  // the repo's copy has moved on since, so an old tab can't undo newer edits.
  const known = {};

  async function call(path, { method = "GET", body, raw } = {}) {
    const res = await fetch(path ? `${API}/${path}` : API, {
      method,
      cache: "no-store",
      headers: {
        Accept: raw ? "application/vnd.github.raw" : "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      let msg = `${res.status} ${res.statusText}`;
      try {
        msg = (await res.json()).message || msg;
      } catch {}
      if (res.status === 401) msg = "GitHub didn't accept the token. Sign in again with a new one.";
      const err = new Error(msg);
      err.status = res.status;
      throw err;
    }
    if (res.status === 204) return null;
    return raw ? res.text() : res.json();
  }

  // The commit this page last made. GitHub can report the branch's previous
  // commit for a few seconds after a save, so the next save builds on this
  // instead of asking.
  let last = null;

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  // Current commit on the branch, its root file list, and the images folder.
  async function head() {
    let base = last;
    if (!base) {
      const ref = await call(`git/ref/heads/${branch}`);
      const commit = await call(`git/commits/${ref.object.sha}`);
      base = { commitSha: ref.object.sha, treeSha: commit.tree.sha };
    }
    const tree = await call(`git/trees/${base.treeSha}`);
    const entry = (p) => tree.tree.find((t) => t.path === p);
    return { ...base, entry };
  }

  return {
    signedIn: () => Boolean(token),

    // Checks the token can actually write to this repo before keeping it.
    async signIn(t) {
      token = t.trim();
      try {
        const repo = await call("");
        if (!repo.permissions || !repo.permissions.push) {
          throw new Error("That token can read the repo but not save to it. Give it Contents: Read and write.");
        }
      } catch (err) {
        token = null;
        if (err.status === 404) throw new Error("That token can't see this repo. Make sure it includes keyword-library.");
        throw err;
      }
      try {
        localStorage.setItem(TOKEN_KEY, token);
      } catch {}
    },

    signOut() {
      token = null;
      try {
        localStorage.removeItem(TOKEN_KEY);
      } catch {}
    },

    // Reads JSON files straight from the repo, not the published site, which
    // lags a minute or more behind each save.
    async readJSON(paths) {
      const h = await head();
      const out = {};
      for (const p of paths) {
        const e = h.entry(p);
        if (!e) throw new Error(`${p} is missing from the repo.`);
        out[p] = JSON.parse(await call(`git/blobs/${e.sha}`, { raw: true }));
        known[p] = e.sha;
      }
      return out;
    },

    // File names already in a folder, for picking a name that's free.
    async listFolder(folder) {
      const h = await head();
      const e = h.entry(folder);
      if (!e) return [];
      const tree = await call(`git/trees/${e.sha}`);
      return tree.tree.map((t) => t.path);
    },

    // One commit. `files` maps repo path → text, {base64}, or null to delete.
    async commit(message, files) {
      // Pictures are uploaded once, before any retry.
      const entries = [];
      for (const [path, content] of Object.entries(files)) {
        if (content === null) {
          entries.push({ path, mode: "100644", type: "blob", sha: null });
        } else if (typeof content === "string") {
          entries.push({ path, mode: "100644", type: "blob", content });
        } else {
          const blob = await call("git/blobs", {
            method: "POST",
            body: { content: content.base64, encoding: "base64" },
          });
          entries.push({ path, mode: "100644", type: "blob", sha: blob.sha });
        }
      }

      // If the branch moved under us ("not a fast forward"), look again and
      // retry. The check below still stops this from overwriting someone
      // else's change to the data files.
      for (let attempt = 1; ; attempt++) {
        const h = await head();
        for (const p of Object.keys(known)) {
          const e = h.entry(p);
          if (p in files && e && e.sha !== known[p]) {
            last = null;
            throw new Error(`${p} was changed somewhere else since this page loaded. Refresh the page and redo this edit.`);
          }
        }

        const tree = await call("git/trees", { method: "POST", body: { base_tree: h.treeSha, tree: entries } });
        const commit = await call("git/commits", {
          method: "POST",
          body: { message, tree: tree.sha, parents: [h.commitSha] },
        });
        try {
          await call(`git/refs/heads/${branch}`, { method: "PATCH", body: { sha: commit.sha } });
        } catch (err) {
          last = null;
          if (err.status !== 422 || attempt === 4) throw err;
          await wait(1500 * attempt);
          continue;
        }

        last = { commitSha: commit.sha, treeSha: tree.sha };
        for (const t of tree.tree) if (t.path in known) known[t.path] = t.sha;
        return;
      }
    },
  };
})();
