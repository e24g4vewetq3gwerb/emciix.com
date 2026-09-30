const assert = require("assert");
const geo = require("./geo.js");
const H = (country, region, city) => ({ "x-vercel-ip-country": country, "x-vercel-ip-country-region": region, "x-vercel-ip-city": city });
const cases = [
  [H("CA", "ON", "Sault Ste. Marie"), true],
  [H("CA", "ON", "Sault%20Ste.%20Marie"), true],
  [H("CA", "ON", "Sault Sainte Marie"), true],
  [H("CA", "ON", "Sault-Sainte-Marie"), true],
  [H("CA", "ON", "SAULT STE MARIE"), true],
  [H("CA", "ON", "Sault St. Marie"), true],
  [H("ca", "on", "sault ste. marie"), true],
  [H("CA", "ON", "Prince Township"), true],
  [H("CA", "ON", "Goulais%20River"), true],
  [H("CA", "ON", "Echo Bay"), true],
  [H("CA", "ON", "Garden River"), true],
  [H("US", "MI", "Sault Ste. Marie"), false],   // Michigan: not counted
  [H("US", "MI", "Sault Sainte Marie"), false],
  [H("CA", "QC", "Sault Ste. Marie"), false],
  [H("CA", "ON", "Toronto"), false],
  [H("CA", "ON", "Sudbury"), false],
  [H("CA", "ON", "Elliot Lake"), false],
  [H("CA", "ON", ""), false],
  [H("", "", ""), false],
  [{}, false],
  [H("US", "NY", "New York"), false],
  [H("CA", "ON", "Sault Ste. Marie Airport"), false],
];
let n = 0;
for (const [h, want] of cases) { assert.strictEqual(geo.isLocal(h), want, JSON.stringify(h)); n++; }
// handler: response shape + headers
function run(headers, method = "GET") {
  const out = { h: {}, body: "", status: 0 };
  const res = { setHeader: (k, v) => (out.h[k.toLowerCase()] = v), end: (b) => (out.body = b || ""), set statusCode(v) { out.status = v; }, get statusCode() { return out.status; } };
  geo({ method, headers }, res); return out;
}
let r = run({ origin: "https://emciix.com", ...H("CA", "ON", "Sault Ste. Marie") });
assert.deepStrictEqual(JSON.parse(r.body), { local: true }); assert.strictEqual(r.h["access-control-allow-origin"], "https://emciix.com"); assert.match(r.h["cache-control"], /private, no-store/);
r = run({ origin: "https://emciix.ca", ...H("US", "MI", "Sault Ste. Marie") });
assert.deepStrictEqual(JSON.parse(r.body), { local: false }); assert.strictEqual(r.h["access-control-allow-origin"], "https://emciix.ca");
r = run({ origin: "https://evil.example", ...H("CA", "ON", "Sault Ste. Marie") });
assert.strictEqual(r.h["access-control-allow-origin"], undefined);
assert.deepStrictEqual(Object.keys(JSON.parse(r.body)), ["local"]);
r = run({ origin: "https://emciix.com" }, "OPTIONS"); assert.strictEqual(r.status, 204);
r = run({}, "POST"); assert.strictEqual(r.status, 405);
console.log("geo tests passed:", n, "matcher cases + 5 handler checks");
