import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { mkdirSync, readFileSync, writeFileSync, existsSync, copyFileSync } from "node:fs";
import { dirname } from "node:path";

const PROJECT = "emciix-com";

function copyAudio(titled, dest) {
  if (existsSync(dest)) return dest;
  if (existsSync(titled)) {
    mkdirSync(dirname(dest), { recursive: true });
    copyFileSync(titled, dest);
    return dest;
  }
  return existsSync(dest) ? dest : null;
}

function materializeLevel22Audio() {
  const dest = "game/play/levels/no-room-for-me/audio/no-room-for-me.mp3";
  const titled = "game/play/levels/no-room-for-me/No Room for Me.mp3";
  const parts = [];
  for (let i = 1; i <= 12; i++) {
    parts.push("game/play/levels/no-room-for-me/audio/no-room-for-me.mp3.b64." + i);
  }
  const present = parts.filter((p) => existsSync(p));
  if (present.length >= 2) {
    const b64 = present.map((p) => readFileSync(p, "utf8").replace(/\s+/g, "")).join("");
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, Buffer.from(b64, "base64"));
    return true;
  }
  return !!copyAudio(titled, dest);
}

copyAudio("game/play/levels/glitch-by-glitch/Glitch by Glitch.mp3", "game/play/levels/glitch-by-glitch/audio/glitch-by-glitch.mp3");
copyAudio("game/play/levels/watch-it-brppp/Watch it brppp.mp3", "game/play/levels/watch-it-brppp/audio/watch-it-brppp.mp3");

function materializeUniverseCss() {
  const dest = "/tmp/game-with-vacant.css";
  const extras = ["game/play/theme-vacant.css", "game/play/vacant-chairs.css", "game/play/start-hub.css"].filter(existsSync);
  if (!existsSync("game/play/game.css") || extras.length === 0) return null;
  const chunks = [readFileSync("game/play/game.css")];
  for (const extra of extras) {
    chunks.push(Buffer.from("\n"), readFileSync(extra));
  }
  writeFileSync(dest, Buffer.concat(chunks));
  return dest;
}

function materializePlayIndex() {
  const src = "game/play/index.html";
  if (!existsSync(src)) return null;
  let html = readFileSync(src, "utf8");
  if (!html.includes("universe-boot.js")) {
    html = html.replace("</body>", "  <script src=\"/game/play/universe-boot.js?v=vacant-1\" defer></script>\n</body>");
  }
  if (!html.includes("vacant-mode.js")) {
    html = html.replace("</body>", "  <script src=\"/game/play/vacant-mode.js?v=chairs-1\" defer></script>\n</body>");
  }
  if (!html.includes("start-hub.js")) {
    html = html.replace("</body>", "  <script src=\"/game/play/start-hub.js?v=hub-1\" defer></script>\n</body>");
  }
  if (!html.includes("vacant-chairs.css")) {
    html = html.replace("</head>", "  <link rel=\"stylesheet\" href=\"/game/play/vacant-chairs.css?v=chairs-1\" />\n</head>");
  }
  if (!html.includes("start-hub.css")) {
    html = html.replace("</head>", "  <link rel=\"stylesheet\" href=\"/game/play/start-hub.css?v=hub-1\" />\n</head>");
  }
  if (!html.includes("public-rank-list")) {
    html = html.replace(
      '<div class="start-layout">',
      '<div class="start-layout">\n        <aside class="public-rank-card" id="public-rank-card">\n          <span class="public-rank-kicker">SYNCED</span>\n          <h2>PUBLIC BOARD</h2>\n          <div class="public-rank-cols"><span>#</span><span>PLAYER</span><span>PTS</span></div>\n          <ol class="public-rank-list" id="public-rank-list"></ol>\n        </aside>'
    );
    html = html.replace(
      '</button>\n        </div>\n      </div>\n    </div>\n\n    <div id="game"',
      '</button>\n        </div>\n        <aside class="start-jukebox" id="start-jukebox">\n          <span class="jb-kicker">LISTEN</span>\n          <h2>MUSIC</h2>\n          <p class="jb-now" id="jukebox-now">—</p>\n          <div class="jb-controls">\n            <button type="button" id="jukebox-prev">PREV</button>\n            <button type="button" id="jukebox-play">PLAY</button>\n            <button type="button" id="jukebox-next">NEXT</button>\n          </div>\n          <div id="jukebox-list"></div>\n          <audio id="start-hub-audio" preload="none"></audio>\n        </aside>\n      </div>\n    </div>\n\n    <div id="game"'
    );
  }
  html = html.replace("game.css?v=levels-visual-1", "game.css?v=vacant-2");
  html = html.replace("game.js\",", "game.js?v=save-1\",");
  const dest = "/tmp/play-index-vacant.html";
  writeFileSync(dest, html);
  return dest;
}

