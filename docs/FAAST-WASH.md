# /faast-wash (Faast Wash web version)

Not published to hosting (docs only).

- **Source:** https://github.com/e24g4vewetq3gwerb/faast-wash-web (private).
- **Build there:** `npm run build && npm run publish:emciix -- <this repo>`.
- That copies the build into `faast-wash/` and the routing/header rules into `scripts/faast-wash-hosting.json`. Commit and push both here.
- Live at https://emciix.ca/faast-wash and https://emciix.com/faast-wash (same Hosting site). The site uses `trailingSlashBehavior: REMOVE`, so the build links to URLs without a trailing slash.

## What `scripts/patch-hosting.mjs` does for it
- Uploads every file under `faast-wash/` to `/faast-wash/...`.
- Before that, drops all existing `/faast-wash/` paths from the copied live version, so old hashed bundles disappear.
- Prepends the rewrites from `faast-wash-hosting.json`: `/faast-wash/app` and `/faast-wash/app/**` → `/faast-wash/app/index.html`.
  This is the SPA fallback, so deep links can be refreshed. Nothing else on the site is rewritten.
- Appends the `/faast-wash` header rules last. Hosting applies the last matching rule per header key, so these replace the site-wide values under `/faast-wash` only:
  - **CSP:**
    - `img-src`: `blob:`, `tile.openstreetmap.org`
    - `connect-src`: Nominatim, Firebase Auth/Firestore/Storage, the Faast Cloud Functions host
  - **`Permissions-Policy`:** `geolocation=(self), camera=(self)`. The site-wide policy blocks both.
  - **Cache:** `immutable` for 1 year on `/faast-wash/app/_expo/**` and `/faast-wash/app/assets/**` (content-hashed), and `no-cache` on `sw.js`.

## Remove
1. Delete `faast-wash/` and `scripts/faast-wash-hosting.json`.
2. Commit and push.

The next patch run releases a version without the faast-wash rules. `faastWash()` returns early when the JSON file is missing, and the `/faast-wash/` files stay in the copied version.
To also drop the files, keep the empty-folder case in mind: the path cleanup only runs when `faast-wash/` has files.
Remove the paths manually in a one-off run if ever needed.
