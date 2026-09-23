(function () {
  const USER_KEY = "emciix-local-user";
  const PASS_KEY = "emciix-local-pass";
  const NAME_KEY = "emciix-player-name";

  function readUser() {
    try { return String(localStorage.getItem(USER_KEY) || "").trim(); }
    catch (_) { return ""; }
  }

  async function hashPass(pass) {
    const text = String(pass || "");
    if (!text) return "";
    try {
      const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("emciix:" + text));
      return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
    } catch (_) {
      return "local:" + text.length + ":" + text.slice(0, 1);
    }
  }

  function mount() {
    const card = document.querySelector("#start-overlay .start-main");
    if (!card) return;
    document.querySelectorAll(".session-name").forEach((el) => el.remove());
    const old = document.querySelector(".start-login");
    if (old) old.remove();

    const box = document.createElement("div");
    box.className = "start-login local-only";
    box.innerHTML =
      '<p class="start-login-kicker">LOGIN</p>' +
      '<label class="session-name-label" for="local-user">USERNAME</label>' +
      '<input id="local-user" class="session-name-input" maxlength="24" autocomplete="username" placeholder="Username" />' +
      '<label class="session-name-label" for="local-pass">PASSWORD</label>' +
      '<input id="local-pass" class="session-name-input" type="password" maxlength="64" autocomplete="current-password" placeholder="Password" />' +
      '<button type="button" id="btn-local-login" class="start-action-btn">LOGIN</button>' +
      '<p class="session-name-status" id="local-login-status"></p>' +
      '<div class="auth-signin-row hidden" id="auth-signin-row">' +
        '<button type="button" id="btn-google-signin" class="hidden"></button>' +
        '<button type="button" id="btn-x-signin" class="hidden"></button>' +
      '</div>' +
      '<div class="auth-chip hidden" id="auth-chip">' +
        '<strong id="auth-chip-name"></strong>' +
        '<span id="auth-points-val">0</span>' +
        '<button type="button" id="btn-google-signout" class="hidden"></button>' +
      '</div>' +
      '<p class="auth-error hidden" id="auth-error"></p>';
    card.appendChild(box);

    const userEl = box.querySelector("#local-user");
    const passEl = box.querySelector("#local-pass");
    const status = box.querySelector("#local-login-status");
    userEl.value = readUser();

    async function saveLocal() {
      const user = String(userEl.value || "").trim().slice(0, 24);
      const pass = String(passEl.value || "");
      if (!user || !pass) {
        status.textContent = "Username and password required";
        return;
      }
      const digest = await hashPass(pass);
      try {
        localStorage.setItem(USER_KEY, user);
        localStorage.setItem(PASS_KEY, digest);
        localStorage.setItem(NAME_KEY, user);
      } catch (_) {}
      status.textContent = "Saved on this device · " + user;
      passEl.value = "";
      const pub = window.EmciixPublishNamed || (window.EmciixScores && window.EmciixScores.publishNamedSession);
      if (pub) {
        try {
          const raw = localStorage.getItem("emciix-rhythm-bests");
          const bests = raw ? JSON.parse(raw) : {};
          const pts = Object.values(bests || {}).reduce((s, b) => s + (Number(b && b.score) || 0), 0);
          await pub(user, pts);
        } catch (_) {}
      }
    }

    box.querySelector("#btn-local-login").addEventListener("click", () => {
      saveLocal().catch(console.warn);
    });
    passEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") saveLocal().catch(console.warn);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
