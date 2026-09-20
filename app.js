(function () {
  const CHANNEL = "UCt8dYnrvcrZSCx9uS0aLBSQ";
  const RSS = "https://www.youtube.com/feeds/videos.xml?channel_id=" + CHANNEL;
  const PREVIEW = 30;
  const KEEP_KEY = "emciixKeptD";
  const FALLBACK = [
    ["dG8z3nQeDSI", "Need Hired by Me."],
    ["txA5vV_9XG4", "Unemployed in Love"],
    ["05AgmKvd3NI", "Make up shit"],
    ["MP9AIxzx55o", "Everybody But Me"],
    ["RFqKvFDB0Hg", "I Took Credit"],
    ["o040u9wAZns", "Two phones, zero social life"],
    ["2bbplpfoL-c", "Which phone is it ? iPhone or Android"],
    ["53Jny0alg9g", "Still here"],
    ["cWy-1DZsHDg", "XCode Swift Song"],
    ["9-nGIe8mQ0M", "Wake you up Avicii"],
    ["Id4HSb9j8RA", "You're Not Alone"],
    ["oCWCYVTs3vM", "IDK What I'm Doing"],
    ["R7BunIbGheI", "One More Light On"]
  ].map(([id, title]) => ({ id, title }));
  const hero = document.getElementById("hero");
  const grid = document.getElementById("grid");
  const status = document.getElementById("status");
  let queue = FALLBACK.slice();
  let idx = 0, tick = null, t0 = 0, open = false;
  const thumb = id => "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg";
  const yt = id => "https://www.youtube.com/watch?v=" + id;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&", "<": "<", ">": ">", '"': """, "'": "&#39;" }[c]));
  const kept = () => { try { return JSON.parse(localStorage.getItem(KEEP_KEY) || "[]"); } catch (e) { return []; } };
  const save = list => { try { localStorage.setItem(KEEP_KEY, JSON.stringify(list.slice(0, 80))); } catch (e) {} };
  const stop = () => { if (tick) { clearInterval(tick); tick = null; } };
  const embed = (id, full) => "https://www.youtube-nocookie.com/embed/" + id + "?rel=0&modestbranding=1&autoplay=1" + (full ? "" : "&end=30");
  function paint() {
    const v = queue[idx];
    if (!v || !hero) return;
    open = kept().some(x => x.id === v.id);
    stop();
    hero.innerHTML =
      '<div class="stage"><img alt="" src="' + thumb(v.id) + '"><button class="go" id="play" type="button"><b>PLAY</b></button></div>' +
      '<div class="side"><p class="meta" id="clock">' + (open ? "Kept on this device" : "Idle · 30 seconds") + "</p>" +
      "<h2>" + esc(v.title) + "</h2>" +
      '<div class="bar"><i id="bar"></i></div>' +
      '<div class="row"><button class="b keep" id="keep" type="button">Keep</button>' +
      '<button class="b skip" id="skip" type="button">Skip</button>' +
      '<a class="b out" href="' + yt(v.id) + '" target="_blank" rel="noopener">YouTube</a></div></div>';
    document.getElementById("play").onclick = play;
    document.getElementById("keep").onclick = keepFn;
    document.getElementById("skip").onclick = skip;
    if (grid) {
      grid.innerHTML = queue.map((item, i) =>
        '<article class="card' + (i === idx ? " on" : "") + '" data-i="' + i + '"><img alt="" src="' + thumb(item.id) + '"><p>' + esc(item.title) + "</p></article>"
      ).join("");
      grid.querySelectorAll(".card").forEach(el => {
        el.onclick = () => { idx = +el.dataset.i; paint(); window.scrollTo({ top: 0, behavior: "smooth" }); };
      });
    }
  }
  function play() {
    const v = queue[idx];
    hero.querySelector(".stage").innerHTML = '<iframe src="' + embed(v.id, open) + '" allow="autoplay; encrypted-media" allowfullscreen></iframe>';
    if (open) return;
    t0 = Date.now();
    stop();
    tick = setInterval(() => {
      const s = Math.min(PREVIEW, (Date.now() - t0) / 1000);
      const bar = document.getElementById("bar");
      const clock = document.getElementById("clock");
      if (bar) bar.style.width = (s / PREVIEW * 100) + "%";
      if (clock) clock.textContent = "0:" + String(Math.floor(s)).padStart(2, "0") + " / 0:30";
      if (s >= PREVIEW) { stop(); skip(); }
    }, 200);
  }
  function keepFn() {
    const v = queue[idx];
    save([{ id: v.id, title: v.title, at: Date.now() }, ...kept().filter(x => x.id !== v.id)]);
    open = true;
    stop();
    hero.querySelector(".stage").innerHTML = '<iframe src="' + embed(v.id, true) + '" allow="autoplay; encrypted-media" allowfullscreen></iframe>';
    const clock = document.getElementById("clock");
    const bar = document.getElementById("bar");
    if (clock) clock.textContent = "Kept · full play";
    if (bar) bar.style.width = "100%";
  }
  function skip() {
    idx = (idx + 1) % Math.max(queue.length, 1);
    paint();
  }
  async function refresh() {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);
    try {
      const res = await fetch("https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent(RSS), { cache: "no-store", signal: ctrl.signal });
      if (!res.ok) throw new Error("feed");
      const json = await res.json();
      const videos = (json.items || []).map(item => {
        const m = String(item.link || "").match(/[?&]v=([\w-]{11})/);
        return { id: m ? m[1] : "", title: item.title };
      }).filter(v => v.id);
      if (videos.length) {
        const seen = new Set();
        queue = videos.filter(v => { if (seen.has(v.id)) return false; seen.add(v.id); return true; });
        if (status) status.textContent = "Live feed · BUILD D · press play";
        paint();
      }
    } catch (e) {
      if (status) status.textContent = "Cached shelf · BUILD D · press play";
    } finally {
      clearTimeout(timer);
    }
  }
  paint();
  if (status) status.textContent = "Cached shelf · BUILD D · press play";
  refresh();
})();
