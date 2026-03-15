import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: ["/admin/", "/api/"],
    },
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || "https://garudaqua.in"}/sitemap.xml`,
  };
}