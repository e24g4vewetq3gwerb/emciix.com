// Faast Wash was removed from emciix (2026-10-01). This kill-switch replaces the old service worker
// (scope /faast-wash) for returning visitors: it deletes the faast-wash-* caches, unregisters itself
// and reloads any open /faast-wash tabs so they get the normal 404. No fetch handler, so nothing is intercepted.
// Safe to delete after a few weeks (scripts/patch-hosting.mjs then drops /faast-wash/ entirely).
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k.startsWith('faast-wash-')).map((k) => caches.delete(k)));
    await self.registration.unregister();
    const tabs = await self.clients.matchAll({ type: 'window' });
    tabs.forEach((c) => c.navigate(c.url).catch(() => {}));
  })());
});
