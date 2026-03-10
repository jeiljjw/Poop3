const CACHE_NAME = 'poop3-adv-v3';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './face.png',
  './poopSound.mp3',
  './Start BGM.mp3',
  './Finish BGM.mp3',
  './icon_192x192.png',
  './icon_512x512.png'
];

// Install event - cache all resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.log('Cache addAll failed:', err);
      })
  );
  // Activate immediately
  self.skipWaiting();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  // Only handle GET requests in the service worker
  if (event.request.method !== 'GET') {
    return;
  }

  // Truly skip cross-origin requests (let the browser handle them)
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        
        return fetch(event.request).then(response => {
          // Don't cache non-successful responses
          if (!response || (response.status !== 200 && response.status !== 304)) {
            return response;
          }
          
          // Clone the response
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        }).catch(() => {
          // Return offline fallback if needed
          if (event.request.destination === 'document') {
            return caches.match('./index.html');
          }
        });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control immediately
  self.clients.claim();
});
