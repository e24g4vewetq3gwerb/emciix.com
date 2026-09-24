document.documentElement.dataset.player = 'Player146';
// Player146: unmute on intentional play; Popular|New flip inside badgestrip
var IDX_KEY = "emciixIdx";
var REPEAT_KEY = "emciix.repeat";
var MUTE_KEY = "emciix.muted";
var repeatOn = false;
var userMuted = false;
try { repeatOn = localStorage.getItem(REPEAT_KEY) === "1"; } catch (e) {}
try { userMuted = localStorage.getItem(MUTE_KEY) === "1"; } catch (e) {}
function setUserMuted(on) {
  userMuted = !!on;
  try { localStorage.setItem(MUTE_KEY, userMuted ? "1" : "0"); } catch (e) {}
}
function wantMuted() { return !!userMuted; }
function forceUnmuteMedia() {
  if (wantMuted()) return;
  try {
    var nv = hero && hero.querySelector("video.native-media");
    if (nv) { nv.muted = false; try { nv.volume = 1; } catch (e0) {} }
  } catch (e1) {}
  try {
    if (ytPlayer) {
      if (ytPlayer.unMute) ytPlayer.unMute();
      if (ytPlayer.setVolume) ytPlayer.setVolume(100);
      if (ytPlayer.isMuted && ytPlayer.isMuted() && ytPlayer.unMute) ytPlayer.unMute();
    }
  } catch (e2) {}
  try {
    var iframe = hero && hero.querySelector("iframe.yt-embed");
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage('{"event":"command","func":"unMute","args":""}', "*");
      iframe.contentWindow.postMessage('{"event":"command","func":"setVolume","args":[100]}', "*");
    }
  } catch (e3) {}
}
var YT_CHANNEL_ID = "UCt8dYnrvcrZSCx9uS0aLBSQ";
var bootReady = false;
var ytPlayer = null;
var ytApiReady = false;
var ytApiLoading = false;
var pendingFullStart = null;
function repeatIconSvg(){
  return '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M7 6h8V3l5 4-5 4V8H7a3 3 0 0 0-3 3v2H2v-2a5 5 0 0 1 5-5zm10 12H9v3l-5-4 5-4v3h8a3 3 0 0 0 3-3v-2h2v2a5 5 0 0 1-5 5z"/><text x="12" y="14.5" text-anchor="middle" font-size="8" font-family="ui-sans-serif,system-ui,sans-serif" font-weight="700" fill="currentColor">1</text></svg>';
}
function gameItHtml(){
  return '<button class="playgame repeat' + (repeatOn ? ' on' : '') + '" id="repeat" type="button" aria-pressed="' + (repeatOn ? 'true' : 'false') + '" aria-label="' + (repeatOn ? 'Repeat one on' : 'Repeat one off') + '" title="' + (repeatOn ? 'Repeat one on' : 'Repeat one') + '">' + repeatIconSvg() + '</button>';
}
var SONGS = [
  ["RFqKvFDB0Hg","I JUST UPDATE"],
  ["oq1c9I9T_tw","Which phone is it? iPhone or Android"],
  ["53Jny0alg9g","Still here"],
  ["9-nGIe8mQ0M","Wake you up Avicii"],
  ["Id4HSb9j8RA","You're Not Alone"],
  ["R7BunIbGheI","One More Light On"],
  ["NgEug_9qIxU","IDK What I'm Doing"],
  ["pHMXzHDwOgU","Not Alone"],
  ["m6cxgKh5QgE","Grid Run"],
  ["qZZuGfqancc","Solar System Party"],
  ["KhGqJCTO1Hc","Come Closer"],
  ["MP9AIxzx55o","Everybody But Me"],
  ["txA5vV_9XG4","Unemployed in Love"],
  ["dG8z3nQeDSI","Need Hired by Me."],
  ["jP2Cm_5ZOJs","One Exception"],
  ["05AgmKvd3NI","Make up shit"],
  ["WB04SHeEHts","One"],
  ["vnNP4BaMxvo","Retire"],
  ["7hnVjQgSiWM","Dale Play It"],
  ["Qq-D17G4L_o","Which Device Is That"],
  ["3Js245_1l3o","SEVEN DAYS WAITIN"],
  ["no-room-for-me","No Room for Me"]
].map(function(p){ return {id:p[0], title:p[1]}; });
var NEED = {
  repo: "https://github.com/e24g4vewetq3gwerb/Need",
  web: "https://cue-508120.web.app",
  git: "934e350",
  android: "1.0.1",
  ios: "1.0.1",
  bundle: "com.emcii.need"
};
var DRIVE_MAP = {
  "05AgmKvd3NI": { title: "Make up shit", driveId: null, src: "/media/make-up-shit.mp4", source: "yt-dlp" },
  "txA5vV_9XG4": { title: "Unemployed in Love", driveId: "1TODHr-wBd750aziOP9npnDygWD2YD0q3", src: "/media/unemployed-in-love.mp4", source: "drive" },
  "MP9AIxzx55o": { title: "Everybody But Me", driveId: "1aNUO8Ek2famuDx4bhqa74iWiPxnbNUXj", src: "/media/everybody-but-me.mp4", source: "drive" },
  "RFqKvFDB0Hg": { title: "I JUST UPDATE", driveId: "1tEura8vNcKqvkdrh_Gevmq858sYaTPkF", src: "/media/i-just-update.mp4", source: "drive" },
  "Id4HSb9j8RA": { title: "You're Not Alone", driveId: null, src: "/media/youre-not-alone.mp4", source: "local" },
  "no-room-for-me": { title: "No Room for Me", driveId: null, src: "/video/no-room-for-me.mp4?cut=2", source: "local" }
};
var driveMapReady = true;
function loadDriveMap() {
  return fetch("/media/drive-map.json", { cache: "no-store" })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (data) {
      if (data && typeof data === "object") {
        DRIVE_MAP = data;
      }
      driveMapReady = true;
      return DRIVE_MAP;
    })
    .catch(function () {
      driveMapReady = true;
      return DRIVE_MAP;
    });
}
function mediaEntryFor(song) {
  if (!song || !DRIVE_MAP) return null;
  var entry = DRIVE_MAP[song.id];
  if (entry && entry.src) return entry;
  var title = song.title;
  if (title) {
    for (var k in DRIVE_MAP) {
      if (!Object.prototype.hasOwnProperty.call(DRIVE_MAP, k)) continue;
      var e = DRIVE_MAP[k];
      if (e && e.title === title && e.src) return e;
    }
  }
  return null;
}
function destroyNativeVideo() {
  if (!hero) return;
  var vids = hero.querySelectorAll("video.native-media");
  for (var i = 0; i < vids.length; i++) {
    try { vids[i].pause(); } catch (e) {}
    try {
      vids[i].removeAttribute("src");
      vids[i].load();
    } catch (e2) {}
  }
}
var hero = document.getElementById("hero");
var grid = document.getElementById("grid");
var status = document.getElementById("status");
var idx = 0, tick = null, embedEpoch = 0;
try {
  var saved = parseInt(localStorage.getItem(IDX_KEY), 10);
  if (saved >= 0 && saved < SONGS.length) idx = saved;
} catch (e) {}
var COVER = {
  "05AgmKvd3NI": "/covers/make-up-shit.jpg?v=Player110",
  "MP9AIxzx55o": "/covers/everybody-but-me.jpg?v=Player110",
  "RFqKvFDB0Hg": "/covers/i-just-update.jpg?v=Player110",
  "o040u9wAZns": "/covers/two-phones.jpg?v=Player110",
  "no-room-for-me": "/covers/no-room-for-me.jpg"
};
function thumb(id){ return COVER[id] || ("https://i.ytimg.com/vi/" + id + "/hqdefault.jpg"); }
function esc(s){
  return String(s).replace(/[&<>"']/g, function(c){
    if (c === "&") return "&#38;";
    if (c === "<") return "&#60;";
    if (c === ">") return "&#62;";
    if (c === '"') return "&#34;";
    return "&#39;";
  });
}
function pad(n){ return (n < 10 ? "0" : "") + n; }
function fmtTime(sec){
  sec = Math.max(0, Math.floor(Number(sec) || 0));
  var m = Math.floor(sec / 60);
  var s = sec % 60;
  return m + ":" + pad(s);
}
function setClock(elapsed, duration){
  var clock = document.getElementById("clock");
  if (!clock) return;
  var right = (duration == null || !isFinite(duration)) ? "--:--" : fmtTime(duration);
  clock.textContent = fmtTime(elapsed) + " / " + right;
}
function setBar(pct){
  var bar = document.getElementById("bar");
  if (!bar) return;
  var w = Math.max(0, Math.min(100, Number(pct) || 0));
  bar.style.width = w + "%";
}
var deepLinkLocked = false;
var USER_PICKED_KEY = "emciix.userPicked";
function markUserPicked() {
  try { sessionStorage.setItem(USER_PICKED_KEY, "1"); } catch (e) {}
}
function userPicked() {
  try { return sessionStorage.getItem(USER_PICKED_KEY) === "1"; } catch (e) { return false; }
}
var HERO_MODE_KEY = "emciix.heroMode";
var heroMode = "popular";
var recencyIds = SONGS.map(function (t) { return t.id; });
try {
  var savedMode = localStorage.getItem(HERO_MODE_KEY);
  heroMode = "popular";
  localStorage.setItem(HERO_MODE_KEY, heroMode);
} catch (e) {}
function normalizeHeroMode(mode) {
  return "popular";
}
function captureRecencyOrder() {
  recencyIds = SONGS.map(function (t) { return t && t.id; }).filter(Boolean);
}
function bumpRecencyId(id) {
  if (!id) return;
  id = String(id);
  if (!recencyIds) recencyIds = [];
  var rest = [];
  for (var i = 0; i < recencyIds.length; i++) {
    if (recencyIds[i] !== id) rest.push(recencyIds[i]);
  }
  recencyIds = [id].concat(rest);
}
function viewCountOf(id) {
  var views = getViewCounts() || {};
  var n = Number(views[id]);
  return isFinite(n) ? n : -1;
}
function applyCatalogOrder(opts) {
  opts = opts || {};
  if (!SONGS || !SONGS.length) return false;
  var keepId = SONGS[idx] ? SONGS[idx].id : null;
  if (!recencyIds || !recencyIds.length) captureRecencyOrder();
  // Keep recency list in sync with catalog membership
  var idSet = Object.create(null);
  for (var i = 0; i < SONGS.length; i++) {
    if (SONGS[i] && SONGS[i].id) idSet[SONGS[i].id] = true;
  }
  var nextRec = [];
  for (var r = 0; r < recencyIds.length; r++) {
    if (idSet[recencyIds[r]]) nextRec.push(recencyIds[r]);
  }
  for (var j = 0; j < SONGS.length; j++) {
    var sid = SONGS[j] && SONGS[j].id;
    if (sid && nextRec.indexOf(sid) < 0) nextRec.push(sid);
  }
  recencyIds = nextRec;
  if (heroMode === "popular") {
    SONGS.sort(function (a, b) {
      var vb = viewCountOf(b && b.id);
      var va = viewCountOf(a && a.id);
      if (vb !== va) return vb - va;
      var ia = recencyIds.indexOf(a && a.id);
      var ib = recencyIds.indexOf(b && b.id);
      if (ia < 0) ia = 99999;
      if (ib < 0) ib = 99999;
      return ia - ib;
    });
  } else {
    SONGS.sort(function (a, b) {
      var ia = recencyIds.indexOf(a && a.id);
      var ib = recencyIds.indexOf(b && b.id);
      if (ia < 0) ia = 99999;
      if (ib < 0) ib = 99999;
      return ia - ib;
    });
  }
  if (keepId) {
    var found = -1;
    for (var k = 0; k < SONGS.length; k++) {
      if (SONGS[k] && SONGS[k].id === keepId) { found = k; break; }
    }
    idx = found >= 0 ? found : 0;
  } else {
    idx = 0;
  }
  try { localStorage.setItem(IDX_KEY, String(idx)); } catch (e) {}
  if (opts.rebuild !== false) rebuildGrid();
  return true;
}
try { window.EmciixApplyCatalogOrder = applyCatalogOrder; } catch (e) {}
function setHeroMode(mode, opts) {
  opts = opts || {};
  var next = normalizeHeroMode(mode);
  var changed = next !== heroMode;
  heroMode = next;
  try { localStorage.setItem(HERO_MODE_KEY, heroMode); } catch (e) {}
  updateLiveModeHint();
  if (opts.user) markUserPicked();
  if (opts.apply === false) return heroMode;
  var wasPlaying = isPlayingNow();
  applyCatalogOrder({ rebuild: true });
  // Playing without jump: keep current track, refresh HUD only
  if (wasPlaying && !opts.jump) {
    paint({ soft: true, animate: false });
    syncModeSwitchUi();
    return heroMode;
  }
  var restartIfNeeded = function () {
    if (!(wasPlaying && opts.jump)) return;
    setTimeout(function () { start(); }, reduceMotion() ? 0 : FADE_MS);
  };
  var doApply = function () {
    if (heroMode === "new") {
      // Prefer newest (recency head) unless user already picked a track this session
      if (!userPicked() || opts.jump) {
        idx = 0;
        try { localStorage.setItem(IDX_KEY, String(idx)); } catch (e) {}
      }
      // Full paint on jump so title/idx/media remount; soft otherwise
      paint({ animate: opts.animate !== false, soft: !opts.jump });
      if (status && !wasPlaying) status.textContent = "Songs";
      restartIfNeeded();
      // Still try to pull a fresher latest into catalog
      withTimeout(fetchLatestTrack(), 7000)
        .then(function (track) {
          if (!track || !track.id) return;
          try { window.EmciixLatestId = track.id; } catch (e) {}
          ensureLatestInCatalog(track);
          applyCatalogOrder({ rebuild: true });
          if (opts.jump || !userPicked()) {
            idx = 0;
            try { localStorage.setItem(IDX_KEY, String(idx)); } catch (e) {}
          }
          // Soft HUD refresh after catalog sync (media already remounted on jump)
          paint({ soft: true, animate: false });
        })
        .catch(function () {});
      return;
    }
    withTimeout(fetchViewsMap(), 12000)
      .then(function (views) {
        applyCatalogOrder({ rebuild: true });
        if (!userPicked() || opts.jump) applyMostPopularTrack(views || getViewCounts());
        paint({ animate: opts.animate !== false, soft: !opts.jump });
        if (status && !wasPlaying) status.textContent = "Songs";
        restartIfNeeded();
      })
      .catch(function () {
        applyCatalogOrder({ rebuild: true });
        if (!userPicked() || opts.jump) applyMostPopularTrack(getViewCounts());
        paint({ animate: opts.animate !== false, soft: !opts.jump });
        if (status && !wasPlaying) status.textContent = "Songs";
        restartIfNeeded();
      });
  };
  if (opts.animate === false || reduceMotion() || !changed) doApply();
  else requestAnimationFrame(function () { requestAnimationFrame(doApply); });
  return heroMode;
}
function toggleHeroMode(opts) {
  return setHeroMode(heroMode === "new" ? "popular" : "new", opts);
}
function updateLiveModeHint() {
  syncModeSwitchUi();
  var latest = document.getElementById("modeNew") || document.getElementById("modeLatest");
  var popular = document.getElementById("modePopular");
  if (latest) {
    latest.classList.toggle("is-on", heroMode === "new");
    if (latest.hasAttribute("aria-pressed")) latest.setAttribute("aria-pressed", heroMode === "new" ? "true" : "false");
  }
  if (popular) {
    popular.classList.toggle("is-on", heroMode === "popular");
    if (popular.hasAttribute("aria-pressed")) popular.setAttribute("aria-pressed", heroMode === "popular" ? "true" : "false");
  }
  var pill = document.getElementById("liveSite");
  if (pill) {
    pill.setAttribute("aria-label", "Listeners live on the site");
    pill.setAttribute("title", "Listeners on the site right now");
  }
}
function applyHeroMode(opts) {
  opts = opts || {};
  return setHeroMode(heroMode, Object.assign({}, opts, { force: true, apply: true }));
}
window.EmciixSetHeroMode = setHeroMode;
window.EmciixToggleHeroMode = toggleHeroMode;
function ytUrl(id){
  if (id === "no-room-for-me") return "/video/no-room";
  return "https://www.youtube.com/watch?v=" + id;
}
function ytLinkSvg(){
  return '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M23.5 6.2a3.1 3.1 0 0 0-2.2-2.2C19.4 3.5 12 3.5 12 3.5s-7.4 0-9.3.5A3.1 3.1 0 0 0 .5 6.2 32.4 32.4 0 0 0 0 12a32.4 32.4 0 0 0 .5 5.8 3.1 3.1 0 0 0 2.2 2.2c1.9.5 9.3.5 9.3.5s7.4 0 9.3-.5a3.1 3.1 0 0 0 2.2-2.2A32.4 32.4 0 0 0 24 12a32.4 32.4 0 0 0-.5-5.8zM9.75 15.5v-7l6.2 3.5-6.2 3.5z"/></svg>';
}
function cardHtml(s, i, playing) {
  return (
    '<article class="card' + (playing ? " playing" : "") + '" data-i="' + i + '" data-id="' + esc(s.id) + '"' +
    (playing ? ' aria-current="true"' : ' aria-current="false"') + ">" +
    '<span class="n">' + pad(i + 1) + "</span>" +
    '<span class="nowbadge">NOW</span>' +
    '<a class="ytlink" href="' + ytUrl(s.id) + '" target="_blank" rel="noopener" aria-label="Open on YouTube" title="Open on YouTube">' + ytLinkSvg() + "</a>" +
    '<div class="thumbwrap"><img alt="" src="' + thumb(s.id) + '"><span class="playchip">PLAY</span></div>' +
    "<p>" + esc(s.title) + "</p></article>"
  );
}
function syncUrl() {
  try {
    var url = new URL(location.href);
    var hashIsTrack = url.hash && /^#t=\d+/i.test(url.hash);
    if (!url.searchParams.has("v") && !hashIsTrack) return;
    url.searchParams.delete("v");
    if (hashIsTrack) url.hash = "";
    var next = url.pathname + (url.search || "") + (url.hash || "");
    if (next !== location.pathname + location.search + location.hash) {
      history.replaceState({ i: idx }, "", next || "/");
    }
  } catch (e) {}
}
function parseDeepLink() {
  try {
    var hash = location.hash || "";
    var m = hash.match(/^#t=(\d+)/i);
    if (m) {
      var n = parseInt(m[1], 10);
      if (n >= 1 && n <= SONGS.length) {
        idx = n - 1;
        deepLinkLocked = true;
        return true;
      }
      if (n >= 0 && n < SONGS.length) {
        idx = n;
        deepLinkLocked = true;
        return true;
      }
    }
    var params = new URLSearchParams(location.search || "");
    var vid = params.get("v");
    if (vid) {
      for (var i = 0; i < SONGS.length; i++) {
        if (SONGS[i].id === vid) {
          idx = i;
          // ?v= paints initially but does not lock out latest unless user picked
          return true;
        }
      }
    }
  } catch (e) {}
  return false;
}
function shuffleTrack() {
  markUserPicked();
  if (SONGS.length < 2) {
    start();
    return;
  }
  var next = idx;
  var guard = 0;
  while (next === idx && guard++ < 40) {
    next = Math.floor(Math.random() * SONGS.length);
  }
  idx = next;
  paint({ animate: true });
  window.scrollTo({ top: 0, behavior: "smooth" });
  setTimeout(function () { start(); }, reduceMotion() ? 0 : FADE_MS);
}
window.EmciixShuffle = shuffleTrack;
function playTrackById(id) {
  if (!id || !SONGS || !SONGS.length) return;
  var found = -1;
  for (var i = 0; i < SONGS.length; i++) {
    if (SONGS[i] && SONGS[i].id === id) { found = i; break; }
  }
  if (found < 0) return;
  markUserPicked();
  idx = found;
  paint({ animate: true });
  syncUrl();
  var heroEl = document.getElementById("hero");
  if (heroEl && heroEl.scrollIntoView) {
    try { heroEl.scrollIntoView({ behavior: "smooth", block: "start" }); }
    catch (e) { window.scrollTo({ top: 0, behavior: "smooth" }); }
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  setTimeout(function () { start(); }, reduceMotion() ? 0 : FADE_MS);
}
window.EmciixPlayTrack = playTrackById;
function stop(){ if (tick) { clearInterval(tick); tick = null; } if (status) status.textContent = "Songs"; }
var ytApiPollId = null;
function clearYtApiPoll() {
  if (ytApiPollId != null) {
    clearInterval(ytApiPollId);
    ytApiPollId = null;
  }
}
function destroyYtPlayer(opts) {
  opts = opts || {};
  // Mid-mount teardown must not wipe a freshly-set pendingFullStart.
  if (opts.clearPending !== false) {
    pendingFullStart = null;
    clearYtApiPoll();
  }
  if (!ytPlayer) return;
  try { if (ytPlayer.stopVideo) ytPlayer.stopVideo(); } catch (e) {}
  try { if (ytPlayer.destroy) ytPlayer.destroy(); } catch (e) {}
  ytPlayer = null;
}
function loadYtApi() {
  if (ytApiReady || (window.YT && window.YT.Player)) {
    ytApiReady = true;
    return;
  }
  if (ytApiLoading) return;
  ytApiLoading = true;
  var prev = window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady = function () {
    ytApiReady = true;
    ytApiLoading = false;
    if (typeof prev === "function") {
      try { prev(); } catch (e) {}
    }
    if (pendingFullStart) {
      var fn = pendingFullStart;
      pendingFullStart = null;
      try { fn(); } catch (e) {}
    }
  };
  var tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  var first = document.getElementsByTagName("script")[0];
  if (first && first.parentNode) first.parentNode.insertBefore(tag, first);
  else document.head.appendChild(tag);
}
function onYtStateChange(e) {
  if (!e || typeof YT === "undefined" || e.data !== YT.PlayerState.ENDED) return;
  if (repeatOn) {
    // Native loop (playerVars) usually prevents ENDED. Backup for iOS/desktop:
    // seekTo+play is often blocked without a gesture; reload the video id instead.
    try {
      var rid = SONGS[idx] && SONGS[idx].id;
      if (ytPlayer && rid && ytPlayer.loadVideoById) {
        ytPlayer.loadVideoById(rid);
      }
      if (ytPlayer && ytPlayer.playVideo) ytPlayer.playVideo();
    } catch (err) {}
    return;
  }
  markUserPicked();
  idx = (idx + 1) % SONGS.length;
  paint({ animate: true });
  setTimeout(function () { start(); }, reduceMotion() ? 0 : FADE_MS);
}
function paintNeed() {
  var a = document.getElementById("needAndroid");
  var i = document.getElementById("needIos");
  var w = document.getElementById("needWeb");
  var g = document.getElementById("needGit");
  if (a) a.textContent = "Android " + NEED.android;
  if (i) i.textContent = "iOS " + NEED.ios;
  if (w) w.textContent = "Web git " + NEED.git;
  if (g) g.textContent = NEED.git;
}
var FADE_MS = 420;
var fading = false;
function reduceMotion() {
  try { return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; }
}
function updateShelfPlayingState() {
  if (!grid) return;
  var cards = grid.querySelectorAll(".card");
  for (var i = 0; i < cards.length; i++) {
    var di = +cards[i].getAttribute("data-i");
    var on = di === idx;
    cards[i].classList.toggle("playing", on);
    cards[i].setAttribute("aria-current", on ? "true" : "false");
  }
}
function paintStageOnly() {
  var v = SONGS[idx];
  if (!v || !hero) return false;
  var stage = hero.querySelector(".stage");
  var titleEl = hero.querySelector(".side-head-main h2");
  var hudIdx = hero.querySelector(".kicker-idx");
  var stageHud = hero.querySelector(".stagehud");
  if (!stage || !titleEl) return false;
  // Player146: never wipe an active YouTube/native play with a soft re-paint
  if (hero.classList.contains("is-playing") || stage.classList.contains("is-playing")) {
    if (titleEl) titleEl.textContent = v.title;
    if (hudIdx) hudIdx.textContent = heroKickerIdx();
    if (stageHud) stageHud.textContent = heroKickerIdx();
    syncModeSwitchUi();
    updateShelfPlayingState();
    syncUrl();
    if (window.EmciixPaintYtViews) try { window.EmciixPaintYtViews(); } catch (e) {}
    return true;
  }
  stop();
  destroyYtPlayer();
  destroyNativeVideo();
  try { localStorage.setItem(IDX_KEY, String(idx)); } catch (e) {}
  hero.classList.remove("is-playing");
  var stageTitleHtml = "";
  stage.innerHTML =
    '<span class="stagehud" aria-hidden="true">' +
    pad(idx + 1) +
    " / " +
    pad(SONGS.length) +
    "</span>" +
    '<img alt="" src="' +
    thumb(v.id) +
    '">' +
    stageTitleHtml +
    '<button class="go" id="play" type="button" aria-label="Play"><b>PLAY</b></button>';
  titleEl.textContent = v.title;
  if (hudIdx) hudIdx.textContent = heroKickerIdx();
  var clock = document.getElementById("clock");
  if (clock) clock.textContent = "0:00 / --:--";
  var bar = document.getElementById("bar");
  if (bar) bar.style.width = "0%";
  var playBtn = document.getElementById("play");
  if (playBtn) {
    playBtn.onclick = function (e) {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      start();
    };
  }
  if (stage && !stage.dataset.playBound) {
    stage.dataset.playBound = "1";
    stage.addEventListener("click", function (e) {
      if (stage.classList.contains("is-playing") && stage.querySelector("video.native-media, iframe.yt-embed")) return;
      if (e.target && e.target.closest && e.target.closest("video, iframe, a, button.b")) return;
      e.preventDefault();
      start();
    });
  }
  syncModeSwitchUi();
  updateShelfPlayingState();
  syncUrl();
  if (window.EmciixPaintSongLives) try { window.EmciixPaintSongLives(); } catch (e) {}
  if (window.EmciixPaintYtViews) try { window.EmciixPaintYtViews(); } catch (e) {}
  if (window.EmciixShelfRefresh) try { window.EmciixShelfRefresh(); } catch (e) {}
  return true;
}
function paintNow() {
  var v = SONGS[idx]; if (!v || !hero) return;
  stop();
  destroyYtPlayer();
  destroyNativeVideo();
  try { localStorage.setItem(IDX_KEY, String(idx)); } catch (e) {}
  hero.classList.remove("is-playing");
  var stageTitleHtml = "";
  hero.innerHTML =
    '<div class="stage"><span class="stagehud" aria-hidden="true">' + pad(idx+1) + ' / ' + pad(SONGS.length) + '</span>' +
    '<img alt="" src="' + thumb(v.id) + '">' +
    stageTitleHtml +
    '<button class="go" id="play" type="button" aria-label="Play"><b>PLAY</b></button></div>' +
    '<div class="side"><div class="side-head">' +
    '<div class="side-head-main">' +
    '<h2>' + esc(v.title) + '</h2>' +
    '<div class="badgestrip">' +
    '<div id="ytViews" class="ytviews-wrap"></div>' +
    '<span id="songLive" class="liveui hero-live" hidden aria-live="polite"><i aria-hidden="true"></i><span class="lnum">0</span></span>' +
    heroModeTabsHtml() +
    '</div>' +
    '</div>' +
    gameItHtml() +
    '</div>' +
    '<div class="side-prog">' +
    '<div class="bar"><i id="bar"></i></div>' +
    '</div>' +
    '<div class="metarow">' +
    '<p class="meta" id="clock">0:00 / --:--</p>' +
    '<span class="kicker-idx" aria-hidden="true">' + heroKickerIdx() + '</span>' +
    '<div class="eq" aria-hidden="true"><span></span><span></span><span></span><span></span></div>' +
    '</div>' +
    '<div class="row" role="group" aria-label="Playback controls">' +
    '<button class="b prev" id="transportPlay" type="button">Play</button>' +
    '<button class="b skip" id="transportChange" type="button">Change</button>' +
    '<a class="playlist-pill" href="https://music.youtube.com/playlist?list=PLZX_2WN1sEAg&si=b3Qk9UDjSFimkQcF" target="_blank" rel="noopener">Playlist</a></div></div>';
  bind();
  if (window.EmciixPaintSongLives) try { window.EmciixPaintSongLives(); } catch (e) {}
  if (window.EmciixPaintYtViews) try { window.EmciixPaintYtViews(); } catch (e) {}
  updateShelfPlayingState();
  syncUrl();
  if (window.EmciixShelfRefresh) try { window.EmciixShelfRefresh(); } catch (e) {}
  syncHeroPopularBadge();
}
function paint(opts) {
  opts = opts || {};
  var animate = !!opts.animate && !reduceMotion();
  var soft = !!opts.soft;
  if (!hero) return;
  if (soft && hero.querySelector(".stage") && hero.querySelector(".side-head-main h2")) {
    var stage = hero.querySelector(".stage");
    if (!animate || fading) {
      paintStageOnly();
      return;
    }
    fading = true;
    stage.classList.add("is-fading");
    hero.classList.remove("is-fading");
    setTimeout(function () {
      paintStageOnly();
      void stage.offsetWidth;
      requestAnimationFrame(function () {
        stage.classList.remove("is-fading");
        fading = false;
      });
    }, FADE_MS);
    return;
  }
  if (!animate || !hero.innerHTML || fading) {
    paintNow();
    if (animate) {
      hero.classList.add("is-fading");
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { hero.classList.remove("is-fading"); });
      });
    }
    return;
  }
  fading = true;
  hero.classList.add("is-fading");
  setTimeout(function () {
    paintNow();
    void hero.offsetWidth;
    requestAnimationFrame(function () {
      hero.classList.remove("is-fading");
      fading = false;
    });
  }, FADE_MS);
}
function ensureEmbedListen() {
  if (embedListenBound) return;
  embedListenBound = true;
  window.addEventListener("message", function (e) {
    if (!e || !e.origin) return;
    if (e.origin.indexOf("youtube.com") === -1 && e.origin.indexOf("youtube-nocookie.com") === -1) return;
    var data = e.data;
    if (typeof data === "string") {
      try { data = JSON.parse(data); } catch (err) { return; }
    }
    if (!data || data.event !== "onStateChange") return;
    var info = data.info;
    if (info !== 0 && info !== "0") return;
    // YouTube ENDED — plain iframe path (no YT.Player). Ignore stale embeds.
    if (!hero || !hero.classList.contains("is-playing")) return;
    var epoch = embedEpoch;
    if (repeatOn) {
      start();
    } else {
      markUserPicked();
      idx = (idx + 1) % SONGS.length;
      paint({ animate: true });
      setTimeout(function () {
        if (epoch !== embedEpoch) return;
        start();
      }, reduceMotion() ? 0 : 380);
    }
  });
}
function wireEmbedIframe(stage) {
  ensureEmbedListen();
  var iframe = stage && stage.querySelector("iframe");
  if (!iframe) return;
  var sendListen = function () {
    try {
      if (iframe.contentWindow) {
        iframe.contentWindow.postMessage(JSON.stringify({ event: "listening", id: "emciix" }), "*");
      }
    } catch (e) {}
  };
  iframe.addEventListener("load", sendListen);
  setTimeout(sendListen, 400);
  setTimeout(sendListen, 1200);
}
function startNative(entry, v) {
  var stage = hero.querySelector(".stage");
  if (!stage || !entry || !entry.src) return;
  destroyYtPlayer();
  if (tick) { clearInterval(tick); tick = null; }
  destroyNativeVideo();
  var epoch = embedEpoch;
  var fellBack = false;
  function fallbackYt() {
    if (fellBack || epoch !== embedEpoch) return;
    fellBack = true;
    startYouTube(v, stage, epoch);
  }
  if (hero) hero.classList.add("is-playing");
  stage.classList.add("is-playing");
  // Build via DOM (keeps user-gesture → play() chain on Safari/Chrome)
  stage.textContent = "";
  var hud = document.createElement("span");
  hud.className = "stagehud";
  hud.setAttribute("aria-hidden", "true");
  hud.textContent = pad(idx + 1) + " / " + pad(SONGS.length);
  var video = document.createElement("video");
  video.className = "native-media";
  video.setAttribute("controls", "");
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
  video.setAttribute("preload", "auto");
  video.setAttribute("title", v.title || "");
  if (repeatOn) video.loop = true;
  video.src = entry.src;
  video.muted = wantMuted();
  try { if (!wantMuted()) video.volume = 1; } catch (eVol) {}
  stage.appendChild(hud);
  stage.appendChild(video);
  if (status) status.textContent = "Starting…";
  setClock(0, null);
  setBar(0);
  function syncFromVideo() {
    if (epoch !== embedEpoch || !video || fellBack) return;
    var ct = video.currentTime || 0;
    var dur = video.duration;
    var d = (isFinite(dur) && dur > 0) ? dur : null;
    setClock(ct, d);
    if (d) setBar((ct / d) * 100);
    else setBar(Math.min(95, (ct / 210) * 100));
  }
  video.addEventListener("error", function () { fallbackYt(); });
  video.addEventListener("stalled", function () {
    setTimeout(function () {
      if (epoch !== embedEpoch || fellBack) return;
      try {
        if (video.readyState < 2 && (!video.currentTime || video.currentTime < 0.05)) fallbackYt();
      } catch (e) { fallbackYt(); }
    }, 2500);
  });
  video.addEventListener("timeupdate", syncFromVideo);
  video.addEventListener("loadedmetadata", syncFromVideo);
  video.addEventListener("ended", function () {
    if (epoch !== embedEpoch || fellBack) return;
    if (repeatOn) {
      try { video.currentTime = 0; video.play(); } catch (e) {}
      return;
    }
    markUserPicked();
    idx = (idx + 1) % SONGS.length;
    paint({ animate: true });
    setTimeout(function () {
      if (epoch !== embedEpoch) return;
      start();
    }, reduceMotion() ? 0 : FADE_MS);
  });
  var p = null;
  try { p = video.play(); } catch (e) { p = null; }
  if (p && typeof p.then === "function") {
    p.then(function () {
      if (status) status.textContent = repeatOn ? "Playing (repeat on)." : "Playing on this page.";
    }).catch(function () {
      try {
        // Autoplay policy fallback: start muted then unmute after play if user wants sound
        video.muted = true;
        var p2 = video.play();
        if (p2 && p2.then) {
          p2.then(function () {
            if (!wantMuted()) {
              try { video.muted = false; video.volume = 1; } catch (e2) {}
            }
            if (status) status.textContent = repeatOn ? "Playing (repeat on)." : "Playing on this page.";
          }).catch(function () {
            if (status) status.textContent = "Tap the video controls to play.";
          });
        }
      } catch (e3) {
        if (status) status.textContent = "Tap the video controls to play.";
      }
    });
  } else if (status) {
    status.textContent = repeatOn ? "Playing (repeat on)." : "Playing on this page.";
  }
  tick = setInterval(syncFromVideo, 250);
}
function startYouTube(v, stage, epoch) {
  if (!v || !stage) return;
  if (epoch != null && !isNaN(epoch) && epoch !== embedEpoch) return;
  destroyNativeVideo();
  if (tick) { clearInterval(tick); tick = null; }
  var origin = "";
  try { origin = encodeURIComponent(location.origin || ""); } catch (e) {}
  // Player146: intentional play (stage/Space/PLAY) → start unmuted unless user muted.
  // Earlier mute=1 + later unMute often never fired (API late / outside gesture).
  var startMuted = wantMuted();
  var qs = "?rel=0&modestbranding=1&playsinline=1&autoplay=1&enablejsapi=1&mute=" + (startMuted ? "1" : "0");
  if (origin) qs += "&origin=" + origin;
  if (repeatOn) qs += "&loop=1&playlist=" + encodeURIComponent(v.id);
  if (hero) hero.classList.add("is-playing");
  stage.classList.add("is-playing");
  stage.textContent = "";
  var hud = document.createElement("span");
  hud.className = "stagehud";
  hud.setAttribute("aria-hidden", "true");
  hud.textContent = pad(idx + 1) + " / " + pad(SONGS.length);
  var iframe = document.createElement("iframe");
  iframe.className = "yt-embed";
  iframe.id = "ytEmbed";
  iframe.src = "https://www.youtube.com/embed/" + encodeURIComponent(v.id) + qs;
  iframe.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share");
  iframe.setAttribute("allowfullscreen", "");
  iframe.setAttribute("referrerpolicy", "origin");
  iframe.title = v.title || "";
  stage.appendChild(hud);
  stage.appendChild(iframe);
  wireEmbedIframe(stage);
  // Best-effort unmute while still in gesture stack
  setTimeout(function () { if (epoch === embedEpoch) forceUnmuteMedia(); }, 0);
  setTimeout(function () { if (epoch === embedEpoch) forceUnmuteMedia(); }, 400);
  setTimeout(function () { if (epoch === embedEpoch) forceUnmuteMedia(); }, 1200);
  try {
    loadYtApi();
    function attachPlayer(el) {
      if (!el || !(window.YT && window.YT.Player)) return false;
      try {
        ytPlayer = new YT.Player(el, {
          events: {
            onReady: function (e) {
              if (epoch !== embedEpoch) return;
              try {
                if (!wantMuted()) {
                  e.target.unMute();
                  if (e.target.setVolume) e.target.setVolume(100);
                }
              } catch (err) {}
              try { e.target.playVideo(); } catch (err2) {}
              forceUnmuteMedia();
            },
            onStateChange: function (e) {
              if (epoch === embedEpoch && e && typeof YT !== "undefined" && e.data === YT.PlayerState.PLAYING) {
                forceUnmuteMedia();
              }
              onYtStateChange(e);
            }
          }
        });
        return true;
      } catch (err3) { return false; }
    }
    if (!attachPlayer(iframe)) {
      pendingFullStart = function () {
        if (epoch !== embedEpoch) return;
        var el = hero && hero.querySelector("iframe.yt-embed");
        attachPlayer(el);
      };
    }
  } catch (err5) {}
  if (status) status.textContent = repeatOn ? "Playing (repeat on)." : "Playing on this page.";
  setClock(0, null);
  setBar(0);
  var t0 = Date.now();
  var fullDur = null;
  tick = setInterval(function () {
    var s = (Date.now() - t0) / 1000;
    if (ytPlayer && ytPlayer.getCurrentTime && ytPlayer.getDuration) {
      try {
        var ct = ytPlayer.getCurrentTime();
        var dur = ytPlayer.getDuration();
        if (isFinite(ct) && ct >= 0) s = ct;
        if (isFinite(dur) && dur > 0) fullDur = dur;
      } catch (e) {}
    }
    setClock(s, fullDur);
    if (fullDur && fullDur > 0) setBar((s / fullDur) * 100);
    else setBar(Math.min(95, (s / 210) * 100));
  }, 250);
}
function start() {
  try { hero = document.getElementById("hero") || hero; } catch (e) {}
  if (!hero) return;
  var v = SONGS[idx];
  if (!v || !v.id) return;
  try {
    if (window.EmciixLiveApi && typeof window.EmciixLiveApi.setSong === "function") {
      window.EmciixLiveApi.setSong(v.id);
    }
  } catch (e) {}
  var stage = hero.querySelector(".stage");
  if (!stage) return;
  // Always remount — never get stuck on a dead is-playing state
  markUserPicked();
  destroyYtPlayer({ clearPending: true });
  stop();
  destroyNativeVideo();
  try {
    hero.classList.remove("is-playing");
    stage.classList.remove("is-playing");
  } catch (e) {}
  embedEpoch++;
  var entry = null;
  try { entry = mediaEntryFor(v); } catch (e) { entry = null; }
  if (status) status.textContent = "Starting…";
  if (entry && entry.src) {
    startNative({
      title: entry.title,
      driveId: entry.driveId,
      src: entry.src + (entry.src.indexOf("?") >= 0 ? "&" : "?") + "v=Player146",
      source: entry.source
    }, v);
    return;
  }
  startYouTube(v, stage, embedEpoch);
}

