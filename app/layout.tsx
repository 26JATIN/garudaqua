import React from "react";
import "./globals.css";
import { NavbarProvider } from "./context/NavbarContext";
import { ThemeProvider } from "./context/ThemeContext";
import ConditionalNavbar from "./components/ConditionalNavbar";
import { PageTransitionProvider } from "./components/PageTransition";
import DeferredLayoutWidgets from "./components/DeferredLayoutWidgets";
import LazyToaster from "./components/LazyToaster";
import type { Metadata } from "next";
import { organizationSchema, websiteSchema } from "@/lib/jsonld";
const SITE_URL = "https://www.garudaqua.in";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  // themeColor is managed by the inline script + hardcoded meta tag below
  // to match the user's manual theme toggle (not system prefers-color-scheme).
  // Having multiple theme-color metas causes Safari to pick inconsistently.
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Garud Aqua Solutions — Water Tanks, Pipes & Fittings | Sriganganagar",
    template: "%s | Garud Aqua Solutions",
  },
  description:
    "Garud Aqua Solutions — Sriganganagar's trusted supplier of high-quality HDPE, LLDPE water tanks, PVC pipes & agricultural water management products.",
  keywords: [
    "water tanks",
    "HDPE water tanks",
    "LLDPE water tanks",
    "PVC pipes",
    "pipe fittings",
    "agricultural water tanks",
    "water storage tanks",
    "Sriganganagar",
    "Ganganagar",
    "Rajasthan",
    "Garud Aqua Solutions",
    "water management",
    "overhead water tanks",
    "underground water tanks",
    "drip irrigation pipes",
    "water tank supplier India",
    "Sadulshahar",
  ],
  authors: [{ name: "Garud Aqua Solutions", url: SITE_URL }],
  creator: "Garud Aqua Solutions",
  publisher: "Garud Aqua Solutions",
  category: "Business",
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "Garud Aqua Solutions",
    title: "Garud Aqua Solutions — Water Tanks, Pipes & Fittings | Sriganganagar",
    description:
      "Trusted supplier of HDPE, LLDPE water tanks, PVC pipes & agricultural water management products in Rajasthan. Quality products, reliable service.",
    images: [
      {
        url: `${SITE_URL}/DesktopLogo.png`,
        width: 750,
        height: 332,
        alt: "Garud Aqua Solutions — Water Tanks and Pipe Fittings",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Garud Aqua Solutions — Water Tanks, Pipes & Fittings",
    description:
      "Trusted supplier of HDPE, LLDPE water tanks, PVC pipes & agricultural water management products in Rajasthan.",
    images: [`${SITE_URL}/DesktopLogo.png`],
    creator: "@garudaqua",
  },
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <head>
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff" id="theme-color-light" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#000000" id="theme-color-dark" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema()) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema()) }} />
        <script dangerouslySetInnerHTML={{
          __html: `
          (function() {
            try {
              var theme = localStorage.getItem('theme');
              var metaLight = document.getElementById('theme-color-light');
              var metaDark = document.getElementById('theme-color-dark');
              var isDark = theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
              if (isDark) {
                document.documentElement.classList.add('dark');
                if (metaLight) metaLight.content = '#000000';
                if (metaDark) metaDark.content = '#000000';
              } else {
                document.documentElement.classList.remove('dark');
                if (metaLight) metaLight.content = '#ffffff';
                if (metaDark) metaDark.content = '#ffffff';
              }
            } catch(e) {
              if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.documentElement.classList.add('dark');
              }
            }
            // iOS: overflow-x:clip on <html> breaks position:fixed.
            // Must run before first paint so Chrome locks in the correct context.
            var ua = navigator.userAgent;
            if (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
              document.documentElement.style.overflowX = 'visible';
            }
          })();
        `}} />
      </head>
      <body className="bg-white dark:bg-black text-gray-900 dark:text-gray-100">
        <ThemeProvider>
          <LazyToaster />
          <NavbarProvider>
            <PageTransitionProvider>
              <DeferredLayoutWidgets />
              <ConditionalNavbar />
              <main className="app-main">
                {children}
              </main>
            </PageTransitionProvider>
          </NavbarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
