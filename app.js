var IDX_KEY = "emciixIdx";
var SONGS = [
  ["dG8z3nQeDSI","Need Hired by Me."],
  ["txA5vV_9XG4","Unemployed in Love"],
  ["05AgmKvd3NI","Make up shit"],
  ["MP9AIxzx55o","Everybody But Me"],
  ["RFqKvFDB0Hg","I Took Credit"],
  ["o040u9wAZns","Two phones, zero social life"],
  ["oq1c9I9T_tw","Which phone is it? iPhone or Android"],
  ["53Jny0alg9g","Still here"],
  ["cWy-1DZsHDg","XCode Swift Song"],
  ["9-nGIe8mQ0M","Wake you up Avicii"],
  ["Id4HSb9j8RA","You're Not Alone"],
  ["oCWCYVTs3vM","IDK What I'm Doing"],
  ["R7BunIbGheI","One More Light On"],
  ["m6cxgKh5QgE","Grid Run"],
  ["qZZuGfqancc","Solar System Party"],
  ["KhGqJCTO1Hc","Come Closer"]
].map(function(p){ return {id:p[0], title:p[1]}; });
var NEED = {
  repo: "https://github.com/e24g4vewetq3gwerb/Need",
  web: "https://cue-508120.web.app",
  git: "934e350",
  android: "1.0.1",
  ios: "1.0.1",
  bundle: "com.emcii.need"
};
var hero = document.getElementById("hero");
var grid = document.getElementById("grid");
var status = document.getElementById("status");
var idx = 0, tick = null;
try {
  var saved = parseInt(localStorage.getItem(IDX_KEY), 10);
  if (saved >= 0 && saved < SONGS.length) idx = saved;
} catch (e) {}
function thumb(id){ return "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg"; }
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
function stop(){ if (tick) { clearInterval(tick); tick = null; } }
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
function toggleNeed(on) {
  var card = document.getElementById("needCard");
  var btn = document.getElementById("needBtn");
  if (!card) return;
  var show = (typeof on === "boolean") ? on : !card.classList.contains("on");
  card.classList.toggle("on", show);
  if (btn) btn.setAttribute("aria-expanded", show ? "true" : "false");
  paintNeed();
  if (show && status) status.textContent = "Need Inc. · Android " + NEED.android + " · iOS " + NEED.ios + " · Web " + NEED.git;
}
function paint() {
  var v = SONGS[idx]; if (!v || !hero) return;
  stop();
  try { localStorage.setItem(IDX_KEY, String(idx)); } catch (e) {}
  hero.innerHTML =
    '<div class="stage"><img alt="" src="' + thumb(v.id) + '"><button class="go" id="play" type="button"><b>PLAY</b></button></div>' +
    '<div class="side"><p class="kicker">Now playing \u00b7 ' + pad(idx+1) + ' / ' + pad(SONGS.length) + '</p>' +
    '<h2>' + esc(v.title) + '</h2>' +
    '<p class="meta" id="clock">Idle \u00b7 30 seconds on this page</p>' +
    '<div class="bar"><i id="bar"></i></div>' +
    '<div class="row"><button class="b prev" id="prev" type="button">Prev</button>' +
    '<button class="b skip" id="skip" type="button">Skip</button>' +
    '<button class="b full" id="full" type="button">Play full here</button></div>' +
    '<p class="hint">Space play \u00b7 arrows change song</p></div>';
  bind();
  if (grid) {
    var cards = grid.querySelectorAll(".card");
    for (var i = 0; i < cards.length; i++) cards[i].classList.toggle("hide", i === idx);
  }
}
function start(full) {
  var v = SONGS[idx]; if (!v) return;
  var stage = hero.querySelector(".stage"); if (!stage) return;
  stage.innerHTML = '<iframe src="https://www.youtube.com/embed/' + v.id + '?rel=0&modestbranding=1&playsinline=1&autoplay=1' + (full ? "" : "&end=30") + '" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen title="' + esc(v.title) + '"></iframe>';
  if (status) status.textContent = full ? "Playing on this page." : "30 second preview on this page.";
  if (full) {
    stop();
    var clock = document.getElementById("clock");
    var bar = document.getElementById("bar");
    if (clock) clock.textContent = "Playing through here";
    if (bar) bar.style.width = "100%";
    return;
  }
  var t0 = Date.now();
  stop();
  tick = setInterval(function() {
    var s = Math.min(30, (Date.now() - t0) / 1000);
    var bar = document.getElementById("bar");
    var clock = document.getElementById("clock");
    if (bar) bar.style.width = (s / 30 * 100) + "%";
    if (clock) clock.textContent = "0:" + pad(Math.floor(s)) + " / 0:30";
    if (s >= 30) { stop(); skip(); }
  }, 200);
}
function skip(){ idx = (idx + 1) % SONGS.length; paint(); }
function prev(){ idx = (idx - 1 + SONGS.length) % SONGS.length; paint(); }
function bind() {
  var play = document.getElementById("play");
  var skipBtn = document.getElementById("skip");
  var prevBtn = document.getElementById("prev");
  var full = document.getElementById("full");
  if (play) play.onclick = function(){ start(false); };
  if (skipBtn) skipBtn.onclick = skip;
  if (prevBtn) prevBtn.onclick = prev;
  if (full) full.onclick = function(){ start(true); };
}
var needBtn = document.getElementById("needBtn");
if (needBtn) needBtn.onclick = function(){ toggleNeed(); };
document.addEventListener("keydown", function(e){
  if (e.key === "Escape") toggleNeed(false);
});
if (grid) {
  grid.querySelectorAll(".card").forEach(function(el){
    el.onclick = function(){ idx = +el.getAttribute("data-i"); paint(); window.scrollTo({top:0,behavior:"smooth"}); };
  });
}
document.addEventListener("keydown", function(e){
  if (e.target && /input|textarea/i.test(e.target.tagName)) return;
  if (e.code === "Space") { e.preventDefault(); start(false); }
  if (e.key === "ArrowRight") skip();
  if (e.key === "ArrowLeft") prev();
});
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function(){ paintNeed(); paint(); });
else { paintNeed(); paint(); }