window.EmciixStart = start;
function bindGrid() {
  if (!grid) return;
  grid.querySelectorAll(".card").forEach(function (el) {
    var link = el.querySelector(".ytlink");
    if (link) {
      link.onclick = function (e) {
        e.stopPropagation();
      };
    }
    el.onclick = function (e) {
      if (e.target && e.target.closest && e.target.closest(".ytlink")) return;
      markUserPicked();
      var id = el.getAttribute("data-id");
      var next = +el.getAttribute("data-i");
      if (id && SONGS && SONGS.length) {
        for (var si = 0; si < SONGS.length; si++) {
          if (SONGS[si] && SONGS[si].id === id) { next = si; break; }
        }
      }
      if (!isFinite(next) || next < 0) return;
      idx = next;
      paint({ animate: true });
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(function () { start(); }, reduceMotion() ? 0 : FADE_MS);
    };
  });
}
function rebuildGrid() {
  if (!grid) return;
  grid.innerHTML = SONGS.map(function (s, i) {
    return cardHtml(s, i, i === idx);
  }).join("");
  bindGrid();
  if (window.EmciixPaintYtViews) try { window.EmciixPaintYtViews(); } catch (e) {}
  if (window.EmciixShelfRefresh) try { window.EmciixShelfRefresh(); } catch (e) {}
}

