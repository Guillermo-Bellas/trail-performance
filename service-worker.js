const CACHE = 'vamos-con-todo-v12-3-sesiones-reales-20261015';
const CORE = ['./', './index.html', './manifest.webmanifest', './food-catalog.js'];
const OPTIONAL = ['./icons/icon-180.png','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(CORE);
    await Promise.all(OPTIONAL.map(url => cache.add(url).catch(() => undefined)));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => (k.startsWith('trail-performance-') || k.startsWith('vamos-con-todo-')) && k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(fetch(req).then(response => {
    if (response.ok) {
      const copy = response.clone();
      caches.open(CACHE).then(c => c.put(req,copy)).catch(() => {});
    }
    return response;
  }).catch(async () => {
    const cached = await caches.match(req);
    return cached || (req.mode === 'navigate' ? caches.match('./index.html') : Response.error());
  }));
});
