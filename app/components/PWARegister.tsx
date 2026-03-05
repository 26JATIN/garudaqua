"use client";

import { useEffect } from "react";

export default function PWARegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        });

        // Check for updates every hour
        setInterval(() => registration.update(), 60 * 60 * 1000);

        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              // New content available — could show a toast here
              console.log("[SW] New version available");
            }
          });
        });
      } catch (err) {
        console.error("[SW] Registration failed:", err);
      }
    };

    // Register after page loads for performance
    if (document.readyState === "complete") {
      registerSW();
    } else {
      window.addEventListener("load", registerSW);
      return () => window.removeEventListener("load", registerSW);
    }
  }, []);

  return null;
}