function getViewCounts() {
  try {
    if (window.EmciixLiveYtViews && Object.keys(window.EmciixLiveYtViews).length) {
      return window.EmciixLiveYtViews;
    }
  } catch (e) {}
  return null;
}
function findMostPopularIdx(views) {
  if (!views || !SONGS || !SONGS.length) return -1;
  var best = -1, bestViews = -1;
  for (var i = 0; i < SONGS.length; i++) {
    var id = SONGS[i] && SONGS[i].id;
    if (!id) continue;
    var n = Number(views[id]);
    if (!isFinite(n) || n < 0) continue;
    if (n > bestViews) { bestViews = n; best = i; }
  }
  return best;
}
function isMostPopularTrack() {
  var views = getViewCounts();
  var pop = findMostPopularIdx(views);
  return pop >= 0 && pop === idx;
}
function heroKickerLabel() {
  if (heroMode === "new") return "Latest upload";
  if (isMostPopularTrack()) return "Most popular";
  return "Now playing";
}
function heroModeTabsHtml() {
  return "";
}
function syncModeSwitchUi() {
  var flip = document.getElementById("modeFlip");
  if (flip) flip.setAttribute("data-mode", heroMode === "new" ? "new" : "popular");
  var popular = document.getElementById("modePopular");
  var neu = document.getElementById("modeNew") || document.getElementById("modeLatest");
  if (popular) {
    popular.classList.toggle("is-on", heroMode === "popular");
    popular.setAttribute("aria-pressed", heroMode === "popular" ? "true" : "false");
  }
  if (neu) {
    neu.classList.toggle("is-on", heroMode === "new");
    neu.setAttribute("aria-pressed", heroMode === "new" ? "true" : "false");
  }
}
function bindHeroModeTabs() {
  // Event delegation on document — survives paint() regenerating #modeFlip
  if (window.EmciixModeFlipBound) return;
  window.EmciixModeFlipBound = true;
  document.addEventListener("click", function (e) {
    var btn = e.target && e.target.closest && e.target.closest("#modeFlip [data-mode]");
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    var mode = btn.getAttribute("data-mode");
    if (!mode) return;
    setHeroMode(mode, { user: true, animate: true, jump: true });
  });
}
function syncHeroPopularBadge() {
  syncModeSwitchUi();
}
try { window.EmciixSyncHeroPopular = syncHeroPopularBadge; } catch (e) {}
function keepMostViewedOnHero(opts) {
  opts = opts || {};
  if (heroMode === "new") return false;
  if (deepLinkLocked || userPicked()) return false;
  if (isPlayingNow() && !opts.force) return false;
  var views = getViewCounts();
  if (!views) return false;
  applyCatalogOrder({ rebuild: false });
  var pop = findMostPopularIdx(views);
  if (pop < 0 || pop === idx) return false;
  idx = pop;
  try { localStorage.setItem(IDX_KEY, String(idx)); } catch (e) {}
  paint({ animate: !!opts.animate, soft: true });
  return true;
}
try { window.EmciixKeepMostViewed = keepMostViewedOnHero; } catch (e) {}
function heroKickerIdx() {
  try {
    var id = SONGS[idx] && SONGS[idx].id;
    var cards = grid ? grid.querySelectorAll(".card") : [];
    var shown = 0;
    for (var i = 0; i < cards.length; i++) {
      if (cards[i].classList.contains("filtered")) continue;
      shown++;
      if (id && cards[i].getAttribute("data-id") === id) {
        return pad(shown) + " / " + pad(SONGS.length);
      }
    }
  } catch (e) {}
  return pad(idx + 1) + " / " + pad(SONGS.length);
}
function applyMostPopularTrack(views) {
  var i = findMostPopularIdx(views);
  if (i < 0 || i === idx) return false;
  idx = i;
  try { localStorage.setItem(IDX_KEY, String(idx)); } catch (e) {}
  return true;
}
function fetchViewsMap() {
  try {
    if (window.EmciixLiveYtViews && Object.keys(window.EmciixLiveYtViews).length) {
      return Promise.resolve(window.EmciixLiveYtViews);
    }
  } catch (e) {}
  var ids = [];
  for (var i = 0; i < SONGS.length; i++) {
    if (SONGS[i] && SONGS[i].id) ids.push(SONGS[i].id);
  }
  if (!ids.length) return Promise.reject(new Error("no songs"));
  var url = "https://emciix-yt-views.vercel.app/views?ids=" + encodeURIComponent(ids.join(",")) + "&t=" + Date.now();
  function once() {
    return fetch(url, { cache: "no-store", mode: "cors" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (!data || !data.views || !Object.keys(data.views).length) throw new Error("live views empty");
        window.EmciixLiveYtViews = data.views;
        window.EmciixYtViewCounts = data.views;
        return data.views;
      });
  }
  return once().catch(function () { return once(); });
}
function ensureLatestInCatalog(track) {
  if (!track || !track.id) return false;
  var id = String(track.id);
  var title = String(track.title || "Latest upload").trim() || "Latest upload";
  bumpRecencyId(id);
  var i = -1;
  for (var n = 0; n < SONGS.length; n++) {
    if (SONGS[n].id === id) { i = n; break; }
  }
  if (i === 0 && heroMode === "new") {
    if (title && SONGS[0].title !== title) {
      SONGS[0].title = title;
      rebuildGrid();
      return true;
    }
    return false;
  }
  var keepId = SONGS[idx] ? SONGS[idx].id : null;
  if (i > 0) {
    var moved = SONGS.splice(i, 1)[0];
    if (title) moved.title = title;
    if (heroMode === "new") SONGS.unshift(moved);
    else SONGS.push(moved); // will be re-sorted by views
  } else if (i < 0) {
    if (heroMode === "new") SONGS.unshift({ id: id, title: title });
    else SONGS.push({ id: id, title: title });
  } else if (title && SONGS[i]) {
    SONGS[i].title = title;
  }
  applyCatalogOrder({ rebuild: true });
  if (keepId) {
    for (var j = 0; j < SONGS.length; j++) {
      if (SONGS[j].id === keepId) { idx = j; break; }
    }
  }
  try { localStorage.setItem(IDX_KEY, String(idx)); } catch (e) {}
  return true;
}
window.EmciixEnsureTrack = ensureLatestInCatalog;
function applyLatestTrack(track) {
  if (!track || !track.id) return false;
  var id = String(track.id);
  var title = String(track.title || "Latest upload").trim() || "Latest upload";
  var i = -1;
  for (var n = 0; n < SONGS.length; n++) {
    if (SONGS[n].id === id) { i = n; break; }
  }
  if (i >= 0) {
    idx = i;
  } else {
    SONGS.unshift({ id: id, title: title });
    idx = 0;
    rebuildGrid();
  }
  try { localStorage.setItem(IDX_KEY, String(idx)); } catch (e) {}
  return true;
}
function withTimeout(promise, ms) {
  return new Promise(function (resolve, reject) {
    var done = false;
    var t = setTimeout(function () {
      if (done) return;
      done = true;
      reject(new Error("timeout"));
    }, ms);
    promise.then(
      function (v) { if (done) return; done = true; clearTimeout(t); resolve(v); },
      function (e) { if (done) return; done = true; clearTimeout(t); reject(e); }
    );
  });
}
function extractYtId(raw) {
  var s = String(raw || "");
  var m = s.match(/yt:video:([A-Za-z0-9_-]{11})/);
  if (m) return m[1];
  m = s.match(/[?&]v=([A-Za-z0-9_-]{11})/);
  if (m) return m[1];
  m = s.match(/youtu\.be\/([A-Za-z0-9_-]{11})/);
  if (m) return m[1];
  m = s.match(/\/shorts\/([A-Za-z0-9_-]{11})/);
  if (m) return m[1];
  m = s.match(/\/embed\/([A-Za-z0-9_-]{11})/);
  if (m) return m[1];
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
  return null;
}
function isShortEntry(item) {
  var link = String((item && (item.link || item.guid || item.url)) || "");
  return /\/shorts\//i.test(link);
}
function pickLatestFromRssItems(items) {
  if (!items || !items.length) return null;
  var i, id, item, chosen = null;
  for (i = 0; i < items.length; i++) {
    item = items[i];
    if (isShortEntry(item)) continue;
    id = extractYtId(item.guid) || extractYtId(item.link) || extractYtId(item.id);
    if (id) {
      chosen = { id: id, title: String(item.title || "").trim() || id, channelId: YT_CHANNEL_ID, source: "rss2json" };
      break;
    }
  }
  if (chosen) return chosen;
  item = items[0];
  id = extractYtId(item.guid) || extractYtId(item.link) || extractYtId(item.id);
  if (!id) return null;
  return { id: id, title: String(item.title || "").trim() || id, channelId: YT_CHANNEL_ID, source: "rss2json" };
}
function uploadsPlaylistId() {
  // YouTube uploads playlist: UC… → UU…
  if (YT_CHANNEL_ID && YT_CHANNEL_ID.indexOf("UC") === 0) {
    return "UU" + YT_CHANNEL_ID.slice(2);
  }
  return YT_CHANNEL_ID;
}
function pickLatestFromAtomXml(xml) {
  var text = String(xml || "");
  // Prefer first non-Short entry: match videoId + nearby title
  var re = /<yt:videoId>([A-Za-z0-9_-]{11})<\/yt:videoId>[\s\S]*?<media:title>([^<]*)<\/media:title>/g;
  var m, first = null;
  while ((m = re.exec(text))) {
    var id = m[1];
    var title = String(m[2] || "").trim() || id;
    // Skip if this block looks like a Short by checking preceding link in a smaller window
    var start = Math.max(0, m.index - 400);
    var chunk = text.slice(start, m.index + m[0].length);
    if (/\/shorts\//i.test(chunk)) continue;
    return { id: id, title: title, channelId: YT_CHANNEL_ID, source: "atom" };
  }
  // Fallback: first videoId + first media:title
  var idM = text.match(/<yt:videoId>([A-Za-z0-9_-]{11})<\/yt:videoId>/);
  var titleM = text.match(/<media:title>([^<]*)<\/media:title>/);
  if (!idM) return null;
  return {
    id: idM[1],
    title: (titleM && titleM[1] ? String(titleM[1]).trim() : idM[1]) || idM[1],
    channelId: YT_CHANNEL_ID,
    source: "atom"
  };
}
function fetchLatestFromAtom() {
  var atom = "https://www.youtube.com/feeds/videos.xml?channel_id=" + YT_CHANNEL_ID;
  var proxy = "https://api.allorigins.win/raw?url=" + encodeURIComponent(atom);
  return fetch(proxy, { cache: "no-store" })
    .then(function (r) {
      if (!r.ok) throw new Error("atom proxy " + r.status);
      return r.text();
    })
    .then(function (xml) {
      var track = pickLatestFromAtomXml(xml);
      if (!track || !track.id) throw new Error("atom empty");
      return track;
    });
}
function fetchLatestFromRss() {
  // rss2json often lags; keep as secondary
  var atom = "https://www.youtube.com/feeds/videos.xml?playlist_id=" + uploadsPlaylistId();
  var url = "https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent(atom);
  return fetch(url, { cache: "no-store" })
    .then(function (r) {
      if (!r.ok) throw new Error("rss2json " + r.status);
      return r.json();
    })
    .then(function (data) {
      if (!data || data.status !== "ok" || !data.items) throw new Error("rss2json bad");
      var track = pickLatestFromRssItems(data.items);
      if (!track) throw new Error("rss2json empty");
      return track;
    });
}
function fetchLatestFromChannel() {
  var page = "https://www.youtube.com/channel/" + YT_CHANNEL_ID + "/videos";
  var proxy = "https://api.allorigins.win/raw?url=" + encodeURIComponent(page);
  var ac = typeof AbortController !== "undefined" ? new AbortController() : null;
  var opts = { cache: "no-store" };
  if (ac) opts.signal = ac.signal;
  var kill = setTimeout(function () { try { if (ac) ac.abort(); } catch (e) {} }, 5000);
  return fetch(proxy, opts)
    .then(function (r) {
      clearTimeout(kill);
      if (!r.ok) throw new Error("proxy " + r.status);
      return r.text();
    })
    .then(function (html) {
      var m = html.match(/"videoId":"([A-Za-z0-9_-]{11})"/);
      if (!m) throw new Error("no videoId");
      var id = m[1];
      return withTimeout(
        fetch(
          "https://noembed.com/embed?url=" +
            encodeURIComponent("https://www.youtube.com/watch?v=" + id)
        ).then(function (r) { return r.ok ? r.json() : {}; }).catch(function () { return {}; }),
        1200
      ).then(function (meta) {
        return { id: id, title: (meta && meta.title) || id, channelId: YT_CHANNEL_ID, source: "allorigins" };
      });
    })
    .catch(function (e) {
      clearTimeout(kill);
      throw e;
    });
}
function fetchLatestFallback() {
  return fetch("/latest.json", { cache: "no-store" })
    .then(function (r) {
      if (!r.ok) throw new Error("latest.json");
      return r.json();
    });
}
function fetchLatestTrack() {
  // Atom first (live). Same-origin latest.json before rss2json — rss2json often lags days.
  return withTimeout(fetchLatestFromAtom(), 5500)
    .catch(function () { return withTimeout(fetchLatestFallback(), 900); })
    .catch(function () { return withTimeout(fetchLatestFromChannel(), 5500); })
    .catch(function () { return withTimeout(fetchLatestFromRss(), 5000); });
}
function bootPlayer() {
  parseDeepLink();
  paintNeed();
  updateLiveModeHint();
  loadDriveMap();
  paint();
  bootReady = true;
  bindLivePill();
  var startedId = SONGS[idx] ? SONGS[idx].id : null;
  var shuffleBtn = document.getElementById("shelfShuffle");
  if (shuffleBtn) shuffleBtn.onclick = function () { shuffleTrack(); };
  // Seed catalog ASAP from same-origin /latest.json so Order shows newest
  // even if live Atom/rss2json is slow. Live fetch may promote a newer id.
  withTimeout(fetchLatestFallback(), 900)
    .then(function (track) { ensureLatestInCatalog(track); })
    .catch(function () {});
  if (deepLinkLocked || userPicked()) {
    if (status && !isPlayingNow()) {
      status.textContent = "Songs";
    }
    fetchLatestTrack()
      .then(function (track) { ensureLatestInCatalog(track); })
      .catch(function () {});
    return;
  }
  // Player146: honor Popular|New preference for initial order
  withTimeout(fetchViewsMap(), 12000)
    .then(function (views) {
      if (deepLinkLocked || userPicked()) return false;
      applyCatalogOrder({ rebuild: true });
      if (heroMode === "popular") {
        if (applyMostPopularTrack(views || getViewCounts())) {
          paint({ soft: true, animate: false });
          if (status && !isPlayingNow()) status.textContent = "Songs";
          return true;
        }
      } else {
        paint({ soft: true, animate: false });
      }
      return false;
    })
    .catch(function () {
      applyCatalogOrder({ rebuild: true });
      return false;
    })
    .then(function () {
      return fetchLatestTrack().then(function (track) {
        if (!track || !track.id) return;
        try { window.EmciixLatestId = track.id; } catch (e) {}
        ensureLatestInCatalog(track);
        if (deepLinkLocked || userPicked()) return;
        if (heroMode === "popular") {
          keepMostViewedOnHero({ animate: false });
        } else {
          applyCatalogOrder({ rebuild: true });
          idx = 0;
          try { localStorage.setItem(IDX_KEY, String(idx)); } catch (e) {}
          paint({ soft: true, animate: false });
        }
        if (status && !isPlayingNow() && !tick) status.textContent = "Songs";
      });
    })
    .catch(function () {});
}
function bindLivePill() {
  bindHeroModeTabs();
}

function skip(){ markUserPicked(); idx = (idx + 1) % SONGS.length; paint({ animate: true }); }
function prev(){ markUserPicked(); idx = (idx - 1 + SONGS.length) % SONGS.length; paint({ animate: true }); }
function isPlayingNow() {
  return !!(hero && hero.classList.contains("is-playing"));
}
function setRepeat(on) {
  var next = !!on;
  var changed = next !== repeatOn;
  repeatOn = next;
  try { localStorage.setItem(REPEAT_KEY, repeatOn ? "1" : "0"); } catch (e) {}
  var btn = document.getElementById("repeat");
  if (btn) {
    btn.classList.toggle("on", repeatOn);
    btn.setAttribute("aria-pressed", repeatOn ? "true" : "false");
    btn.setAttribute("aria-label", repeatOn ? "Repeat one on" : "Repeat one off");
    btn.title = repeatOn ? "Repeat one on" : "Repeat one";
    btn.innerHTML = repeatIconSvg();
  }
  // Native video: toggle loop attr. YT iframe: re-start so loop=1 applies.
  if (changed && isPlayingNow()) {
    var nv = hero && hero.querySelector("video.native-media");
    if (nv) {
      nv.loop = !!repeatOn;
      if (status) status.textContent = repeatOn ? "Playing (repeat on)." : "Playing on this page.";
      return;
    }
    start();
  }
}
function bind() {
  var play = document.getElementById("play");
  var playGame = document.getElementById("playGame");
  var skipBtn = document.getElementById("skip");
  var prevBtn = document.getElementById("prev");
  var repeatBtn = document.getElementById("repeat");
  var transportPlay = document.getElementById("transportPlay");
  var transportChange = document.getElementById("transportChange");
  if (play) play.onclick = function(){ start(); };
  if (playGame) playGame.onclick = function(){ window.location.href = "https://emciix.com/portal"; };
  if (transportPlay) transportPlay.onclick = function(){ start(); };
  if (transportChange) transportChange.onclick = skip;
  if (skipBtn) skipBtn.onclick = skip;
  if (prevBtn) prevBtn.onclick = prev;
  if (repeatBtn) repeatBtn.onclick = function(){
    setRepeat(!repeatOn);
  };
  bindHeroModeTabs();
  syncModeSwitchUi();
}
document.addEventListener("keydown", function(e){
  if (e.key === "Escape" && typeof toggleNeed === "function") toggleNeed(false);
});
bindGrid();
document.addEventListener("keydown", function(e){
  if (e.target && /input|textarea/i.test(e.target.tagName)) return;
  if (e.code === "Space") { e.preventDefault(); start(); }
  if (e.key === "ArrowRight") skip();
  if (e.key === "ArrowLeft") prev();
});

(function () {
  // Player146: any stage / PLAY control tap starts playback
  if (window.EmciixPlayDelegate) return;
  window.EmciixPlayDelegate = true;
  function wantPlay(el) {
    if (!el || !el.closest) return false;
    if (el.closest("#play, button.go, #hintPlay")) return true;
    if (el.closest("video.native-media, iframe.yt-embed, a, button.b, .side")) return false;
    return !!el.closest("#hero .stage");
  }
  document.addEventListener("click", function (e) {
    if (!wantPlay(e.target)) return;
    e.preventDefault();
    e.stopPropagation();
    try { start(); } catch (err) {}
  }, true);
  document.addEventListener("keydown", function (e) {
    if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
    if (e.code === "Space" || e.key === " ") {
      e.preventDefault();
      try { start(); } catch (err) {}
    }
  }, true);
})();

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bootPlayer);
else bootPlayer();



