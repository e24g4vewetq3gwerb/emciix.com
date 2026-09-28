/* Level 22 VACANT boot — tap-to-start fallback + universe layer.
   Loaded after game.js. Does not replace the engine. */
(function () {
  const audio = document.getElementById("audio");
  if (!audio) return;

  let silentUrl = "";
  function armSilent(seconds) {
    const dur = Math.max(8, Number(seconds) || 35);
    const sr = 22050;
    const n = Math.floor(sr * dur);
    const bytes = n * 2;
    const buf = new ArrayBuffer(44 + bytes);
    const v = new DataView(buf);
    const w = (o, str) => {
      for (let i = 0; i < str.length; i++) v.setUint8(o + i, str.charCodeAt(i));
    };
    w(0, "RIFF");
    v.setUint32(4, 36 + bytes, true);
    w(8, "WAVE");
    w(12, "fmt ");
    v.setUint32(16, 16, true);
    v.setUint16(20, 1, true);
    v.setUint16(22, 1, true);
    v.setUint32(24, sr, true);
    v.setUint32(28, sr * 2, true);
    v.setUint16(32, 2, true);
    v.setUint16(34, 16, true);
    w(36, "data");
    v.setUint32(40, bytes, true);
    if (silentUrl) URL.revokeObjectURL(silentUrl);
    silentUrl = URL.createObjectURL(new Blob([buf], { type: "audio/wav" }));
    audio.src = silentUrl;
    audio.load();
  }

  function chartDuration() {
    return 35;
  }

  audio.addEventListener("error", () => {
    armSilent(chartDuration());
  });

  const origPlay = audio.play.bind(audio);
  audio.play = function playPatched() {
    if (audio.error || audio.readyState < 1) {
      armSilent(chartDuration());
    }
    return origPlay().catch(() => {
      armSilent(chartDuration());
      return origPlay();
    });
  };

  function syncUniverse() {
    const app = document.getElementById("app");
    if (!app) return;
    const theme = app.dataset.theme || "";
    let layer = document.getElementById("universe-layer");
    if (!layer) {
      layer = document.createElement("div");
      layer.id = "universe-layer";
      layer.setAttribute("aria-hidden", "true");
      app.insertBefore(layer, app.firstChild);
    }
    if (layer.dataset.universe === theme) return;
    layer.dataset.universe = theme;
    if (theme === "vacant" || theme === "room") {
      layer.innerHTML =
        '<div class="vacant-haze"></div>' +
        '<div class="vacant-spot"></div>' +
        '<div class="vacant-rows"></div>' +
        '<div class="vacant-chair"><i></i><b></b></div>' +
        '<div class="vacant-dust"></div>' +
        '<div class="vacant-badge">UNIVERSE · VACANT</div>';
    } else {
      layer.innerHTML = "";
    }
  }

  const app = document.getElementById("app");
  if (app) {
    new MutationObserver(syncUniverse).observe(app, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    syncUniverse();
  }

  const grid = document.getElementById("levels-grid");
  if (grid) {
    new MutationObserver(() => {
      grid.querySelectorAll(".level-tile.theme-vacant").forEach((btn) => {
        if (btn.querySelector(".vacant-art")) return;
        const art = document.createElement("span");
        art.className = "lt-art vacant-art";
        art.setAttribute("aria-hidden", "true");
        art.innerHTML = "<i></i><b></b>";
        btn.insertBefore(art, btn.firstChild);
      });
    }).observe(grid, { childList: true });
  }

  if (document.getElementById("btn-cast")) return;
  const castBtn = document.createElement("button");
  castBtn.type = "button";
  castBtn.id = "btn-cast";
  castBtn.setAttribute("aria-pressed", "false");
  castBtn.setAttribute("aria-label", "Cast");
  castBtn.title = "Show this page on a TV";
  castBtn.textContent = "CAST";
  castBtn.style.cssText = [
    "position:fixed",
    "z-index:80",
    "top:max(10px, env(safe-area-inset-top))",
    "left:max(10px, env(safe-area-inset-left))",
    "height:32px",
    "padding:0 12px",
    "border-radius:999px",
    "border:1px solid rgba(0,245,255,.75)",
    "background:rgba(4,8,16,.78)",
    "color:#7ef6ff",
    "font:700 11px/1 ui-sans-serif,system-ui,sans-serif",
    "letter-spacing:.16em",
    "cursor:pointer",
  ].join(";");
  document.body.appendChild(castBtn);

  const pageUrl = location.origin + "/game/play";
  let presentation = null;
  let connection = null;
  if (window.PresentationRequest) {
    presentation = new PresentationRequest([pageUrl]);
    if (navigator.presentation) navigator.presentation.defaultRequest = presentation;
    presentation.addEventListener("connectionavailable", function (event) {
      connection = event.connection;
      paint("The page is on the TV");
    });
  }

  function paint(note) {
    const on = !!(connection && connection.state === "connected");
    castBtn.style.borderColor = on ? "#ffe628" : "rgba(0,245,255,.75)";
    castBtn.style.color = on ? "#ffe628" : "#7ef6ff";
    castBtn.style.opacity = "1";
    castBtn.setAttribute("aria-pressed", on ? "true" : "false");
    castBtn.textContent = on ? "ON TV" : "CAST";
    if (note) castBtn.title = note;
  }

  castBtn.addEventListener("click", function () {
    if (!presentation) {
      paint("This browser cannot show the page on a TV");
      return;
    }
    if (connection && connection.state === "connected") {
      connection.terminate();
      connection = null;
      paint("Show this page on a TV");
      return;
    }
    castBtn.style.opacity = "0.55";
    presentation.start().then(function (next) {
      connection = next;
      next.addEventListener("close", function () {
        connection = null;
        paint("Show this page on a TV");
      });
      paint("The page is on the TV");
    }).catch(function (err) {
      paint((err && err.message) || "No screen, or cast was cancelled");
    });
  });
})();
