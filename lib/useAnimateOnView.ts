"use client";

import { useEffect, useRef } from "react";

/**
 * Lightweight IntersectionObserver hook that adds `.is-visible` class
 * to elements with `.animate-on-view` (or variants) when they enter the viewport.
 * Replaces framer-motion `whileInView` with zero JS bundle cost.
 *
 * Usage: call `useAnimateOnView()` once in a component, then add
 * `animate-on-view` class to any element you want to animate in.
 */
export function useAnimateOnView() {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = containerRef.current ?? document;
    const targets = root.querySelectorAll(
      ".animate-on-view, .animate-on-view-left, .animate-on-view-right, .animate-on-view-scale"
    );
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target); // animate once
          }
        });
      },
      { rootMargin: "0px 0px -60px 0px", threshold: 0.1 }
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return containerRef;
}
