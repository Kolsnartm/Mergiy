const CACHE_NAME = 'mergiy-game-v1.3';
const urlsToCache = [
  '/Mergiy/',
  '/Mergiy/index.html',
  '/Mergiy/style.css',
  '/Mergiy/script.js',
  '/Mergiy/howler.js',
  '/Mergiy/End.wav',
  '/Mergiy/Coin.wav',
  '/Mergiy/Birds.wav',
  '/Mergiy/Boost.wav',
  '/Mergiy/Background.jpeg',
  '/Mergiy/Supermushroom.png',
  '/Mergiy/icon-192x192.png',
  '/Mergiy/icon-512x512.png'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.match(event.request).then(function(response) {
        // Якщо ресурс є в кеші, повертаємо його
        if (response) {
          return response;
        }

        // Якщо ресурсу немає в кеші, завантажуємо його з мережі
        return fetch(event.request).then(function(networkResponse) {
          // Додаємо новий ресурс до кешу
          cache.put(event.request, networkResponse.clone());
          // Повертаємо ресурс з мережі
          return networkResponse;
        }).catch(function() {
          // Якщо немає мережі, повертаємо помилку
          console.log('Fetch failed; returning offline page instead.');
          return caches.match('/Mergiy/offline.html'); // Замініть на вашу сторінку офлайн режиму
        });
      });
    })
  );
});
