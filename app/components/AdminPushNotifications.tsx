"use client";

import { useEffect, useState, useCallback } from "react";

type Permission = "default" | "granted" | "denied" | "unsupported";

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length) as Uint8Array<ArrayBuffer>;
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function getAdminSW(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;

  // Check for an existing registration of admin-sw.js
  const registrations = await navigator.serviceWorker.getRegistrations();
  for (const reg of registrations) {
    if (reg.active?.scriptURL.includes("admin-sw.js")) return reg;
  }

  // Register fresh
  try {
    const reg = await navigator.serviceWorker.register("/admin-sw.js", {
      scope: "/admin/",
    });
    await navigator.serviceWorker.ready;
    return reg;
  } catch (err) {
    console.error("[AdminPush] SW registration failed:", err);
    return null;
  }
}

async function subscribeToPush(reg: ServiceWorkerRegistration): Promise<PushSubscription | null> {
  try {
    const res = await fetch("/api/push/vapid-public-key");
    const { vapidPublicKey } = await res.json();
    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });
    return subscription;
  } catch (err) {
    console.error("[AdminPush] Subscribe failed:", err);
    return null;
  }
}

export default function AdminPushNotifications() {
  const [permission, setPermission] = useState<Permission>("default");
  const [isLoading, setIsLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Sync with current browser permission state on mount
  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission as Permission);

    // If already granted, make sure we have a subscription registered
    if (Notification.permission === "granted") {
      void (async () => {
        const reg = await getAdminSW();
        if (!reg) return;
        const existing = await reg.pushManager.getSubscription();
        if (!existing) {
          // Re-subscribe silently (e.g. after browser cleared subscriptions)
          const sub = await subscribeToPush(reg);
          if (sub) {
            await fetch("/api/push/subscribe", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(sub.toJSON()),
            });
          }
        }
      })();
    }
  }, []);

  const handleEnable = useCallback(async () => {
    if (!("Notification" in window)) return;
    setIsLoading(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm as Permission);

      if (perm !== "granted") {
        setIsLoading(false);
        return;
      }

      const reg = await getAdminSW();
      if (!reg) { setIsLoading(false); return; }

      // Unsubscribe any stale subscription first
      const existing = await reg.pushManager.getSubscription();
      if (existing) await existing.unsubscribe();

      const sub = await subscribeToPush(reg);
      if (!sub) { setIsLoading(false); return; }

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });
    } catch (err) {
      console.error("[AdminPush] Enable failed:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDisable = useCallback(async () => {
    setIsLoading(true);
    try {
      const reg = await getAdminSW();
      if (!reg) { setIsLoading(false); return; }

      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setPermission("default");
    } catch (err) {
      console.error("[AdminPush] Disable failed:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  if (permission === "unsupported") return null;

  const tooltipText =
    permission === "granted"
      ? "Push notifications ON — click to disable"
      : permission === "denied"
      ? "Notifications blocked in browser settings"
      : "Enable push notifications for new enquiries";

  return (
    <div className="relative">
      <button
        id="admin-push-bell"
        onClick={() => {
          if (permission === "granted") handleDisable();
          else if (permission !== "denied") handleEnable();
          else setShowTooltip((v) => !v);
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        disabled={isLoading}
        aria-label={tooltipText}
        className={`relative p-2 rounded-lg transition-all duration-200 focus:outline-none disabled:opacity-50 ${
          permission === "granted"
            ? "text-[#0EA5E9] hover:bg-blue-50"
            : permission === "denied"
            ? "text-red-400 hover:bg-red-50 cursor-not-allowed"
            : "text-gray-500 hover:bg-gray-100"
        }`}
      >
        {isLoading ? (
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        ) : (
          <>
            {/* Bell icon */}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {/* Green dot when active */}
            {permission === "granted" && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-green-500 rounded-full ring-2 ring-white" />
            )}
            {/* Red slash overlay when denied */}
            {permission === "denied" && (
              <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <svg className="w-6 h-6 text-red-400 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <line x1="4" y1="4" x2="20" y2="20" strokeWidth={2.5} strokeLinecap="round" />
                </svg>
              </span>
            )}
          </>
        )}
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute right-0 top-full mt-2 z-50 whitespace-nowrap bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg pointer-events-none">
          {tooltipText}
          <div className="absolute -top-1 right-3 w-2 h-2 bg-gray-900 rotate-45" />
        </div>
      )}
    </div>
  );
}
