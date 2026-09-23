(function () {
  function mount() {
    if (document.getElementById("auth-signin-row")) return;
    const card = document.querySelector("#start-overlay .start-main");
    if (!card) return;
    const box = document.createElement("div");
    box.className = "start-login";
    box.innerHTML =
      '<p class="start-login-kicker">LOGIN</p>' +
      '<div class="auth-signin-row" id="auth-signin-row">' +
        '<button type="button" id="btn-google-signin" class="start-action-btn">GOOGLE</button>' +
        '<button type="button" id="btn-x-signin" class="start-action-btn btn-x">X</button>' +
      '</div>' +
      '<div class="auth-chip hidden" id="auth-chip">' +
        '<img id="auth-chip-avatar" class="auth-chip-avatar" alt="" width="28" height="28" data-placeholder="1" />' +
        '<div class="auth-chip-meta">' +
          '<strong id="auth-chip-name">Signed in</strong>' +
          '<span id="auth-points-val">0</span> PTS' +
        '</div>' +
        '<button type="button" id="btn-google-signout" class="start-action-btn btn-secondary">LOG OUT</button>' +
      '</div>' +
      '<p class="auth-error hidden" id="auth-error"></p>';
    const name = card.querySelector(".session-name");
    if (name && name.parentNode) name.parentNode.insertBefore(box, name);
    else card.appendChild(box);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
