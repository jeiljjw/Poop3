// Simple service worker - no caching, just for PWA
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());
self.addEventListener('fetch', e => e.respondWith(fetch(e.request)));