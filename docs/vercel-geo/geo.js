// GET /geo -> {"local": true|false}
// Privacy: reads only Vercel's coarse geo headers (country, region, city) for this one
// request and returns a single boolean. Nothing is logged or stored; no IP is read.
// "Local" = Sault Ste. Marie, Ontario, Canada, plus a few neighbouring communities.
// Sault Ste. Marie, Michigan (US-MI) intentionally does NOT count.

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

function normCity(raw) {
  let s = String(raw || "");
  try { s = decodeURIComponent(s); } catch (e) { /* keep raw */ }
  s = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  s = s.replace(/[^a-z0-9]+/g, " ").trim();          // "Sault-Ste.-Marie" -> "sault ste marie"
  s = s.replace(/\bsainte\b/g, "ste").replace(/\bst\b/g, "ste"); // Sainte / St -> Ste
  return s;
}

function isLocal(headers) {
  const h = (k) => String((headers && headers[k]) || "").trim();
  const country = h("x-vercel-ip-country").toUpperCase();
  const region = h("x-vercel-ip-country-region").toUpperCase();
  if (country !== "CA" || region !== "ON") return false;
  return LOCAL_CITIES.has(normCity(h("x-vercel-ip-city")));
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
  res.end(JSON.stringify({ local: isLocal(req.headers) }));
}

module.exports = handler;
module.exports.isLocal = isLocal;
module.exports.normCity = normCity;
