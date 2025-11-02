// ========================================
// Service Worker Stub for Future PWA Background Notifications
// ========================================
self.addEventListener("install", () => {
    self.skipWaiting();
});

self.addEventListener("activate", () => {
    self.clients.claim();
});

self.addEventListener("push", (event) => {
    const data = event.data?.json() ?? {};
    event.waitUntil(
        self.registration.showNotification(data.title || "Reminder", {
            body: data.body,
            tag: data.tag
        })
    );
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    event.waitUntil(
        self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
            if (clients.length > 0) return clients[0].focus();
            return self.clients.openWindow("/");
        })
    );
});
