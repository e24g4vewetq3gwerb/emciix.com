(function () {
  function mount() {
    const card = document.querySelector("#start-overlay .start-main");
    if (!card) return;
    document.querySelectorAll(".session-name, .start-login").forEach((el) => el.remove());

    const box = document.createElement("div");
    box.className = "start-login";
    box.innerHTML =
      '<button type="button" id="btn-login-toggle" class="start-action-btn start-login-toggle">LOGIN</button>' +
      '<div class="auth-signin-row start-login-methods" id="auth-signin-row">' +
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
    card.appendChild(box);

    const toggle = box.querySelector("#btn-login-toggle");
    const methods = box.querySelector("#auth-signin-row");
    const chip = box.querySelector("#auth-chip");
    toggle.addEventListener("click", () => {
      box.classList.toggle("open");
    });

    function sync() {
      const inChip = chip && !chip.classList.contains("hidden");
      toggle.classList.toggle("hidden", !!inChip);
      if (inChip) box.classList.remove("open");
    }
    if (chip && window.MutationObserver) {
      new MutationObserver(sync).observe(chip, { attributes: true, attributeFilter: ["class"] });
    }
    sync();

    async function run(which) {
      const err = box.querySelector("#auth-error");
      const api = window.EmciixScores;
      if (!api) {
        if (err) { err.textContent = "Auth not ready — wait a second"; err.classList.remove("hidden"); }
        return;
      }
      try {
        if (err) { err.textContent = ""; err.classList.add("hidden"); }
        if (which === "x") await api.signInX();
        else await api.signInGoogle();
      } catch (e) {
        if (err) {
          err.textContent = String((e && e.message) || e || "Sign-in failed");
          err.classList.remove("hidden");
        }
      }
    }
    box.querySelector("#btn-google-signin").addEventListener("click", () => { run("google"); });
    box.querySelector("#btn-x-signin").addEventListener("click", () => { run("x"); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
