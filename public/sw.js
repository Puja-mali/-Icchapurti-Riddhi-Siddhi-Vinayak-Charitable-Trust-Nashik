/**
 * Icchapurti Riddhi Siddhi Vinayak Charitable Trust, Nashik
 * Official Progressive Web App & Web Push Service Worker
 */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let payload = {
    title: 'Shree Siddhivinayak Trust',
    body: 'You have a new verified trust notification.',
    icon: '/trust-emblem.jpg',
    badge: '/trust-emblem.jpg',
    data: { url: '/dashboard' },
  };

  if (event.data) {
    try {
      const json = event.data.json();
      payload = {
        title: json.title || payload.title,
        body: json.body || payload.body,
        icon: json.icon || payload.icon,
        badge: json.badge || payload.badge,
        tag: json.tag || 'sct-notification',
        data: json.data || payload.data,
      };
    } catch (e) {
      payload.body = event.data.text();
    }
  }

  const notificationOptions = {
    body: payload.body,
    icon: payload.icon,
    badge: payload.badge,
    tag: payload.tag || 'sct-alert',
    renotify: true,
    data: payload.data,
    vibrate: [100, 50, 100],
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, notificationOptions)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a tab is already open on this app, focus it and navigate
      for (const client of clientList) {
        if ('focus' in client) {
          if (client.url && client.url.includes(self.location.origin)) {
            client.focus();
            if ('navigate' in client && targetUrl !== '/') {
              client.navigate(targetUrl);
            }
            return;
          }
        }
      }
      // Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
