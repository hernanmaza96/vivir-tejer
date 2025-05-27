const CACHE_NAME = 'vivirtejer-cache-v1';
const urlsToCache = [
  'index.html',
  'manifest.json',
  'logo_vivirtejer.webp',
  'amigurumis3.webp',
  'amigurumis1.webp',
  'amigurumis2.webp',
  'muñecos.webp',
  'amigurumis5.webp',
  'amigurumis6.webp',
  'amigurumis7.webp',
  'amigurumis8.webp',
  'amigurumis9.webp',
  'tops1.webp',
  'tops.webp',
  'tops2.webp',
  'tops3.webp',
  'tops4.webp',
  'tops5.webp',
  'amigurumis4.webp',
  'apego.webp',
  'apego1.webp',
  'apego2.webp',
  'apego3.webp',
  'gorritos4.webp',
  'gorritos2.webp',
  'gorritos3.webp',
  'gorritos1.webp',
  'gorritos5.webp',
  'gorritos6.webp',
  'gorritos7.webp',
  'gorritos8.webp',
  // ...otros archivos necesarios...
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Cache abierto: ', CACHE_NAME);
        const requests = urlsToCache.map(url => new Request(url, {cache: 'reload'}));
        return Promise.all(requests.map(req => cache.add(req).catch(err => console.warn(`No se pudo cachear ${req.url}: ${err}`))));
      })
      .then(() => self.skipWaiting())
      .catch(err => console.error('Falló el precacheo de archivos: ', err))
  );
});

self.addEventListener('activate', function(event) {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Eliminando caché antiguo: ', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', function(event) {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(function(cachedResponse) {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then(
          function(networkResponse) {
            if(!networkResponse || networkResponse.status !== 200 || (networkResponse.type !== 'basic' && networkResponse.type !== 'cors')) {
              return networkResponse;
            }
            var responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(function(cache) {
                if (event.request.url.startsWith('http')) { 
                    cache.put(event.request, responseToCache);
                }
              });
            return networkResponse;
          }
        ).catch(function() {
          console.log('Fetch fallido y no en caché para:', event.request.url);
        });
      })
  );
});