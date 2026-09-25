    (function () {
      var form = document.getElementById("galacticCall");
      var input = document.getElementById("callerProfile");
      var ask = document.getElementById("galacticAsk");
      if (!form || !input) return;
      var photo = document.getElementById("callerPhoto");
      var yt = document.getElementById("callerYt");
      var refresh = document.getElementById("callerRefresh");
      var key = "emciix-caller-profile";
      var source = "";
      var mode = "x";
      var heldName = "";
      var heldAvatar = "";
      function paint(card) {
        card = card || {};
        if (card.source) {
          source = card.source;
          form.setAttribute("data-query", card.source);
          if (refresh) refresh.setAttribute("data-handle", card.source);
          try { localStorage.setItem("emciix-x-handle", card.source); } catch (err) {}
        }
        if (card.title) input.value = card.title;
        if (card.post) input.setAttribute("data-title", card.post);
        else if (card.title) input.setAttribute("data-title", card.title);
        if (card.name) heldName = card.name;
        else if (!card.keepName) heldName = "";
        var shown = card.label || heldName || "Have Fun";
        if (shown === "Galactic call:" || shown === "Galactic call") shown = heldName || "Have Fun";
        if (ask) ask.textContent = shown;
        if (card.avatar) heldAvatar = card.avatar;
        else if (!card.keepPhoto) heldAvatar = "";
        if (photo) {
          photo.classList.toggle("is-on", mode !== "youtube");
          photo.classList.toggle("has-photo", mode !== "youtube" && !!heldAvatar);
          photo.style.backgroundImage = mode !== "youtube" && heldAvatar ? "url(\"" + String(heldAvatar).replace(/"/g, "") + "\")" : "";
          photo.textContent = "";
        }
        if (yt) {
          yt.classList.toggle("is-on", mode === "youtube");
          yt.classList.toggle("has-photo", mode === "youtube" && !!heldAvatar);
          yt.style.backgroundImage = mode === "youtube" && heldAvatar ? "url(\"" + String(heldAvatar).replace(/"/g, "") + "\")" : "";
          yt.textContent = "";
        }
        try {
          localStorage.setItem(key, JSON.stringify({ title: input.value, name: heldName, avatar: heldAvatar, source: source, label: ask ? ask.textContent : "Have Fun" }));
        } catch (err) {}
        form.classList.add("is-saved");
      }
      try {
        var saved = JSON.parse(localStorage.getItem(key) || "null");
        if (saved && typeof saved === "object") paint(saved);
        else if (typeof saved === "string" && saved) paint({ title: saved });
      } catch (e) {
        try {
          var plain = localStorage.getItem(key);
          if (plain && plain.charAt(0) !== "{") paint({ title: plain });
        } catch (err) {}
      }
      function focusEmpty() {
        input.focus();
      }
      if (ask) ask.addEventListener("click", focusEmpty);
      form.addEventListener("click", function (event) {
        if (event.target === form) focusEmpty();
      });
      function firstLine(text) {
        var line = String(text || "").split(/\n/).map(function (part) { return part.trim(); }).filter(Boolean)[0] || "";
        return line.replace(/\s+/g, " ").slice(0, 180);
      }
      function hostOf(url) {
        return url.hostname.replace(/^www\./, "").toLowerCase();
      }
      function parseLink(raw) {
        var value = String(raw || "").trim();
        if (!/^https?:\/\//i.test(value)) {
          if (/^(?:www\.)?(?:youtube\.com|youtu\.be|music\.youtube\.com|x\.com|twitter\.com|linkedin\.com|facebook\.com|fb\.com|m\.facebook\.com|fb\.watch)\//i.test(value)) {
            value = "https://" + value;
          } else return null;
        }
        try { return new URL(value); } catch (e) { return null; }
      }
      function siteOf(url) {
        var host = hostOf(url);
        if (host === "youtu.be" || host === "youtube.com" || host === "music.youtube.com" || host === "youtube-nocookie.com" || host.endsWith(".youtube.com")) return "youtube";
        if (host === "x.com" || host === "twitter.com" || host.endsWith(".x.com") || host.endsWith(".twitter.com")) return "x";
        if (host === "linkedin.com" || host.endsWith(".linkedin.com")) return "linkedin";
        if (host === "facebook.com" || host === "fb.com" || host === "fb.watch" || host.endsWith(".facebook.com")) return "facebook";
        return "";
      }
      function videoId(url) {
        var host = hostOf(url);
        if (host === "youtu.be") return url.pathname.split("/").filter(Boolean)[0] || "";
        var parts = url.pathname.split("/").filter(Boolean);
        if (parts[0] === "watch") return url.searchParams.get("v") || "";
        if (parts[0] === "shorts" || parts[0] === "embed" || parts[0] === "live") return parts[1] || "";
        return "";
      }
      function channelId(url) {
        var parts = url.pathname.split("/").filter(Boolean);
        if (parts[0] === "channel" && /^UC[\w-]{20,}$/.test(parts[1] || "")) return parts[1];
        return "";
      }
      function thumbUrl(list) {
        if (!Array.isArray(list) || !list.length) return "";
        var best = list[list.length - 1] || list[0];
        var url = (best && best.url) || "";
        if (url.indexOf("//") === 0) url = "https:" + url;
        return url;
      }
      async function channelLookup(query) {
        var q = String(query || "").replace(/^@/, "").trim();
        if (!q) return null;
        var hosts = ["https://invidious.f5.si", "https://invidious.darkness.services"];
        var list = [];
        for (var h = 0; h < hosts.length; h++) {
          try {
            var res = await fetch(hosts[h] + "/api/v1/search?type=channel&q=" + encodeURIComponent(q));
            if (!res.ok) continue;
            var data = await res.json();
            if (Array.isArray(data) && data.length) { list = data; break; }
          } catch (err) {}
        }
        var needle = q.toLowerCase().replace(/\s+/g, "");
        var exact = null;
        var first = null;
        for (var i = 0; i < list.length; i++) {
          if (!list[i] || !/^UC[\w-]{20,}$/.test(list[i].authorId || "")) continue;
          var hit = { id: list[i].authorId, name: list[i].author || q, avatar: thumbUrl(list[i].authorThumbnails) };
          if (!first) first = hit;
          if ((hit.name || "").toLowerCase().replace(/\s+/g, "") === needle) exact = hit;
        }
        return exact || first;
      }
      async function youtubeByName(query) {
        var found = await channelLookup(query);
        if (!found || !found.id) return null;
        try {
          var rss = "https://www.youtube.com/feeds/videos.xml?channel_id=" + found.id;
          var feed = await fetch("https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent(rss));
          var json = await feed.json();
          var info = json && json.feed || {};
          var item = json && json.items && json.items[0];
          if (item && item.title) return { name: found.name || info.title || query, avatar: found.avatar || info.image || "", title: item.title, url: item.link || "" };
        } catch (err) {}
        try {
          var alt = await fetch("https://invidious.f5.si/api/v1/channels/" + encodeURIComponent(found.id) + "/videos?sort_by=newest");
          var body = await alt.json();
          var video = body && body.videos && body.videos[0];
          if (video && video.title) return { name: found.name || video.author || query, avatar: found.avatar || "", title: video.title, url: video.videoId ? "https://www.youtube.com/watch?v=" + video.videoId : "" };
        } catch (err) {}
        return null;
      }
      async function xByHandle(handle) {
        var profile = await fetch("https://api.fxtwitter.com/2/profile/" + encodeURIComponent(handle));
        if (!profile.ok) return null;
        var user = (await profile.json()).user || {};
        if (!user.screen_name) return null;
        var posts = await fetch("https://api.fxtwitter.com/2/profile/" + encodeURIComponent(handle) + "/statuses?count=8");
        var results = posts.ok ? (((await posts.json()).results) || []) : [];
        var mine = String(user.screen_name).toLowerCase();
        var latest = results.find(function (row) {
          var author = String((row.author && row.author.screen_name) || "").toLowerCase();
          return author === mine && !row.retweet && !row.retweeted_status;
        }) || results.find(function (row) {
          var author = String((row.author && row.author.screen_name) || "").toLowerCase();
          return author === mine;
        }) || {};
        var postUrl = latest.url || (latest.id ? "https://x.com/" + user.screen_name + "/status/" + latest.id : "https://x.com/" + user.screen_name);
        return { name: user.name || handle, handle: user.screen_name, avatar: biggerAvatar(user.avatar_url), title: firstLine(latest.text), url: postUrl };
      }
      async function lookupEither(value) {
        var handle = asHandle(value);
        if (!handle) return null;
        try { return await xByHandle(handle); } catch (e) { return null; }
      }
      function asHandle(value) {
        var raw = String(value || "").trim();
        var url = parseLink(raw);
        if (url && siteOf(url) === "x") {
          var parts = url.pathname.split("/").filter(Boolean);
          if (parts[0] === "status" || parts[0] === "i" || parts[0] === "intent" || parts[0] === "search" || parts[0] === "home") return "";
          return (parts[0] || "").replace(/^@/, "");
        }
        var handle = raw.replace(/^@/, "");
        return /^[A-Za-z0-9_]{1,15}$/.test(handle) ? handle : "";
      }
      function kindOf(value) {
        var raw = String(value || "").trim();
        var url = parseLink(raw);
        var site = url && siteOf(url);
        if (site === "youtube") return { site: "youtube", raw: url.href };
        if (site === "x") {
          var fromUrl = asHandle(raw);
          if (fromUrl) return { site: "x", raw: fromUrl };
        }
        var tagged = raw.match(/^(?:yt|youtube)\s*:\s*(.+)$/i);
        if (tagged) return { site: "youtube", raw: tagged[1].trim() };
        var handle = asHandle(raw);
        if (handle) return { site: "x", raw: handle };
        var bare = raw.replace(/^@/, "").trim();
        if (bare) return { site: "youtube", raw: bare };
        return null;
      }
      async function youtubeCall(raw) {
        var url = parseLink(raw);
        var card = url ? await youtubeCard(url) : await youtubeByName(raw);
        if (!card || !card.title) return null;
        var who = card.name || raw;
        return { handle: who.replace(/\s+/g, ""), name: who, avatar: card.avatar || "", title: card.title, url: card.url || (url ? url.href : "") };
      }
      function resetCall() {
        source = "";
        heldName = "";
        heldAvatar = "";
        form.removeAttribute("data-query");
        input.value = "";
        input.disabled = false;
        input.removeAttribute("data-title");
        input.placeholder = "";
        mode = "x";
        if (photo) {
          photo.classList.add("is-on");
          photo.classList.remove("has-photo");
          photo.style.backgroundImage = "";
          photo.textContent = "x";
        }
        if (yt) {
          yt.classList.remove("is-on", "has-photo");
          yt.style.backgroundImage = "";
          yt.textContent = "yt";
        }
        if (ask) ask.textContent = "Have Fun";
        if (refresh) refresh.removeAttribute("data-handle");
        form.classList.remove("is-saved");
        try {
          localStorage.removeItem(key);
          localStorage.removeItem("emciix-x-handle");
        } catch (err) {}
        input.focus();
      }
      async function youtubeCard(url) {
        var id = videoId(url);
        var name = "";
        var avatar = "";
        var title = "";
        if (id) {
          var video = await fetch("https://noembed.com/embed?url=" + encodeURIComponent("https://www.youtube.com/watch?v=" + id));
          var meta = await video.json();
          if (meta && meta.title && !meta.error) title = meta.title;
          name = meta && meta.author_name || "";
          if (meta && meta.author_url) {
            try {
              var author = new URL(meta.author_url);
              var handle = (author.pathname.split("/").filter(Boolean)[0] || "").replace(/^@/, "");
              if (handle) {
                var found = await channelLookup(handle);
                if (found) { name = found.name || name; avatar = found.avatar || avatar; }
              }
            } catch (e) {}
          }
          if (title) return { name: name, avatar: avatar, title: title, url: "https://www.youtube.com/watch?v=" + id };
        }
        var list = url.searchParams.get("list");
        if (!id && list) {
          try {
            var listed = await fetch("https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent("https://www.youtube.com/feeds/videos.xml?playlist_id=" + list));
            var listedJson = await listed.json();
            var listedInfo = listedJson && listedJson.feed || {};
            var listedItem = listedJson && listedJson.items && listedJson.items[0];
            if (listedInfo.title || (listedItem && listedItem.title)) {
              return {
                name: listedInfo.title || "",
                avatar: listedInfo.image || "",
                title: (listedItem && listedItem.title) || listedInfo.title || "",
                url: (listedItem && listedItem.link) || ("https://www.youtube.com/playlist?list=" + list)
              };
            }
          } catch (e) {}
        }
        var channel = channelId(url);
        var looked = null;
        if (!channel) {
          var parts = url.pathname.split("/").filter(Boolean);
          var handle = "";
          if ((parts[0] || "").charAt(0) === "@") handle = parts[0].slice(1);
          else if (parts[0] === "c" || parts[0] === "user") handle = parts[1] || "";
          if (handle) looked = await channelLookup(handle);
          channel = looked && looked.id;
          if (looked) { name = looked.name; avatar = looked.avatar; }
        }
        if (!channel) return { name: name, avatar: avatar, title: title };
        var rss = "https://www.youtube.com/feeds/videos.xml?channel_id=" + channel;
        var feed = await fetch("https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent(rss));
        var json = await feed.json();
        var info = json && json.feed || {};
        var item = json && json.items && json.items[0];
        return {
          name: name || info.title || "",
          avatar: avatar || info.image || "",
          title: (item && item.title) || title,
          url: (item && item.link) || url.href
        };
      }
      function biggerAvatar(url) {
        return String(url || "").replace("_normal.", "_200x200.");
      }
      async function xCard(url) {
        var parts = url.pathname.split("/").filter(Boolean);
        var at = parts.indexOf("status");
        if (at >= 0 && parts[at + 1]) {
          var one = await fetch("https://api.fxtwitter.com/2/status/" + encodeURIComponent(parts[at + 1]));
          var post = await one.json();
          var status = post && post.status || {};
          var author = status.author || {};
          return { name: author.name || "", avatar: biggerAvatar(author.avatar_url), title: firstLine(status.text) };
        }
        var handle = (parts[0] || "").replace(/^@/, "");
        if (!handle || handle === "home" || handle === "search" || handle === "i" || handle === "intent") return { name: "", avatar: "", title: "" };
        var profile = await fetch("https://api.fxtwitter.com/2/profile/" + encodeURIComponent(handle));
        var user = (await profile.json()).user || {};
        var posts = await fetch("https://api.fxtwitter.com/2/profile/" + encodeURIComponent(handle) + "/statuses?count=1");
        var latest = ((await posts.json()).results || [])[0] || {};
        var who = latest.author || user;
        return { name: who.name || user.name || "", avatar: biggerAvatar(who.avatar_url || user.avatar_url), title: firstLine(latest.text) };
      }
      async function socialCard(href) {
        var res = await fetch("https://api.allorigins.win/get?url=" + encodeURIComponent(href));
        var data = await res.json();
        var html = data && data.contents ? String(data.contents) : "";
        var desc = metaContent(html, "og:description");
        var title = metaContent(html, "og:title");
        var image = metaContent(html, "og:image");
        var name = String(title || "").replace(/\s*[|–-]\s*(LinkedIn|Facebook)\s*$/i, "").trim();
        var post = "";
        if (desc && !/log in|sign in|join linkedin|facebook/i.test(desc)) post = firstLine(desc);
        return { name: name, avatar: image, title: post };
      }
      async function fetchCard(raw) {
        var url = parseLink(raw);
        var site = url && siteOf(url);
        if (!site) return null;
        if (site === "youtube") return youtubeCard(url);
        if (site === "x") return xCard(url);
        return socialCard(url.href);
      }
      function metaContent(html, key) {
        var pattern = new RegExp("(?:property|name)=[\"']" + key + "[\"'][^>]*content=[\"']([^\"']+)[\"']|content=[\"']([^\"']+)[\"'][^>]*(?:property|name)=[\"']" + key + "[\"']", "i");
        var match = String(html || "").match(pattern);
        return match ? (match[1] || match[2] || "") : "";
      }
      function promptFor(next) {
        mode = next === "youtube" ? "youtube" : "x";
        input.value = "";
        input.disabled = false;
        input.placeholder = "";
        if (ask) ask.textContent = "Have Fun";
        if (photo) photo.classList.toggle("is-on", mode !== "youtube");
        if (yt) yt.classList.toggle("is-on", mode === "youtube");
        if (input.offsetParent) input.focus();
      }
      if (photo) photo.addEventListener("click", function (event) {
        event.preventDefault();
        promptFor("x");
      });
      if (yt) yt.addEventListener("click", function (event) {
        event.preventDefault();
        promptFor("youtube");
      });
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        runLookup((input.value || "").trim());
      });
      function runLookup(value) {
        if (!value) return;
        var kind = kindOf(value);
        if (!kind) return;
        var site = kind.site;
        mode = site;
        var handle = kind.raw;
        if (!handle) return;
        var shown = site === "x" ? "@" + handle : "YouTube";
        source = handle;
        form.setAttribute("data-query", handle);
        input.disabled = true;
        input.placeholder = "";
        if (ask) ask.textContent = shown;
        var job = site === "youtube" ? youtubeCall(handle) : xByHandle(handle);
        var fallback = site === "youtube" ? (parseLink(handle) ? handle : "https://www.youtube.com/results?search_query=" + encodeURIComponent(handle)) : "https://x.com/" + handle;
        job.then(function (card) {
          input.disabled = false;
          var who = (card && card.handle) || handle;
          shown = site === "x" ? "@" + who : ((card && card.name) || "YouTube");
          var post = (card && card.title) || "";
          paint({
            name: (card && card.name) || who,
            avatar: card && card.avatar,
            title: post,
            post: post,
            source: who,
            label: shown,
            keepPhoto: !(card && card.avatar)
          });
          input.value = post || value;
          input.placeholder = "";
          if (ask) ask.textContent = shown;
          publishCall({
            handle: who,
            name: (card && card.name) || who,
            avatar: (card && card.avatar) || "",
            post: post,
            url: (card && card.url) || fallback,
            at: Date.now()
          });
        }).catch(function () {
          input.disabled = false;
          input.value = "";
          input.placeholder = "";
          if (ask) ask.textContent = shown;
          paint({ source: handle, label: shown, keepPhoto: true, keepName: true });
          publishCall({
            handle: site === "x" ? handle : shown,
            name: shown,
            avatar: "",
            post: "",
            url: fallback,
            at: Date.now()
          });
        });
      }
      window.emciixRefresh = function (event) {
        if (event) { event.preventDefault(); event.stopPropagation(); }
        resetCall();
      };
      if (refresh) refresh.addEventListener("click", window.emciixRefresh, true);
      var songsNav = document.getElementById("songsNav");
      var playlistCards = document.getElementById("grid");
      if (songsNav && playlistCards) {
        songsNav.addEventListener("click", function (event) {
          event.preventDefault();
          var open = playlistCards.hidden;
          playlistCards.hidden = !open;
          songsNav.setAttribute("aria-expanded", open ? "true" : "false");
          if (open) playlistCards.scrollIntoView({ behavior: "smooth", block: "nearest" });
        });
      }
      var callStore = "emciix-call-history";
      var callUrl = "https://firestore.googleapis.com/v1/projects/emciix-com/databases/(default)/documents/galacticCalls";
      function readCalls() {
        try {
          var list = JSON.parse(localStorage.getItem(callStore) || "[]");
          return Array.isArray(list) ? list : [];
        } catch (err) { return []; }
      }
      function latestCalls(list) {
        var best = {};
        (list || []).forEach(function (row) {
          if (!row || !row.handle) return;
          var id = String(row.handle).replace(/^@/, "").toLowerCase();
          if (!id) return;
          var urlName = String(row.url || "").match(/(?:x|twitter|fxtwitter)\.com\/([^/?#]+)\/status\//i);
          if (urlName && urlName[1].toLowerCase() !== id) return;
          var prev = best[id];
          if (!prev || (Number(row.at) || 0) >= (Number(prev.at) || 0)) best[id] = row;
        });
        return Object.keys(best).map(function (id) { return best[id]; }).sort(function (a, b) {
          return (b.at || 0) - (a.at || 0);
        }).slice(0, 20);
      }
      function renderCalls(list) {
        var ol = document.getElementById("callHistory");
        var kicker = document.getElementById("callKicker");
        if (!ol) return;
        var rows = latestCalls(list);
        ol.textContent = "";
        if (!rows.length) {
          ol.hidden = false;
          if (kicker) kicker.hidden = false;
          var empty = document.createElement("li");
          empty.className = "call-empty";
          empty.textContent = "Fresh ledger";
          ol.appendChild(empty);
          return;
        }
        ol.hidden = false;
        if (kicker) kicker.hidden = false;
        rows.forEach(function (row) {
          var li = document.createElement("li");
          var href = postHref(row);
          var ava = document.createElement(href ? "a" : "span");
          ava.className = "call-ava";
          if (href) {
            ava.href = href;
          }
          if (row.avatar) ava.style.backgroundImage = "url(\"" + String(row.avatar).replace(/"/g, "") + "\")";
          else ava.textContent = "x";
          var copy = document.createElement("span");
          copy.className = "call-copy";
          var who = document.createElement(href ? "a" : "strong");
          who.className = "call-who";
          if (href) {
            who.href = href;
          }
          who.textContent = "@" + String(row.handle).replace(/^@/, "");
          var post = document.createElement("span");
          post.className = "call-post";
          post.textContent = row.post || "No post";
          copy.appendChild(who);
          copy.appendChild(post);
          li.appendChild(ava);
          li.appendChild(copy);
          ol.appendChild(li);
        });
      }
      function postHref(row) {
        var href = String((row && row.url) || "");
        if (/status\/\d+/.test(href)) return href.replace(/^https:\/\/(?:twitter|fxtwitter)\.com\//i, "https://x.com/");
        if (/youtu\.be|youtube\.com/i.test(href)) return href;
        return "";
      }
      function parseCallDoc(doc) {
        var fields = doc && doc.fields || {};
        var at = fields.at && fields.at.integerValue != null ? parseInt(fields.at.integerValue, 10) || 0 : 0;
        return {
          handle: fields.handle && fields.handle.stringValue || "",
          name: fields.name && fields.name.stringValue || "",
          avatar: fields.avatar && fields.avatar.stringValue || "",
          post: fields.post && fields.post.stringValue || "",
          at: at
        };
      }
      var ledgerUrl = "https://raw.githubusercontent.com/e24g4vewetq3gwerb/emciix.com/main/calls/ledger.json";
      var inboxUrl = "https://ntfy.sh/emciix-galactic-ledger-9f3c";
      var ledgerCalls = [];
      var pendingCalls = [];
      function liveCall(row) {
        if (!row || !row.handle) return null;
        if (row.handle === "x" || row.handle === "smoketest" || row.handle === "probe2" || row.handle === "ledgerprobe") return null;
        row.at = Number(row.at) || 0;
        return row;
      }
      function showLedger() {
        var seen = {};
        ledgerCalls.forEach(function (row) { seen[row.handle + "|" + row.at] = 1; });
        var extra = pendingCalls.filter(function (row) { return row && !seen[row.handle + "|" + row.at]; });
        renderCalls(extra.concat(ledgerCalls));
      }
      var ledgerSince = 0;
      function applyLedger(data) {
        ledgerSince = Number(data && data.since) || 0;
        var rows = ((data && data.calls) || []).map(liveCall).filter(Boolean);
        ledgerCalls = latestCalls(rows);
        showLedger();
      }
      function addLive(row) {
        row = liveCall(row);
        if (!row) return;
        if (ledgerSince && row.at < ledgerSince) return;
        ledgerCalls = latestCalls([row].concat(ledgerCalls));
        showLedger();
      }
      function pullInbox() {
        fetch(inboxUrl + "/json?poll=1&since=12h", { cache: "no-store" }).then(function (res) {
          if (!res.ok) throw new Error("inbox");
          return res.text();
        }).then(function (text) {
          var rows = [];
          String(text || "").split("\n").forEach(function (line) {
            if (!line.trim()) return;
            try {
              var msg = JSON.parse(line);
              if (!msg || msg.event !== "message" || !msg.message) return;
              var extra = liveCall(JSON.parse(msg.message));
              if (extra && (!ledgerSince || extra.at >= ledgerSince)) rows.push(extra);
            } catch (err) {}
          });
          if (rows.length) {
            ledgerCalls = latestCalls(rows.concat(ledgerCalls));
            showLedger();
          }
        }).catch(function () {});
      }
      function pullLedger() {
        function take(url) {
          return fetch(url, { cache: "no-store" }).then(function (res) {
            if (!res.ok) throw new Error("ledger");
            return res.json();
          });
        }
        take("/calls/ledger.json?t=" + Date.now()).catch(function () {
          return take(ledgerUrl + "?t=" + Date.now());
        }).then(function (data) {
          applyLedger(data);
          pullInbox();
        }).catch(function () {});
      }
      function publishCall(entry) {
        if (!entry || !entry.handle || !liveCall({ handle: entry.handle })) return;
        entry.avatar = String(entry.avatar || "").slice(0, 480);
        entry.post = String(entry.post || "").slice(0, 180);
        entry.name = String(entry.name || entry.handle).slice(0, 70);
        entry.url = String(entry.url || "").slice(0, 280);
        entry.at = entry.at || Date.now();
        addLive(entry);
        fetch(inboxUrl, {
          method: "POST",
          headers: { "Content-Type": "text/plain", "Title": "call" },
          body: JSON.stringify({
            handle: entry.handle,
            name: entry.name,
            avatar: entry.avatar,
            post: entry.post,
            url: entry.url,
            at: entry.at
          })
        }).catch(function () {});
      }
      pullLedger();
      setInterval(pullInbox, 3000);
      setInterval(pullLedger, 15000);
      try {
        var live = new EventSource(inboxUrl + "/sse");
        live.onmessage = function (event) {
          try {
            var msg = JSON.parse(event.data);
            if (!msg || !msg.message) return;
            addLive(JSON.parse(msg.message));
          } catch (err) {}
        };
      } catch (err) {}
    })();
