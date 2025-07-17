// Service Worker para RealCred + PWA
const CACHE_NAME = 'realcred-v1.0.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/scripts.js',
    'assets/images/realcred_logo.png',
    'assets/images/realcred_logo.webp',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

// Install event
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('Cache opened');
                return cache.addAll(urlsToCache);
            })
    );
});

// Fetch event with better error handling
self.addEventListener('fetch', function(event) {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // Skip non-http/https requests
    if (!event.request.url.startsWith('http')) return;

    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                // Return cached version if found
                if (response) {
                    return response;
                }
                
                // Otherwise, try to fetch from network
                return fetch(event.request)
                    .then(function(networkResponse) {
                        // Check if we received a valid response
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }

                        // Clone the response
                        const responseToCache = networkResponse.clone();

                        // Add to cache for future use
                        caches.open(CACHE_NAME)
                            .then(function(cache) {
                                cache.put(event.request, responseToCache);
                            });

                        return networkResponse;
                    })
                    .catch(function(error) {
                        console.error('Fetch failed; returning offline page', error);
                        // You could return a custom offline page here if desired
                    });
            })
    );
});

// Activate event
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Push notification event
self.addEventListener('push', function(event) {
    const options = {
        body: event.data ? event.data.text() : 'Nova oferta disponível!',
        icon: 'assets/images/realcred_logo.png',
        badge: 'assets/images/realcred_logo.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Ver Oferta',
                icon: 'assets/images/realcred_logo.png'
            },
            {
                action: 'close',
                title: 'Fechar',
                icon: 'assets/images/realcred_logo.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('RealCred +', options)
    );
});

// Notification click event
self.addEventListener('notificationclick', function(event) {
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