(function () {
  var brand = document.getElementById("brandHome");
  if (!brand) return;
  brand.addEventListener("click", function (e) {
    e.preventDefault();
    var path = location.pathname || "/";
    if (path === "/" || path === "" || path === "/index.html") {
      location.reload();
    } else {
      location.href = "/";
    }
  });
})();

(function () {
  var btn = document.getElementById("themeBtn");
  if (!btn) return;
  var KEY = "emciix.theme";
  function systemTheme() {
    try {
      return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    } catch (e) {
      return "dark";
    }
  }
  function saved() {
    try {
      var t = localStorage.getItem(KEY);
      return (t === "light" || t === "dark") ? t : null;
    } catch (e) {
      return null;
    }
  }
  function current() {
    var s = saved();
    if (s) return s;
    var attr = document.documentElement.getAttribute("data-theme");
    if (attr === "light" || attr === "dark") return attr;
    return systemTheme();
  }
  var animTimer = null;
  function syncFavicon(mode) {
    var v = "Player146";
    var svgHref = mode === "light"
      ? "/favicon-blob-light.svg?v=" + v
      : "/favicon-blob-dark.svg?v=" + v;
    var pngHref = mode === "light"
      ? "/favicon-light.png?v=" + v
      : "/favicon-dark.png?v=" + v;
    var icoHref = mode === "light"
      ? "/favicon-light.ico?v=" + v
      : "/favicon-dark.ico?v=" + v;
    function replaceIcon(id, href, type) {
      var el = document.getElementById(id);
      if (!el) {
        el = document.createElement("link");
        el.id = id;
        el.rel = "icon";
        if (type) el.type = type;
        document.head.appendChild(el);
      }
      el.setAttribute("href", href);
      if (type) el.setAttribute("type", type);
      // Chromium often ignores href mutation — replace the node
      if (el.parentNode) {
        var next = el.cloneNode(true);
        next.setAttribute("href", href);
        el.parentNode.replaceChild(next, el);
      }
    }
    replaceIcon("faviconSvg", svgHref, "image/svg+xml");
    replaceIcon("faviconPng", pngHref, "image/png");
    replaceIcon("faviconIco", icoHref, null);
  }
  function apply(mode, persist, animate) {
    var root = document.documentElement;
    if (animate) {
      try {
        if (!window.matchMedia || !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          root.classList.add("theme-animating");
          if (animTimer) clearTimeout(animTimer);
          animTimer = setTimeout(function () {
            root.classList.remove("theme-animating");
            animTimer = null;
          }, 1100);
        }
      } catch (e) {}
    }
    root.setAttribute("data-theme", mode);
    if (persist) {
      try { localStorage.setItem(KEY, mode); } catch (e) {}
    }
    btn.setAttribute("aria-label", mode === "light" ? "Switch to dark mode" : "Switch to light mode");
    syncFavicon(mode);
  }
  btn.addEventListener("click", function () {
    apply(current() === "light" ? "dark" : "light", true, true);
  });
  apply(current(), false);
  try {
    var mq = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)");
    if (mq) {
      var onChange = function () {
        if (!saved()) apply(systemTheme(), false);
      };
      if (mq.addEventListener) mq.addEventListener("change", onChange);
      else if (mq.addListener) mq.addListener(onChange);
    }
  } catch (e) {}
})();

