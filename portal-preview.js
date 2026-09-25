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
      ".portal-orbit{position:absolute;left:50%;top:58%;width:0;height:0;z-index:4;pointer-events:none}" +
      ".portal-orbit-a{animation:portalSpin 46s linear infinite}" +
      ".portal-orbit-b{animation:portalSpin 33s linear infinite reverse}" +
      ".portal-orbit a,.portal-orbit span{position:absolute;display:block;border-radius:50%;pointer-events:auto;background:url('/portal/assets/planet.webp?v=up-2') center/cover no-repeat;box-shadow:inset -16px -12px 24px rgba(0,0,0,.45),0 0 32px rgba(255,150,50,.35)}" +
      ".portal-orbit-a a{width:150px;height:150px;margin:-75px 0 0 150px;animation:portalSpin 46s linear infinite reverse}" +
      ".portal-orbit-b span{width:84px;height:84px;margin:-42px 0 0 -210px;animation:portalSpin 33s linear infinite}" +
      "@keyframes portalSpin{to{transform:rotate(360deg)}}" +
      "@media (max-width:760px){.portal-orbit{top:62%}.portal-orbit-a a{width:108px;height:108px;margin:-54px 0 0 92px}.portal-orbit-b span{width:64px;height:64px;margin:-32px 0 0 -120px}}" +
      "@media (prefers-reduced-motion:reduce){.portal-orbit,.portal-orbit a,.portal-orbit span{animation:none !important}}" +
      ".portal-preview .galactic-call{position:absolute;z-index:6;left:50%;top:46%;transform:translate(-50%,-50%);width:min(720px,calc(100% - 48px));margin:0;pointer-events:auto}";
    document.head.appendChild(style);
    var card = document.createElement("div");
    card.id = "portal-preview";
    card.className = "portal-preview";
    card.innerHTML = '<a class="portal-preview-open" href="/portal" aria-label="Open portal"></a><iframe src="/portal/?preview=1" title="Portal preview" tabindex="-1" loading="lazy"></iframe><div class="portal-orbit portal-orbit-a"><a href="https://emciix.com/game/play" aria-label="Planet"></a></div><div class="portal-orbit portal-orbit-b"><span aria-hidden="true"></span></div>';
    card.hidden = false;
    var header = document.querySelector(".topwrap");
    var wrap = document.querySelector(".wrap");
    if (wrap) wrap.appendChild(card);
    else document.body.appendChild(card);
    if (header) card.appendChild(header);
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
