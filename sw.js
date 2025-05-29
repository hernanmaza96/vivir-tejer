const CACHE_NAME = 'vivirtejer-cache-v1'; // Considera incrementar la versión si cambias urlsToCache
const urlsToCache = [
  'index.html',
  'manifest.json',
  'logo_vivirtejer.webp', 
  'icon-192.png', 
  'estilos/estilo.css',
  'estilos/modal.css',
  'instagram.png',
  'icons8-whatsapp-50.png',
  'facebook.png',
  'imagenes/placeholder_general.webp',
  'imagenes/placeholder_error.webp',
  'imagenes/placeholder_categoria_vacia.webp',
  'imagenes/placeholder_imagen_no_encontrada.webp',
  'imagenes/placeholder_error_producto.webp',
  'imagenes/amigurumis3.webp',
  'imagenes/amigurumis1.webp',
  'imagenes/amigurumis2.webp',
  'imagenes/muñecos.webp',
  'imagenes/amigurumis5.webp',
  'imagenes/amigurumis6.webp',
  'imagenes/amigurumis7.webp',
  'imagenes/amigurumis8.webp',
  'imagenes/amigurumis9.webp',
  'imagenes/tops1.webp',
  'imagenes/tops.webp',
  'imagenes/tops2.webp',
  'imagenes/tops3.webp',
  'imagenes/tops4.webp',
  'imagenes/tops5.webp',
  'imagenes/amigurumis4.webp',
  'imagenes/apego.webp',
  'imagenes/apego1.webp',
  'imagenes/apego2.webp',
  'imagenes/apego3.webp',
  'imagenes/gorritos4.webp',
  'imagenes/gorritos2.webp',
  'imagenes/gorritos3.webp',
  'imagenes/gorritos1.webp',
  'imagenes/gorritos5.webp',
  'imagenes/gorritos6.webp',
  'imagenes/gorritos7.webp',
  'imagenes/gorritos8.webp'
  // Si 'logo_vivirtejer.png' (usado en el header) también debe ser cacheado, añádelo aquí:
  // 'logo_vivirtejer.png' 
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Cache abierto: ', CACHE_NAME);
        const requests = urlsToCache.map(url => new Request(url, {cache: 'reload'})); 
        return Promise.all(requests.map(req => cache.add(req).catch(err => console.warn(`No se pudo cachear ${req.url}: ${err}`))));
      })
      .then(() => {
        console.log('Todos los archivos cacheados. Service Worker instalado.');
        return self.skipWaiting();
      }) 
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
    .then(() => {
        console.log('Service Worker activado. Controlando clientes.');
        return self.clients.claim();
    }) 
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
        ).catch(function(error) {
          console.error('Fetch fallido y no en caché para:', event.request.url, error);
        });
      })
  );
});