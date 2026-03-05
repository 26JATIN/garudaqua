import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Admin Panel — Garud Aqua Solutions",
    template: "%s — GA Admin",
  },
  description: "Admin panel for managing Garud Aqua Solutions products, blogs, enquiries, gallery and more.",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
  manifest: "/admin-manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "GA Admin",
  },
  icons: {
    icon: [
      { url: "/icons/admin-icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/admin-icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/icons/admin-icon-192x192.png",
    apple: [
      { url: "/icons/admin-icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/admin-icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Override manifest and icons for admin PWA */}
      <head>
        <link rel="manifest" href="/admin-manifest.json" />
        <link rel="apple-touch-icon" href="/icons/admin-icon-192x192.png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/icons/admin-icon-152x152.png" sizes="152x152" />
        <meta name="theme-color" content="#0f172a" />
        <meta name="application-name" content="GA Admin" />
        <meta name="apple-mobile-web-app-title" content="GA Admin" />
      </head>
      {children}
    </>
  );
}
