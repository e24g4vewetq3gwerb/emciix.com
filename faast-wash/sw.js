// Faast Wash service worker (scope /faast-wash; the site serves URLs without a trailing slash). Keeps the web app installable and usable on flaky
// connections without serving stale code: content-hashed bundles are cache-first (they never change),
// pages and everything else are network-first with the cached copy as an offline fallback.
// v2 (2026-10-01): production build, demo removed. Every build gets a new cache name, and activate deletes
// every older faast-wash-* cache (including the v1 demo bundles), so returning visitors get the new build.
const CACHE = 'faast-wash-v2-7e14a7d-muq0n35q';
const IMMUTABLE = /\/faast-wash\/app\/(_expo\/static|assets)\//;

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['/faast-wash', '/faast-wash/app'])).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith('faast-wash-') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin || !(url.pathname === '/faast-wash' || url.pathname.startsWith('/faast-wash/'))) return;
  if (IMMUTABLE.test(url.pathname)) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); } return res; })));
    return;
  }
  e.respondWith(fetch(req).then((res) => {
    if (res.ok && (req.mode === 'navigate' || url.pathname.endsWith('.webmanifest'))) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match(req).then((hit) => hit || (req.mode === 'navigate' && url.pathname.startsWith('/faast-wash/app') ? caches.match('/faast-wash/app') : caches.match('/faast-wash')))));
});
