"use client";

import { useEffect } from "react";

interface Props {
  manifestHref: string;
  themeColor?: string;
  appName?: string;
}

export default function ManifestOverride({
  manifestHref,
  themeColor,
  appName,
}: Props) {
  useEffect(() => {
    // Swap manifest link
    const existing = document.querySelector('link[rel="manifest"]');
    if (existing) {
      existing.setAttribute("href", manifestHref);
    } else {
      const link = document.createElement("link");
      link.rel = "manifest";
      link.href = manifestHref;
      document.head.appendChild(link);
    }

    // Swap theme-color
    if (themeColor) {
      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) {
        metaTheme.setAttribute("content", themeColor);
      }
    }

    // Swap apple-mobile-web-app-title
    if (appName) {
      let metaAppTitle = document.querySelector(
        'meta[name="apple-mobile-web-app-title"]'
      );
      if (metaAppTitle) {
        metaAppTitle.setAttribute("content", appName);
      } else {
        metaAppTitle = document.createElement("meta");
        metaAppTitle.setAttribute("name", "apple-mobile-web-app-title");
        metaAppTitle.setAttribute("content", appName);
        document.head.appendChild(metaAppTitle);
      }

      // Also swap application-name
      let metaAppName = document.querySelector('meta[name="application-name"]');
      if (metaAppName) {
        metaAppName.setAttribute("content", appName);
      }
    }

    // Restore on unmount (user navigates back to main site)
    return () => {
      const link = document.querySelector('link[rel="manifest"]');
      if (link) link.setAttribute("href", "/manifest.json");

      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) {
        const isDark = document.documentElement.classList.contains("dark");
        metaTheme.setAttribute("content", isDark ? "#000000" : "#ffffff");
      }
    };
  }, [manifestHref, themeColor, appName]);

  return null;
}
