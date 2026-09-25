(function () {
  function minimal(frame) {
    try {
      var doc = frame.contentDocument;
      if (!doc || !doc.head || !doc.querySelector(".hud") || doc.getElementById("preview-fly-only")) return false;
      var style = doc.createElement("style");
      style.id = "preview-fly-only";
      style.textContent =
        ".sky-hint,.page-tabs,.panel-4,#embed-fly{display:none!important}" +
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
      ".portal-preview{display:block;position:relative;margin:0 0 18px;width:100%;height:min(760px,92vh);min-height:520px;border-radius:var(--radius-lg,22px);overflow:hidden;border:1px solid var(--line,rgba(255,255,255,.14));background:#000;box-sizing:border-box}" +
      ".portal-preview[hidden]{display:none !important}" +
      ".portal-preview iframe{position:absolute;inset:0;width:100%;height:100%;border:0;display:block;pointer-events:none;background:#000;opacity:0;z-index:0}.portal-preview.is-ready iframe{opacity:1}" +
      ".portal-preview-open{position:absolute;inset:0;z-index:1}" +
      ".portal-planet{position:absolute;z-index:5;pointer-events:auto;filter:drop-shadow(0 16px 28px rgba(0,0,0,.5))}" +
      ".portal-planet-play{left:4%;top:5%;width:min(640px,92%);animation:planetDriftA 26s ease-in-out infinite}" +
      ".portal-planet-call{left:8%;bottom:5%;width:min(520px,86%);animation:planetDriftB 22s ease-in-out infinite}" +
      ".portal-planet-orb{position:absolute;border-radius:50%;background:url('/portal/assets/planet.png?v=up-1') center/cover no-repeat;box-shadow:0 0 0 10px rgba(255,170,70,.14),0 0 42px rgba(255,140,40,.55);pointer-events:none;z-index:2;animation:planetSpin 42s linear infinite}" +
      ".portal-planet-play .portal-planet-orb{width:132px;height:132px;left:-18px;top:-46px}" +
      ".portal-planet-call .portal-planet-orb{width:78px;height:78px;right:-8px;top:-34px;left:auto;background-image:url('/portal/assets/moon.png?v=up-1')}" +
      ".portal-preview .hero{position:relative;z-index:1;min-height:0 !important;width:100% !important;grid-template-columns:1fr !important;border-radius:28px !important}" +
      ".portal-preview .stage{aspect-ratio:16/9 !important;height:auto !important;min-height:0 !important;border-radius:28px 28px 0 0 !important}" +
      ".portal-preview .galactic-call{position:relative !important;left:auto !important;top:auto !important;bottom:auto !important;width:100% !important;transform:none !important;margin:0 !important;z-index:1}" +
      "@keyframes planetDriftA{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(16px,12px,0)}}" +
      "@keyframes planetDriftB{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(-14px,-10px,0)}}" +
      "@keyframes planetSpin{to{transform:rotate(360deg)}}" +
      "@media (max-width:760px){.portal-preview{height:auto;min-height:0}.portal-planet{position:relative;left:auto;right:auto;top:auto;bottom:auto;width:auto;margin:12px}.portal-planet-play,.portal-planet-call{animation:none}}" +
      "@media (prefers-reduced-motion:reduce){.portal-planet,.portal-planet-orb{animation:none !important}}";
    document.head.appendChild(style);
    var card = document.createElement("div");
    card.id = "portal-preview";
    card.className = "portal-preview";
    card.innerHTML = '<a class="portal-preview-open" href="/portal" aria-label="Open portal"></a><iframe src="/portal/?preview=1" title="Portal preview" tabindex="-1" loading="lazy"></iframe>';
    card.hidden = false;
    var header = document.querySelector(".topwrap");
    if (header) header.insertAdjacentElement("afterend", card);
    else document.body.appendChild(card);
    function planet(className, node) {
      var shell = document.createElement("div");
      shell.className = "portal-planet " + className;
      var orb = document.createElement("span");
      orb.className = "portal-planet-orb";
      orb.setAttribute("aria-hidden", "true");
      shell.appendChild(orb);
      if (node) shell.appendChild(node);
      card.appendChild(shell);
    }
    planet("portal-planet-play", document.getElementById("hero"));
    planet("portal-planet-call", document.getElementById("galacticCall"));
    var tab = document.getElementById("portalNav");
    if (tab) {
      tab.setAttribute("aria-expanded", "true");
      tab.addEventListener("click", function (event) {
        event.preventDefault();
        var open = card.hidden;
        card.hidden = !open;
        tab.setAttribute("aria-expanded", open ? "true" : "false");
        if (open) card.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    }
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
