// Garud Aqua Admin — Push Notification Service Worker v2
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
      tag: data.tag || `enquiry-${Date.now()}`,
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

  // Dismiss action: do nothing
  if (event.action === "dismiss") return;

  // Build absolute URL — relative paths don't work reliably in SW context
  const relativePath = (event.notification.data && event.notification.data.url) || "/admin/enquiries";
  const targetUrl = relativePath.startsWith("http")
    ? relativePath
    : self.location.origin + relativePath;

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // If an admin window is already open, navigate it and focus
        for (const client of clientList) {
          if (client.url.startsWith(self.location.origin) && "navigate" in client) {
            return client.navigate(targetUrl).then((navigatedClient) => {
              return navigatedClient ? navigatedClient.focus() : null;
            });
          }
        }
        // No window open → open a new tab directly to the enquiries page
        return self.clients.openWindow(targetUrl);
      })
  );
});
