// Stores the app itself. The recitation is saved separately by storage.js and never passes through here.
const CACHE_PREFIX = 'juz-27-app-';
const CACHE_NAME = 'juz-27-app-51c70c28';
const SHELL_FILES = [['./app.css', 'edc334776d975e1ba37f4b624ac5cc2e175eb91343f85371c0b8f7de3b371291'], ['./data.json', '719d73c37a2b5d5f551702499250c3834ea0f7ad86e6817d234472d318f1367f'], ['./fonts/Amiri-Regular.ttf', 'ab391c4147d054c48976e98322ad0eefe1427aa0e0502a12a4c75d80a70cfcd7'], ['./fonts/ArefRuqaa-Regular.ttf', 'ceb786d83ba92f35e96efcd8623c2858d288e0c543c8761ba35b1020989464f9'], ['./fonts/UthmanicHafs1Ver18.woff2', '8c00e7a7d5f773bcfb1642fdcfba505dbd81975fef39f14718827a32d075020c'], ['./icons/icon-192.png', '5f1e35db08a949653e1b09ad74fbd0443bf1ff0b6e5e466bfde81b23d0f8e87e'], ['./icons/icon-512.png', '907acce2ad76dce09953a9174fe3810a400227c15ca32518a8dc9a015dd322c8'], ['./index.html', 'eed6e22df6f9afb9563d11c33aa8d5be2ea1c68c5d45ce71a3435c3c20d713cf'], ['./manifest.webmanifest', '7fd6a303972a4a63223e233abd61545d22786814d227e7df0c1d5a8e762f39a5'], ['./player.js', 'b3f12210a48d1ff2142e5569c957be8db4e7af2fbfcd653e0f5a10ba7fe70007'], ['./start.js', 'e1c97fb3de20a250c7d6b432e3301096e4f2d04eb6c0e2f0e4343f4fe5ebc2a8'], ['./storage.js', 'c45de281c366b06320ac4c96268054cf85467c206227659d9addcd2976d9b045'], ['./views.js', 'c69ea359d1c1b93e1e3c4594fc1ec0641a7aa3eb70e03336d4e1a3dec71cb0a9']];

function toHex(buffer) {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Each file is fetched past the browser cache and must match the hash taken at build time,
// so an update never stores an older or mixed copy of the text.
async function addVerified(cache, [url, sha]) {
  const response = await fetch(new Request(url, { cache: 'reload' }));
  if (!response.ok) throw new Error('missing ' + url);
  const digest = await crypto.subtle.digest('SHA-256', await response.clone().arrayBuffer());
  if (toHex(digest) !== sha) throw new Error('changed ' + url);
  await cache.put(url, response);
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => Promise.all(SHELL_FILES.map((file) => addVerified(cache, file))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names
        .filter((name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
        .map((name) => caches.delete(name))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  const request = event.request.mode === 'navigate' ? './index.html' : event.request;
  event.respondWith(
    caches.open(CACHE_NAME)
      .then((cache) => cache.match(request, { ignoreSearch: true }))
      .then((saved) => saved || fetch(event.request))
  );
});
