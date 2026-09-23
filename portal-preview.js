(function () {
  function mount() {
    var hero = document.getElementById("hero");
    if (!hero || document.getElementById("portal-preview")) return;
    var style = document.createElement("style");
    style.textContent =
      ".portal-preview{display:block;position:relative;margin-top:var(--section-gap,18px);width:100%;border-radius:var(--radius-lg,22px);overflow:hidden;border:1px solid var(--accent-border);background:#000;text-decoration:none;box-sizing:border-box}" +
      ".portal-preview iframe{width:100%;height:100%;border:0;display:block;pointer-events:none;background:#000}" +
      ".portal-preview-kicker{position:absolute;z-index:2;left:14px;top:12px;font:600 11px/1 var(--font,system-ui);letter-spacing:.18em;color:#fff;pointer-events:none}";
    document.head.appendChild(style);
    var wrap = document.createElement("a");
    wrap.id = "portal-preview";
    wrap.className = "portal-preview";
    wrap.href = "/portal";
    wrap.setAttribute("aria-label", "Open portal");
    wrap.innerHTML = '<span class="portal-preview-kicker">PORTAL</span><iframe src="/portal/" title="Portal preview" tabindex="-1" loading="lazy"></iframe>';
    hero.insertAdjacentElement("afterend", wrap);
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
