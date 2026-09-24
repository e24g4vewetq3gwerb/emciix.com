import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { mkdirSync, readFileSync, writeFileSync, existsSync, copyFileSync } from "node:fs";
import { dirname } from "node:path";

const PROJECT = "emciix-com";
const LOGIN_V = "login-7";

function copyAudio(titled, dest) {
  if (existsSync(dest)) return dest;
  if (existsSync(titled)) {
    mkdirSync(dirname(dest), { recursive: true });
    copyFileSync(titled, dest);
    return dest;
  }
  return existsSync(dest) ? dest : null;
}

copyAudio("game/play/levels/glitch-by-glitch/Glitch by Glitch.mp3", "game/play/levels/glitch-by-glitch/audio/glitch-by-glitch.mp3");
copyAudio("game/play/levels/watch-it-brppp/Watch it brppp.mp3", "game/play/levels/watch-it-brppp/audio/watch-it-brppp.mp3");

function materializeUniverseCss() {
  const dest = "/tmp/game-with-vacant.css";
  const extras = ["game/play/theme-vacant.css", "game/play/vacant-chairs.css", "game/play/start-hub.css", "game/play/session-name.css", "game/play/start-login.css"].filter(existsSync);
  if (!existsSync("game/play/game.css")) return null;
  const chunks = [readFileSync("game/play/game.css")];
  for (const extra of extras) chunks.push(Buffer.from("\n"), readFileSync(extra));
  writeFileSync(dest, Buffer.concat(chunks));
  return dest;
}

function materializePlayIndex() {
  const src = "game/play/index.html";
  if (!existsSync(src)) return null;
  let html = readFileSync(src, "utf8");
  html = html.replace(/start-login\.js\?v=login-\d+/g, "start-login.js?v=" + LOGIN_V);
  html = html.replace(/start-login\.css\?v=login-\d+/g, "start-login.css?v=" + LOGIN_V);
  if (!html.includes("start-login.js")) {
    html = html.replace(
      /<script[^>]+\/game\/play\/game\.js[^>]*><\/script>/,
      '<script src="/game/play/start-login.js?v=' + LOGIN_V + '"></script>\n  $&'
    );
  }
  if (!html.includes("session-guest.js")) {
    html = html.replace("</body>", "  <script type=\"module\" src=\"/game/play/session-guest.js?v=name-1\"></script>\n</body>");
  }
  const scripts = [
    ["universe-boot.js", "/game/play/universe-boot.js?v=vacant-1"],
    ["vacant-mode.js", "/game/play/vacant-mode.js?v=chairs-1"],
    ["start-hub.js", "/game/play/start-hub.js?v=hub-1"],
    ["session-name.js", "/game/play/session-name.js?v=name-1"],
  ];
  for (const [key, srcPath] of scripts) {
    if (!html.includes(key)) html = html.replace("</body>", "  <script src=\"" + srcPath + "\" defer></script>\n</body>");
  }
  const links = [
    ["vacant-chairs.css", "/game/play/vacant-chairs.css?v=chairs-1"],
    ["start-hub.css", "/game/play/start-hub.css?v=hub-1"],
    ["session-name.css", "/game/play/session-name.css?v=name-1"],
    ["start-login.css", "/game/play/start-login.css?v=" + LOGIN_V],
  ];
  for (const [key, href] of links) {
    if (!html.includes(key)) html = html.replace("</head>", "  <link rel=\"stylesheet\" href=\"" + href + "\" />\n</head>");
  }
  if (!html.includes("public-rank-list")) {
    html = html.replace('<div class="start-layout">', '<div class="start-layout">\n        <aside class="public-rank-card" id="public-rank-card">\n          <span class="public-rank-kicker">SYNCED</span>\n          <h2>PUBLIC BOARD</h2>\n          <div class="public-rank-cols"><span>#</span><span>PLAYER</span><span>PTS</span></div>\n          <ol class="public-rank-list" id="public-rank-list"></ol>\n        </aside>');
    html = html.replace('</button>\n        </div>\n      </div>\n    </div>\n\n    <div id="game"', '</button>\n        </div>\n        <aside class="start-jukebox" id="start-jukebox">\n          <span class="jb-kicker">LISTEN</span>\n          <h2>MUSIC</h2>\n          <p class="jb-now" id="jukebox-now">—</p>\n          <div class="jb-controls">\n            <button type="button" id="jukebox-prev">PREV</button>\n            <button type="button" id="jukebox-play">PLAY</button>\n            <button type="button" id="jukebox-next">NEXT</button>\n          </div>\n          <div id="jukebox-list"></div>\n          <audio id="start-hub-audio" preload="none"></audio>\n        </aside>\n      </div>\n    </div>\n\n    <div id="game"');
  }
  const dest = "/tmp/play-index-vacant.html";
  writeFileSync(dest, html);
  return dest;
}

