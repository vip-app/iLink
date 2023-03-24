'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/AssetManifest.json": "383385fb4ceaff1b7758ceba6a83d2eb",
"assets/assets/images/default.png": "0d8de0d5c292149439b80a4e52a308cc",
"assets/assets/images/download.png": "75901bc849dc3f8d92105b9cef9757fc",
"assets/assets/images/home.png": "0eafc0b19a677f7d7480eca1e796d984",
"assets/assets/images/layout.png": "7b8bf8fc79d8a5c4f249405aeafeb340",
"assets/assets/images/location.png": "27f3e574707b83aee89e79b6421e0242",
"assets/assets/images/notification.png": "89e9530b0a13a4323e863e169fc606c0",
"assets/assets/images/phone.png": "287a45f60555755e47cbf3b6ff74ebc5",
"assets/assets/images/share.png": "004bc9450064c47e0210b0b31cf2a691",
"assets/assets/images/telegram.png": "6dd74d505ca2195a032a87ff5792a66b",
"assets/assets/images/whatsapp.png": "c5e1cfa102c9ecb230f6adb81f99a2be",
"assets/assets/images/youapp.png": "53eb4793634c7e58c0cda3d1a914d19d",
"assets/assets/json/data.json": "51f6aa40254bf52502b0d9e85ceadb3f",
"assets/assets/svg/drawer_menu.svg": "f0ec3c21834183d1caf5993892e28854",
"assets/FontManifest.json": "7b2a36307916a9721811788013e65289",
"assets/fonts/MaterialIcons-Regular.otf": "e7069dfd19b331be16bed984668fe080",
"assets/NOTICES": "234c92cf9f2249e77179daad80f36707",
"canvaskit/canvaskit.js": "97937cb4c2c2073c968525a3e08c86a3",
"canvaskit/canvaskit.wasm": "3de12d898ec208a5f31362cc00f09b9e",
"canvaskit/profiling/canvaskit.js": "c21852696bc1cc82e8894d851c01921a",
"canvaskit/profiling/canvaskit.wasm": "371bc4e204443b0d5e774d64a046eb99",
"favicon.png": "e9af82f618a0a513823b5937e8d851f8",
"flutter.js": "1cfe996e845b3a8a33f57607e8b09ee4",
"icons/Icon-192-.png": "62c537e5da7570ef232682b706b9ae32",
"icons/Icon-192.png": "2f5c86e101f303d83d133f9ac49f0646",
"icons/Icon-512-.png": "53eb4793634c7e58c0cda3d1a914d19d",
"icons/Icon-512.png": "1e921eb48d57bd3bb4ec4f88de15f63d",
"icons/Icon-maskable-192-.png": "62c537e5da7570ef232682b706b9ae32",
"icons/Icon-maskable-192.png": "137c4a459ed209966bd579c20c32b75d",
"icons/Icon-maskable-512-.png": "53eb4793634c7e58c0cda3d1a914d19d",
"icons/Icon-maskable-512.png": "e63c09d215f2108fdf16fb1c5db9c36b",
"icons/irish.png": "d676aa47da0e6d4c4092f11f9545644d",
"icons/mobile-phone.png": "53eb4793634c7e58c0cda3d1a914d19d",
"index.html": "8be05b6f4b6a2febd5de966b50f47561",
"/": "8be05b6f4b6a2febd5de966b50f47561",
"main.dart.js": "7b01b35b68b55a7cef5d752ab188eb8f",
"manifest.json": "9cbba90b69bc183605911a4dc8f5a39b",
"version.json": "a883da761c45c934bf17c6fc9fafb311"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "main.dart.js",
"index.html",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
