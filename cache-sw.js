let restaurantCache = 'cache1';

let filesToCache = [
    './index.html',
    './restaurant.html',
    './css/styles.css',
    './data/restaurants.json',
    './img/1.jpg',
    './img/2.jpg',
    './img/3.jpg',
    './img/4.jpg',
    './img/5.jpg',
    './img/6.jpg',
    './img/7.jpg',
    './img/8.jpg',
    './img/9.jpg',
    './img/10.jpg',
    './js/dbhelper.js',
    './js/main.js',
    './js/restaurant_info.js',
    'https://fonts.googleapis.com/css?family=Roboto'
];

self.addEventListener('install', function(e) {
    console.log("[ServiceWorker] Installed")
    e.waitUntil( //hold the service worker until following tasks are completed
        caches.open(restaurantCache).then(function(cache) {
            console.log("[ServiceWorker] Caching cacheFiles");
            return cache.addAll(filesToCache);
        })
        .catch(function(err) {
            console.log('[ServiceWorker] falied open the Cach ', err);
        })
    )
});

self.addEventListener('activate', function(e) {
    console.log("[ServiceWorker] Activated")
    e.waitUntil( //
        caches.keys().then(function(cacheNames){ //.keys() gives all cache names with a promise
            return Promise.all(cacheNames.filter(function(cacheName) { // wrap all promises in Promis.all() and wait its completion
                return cacheName.startsWith('restaurant-') && cacheName != restaurantCache;}) //  update the database
                .map(function(cacheName){ //map and
                    return caches.delete(cacheName); // delete outdated caches
                })
            );
        })
    );
});

self.addEventListener('fetch', function (event) { // normal browser fetch(results come from cache)
    console.log('[ServiceWorker] Fetch', event.request.url);
    event.respondWith( // search for match in caches for this request
      caches.match(event.request)// match request with what is in cache
      .then(function (resp) {
        return resp || fetch(event.request)
      .then(function (response) {
        return caches.open('cache1').then(function (cache) { //opens cache object 'cache1'
          cache.put(event.request, response.clone()); // event.request and response are put in the opened cache
          console.log('[ServiceWorker] New Data Cached', event.request.url);
          return response;
          });
        });
      })
      .catch(function(err) {
        console.log('[ServiceWorker] Error Fetching & Caching New Data', err);
        })
    );
});