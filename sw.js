const CACHE_NAME = 'iptv-elpop-v2';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    './assets/libs/fontawesome/css/all.min.css',
    './assets/libs/hls.min.js',
    // تأكد أن ملف tailwind.js موجود بجانب index.html أو قم بتحميله
    './tailwind.js' 
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => Promise.all(
            keys.map((key) => {
                if (key !== CACHE_NAME) return caches.delete(key);
            })
        ))
    );
});

self.addEventListener('fetch', (event) => {
    // استراتيجية Network First للمحتوى المتغير (API) و Cache First للملفات الثابتة
    const url = new URL(event.request.url);
    if (url.origin === location.origin) {
        event.respondWith(
            caches.match(event.request).then((response) => response || fetch(event.request))
        );
    } else {
        event.respondWith(fetch(event.request));
    }
});
