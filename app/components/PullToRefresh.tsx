"use client";

import { useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";

const THRESHOLD = 72;      // px pulled before triggering refresh
const MAX_PULL   = 100;    // px cap for the visual indicator travel
const RESIST     = 0.45;   // pull resistance (feel)

export default function PullToRefresh() {
  const pathname = usePathname();

  // Refs — never trigger re-renders during touch tracking
  const startYRef     = useRef<number | null>(null);
  const pullDistRef   = useRef(0);
  const activeRef     = useRef(false);   // are we currently tracking a pull?
  const triggeredRef  = useRef(false);   // did we fire the reload already?

  // DOM refs for the indicator elements
  const wrapRef    = useRef<HTMLDivElement>(null);
  const spinnerRef = useRef<SVGSVGElement>(null);
  const labelRef   = useRef<HTMLSpanElement>(null);

  // Skip on admin pages
  const isAdmin = pathname?.startsWith("/admin");

  const reset = useCallback(() => {
    activeRef.current    = false;
    triggeredRef.current = false;
    startYRef.current    = null;
    pullDistRef.current  = 0;

    const wrap    = wrapRef.current;
    const spinner = spinnerRef.current;
    const label   = labelRef.current;
    if (!wrap) return;

    // Animate out
    wrap.style.transition  = "transform 0.3s cubic-bezier(0.22,1,0.36,1), opacity 0.3s ease";
    wrap.style.transform   = "translateY(-100%) translateX(-50%)";
    wrap.style.opacity     = "0";
    if (spinner) {
      spinner.style.transform = "";
      spinner.classList.remove("ptr-spinning");
    }
    if (label)   label.textContent = "Pull to refresh";
  }, []);

  useEffect(() => {
    if (isAdmin) return;

    const onTouchStart = (e: TouchEvent) => {
      // Only activate when the page is at the very top
      if (window.scrollY > 0) return;
      // Ignore multi-touch
      if (e.touches.length !== 1) return;

      startYRef.current   = e.touches[0].clientY;
      activeRef.current   = true;
      triggeredRef.current = false;
      pullDistRef.current  = 0;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!activeRef.current || startYRef.current === null) return;
      if (window.scrollY > 0) { reset(); return; }

      const delta = e.touches[0].clientY - startYRef.current;
      if (delta <= 0) { reset(); return; }

      // Apply resistance so it feels natural
      const dist = Math.min(delta * RESIST, MAX_PULL);
      pullDistRef.current = dist;

      const wrap    = wrapRef.current;
      const spinner = spinnerRef.current;
      const label   = labelRef.current;
      if (!wrap) return;

      // Show + position the indicator
      const progress = Math.min(dist / THRESHOLD, 1);
      wrap.style.transition = "none";
      wrap.style.transform  = `translateY(calc(-50% + ${dist}px)) translateX(-50%)`;
      wrap.style.opacity    = `${Math.min(progress * 1.4, 1)}`;

      // Rotate spinner with pull progress
      if (spinner) spinner.style.transform = `rotate(${progress * 270}deg)`;

      // Update label
      if (label && !triggeredRef.current) {
        label.textContent = dist >= THRESHOLD ? "Release to refresh" : "Pull to refresh";
      }
    };

    const onTouchEnd = () => {
      if (!activeRef.current) return;
      
      const dist = pullDistRef.current;
      
      if (dist >= THRESHOLD && !triggeredRef.current) {
        triggeredRef.current = true;

        // Brief haptic if available
        if ("vibrate" in navigator) navigator.vibrate(30);

        const spinner = spinnerRef.current;
        const label = labelRef.current;
        const wrap = wrapRef.current;

        // Visual "snap back to loading position"
        if (wrap) {
          wrap.style.transition = "transform 0.3s cubic-bezier(0.22,1,0.36,1), opacity 0.3s ease";
          wrap.style.transform = `translateY(calc(-50% + ${THRESHOLD}px)) translateX(-50%)`;
        }

        // Switch spinner to spinning animation
        if (spinner) {
          spinner.style.transform = "";
          spinner.classList.add("ptr-spinning");
        }
        if (label) label.textContent = "Refreshing…";

        // Short delay so the user sees the "refreshing" state before reload
        setTimeout(() => window.location.reload(), 400);
      } else if (!triggeredRef.current) {
        // Didn't reach threshold — animate back
        reset();
      }
    };

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove",  onTouchMove,  { passive: true });
    document.addEventListener("touchend",   onTouchEnd,   { passive: true });
    document.addEventListener("touchcancel",onTouchEnd,   { passive: true });

    return () => {
      document.removeEventListener("touchstart",  onTouchStart);
      document.removeEventListener("touchmove",   onTouchMove);
      document.removeEventListener("touchend",    onTouchEnd);
      document.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [isAdmin, reset]);

  if (isAdmin) return null;

  return (
    <>
      {/* Spinning keyframe injected once */}
      <style>{`
        @keyframes ptr-spin {
          to { transform: rotate(360deg); }
        }
        .ptr-spinning {
          animation: ptr-spin 0.7s linear infinite;
        }
      `}</style>

      {/*
        The indicator sits fixed at screen top-center.
        It starts above the fold (translateY(-100%)) and slides down with the pull.
        translateX(-50%) keeps it centred; left:50% anchors to center.
        We never modify html/body overflow — zero risk to iOS fixed elements.
      */}
      <div
        ref={wrapRef}
        aria-hidden="true"
        style={{
          position:        "fixed",
          top:             0,
          left:            "50%",
          transform:       "translateY(-100%) translateX(-50%)",
          opacity:         0,
          zIndex:          9999,
          pointerEvents:   "none",
          display:         "flex",
          alignItems:      "center",
          gap:             "8px",
          padding:         "8px 16px",
          borderRadius:    "9999px",
          background:      "rgba(255,255,255,0.92)",
          backdropFilter:  "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          boxShadow:       "0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.07)",
          border:          "1px solid rgba(14,165,233,0.15)",
          willChange:      "transform, opacity",
          marginTop:       "env(safe-area-inset-top, 0px)",
        }}
      >
        {/* Spinner arc */}
        <svg
          ref={spinnerRef}
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          style={{ flexShrink: 0, transition: "transform 0.1s linear" }}
        >
          <circle
            cx="9" cy="9" r="7"
            stroke="#0EA5E9"
            strokeWidth="2.2"
            strokeDasharray="28 16"
            strokeLinecap="round"
          />
        </svg>

        {/* Label */}
        <span
          ref={labelRef}
          style={{
            fontSize:      "13px",
            fontWeight:    500,
            color:         "#0369A1",
            letterSpacing: "0.01em",
            whiteSpace:    "nowrap",
          }}
        >
          Pull to refresh
        </span>
      </div>
    </>
  );
}
