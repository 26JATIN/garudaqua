"use client";

import { useEffect } from "react";

export default function PWARegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    // Unregister stale caching service workers — Cloudflare CDN handles caching.
    // IMPORTANT: preserve admin-sw.js which handles push notifications.
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((reg) => {
        const swUrl = reg.active?.scriptURL || "";
        // Keep the admin push-notification SW alive
        if (swUrl.includes("admin-sw.js")) return;
        reg.unregister();
      });
    });
  }, []);

  return null;
}
