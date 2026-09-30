// GET /geo -> {"local": true|false, "label": "Toronto, ON" | null}
// Privacy: reads only Vercel's coarse geo headers (country, region, city) for this one
// request. Nothing is logged or stored; no IP is read.
// "local" = Sault Ste. Marie, Ontario, Canada, plus a few neighbouring communities.
// Sault Ste. Marie, Michigan (US-MI) intentionally does NOT count.
// "label" = visitor's city + region code (CA/US) or country name (elsewhere), or null.

const ALLOW = new Set([
  "https://emciix.com",
  "https://www.emciix.com",
  "https://emciix.ca",
  "https://www.emciix.ca",
]);

const LOCAL_CITIES = new Set([
  "sault ste marie",
  "prince township",
  "prince",
  "goulais river",
  "echo bay",
  "garden river",
]);

// Short names people expect in a pill; everything else comes from Intl.DisplayNames.
const COUNTRY_SHORT = { GB: "UK", AE: "UAE", US: "USA" };
const REGION_CODE_COUNTRIES = new Set(["CA", "US"]);

function decodeHeader(raw) {
  let s = String(raw || "");
  try { s = decodeURIComponent(s.replace(/\+/g, " ")); } catch (e) { /* keep raw */ }
  return s;
}

function normCity(raw) {
  let s = decodeHeader(raw);
  s = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  s = s.replace(/[^a-z0-9]+/g, " ").trim();          // "Sault-Ste.-Marie" -> "sault ste marie"
  s = s.replace(/\bsainte\b/g, "ste").replace(/\bst\b/g, "ste"); // Sainte / St -> Ste
  return s;
}

// Display-safe city: letters, marks, digits, spaces and . ' ’ ( ) - only; max 48 chars.
function cleanCity(raw) {
  let s = decodeHeader(raw).normalize("NFC");
  s = s.replace(/[^\p{L}\p{M}\p{N} .'’()\-]/gu, " ").replace(/\s+/g, " ").trim();
  if (s.length > 48) s = s.slice(0, 48).trim();
  return /\p{L}/u.test(s) ? s : "";
}

let displayNames = null;
function countryName(code) {
  if (!/^[A-Z]{2}$/.test(code)) return "";
  if (COUNTRY_SHORT[code]) return COUNTRY_SHORT[code];
  try {
    if (!displayNames) displayNames = new Intl.DisplayNames(["en"], { type: "region" });
    const n = displayNames.of(code);
    if (n && n !== code && !/unknown/i.test(n)) return n;
  } catch (e) { /* no ICU data */ }
  return "";
}

function hdr(headers, k) { return String((headers && headers[k]) || "").trim(); }

function isLocal(headers) {
  const country = hdr(headers, "x-vercel-ip-country").toUpperCase();
  const region = hdr(headers, "x-vercel-ip-country-region").toUpperCase();
  if (country !== "CA" || region !== "ON") return false;
  return LOCAL_CITIES.has(normCity(hdr(headers, "x-vercel-ip-city")));
}

function geoLabel(headers) {
  const country = hdr(headers, "x-vercel-ip-country").toUpperCase();
  const region = hdr(headers, "x-vercel-ip-country-region").toUpperCase();
  const city = cleanCity(hdr(headers, "x-vercel-ip-city"));
  const cName = countryName(country);
  let suffix = cName;
  if (REGION_CODE_COUNTRIES.has(country) && /^[A-Z]{2,3}$/.test(region)) suffix = region;
  if (city) return suffix ? city + ", " + suffix : city;
  return cName || null;
}

function handler(req, res) {
  const origin = req.headers.origin || "";
  if (ALLOW.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Max-Age", "86400");
  }
  res.setHeader("Vary", "Origin");
  res.setHeader("Cache-Control", "private, no-store, max-age=0");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Robots-Tag", "noindex");
  if (req.method === "OPTIONS") { res.statusCode = 204; return res.end(); }
  if (req.method !== "GET" && req.method !== "HEAD") { res.statusCode = 405; res.setHeader("Allow", "GET, OPTIONS"); return res.end(); }
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify({ local: isLocal(req.headers), label: geoLabel(req.headers) }));
}

module.exports = handler;
module.exports.isLocal = isLocal;
module.exports.geoLabel = geoLabel;
module.exports.normCity = normCity;
module.exports.cleanCity = cleanCity;
