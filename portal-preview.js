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
      ".portal-orbit{position:absolute;width:0;height:0;z-index:4;pointer-events:none}" +
      ".portal-orbit-a{left:14%;top:84%;animation:portalSpin 52s linear infinite}" +
      ".portal-orbit-b{left:86%;top:84%;animation:portalSpin 40s linear infinite reverse}" +
      ".portal-orbit a,.portal-orbit span{position:absolute;display:block;border-radius:50%;pointer-events:auto;background:url('/portal/assets/planet.webp?v=up-2') center/cover no-repeat;box-shadow:inset -16px -12px 24px rgba(0,0,0,.45),0 0 32px rgba(255,150,50,.35)}" +
      ".portal-orbit-a a{width:104px;height:104px;margin:-52px 0 0 0;animation:portalSpin 14s linear infinite}" +
      ".portal-orbit-b a{width:68px;height:68px;margin:-34px 0 0 0;animation:portalSpin 11s linear infinite reverse}" +
      "@keyframes portalSpin{to{transform:rotate(360deg)}}" +
      "@media (max-width:760px){.portal-orbit-a,.portal-orbit-b{top:86%}.portal-orbit-a{left:16%}.portal-orbit-b{left:84%}.portal-orbit-a a{width:84px;height:84px;margin:-42px 0 0 0}.portal-orbit-b a{width:56px;height:56px;margin:-28px 0 0 0}}" +
      "@media (prefers-reduced-motion:reduce){.portal-orbit,.portal-orbit a,.portal-orbit span{animation:none !important}}" +
      ".portal-preview .galactic-call{position:absolute;z-index:6;left:50%;top:46%;transform:translate(-50%,-50%);width:min(520px,calc(100% - 40px));margin:0;pointer-events:auto;background:rgba(18,18,20,.55);border-color:rgba(255,255,255,.22);color:#f5f5f7}" +
      ".portal-preview .galactic-label{display:none !important}" +
      ".portal-preview .call-modes{position:static;transform:none}" +
      ".portal-preview .call-dot,.portal-preview .call-yt{width:36px;min-width:36px;height:36px;padding:0;border-radius:50%;color:transparent;font-size:0;border:2px solid rgba(255,255,255,.35);background:url('/portal/assets/planet.webp?v=up-2') center/cover no-repeat}" +
      ".portal-preview .call-yt{filter:hue-rotate(210deg) saturate(1.2)}" +
      ".portal-preview .call-dot.is-on{border-color:#f5f5f7;box-shadow:0 0 0 3px rgba(255,255,255,.28),0 0 16px rgba(255,160,60,.55)}" +
      ".portal-preview .call-dot.is-on:not(.has-photo){background:url('/portal/assets/planet.webp?v=up-2') center/cover no-repeat;color:transparent}" +
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
