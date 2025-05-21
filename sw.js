const CACHE_NAME = 'vivir-tejer-v11'; // Incrementa la versión si cambias archivos cacheados
const urlsToCache = [
  '/',
  '/index.html',
  '/estilos/estilo.css',
  '/estilos/modal.css',
  '/logo_vivirtejer.png',
  // Deberías listar aquí todas las imágenes que quieres que estén precacheadas.
  // Las imágenes agregadas dinámicamente por el admin no estarán aquí a menos que actualices este array.
  'imagenes/amigurumis1.jpeg',
  'imagenes/amigurumis2.jpeg',
  'imagenes/amigurumis3.jpeg',
  'imagenes/amigurumis4.jpeg',
  'imagenes/amigurumis5.jpeg',
  'imagenes/amigurumis6.jpeg',
  'imagenes/amigurumis7.jpeg',
  'imagenes/amigurumis8.jpeg',
  'imagenes/amigurumis9.jpeg',
  'imagenes/tops1.jpeg',
  'imagenes/tops.jpeg', // Asegúrate que el nombre 'tops.jpeg' sea correcto o el que uses
  'imagenes/tops2.jpeg',
  'imagenes/tops3.jpeg',
  'imagenes/tops4.jpeg',
  'imagenes/tops5.jpeg',
  'imagenes/apego.jpeg',
  'imagenes/apego1.jpeg',
  'imagenes/apego2.jpeg',
  'imagenes/apego3.jpeg',
  'imagenes/gorritos1.jpeg',
  'imagenes/gorritos2.jpeg',
  'imagenes/gorritos3.jpeg',
  'imagenes/gorritos4.jpeg',
  'imagenes/gorritos5.jpeg',
  'imagenes/gorritos6.jpeg',
  'imagenes/gorritos7.jpeg',
  'imagenes/muñecos.jpeg',
  'instagram.png',
  'icons8-whatsapp-50.png',
  'facebook.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css' // Cachear FontAwesome
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Cache abierto: ', CACHE_NAME);
        return cache.addAll(urlsToCache.map(url => new Request(url, {cache: 'reload'}))); // Forzar recarga de recursos
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
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Si está en caché, lo devuelve
        if (response) {
          return response;
        }
        // Si no, intenta buscarlo en la red
        return fetch(event.request).then(
          function(response) {
            // Verificar si recibimos una respuesta válida
            if(!response || response.status !== 200 || response.type !== 'basic' && response.type !== 'cors') {
              return response;
            }
            // Importante: Clonar la respuesta. Una respuesta es un stream y solo puede ser consumida una vez.
            // Necesitamos una para el navegador y una para el caché.
            var responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(function(cache) {
                // No cachear POST requests o requests con ciertos esquemas
                if (event.request.method === 'GET' && (event.request.url.startsWith('http') || event.request.url.startsWith('https'))) {
                    cache.put(event.request, responseToCache);
                }
              });
            return response;
          }
        ).catch(function() {
            // Si la red falla y no está en caché, puedes devolver una página offline genérica
            // return caches.match('/offline.html'); // Necesitarías crear y cachear offline.html
            console.log('Fetch fallido para:', event.request.url);
        })
      })
  );
});