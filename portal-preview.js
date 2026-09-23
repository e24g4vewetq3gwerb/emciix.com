(function () {
  var COMPACT =
    ".hud{zoom:.52;padding-left:8px!important;padding-right:8px!important;padding-bottom:6px!important}" +
    ".panel-4{max-width:16rem!important;padding:.28rem .4rem .22rem!important;border-radius:.7rem!important}" +
    ".panel-4-head{padding-bottom:.15rem!important}" +
    ".panel-4 h1{font-size:.55rem!important}" +
    ".panel-4 .font-mono{font-size:.72rem!important}" +
    ".page-tabs{margin-top:.2rem!important;gap:.18rem!important}" +
    ".play-row{margin-top:.16rem!important;gap:.16rem!important}" +
    ".page-tabs button,.play-row button,.hue-btn{min-height:0!important;padding:.18rem .15rem!important;font-size:.58rem!important;line-height:1.15!important}" +
    ".sky-hint{top:16%!important;font-size:.72rem!important;width:min(13rem,92%)!important}" +
    ".sky-hint span{font-size:.58rem!important}";

  function compact(frame) {
    try {
      var doc = frame.contentDocument;
      if (!doc || !doc.head || !doc.querySelector(".hud") || doc.getElementById("preview-compact")) return false;
      var style = doc.createElement("style");
      style.id = "preview-compact";
      style.textContent = COMPACT;
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
      if (compact(frame) || n > 50) clearInterval(timer);
    }, 200);
  }

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
    wrap.innerHTML = '<span class="portal-preview-kicker">PORTAL</span><iframe src="/portal/?preview=1" title="Portal preview" tabindex="-1" loading="lazy"></iframe>';
    hero.insertAdjacentElement("afterend", wrap);
    var frame = wrap.querySelector("iframe");
    frame.addEventListener("load", function () { watch(frame); });
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
