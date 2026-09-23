(function () {
  var views = Object.create(null);
  var LIVE_EVERY_MS = 20000;
  var JSON_EVERY_MS = 30000;
  var CURRENT_EVERY_MS = 15000;
  var liveBusy = false;
  var currentBusy = false;
  var syncBusy = false;
  var VIEWS_API = "https://emciix-yt-views.vercel.app/views";

  function fmt(n) {
    n = Number(n);
    if (!isFinite(n) || n < 0) return null;
    if (n < 1000) return String(Math.floor(n));
    if (n < 10000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    if (n < 1000000) return String(Math.round(n / 1000)) + "K";
    return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  function ensureMeta(card) {
    var meta = card.querySelector(".cardmeta");
    if (meta) return meta;
    meta = document.createElement("div");
    meta.className = "cardmeta";
    var title = card.querySelector("p");
    if (title && title.nextSibling) card.insertBefore(meta, title.nextSibling);
    else card.appendChild(meta);
    return meta;
  }
  function makePill(n, videoId) {
    n = Number(n);
    if (!isFinite(n) || n < 1) return null;
    var s = fmt(n);
    if (!s) return null;
    var hasVideo = typeof videoId === "string" && videoId.trim();
    var el = document.createElement(hasVideo ? "a" : "span");
    el.className = "ytviews";
    if (hasVideo) {
      var id = videoId.trim();
      el.href = "https://www.youtube.com/watch?v=" + encodeURIComponent(id);
      el.target = "_blank";
      el.rel = "noopener noreferrer";
      el.title = s + " views on YouTube — open video";
      el.setAttribute("aria-label", s + " views on YouTube — open video");
    } else {
      el.title = "YouTube views";
      el.setAttribute("aria-label", s + " YouTube views");
    }
    el.innerHTML =
      '<svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true"><path fill="#FF0000" d="M23.5 6.2a3.1 3.1 0 0 0-2.2-2.2C19.4 3.5 12 3.5 12 3.5s-7.4 0-9.3.5A3.1 3.1 0 0 0 .5 6.2 32.4 32.4 0 0 0 0 12a32.4 32.4 0 0 0 .5 5.8 3.1 3.1 0 0 0 2.2 2.2c1.9.5 9.3.5 9.3.5s7.4 0 9.3-.5a3.1 3.1 0 0 0 2.2-2.2A32.4 32.4 0 0 0 24 12a32.4 32.4 0 0 0-.5-5.8zM9.75 15.5v-7l6.2 3.5-6.2 3.5z"/></svg>';
    el.appendChild(document.createTextNode(s + " views"));
    return el;
  }
  function cardVideoId(card) {
    var id = card.getAttribute("data-id");
    if (id && id.trim()) return id.trim();
    var di = +card.getAttribute("data-i");
    try {
      if (typeof SONGS !== "undefined" && SONGS[di] && SONGS[di].id) return SONGS[di].id;
    } catch (e) {}
    return null;
  }
  function apply() {
    var cards = document.querySelectorAll("#grid .card");
    for (var i = 0; i < cards.length; i++) {
      var id = cardVideoId(cards[i]);
      var n = id != null ? views[id] : null;
      var meta = ensureMeta(cards[i]);
      var old = meta.querySelector(".ytviews") || cards[i].querySelector(":scope > .ytviews");
      if (old && old.parentElement !== meta) old.remove();
      old = meta.querySelector(".ytviews");
      if (n == null) {
        if (old) old.remove();
        continue;
      }
      var pill = makePill(n, id);
      if (!pill) {
        if (old) old.remove();
        continue;
      }
      if (old) old.replaceWith(pill);
      else meta.appendChild(pill);
    }
    var side = document.getElementById("ytViews");
    if (side) {
      side.innerHTML = "";
      try {
        if (typeof SONGS !== "undefined" && typeof idx !== "undefined" && SONGS[idx]) {
          var vn = views[SONGS[idx].id];
          var p = makePill(vn, SONGS[idx].id);
          if (p) side.appendChild(p);
        }
      } catch (e) {}
    }
  }
  window.EmciixPaintYtViews = apply;

  function mergeViews(map, opts) {
    if (!map) return false;
    opts = opts || {};
    var mode = opts.preferMax;
    var hard = !!opts.hard;
    var changed = false;
    if (hard) {
      // Trusted hard sync: replace known ids outright
      Object.keys(map).forEach(function (id) {
        var n = Number(map[id]);
        if (!isFinite(n) || n < 0) return;
        if (views[id] !== n) {
          views[id] = n;
          changed = true;
        }
      });
    } else {
      Object.keys(map).forEach(function (id) {
        var n = Number(map[id]);
        if (!isFinite(n) || n < 0) return;
        var prev = views[id];
        if (prev != null && n < prev) {
          if (mode === true) return;
          if (mode === "live") {
            var drop = prev - n;
            var bigFix = drop >= 10 || (prev >= 50 && n < prev * 0.5);
            if (!bigFix) return;
          }
        }
        if (views[id] !== n) {
          views[id] = n;
          changed = true;
        }
      });
    }
    if (changed || hard) {
      try { window.EmciixYtViewCounts = views; } catch (e) {}
      apply();
      try { if (window.EmciixApplyCatalogOrder) window.EmciixApplyCatalogOrder({ rebuild: true }); } catch (e) {}
      try { if (window.EmciixPaintPopularity) window.EmciixPaintPopularity(); } catch (e) {}
      try { if (window.EmciixSyncHeroPopular) window.EmciixSyncHeroPopular(); } catch (e) {}
      try { if (window.EmciixKeepMostViewed) window.EmciixKeepMostViewed({ animate: false }); } catch (e) {}
      try { if (window.EmciixShelfRefresh) window.EmciixShelfRefresh(); } catch (e) {}
    }
    return changed;
  }

  function setSyncUi(state, detail) {
    var btn = document.getElementById("shelfSync");
    if (!btn) return;
    btn.classList.toggle("is-syncing", state === "syncing");
    btn.disabled = state === "syncing";
    if (state === "syncing") btn.setAttribute("aria-busy", "true");
    else btn.removeAttribute("aria-busy");
    if (detail) btn.title = detail;
    else btn.title = "Hard refresh YouTube views + playlist shelf";
  }

  function loadJson(attempt, hard) {
    attempt = attempt || 0;
    return fetch("/views.json?t=" + Date.now(), { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (!data || !data.views) {
          if (attempt < 3) {
            return new Promise(function (resolve) {
              setTimeout(function () {
                resolve(loadJson(attempt + 1, hard));
              }, 900 * (attempt + 1));
            });
          }
          return false;
        }
        return mergeViews(data.views, hard ? { hard: true } : { preferMax: true });
      })
      .catch(function () {
        if (attempt < 3) {
          return new Promise(function (resolve) {
            setTimeout(function () {
              resolve(loadJson(attempt + 1, hard));
            }, 900 * (attempt + 1));
          });
        }
        return false;
      });
  }

  function songIds() {
    var ids = [];
    var seen = Object.create(null);
    try {
      if (typeof SONGS !== "undefined") {
        for (var i = 0; i < SONGS.length; i++) {
          if (SONGS[i] && SONGS[i].id && !seen[SONGS[i].id]) {
            seen[SONGS[i].id] = 1;
            ids.push(SONGS[i].id);
          }
        }
      }
    } catch (e) {}
    if (!ids.length) {
      var cards = document.querySelectorAll("#grid .card[data-id]");
      for (var c = 0; c < cards.length; c++) {
        var id = cards[c].getAttribute("data-id");
        if (id && !seen[id]) {
          seen[id] = 1;
          ids.push(id);
        }
      }
    }
    return ids;
  }

  function currentSongId() {
    try {
      if (typeof SONGS !== "undefined" && typeof idx !== "undefined" && SONGS[idx]) {
        return SONGS[idx].id || null;
      }
    } catch (e) {}
    return null;
  }

  function fetchApiViews(ids) {
    if (!ids || !ids.length) return Promise.resolve(null);
    var url = VIEWS_API + "?ids=" + encodeURIComponent(ids.join(",")) + "&t=" + Date.now();
    return fetch(url, { cache: "no-store", mode: "cors" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (!data || !data.views) return null;
        var keys = Object.keys(data.views);
        if (!keys.length) return null; // empty = API failed, not "zero views"
        return data.views;
      })
      .catch(function () { return null; });
  }

  function parseViewCount(html) {
    if (!html) return null;
    var m = html.match(/"viewCount"\s*:\s*\{\s*"videoViewCountRenderer"\s*:\s*\{/);
    if (m) {
      var slice = html.slice(m.index, m.index + 1200);
      var o = slice.match(/"viewCount"\s*:\s*\{\s*"simpleText"\s*:\s*"([\d,]+)\s*views?"/i);
      if (o) {
        var n0 = parseInt(o[1].replace(/,/g, ""), 10);
        if (isFinite(n0) && n0 > 0) return n0;
      }
      o = slice.match(/"originalViewCount"\s*:\s*"(\d+)"/);
      if (o && Number(o[1]) > 0) return parseInt(o[1], 10);
      o = slice.match(/"simpleText"\s*:\s*"([\d,]+)\s*views?"/i);
      if (o) {
        var n1 = parseInt(o[1].replace(/,/g, ""), 10);
        if (isFinite(n1) && n1 > 0) return n1;
      }
    }
    m = html.match(/"viewCount"\s*:\s*\{\s*"simpleText"\s*:\s*"([\d,]+)\s*views?"/i);
    if (m) {
      var n2 = parseInt(m[1].replace(/,/g, ""), 10);
      if (isFinite(n2) && n2 > 0) return n2;
    }
    m = html.match(/"originalViewCount"\s*:\s*"(\d+)"/);
    if (m && Number(m[1]) > 0) return parseInt(m[1], 10);
    m = html.match(/"videoDetails"\s*:\s*\{[\s\S]{0,6000}?"viewCount"\s*:\s*"(\d+)"/);
    if (m) return parseInt(m[1], 10);
    m = html.match(/"viewCount"\s*:\s*"(\d+)"/);
    if (m && Number(m[1]) > 0) return parseInt(m[1], 10);
    return null;
  }

  function fetchOneViaProxy(id) {
    var yt = "https://www.youtube.com/watch?v=" + encodeURIComponent(id) + "&hl=en&gl=US";
    var proxies = [
      "https://api.allorigins.win/raw?url=" + encodeURIComponent(yt),
    ];
    function tryAt(i) {
      if (i >= proxies.length) return Promise.resolve(null);
      var ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
      var t = ctrl ? setTimeout(function () { try { ctrl.abort(); } catch (e) {} }, 14000) : null;
      return fetch(proxies[i], { cache: "no-store", signal: ctrl ? ctrl.signal : undefined })
        .then(function (r) { return r.ok ? r.text() : Promise.reject(); })
        .then(function (html) {
          if (t) clearTimeout(t);
          var n = parseViewCount(html);
          if (n == null) return tryAt(i + 1);
          return n;
        })
        .catch(function () {
          if (t) clearTimeout(t);
          return tryAt(i + 1);
        });
    }
    return tryAt(0);
  }

  function scrapeIds(ids, hard) {
    var got = Object.create(null);
    var j = 0;
    function next() {
      if (j >= ids.length) {
        mergeViews(got, hard ? { hard: true } : { preferMax: "live" });
        return Promise.resolve(got);
      }
      var id = ids[j++];
      return fetchOneViaProxy(id).then(function (n) {
        if (n != null) got[id] = n;
        return new Promise(function (resolve) {
          setTimeout(function () { resolve(next()); }, hard ? 120 : 220);
        });
      });
    }
    return next();
  }

  function loadLive(hard) {
    if (liveBusy && !hard) return Promise.resolve(false);
    var ids = songIds();
    if (!ids.length) return Promise.resolve(false);
    liveBusy = true;
    return fetchApiViews(ids)
      .then(function (map) {
        if (map) {
          mergeViews(map, hard ? { hard: true } : { preferMax: "live" });
          liveBusy = false;
          return true;
        }
        // API empty/broken — scrape (all on hard, first 6 otherwise)
        var queue = hard ? ids.slice() : [];
        if (!hard) {
          var cur = currentSongId();
          if (cur) queue.push(cur);
          for (var i = 0; i < ids.length && queue.length < 6; i++) {
            if (ids[i] !== cur) queue.push(ids[i]);
          }
        }
        return scrapeIds(queue, hard).then(function () {
          liveBusy = false;
          return true;
        });
      })
      .catch(function () {
        liveBusy = false;
        return false;
      });
  }

  function loadCurrent() {
    if (currentBusy) return;
    var id = currentSongId();
    if (!id) return;
    currentBusy = true;
    fetchApiViews([id])
      .then(function (map) {
        if (map) mergeViews(map, { preferMax: "live" });
        else {
          return fetchOneViaProxy(id).then(function (n) {
            if (n != null) {
              var o = Object.create(null);
              o[id] = n;
              mergeViews(o, { preferMax: "live" });
            }
          });
        }
      })
      .finally(function () { currentBusy = false; });
  }

  function extractYtId(s) {
    s = String(s || "");
    var m = s.match(/[?&]v=([A-Za-z0-9_-]{11})/);
    if (m) return m[1];
    m = s.match(/youtu\.be\/([A-Za-z0-9_-]{11})/);
    if (m) return m[1];
    m = s.match(/\/shorts\/([A-Za-z0-9_-]{11})/);
    if (m) return m[1];
    m = s.match(/yt:video:([A-Za-z0-9_-]{11})/);
    if (m) return m[1];
    m = s.match(/\/embed\/([A-Za-z0-9_-]{11})/);
    if (m) return m[1];
    if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
    return null;
  }

  var UPLOADS_API = "https://emciix-yt-views.vercel.app/uploads";
  var UPLOADS_API_FALLBACK = "https://emciix-yt-views.vercel.app/api/uploads";

  function ensureTrackFromUpload(ch, id, title) {
    if (!id) return false;
    var exists = false;
    try {
      if (typeof SONGS !== "undefined") {
        for (var s = 0; s < SONGS.length; s++) {
          if (SONGS[s] && SONGS[s].id === id) { exists = true; break; }
        }
      }
    } catch (e) {}
    if (exists) return false;
    try {
      if (typeof window.EmciixEnsureTrack === "function") {
        window.EmciixEnsureTrack({ id: id, title: title, channelId: ch, source: "sync" });
        return true;
      }
      if (typeof ensureLatestInCatalog === "function") {
        ensureLatestInCatalog({ id: id, title: title, channelId: ch, source: "sync" });
        return true;
      }
    } catch (e) {}
    return false;
  }

  function applyUploadItems(items, ch) {
    var added = 0;
    if (!items || !items.length) return 0;
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (!item) continue;
      // Playlist PLZX_2WN1sEAg is curated (includes shorts) — do not skip /shorts/
      var id = item.id || extractYtId(item.guid) || extractYtId(item.link) || extractYtId(item.url) || extractYtId(item.id);
      if (!id) continue;
      var title = String(item.title || "").trim() || id;
      if (ensureTrackFromUpload(ch, id, title)) added++;
    }
    return added;
  }

  function fetchUploadsFromVercel() {
    var urls = [UPLOADS_API + "?t=" + Date.now(), UPLOADS_API_FALLBACK + "?t=" + Date.now()];
    function tryAt(i) {
      if (i >= urls.length) return Promise.resolve(null);
      return fetch(urls[i], { cache: "no-store", mode: "cors" })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (data) {
          if (data && data.items && data.items.length) return data;
          return tryAt(i + 1);
        })
        .catch(function () { return tryAt(i + 1); });
    }
    return tryAt(0);
  }

  var SHELF_PLAYLIST_ID = "PLZX_2WN1sEAg";

  function fetchUploadsFromRss2Json(ch) {
    // Last-chance fallback: same curated playlist as /uploads (not channel UU feed)
    var atom = "https://www.youtube.com/feeds/videos.xml?playlist_id=" + SHELF_PLAYLIST_ID;
    var url = "https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent(atom);
    return fetch(url, { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (!data || data.status !== "ok" || !data.items || !data.items.length) return null;
        return { items: data.items, source: "rss2json-playlist" };
      })
      .catch(function () { return null; });
  }

  function syncChannelUploads() {
    var ch = null;
    try { ch = typeof YT_CHANNEL_ID !== "undefined" ? YT_CHANNEL_ID : null; } catch (e) {}
    if (!ch) ch = "UCt8dYnrvcrZSCx9uS0aLBSQ";
    return fetchUploadsFromVercel()
      .then(function (data) {
        if (data && data.items && data.items.length) {
          return { added: applyUploadItems(data.items, ch), ok: true, source: "vercel" };
        }
        return fetchUploadsFromRss2Json(ch).then(function (fallback) {
          if (fallback && fallback.items && fallback.items.length) {
            return { added: applyUploadItems(fallback.items, ch), ok: true, source: "rss2json" };
          }
          return { added: 0, ok: false, source: "uploads" };
        });
      })
      .catch(function () { return { added: 0, ok: false, source: "uploads" }; });
  }

  function pullYoutubePageViews() {
    var ids = songIds();
    var got = Object.create(null);
    var j = 0;
    var pending = 0;
    var limit = 4;
    if (!ids.length) return Promise.resolve(got);
    return new Promise(function (resolve) {
      function finish() {
        mergeViews(got, { hard: true });
        resolve(got);
      }
      function pump() {
        while (pending < limit && j < ids.length) {
          (function (id) {
            pending++;
            fetchOneViaProxy(id).then(function (n) {
              if (n != null) {
                got[id] = n;
                var one = Object.create(null);
                one[id] = n;
                mergeViews(one, { preferMax: "live" });
              }
              pending--;
              if (j >= ids.length && pending === 0) finish();
              else pump();
            });
          })(ids[j++]);
        }
        if (j >= ids.length && pending === 0) finish();
      }
      pump();
    });
  }

  function refreshAllViews() {
    var ids = songIds();
    return fetchApiViews(ids).then(function (map) {
      if (map) {
        mergeViews(map, { hard: true });
        return true;
      }
      return pullYoutubePageViews();
    }).then(function () {
      try { window.EmciixYtViewCounts = views; } catch (e) {}
      try { if (window.EmciixApplyCatalogOrder) window.EmciixApplyCatalogOrder({ rebuild: true }); } catch (e) {}
      try { if (window.EmciixShelfRefresh) window.EmciixShelfRefresh(); } catch (e) {}
    });
  }

  function hardSync() {
    if (syncBusy) return Promise.resolve();
    syncBusy = true;
    return refreshAllViews()
      .then(function () { syncBusy = false; })
      .catch(function () { syncBusy = false; });
  }

  window.EmciixSyncYtViews = hardSync;

  function bindSyncBtn() {
    var btn = document.getElementById("shelfSync");
    if (!btn || btn._emciixBound) return;
    btn._emciixBound = true;
    btn.addEventListener("click", function () { hardSync(); });
  }

  refreshAllViews();
  setInterval(refreshAllViews, 10000);
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") refreshAllViews();
  });
  window.addEventListener("focus", function () { refreshAllViews(); });
  document.addEventListener("DOMContentLoaded", bindSyncBtn);
})();
