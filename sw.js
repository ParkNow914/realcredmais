// Service Worker para RealCred + PWA
const CACHE_NAME = 'realcred-v1.1.0';
const OFFLINE_URL = '/offline.html';

// URLs essenciais para cache - apenas arquivos que existem
const urlsToCache = [
  '/',
  '/index.html',
  '/offline.html',
  '/styles.css',
  '/scripts.js',
  '/manifest.json',
  '/js/contact-form.js',
  '/js/form-handler.js',
  '/js/form-masks.js',
  '/assets/images/realcred_logo.png',
  '/assets/images/realcred_logo.webp',
  '/assets/images/happy_people1.jpg',
  '/assets/images/happy_people1.webp',
  '/assets/images/happy_people2.jpg',
  '/assets/images/happy_people2.webp',
  '/assets/images/security_icon1.png',
  '/assets/images/security_icon1.webp',
  '/assets/images/security_icon2.png',
  '/assets/images/security_icon2.webp',
  '/assets/images/financial_icon1.png',
  '/assets/images/financial_icon1.webp',
  '/assets/images/financial_icon2.png',
  '/assets/images/financial_icon2.webp',
  '/assets/images/loan_icon1.png',
  '/assets/images/loan_icon1.webp',
  '/assets/images/loan_icon2.png',
  '/assets/images/loan_icon2.webp',
];

// Install event - Cache essencial com fallback gracioso
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      console.log('RealCred+ Cache opened');
      // Cache individual para evitar falha total se um arquivo não existir
      return Promise.allSettled(
        urlsToCache.map(url =>
          cache.add(url).catch(err => {
            console.warn(`Falha ao cachear ${url}:`, err);
            return Promise.resolve();
          })
        )
      );
    })
  );
  // Ativa imediatamente o novo service worker
  self.skipWaiting();
});

// Fetch event with better error handling - Stale While Revalidate strategy
self.addEventListener('fetch', function (event) {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip non-http/https requests
  if (!event.request.url.startsWith('http')) return;

  // Skip requests to external domains (except fonts/CDN)
  const url = new URL(event.request.url);
  const isExternal = url.origin !== self.location.origin;
  const isAllowedExternal = url.hostname.includes('fonts.googleapis.com') ||
                            url.hostname.includes('fonts.gstatic.com') ||
                            url.hostname.includes('cdnjs.cloudflare.com');

  if (isExternal && !isAllowedExternal) return;

  // Check if this is a navigation request
  const isNavigationRequest = event.request.mode === 'navigate';

  event.respondWith(
    caches.match(event.request).then(function (cachedResponse) {
      // Fetch from network in parallel
      const fetchPromise = fetch(event.request)
        .then(function (networkResponse) {
          // Check if we received a valid response
          if (networkResponse && networkResponse.status === 200) {
            // Clone and cache the response
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(function (cache) {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(function (error) {
          console.warn('Fetch failed for:', event.request.url, error);
          // For navigation requests, show offline page (or a minimal fallback HTML)
          if (isNavigationRequest) {
            return caches.match(OFFLINE_URL).then(function (resp) {
              return resp || new Response('<h1>Offline</h1>', {
                headers: { 'Content-Type': 'text/html' },
                status: 503,
                statusText: 'Service Unavailable'
              });
            });
          }
          // Return cached version if available, otherwise a 504 Service Unavailable response
          return Promise.resolve(cachedResponse || new Response(null, { status: 504, statusText: 'Gateway Timeout' }));
        });

      // Return cached version immediately if available, otherwise wait for network
      return cachedResponse || fetchPromise;
    })
  );
});

// Activate event - Limpa caches antigos e assume controle
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Deletando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Assume controle imediato de todas as abas
      return self.clients.claim();
    })
  );
});

// Push notification event
self.addEventListener('push', function (event) {
  const options = {
    body: event.data ? event.data.text() : 'Nova oferta disponível!',
    icon: '/assets/images/realcred_logo.png',
    badge: '/assets/images/realcred_logo.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver Oferta',
        icon: '/assets/images/realcred_logo.png',
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/assets/images/realcred_logo.png',
      },
    ],
  };

  event.waitUntil(self.registration.showNotification('RealCred +', options));
});

// Notification click event
self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(self.clients.openWindow('/'));
  }
});
