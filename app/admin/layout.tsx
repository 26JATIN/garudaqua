import type { Metadata } from "next";
import ManifestOverride from "../components/ManifestOverride";

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
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ManifestOverride
        manifestHref="/admin-manifest.json"
        themeColor="#0f172a"
        appName="GA Admin"
      />
      {children}
    </>
  );
}
