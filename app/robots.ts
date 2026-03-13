import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/_next/",
        ],
      },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || "https://garudaqua.in"}/sitemap.xml`,
    host: process.env.NEXT_PUBLIC_SITE_URL || "https://garudaqua.in",
  };
}
