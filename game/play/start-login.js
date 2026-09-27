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
        '<button type="button" id="btn-google-signin" class="login-half" aria-label="Google">G</button>' +
        '<button type="button" id="btn-x-signin" class="login-half btn-x" aria-label="X">X</button>' +
      '</div>' +
      '<div class="auth-chip hidden" id="auth-chip">' +
        '<div class="auth-chip-meta">' +
          '<strong id="auth-chip-name">Signed in</strong>' +
          '<span id="auth-points-val">0</span> PTS' +
          '<span class="redeem" id="auth-redeem-val">0 REDEEM</span>' +
        '</div>' +
        '<button type="button" id="btn-redeem" data-redeem class="start-action-btn">REDEEM</button>' +
        '<label class="interac-row">Email<input id="payout-email" type="email" maxlength="80" autocomplete="email" placeholder="name@email.com" /></label>' +
        '<button type="button" id="btn-payout" data-payout class="start-action-btn">PAYOUT</button>' +
        '<button type="button" id="btn-google-signout" class="start-action-btn btn-secondary">LOG OUT</button>' +
      '</div>' +
      '<p class="auth-error hidden" id="auth-error"></p>';
    card.appendChild(box);

    const toggle = box.querySelector("#btn-login-toggle");
    const chip = box.querySelector("#auth-chip");
    toggle.addEventListener("click", () => box.classList.toggle("open"));
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
    box.querySelector("#btn-google-signout").addEventListener("click", async () => {
      const err = box.querySelector("#auth-error");
      const api = window.EmciixScores;
      if (!api || !api.signOutUser) {
        if (err) { err.textContent = "Auth not ready — wait a second"; err.classList.remove("hidden"); }
        return;
      }
      try {
        if (err) { err.textContent = ""; err.classList.add("hidden"); }
        await api.signOutUser();
      } catch (e) {
        if (err) {
          err.textContent = String((e && e.message) || e || "Could not log out");
          err.classList.remove("hidden");
        }
      }
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
