import "@/app/styles/animations.css";
import { Suspense } from "react";
import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ProductDetail from "./ProductDetail";
import { productSchema, breadcrumbSchema } from "@/lib/jsonld";

export const dynamic = "force-static";

/** Pre-build all active product pages + former slugs (so redirects are instant, no client error). */
export async function generateStaticParams() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: { slug: true, formerSlugs: true },
    });
    return products.flatMap((p) => [
      { slug: p.slug },
      ...p.formerSlugs.map((fs) => ({ slug: fs })),
    ]);
  } catch {
    return [];
  }
}

/** 24-char hex string = MongoDB ObjectId (kept only for legacy inbound links that may still exist in the wild) */
const isObjectId = (s: string) => /^[a-f\d]{24}$/i.test(s);

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  try {
    const { slug } = await params;
    const product = await prisma.product.findFirst({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      where: isObjectId(slug) ? { OR: [{ slug }, { id: slug }] } : { OR: [{ slug }, { formerSlugs: { has: slug } } as any] },
      select: {
        name: true,
        slug: true,
        description: true,
        image: true,
        category: { select: { name: true } },
      },
    });

    if (!product) {
      return { title: "Product Not Found" };
    }

    // Use the canonical slug for all metadata URLs
    const canonicalSlug = product.slug ?? slug;
    const title = product.name;
    const categoryName = product.category?.name ?? "Product";
    const description =
      product.description?.slice(0, 155) ||
      `Buy ${product.name} — ${categoryName} from Garud Aqua Solutions. Quality water management products in Rajasthan.`;
    const url = `https://www.garudaqua.in/products/${canonicalSlug}`;

    return {
      title,
      description,
      alternates: { canonical: url },
      openGraph: {
        url,
        title: `${title} | Garud Aqua Solutions`,
        description,
        images: product.image
          ? [{ url: product.image, alt: title, width: 1200, height: 630 }]
          : [],
      },
      twitter: {
        card: "summary_large_image",
        title: `${title} | Garud Aqua Solutions`,
        description,
        images: product.image ? [product.image] : [],
      },
    };
  } catch {
    return { title: "Product | Garud Aqua Solutions" };
  }
}

async function findProduct(slug: string) {
  const include = {
    category: { select: { id: true, name: true, slug: true, hasSeoPage: true } },
    subcategory: { select: { id: true, name: true, slug: true } },
  } as const;

  // 1. Try current slug (or ObjectId for legacy links)
  const bySlug = await prisma.product.findFirst({
    where: isObjectId(slug) ? { OR: [{ slug }, { id: slug }] } : { slug },
    include,
  });
  if (bySlug) return bySlug;

  // 2. Not found — check if slug is a formerSlug (product was renamed)
  return prisma.product.findFirst({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    where: { formerSlugs: { has: slug } } as any,
    include,
  });
}

async function getProductData(slug: string) {
  try {
    const product = await findProduct(slug);

    if (!product) return { product: null, related: [], canonicalSlug: slug };

    // Inactive products are treated as gone — caller will trigger notFound()
    if (!product.isActive) return { product: null, related: [], canonicalSlug: slug };

    const related = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        isActive: true,
        id: { not: product.id },
      },
      take: 4,
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        category: { select: { id: true, name: true, slug: true, hasSeoPage: true } },
        subcategory: { select: { id: true, name: true, slug: true } },
      },
    });

    return {
      product: JSON.parse(JSON.stringify(product)),
      related: JSON.parse(JSON.stringify(related)),
      canonicalSlug: product.slug ?? slug,
    };
  } catch {
    return { product: null, related: [], canonicalSlug: slug };
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { product, related, canonicalSlug } = await getProductData(slug);

  // No product or inactive product → proper 404 response
  if (!product) {
    notFound();
  }

  // If an ObjectId was used in the URL and the product has a slug, 301 redirect to the clean URL
  if (canonicalSlug !== slug) {
    redirect(`/products/${canonicalSlug}`);
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema(product)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema([
        { name: "Home", url: "https://www.garudaqua.in" },
        { name: "Products", url: "https://www.garudaqua.in/products" },
        { name: product.name, url: `https://www.garudaqua.in/products/${canonicalSlug}` },
      ])) }} />
      <Suspense
        fallback={
          <div className="min-h-screen pt-4 md:pt-6 lg:pt-8 bg-linear-to-b from-white to-[#FAFAFA] dark:from-black dark:to-[#0A0A0A]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-2xl shimmer"></div>
                <div className="space-y-4 py-4">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded shimmer"></div>
                  <div className="h-8 w-3/4 bg-gray-200 dark:bg-gray-800 rounded shimmer"></div>
                  <div className="h-px bg-gray-200 dark:bg-gray-800 my-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-gray-100 dark:bg-gray-800 rounded shimmer"></div>
                    <div className="h-4 w-full bg-gray-100 dark:bg-gray-800 rounded shimmer"></div>
                    <div className="h-4 w-2/3 bg-gray-100 dark:bg-gray-800 rounded shimmer"></div>
                  </div>
                  <div className="h-12 w-full bg-gray-200 dark:bg-gray-800 rounded-xl mt-6 shimmer"></div>
                </div>
              </div>
            </div>
          </div>
        }
      >
        <ProductDetail
          productSlug={canonicalSlug}
          initialProduct={product}
          initialRelated={related}
        />
      </Suspense>
    </>
  );
}
