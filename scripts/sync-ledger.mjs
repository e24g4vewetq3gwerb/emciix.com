import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const ledgerPath = "calls/ledger.json";
const listUrl = "https://firestore.googleapis.com/v1/projects/emciix-com/databases/(default)/documents/galacticCalls?pageSize=100";

function readLedger() {
  try {
    const data = JSON.parse(readFileSync(ledgerPath, "utf8"));
    return {
      since: Number(data.since) || 0,
      calls: Array.isArray(data.calls) ? data.calls : [],
    };
  } catch {
    return { since: 0, calls: [] };
  }
}

// Strict safe search: mirror of the screen in portal/galactic-call.js so explicit calls never reach the public ledger.
const SAFE_WORDS = ["sex", "sexy", "sexting", "sexcam", "porn", "porno", "porns", "pron", "p0rn", "xxx", "xxxx", "nsfw", "nude", "nudes", "nudity", "naked", "boob", "boobs", "tits", "titty", "titties", "pussy", "cock", "cocks", "dickpic", "cum", "cumshot", "blowjob", "handjob", "anal", "milf", "dilf", "fetish", "bdsm", "bondage", "erotic", "erotica", "hentai", "ecchi", "rule34", "r34", "camgirl", "camgirls", "stripper", "striptease", "horny", "slut", "sluts", "whore", "fuck", "fucking", "fucked", "orgasm", "dildo", "incest", "gangbang", "threesome", "lingerie", "onlyfans", "fansly", "xnxx", "xvideos", "xhamster", "pornhub", "redtube", "youporn", "brazzers", "chaturbate", "stripchat", "bangbros", "hardcore", "softcore", "uncensored", "playboy", "hot video", "hot videos", "blue film", "adult video", "adult videos", "18+", "18 plus", "only fans", "sx", "booty", "ass", "asses", "butt", "twerk", "twerking", "vagina", "vulva", "penis", "nipple", "nipples", "panties", "upskirt", "cleavage", "busty", "thot", "thots", "desi bhabhi", "lesbian kiss", "lesbian kissing", "big ass", "feet lover", "foot lover"];
const SAFE_PARTS = ["porn", "xnxx", "xvideo", "xhamster", "pornhub", "redtube", "youporn", "onlyfans", "brazzers", "chaturbate", "stripchat", "hentai", "nsfw", "blowjob", "cumshot", "gangbang", "masturbat", "sexvideo", "sexyvideo", "xxxvideo", "nudevideo"];
const SAFE_COMBOS = [
  / (?:hot|sexy|bold|naked|nude|spicy) (?:[a-z0-9]+ )?(?:girl|girls|gf|woman|women|lady|ladies|babe|babes|aunty|auntie|aunties|bhabhi|bhabi|maid|maids|diva|divas|wife|wives|teen|teens|model|models|kiss|kisses|kissing|reel|reels|actress|actresses) /,
  / (?:hot|sexy|bold|naked|nude|spicy) (?:video|videos|film|films|clip|clips|scene|scenes|photo|photos|pic|pics|dance|dances|body|figure|romance) /,
  / (?:desi|romantic|hot|sexy|bold) (?:[a-z]+ )?(?:bhabhi|bhabi|aunty|auntie|aunties) /
];
function plainText(value) {
  var text = String(value || "").toLowerCase();
  try { text = text.normalize("NFKD").replace(/[\u0300-\u036f]/g, ""); } catch (err) {}
  return text;
}
function leetText(text) {
  return text.replace(/[0@4]/g, function (c) { return c === "0" ? "o" : "a"; }).replace(/[$5]/g, "s").replace(/3/g, "e").replace(/[1!|]/g, "i");
}
function isExplicit() {
  for (var a = 0; a < arguments.length; a++) {
    var raw = String(arguments[a] || "");
    if (!raw) continue;
    if (/(^|[^a-z0-9])18\s*\+/i.test(raw) || /(^|[^a-z0-9])x{3,}($|[^a-z0-9])/i.test(raw)) return true;
    var plain = plainText(raw);
    var forms = [plain, leetText(plain)];
    for (var f = 0; f < forms.length; f++) {
      var spaced = " " + forms[f].replace(/[^a-z0-9+]+/g, " ").trim() + " ";
      var packed = forms[f].replace(/[^a-z]+/g, "");
      for (var w = 0; w < SAFE_WORDS.length; w++) {
        if (spaced.indexOf(" " + SAFE_WORDS[w] + " ") >= 0 || spaced.indexOf(" " + SAFE_WORDS[w] + "s ") >= 0) return true;
      }
      for (var c = 0; c < SAFE_COMBOS.length; c++) {
        if (SAFE_COMBOS[c].test(spaced)) return true;
      }
      for (var p = 0; p < SAFE_PARTS.length; p++) {
        if (packed.indexOf(SAFE_PARTS[p]) >= 0) return true;
      }
    }
  }
  return false;
}
// No links: any URL or link-like text (scheme://, www., bare domain.tld, IP address) is rejected.
var LINK_TLDS = "com|net|org|edu|gov|mil|int|io|co|be|ly|gg|tv|me|app|dev|xyz|ai|uk|ca|us|info|biz|site|online|live|link|links|to|cc|ws|fm|am|sh|gl|gd|is|it|de|fr|ru|cn|jp|kr|in|au|br|es|nl|eu|ch|se|no|pl|tk|ml|ga|cf|gq|top|club|shop|store|blog|news|page|art|one|fun|click|win|vip|pro|mobi|name|tech|space|website|zip|mov|lol|wtf|porn|sex|xxx|adult|onion|ly|gl|su|nz|za|mx|ar|tr|ir|id|ph|pk|bd|ng|ke|vn|th|my|sg|hk|tw|ua|cz|at|dk|fi|gr|hu|ie|il|pt|ro|sk|to|ms|la|nu|cx|ac|im|re|red|blue|pink|video|watch|stream|social|chat|games|game|media|music|world|today|life|cloud|host|email|network|digital|agency|studio|design|codes|download|free|gay|sexy|tube|cam|webcam|dating|bet|casino|poker|men|work|works|best|cool|rocks|ninja|guru|wiki|help|photo|photos|pics|pictures|gallery|land|city|country|global|group|team|systems|services|solutions|company|finance|money|cash|loan|market|trade|exchange|crypto|nft|bot|run|now|new|top|plus|biz";
var LINK_BARE = new RegExp("(^|[^a-z0-9-])[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)*\\.(?:" + LINK_TLDS + ")(?![a-z0-9-])", "i");
function hasLink() {
  for (var a = 0; a < arguments.length; a++) {
    var raw = String(arguments[a] || "");
    if (!raw) continue;
    var text = raw.replace(/[\u3002\uff0e\uff61\u2024\u2e33\u00b7]/g, ".").replace(/[\uff0f\u2044\u2215]/g, "/");
    if (/[a-z][a-z0-9+.-]*:\/\//i.test(text)) return true;
    if (/(^|[^a-z0-9])www\d{0,3}\./i.test(text)) return true;
    if (/(^|[^0-9.])\d{1,3}(?:\.\d{1,3}){3}(?![0-9])/.test(text) || /\[[0-9a-f:]+\]/i.test(text)) return true;
    if (/(^|[^a-z0-9-])[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9-]+)*\.[a-z]{2,}(?::\d+)?\//i.test(text)) return true;
    if (/(^|[^a-z0-9])localhost(?![a-z0-9])/i.test(text)) return true;
    if (LINK_BARE.test(text)) return true;
  }
  return false;
}
function queryOf(url) {
  try { const u = new URL(String(url || "")); return u.searchParams.get("search_query") || u.searchParams.get("q") || ""; } catch { return ""; }
}

function keep(list) {
  const best = new Map();
  list
    .filter((row) => row && row.handle && row.handle !== "x" && row.handle !== "ledgerprobe" && row.handle !== "probe2" && row.handle !== "smoketest")
    .filter((row) => !isExplicit(row.handle, row.name, row.post, queryOf(row.url)))
    .filter((row) => !hasLink(row.handle, row.name, row.post))
    .forEach((row) => {
      row.at = Number(row.at) || 0;
      const id = String(row.handle).replace(/^@/, "").toLowerCase();
      if (!id) return;
      const urlName = String(row.url || "").match(/(?:x|twitter|fxtwitter)\.com\/([^/?#]+)\/status\//i);
      if (urlName && urlName[1].toLowerCase() !== id) return;
      const prev = best.get(id);
      if (!prev || row.at >= prev.at) best.set(id, row);
    });
  // No links in the public ledger: the url field is dropped (the call display is text only).
  return [...best.values()].map((row) => ({ ...row, url: "" })).sort((a, b) => (b.at || 0) - (a.at || 0)).slice(0, 20);
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
const saved = readLedger();
const incoming = found.filter((row) => !saved.since || Number(row.at) >= saved.since);
const calls = keep(incoming.concat(saved.calls));
const next = JSON.stringify({ since: saved.since, calls }, null, 2) + "\n";
mkdirSync("calls", { recursive: true });
let prev = "";
try { prev = readFileSync(ledgerPath, "utf8"); } catch {}
if (prev === next) {
  console.log("ledger unchanged", calls.length);
  process.exit(0);
}
writeFileSync(ledgerPath, next);
console.log("ledger", calls.map((row) => row.handle).join(","));
