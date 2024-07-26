let CACHE_NAME = 'mergiy-game-v2'; // Не забудьте оновити версію при розгортанні!
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
  '/Mergiy/icon-512x512.png',
  // Файли з папки elements:
  '/Mergiy/elements/O4.PNG',
  '/Mergiy/elements/O3.PNG',
  '/Mergiy/elements/O2.PNG',
  '/Mergiy/elements/M8.PNG',
  '/Mergiy/elements/O1.PNG',
  '/Mergiy/elements/E5.PNG',
  '/Mergiy/elements/E4.PNG',
  '/Mergiy/elements/E6.PNG',
  '/Mergiy/elements/E3.PNG',
  '/Mergiy/elements/E2.PNG',
  '/Mergiy/elements/E1.PNG',
  '/Mergiy/elements/S1.PNG',
  '/Mergiy/elements/Ui2.PNG',
  '/Mergiy/elements/S2.PNG',
  '/Mergiy/elements/Ui1.PNG',
  '/Mergiy/elements/M4.PNG',
  '/Mergiy/elements/M5.PNG',
  '/Mergiy/elements/M7.PNG',
  '/Mergiy/elements/M6.PNG',
  '/Mergiy/elements/M2.PNG',
  '/Mergiy/elements/M3.PNG',
  '/Mergiy/elements/charWizard.PNG',
  '/Mergiy/elements/M1.PNG',
];

self.addEventListener('install', function(event) {
  console.log('Service Worker: Встановлення...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Service Worker: Кешування файлів...');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Активація...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Видалено старий кеш:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', function(event) {
  console.log('Service Worker: Запит на:', event.request.url);
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          console.log('Service Worker: Повернення з кешу:', event.request.url);
          return response;
        }

        console.log('Service Worker: Завантаження з мережі:', event.request.url);
        return fetch(event.request)
          .then(function(response) {
            // Кешуємо новий/оновлений ресурс
            if (response.status === 200) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(function(cache) {
                  cache.put(event.request, responseToCache);
                });
            }
            return response;
          });
      })
  );
});
