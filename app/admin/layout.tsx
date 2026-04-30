import type { Metadata } from "next";
import Providers from "../components/Providers";

export const viewport = {
  themeColor: "#0f172a",
};

export const metadata: Metadata = {
  title: {
    default: "Admin Panel — Garud Aqua Solutions",
    template: "%s — GA Admin",
  },
  description: "Admin panel for managing Garud Aqua Solutions products, blogs, enquiries, gallery and more.",
  manifest: "/admin-manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "GA Admin",
    startupImage: ["/icons/admin-icon-512x512.png"],
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
    other: [
      { rel: "mask-icon", url: "/icons/admin-icon-512x512-maskable.png" },
    ],
  },
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      {children}
    </Providers>
  );
}
