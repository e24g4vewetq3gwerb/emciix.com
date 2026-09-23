/* Level 22 — VACANT musical chairs. Not the note highway. */
(function () {
  const SEATS = 5;
  const LIVES = 3;

  function $(id) {
    return document.getElementById(id);
  }

  function isVacant() {
    const app = $("app");
    return !!(app && (app.dataset.theme === "vacant" || app.dataset.theme === "room"));
  }

  function hintEl() {
    return document.querySelector("#start-overlay .hint");
  }

  function syncMenuCopy() {
    const hint = hintEl();
    if (!hint) return;
    if (isVacant()) {
      hint.innerHTML =
        "Different game — musical chairs.<br /><span class=\"dim\">Tap the empty seat before the light leaves.</span>";
    } else if (hint.dataset.vacantSwapped === "1") {
      hint.innerHTML =
        "Tap lanes or press D / F / J<br /><span class=\"dim\">(\u2190 \u2193 \u2192 also work)</span>";
      hint.dataset.vacantSwapped = "0";
    }
    if (isVacant()) hint.dataset.vacantSwapped = "1";
  }

  function ensureBoard() {
    let board = $("vacant-board");
    if (board) return board;
    const lanes = $("lanes");
    board = document.createElement("div");
    board.id = "vacant-board";
    board.hidden = true;
    board.innerHTML =
      '<div class="vb-spot"></div>' +
      '<p class="vb-line" id="vacant-line">FIND THE EMPTY SEAT</p>' +
      '<div class="vb-row" id="vacant-row"></div>' +
      '<div class="vb-meter"><i id="vacant-meter"></i></div>' +
      '<p class="vb-status" id="vacant-status">3 ROOMS LEFT</p>';
    if (lanes && lanes.parentNode) lanes.parentNode.appendChild(board);
    else {
      const game = $("game");
      if (game) game.appendChild(board);
    }
    return board;
  }

  let running = false;
  let raf = 0;
  let lives = LIVES;
  let score = 0;
  let combo = 0;
  let emptyAt = 2;
  let locked = false;
  let deadline = 0;
  let windowMs = 1800;
  let lyrics = [];
  let lastLyric = "";

  function setHud() {
    const s = $("score");
    const c = $("combo");
    if (s) s.textContent = String(score);
    if (c) c.textContent = combo + "X";
    const st = $("vacant-status");
    if (st) st.textContent = lives + " ROOM" + (lives === 1 ? "" : "S") + " LEFT";
    const pill = $("section-pill");
    if (pill) pill.textContent = "VACANT \u00b7 CHAIRS";
  }

  function paintSeats() {
    const row = $("vacant-row");
    if (!row) return;
    row.innerHTML = "";
    for (let i = 0; i < SEATS; i++) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "vb-seat" + (i === emptyAt ? " empty" : " taken");
      b.dataset.i = String(i);
      b.setAttribute("aria-label", i === emptyAt ? "Empty seat" : "Taken seat");
      b.innerHTML = i === emptyAt ? "<b></b><span>OPEN</span>" : "<i></i><span>TAKEN</span>";
      b.addEventListener("click", onSeat);
      row.appendChild(b);
    }
    const spot = document.querySelector("#vacant-board .vb-spot");
    if (spot) spot.style.setProperty("--seat", String(emptyAt));
  }

  function nextEmpty(avoid) {
    let n = avoid;
    while (n === avoid) n = Math.floor(Math.random() * SEATS);
    return n;
  }

  function deal() {
    emptyAt = nextEmpty(emptyAt);
    locked = false;
    const t = $("audio") ? $("audio").currentTime || 0 : 0;
    windowMs = Math.max(720, 1880 - t * 28);
    deadline = performance.now() + windowMs;
    paintSeats();
  }

  function flash(ok) {
    const board = $("vacant-board");
    if (!board) return;
    board.classList.remove("hit", "miss");
    void board.offsetWidth;
    board.classList.add(ok ? "hit" : "miss");
  }

  function onSeat(ev) {
    if (!running || locked) return;
    const i = Number(ev.currentTarget.dataset.i);
    locked = true;
    if (i === emptyAt) {
      combo += 1;
      score += 120 + combo * 20;
      flash(true);
      setHud();
      setTimeout(deal, 220);
    } else {
      miss("THAT SEAT IS TAKEN");
    }
  }

  function miss(why) {
    combo = 0;
    lives -= 1;
    flash(false);
    const line = $("vacant-line");
    if (line) line.textContent = why || "NO ROOM";
    setHud();
    if (lives <= 0) {
      finish(false);
      return;
    }
    setTimeout(deal, 380);
  }

  function tick(now) {
    if (!running) return;
    const meter = $("vacant-meter");
    const left = Math.max(0, deadline - now);
    const p = windowMs ? left / windowMs : 0;
    if (meter) meter.style.transform = "scaleX(" + p + ")";
    const audio = $("audio");
    if (audio && lyrics.length) {
      const t = audio.currentTime || 0;
      const hit = lyrics.find((L) => t >= L.start && t < L.end);
      const line = $("vacant-line");
      if (hit && hit.text !== lastLyric) {
        lastLyric = hit.text;
        if (line) line.textContent = hit.text.toUpperCase();
      }
    }
    if (!locked && now > deadline) miss("LIGHT MOVED ON");
    raf = requestAnimationFrame(tick);
  }

  function loadLyrics() {
    lyrics = [];
    fetch("/game/play/levels/no-room-for-me/lyrics.json")
      .then((r) => r.json())
      .then((data) => {
        lyrics = Array.isArray(data) ? data : [];
      })
      .catch(() => {});
  }

  function showBoard(on) {
    const board = ensureBoard();
    const lanes = $("lanes");
    board.hidden = !on;
    if (lanes) lanes.classList.toggle("vacant-hidden", on);
    const app = document.getElementById("app");
    if (app) app.classList.toggle("vacant-play", on);
  }

  function startVacant() {
    const audio = $("audio");
    const startOverlay = $("start-overlay");
    const gameEl = $("game");
    const results = $("results-overlay");
    if (!audio || !gameEl) return;
    running = true;
    lives = LIVES;
    score = 0;
    combo = 0;
    lastLyric = "";
    if (startOverlay) startOverlay.classList.add("hidden");
    if (results) results.classList.add("hidden");
    gameEl.classList.remove("hidden");
    showBoard(true);
    loadLyrics();
    setHud();
    deal();
    try {
      audio.currentTime = 0;
    } catch (_) {}
    const play = audio.play();
    if (play && play.catch) play.catch(() => {});
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(tick);
    audio.onended = function () {
      finish(true);
    };
  }

  function finish(survived) {
    if (!running && survived) return;
    running = false;
    cancelAnimationFrame(raf);
    const audio = $("audio");
    try {
      if (audio) audio.pause();
    } catch (_) {}
    const line = $("vacant-line");
    if (line) {
      line.textContent = survived
        ? "YOU KEPT A SEAT \u00b7 " + score
        : "NO ROOM FOR ME \u00b7 " + score;
    }
    const st = $("vacant-status");
    if (st) st.textContent = survived ? "HELD THE HALL" : "EVICTED";
    const results = $("results-overlay");
    const scoreEl = $("results-score") || $("final-score");
    if (scoreEl) scoreEl.textContent = String(score);
    setTimeout(function () {
      showBoard(false);
      if (results) results.classList.remove("hidden");
    }, 900);
  }

  function bind() {
    ensureBoard();
    const btn = $("start-btn");
    if (btn) {
      btn.addEventListener(
        "click",
        function (e) {
          if (!isVacant()) return;
          e.preventDefault();
          e.stopImmediatePropagation();
          startVacant();
        },
        true
      );
    }
    const pause = $("btn-pause");
    if (pause) {
      pause.addEventListener(
        "click",
        function (e) {
          if (!running) return;
          const audio = $("audio");
          if (audio && !audio.paused) {
            audio.pause();
            cancelAnimationFrame(raf);
            e.stopImmediatePropagation();
          } else if (audio) {
            audio.play().catch(function () {});
            raf = requestAnimationFrame(tick);
            e.stopImmediatePropagation();
          }
        },
        true
      );
    }
    const app = $("app");
    if (app) {
      new MutationObserver(syncMenuCopy).observe(app, {
        attributes: true,
        attributeFilter: ["data-theme"],
      });
    }
    syncMenuCopy();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }
})();
