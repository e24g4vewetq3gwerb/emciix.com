(function () {
  function minimal(frame) {
    try {
      var doc = frame.contentDocument;
      if (!doc || !doc.head || !doc.querySelector(".hud") || doc.getElementById("preview-fly-only")) return false;
      var style = doc.createElement("style");
      style.id = "preview-fly-only";
      style.textContent =
        ".sky-hint,.page-tabs,.panel-4,#embed-fly,#warp-planet,#warp-atmo,#warp-moon{display:none!important}" +
        ".hud{zoom:1!important}" +
        "#preview-fly{appearance:none;border:1px solid rgba(255,255,255,.35);background:#f2f2f4;color:#121212;border-radius:999px;padding:.55rem 1.6rem;font:600 .85rem/1 system-ui,sans-serif;letter-spacing:.12em;text-transform:none}";
      doc.head.appendChild(style);
      return true;
    } catch (_) {
      return false;
    }
  }
  function watch(frame) {
    var n = 0;
    var timer = setInterval(function () {
      n += 1;
      if (minimal(frame) || n > 50) clearInterval(timer);
    }, 200);
  }
  function mount() {
    if (document.getElementById("portal-preview")) return;
    var bg = document.getElementById("portal-bg");
    if (bg) bg.remove();
    var style = document.createElement("style");
    style.textContent =
      ".portal-preview{display:block;position:fixed;inset:0;margin:0;width:100%;height:100%;border-radius:0;overflow:hidden;border:0;background:#000;box-sizing:border-box;z-index:1}" +
      ".portal-preview[hidden]{display:none !important}" +
      ".portal-preview iframe{position:absolute;inset:0;width:100%;height:100%;border:0;display:block;pointer-events:none;background:#000;opacity:0;z-index:0}.portal-preview.is-ready iframe{opacity:1}" +
      ".portal-preview-open{position:absolute;inset:0;z-index:1}" +
      ".portal-preview .topwrap{position:absolute;z-index:5;left:50%;right:auto;top:16px;width:min(1004px,calc(100% - 32px));margin:0;transform:translateX(-50%);pointer-events:auto}" +
      ".portal-orbit{position:absolute;inset:0;z-index:7;pointer-events:none}" +
      ".portal-orbit a{position:absolute;left:0;top:0;display:block;border-radius:50%;pointer-events:auto;margin:0;background:url('/portal/assets/planet.webp?v=up-2') center/cover no-repeat;box-shadow:inset -16px -12px 24px rgba(0,0,0,.45),0 0 32px rgba(255,150,50,.35)}" +
      ".portal-orbit-a a{width:96px;height:96px}" +
      ".portal-orbit-b a{width:64px;height:64px}" +
      "@media (max-width:760px){.portal-orbit-a a{width:72px;height:72px}.portal-orbit-b a{width:48px;height:48px}}" +
      "@media (prefers-reduced-motion:reduce){.portal-orbit a{animation:none !important}}" +
      ".portal-preview .galactic-call{position:absolute;z-index:6;left:50%;top:46%;transform:translate(-50%,-50%);width:min(520px,calc(100% - 40px));margin:0;pointer-events:auto;background:rgba(18,18,20,.55);border-color:rgba(255,255,255,.22);color:#f5f5f7}" +
      ".portal-preview .galactic-label,.portal-preview .call-modes{display:none !important}" +
      ".portal-preview .caller-profile{color:#f5f5f7}" +
      ".portal-preview .call-send{background:transparent;color:#f5f5f7;border:1px solid rgba(255,255,255,.35)}" +
      ".portal-preview .topwrap{background:rgba(10,10,12,.5);border-color:rgba(255,255,255,.16)}" +
      ".portal-preview .livepill{background:rgba(48,209,88,.16)!important;border-color:rgba(48,209,88,.5)!important;color:#c8f8d4!important}" +
      ".portal-preview .livedot{background:#30d158!important;box-shadow:0 0 0 3px rgba(48,209,88,.3)!important}" +
      ".portal-preview .themebtn{color:#f2d48a!important;background:rgba(242,212,138,.14)!important;border-color:rgba(242,212,138,.5)!important}" +
      ".portal-preview .markbtn{background:#e8c15a!important;color:#1a1408!important}" +
      ".portal-preview .soc-spotify{color:#1ed760!important;background:rgba(29,185,84,.16)!important;border-color:rgba(30,215,96,.5)!important}" +
      ".portal-preview .soc-apple{color:#ff4d6a!important;background:rgba(250,36,60,.16)!important;border-color:rgba(255,77,106,.5)!important}" +
      ".portal-preview .soc-x{color:#f5f5f7!important;background:rgba(255,255,255,.08)!important;border-color:rgba(255,255,255,.32)!important}" +
      ".portal-preview .soc-linkedin{color:#7eb6ff!important;background:rgba(10,102,194,.22)!important;border-color:rgba(126,182,255,.55)!important}" +
      ".portal-preview .soc-youtube{color:#ff5a5a!important;background:rgba(255,0,0,.16)!important;border-color:rgba(255,90,90,.55)!important}";
    document.head.appendChild(style);
    var card = document.createElement("div");
    card.id = "portal-preview";
    card.className = "portal-preview";
    card.innerHTML = '<a class="portal-preview-open" href="/portal" aria-label="Open portal"></a><iframe src="/portal/?preview=1" title="Portal preview" tabindex="-1" loading="lazy"></iframe><div class="portal-orbit portal-orbit-a"><a href="https://music.youtube.com/playlist?list=PLZX_2WN1sEAg&si=HmAC2yV1aCsF9TI1" aria-label="Playlist"></a></div><div class="portal-orbit portal-orbit-b"><a href="https://emciix.com/game/play" aria-label="Game"></a></div>';
    card.hidden = false;
    var wrap = document.querySelector(".wrap");
    if (wrap) wrap.appendChild(card);
    else document.body.appendChild(card);
    var call = document.getElementById("galacticCall");
    if (call) card.appendChild(call);
    var planetA = card.querySelector(".portal-orbit-a a");
    var planetB = card.querySelector(".portal-orbit-b a");
    var reduceSpin = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var spinStart = performance.now();
    function placePlanet(el, x, y, turn) {
      el.style.transform = "translate(" + x + "px," + y + "px) rotate(" + turn + "deg) translate(-50%,-50%)";
    }
    function spinPlanets(now) {
      requestAnimationFrame(spinPlanets);
      if (!call || !planetA || !planetB) return;
      var field = call.getBoundingClientRect();
      var host = card.getBoundingClientRect();
      var cx = field.left - host.left + field.width / 2;
      var cy = field.top - host.top + field.height / 2;
      var rx = Math.max(70, field.width / 2);
      var ry = Math.max(28, field.height);
      var t = reduceSpin ? 0.4 : (now - spinStart) / 1000;
      placePlanet(planetA, cx + Math.cos(t / 14) * rx, cy + Math.sin(t / 14) * ry, t * 36);
      placePlanet(planetB, cx + Math.cos(t / 9 + Math.PI) * rx * 0.62, cy + Math.sin(t / 9 + Math.PI) * ry * 1.35, -t * 48);
    }
    requestAnimationFrame(spinPlanets);
    var frame = card.querySelector("iframe");
    frame.addEventListener("load", function () {
      watch(frame);
      card.classList.add("is-ready");
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();

// reCAPTCHA Enterprise site key: loads on the homepage so the key receives traffic.
// The floating badge is hidden so the layout stays unchanged.
(function () {
  var KEY = "6Lc4tM4tAAAAALKvME6LdQOTV3_rJMCPWcGJk9du";
  if (window.__emciixRecaptcha) return;
  window.__emciixRecaptcha = true;
  try {
    var css = document.createElement("style");
    css.textContent = ".grecaptcha-badge{visibility:hidden!important}";
    document.head.appendChild(css);
    window.emciixRecaptchaReady = function () {
      try {
        var g = window.grecaptcha && window.grecaptcha.enterprise;
        if (!g) return;
        g.ready(function () {
          g.execute(KEY, { action: "homepage" }).then(function () {}, function () {});
        });
      } catch (_) {}
    };
    var s = document.createElement("script");
    s.src = "https://www.google.com/recaptcha/enterprise.js?render=" + KEY + "&onload=emciixRecaptchaReady";
    s.async = true;
    s.defer = true;
    document.head.appendChild(s);
  } catch (_) {}
})();
