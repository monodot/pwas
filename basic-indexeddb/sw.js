const CACHE_NAME = 'indexeddb-pwa-v1';

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.all(
        ASSETS.map(url =>
          cache.add(url).catch(err => console.warn(`Failed to cache ${url}:`, err))
        )
      )
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Cache-first for app shell; network-only for the data API (handled by app via IndexedDB)
self.addEventListener('fetch', event => {
  if (event.request.url.includes('jsonplaceholder.typicode.com')) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).catch(() =>
        new Response('You are offline and this resource is not cached.', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' },
        })
      );
    })
  );
});