// Player110: Grok eyes follow pointer — independent axis mapping with faster Y response
(function () {
  var btn = document.getElementById("profileBtn");
  var eyes = document.getElementById("grokEyes");
  if (!btn || !eyes) return;

  var MAX_X = 6.0; // px — horizontal travel
  var MAX_Y = 9.0; // px — extra vertical travel for accurate up/down aiming
  var TAU_X = 0.09; // seconds — smooth horizontal exponential settle
  var TAU_Y = 0.055; // seconds — faster vertical exponential settle
  var raf = 0;
  var lastTs = 0;
  var targetX = 0;
  var targetY = 0;
  var curX = 0;
  var curY = 0;

  function apply(x, y) {
    curX = x;
    curY = y;
    eyes.style.transform = "translate(" + x.toFixed(2) + "px," + y.toFixed(2) + "px)";
  }

  function schedule() {
    if (!raf) raf = requestAnimationFrame(tick);
  }

  function tick(ts) {
    raf = 0;
    if (!lastTs) lastTs = ts;
    var dt = Math.min(0.05, Math.max(0, (ts - lastTs) / 1000));
    lastTs = ts;
    var ax = 1 - Math.exp(-dt / TAU_X);
    var ay = 1 - Math.exp(-dt / TAU_Y);
    var dx = targetX - curX;
    var dy = targetY - curY;
    if (Math.abs(dx) <= 0.05 && Math.abs(dy) <= 0.05) {
      apply(targetX, targetY);
      lastTs = 0;
      return;
    }
    apply(curX + dx * ax, curY + dy * ay);
    schedule();
  }

  function setTarget(px, py) {
    var r = btn.getBoundingClientRect();
    var cx = r.left + r.width * 0.5;
    var cy = r.top + r.height * 0.5;
    var dx = px - cx;
    var dy = py - cy;
    // Map each axis independently so pure vertical movement is not diluted by X.
    // The tighter Y ramp reaches its maximum sooner while staying subtle near center.
    var sx = Math.max(-1, Math.min(1, dx / 80));
    var sy = Math.max(-1, Math.min(1, dy / 60));
    targetX = sx * MAX_X;
    targetY = sy * MAX_Y;
    schedule();
  }

  function onMove(e) {
    setTarget(e.clientX, e.clientY);
  }

  function easeHome() {
    targetX = 0;
    targetY = 0;
    schedule();
  }

  document.addEventListener("pointermove", onMove, { passive: true });
  document.documentElement.addEventListener("mouseleave", easeHome);
  window.addEventListener("blur", easeHome);
})();
