# Local (Sault Ste. Marie) hero copy

**Status (2026-09-30): automatic location detection is removed from every page.**

- The homepage (`index.html`, all three looks) and `/hire` show the **global** hero copy to everyone.
- `?local=ssm` shows the **local** Sault Ste. Marie copy for that visit only (a tiny head script sets
  `html[data-local="1"]` before the hero renders). Nothing is reserved for the other variant; the
  local copy simply reflows.
- Copy lives in `window.SITE.hero` / `window.SITE.hero.local` (`index.html`) and
  `window.HIRE_COPY.global` / `.local` (`hire/index.html`; keep the static HTML hero in sync with `.global`).
- No page calls `/geo`, reads `sessionStorage` `emciix.geo` / `emciix.local`, or accepts `?city=`.
  On load, `/`, `/hire` and `/demo/roofing` remove those two keys so stale cached values disappear.
- The visitor location pill is gone from `/` and `/hire`. `/demo/roofing` is back to its fixed
  Sault Ste. Marie copy with the static "Sault Ste. Marie & area" pill (real phone/email and the
  current ribbon wording kept).

## Retired endpoint (still deployed, unused)

`https://emciix-yt-views.vercel.app/geo` (Vercel project `emciix-yt-views`, `api/geo.js`, rewrite
`/geo`) is left deployed but nothing on the site calls it. It returns
`{"local": bool, "label": "City, ON" | "City, Country" | null}` from Vercel's coarse geo headers only
(no IP read, nothing logged or stored, CORS limited to emciix.com / emciix.ca, `no-store`).
Source copy + tests: `docs/vercel-geo/` (`node docs/vercel-geo/geo.test.js`). `/views` and
`/uploads` in the same project are unrelated and unchanged. To remove `/geo` later, delete
`api/geo.js` and its rewrite in that project's `vercel.json` and redeploy.

## Explicit city override on the roofing demo (no detection)
`/demo/roofing?city=Toronto%2C%20ON` localizes the demo copy (header, headline winters/weather,
intro, service area, address without postal code, FAQ incl. WSIB -> workers' compensation outside
ON, footer, title, JSON-LD). The value is sanitized (letters, digits, spaces, . , ' - ( ), max 48).
No geo lookup, nothing stored. Without `?city=` it is the fixed Sault Ste. Marie version.
The homepage "Built for your city" section previews it in a same-origin iframe
(`sandbox="allow-scripts"`, `loading="lazy"`, not interactive); existing headers already allow it
(`frame-src 'self'`, `frame-ancestors 'self'`, `X-Frame-Options: SAMEORIGIN`).
