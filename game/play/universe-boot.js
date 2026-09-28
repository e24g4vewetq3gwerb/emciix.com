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

  audio.disableRemotePlayback = false;
  if (document.getElementById("btn-cast")) return;
  let castUrl = "";
  function rememberTrack() {
    const raw = audio.getAttribute("src") || "";
    if (!raw || raw.indexOf("blob:") === 0) return;
    try { castUrl = new URL(raw, location.href).href; } catch (err) {}
  }
  audio.addEventListener("loadstart", rememberTrack);
  rememberTrack();

  const castBtn = document.createElement("button");
  castBtn.type = "button";
  castBtn.id = "btn-cast";
  castBtn.setAttribute("aria-pressed", "false");
  castBtn.setAttribute("aria-label", "Cast");
  castBtn.title = "Cast this track";
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

  let castReady = false;
  function sessionOn() {
    try {
      const api = window.cast;
      return !!(api && api.framework.CastContext.getInstance().getCurrentSession());
    } catch (err) {
      return false;
    }
  }
  function paint(note) {
    const on = sessionOn();
    castBtn.style.borderColor = on ? "#ffe628" : "rgba(0,245,255,.75)";
    castBtn.style.color = on ? "#ffe628" : "#7ef6ff";
    castBtn.style.opacity = "1";
    castBtn.setAttribute("aria-pressed", on ? "true" : "false");
    castBtn.textContent = on ? "CASTING" : "CAST";
    if (note) castBtn.title = note;
  }
  window.__onGCastApiAvailable = function (isAvailable) {
    const api = window.cast;
    if (!isAvailable || !api || !api.framework) {
      paint("Cast is not available in this browser");
      return;
    }
    try {
      const ctx = api.framework.CastContext.getInstance();
      ctx.setOptions({
        receiverApplicationId: window.chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
        autoJoinPolicy: window.chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
      });
      ctx.addEventListener(api.framework.CastContextEventType.SESSION_STATE_CHANGED, function () { paint(); });
      castReady = true;
      paint("Cast this track");
    } catch (err) {
      paint("Cast failed to start");
    }
  };
  const sdk = document.createElement("script");
  sdk.src = "https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1";
  sdk.async = true;
  sdk.onerror = function () { paint("Cast script was blocked"); };
  document.head.appendChild(sdk);

  function loadOnTv(session) {
    rememberTrack();
    if (!castUrl) throw new Error("No track loaded yet");
    const mediaInfo = new window.chrome.cast.media.MediaInfo(castUrl, "audio/mpeg");
    const meta = new window.chrome.cast.media.MusicTrackMediaMetadata();
    const titleEl = document.querySelector(".title-box h2");
    meta.title = (titleEl && titleEl.textContent.trim()) || "Emciix";
    meta.artist = "emciix";
    mediaInfo.metadata = meta;
    mediaInfo.streamType = window.chrome.cast.media.StreamType.BUFFERED;
    const request = new window.chrome.cast.media.LoadRequest(mediaInfo);
    const at = Number(audio.currentTime) || 0;
    if (at > 1 && String(audio.currentSrc || "").indexOf("blob:") !== 0) request.currentTime = at;
    return session.loadMedia(request);
  }

  castBtn.addEventListener("click", function () {
    if (!castReady || !window.cast || !window.cast.framework) {
      paint("Cast is still loading. Tap again.");
      return;
    }
    castBtn.style.opacity = "0.55";
    const ctx = window.cast.framework.CastContext.getInstance();
    const existing = ctx.getCurrentSession();
    const opening = existing ? Promise.resolve(existing) : ctx.requestSession();
    opening.then(function (session) {
      return loadOnTv(session || ctx.getCurrentSession());
    }).then(function () {
      try { audio.pause(); } catch (err) {}
      paint("Playing on the TV");
    }).catch(function (err) {
      const code = err && (err.code || err.description || err.message);
      paint(code ? String(code) : "No cast device, or cast was cancelled");
    });
  });
})();
