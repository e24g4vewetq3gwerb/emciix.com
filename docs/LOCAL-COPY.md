# Local (Sault Ste. Marie) hero copy

The homepage (`index.html`) and `/hire` show **global** hero copy to everyone, and **local** copy
to visitors in Sault Ste. Marie, Ontario.

- Copy lives in the config blocks: `window.SITE.hero` (global) and `window.SITE.hero.local` in
  `index.html`; `window.HIRE_COPY.global` / `.local` in `hire/index.html`.
- Both variants render into the same CSS grid cell (`.swap`), so the taller one reserves the space
  and swapping never shifts the layout. `html[data-local="1"]` shows the local variant.
- Before first paint, a tiny head script sets `data-local="1"` if `?local=ssm` is in the URL or
  `sessionStorage["emciix.local"] === "1"`. `?local=off` forces global. Overrides are per visit.
- Otherwise (only on emciix.com / emciix.ca), the page calls
  `https://emciix-yt-views.vercel.app/geo` once per browser session (3 s timeout) and caches the
  answer in `sessionStorage["emciix.local"]` ("1" / "0").

## Endpoint

Deployed in the existing Vercel project `emciix-yt-views` as `api/geo.js` (rewrite `/geo`).
Source copy + unit test: `docs/vercel-geo/` (`node docs/vercel-geo/geo.test.js`).

- Returns only `{"local": true|false}`.
- True when `x-vercel-ip-country` = `CA`, `x-vercel-ip-country-region` = `ON`, and the
  normalised `x-vercel-ip-city` is Sault Ste. Marie (any Ste./Sainte/St. spelling) or
  Prince Township, Goulais River, Echo Bay, Garden River. Sault Ste. Marie, Michigan is false.
- No IP is read, nothing is logged or stored. CORS only for https://(www.)emciix.com and
  https://(www.)emciix.ca. `Cache-Control: private, no-store`.
- `connect-src` already allowed `https://emciix-yt-views.vercel.app`, so no CSP change was needed.

## Visitor location pill (added 2026-09-30)

`/geo` now returns `{"local": bool, "label": "City, ON" | "City, Country" | null}`. The label is
built only from Vercel's geo headers: URI-decoded city (sanitised: letters/marks/digits/space/.'’()-,
max 48 chars) plus the region code for CA/US, or the country name elsewhere (GB -> UK, AE -> UAE).

The homepage, /hire and /demo/roofing show a pin pill above the hero ("TORONTO, ON & AREA").
One `/geo` call per browser session; the result is cached in `sessionStorage["emciix.geo"]`
(and `emciix.local`). On / and /hire the pill's height is always reserved and it fades in once a
label is known (hidden if none). On the roofing demo it falls back to the config city.
Test override: `?city=Some%20City`.

## Roofing demo follows the visitor's city
`/demo/roofing` re-renders its copy from the same `/geo` label (or `?city=`): header subtitle,
page title/description, hero ("Roofs that stand up to {City} winters" for Canada, "weather"
elsewhere), intro, services intro, service area ("{City}" + "and surrounding area"), address
card ("123 Demo Street / {City}, {Region}", no postal code), map link, gallery/review places, FAQ
(outside ON "WSIB" becomes "workers' compensation"), footer and JSON-LD address. With a cached
label or `?city=` it localizes before the first paint; otherwise it renders the Sault Ste. Marie
config and swaps once `/geo` answers (skipped if the quote form is being filled in). No label =
original Sault Ste. Marie content, unchanged.
