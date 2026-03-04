import React from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { NavbarProvider } from "./context/NavbarContext";
import { ThemeProvider } from "./context/ThemeContext";
import ConditionalNavbar from "./components/ConditionalNavbar";
import Providers from "./components/Providers";
// import PWARegister from "./components/PWARegister";
// import InstallPrompt from "./components/InstallPrompt";
import { Toaster } from "sonner";
import ThemeToaster from "./components/ThemeToaster";

const inter = Inter({ subsets: ["latin"] });

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export const metadata = {
  title: "Garud",
  description: "Garud Aqua Solutions - A Bond of Trust & Quality in Water Tanks, Pipes & Fittings",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Garud",
  },
  icons: {
    icon: [
      { url: '/MobileLogo.png', type: 'image/png' },
    ],
    shortcut: '/MobileLogo.png',
    apple: [
      { url: '/MobileLogo.png', type: 'image/png' },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffff" id="theme-color-meta" />
        <link rel="apple-touch-icon" href="/MobileLogo.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <script dangerouslySetInnerHTML={{
          __html: `
          (function() {
            try {
              var theme = localStorage.getItem('theme');
              var meta = document.getElementById('theme-color-meta');
              if (theme === 'dark') {
                document.documentElement.classList.add('dark');
                if (meta) meta.content = '#000000';
              } else {
                if (meta) meta.content = '#ffffff';
              }
            } catch(e) {}
          })();
        `}} />
      </head>
      <body className={`${inter.className} bg-white dark:bg-black text-gray-900 dark:text-gray-100 transition-colors duration-300`}>
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
