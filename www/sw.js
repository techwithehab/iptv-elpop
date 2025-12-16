const CACHE_NAME = 'iptv-smarters-v1';
const ASSETS_TO_CACHE = [
    './', // الصفحة الرئيسية
    './index.html', // اسم ملفك (تأكد من الاسم)
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/hls.js@latest'
    // لا تضع ملفات Tailwind CDN هنا لأنها تتغير، الأفضل تحميل ملف CSS محلي
];

// 1. التثبيت: حفظ الملفات الأساسية
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// 2. التفعيل: تنظيف الكاش القديم
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) return caches.delete(key);
                })
            );
        })
    );
});

// 3. الفتش: استخدام الكاش أولاً ثم الشبكة (Stale-while-revalidate for images)
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // استراتيجية خاصة للصور (tmdb أو غيرها) - كاش أولاً للسرعة
    if (url.pathname.match(/\.(jpg|jpeg|png|gif|svg)$/)) {
        event.respondWith(
            caches.open(CACHE_NAME).then((cache) => {
                return cache.match(event.request).then((response) => {
                    return response || fetch(event.request).then((networkResponse) => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                });
            })
        );
    } else {
        // باقي الطلبات (API وغيره) - شبكة أولاً
        event.respondWith(
            fetch(event.request).catch(() => caches.match(event.request))
        );
    }
});
