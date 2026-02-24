// push-sw.js
// Custom service worker for handling Web Push events

self.addEventListener('push', (event) => {
    let data = {};
    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data = { body: event.data.text() };
        }
    }

    const title = data.title || 'Togetherly Connect';
    const body = data.body || 'You have a new notification.';
    const icon = data.icon || '/icons/icon-192x192.png';
    const badge = data.badge || '/icons/icon-96x96.png';
    const url = data.data?.url || '/';

    const options = {
        body,
        icon,
        badge,
        vibrate: [100, 50, 100],
        data: { url },
        actions: data.actions || []
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // Check if there is already a window/tab open with the target URL
            let matchingClient = null;
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url === urlToOpen || client.url.includes(urlToOpen)) {
                    matchingClient = client;
                    break;
                }
            }

            // If found, focus it. Otherwise, open a new window.
            if (matchingClient) {
                return matchingClient.focus();
            } else {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
