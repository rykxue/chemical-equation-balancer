const CACHE_NAME = 'chemeq-cache-v1';
const ASSETS_TO_CACHE = [
  '/', // Root path (usually serves balancer.html)
  'index.html',
  'balancer.css',
  'balancer.js',
  'FiraCode-Regular.ttf',
  'manifest.json', // Add manifest file
  'icon-192x192.png', // Add icons
  'icon-512x512.png'
];

// Install the Service Worker and cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .catch((error) => {
        console.error('Failed to cache assets:', error);
      })
  );
});

// Serve cached assets when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached asset if found
        if (response) {
          return response;
        }

        // Fetch from network if not in cache
        return fetch(event.request)
          .then((networkResponse) => {
            // Cache the new response for future use
            return caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, networkResponse.clone());
                return networkResponse;
              });
          })
          .catch(() => {
            // Fallback for offline mode
            return caches.match('index.html');
          });
      })
  );
});

// Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
