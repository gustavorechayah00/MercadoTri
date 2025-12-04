
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('mercado-tri-store').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/index.tsx',
      ]).catch(error => {
         // Suppress error if specific files fail in dev environment
         console.log('Cache pre-fetch skipped for dev environment');
      });
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
