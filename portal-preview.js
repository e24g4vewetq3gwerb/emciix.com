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
    if (document.getElementById("portal-preview")) return;
    var bg = document.getElementById("portal-bg");
    if (bg) bg.remove();
    var style = document.createElement("style");
    style.textContent =
      ".portal-preview{display:block;position:relative;margin:0 0 var(--section-gap,18px);width:100%;height:420px;border-radius:var(--radius-lg,22px);overflow:hidden;border:1px solid var(--line,rgba(255,255,255,.14));background:#000;box-sizing:border-box}" +
      ".portal-preview iframe{position:absolute;inset:0;width:100%;height:100%;border:0;display:block;pointer-events:none;background:#000;opacity:0;z-index:0}.portal-preview.is-ready iframe{opacity:1}" +
      ".portal-preview-open{position:absolute;inset:0;z-index:1}" +
      ".portal-preview-kicker{position:absolute;z-index:2;left:14px;top:12px;font:600 11px/1 var(--font,system-ui);letter-spacing:.18em;color:#fff;pointer-events:none}" +
      ".portal-preview .galactic-call{position:absolute;z-index:4;left:50%;top:50%;transform:translate(-50%,-50%);width:min(920px,calc(100% - 28px));margin:0;pointer-events:auto;box-sizing:border-box}" +
      "@media (max-width:760px){.portal-preview .galactic-call{gap:8px;padding:8px 10px 8px 14px}.portal-preview .galactic-label{font-size:14px;max-width:38%}.portal-preview .call-dot,.portal-preview .call-yt{box-sizing:border-box;min-width:36px;height:32px}.portal-preview .caller-profile{min-width:52px}}";
    document.head.appendChild(style);
    var card = document.createElement("div");
    card.id = "portal-preview";
    card.className = "portal-preview";
    card.innerHTML = '<a class="portal-preview-open" href="/portal" aria-label="Open portal"></a><span class="portal-preview-kicker">PORTAL</span><iframe src="/portal/?preview=1" title="Portal preview" tabindex="-1" loading="lazy"></iframe>';
    var wrap = document.querySelector(".wrap");
    var header = wrap && wrap.querySelector(".topwrap");
    if (header) header.insertAdjacentElement("afterend", card);
    else if (wrap) wrap.insertBefore(card, wrap.firstChild);
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
