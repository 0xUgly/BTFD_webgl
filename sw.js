const CACHE_NAME = 'btfd-webgl-cache-v1';
const urlsToCache = [
  'index.html',
  'manifest.json',
  'TemplateData/style.css',
  'TemplateData/favicon.ico',
  'TemplateData/fullscreen-button.png',
  'TemplateData/progress-bar-empty-dark.png',
  'TemplateData/progress-bar-empty-light.png',
  'TemplateData/progress-bar-full-dark.png',
  'TemplateData/progress-bar-full-light.png',
  'TemplateData/unity-logo-dark.png',
  'TemplateData/unity-logo-light.png',
  'TemplateData/webmemd-icon.png',
  // Add icon paths once the user confirms they've added them
  'TemplateData/icons/Btfd_192x.png',
  'TemplateData/icons/Btfd_512x.png',
  'Build/BTFD.loader.js',
  'Build/BTFD.framework.js',
  'Build/BTFD.wasm',
  'Build/BTFD.data'
];

// Install event: Cache the application shell
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching app shell');
        // Use addAll for atomic caching
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: Installation complete');
        // Force the waiting service worker to become the active service worker.
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Caching failed', error);
      })
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activation complete');
      // Tell the active service worker to take control of the page immediately.
      return self.clients.claim();
    })
  );
});

// Fetch event: Serve cached content when offline
self.addEventListener('fetch', (event) => {
  // console.log('Service Worker: Fetching', event.request.url);
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          // console.log('Service Worker: Found in cache', event.request.url);
          return response; // Serve from cache
        }
        // console.log('Service Worker: Not in cache, fetching from network', event.request.url);
        return fetch(event.request); // Fetch from network
      })
      .catch((error) => {
        console.error('Service Worker: Fetch failed', error);
        // Optionally, return a fallback page or resource here
      })
  );
});
