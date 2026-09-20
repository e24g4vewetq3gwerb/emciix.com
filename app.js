var PREVIEW = 30, KEEP_KEY = "emciixGrokPlay", IDX_KEY = "emciixIdx";
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
    var hero = document.getElementById("hero");
    var grid = document.getElementById("grid");
    var status = document.getElementById("status");
    var idx = 0, tick = null, open = false;
    var audio = new Audio(); audio.preload = "none";
    try { var saved = parseInt(localStorage.getItem(IDX_KEY), 10); if (saved >= 0 && saved < SONGS.length) idx = saved; } catch(e) {}
    function thumb(id){ var s = SONGS[idx] || {}; if (s.art) return s.art; if (!id) return ""; return "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg"; }
    function esc(s){
      var map = {
        "&": "&" + "amp;",
        "<": "&" + "lt;",
        ">": "&" + "gt;",
        '"': "&" + "quot;",
        "'": "&#39;"
      };
      return String(s).replace(/[&<>"']/g, function(c){ return map[c]; });
    }
    function kept(){ try { return JSON.parse(localStorage.getItem(KEEP_KEY) || "[]"); } catch(e) { return []; } }
    function save(list){ try { localStorage.setItem(KEEP_KEY, JSON.stringify(list.slice(0,80))); } catch(e) {} }
    function saveIdx(){ try { localStorage.setItem(IDX_KEY, String(idx)); } catch(e) {} }
    function stop(){ if (tick) { clearInterval(tick); tick = null; } }
    function stopAudio(){ try { audio.pause(); audio.removeAttribute("src"); } catch(e) {} }
    function embed(id, full){ return "https://www.youtube.com/embed/" + id + "?rel=0&modestbranding=1&playsinline=1&autoplay=1" + (full ? "" : "&end=30"); }
    function pad(n){ return (n < 10 ? "0" : "") + n; }
    function paint() {
      var v = SONGS[idx]; if (!v || !hero) return;
      open = kept().some(function(x){ return x.id === v.id; });
      stop(); stopAudio(); saveIdx();
      hero.innerHTML =
        '<div class="stage"><img alt="" src="' + thumb(v.id) + '"><button class="go" id="play" type="button"><b>PLAY</b></button></div>' +
        '<div class="side"><p class="kicker">Now playing · ' + pad(idx+1) + ' / ' + pad(SONGS.length) + '</p>' +
        '<h2>' + esc(v.title) + '</h2>' +
        '<p class="meta" id="clock">' + (open ? "Kept · full play on this page" : "Idle · 30 seconds on this page") + '</p>' +
        '<div class="bar"><i id="bar"></i></div>' +
        '<div class="row"><button class="b prev" id="prev" type="button">Prev</button>' +
        '<button class="b keep" id="keep" type="button">Keep</button>' +
        '<button class="b skip" id="skip" type="button">Skip</button>' +
        '<button class="b cue" id="cue" type="button">Cue</button>' +
        '<button class="b shuf" id="shuf" type="button">Shuffle</button>' +
        '<button class="b full" id="full" type="button">Play full here</button></div>' +
        '<p class="hint">Cue = iTunes 30s preview · Shuffle mixes the catalog · C cue · S shuffle</p></div>';
      bind();
      if (grid) {
        var cards = grid.querySelectorAll(".card");
        for (var i=0;i<cards.length;i++) {
          cards[i].classList.toggle("on", i===idx);
          cards[i].classList.toggle("hide", i===idx);
        }
      }
    }
    function start(full) {
      var v = SONGS[idx]; if (!v) return;
      var stage = hero.querySelector(".stage");
      if (!stage) return;
      stopAudio();
      if (!v.id) { cueFn(); return; }
      stage.innerHTML = '<iframe src="' + embed(v.id, full) + '" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen title="' + esc(v.title) + '"></iframe>';
      if (status) status.textContent = full ? "Playing on this page." : "30 second preview on this page.";
      if (full) {
        stop();
        var clock = document.getElementById("clock");
        var bar = document.getElementById("bar");
        if (clock) clock.textContent = "Playing through here";
        if (bar) bar.style.width = "100%";
        return;
      }
      var t0 = Date.now(); stop();
      tick = setInterval(function() {
        var s = Math.min(PREVIEW, (Date.now()-t0)/1000);
        var bar = document.getElementById("bar");
        var clock = document.getElementById("clock");
        if (bar) bar.style.width = (s/PREVIEW*100) + "%";
        if (clock) clock.textContent = "0:" + pad(Math.floor(s)) + " / 0:30";
        if (s >= PREVIEW) { stop(); skip(); }
      }, 200);
    }
    function keepFn() {
      var v = SONGS[idx];
      save([{id:v.id,title:v.title,at:Date.now()}].concat(kept().filter(function(x){ return x.id !== v.id; })));
      open = true; start(true);
    }
    function skip(){ idx = (idx + 1) % SONGS.length; paint(); }
    function prev(){ idx = (idx - 1 + SONGS.length) % SONGS.length; paint(); }
    function cueFn() {
      var v = SONGS[idx]; if (!v) return;
      stop(); stopAudio();
      var stage = hero.querySelector(".stage");
      if (stage) stage.innerHTML = '<img alt="" src="' + thumb(v.id) + '"><button class="go" id="play" type="button"><b>CUE</b></button>';
      bind();
      if (status) status.textContent = v.preview ? "Cue · iTunes 30s preview." : "Cue · parked at start.";
      var clock = document.getElementById("clock");
      var bar = document.getElementById("bar");
      if (clock) clock.textContent = v.preview ? "Cue preview" : "Cued";
      if (bar) bar.style.width = "0";
      if (v.preview) {
        audio.src = v.preview;
        audio.play().catch(function(){});
        audio.ontimeupdate = function(){
          if (!audio.duration) return;
          if (bar) bar.style.width = (audio.currentTime / audio.duration * 100) + "%";
          if (clock) clock.textContent = "Cue 0:" + pad(Math.floor(audio.currentTime));
        };
        audio.onended = function(){ if (clock) clock.textContent = "Cue ready"; if (bar) bar.style.width = "0"; };
      }
    }
    function shuffleFn() {
      stopAudio();
      if (SONGS.length < 2) return;
      var n = idx, guard = 0;
      while (n === idx && guard++ < 20) n = Math.floor(Math.random() * SONGS.length);
      idx = n; paint();
      if (status) status.textContent = "Shuffled from catalog.";
    }
    function bind() {
      var play = document.getElementById("play");
      var keep = document.getElementById("keep");
      var skipBtn = document.getElementById("skip");
      var prevBtn = document.getElementById("prev");
      var full = document.getElementById("full");
      var cueBtn = document.getElementById("cue");
      var shufBtn = document.getElementById("shuf");
      function hitPlay(ev){ if (ev) ev.preventDefault(); start(open); }
      if (play) { play.onclick = hitPlay; play.onpointerup = hitPlay; }
      if (keep) keep.onclick = keepFn;
      if (skipBtn) skipBtn.onclick = skip;
      if (prevBtn) prevBtn.onclick = prev;
      if (full) full.onclick = function(){ start(true); };
      if (cueBtn) cueBtn.onclick = cueFn;
      if (shufBtn) shufBtn.onclick = shuffleFn;
    }
    if (grid) {
      grid.querySelectorAll(".card").forEach(function(el){
        el.onclick = function(){ idx = +el.getAttribute("data-i"); paint(); window.scrollTo({top:0,behavior:"smooth"}); };
      });
    }
    document.addEventListener("keydown", function(e){
      if (e.target && /input|textarea/i.test(e.target.tagName)) return;
      if (e.code === "Space") { e.preventDefault(); start(open); }
      if (e.key === "ArrowRight") skip();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "k" || e.key === "K") keepFn();
      if (e.key === "f" || e.key === "F") start(true);
      if (e.key === "c" || e.key === "C") cueFn();
      if (e.key === "s" || e.key === "S") shuffleFn();
    });
    function norm(s){ return String(s||"").toLowerCase().replace(/[^a-z0-9]+/g,""); }
    function attachPreview(name, url) {
      var n = norm(name);
      for (var i=0;i<SONGS.length;i++) {
        var t = norm(SONGS[i].title);
        if (t && (t.indexOf(n) >= 0 || n.indexOf(t) >= 0 || t.slice(0,8) === n.slice(0,8))) {
          SONGS[i].preview = url; return true;
        }
      }
      return false;
    }
    function pullFeeds() {
      fetch("https://itunes.apple.com/search?term=" + encodeURIComponent("Velc air") + "&entity=song&limit=50")
        .then(function(r){ return r.json(); })
        .then(function(d){
          (d.results||[]).forEach(function(it){
            if (!it.previewUrl) return;
            if (!attachPreview(it.trackName, it.previewUrl)) {
              SONGS.push({id:"", title:it.trackName, preview:it.previewUrl, art:it.artworkUrl100});
            }
          });
        }).catch(function(){});
      fetch("https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent("https://www.youtube.com/feeds/videos.xml?channel_id=UCt8dYnrvcrZSCx9uS0aLBSQ"))
        .then(function(r){ return r.json(); })
        .then(function(d){
          (d.items||[]).forEach(function(it){
            var m = String(it.link||"").match(/[?&]v=([\w-]{11})/) || String(it.guid||"").match(/([\w-]{11})$/);
            if (!m) return;
            var id = m[1];
            if (SONGS.some(function(s){ return s.id === id; })) return;
            SONGS.push({id:id, title:it.title||id});
          });
        }).catch(function(){});
    }
    bind(); paint(); pullFeeds();
