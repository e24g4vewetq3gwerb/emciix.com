/* Level 22 uses the stock rhythm engine + No Room for Me audio.
   Previous chairs/stage overlays are disabled. */
(function () {
  function wipe() {
    const board = document.getElementById("vacant-board");
    if (board && board.parentNode) board.parentNode.removeChild(board);
    const lanes = document.getElementById("lanes");
    if (lanes) lanes.classList.remove("vacant-hidden");
    const app = document.getElementById("app");
    if (app) app.classList.remove("vacant-play");
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wipe);
  } else {
    wipe();
  }
})();
