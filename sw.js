// Service Worker für Rechnung NG72
const CACHE_NAME = 'rechnung-ng72-v3';
const urlsToCache = [
  './',
  './index.html',
  './app.js',
  './qrcode.min.js',
  './logo.png',
  './manifest.json',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/appicon-1024.png',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
];

// Installation: Cache alle wichtigen Dateien
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cache geöffnet');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Service Worker: Fehler beim Caching', error);
      })
  );
  self.skipWaiting();
});

// Aktivierung: Alte Caches löschen
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Alten Cache löschen', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch: Cache-First Strategie mit iOS-Kompatibilität
self.addEventListener('fetch', (event) => {
  // Ignoriere nicht-GET Requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Ignoriere Chrome-Extensions und andere spezielle URLs
  if (event.request.url.startsWith('chrome-extension://') || 
      event.request.url.startsWith('moz-extension://')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // Cache miss - fetch from network
        return fetch(event.request).then((response) => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Nur GET-Requests cachen
          if (event.request.method === 'GET') {
            // Clone the response
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              })
              .catch((err) => {
                console.error('Fehler beim Caching:', err);
              });
          }
          return response;
        });
      })
      .catch(() => {
        // Fallback für Offline
        if (event.request.destination === 'document' || 
            event.request.mode === 'navigate') {
          return caches.match('./index.html') || caches.match('./');
        }
        // Für andere Ressourcen, versuche im Cache zu finden
        return caches.match(event.request);
      })
  );
});

