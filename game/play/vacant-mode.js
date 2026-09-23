/* Level 22 — STAGE LIGHT. One loop. Same No Room for Me audio. */
(function () {
  const MAX_HP = 100;

  function $(id) {
    return document.getElementById(id);
  }

  function vacant() {
    const app = $("app");
    return !!(app && (app.dataset.theme === "vacant" || app.dataset.theme === "room"));
  }

  function hint() {
    const el = document.querySelector("#start-overlay .hint");
    if (!el) return;
    if (vacant()) {
      el.innerHTML =
        "New game — stay in the light.<br /><span class=\"dim\">Tap left or right. Don't get left in the dark.</span>";
      el.dataset.vacantSwapped = "1";
    } else if (el.dataset.vacantSwapped === "1") {
      el.innerHTML =
        "Tap lanes or press D / F / J<br /><span class=\"dim\">(\u2190 \u2193 \u2192 also work)</span>";
      el.dataset.vacantSwapped = "0";
    }
  }

  function board() {
    let el = $("vacant-board");
    if (el) return el;
    el = document.createElement("div");
    el.id = "vacant-board";
    el.hidden = true;
    el.innerHTML =
      '<p class="vb-line" id="vacant-line">STAY IN THE LIGHT</p>' +
      '<div class="vb-stage" id="vacant-stage">' +
      '<div class="vb-light" id="vacant-light"></div>' +
      '<div class="vb-you" id="vacant-you"></div>' +
      "</div>" +
      '<div class="vb-hp"><i id="vacant-hp"></i></div>' +
      '<div class="vb-keys">' +
      '<button type="button" class="vb-key" data-dir="-1">LEFT</button>' +
      '<button type="button" class="vb-key" data-dir="1">RIGHT</button>' +
      "</div>" +
      '<p class="vb-status" id="vacant-status">HOLD THE STAGE</p>';
    const lanes = $("lanes");
    if (lanes && lanes.parentNode) lanes.parentNode.appendChild(el);
    else if ($("game")) $("game").appendChild(el);
    el.querySelectorAll(".vb-key").forEach(function (btn) {
      btn.addEventListener("pointerdown", function (ev) {
        ev.preventDefault();
        dir = Number(btn.dataset.dir) || 0;
      });
      btn.addEventListener("pointerup", function () {
        dir = 0;
      });
      btn.addEventListener("pointerleave", function () {
        dir = 0;
      });
    });
    return el;
  }

  let on = false;
  let raf = 0;
  let x = 0.5;
  let light = 0.5;
  let dir = 0;
  let hp = MAX_HP;
  let score = 0;
  let lyrics = [];
  let lastLine = "";
  let lastTs = 0;
  let ended = false;

  function hud() {
    const s = $("score");
    const c = $("combo");
    if (s) s.textContent = String(Math.floor(score));
    if (c) c.textContent = Math.max(0, Math.round(hp)) + "%";
    const bar = $("vacant-hp");
    if (bar) bar.style.transform = "scaleX(" + Math.max(0, hp) / MAX_HP + ")";
    const pill = $("section-pill");
    if (pill) pill.textContent = "VACANT \u00b7 STAGE";
  }

  function show(v) {
    const el = board();
    const lanes = $("lanes");
    el.hidden = !v;
    if (lanes) lanes.classList.toggle("vacant-hidden", v);
    const app = $("app");
    if (app) app.classList.toggle("vacant-play", v);
  }

  function lyricsLoad() {
    lyrics = [];
    fetch("/game/play/levels/no-room-for-me/lyrics.json")
      .then(function (r) { return r.json(); })
      .then(function (data) { lyrics = Array.isArray(data) ? data : []; })
      .catch(function () {});
  }

  function start() {
    const audio = $("audio");
    const startOverlay = $("start-overlay");
    const gameEl = $("game");
    const results = $("results-overlay");
    if (!audio || !gameEl) return;
    on = true;
    ended = false;
    x = 0.5;
    light = 0.5;
    dir = 0;
    hp = MAX_HP;
    score = 0;
    lastLine = "";
    lastTs = 0;
    if (startOverlay) startOverlay.classList.add("hidden");
    if (results) results.classList.add("hidden");
    const pauseOv = $("pause-overlay");
    if (pauseOv) pauseOv.classList.add("hidden");
    gameEl.classList.remove("hidden");
    show(true);
    lyricsLoad();
    hud();
    const line = $("vacant-line");
    if (line) line.textContent = "STAY IN THE LIGHT";
    try {
      audio.pause();
      audio.currentTime = 0;
    } catch (_) {}
    const p = audio.play();
    if (p && p.catch) p.catch(function () {});
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(tick);
  }

  function tick(ts) {
    if (!on) return;
    const dt = lastTs ? Math.min(0.05, (ts - lastTs) / 1000) : 0.016;
    lastTs = ts;
    const audio = $("audio");
    const t = audio ? audio.currentTime || 0 : 0;
    const dur = audio && audio.duration && isFinite(audio.duration) ? audio.duration : 34.8;
    light = 0.5 + Math.sin(t * 1.35) * 0.34 + Math.sin(t * 0.37) * 0.08;
    x += dir * dt * 1.15;
    if (x < 0.08) x = 0.08;
    if (x > 0.92) x = 0.92;
    const you = $("vacant-you");
    const lamp = $("vacant-light");
    if (you) you.style.left = x * 100 + "%";
    if (lamp) lamp.style.left = light * 100 + "%";
    const inside = Math.abs(x - light) < 0.16;
    const stage = $("vacant-stage");
    if (stage) stage.classList.toggle("in-light", inside);
    if (inside) {
      hp = Math.min(MAX_HP, hp + dt * 8);
      score += dt * 90;
    } else {
      hp -= dt * 18;
    }
    if (lyrics.length) {
      const hit = lyrics.find(function (L) { return t >= L.start && t < L.end; });
      if (hit && hit.text !== lastLine) {
        lastLine = hit.text;
        const ln = $("vacant-line");
        if (ln) ln.textContent = hit.text.toUpperCase();
      }
    }
    hud();
    if (hp <= 0) {
      finish(false);
      return;
    }
    if (audio && (audio.ended || t >= dur - 0.05)) {
      finish(true);
      return;
    }
    raf = requestAnimationFrame(tick);
  }

  function finish(ok) {
    if (!on || ended) return;
    ended = true;
    on = false;
    cancelAnimationFrame(raf);
    const audio = $("audio");
    try { if (audio) audio.pause(); } catch (_) {}
    const line = $("vacant-line");
    if (line) {
      line.textContent = ok
        ? "YOU HELD THE LIGHT \u00b7 " + Math.floor(score)
        : "NO ROOM FOR ME \u00b7 " + Math.floor(score);
    }
    const st = $("vacant-status");
    if (st) st.textContent = ok ? "ON THE BILL" : "CUT FROM THE BILL";
    const results = $("results-overlay");
    const scoreEl = $("results-score") || $("final-score");
    if (scoreEl) scoreEl.textContent = String(Math.floor(score));
    setTimeout(function () {
      show(false);
      if (results) results.classList.remove("hidden");
    }, 700);
  }

  function keys(e) {
    if (!on) return;
    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A" || e.key === "d" || e.key === "D") {
      dir = -1;
      e.preventDefault();
    }
    if (e.key === "ArrowRight" || e.key === "l" || e.key === "L" || e.key === "j" || e.key === "J") {
      dir = 1;
      e.preventDefault();
    }
  }
  function keysUp(e) {
    if (!on) return;
    if (e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "a" || e.key === "A" || e.key === "d" || e.key === "D" || e.key === "j" || e.key === "J" || e.key === "l" || e.key === "L") {
      dir = 0;
    }
  }

  function bind() {
    board();
    const btn = $("start-btn");
    if (btn) {
      btn.addEventListener("click", function (e) {
        if (!vacant()) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        start();
      }, true);
    }
    window.addEventListener("keydown", keys);
    window.addEventListener("keyup", keysUp);
    const pause = $("btn-pause");
    if (pause) {
      pause.addEventListener("click", function (e) {
        if (!on) return;
        const audio = $("audio");
        if (audio && !audio.paused) {
          audio.pause();
          cancelAnimationFrame(raf);
          e.stopImmediatePropagation();
        } else if (audio) {
          audio.play().catch(function () {});
          lastTs = 0;
          raf = requestAnimationFrame(tick);
          e.stopImmediatePropagation();
        }
      }, true);
    }
    const app = $("app");
    if (app) {
      new MutationObserver(hint).observe(app, { attributes: true, attributeFilter: ["data-theme"] });
    }
    hint();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind);
  else bind();
})();