function materializeGameJs() {
  const src = "game/play/game.js";
  if (!existsSync(src)) return null;
  let s = readFileSync(src, "utf8");
  if (!s.includes("emciix-savepoint")) {
    s = s.replace('  const BESTS_KEY = "emciix-rhythm-bests";', '  const BESTS_KEY = "emciix-rhythm-bests";\n  const SAVE_KEY = "emciix-savepoint";\n  function readSaveIndex(list) { try { const raw = localStorage.getItem(SAVE_KEY); if (!raw) return 0; const data = JSON.parse(raw); if (!data || !list || !list.length) return 0; if (data.id) { const i = list.findIndex((l) => l && l.id === data.id); if (i >= 0) return i; } const idx = Math.floor(Number(data.index) || 0); return Math.max(0, Math.min(list.length - 1, idx)); } catch (_) { return 0; } }\n  function writeSavePoint(index, meta) { try { localStorage.setItem(SAVE_KEY, JSON.stringify({ index: index, id: meta && meta.id ? meta.id : "", title: meta && meta.title ? meta.title : "", at: Date.now() })); } catch (_) {} }');
    s = s.replace("    levels = await res.json();\n    await loadLevel(0);", "    levels = await res.json();\n    const resume = readSaveIndex(levels);\n    await loadLevel(resume);");
    s = s.replace("    levelIndex = Math.max(0, Math.min(index, levels.length - 1));\n    levelMeta = levels[levelIndex];", "    levelIndex = Math.max(0, Math.min(index, levels.length - 1));\n    levelMeta = levels[levelIndex];\n    writeSavePoint(levelIndex, levelMeta);");
  }
  const dest = "/tmp/game-savepoint.js";
  writeFileSync(dest, s);
  return dest;
}

function materializeHome() {
  const src = "index.html";
  if (!existsSync(src)) return null;
  let html = readFileSync(src, "utf8");
  html = html.replace(/portal-preview\.js\?v=prev-\d+/g, "portal-preview.js?v=prev-6");
  if (!html.includes("portal-preview.js")) {
    html = html.replace("</body>", '  <script src="/portal-preview.js?v=prev-6" defer></script>\n</body>');
  }
  const dest = "/tmp/home-portal.html";
  writeFileSync(dest, html);
  return dest;
}

const universeCss = materializeUniverseCss();
const playIndex = materializePlayIndex();
const gameJs = materializeGameJs();
const homeIndex = materializeHome();

const PATCHES = [
  [homeIndex || "index.html", "/index.html"],
  ["app.js", "/app.js"],
  [gameJs || "game/play/game.js", "/game/play/game.js"],
  ["game/play/levels.json", "/game/play/levels.json"],
];
if (playIndex) PATCHES.push([playIndex, "/game/play/index.html"]);
["game/play/universe-boot.js","game/play/vacant-mode.js","game/play/start-hub.js","game/play/start-hub.css","game/play/session-name.js","game/play/session-name.css","game/play/session-guest.js","game/play/start-login.js","game/play/start-login.css","game/play/vacant-chairs.css","portal-preview.js","portal/index.html","portal/invite.html","portal/assets/index-DLVCRiHz.js","portal/assets/index-C17i1khB.css","portal/assets/planet.png","portal/assets/moon.png","portal/assets/favicon-portal.svg","portal/assets/favicon-CozO3afC.svg"].forEach((p) => {
  if (existsSync(p)) PATCHES.push([p, "/" + p]);
});
if (universeCss) PATCHES.push([universeCss, "/game/play/game.css"]);
["video/no-room-for-me.mp4","video/no-room.html","video/tell-me-more.mp4","video/tell-me-more.html","media/drive-map.json","covers/no-room-for-me.jpg","covers/tell-me-more.jpg","assets/refresh-planet.png","calls/ledger.json"].forEach((file) => {
  if (existsSync(file)) PATCHES.push([file, "/" + file]);
});

const token = process.env.FIREBASE_TOKEN;
if (!token) { console.error("Missing FIREBASE_TOKEN"); process.exit(1); }

