import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const SITE_URL = "https://garudaqua.in";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // ── Static pages ──────────────────────────────────────────────────────────
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/products`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/blogs`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/enquire`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.6,
    },
  ];

  // ── Product pages ─────────────────────────────────────────────────────────
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });
    productRoutes = products.map((p) => ({
      url: `${SITE_URL}/products/${p.id}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch {
    // DB unavailable at build time — skip dynamic routes
  }

  // ── Blog pages ────────────────────────────────────────────────────────────
  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const blogs = await prisma.blogPost.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });
    blogRoutes = blogs.map((b) => ({
      url: `${SITE_URL}/blogs/${b.slug}`,
      lastModified: b.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch {
    // DB unavailable at build time — skip dynamic routes
  }

  return [...staticRoutes, ...productRoutes, ...blogRoutes];
}
