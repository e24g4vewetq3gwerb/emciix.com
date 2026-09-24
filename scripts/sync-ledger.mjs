import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const ledgerPath = "calls/ledger.json";
const listUrl = "https://firestore.googleapis.com/v1/projects/emciix-com/databases/(default)/documents/galacticCalls?pageSize=100";

function readLedger() {
  try {
    const data = JSON.parse(readFileSync(ledgerPath, "utf8"));
    return Array.isArray(data.calls) ? data.calls : [];
  } catch {
    return [];
  }
}

function keep(list) {
  const seen = new Set();
  return list
    .filter((row) => row && row.handle && row.handle !== "x" && row.handle !== "ledgerprobe" && row.handle !== "probe2" && row.handle !== "smoketest")
    .map((row) => {
      row.at = Number(row.at) || 0;
      return row;
    })
    .sort((a, b) => (b.at || 0) - (a.at || 0))
    .filter((row) => {
      const key = row.handle + "|" + row.at + "|" + row.post;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 20);
}

const res = await fetch(listUrl);
let data = { documents: [] };
if (!res.ok) {
  console.log("firestore list", res.status, (await res.text()).slice(0, 240));
} else {
  data = await res.json();
}
const found = [];
if (process.env.CALL_JSON && process.env.CALL_JSON !== "null") {
  try {
    const extra = JSON.parse(process.env.CALL_JSON);
    if (extra && extra.handle) found.push(extra);
  } catch {}
}
try {
  const inbox = await fetch("https://ntfy.sh/emciix-galactic-ledger-9f3c/json?poll=1&since=12h");
  const text = await inbox.text();
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    try {
      const msg = JSON.parse(line);
      if (!msg || msg.event !== "message" || !msg.message) continue;
      const extra = JSON.parse(msg.message);
      if (extra && extra.handle) found.push(extra);
    } catch {}
  }
} catch (err) {
  console.log("inbox", String(err).slice(0, 180));
}
for (const doc of data.documents || []) {
  if (String(doc.name || "").endsWith("/board")) continue;
  const fields = doc.fields || {};
  const handle = fields.handle && fields.handle.stringValue || "";
  if (!handle) continue;
  found.push({
    handle,
    name: (fields.name && fields.name.stringValue) || handle,
    avatar: (fields.avatar && fields.avatar.stringValue) || "",
    post: (fields.post && fields.post.stringValue) || "",
    url: (fields.url && fields.url.stringValue) || "",
    at: fields.at && fields.at.integerValue != null ? Number(fields.at.integerValue) || 0 : 0,
  });
}
const calls = keep(found.concat(readLedger()));
const next = JSON.stringify({ calls }, null, 2) + "\n";
mkdirSync("calls", { recursive: true });
let prev = "";
try { prev = readFileSync(ledgerPath, "utf8"); } catch {}
if (prev === next) {
  console.log("ledger unchanged", calls.length);
  process.exit(0);
}
writeFileSync(ledgerPath, next);
console.log("ledger", calls.map((row) => row.handle).join(","));
