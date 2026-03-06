import React from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { NavbarProvider } from "./context/NavbarContext";
import { ThemeProvider } from "./context/ThemeContext";
import ConditionalNavbar from "./components/ConditionalNavbar";
import Providers from "./components/Providers";
import { Toaster } from "sonner";
import ThemeToaster from "./components/ThemeToaster";
import PWARegister from "./components/PWARegister";
import type { Metadata } from "next";

const inter = Inter({ subsets: ["latin"], display: "swap" });

const SITE_URL = "https://garudaqua.in";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Garud Aqua Solutions — Water Tanks, Pipes & Fittings | Sriganganagar",
    template: "%s | Garud Aqua Solutions",
  },
  description:
    "Garud Aqua Solutions — Sriganganagar's trusted supplier of high-quality HDPE water tanks, PVC pipes, fittings & agricultural water management products. A Bond of Trust & Quality since establishment.",
  keywords: [
    "water tanks",
    "HDPE water tanks",
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
  manifest: "/manifest.json",
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
      "Trusted supplier of HDPE water tanks, PVC pipes & agricultural water management products in Rajasthan. Quality products, reliable service.",
    images: [
      {
        url: "/DesktopLogo.png",
        width: 1200,
        height: 630,
        alt: "Garud Aqua Solutions — Water Tanks and Pipe Fittings",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Garud Aqua Solutions — Water Tanks, Pipes & Fittings",
    description:
      "Trusted supplier of HDPE water tanks, PVC pipes & agricultural water management products in Rajasthan.",
    images: ["/DesktopLogo.png"],
    creator: "@garudaqua",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Garud Aqua",
    startupImage: ["/icons/icon-512x512.png"],
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
      { url: "/favicon.png", type: "image/png" },
    ],
    shortcut: "/icons/icon-192x192.png",
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    other: [
      { rel: "mask-icon", url: "/icons/icon-512x512-maskable.png" },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="icon" href="/icons/icon-192x192.png" type="image/png" sizes="192x192" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="shortcut icon" href="/icons/icon-192x192.png" type="image/png" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" sizes="152x152" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" id="theme-color-meta" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": ["LocalBusiness", "Organization"],
              "name": "Garud Aqua Solutions",
              "url": "https://garudaqua.in",
              "logo": {
                "@type": "ImageObject",
                "url": "https://garudaqua.in/DesktopLogo.png"
              },
              "image": "https://garudaqua.in/DesktopLogo.png",
              "telephone": "+91-94625-94603",
              "email": "rkg210@gmail.com",
              "description": "Garud Aqua Solutions is a trusted supplier of HDPE water tanks, PVC pipes, fittings, and agricultural water management products in Sriganganagar, Rajasthan, India.",
              "priceRange": "₹₹",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Ground, Murraba No. 62, Killa No. 2, Sihagawali To Akkawali Road, 23 SDS",
                "addressLocality": "Sadulshahar",
                "addressRegion": "Rajasthan",
                "postalCode": "335062",
                "addressCountry": "IN"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": "29.4507",
                "longitude": "73.4340"
              },
              "areaServed": [
                {
                  "@type": "State",
                  "name": "Rajasthan"
                },
                {
                  "@type": "Country",
                  "name": "India"
                }
              ],
              "knowsAbout": [
                "HDPE Water Tanks",
                "PVC Pipes",
                "Water Fittings",
                "Agricultural Water Management",
                "Water Storage Solutions"
              ],
              "sameAs": []
            })
          }}
        />
        <script dangerouslySetInnerHTML={{
          __html: `
          (function() {
            try {
              var theme = localStorage.getItem('theme');
              var meta = document.getElementById('theme-color-meta');
              if (theme === 'light') {
                document.documentElement.classList.remove('dark');
                if (meta) meta.content = '#ffffff';
              } else {
                document.documentElement.classList.add('dark');
                if (meta) meta.content = '#000000';
              }
            } catch(e) {
              document.documentElement.classList.add('dark');
            }
          })();
        `}} />
      </head>
      <body className={`${inter.className} bg-white dark:bg-black text-gray-900 dark:text-gray-100 transition-colors duration-300`}>
        <PWARegister />
        <Providers>
          <ThemeToaster />
          <ThemeProvider>
            <NavbarProvider>
              <ConditionalNavbar />
              <main>
                {children}
              </main>
            </NavbarProvider>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
