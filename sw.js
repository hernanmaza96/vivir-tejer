const CACHE_NAME = 'vivir-tejer-v15'; // Nueva versión
const urlsToCache = [
  '/',
  '/index.html',
  '/estilos/estilo.css',
  '/estilos/modal.css',
  '/logo_vivirtejer.png', // Logo del header
  '/logo_vivirtejer.jpg', // Favicon que acabamos de agregar
  // Imágenes de productos
  'imagenes/amigurumis1.jpeg', 'imagenes/amigurumis2.jpeg', 'imagenes/amigurumis3.jpeg', 'imagenes/amigurumis4.jpeg', 'imagenes/amigurumis5.jpeg', 'imagenes/amigurumis6.jpeg', 'imagenes/amigurumis7.jpeg', 'imagenes/amigurumis8.jpeg', 'imagenes/amigurumis9.jpeg',
  'imagenes/tops1.jpeg', 'imagenes/tops2.jpeg', 'imagenes/tops3.jpeg', 'imagenes/tops4.jpeg',
  // 'imagenes/tops5.jpeg', // ELIMINADO: Top elegante
  'imagenes/apego.jpeg', 'imagenes/apego2.jpeg', 'imagenes/apego3.jpeg',
  // 'imagenes/apego2.jpeg', // ELIMINADO: Oso de apego (si corresponde)
  'imagenes/gorritos1.jpeg', 'imagenes/gorritos2.jpeg', 'imagenes/gorritos3.jpeg', 'imagenes/gorritos4.jpeg', 'imagenes/gorritos5.jpeg', 'imagenes/gorritos6.jpeg', 'imagenes/gorritos7.jpeg',
  'imagenes/muñecos.jpeg',
  // Imágenes de placeholder
  'imagenes/placeholder_categoria_vacia.jpg',
  'imagenes/placeholder_error_producto.jpg',
  'imagenes/placeholder_imagen_no_encontrada.jpg',
  'imagenes/placeholder_general.jpg', 
  'imagenes/placeholder_error.jpg', 
  // Otros assets
  'instagram.png',
  'icons8-whatsapp-50.png',
  'facebook.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css'
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