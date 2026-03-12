// Swastik Gold & Silver Lab — Service Worker
// Strategy: Network-first in dev, Cache-first in production

const CACHE_NAME = 'swastik-lab-v2';
const IS_DEV = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';

self.addEventListener('install', (event) => {
    // Skip waiting so the new SW activates immediately
    self.skipWaiting();

    if (IS_DEV) {
        // In development, don't pre-cache anything — live server serves all files
        return;
    }

    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(['/', '/index.html', '/manifest.json']);
        })
    );
});

self.addEventListener('activate', (event) => {
    // Take control immediately and delete old caches
    event.waitUntil(
        Promise.all([
            self.clients.claim(),
            caches.keys().then((keys) =>
                Promise.all(
                    keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
                )
            )
        ])
    );
});

self.addEventListener('fetch', (event) => {
    // In development: never intercept, let browser handle natively
    if (IS_DEV) {
        return;
    }

    // In production: network-first, fall back to cache
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Cache successful GET responses
                if (event.request.method === 'GET' && response.status === 200) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                }
                return response;
            })
            .catch(() => caches.match(event.request))
    );
});
