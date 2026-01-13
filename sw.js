// قمنا بتغيير الرقم لـ v3 لإجبار الهاتف على التحديث
const CACHE_NAME = 'iptv-elpop-v4';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    './assets/libs/fontawesome/css/all.min.css',
    './assets/libs/hls.min.js',
    './tailwind.js'
];

self.addEventListener('install', (event) => {
    self.skipWaiting(); // تفعيل التحديث فوراً
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
    self.clients.claim(); // السيطرة على الصفحات المفتوحة فوراً
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // استراتيجية Network First لملف HTML الرئيسي (لضمان وصول التحديثات)
    if (event.request.mode === 'navigate' || url.pathname.endsWith('index.html')) {
        event.respondWith(
            fetch(event.request).catch(() => caches.match('./index.html'))
        );
        return;
    }

    // استراتيجية Cache First للملفات الثابتة (الصور والمكتبات) للسرعة
    if (url.origin === location.origin && (url.pathname.match(/\.(css|js|png|jpg|json)$/))) {
        event.respondWith(
            caches.match(event.request).then((response) => response || fetch(event.request))
        );
        return;
    }

    // الوضع الافتراضي
    event.respondWith(
        caches.match(event.request).then((response) => response || fetch(event.request))
    );
});
