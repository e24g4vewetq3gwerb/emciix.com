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
})();