async function accessToken() {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: token,
    client_id: "563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com",
    client_secret: "j9iVZfS8kkCEFUPaAeJV0sAi",
  });
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const data = await res.json();
  if (!res.ok) throw new Error("Token exchange failed: " + (data.error || res.status));
  return data.access_token;
}

function api(access, method, url, body) {
  return fetch(url, {
    method,
    headers: { Authorization: "Bearer " + access, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  }).then(async (res) => {
    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }
    if (!res.ok) {
      const msg = typeof data === "string" ? data : JSON.stringify(data);
      throw new Error(method + " " + url + " -> " + res.status + " " + msg.slice(0, 800));
    }
    return data;
  });
}

function gzipHash(filePath) {
  const gz = gzipSync(readFileSync(filePath));
  const hash = createHash("sha256").update(gz).digest("hex");
  return { gz, hash };
}

const access = await accessToken();
const sites = await api(access, "GET", "https://firebasehosting.googleapis.com/v1beta1/projects/" + PROJECT + "/sites");
const site = (sites.sites || []).find((s) => s.name === "sites/" + PROJECT) || (sites.sites || [])[0];
if (!site) throw new Error("No hosting site on " + PROJECT);
const siteId = site.name.split("/").pop();
const live = await api(access, "GET", "https://firebasehosting.googleapis.com/v1beta1/sites/" + siteId + "/channels/live");
const versionName = live.release && live.release.version && live.release.version.name;
if (!versionName) throw new Error("Live channel has no version");
const current = await api(access, "GET", "https://firebasehosting.googleapis.com/v1beta1/" + versionName);

const files = {};
let pageToken = "";
do {
  const url = "https://firebasehosting.googleapis.com/v1beta1/" + versionName + "/files?pageSize=1000" + (pageToken ? "&pageToken=" + encodeURIComponent(pageToken) : "");
  const page = await api(access, "GET", url);
  for (const file of page.files || []) {
    if (file.path && file.hash) files[file.path] = file.hash;
  }
  pageToken = page.nextPageToken || "";
} while (pageToken);

const uploads = new Map();
for (const [local, remote] of PATCHES) {
  if (!existsSync(local)) continue;
  const { gz, hash } = gzipHash(local);
  const key = files[remote] != null ? remote : files[remote.slice(1)] != null ? remote.slice(1) : remote;
  files[key] = hash;
  uploads.set(hash, gz);
  console.log("patch", key);
}

async function pruneStorage() {
  try {
    await api(access, "PATCH", "https://firebasehosting.googleapis.com/v1beta1/sites/" + siteId + "/channels/live?updateMask=retainedReleaseCount", { retainedReleaseCount: 1 });
    console.log("retainedReleaseCount=1");
  } catch (err) {
    console.log("retain", String(err.message || err).slice(0, 200));
  }
  const liveName = versionName;
  let token = "";
  const versions = [];
  do {
    const url = "https://firebasehosting.googleapis.com/v1beta1/sites/" + siteId + "/versions?pageSize=100" + (token ? "&pageToken=" + encodeURIComponent(token) : "");
    const page = await api(access, "GET", url);
    for (const v of page.versions || []) versions.push(v);
    token = page.nextPageToken || "";
  } while (token);
  const doomed = versions.filter((v) => v && v.name && v.name !== liveName && v.status !== "DELETED");
  let n = 0;
  for (const v of doomed) {
    try {
      await api(access, "DELETE", "https://firebasehosting.googleapis.com/v1beta1/" + v.name);
      n += 1;
    } catch (err) {
      console.log("keep", v.name, String(err.message || err).slice(0, 120));
    }
  }
  console.log("versions", versions.length, "deleted", n);
}
await pruneStorage();


function widenConnect(config) {
  const extras = {
    "connect-src": ["https://api.fxtwitter.com", "https://invidious.darkness.services", "https://raw.githubusercontent.com", "https://api.github.com", "https://ntfy.sh", "https://noembed.com", "https://api.rss2json.com", "https://api.microlink.io"],
    "img-src": ["https://*.ggpht.com", "https://*.licdn.com", "https://*.fbcdn.net", "https://*.googleusercontent.com", "https://i.ytimg.com"],
  };
  let hits = 0;
  function walk(node) {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    for (const key of Object.keys(node)) {
      const value = node[key];
      if (typeof value === "string" && (value.includes("connect-src") || value.includes("img-src"))) {
        let next = value;
        for (const directive of Object.keys(extras)) {
          if (!next.includes(directive)) continue;
          const match = next.match(new RegExp(directive + "[^;]*"));
          if (!match) continue;
          let src = match[0];
          for (const origin of extras[directive]) {
            if (!src.includes(origin)) src += " " + origin;
          }
          next = next.replace(match[0], src);
          hits += 1;
        }
        node[key] = next;
      } else if (value && typeof value === "object") walk(value);
    }
  }
  walk(config);
  console.log("csp widened", hits, "config keys", Object.keys(config || {}));
  return config || {};
}