function materializeGameJs() {
  const src = "game/play/game.js";
  if (!existsSync(src)) return null;
  let s = readFileSync(src, "utf8");
  if (!s.includes("emciix-savepoint")) {
    s = s.replace(
      '  const BESTS_KEY = "emciix-rhythm-bests";',
      '  const BESTS_KEY = "emciix-rhythm-bests";\n  const SAVE_KEY = "emciix-savepoint";\n  function readSaveIndex(list) {\n    try {\n      const raw = localStorage.getItem(SAVE_KEY);\n      if (!raw) return 0;\n      const data = JSON.parse(raw);\n      if (!data || !list || !list.length) return 0;\n      if (data.id) {\n        const i = list.findIndex((l) => l && l.id === data.id);\n        if (i >= 0) return i;\n      }\n      const idx = Math.floor(Number(data.index) || 0);\n      return Math.max(0, Math.min(list.length - 1, idx));\n    } catch (_) { return 0; }\n  }\n  function writeSavePoint(index, meta) {\n    try {\n      localStorage.setItem(SAVE_KEY, JSON.stringify({ index: index, id: meta && meta.id ? meta.id : "", title: meta && meta.title ? meta.title : "", at: Date.now() }));\n    } catch (_) {}\n  }'
    );
    s = s.replace(
      "    levels = await res.json();\n    await loadLevel(0);",
      "    levels = await res.json();\n    const resume = readSaveIndex(levels);\n    await loadLevel(resume);\n    if (resume > 0 && loadStatus) {\n      const title = (levels[resume] && (levels[resume].short || levels[resume].title)) || (\"Level \" + (resume + 1));\n      loadStatus.textContent = \"Save point · \" + title + \" — tap to start\";\n    }"
    );
    s = s.replace(
      "    levelIndex = Math.max(0, Math.min(index, levels.length - 1));\n    levelMeta = levels[levelIndex];",
      "    levelIndex = Math.max(0, Math.min(index, levels.length - 1));\n    levelMeta = levels[levelIndex];\n    writeSavePoint(levelIndex, levelMeta);"
    );
  }
  const dest = "/tmp/game-savepoint.js";
  writeFileSync(dest, s);
  return dest;
}

materializeLevel22Audio();
const universeCss = materializeUniverseCss();
const playIndex = materializePlayIndex();
const gameJs = materializeGameJs();

const PATCHES = [
  ["index.html", "/index.html"],
  ["app.js", "/app.js"],
  ["views-boot.js", "/views-boot.js"],
  ["shelf-boot.js", "/shelf-boot.js"],
  ["stats-boot.js", "/stats-boot.js"],
  [gameJs || "game/play/game.js", "/game/play/game.js"],
  ["game/play/levels.json", "/game/play/levels.json"],
];

if (playIndex) PATCHES.push([playIndex, "/game/play/index.html"]);
if (existsSync("game/play/universe-boot.js")) PATCHES.push(["game/play/universe-boot.js", "/game/play/universe-boot.js"]);
if (existsSync("game/play/vacant-mode.js")) PATCHES.push(["game/play/vacant-mode.js", "/game/play/vacant-mode.js"]);
if (existsSync("game/play/start-hub.js")) PATCHES.push(["game/play/start-hub.js", "/game/play/start-hub.js"]);
if (existsSync("game/play/start-hub.css")) PATCHES.push(["game/play/start-hub.css", "/game/play/start-hub.css"]);
if (existsSync("game/play/vacant-chairs.css")) PATCHES.push(["game/play/vacant-chairs.css", "/game/play/vacant-chairs.css"]);
if (existsSync("game/play/levels/glitch-by-glitch/audio/glitch-by-glitch.mp3")) {
  PATCHES.push(["game/play/levels/glitch-by-glitch/audio/glitch-by-glitch.mp3", "/game/play/levels/glitch-by-glitch/audio/glitch-by-glitch.mp3"]);
}
if (existsSync("game/play/levels/glitch-by-glitch/Glitch by Glitch.mp3")) {
  PATCHES.push(["game/play/levels/glitch-by-glitch/Glitch by Glitch.mp3", "/game/play/levels/glitch-by-glitch/Glitch by Glitch.mp3"]);
}
if (existsSync("game/play/levels/watch-it-brppp/audio/watch-it-brppp.mp3")) {
  PATCHES.push(["game/play/levels/watch-it-brppp/audio/watch-it-brppp.mp3", "/game/play/levels/watch-it-brppp/audio/watch-it-brppp.mp3"]);
}
if (existsSync("game/play/levels/watch-it-brppp/Watch it brppp.mp3")) {
  PATCHES.push(["game/play/levels/watch-it-brppp/Watch it brppp.mp3", "/game/play/levels/watch-it-brppp/Watch it brppp.mp3"]);
}
if (universeCss) PATCHES.push([universeCss, "/game/play/game.css"]);

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

const created = await api(access, "POST", "https://firebasehosting.googleapis.com/v1beta1/sites/" + siteId + "/versions", { config: current.config || {} });
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
