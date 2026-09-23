(function () {
  const NAME_KEY = "emciix-player-name";

  function $(sel) { return document.querySelector(sel); }

  function readName() {
    try { return String(localStorage.getItem(NAME_KEY) || "").trim(); }
    catch (_) { return ""; }
  }

  function writeName(name) {
    const n = String(name || "").trim().slice(0, 24);
    try { if (n) localStorage.setItem(NAME_KEY, n); } catch (_) {}
    return n;
  }

  function localPoints() {
    try {
      const raw = localStorage.getItem("emciix-rhythm-bests");
      const bests = raw ? JSON.parse(raw) : {};
      return Object.values(bests || {}).reduce((s, b) => s + (Number(b && b.score) || 0), 0);
    } catch (_) { return 0; }
  }

  function mountField(parent, id) {
    if (!parent || document.getElementById(id)) return document.getElementById(id);
    const wrap = document.createElement("div");
    wrap.className = "session-name";
    wrap.innerHTML =
      '<label class="session-name-label" for="' + id + '">PLAYER NAME</label>' +
      '<div class="session-name-row">' +
        '<input id="' + id + '" class="session-name-input" maxlength="24" placeholder="Enter name" autocomplete="nickname" />' +
        '<button type="button" class="session-name-save" data-for="' + id + '">SAVE</button>' +
      '</div>' +
      '<p class="session-name-status" data-st="' + id + '"></p>';
    parent.appendChild(wrap);
    const input = wrap.querySelector("input");
    input.value = readName();
    wrap.querySelector("button").addEventListener("click", () => submit(input, wrap.querySelector("[data-st]")));
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") submit(input, wrap.querySelector("[data-st]"));
    });
    return input;
  }

  async function waitApi(ms) {
    const t0 = Date.now();
    while (Date.now() - t0 < (ms || 8000)) {
      if (window.EmciixScores) return window.EmciixScores;
      await new Promise((r) => setTimeout(r, 150));
    }
    return window.EmciixScores || null;
  }

  async function submit(input, status) {
    const name = writeName(input && input.value);
    if (!name) {
      if (status) status.textContent = "Name required";
      return;
    }
    if (input) input.value = name;
    document.querySelectorAll(".session-name-input").forEach((el) => { el.value = name; });
    if (status) status.textContent = "Saving session…";
    const pts = localPoints();
    const api = await waitApi(8000);
    try {
      if (api && api.publishNamedSession) {
        await api.publishNamedSession(name, pts);
      } else if (api && api.getCurrentUser && api.getCurrentUser() && api.publishPublicRank) {
        await api.publishPublicRank(api.getCurrentUser(), name, pts, null);
        if (api.updateDisplayName) await api.updateDisplayName(name);
      }
      if (status) status.textContent = "Uploaded · " + name + " · " + pts + " PTS";
      if (window.EmciixScores && window.EmciixScores.loadPublicRanks) {
        const ev = new Event("emciix-ranks-refresh");
        window.dispatchEvent(ev);
      }
    } catch (err) {
      console.warn("session name upload", err);
      if (status) status.textContent = "Saved on this device · sign-in needed for public board";
    }
  }

  function mountAll() {
    const startCard = document.querySelector("#start-overlay .start-main");
    if (startCard) {
      const actions = startCard.querySelector(".start-actions");
      mountField(actions ? actions.parentNode : startCard, "session-name-start");
    }
    const resultsCard = document.querySelector("#results-overlay .overlay-card");
    if (resultsCard) mountField(resultsCard, "session-name-results");
  }

  function watchResults() {
    const overlay = $("#results-overlay");
    if (!overlay || !window.MutationObserver) return;
    const obs = new MutationObserver(() => {
      if (overlay.classList.contains("hidden")) return;
      const input = $("#session-name-results");
      if (input && !input.value) input.value = readName();
    });
    obs.observe(overlay, { attributes: true, attributeFilter: ["class"] });
  }

  window.addEventListener("emciix-ranks-refresh", () => {
    if (typeof window.fillBoard === "function") return;
  });

  function boot() {
    mountAll();
    watchResults();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
