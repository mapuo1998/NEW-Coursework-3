const API_URL = 'https://afterschoolapp-env.eba-pyudtvba.us-east-1.elasticbeanstalk.com/api/images'
let cacheName = 'after-app'
let cacheFiles = ['index.html', 'public/school-icon-top-32.png', 'public/school-icon-top-512.png',
  `${API_URL}/art-icon.svg`,
  `${API_URL}/history-icon.svg`,
  `${API_URL}/science-icon.svg`,
  `${API_URL}/art-icon.svg`,
  `${API_URL}/music-icon.svg`,
  `${API_URL}/programming-icon.svg`,
  `${API_URL}/english-icon.svg`,
  `${API_URL}/PE-icon.svg`,
  `${API_URL}/chemistry-icon.svg`,
  `${API_URL}/geography-icon.svg`]

self.addEventListener('install', function (e) {
  console.log('[Service Worker] Install')
  e.waitUntil(
    caches.open(cacheName).then(function (cache) {
      console.log('[Service Worker] Caching files')
      return cache.addAll(cacheFiles)
    })
  )
})

self.addEventListener('fetch', function (e) {
  e.respondWith(
    caches.match(e.request).then(function (cachedFile) {
      // If the file is in the cache, retrieve it from there
      if (cachedFile) {
        console.log(
          '[Service Worker] Resource FETCHED from the cache for: ' + e.request.url
        )
        return cachedFile
      } else {
        // If the file is not in the cache, download the file
        return fetch(e.request).then(function (response) {
          // Check if the request URL starts with 'chrome-extension'
          if (e.request.url.startsWith('chrome-extension://')) {
            // Do not cache requests from Chrome extensions
            return response;
          }
          return caches.open(cacheName).then(function (cache) {
            // Add the new file to the cache
            cache.put(e.request, response.clone())
            console.log(
              '[Service Worker] Resource fetched and SAVED in the cache for: ' +
              e.request.url
            )
            return response
          })
        })
      }
    })
  )
})