const created = await api(access, "POST", "https://firebasehosting.googleapis.com/v1beta1/sites/" + siteId + "/versions", { config: widenConnect(current.config || {}) });
const newVersion = created.name;
const populated = await api(access, "POST", "https://firebasehosting.googleapis.com/v1beta1/" + newVersion + ":populateFiles", { files });
const required = new Set(populated.uploadRequiredHashes || []);
for (const hash of required) {
  const gz = uploads.get(hash);
  if (!gz) throw new Error("Server asked for an unexpected hash " + hash);
  const uploadUrl = String(populated.uploadUrl || "").replace(/\/$/, "") + "/" + hash;
  const res = await fetch(uploadUrl, { method: "POST", headers: { Authorization: "Bearer " + access, "Content-Type": "application/octet-stream" }, body: gz });
  if (!res.ok) throw new Error("Upload failed " + res.status);
}
await api(access, "PATCH", "https://firebasehosting.googleapis.com/v1beta1/" + newVersion + "?updateMask=status", { status: "FINALIZED" });
await api(access, "POST", "https://firebasehosting.googleapis.com/v1beta1/sites/" + siteId + "/channels/live/releases?versionName=" + encodeURIComponent(newVersion), {});
console.log("released ok");

async function allowGalacticCalls() {
  const project = "projects/emciix-com";
  const releases = await api(access, "GET", "https://firebaserules.googleapis.com/v1/" + project + "/releases");
  const release = (releases.releases || []).find((item) => String(item.name || "").endsWith("/cloud.firestore"));
  if (!release || !release.rulesetName) {
    console.log("no firestore release");
    return;
  }
  const ruleset = await api(access, "GET", "https://firebaserules.googleapis.com/v1/" + release.rulesetName);
  const file = ((ruleset.source && ruleset.source.files) || [])[0];
  if (!file || typeof file.content !== "string") {
    console.log("no rules source");
    return;
  }
  if (file.content.includes('callId != "board"')) {
    console.log("galactic rules already set");
    return;
  }
  const marker = "match /databases/{database}/documents {";
  if (!file.content.includes(marker) && !file.content.includes("match /galacticCalls/{callId}")) {
    console.log("rules shape unexpected");
    return;
  }
  const block = `
    match /galacticCalls/{callId} {
      allow read: if true;
      allow create: if callId != "board"
        && request.resource.data.keys().hasOnly(['handle', 'name', 'avatar', 'post', 'url', 'at'])
        && request.resource.data.handle is string
        && request.resource.data.handle.size() > 0
        && request.resource.data.handle.size() < 40
        && request.resource.data.name is string
        && request.resource.data.name.size() < 80
        && request.resource.data.avatar is string
        && request.resource.data.avatar.size() < 500
        && request.resource.data.post is string
        && request.resource.data.post.size() < 300
        && request.resource.data.url is string
        && request.resource.data.url.size() < 300
        && request.resource.data.at is int;
    }`;
  const content = file.content.includes("match /galacticCalls/{callId}")
    ? file.content.replace(/match \/galacticCalls\/\{callId\} \{[\s\S]*?\n    \}/, block.trim())
    : file.content.replace(marker, marker + block);
  if (!content.includes('callId != "board"')) {
    console.log("could not rewrite galactic rule");
    return;
  }
  const created = await api(access, "POST", "https://firebaserules.googleapis.com/v1/" + project + "/rulesets", {
    source: { files: [{ name: file.name || "firestore.rules", content }] },
  });
  await api(access, "PATCH", "https://firebaserules.googleapis.com/v1/" + release.name + "?updateMask=rulesetName", {
    release: {
      name: release.name,
      rulesetName: created.name,
    },
  });
  console.log("galactic rules released");
}
try { await allowGalacticCalls(); } catch (err) { console.log("galactic rules skipped", String(err.message || err).slice(0, 400)); }
