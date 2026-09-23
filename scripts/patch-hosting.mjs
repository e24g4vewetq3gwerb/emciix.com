import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname } from "node:path";

const PROJECT = "emciix-com";

function materializeLevel22Audio() {
  const dest = "game/play/levels/no-room-for-me/audio/no-room-for-me.mp3";
  const parts = [
    "game/play/levels/no-room-for-me/audio/no-room-for-me.mp3.b64.1",
    "game/play/levels/no-room-for-me/audio/no-room-for-me.mp3.b64.2",
    "game/play/levels/no-room-for-me/audio/no-room-for-me.mp3.b64.3",
  ];
  if (!parts.every((p) => existsSync(p))) {
    console.log("level 22 audio parts missing; skip decode");
    return existsSync(dest);
  }
  const b64 = parts.map((p) => readFileSync(p, "utf8").replace(/\s+/g, "")).join("");
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, Buffer.from(b64, "base64"));
  console.log("decoded", dest, readFileSync(dest).length);
  return true;
}

function materializeRoomCss() {
  const dest = "/tmp/game-with-room.css";
  if (!existsSync("game/play/game.css") || !existsSync("game/play/theme-room.css")) return null;
  writeFileSync(
    dest,
    Buffer.concat([readFileSync("game/play/game.css"), Buffer.from("\n"), readFileSync("game/play/theme-room.css")]),
  );
  return dest;
}

materializeLevel22Audio();
const roomCss = materializeRoomCss();

const PATCHES = [
  ["index.html", "/index.html"],
  ["app.js", "/app.js"],
  ["views-boot.js", "/views-boot.js"],
  ["shelf-boot.js", "/shelf-boot.js"],
  ["stats-boot.js", "/stats-boot.js"],
  ["game/play/levels.json", "/game/play/levels.json"],
  ["game/play/levels/no-room-for-me/chart.json", "/game/play/levels/no-room-for-me/chart.json"],
  ["game/play/levels/no-room-for-me/lyrics.json", "/game/play/levels/no-room-for-me/lyrics.json"],
];

if (existsSync("game/play/levels/no-room-for-me/audio/no-room-for-me.mp3")) {
  PATCHES.push([
    "game/play/levels/no-room-for-me/audio/no-room-for-me.mp3",
    "/game/play/levels/no-room-for-me/audio/no-room-for-me.mp3",
  ]);
}
if (roomCss) PATCHES.push([roomCss, "/game/play/game.css"]);
if (existsSync("game/play/theme-room.css")) {
  PATCHES.push(["game/play/theme-room.css", "/game/play/theme-room.css"]);
}

const token = process.env.FIREBASE_TOKEN;
if (!token) {
  console.error("Missing FIREBASE_TOKEN");
  process.exit(1);
}

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
  if (!res.ok) {
    throw new Error("Token exchange failed: " + (data.error || res.status));
  }
  return data.access_token;
}

function api(access, method, url, body) {
  return fetch(url, {
    method,
    headers: {
      Authorization: "Bearer " + access,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  }).then(async (res) => {
    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }
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
const sites = await api(
  access,
  "GET",
  "https://firebasehosting.googleapis.com/v1beta1/projects/" + PROJECT + "/sites"
);
const site = (sites.sites || []).find((s) => s.name === "sites/" + PROJECT) || (sites.sites || [])[0];
if (!site) throw new Error("No hosting site on " + PROJECT);
const siteId = site.name.split("/").pop();
console.log("site", siteId);

const live = await api(
  access,
  "GET",
  "https://firebasehosting.googleapis.com/v1beta1/sites/" + siteId + "/channels/live"
);
const versionName = live.release && live.release.version && live.release.version.name;
if (!versionName) throw new Error("Live channel has no version");
console.log("live version", versionName);

const current = await api(
  access,
  "GET",
  "https://firebasehosting.googleapis.com/v1beta1/" + versionName
);

const files = {};
let pageToken = "";
do {
  const url =
    "https://firebasehosting.googleapis.com/v1beta1/" +
    versionName +
    "/files?pageSize=1000" +
    (pageToken ? "&pageToken=" + encodeURIComponent(pageToken) : "");
  const page = await api(access, "GET", url);
  for (const file of page.files || []) {
    if (file.path && file.hash) files[file.path] = file.hash;
  }
  pageToken = page.nextPageToken || "";
} while (pageToken);
console.log("existing files", Object.keys(files).length);

const uploads = new Map();
for (const [local, remote] of PATCHES) {
  const { gz, hash } = gzipHash(local);
  const key = files[remote] != null ? remote : files[remote.slice(1)] != null ? remote.slice(1) : remote;
  files[key] = hash;
  uploads.set(hash, gz);
  console.log("patch", key, hash.slice(0, 12));
}

const created = await api(
  access,
  "POST",
  "https://firebasehosting.googleapis.com/v1beta1/sites/" + siteId + "/versions",
  { config: current.config || {} }
);
const newVersion = created.name;
console.log("new version", newVersion);

const populated = await api(
  access,
  "POST",
  "https://firebasehosting.googleapis.com/v1beta1/" + newVersion + ":populateFiles",
  { files }
);
const required = new Set(populated.uploadRequiredHashes || []);
console.log("upload required", required.size);

for (const hash of required) {
  const gz = uploads.get(hash);
  if (!gz) throw new Error("Server asked for an unexpected hash " + hash);
  const uploadUrl = String(populated.uploadUrl || "").replace(/\/$/, "") + "/" + hash;
  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + access,
      "Content-Type": "application/octet-stream",
    },
    body: gz,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error("Upload failed " + res.status + " " + text.slice(0, 400));
  }
  console.log("uploaded", hash.slice(0, 12));
}

await api(
  access,
  "PATCH",
  "https://firebasehosting.googleapis.com/v1beta1/" + newVersion + "?updateMask=status",
  { status: "FINALIZED" }
);

const release = await api(
  access,
  "POST",
  "https://firebasehosting.googleapis.com/v1beta1/sites/" +
    siteId +
    "/channels/live/releases?versionName=" +
    encodeURIComponent(newVersion),
  {}
);
console.log("released", release.name || "ok");
