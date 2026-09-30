# Homepage routing ("/")

Not published to hosting (docs only).

## Before 2026-09-30 (previous behaviour)
- `scripts/patch-hosting.mjs` -> `routeHomeToPortal()` always added the hosting redirect
  `{ glob: "/", statusCode: 302, location: "/portal" }` to every new Firebase Hosting version.
- `index.html` (repo commit 74fc2fe) was a redirect-only stub: `<meta http-equiv="refresh" content="0;url=/portal">`,
  `location.replace("/portal")`, canonical `https://emciix.com/portal`. `materializeHome()` appended
  `/portal-preview.js?v=prev-32` to it before upload.
- Result: `https://emciix.com/` -> 302 -> `/portal`.

## Now
- `HOME_REDIRECT_TO_PORTAL = false` in `scripts/patch-hosting.mjs`: the "/" redirect is removed, so "/" serves the
  repo `index.html` (EMCIIX landing page, marked `data-home="landing"` so portal-preview.js is NOT injected).
- `/portal` is untouched.

## Revert (fastest, one line)
1. In `scripts/patch-hosting.mjs` set `const HOME_REDIRECT_TO_PORTAL = true;`
2. Commit and push to main. The patch workflow re-adds the 302 "/" -> "/portal" redirect
   (redirects win over files, so the landing page is no longer shown at "/").

## Full revert (also restore the old stub page)
    git show 74fc2fe:index.html > index.html
    # and set HOME_REDIRECT_TO_PORTAL = true as above, then commit + push to main.
Never use the Firebase CLI to deploy.
