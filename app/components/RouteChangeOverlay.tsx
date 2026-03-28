"use client";
import { usePageTransition } from "./PageTransition";
import { useEffect, useState } from "react";

/**
 * Global navigation loading overlay.
 * Shows a top progress bar + subtle page fade the instant a navigation starts.
 * Disappears when the route completes and the new page's loading.tsx skeleton takes over.
 */
export default function RouteChangeOverlay() {
  const { isTransitioning } = usePageTransition();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isTransitioning) {
      setVisible(true);
      setProgress(0);

      // Animate progress bar: fast start, slow down as it approaches 90%
      const t1 = setTimeout(() => setProgress(30), 50);
      const t2 = setTimeout(() => setProgress(60), 300);
      const t3 = setTimeout(() => setProgress(80), 800);
      const t4 = setTimeout(() => setProgress(90), 2000);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
      };
    } else {
      // Complete the progress bar then fade out
      if (visible) {
        setProgress(100);
        const hideTimer = setTimeout(() => {
          setVisible(false);
          setProgress(0);
        }, 200);
        return () => clearTimeout(hideTimer);
      }
    }
  }, [isTransitioning, visible]);

  if (!visible) return null;

  return (
    <>
      {/* Top progress bar */}
      <div
        className="fixed top-0 left-0 right-0 z-[9999] h-[3px] pointer-events-none"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div
          className="h-full bg-gradient-to-r from-[#0EA5E9] via-[#38BDF8] to-[#0EA5E9] shadow-[0_0_10px_rgba(14,165,233,0.5)]"
          style={{
            width: `${progress}%`,
            transition: progress === 0
              ? "none"
              : progress === 100
                ? "width 150ms ease-out"
                : "width 400ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
      </div>

      {/* Subtle page fade overlay */}
      <div
        className="fixed inset-0 z-[9998] pointer-events-none bg-white/30 dark:bg-black/30"
        style={{
          opacity: isTransitioning ? 1 : 0,
          transition: "opacity 150ms ease-out",
        }}
      />
    </>
  );
}
