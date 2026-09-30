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
