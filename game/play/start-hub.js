(function () {
  const MUTE_KEY = "emciix.game.startBgmMuted";
  const LAST_KEY = "emciix-jukebox-last";

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function formatPts(n) {
    const v = Math.max(0, Math.floor(Number(n) || 0));
    try { return v.toLocaleString("en-US"); } catch (_) { return String(v); }
  }

  async function waitScores(ms) {
    const t0 = Date.now();
    while (Date.now() - t0 < (ms || 8000)) {
      if (window.EmciixScores && window.EmciixScores.loadPublicRanks) return window.EmciixScores;
      await new Promise((r) => setTimeout(r, 200));
    }
    return window.EmciixScores || null;
  }

  async function fillBoard() {
    const list = $("#public-rank-list");
    if (!list) return;
    const api = await waitScores(10000);
    if (!api || !api.loadPublicRanks) {
      list.innerHTML = '<li class="public-rank-empty">Local only</li>';
      return;
    }
    try {
      const rows = await api.loadPublicRanks(12);
      list.innerHTML = "";
      if (!rows || !rows.length) {
        list.innerHTML = '<li class="public-rank-empty">No public scores yet</li>';
        return;
      }
      rows.forEach((row, i) => {
        const li = document.createElement("li");
        li.innerHTML =
          '<span class="rank-pos"></span>' +
          '<span class="rank-player"><span class="rank-name"></span></span>' +
          '<span class="rank-pts"></span>';
        li.querySelector(".rank-pos").textContent = String(i + 1);
        li.querySelector(".rank-name").textContent = row.displayName || "Player";
        li.querySelector(".rank-pts").textContent = formatPts(row.totalScore) + " PTS";
        list.appendChild(li);
      });
    } catch (err) {
      console.warn("public board", err);
      list.innerHTML = '<li class="public-rank-empty">Board unavailable</li>';
    }
  }

  function pauseMenuBgm() {
    const bgm = $("#start-bgm");
    if (bgm) try { bgm.pause(); } catch (_) {}
  }

  function bindJukebox() {
    const box = $("#start-jukebox");
    const audio = $("#start-hub-audio");
    const listEl = $("#jukebox-list");
    const now = $("#jukebox-now");
    const playBtn = $("#jukebox-play");
    const prevBtn = $("#jukebox-prev");
    const nextBtn = $("#jukebox-next");
    if (!box || !audio || !listEl) return;

    let tracks = [];
    let idx = 0;
    let playing = false;

    function label(t) {
      return (t && (t.short || t.title)) || "Track";
    }

    function paint() {
      listEl.querySelectorAll("[data-i]").forEach((btn) => {
        btn.classList.toggle("on", Number(btn.getAttribute("data-i")) === idx);
      });
      if (now) now.textContent = tracks[idx] ? label(tracks[idx]) : "—";
      if (playBtn) playBtn.textContent = playing ? "PAUSE" : "PLAY";
    }

    function load(i, autoplay) {
      if (!tracks.length) return;
      idx = (i + tracks.length) % tracks.length;
      const t = tracks[idx];
      audio.src = t.audio;
      try { audio.load(); } catch (_) {}
      try { localStorage.setItem(LAST_KEY, t.id || String(idx)); } catch (_) {}
      paint();
      if (autoplay) {
        pauseMenuBgm();
        audio.play().then(() => { playing = true; paint(); }).catch(() => { playing = false; paint(); });
      }
    }

    playBtn && playBtn.addEventListener("click", () => {
      if (!tracks.length) return;
      if (playing) {
        audio.pause();
        playing = false;
        paint();
        return;
      }
      if (!audio.src) load(idx, true);
      else {
        pauseMenuBgm();
        audio.play().then(() => { playing = true; paint(); }).catch(() => {});
      }
    });
    prevBtn && prevBtn.addEventListener("click", () => load(idx - 1, true));
    nextBtn && nextBtn.addEventListener("click", () => load(idx + 1, true));
    audio.addEventListener("ended", () => load(idx + 1, true));
    audio.addEventListener("pause", () => { if (audio.currentTime && !audio.ended) { playing = false; paint(); } });
    audio.addEventListener("play", () => { playing = true; paint(); });

    fetch("/game/play/levels.json", { cache: "no-store" })
      .then((r) => r.json())
      .then((levels) => {
        tracks = (levels || []).filter((l) => l && l.audio);
        listEl.innerHTML = "";
        tracks.forEach((t, i) => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.setAttribute("data-i", String(i));
          btn.innerHTML = '<span class="jb-n"></span><span class="jb-t"></span>';
          btn.querySelector(".jb-n").textContent = String(i + 1).padStart(2, "0");
          btn.querySelector(".jb-t").textContent = label(t);
          btn.addEventListener("click", () => load(i, true));
          listEl.appendChild(btn);
        });
        let start = 0;
        try {
          const last = localStorage.getItem(LAST_KEY);
          const found = tracks.findIndex((t) => t.id === last);
          if (found >= 0) start = found;
        } catch (_) {}
        load(start, false);
      })
      .catch(() => {
        if (now) now.textContent = "Catalog unavailable";
      });
  }

  function boot() {
    fillBoard();
    bindJukebox();
    setInterval(fillBoard, 20000);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
