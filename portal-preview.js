(function () {
  function mount() {
    if (document.getElementById("portal-bg")) return;
    var style = document.createElement("style");
    style.textContent =
      "html,body{background:transparent!important}" +
      "#portal-bg{position:fixed;inset:0;z-index:0;width:100%;height:100%;border:0;pointer-events:none;background:#000}" +
      ".wrap{position:relative;z-index:1}";
    document.head.appendChild(style);
    var frame = document.createElement("iframe");
    frame.id = "portal-bg";
    frame.className = "portal-bg";
    frame.src = "/portal/?bg=1";
    frame.title = "";
    frame.tabIndex = -1;
    frame.setAttribute("aria-hidden", "true");
    document.body.prepend(frame);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
