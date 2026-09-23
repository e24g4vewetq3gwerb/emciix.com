(function () {
  function minimal(frame) {
    try {
      var doc = frame.contentDocument;
      if (!doc || !doc.head || !doc.querySelector(".hud") || doc.getElementById("preview-fly-only")) return false;
      var style = doc.createElement("style");
      style.id = "preview-fly-only";
      style.textContent =
        ".sky-hint{display:none!important}" +
        ".panel-4{display:none!important}" +
        ".hud{zoom:1!important;display:flex;justify-content:center;padding:0 0 16px!important}" +
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
    var hero = document.getElementById("hero");
    if (!hero || document.getElementById("portal-preview")) return;
    var style = document.createElement("style");
    style.textContent =
      ".portal-preview{display:block;position:relative;margin-top:var(--section-gap,18px);width:100%;border-radius:var(--radius-lg,22px);overflow:hidden;border:1px solid var(--accent-border);background:#000;text-decoration:none;box-sizing:border-box}" +
      ".portal-preview iframe{width:100%;height:100%;border:0;display:block;pointer-events:none;background:#000;opacity:0}.portal-preview.is-ready iframe{opacity:1}" +
      ".portal-preview-kicker{position:absolute;z-index:2;left:14px;top:12px;font:600 11px/1 var(--font,system-ui);letter-spacing:.18em;color:#fff;pointer-events:none}";
    document.head.appendChild(style);
    var wrap = document.createElement("a");
    wrap.id = "portal-preview";
    wrap.className = "portal-preview";
    wrap.href = "/portal";
    wrap.setAttribute("aria-label", "Open portal");
    wrap.innerHTML = '<span class="portal-preview-kicker">PORTAL</span><iframe src="/portal/?preview=1" title="Portal preview" tabindex="-1" loading="lazy"></iframe>';
    hero.insertAdjacentElement("afterend", wrap);
    var frame = wrap.querySelector("iframe");
    frame.addEventListener("load", function () {
      watch(frame);
      wrap.classList.add("is-ready");
    });
    function sync() {
      var h = hero.offsetHeight || Math.round(hero.getBoundingClientRect().height) || 280;
      wrap.style.height = Math.max(280, h) + "px";
    }
    sync();
    if (window.ResizeObserver) new ResizeObserver(sync).observe(hero);
    window.addEventListener("resize", sync);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
