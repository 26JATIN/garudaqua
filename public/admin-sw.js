// Garud Aqua Admin — Push Notification Service Worker v1
// Handles Web Push events only. Does NOT cache anything.

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = { title: "New Enquiry", body: "A new enquiry was submitted.", url: "/admin/enquiries" };
  try {
    if (event.data) {
      data = { ...data, ...event.data.json() };
    }
  } catch {
    // fallback to defaults
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/admin-icon-192x192.png",
      badge: "/icons/admin-icon-72x72.png",
      tag: "new-enquiry",
      renotify: true,
      data: { url: data.url || "/admin/enquiries" },
      actions: [
        { action: "view", title: "View Enquiry" },
        { action: "dismiss", title: "Dismiss" },
      ],
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const targetUrl = (event.notification.data && event.notification.data.url) || "/admin/enquiries";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Focus an existing admin window if one is open
        for (const client of clientList) {
          if (client.url.includes("/admin") && "focus" in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        // Otherwise open a new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});
