(function () {
  var views = Object.create(null);
  var cities = [];
  var citiesAreSample = false;
  var CACHE_KEY = "emciix.cityStats.v2";
  // Preview fallback when Firestore is unreachable / empty (same shape as cityStats)
  var FALLBACK_CITIES = [
    { id: "ca-6167865", name: "Toronto", region: "ON", n: 3, chat: 3, today: 0, at: 0 },
    { id: "ca-6141439", name: "Sault Ste. Marie", region: "ON", n: 11, chat: 1, today: 0, at: 0 },
    { id: "ca-6077243", name: "Montréal", region: "QC", n: 2, chat: 1, today: 0, at: 0 },
    { id: "ca-6173331", name: "Vancouver", region: "BC", n: 2, chat: 1, today: 0, at: 0 },
    { id: "ca-6094817", name: "Ottawa", region: "ON", n: 1, chat: 1, today: 0, at: 0 },
    { id: "ca-5913490", name: "Calgary", region: "AB", n: 1, chat: 1, today: 0, at: 0 },
    { id: "ca-5946768", name: "Edmonton", region: "AB", n: 1, chat: 1, today: 0, at: 0 },
    { id: "ca-6183235", name: "Winnipeg", region: "MB", n: 1, chat: 1, today: 0, at: 0 },
    { id: "ca-5969782", name: "Hamilton", region: "ON", n: 1, chat: 1, today: 0, at: 0 },
    { id: "ca-6324729", name: "Halifax", region: "NS", n: 1, chat: 1, today: 0, at: 0 },
    { id: "ca-6058560", name: "London", region: "ON", n: 1, chat: 1, today: 0, at: 0 },
    { id: "ca-6325494", name: "Québec", region: "QC", n: 1, chat: 1, today: 0, at: 0 }
  ];

  function sortCities(list) {
    return (list || []).slice().sort(function (a, b) {
      var ha = isCityHot(a) ? 1 : 0;
      var hb = isCityHot(b) ? 1 : 0;
      return (
        hb - ha ||
        (b.chat || 0) - (a.chat || 0) ||
        (b.n || 0) - (a.n || 0) ||
        String(a.name || "").localeCompare(String(b.name || ""))
      );
    });
  }

  function readCityCache() {
    try {
      var raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.cities) || !parsed.cities.length) return null;
      return sortCities(parsed.cities);
    } catch (e) {
      return null;
    }
  }

  function writeCityCache(list) {
    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ at: Date.now(), cities: list || [] })
      );
    } catch (e) {}
  }

  function fmt(n) {
    n = Number(n);
    if (!isFinite(n) || n < 0) return "0";
    if (n < 1000) return String(Math.floor(n));
    if (n < 10000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    if (n < 1000000) return String(Math.round(n / 1000)) + "K";
    return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      if (c === "&") return "&#38;";
      if (c === "<") return "&#60;";
      if (c === ">") return "&#62;";
      if (c === '"') return "&#34;";
      return "&#39;";
    });
  }

  function trunc(s, n) {
    s = String(s || "");
    if (s.length <= n) return s;
    return s.slice(0, n - 1) + "…";
  }

  function setFoot(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text || "";
  }

  function setSub(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text || "";
  }

  function cityIsLive(c) {
    var at = Number(c && c.at) || 0;
    return at > 0 && at >= Date.now() - DAY_MS;
  }

  // Opens only count while the city was active in the last 24h.
  // Otherwise a one-time visit from days ago stays stuck at 2%.
  function liveOpens(c) {
    if (!cityIsLive(c)) return 0;
    var n = Number(c && c.n) || 0;
    return n > 0 ? n : 0;
  }

  function sharePct(n, total) {
    if (!total || total < 1) return 0;
    return Math.max(0, Math.round((n / total) * 100));
  }

  function relTime(ms) {
    ms = Number(ms);
    if (!isFinite(ms) || ms <= 0) return "";
    var d = Date.now() - ms;
    if (d < 0) d = 0;
    if (d < 45000) return "just now";
    if (d < 3600000) {
      var m = Math.max(1, Math.floor(d / 60000));
      return m + "m ago";
    }
    if (d < 86400000) {
      var h = Math.floor(d / 3600000);
      return h + "h ago";
    }
    if (d < 604800000) {
      var day = Math.floor(d / 86400000);
      return day + "d ago";
    }
    var w = Math.floor(d / 604800000);
    return w + "w ago";
  }

  function songLive(id) {
    try {
      var map = window.EmciixSongLiveCounts;
      if (!map || !id) return 0;
      return Number(map[id]) || 0;
    } catch (e) {
      return 0;
    }
  }

  function paintPop() {
    var el = document.getElementById("popChart");
    if (!el) return;
    var rows = [];
    try {
      if (typeof SONGS !== "undefined" && SONGS && SONGS.length) {
        for (var i = 0; i < SONGS.length; i++) {
          var s = SONGS[i];
          if (!s || !s.id) continue;
          var n = views[s.id];
          if (n == null && window.EmciixYtViewCounts) n = window.EmciixYtViewCounts[s.id];
          n = Number(n) || 0;
          rows.push({ id: s.id, title: s.title || s.id, n: n });
        }
      }
    } catch (e) {}
    rows.sort(function (a, b) {
      return b.n - a.n || a.title.localeCompare(b.title);
    });
    if (!rows.length) {
      el.innerHTML = '<p class="chartempty">Views loading…</p>';
      setFoot("popFoot", "");
      setSub("popSub", "Velc air · YouTube views");
      return;
    }
    var total = 0;
    var max = 0;
    for (var j = 0; j < rows.length; j++) {
      total += rows[j].n;
      if (rows[j].n > max) max = rows[j].n;
    }
    if (max < 1) max = 1;
    var show = rows.slice(0, 10);
    var leader = show[0];
    if (leader) {
      setSub(
        "popSub",
        trunc(leader.title, 28) + " · " + fmt(leader.n) + " views"
      );
    }
    el.innerHTML = show
      .map(function (r, idx) {
        var barPct = Math.max(2, Math.round((r.n / max) * 100));
        var share = sharePct(r.n, total);
        var top = idx < 3 ? " top" : "";
        var live = songLive(r.id);
        var liveHtml =
          live > 0
            ? '<span class="livechip">' +
              live +
              (live === 1 ? " live" : " live") +
              "</span>"
            : "";
        return (
          '<div class="chartrow hasbar clickable' +
          top +
          '" role="button" tabindex="0" data-song-id="' +
          esc(r.id) +
          '" title="' +
          esc(r.title) +
          " — " +
          fmt(r.n) +
          " views · " +
          share +
          '% of catalog · play preview">' +
          '<span class="rank">' +
          (idx + 1) +
          "</span>" +
          '<span class="labcol">' +
          '<span class="labrow"><span class="label">' +
          esc(trunc(r.title, 36)) +
          "</span></span>" +
          '<span class="meta"><span class="share">' +
          share +
          "%</span>" +
          liveHtml +
          "</span>" +
          "</span>" +
          '<span class="val">' +
          fmt(r.n) +
          "</span>" +
          '<div class="bartrack" aria-hidden="true"><i style="width:' +
          barPct +
          '%"></i></div>' +
          "</div>"
        );
      })
      .join("");
    var foot = fmt(total) + " total views · top " + show.length;
    if (show.length >= 2 && show[0].n > show[1].n) {
      var lead = show[0].n - show[1].n;
      foot += " · #1 leads by " + fmt(lead);
    }
    setFoot("popFoot", foot);
  }


  var DAY_MS = 24 * 60 * 60 * 1000;

  // "today" is a rolling 24h count written by Place. If cityStats.at is older
  // than 24h (or missing), that stored today value is stale — treat as 0.
  function effectiveToday(c) {
    var n = Number(c && c.today) || 0;
    if (n < 1) return 0;
    var at = Number(c && c.at) || 0;
    if (at <= 0 || at < Date.now() - DAY_MS) return 0;
    return n;
  }

  // Lit = ranks 1 and 2 once live chat is known, else activity in the last 24h.
  function isCityHot(c) {
    if (c && c.forceLit) return true;
    if (effectiveToday(c) > 0) return true;
    var at = Number(c && c.at) || 0;
    if (at <= 0) return false;
    return at >= Date.now() - DAY_MS;
  }

  function statusChipHtml(c) {
    var hot = isCityHot(c);
    var label = hot ? "Lit" : "Calm";
    var cls = hot ? "is-hot" : "is-quiet";
    return (
      '<span class="place-status-chip ' +
      cls +
      '">' +
      label +
      "</span>"
    );
  }

  function setLeadStatus(id, city) {
    var el = document.getElementById(id);
    if (!el) return;
    if (!city) {
      el.setAttribute("hidden", "");
      el.textContent = "";
      el.className = "place-status-chip";
      return;
    }
    var hot = isCityHot(city);
    el.hidden = false;
    el.removeAttribute("hidden");
    el.textContent = hot ? "Lit" : "Calm";
    el.className = "place-status-chip " + (hot ? "is-hot" : "is-quiet");
  }

  function cityRowHtml(c, idx, max, totalChat, totalOpen) {
    var chatN = c.chat || 0;
    var openN = c.n || 0;
    var liveN = liveOpens(c);
    var barPct = max > 0 ? Math.round((chatN / max) * 100) : 0;
    if (chatN < 1) barPct = liveN && totalOpen ? Math.round((liveN / totalOpen) * 100) : 0;
    if (barPct < 0) barPct = 0;
    var chatShare = sharePct(chatN, totalChat);
    var openShare = sharePct(liveOpens(c), totalOpen);
    var top = idx < 3 ? " top" : "";
    var tip = c.name + (c.region ? ", " + c.region : "");
    var chip = c.region
      ? '<span class="regionchip">' + esc(trunc(c.region, 12)) + "</span>"
      : "";
    var statusChip = statusChipHtml(c);
    var todayN = effectiveToday(c);
    var todayChip =
      todayN > 0
        ? '<span class="todaychip">' + fmt(todayN) + " today</span>"
        : "";
    var ago = relTime(c.at);
    var agoHtml = ago ? '<span class="ago">' + esc(ago) + "</span>" : "";
    // Chat pill = text/message line count (ranking metric)
    var chatHtml =
      '<span class="share">' + fmt(chatN) + " chat</span>";
    var openHtml = '<span class="share">' + openShare + "% open</span>";
    var placeAttr = c.id ? ' data-place-id="' + esc(c.id) + '"' : "";
    var seeded = latestChatLabel({ body: c.lastBody || "", handle: c.handle || "" });
    var hasSeed = !!(c.lastBody && String(c.lastBody).trim());
    var latestHtml =
      '<span class="city-latest"' +
      (hasSeed ? ' data-loaded="1"' : "") +
      ">" +
      esc(hasSeed ? seeded : "Latest · …") +
      "</span>";
    return (
      '<div class="chartrow hasbar' +
      (c.id ? " clickable" : "") +
      top +
      '" role="' +
      (c.id ? "button" : "listitem") +
      '"' +
      (c.id ? ' tabindex="0"' : "") +
      placeAttr +
      ' title="' +
      esc(tip) +
      " — " +
      fmt(chatN) +
      " chat" +
      (openN ? ", " + fmt(openN) + " open" : "") +
      (chatShare ? " · " + chatShare + "% texts" : "") +
      '">' +
      '<span class="rank">' +
      (idx + 1) +
      "</span>" +
      '<span class="labcol">' +
      '<span class="labrow"><span class="label">' +
      esc(trunc(c.name, 28)) +
      "</span>" +
      chip +
      statusChip +
      todayChip +
      "</span>" +
      '<span class="meta">' +
      '<span class="city-counts">' +
      chatHtml +
      openHtml +
      agoHtml +
      "</span>" +
      latestHtml +
      "</span>" +
      "</span>" +
      '<span class="val">' +
      fmt(chatN) +
      "</span>" +
      '<div class="bartrack" aria-hidden="true"><i style="width:' +
      barPct +
      '%"></i></div>' +
      "</div>"
    );
  }

  function cityLeadSub(show) {
    if (!show || !show[0]) return "";
    var leadBits = [];
    var tN = effectiveToday(show[0]);
    if (tN > 0) leadBits.push(fmt(tN) + " today");
    leadBits.push(fmt(show[0].chat || 0) + " chat");
    if (show[0].n) leadBits.push(fmt(show[0].n) + " open");
    return (
      trunc(show[0].name, 24) +
      (show[0].region ? ", " + trunc(show[0].region, 12) : "") +
      " · " +
      leadBits.join(" · ")
    );
  }

  function cityFootText(total, totalChat) {
    var foot =
      fmt(total) +
      " interactions · " +
      fmt(totalChat) +
      " chat · " +
      cities.length +
      " town" +
      (cities.length === 1 ? "" : "s");
    var topProv = topProvince(cities);
    if (topProv) foot += " · top " + topProv;
    return foot;
  }

  function setSampleVisible(id, on) {
    var el = document.getElementById(id);
    if (!el) return;
    if (on) el.removeAttribute("hidden");
    else el.setAttribute("hidden", "");
  }

  function paintCities() {
    var el = document.getElementById("cityChart");
    var needEl = document.getElementById("needCityChart");
    if (!cities.length) {
      var emptyHtml =
        '<div class="chartempty-card">' +
        '<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">' +
        '<path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z"/>' +
        "</svg>" +
        "<p>No towns yet</p>" +
        '<a href="/need/?need=place">Open Place</a>' +
        "</div>";
      if (el) {
        el.innerHTML = emptyHtml;
        setFoot("cityFoot", "");
        setSub("citySub", "Live Place · Lit first · then chat");
      }
      if (needEl) {
        needEl.innerHTML = emptyHtml;
        setSub("needCitySub", "Live Place · Lit first · then chat");
      }
      setSampleVisible("needCitySample", true);
      setLeadStatus("needCityStatus", null);
      setLeadStatus("cityStatus", null);
      return;
    }
    var max = 0;
    var total = 0;
    var totalChat = 0;
    var totalOpen = 0;
    for (var i = 0; i < cities.length; i++) {
      total += cities[i].n || 0;
      totalChat += cities[i].chat || 0;
      totalOpen += liveOpens(cities[i]);
      var cScore = cities[i].chat || 0;
      if (cScore > max) max = cScore;
    }
    if (max < 1) max = 1;
    // Charts By city: top 10; needprev By city: top 4 only (pad if live < 4)
    var show = cities.slice(0, 10);
    var needShow = cities.slice(0, 4);
    if (needShow.length < 4) {
      var seen = Object.create(null);
      for (var pi = 0; pi < needShow.length; pi++) {
        seen[(needShow[pi].id || "") + "|" + (needShow[pi].name || "")] = true;
        seen["n:" + (needShow[pi].name || "").toLowerCase()] = true;
      }
      for (var fi = 0; fi < FALLBACK_CITIES.length && needShow.length < 4; fi++) {
        var fc = FALLBACK_CITIES[fi];
        var fk = (fc.id || "") + "|" + (fc.name || "");
        if (seen[fk] || seen["n:" + String(fc.name || "").toLowerCase()]) continue;
        seen[fk] = true;
        needShow.push(fc);
      }
    }
    var sub = cityLeadSub(show);
    var needSub = cityLeadSub(needShow);
    var foot = cityFootText(total, totalChat);
    var rowsHtml = show
      .map(function (c, idx) {
        return cityRowHtml(c, idx, max, totalChat, totalOpen);
      })
      .join("");
    var needRowsHtml = needShow
      .map(function (c, idx) {
        return cityRowHtml(c, idx, max, totalChat, totalOpen);
      })
      .join("");
    if (el) {
      setSub("citySub", sub);
      el.innerHTML = rowsHtml;
      setFoot("cityFoot", foot);
      setLeadStatus("cityStatus", show[0] || null);
    }
    if (needEl) {
      setSub("needCitySub", needSub);
      needEl.innerHTML = needRowsHtml;
      setSampleVisible("needCitySample", !!citiesAreSample);
      setLeadStatus("needCityStatus", needShow[0] || null);
    }
  }

  function topProvince(list) {
    var counts = Object.create(null);
    for (var i = 0; i < list.length; i++) {
      var r = (list[i].region || "").trim();
      if (!r) continue;
      // Prefer text/chat volume for province lead; fall back to opens
      counts[r] = (counts[r] || 0) + (list[i].chat || 0) * 1000 + (list[i].n || 0);
    }
    var best = "";
    var bestN = 0;
    for (var k in counts) {
      if (counts[k] > bestN) {
        bestN = counts[k];
        best = k;
      }
    }
    return best ? trunc(best, 18) : "";
  }

  function liveViews() {
    try {
      if (window.EmciixLiveYtViews && Object.keys(window.EmciixLiveYtViews).length) {
        return window.EmciixLiveYtViews;
      }
    } catch (e) {}
    return null;
  }

  function loadViews() {
    var live = liveViews();
    if (!live) return;
    views = live;
    paintPop();
  }

  // Firestore REST — list cityStats (public read)
  function parseDoc(doc) {
    if (!doc || !doc.fields) return null;
    var f = doc.fields;
    var name = (f.name && f.name.stringValue) || "";
    var region = (f.region && f.region.stringValue) || "";
    function intField(node) {
      if (!node) return 0;
      if (node.integerValue != null) return parseInt(node.integerValue, 10) || 0;
      if (node.doubleValue != null) return Math.floor(node.doubleValue) || 0;
      return 0;
    }
    var n = intField(f.n);
    var chat = intField(f.chat);
    var today = intField(f.today);
    var at = 0;
    if (f.at) {
      if (f.at.integerValue != null) at = parseInt(f.at.integerValue, 10) || 0;
      else if (f.at.doubleValue != null) at = Math.floor(f.at.doubleValue) || 0;
      else if (f.at.timestampValue) at = Date.parse(f.at.timestampValue) || 0;
    }
    var id = "";
    if (doc.name) {
      var parts = String(doc.name).split("/");
      id = parts[parts.length - 1] || "";
    }
    if (!name && !id) return null;
    var lastBody = (f.lastBody && f.lastBody.stringValue) || "";
    var handle = (f.handle && f.handle.stringValue) || "";
    var lastAt = 0;
    if (f.lastAt) {
      if (f.lastAt.integerValue != null) lastAt = parseInt(f.lastAt.integerValue, 10) || 0;
      else if (f.lastAt.doubleValue != null) lastAt = Math.floor(f.lastAt.doubleValue) || 0;
      else if (f.lastAt.timestampValue) lastAt = Date.parse(f.lastAt.timestampValue) || 0;
    }
    return {
      id: id,
      name: name || id,
      region: region,
      n: n,
      chat: chat,
      today: today,
      at: at,
      lastBody: lastBody,
      handle: handle,
      lastAt: lastAt
    };
  }

  function normalizeCity(c) {
    if (!c) return c;
    var next = {
      id: c.id,
      name: c.name,
      region: c.region,
      n: c.n || 0,
      chat: c.chat || 0,
      today: effectiveToday(c),
      at: c.at || 0,
      lastBody: c.lastBody || "",
      handle: c.handle || "",
      lastAt: c.lastAt || 0
    };
    return next;
  }

  function adoptCities(list, sample) {
    cities = sortCities((list || []).map(normalizeCity));
    citiesAreSample = !!sample;
    paintCities();
    refreshLiveChats();
  }

  function countPlaceChats(placeId) {
    var parent =
      "projects/need-inc-app/databases/place/documents/places/" + encodeURIComponent(placeId);
    var url =
      "https://firestore.googleapis.com/v1/" + parent +
      ":runQuery?key=AIzaSyBNPf90JMFZvacLnlcmTqviiyYGRRb-auM";
    var requestBody = {
      structuredQuery: {
        from: [{ collectionId: "messages" }],
        where: {
          fieldFilter: {
            field: { fieldPath: "hidden" },
            op: "EQUAL",
            value: { booleanValue: false }
          }
        },
        orderBy: [{ field: { fieldPath: "createdAt" }, direction: "DESCENDING" }],
        limit: 40
      }
    };
    return fetch(url, {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    })
      .then(function (r) {
        if (!r.ok) throw new Error("chat count " + r.status);
        return r.json();
      })
      .then(function (rows) {
        var count = 0;
        var latest = 0;
        (rows || []).forEach(function (row) {
          var doc = row && row.document;
          if (!doc) return;
          count++;
          var ts = doc.fields && doc.fields.createdAt && doc.fields.createdAt.timestampValue;
          var at = ts ? Date.parse(ts) || 0 : 0;
          if (at > latest) latest = at;
        });
        return { count: count, at: latest };
      });
  }

  var chatRefreshBusy = false;
  function refreshLiveChats() {
    if (chatRefreshBusy || !cities.length) return;
    chatRefreshBusy = true;
    var targets = cities.slice();
    Promise.all(
      targets.map(function (c) {
        if (!c || !c.id) return Promise.resolve();
        return countPlaceChats(c.id)
          .then(function (info) {
            if (!info) return;
            c.chat = info.count;
            if (info.at) c.at = info.at;
          })
          .catch(function () {});
      })
    )
      .then(function () {
        for (var i = 0; i < cities.length; i++) cities[i].forceLit = false;
        cities = sortCities(cities);
        for (var j = 0; j < cities.length && j < 2; j++) {
          if ((cities[j].chat || 0) > 0) cities[j].forceLit = true;
        }
        paintCities();
      })
      .catch(function () {})
      .then(function () {
        chatRefreshBusy = false;
      });
  }

  function loadCities() {
    var url =
      "https://firestore.googleapis.com/v1/projects/emciix-com/databases/(default)/documents/cityStats?pageSize=50";
    fetch(url, { cache: "no-store" })
      .then(function (r) {
        if (!r.ok) throw new Error("cityStats " + r.status);
        return r.json();
      })
      .then(function (data) {
        var docs = (data && data.documents) || [];
        var next = docs.map(parseDoc).filter(Boolean);
        // Sort Lit-first then chat (then opens). Keep zero-chat towns so needprev
        // slice(0,4) / Charts slice(0,10) can fill — exclusive withChat
        // left the homepage By city at 2 rows with a blank footer void.
        next = sortCities(next);
        if (next.length) {
          writeCityCache(next);
          adoptCities(next, false);
          return;
        }
        var cached = readCityCache();
        if (cached && cached.length) {
          adoptCities(cached, false);
          return;
        }
        adoptCities(FALLBACK_CITIES, true);
      })
      .catch(function () {
        var cached = readCityCache();
        if (cached && cached.length) {
          adoptCities(cached, false);
          return;
        }
        if (!cities.length) adoptCities(FALLBACK_CITIES, true);
        else paintCities();
      });
  }


  function playSongFromRow(row) {
    if (!row) return;
    var id = row.getAttribute("data-song-id");
    if (!id) return;
    if (typeof window.EmciixPlayTrack === "function") {
      try {
        window.EmciixPlayTrack(id);
      } catch (e) {}
    }
  }

  function openPlaceFromRow(row) {
    if (!row) return;
    var placeId = row.getAttribute("data-place-id");
    if (!placeId) return;
    var url = "/need/?need=place&p=" + encodeURIComponent(placeId);
    try {
      window.location.href = url;
    } catch (e) {
      window.location.assign(url);
    }
  }

  var placePreview = Object.create(null);
  var placePreviewInflight = Object.create(null);

  function latestChatLabel(preview) {
    var body = preview && preview.body ? String(preview.body).trim() : "";
    if (!body) return "No chat yet";
    var handle = String((preview && preview.handle) || "").replace(/^@/, "").trim();
    var line = trunc(body, 72);
    return handle ? "Latest · @" + handle + " " + line : "Latest · " + line;
  }

  function parsePlaceFields(doc) {
    var f = doc && doc.fields;
    if (!f) return null;
    var body = (f.lastBody && f.lastBody.stringValue) || "";
    var handle = (f.handle && f.handle.stringValue) || "";
    var at = 0;
    if (f.lastAt) {
      if (f.lastAt.integerValue != null) at = parseInt(f.lastAt.integerValue, 10) || 0;
      else if (f.lastAt.doubleValue != null) at = Math.floor(f.lastAt.doubleValue) || 0;
      else if (f.lastAt.timestampValue) at = Date.parse(f.lastAt.timestampValue) || 0;
    }
    return { body: body, handle: handle, at: at };
  }

  function fetchPlaceLatest(placeId) {
    if (!placeId) return Promise.resolve(null);
    if (placePreview[placeId]) return Promise.resolve(placePreview[placeId]);
    if (placePreviewInflight[placeId]) return placePreviewInflight[placeId];
    // Place messages live in Need's named `place` database, not emciix-com cityStats.
    // Query only visible messages so Firestore rules can authorize the public read.
    var parent =
      "projects/need-inc-app/databases/place/documents/places/" + encodeURIComponent(placeId);
    var url =
      "https://firestore.googleapis.com/v1/" + parent +
      ":runQuery?key=AIzaSyBNPf90JMFZvacLnlcmTqviiyYGRRb-auM";
    var requestBody = {
      structuredQuery: {
        from: [{ collectionId: "messages" }],
        where: {
          fieldFilter: {
            field: { fieldPath: "hidden" },
            op: "EQUAL",
            value: { booleanValue: false }
          }
        },
        orderBy: [{ field: { fieldPath: "createdAt" }, direction: "DESCENDING" }],
        limit: 1
      }
    };
    var p = fetch(url, {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    })
      .then(function (r) {
        if (!r.ok) throw new Error("latest chat " + r.status);
        return r.json();
      })
      .then(function (rows) {
        var doc = rows && rows[0] && rows[0].document;
        var f = doc && doc.fields;
        var parsed = {
          body: (f && f.body && f.body.stringValue) || "",
          handle: (f && f.handle && f.handle.stringValue) || "",
          at: (f && f.createdAt && f.createdAt.timestampValue)
            ? Date.parse(f.createdAt.timestampValue) || 0
            : 0
        };
        placePreview[placeId] = parsed;
        delete placePreviewInflight[placeId];
        return parsed;
      })
      .catch(function () {
        delete placePreviewInflight[placeId];
        return null;
      });
    placePreviewInflight[placeId] = p;
    return p;
  }

  function revealLatestOnRow(row) {
    if (!row) return;
    var id = row.getAttribute("data-place-id");
    var latest = row.querySelector(".city-latest");
    if (!id || !latest) return;
    if (latest.getAttribute("data-loaded") === "1") return;
    if (placePreview[id]) {
      latest.textContent = latestChatLabel(placePreview[id]);
      latest.setAttribute("data-loaded", "1");
      return;
    }
    latest.textContent = "Latest · …";
    fetchPlaceLatest(id).then(function (preview) {
      latest.textContent = latestChatLabel(preview || { body: "", handle: "" });
      latest.setAttribute("data-loaded", "1");
    });
  }

  function bindLatestHover(el) {
    if (!el || el._emciixLatestBound) return;
    el._emciixLatestBound = true;
    el.addEventListener("pointerenter", function (e) {
      var row = e.target && e.target.closest ? e.target.closest(".chartrow[data-place-id]") : null;
      if (row && el.contains(row)) revealLatestOnRow(row);
    }, true);
    el.addEventListener("focusin", function (e) {
      var row = e.target && e.target.closest ? e.target.closest(".chartrow[data-place-id]") : null;
      if (row && el.contains(row)) revealLatestOnRow(row);
    });
  }

  function bindChartClicks() {
    var pop = document.getElementById("popChart");
    if (pop && !pop._emciixBound) {
      pop._emciixBound = true;
      pop.addEventListener("click", function (e) {
        var row = e.target && e.target.closest
          ? e.target.closest(".chartrow[data-song-id]")
          : null;
        if (!row || !pop.contains(row)) return;
        playSongFromRow(row);
      });
      pop.addEventListener("keydown", function (e) {
        if (e.key !== "Enter" && e.key !== " ") return;
        var row = e.target && e.target.closest
          ? e.target.closest(".chartrow[data-song-id]")
          : null;
        if (!row || !pop.contains(row)) return;
        e.preventDefault();
        playSongFromRow(row);
      });
    }
    function bindCity(el) {
      if (!el || el._emciixBound) return;
      el._emciixBound = true;
      el.addEventListener("click", function (e) {
        var row = e.target && e.target.closest
          ? e.target.closest(".chartrow[data-place-id]")
          : null;
        if (!row || !el.contains(row)) return;
        openPlaceFromRow(row);
      });
      el.addEventListener("keydown", function (e) {
        if (e.key !== "Enter" && e.key !== " ") return;
        var row = e.target && e.target.closest
          ? e.target.closest(".chartrow[data-place-id]")
          : null;
        if (!row || !el.contains(row)) return;
        e.preventDefault();
        openPlaceFromRow(row);
      });
    }
    bindCity(document.getElementById("cityChart"));
    bindCity(document.getElementById("needCityChart"));
    bindLatestHover(document.getElementById("cityChart"));
    bindLatestHover(document.getElementById("needCityChart"));
  }

  window.EmciixPaintPopularity = function () {
    var live = liveViews();
    if (live) views = live;
    try { paintPop(); } catch (e) {}
    try { if (window.EmciixSyncHeroPopular) window.EmciixSyncHeroPopular(); } catch (e) {}
  };
  window.EmciixPaintCityStats = paintCities;

  // Re-paint popularity when views-boot paints after fetch
  var prevPaint = window.EmciixPaintYtViews;
  window.EmciixPaintYtViews = function () {
    if (typeof prevPaint === "function") {
      try {
        prevPaint();
      } catch (e) {}
    }
    if (window.EmciixLiveYtViews && Object.keys(window.EmciixLiveYtViews).length) views = window.EmciixLiveYtViews;
    else if (window.EmciixYtViewCounts) views = window.EmciixYtViewCounts;
    paintPop();
    try { if (window.EmciixSyncHeroPopular) window.EmciixSyncHeroPopular(); } catch (e) {}
  };

  bindChartClicks();
  paintPop();
  (function seedCities() {
    var cached = readCityCache();
    if (cached && cached.length) adoptCities(cached, false);
    else adoptCities(FALLBACK_CITIES, true);
  })();
  loadViews();
  loadCities();
  setInterval(loadCities, 45000);
  setInterval(refreshLiveChats, 20000);
  setInterval(loadViews, 10000);
})();
