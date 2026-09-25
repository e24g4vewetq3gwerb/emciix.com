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
      ".portal-preview{display:block;position:fixed;inset:0;margin:0;width:100%;height:100%;border-radius:0;overflow:hidden;border:0;background:#000;box-sizing:border-box;z-index:1}" +
      ".portal-preview[hidden]{display:none !important}" +
      ".portal-preview iframe{position:absolute;inset:0;width:100%;height:100%;border:0;display:block;pointer-events:none;background:#000;opacity:0;z-index:0}.portal-preview.is-ready iframe{opacity:1}" +
      ".portal-preview-open{position:absolute;inset:0;z-index:1}" +
      ".portal-preview .topwrap{position:absolute;z-index:5;left:50%;right:auto;top:16px;width:min(1004px,calc(100% - 32px));margin:0;transform:translateX(-50%);pointer-events:auto}";
    document.head.appendChild(style);
    var card = document.createElement("div");
    card.id = "portal-preview";
    card.className = "portal-preview";
    card.innerHTML = '<a class="portal-preview-open" href="/portal" aria-label="Open portal"></a><iframe src="/portal/?preview=1" title="Portal preview" tabindex="-1" loading="lazy"></iframe>';
    card.hidden = false;
    var header = document.querySelector(".topwrap");
    var wrap = document.querySelector(".wrap");
    if (wrap) wrap.appendChild(card);
    else document.body.appendChild(card);
    if (header) card.appendChild(header);
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
