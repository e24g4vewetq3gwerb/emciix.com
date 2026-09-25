# Security Policy

## Supported versions

emciix.com is a continuously deployed website. Only the **latest `main` branch**
and the **live site** (https://emciix.com, https://emciix.ca) are supported.
Older commits, forks, and preview channels do not receive fixes.

| Version                        | Supported |
| ------------------------------ | --------- |
| `main` / live site             | Yes       |
| Anything older                 | No        |

## Reporting a vulnerability

Please **do not open a public issue** for security problems.

1. Preferred: use GitHub **private vulnerability reporting** —
   go to the repository's **Security** tab and click **Report a vulnerability**
   (https://github.com/e24g4vewetq3gwerb/emciix.com/security/advisories/new).
2. Or email **cue@dialchad.com** with the subject `SECURITY: emciix.com`.

Please include:

- what you found and where (URL, file, or line),
- steps to reproduce or a proof of concept,
- the impact you expect (for example data exposure or account takeover).

You can expect an acknowledgement within **3 business days** and a status
update within **7 days**. Please give us a reasonable window to fix the issue
before any public disclosure. Good-faith research that avoids privacy
violations, data destruction, and service disruption is welcome.

## Scope

In scope: this repository, emciix.com / emciix.ca, the `/game/play` game, and
the Firebase project that backs them (Auth, Firestore, Storage rules).

Out of scope: denial-of-service, spam, social engineering, and third-party
services (YouTube, Apple Music, Google/X sign-in) themselves.

## A note on Firebase web API keys

The `apiKey` values in the Firebase web config (`AIza...`) are **public
identifiers by design**, not secrets. Access is controlled by Firebase
Security Rules, Firebase Auth authorized domains, and API key restrictions
(HTTP referrer + API allow-list) in Google Cloud Console. Reports that only
say "an API key is visible in the page source" are not vulnerabilities unless
you can show the key allows something the rules should block.

## How secrets are kept out of this repo

- Real credentials (service-account JSON, CI tokens, OAuth client secrets,
  Vercel/GitHub tokens, `.env` files) must never be committed. CI reads them
  from **GitHub Actions secrets** (for example `FIREBASE_TOKEN`).
- `.gitignore` blocks common secret files (`.env*`, `*service-account*.json`,
  `*.pem`, `*.key`, debug logs).
- The repository uses GitHub secret scanning (with push protection),
  Dependabot alerts/security updates, and CodeQL code scanning
  (`.github/workflows/codeql.yml`).
- If a secret is ever committed, **rotate it first**, then remove it from the
  code. Removing it from history alone does not make it safe.
