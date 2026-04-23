import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const revalidate = 86400;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.garudaqua.in";

// Use the deploy date env var if set (set it in your CI/CD), otherwise fall back to build time.
// This means static pages always report an accurate lastModified to Google.
const DEPLOY_DATE = process.env.NEXT_PUBLIC_DEPLOY_DATE
  ? new Date(process.env.NEXT_PUBLIC_DEPLOY_DATE)
  : new Date();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ── Static pages ────────────────────────────────────────────────────────────
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: DEPLOY_DATE,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/products`,
      lastModified: DEPLOY_DATE,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: DEPLOY_DATE,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/blogs`,
      lastModified: DEPLOY_DATE,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: DEPLOY_DATE,
      changeFrequency: "yearly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/enquire`,
      lastModified: DEPLOY_DATE,
      changeFrequency: "yearly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/categories`,
      lastModified: DEPLOY_DATE,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // ── Product pages ─────────────────────────────────────────────────────────
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true, image: true },
      orderBy: { updatedAt: "desc" },
    });
    productRoutes = products.map((p) => ({
      url: `${SITE_URL}/products/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
      images: p.image ? [p.image] : undefined,
    }));
  } catch {
    // DB unavailable at build time — skip dynamic routes
  }

  // ── Blog pages ────────────────────────────────────────────────────────────
  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const blogs = await prisma.blogPost.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true, featuredImage: true },
      orderBy: { updatedAt: "desc" },
    });
    blogRoutes = blogs.map((b) => ({
      url: `${SITE_URL}/blogs/${b.slug}`,
      lastModified: b.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
      images: b.featuredImage ? [b.featuredImage] : undefined,
    }));
  } catch {
    // DB unavailable at build time — skip dynamic routes
  }

  // ── Category SEO pages ───────────────────────────────────────────────────
  let categoryRoutes: MetadataRoute.Sitemap = [];
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true, hasSeoPage: true },
      select: { slug: true, updatedAt: true, image: true, seoHeroImage: true },
      orderBy: { updatedAt: "desc" },
    });
    categoryRoutes = categories.map((c) => ({
      url: `${SITE_URL}/categories/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      images: [c.seoHeroImage, c.image].filter(Boolean) as string[],
    }));
  } catch {
    // DB unavailable at build time — skip dynamic routes
  }

// ── Blog category pages ─────────────────────────────────────────────────
  let blogCategoryRoutes: MetadataRoute.Sitemap = [];
  try {
    const blogCategories = await prisma.blogCategory.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });
    blogCategoryRoutes = blogCategories.map((bc) => ({
      url: `${SITE_URL}/blogs/category/${bc.slug}`,
      lastModified: bc.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    // DB unavailable at build time — skip dynamic routes
  }

  return [
    ...staticRoutes,
    ...productRoutes,
    ...blogRoutes,
    ...categoryRoutes,
    ...blogCategoryRoutes,
  ];
}
