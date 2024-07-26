const CACHE_NAME = 'mergiy-game-v3'; // Не забудьте оновити версію при розгортанні!
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

self.addEventListener('install', (event) => {
  console.log('Service Worker: Встановлення...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Кешування файлів...');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // Видаляємо старий кеш після завантаження нового
        console.log('Service Worker: Видалення старих кешів...');
        return caches.keys().then((cacheNames) => {
          return Promise.all(
            cacheNames.map((cacheName) => {
              if (cacheName !== CACHE_NAME) {
                console.log('Service Worker: Видалено старий кеш:', cacheName);
                return caches.delete(cacheName);
              }
            })
          );
        });
      })
  );
});

self.addEventListener('fetch', (event) => {
  console.log('Service Worker: Запит на:', event.request.url);
  event.respondWith(
    // Реалізуємо стратегію stale-while-revalidate
    caches.match(event.request)
      .then((response) => {
        // Якщо ресурс є в кеші, повертаємо його
        if (response) {
          console.log('Service Worker: Повернення з кешу:', event.request.url);
          // Оновлюємо кеш у фоновому режимі
          event.waitUntil(
            fetch(event.request).then((networkResponse) => {
              if (networkResponse.status === 200) {
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(event.request, networkResponse.clone());
                });
              }
            })
          );
          return response;
        }

        // Якщо ресурсу немає в кеші, завантажуємо з мережі
        console.log('Service Worker: Завантаження з мережі:', event.request.url);
        return fetch(event.request)
          .then((networkResponse) => {
            // Кешуємо новий/оновлений ресурс
            if (networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
            }
            return networkResponse;
          });
      })
  );
});
