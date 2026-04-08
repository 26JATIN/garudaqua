import type { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ProductsPage from "../components/ProductsPage";
import { collectionPageSchema } from '@/lib/jsonld';

export const dynamic = "force-static";

/** 24-char hex = MongoDB ObjectId */
const isObjectId = (s: string) => /^[a-f\d]{24}$/i.test(s);
/** Convert name to slug */
function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}): Promise<Metadata> {
  const params = await searchParams;
  const categoryParam = typeof params.category === "string" ? params.category : undefined;
  const subcategoryParam = typeof params.subcategory === "string" ? params.subcategory : undefined;

  let title = "Products — Water Tanks, Pipes & Fittings | Garud Aqua Solutions";
  let description = "Browse Garud Aqua Solutions' full range of HDPE, LLDPE water tanks, PVC pipes, pipe fittings & water management products.";
  let url = "https://www.garudaqua.in/products";

  try {
    if (subcategoryParam) {
      const subcategory = await prisma.subcategory.findFirst({
        where: isObjectId(subcategoryParam) ? { OR: [{ slug: subcategoryParam }, { id: subcategoryParam }] } : { slug: subcategoryParam },
        select: { name: true, metaTitle: true, metaDesc: true, category: { select: { slug: true } } }
      });
      if (subcategory) {
        title = subcategory.metaTitle && subcategory.metaTitle.trim() !== "" ? subcategory.metaTitle : `Buy ${subcategory.name} Online | Best Price - Garud`;
        description = subcategory.metaDesc && subcategory.metaDesc.trim() !== "" ? subcategory.metaDesc : `Shop the best quality ${subcategory.name} in Rajasthan. Browse top-rated products at Garud Aqua Solutions.`;
        url = `https://www.garudaqua.in/products?category=${subcategory.category?.slug}&subcategory=${subcategoryParam}`;
      }
    } else if (categoryParam) {
      const category = await prisma.category.findFirst({
        where: isObjectId(categoryParam) ? { OR: [{ slug: categoryParam }, { id: categoryParam }] } : { slug: categoryParam },
        select: { name: true, metaTitle: true, metaDesc: true, slug: true }
      });
      if (category) {
        title = category.metaTitle && category.metaTitle.trim() !== "" ? category.metaTitle : `Buy ${category.name} Online | Top Quality - Garud`;
        description = category.metaDesc && category.metaDesc.trim() !== "" ? category.metaDesc : `Explore our premium range of ${category.name}. Guaranteed quality & best prices at Garud Aqua Solutions.`;
        url = `https://www.garudaqua.in/products?category=${category.slug}`;
      }
    }
  } catch (e) {
    // Fail silently back to defaults
  }

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      url,
      title,
      description,
    },
  };
}




// Build a Cloudinary URL for preloading (same logic as cloudinary-loader)
function buildPreloadUrl(src: string, width: number, quality: number) {
  if (!src.includes('res.cloudinary.com')) return src;
  const params = `w_${width},q_${quality},f_auto,c_limit`;
  return src.replace('/upload/', `/upload/${params}/`);
}

// Build srcSet string for preload (matches Next.js Image deviceSizes)
function buildPreloadSrcSet(src: string, quality: number) {
  const widths = [256, 384, 640, 750, 828];
  return widths
    .map(w => `${buildPreloadUrl(src, w, quality)} ${w}w`)
    .join(', ');
}

async function getInitialData(filters: {
  category?: string;
  subcategory?: string;
  search?: string;
  sort?: string;
}) {
  // Resolved canonical slugs — used to 301 redirect if a formerSlug was used in the URL
  let canonicalCategory: string | undefined;
  let canonicalSubcategory: string | undefined;

  // Validate category/subcategory slugs and resolve former slugs for redirects
  if (filters.category) {
    if (isObjectId(filters.category)) {
      const cat = await prisma.category.findUnique({ where: { id: filters.category }, select: { id: true } });
      if (!cat) notFound();
    } else {
      let cat = await prisma.category.findFirst({
        where: { slug: filters.category },
        select: { id: true, slug: true },
      });
      if (!cat) {
        cat = await prisma.category.findFirst({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          where: { formerSlugs: { has: filters.category } } as any,
          select: { id: true, slug: true },
        });
      }
      if (!cat) {
        const allCats = await prisma.category.findMany({ select: { id: true, name: true, slug: true } });
        const match = allCats.find(
          (c) =>
            c.name.toLowerCase() === filters.category!.replace(/-/g, " ").toLowerCase() ||
            slugify(c.name) === filters.category
        );
        if (match) cat = match;
      }
      if (cat) {
        if (cat.slug && cat.slug !== filters.category) {
          canonicalCategory = cat.slug;
        }
      } else {
        notFound();
      }
    }
  }

  if (filters.subcategory) {
    if (isObjectId(filters.subcategory)) {
      const sub = await prisma.subcategory.findUnique({ where: { id: filters.subcategory }, select: { id: true } });
      if (!sub) notFound();
    } else {
      let sub = await prisma.subcategory.findFirst({
        where: { slug: filters.subcategory },
        select: { id: true, slug: true },
      });
      if (!sub) {
        sub = await prisma.subcategory.findFirst({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          where: { formerSlugs: { has: filters.subcategory } } as any,
          select: { id: true, slug: true },
        });
      }
      if (!sub) {
        const allSubs = await prisma.subcategory.findMany({ select: { id: true, name: true, slug: true } });
        const match = allSubs.find(
          (s) =>
            s.name.toLowerCase() === filters.subcategory!.replace(/-/g, " ").toLowerCase() ||
            slugify(s.name) === filters.subcategory
        );
        if (match) sub = match;
      }
      if (sub) {
        if (sub.slug && sub.slug !== filters.subcategory) {
          canonicalSubcategory = sub.slug;
        }
      } else {
        notFound();
      }
    }
  }

  const orderBy = [{ category: { sortOrder: 'asc' as const } }, { createdAt: 'desc' as const }];

  // Always load ALL active products so the client can filter locally
  // without needing API calls (works even with aggressive API caching)
  const [categories, subcategories, productData] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, name: true, slug: true, image: true, hasSeoPage: true },
    }),
    prisma.subcategory.findMany({
      where: { isActive: true },
      orderBy: [{ category: { sortOrder: 'asc' } }, { order: 'asc' }],
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        category: { select: { id: true, name: true, slug: true } },
      },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      orderBy,
      take: 200,
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        category: { select: { id: true, name: true, slug: true } },
        subcategory: { select: { id: true, name: true, slug: true } },
      },
    }),
  ]);

  return {
    categories,
    subcategories,
    products: productData.map((p) => ({
      ...p,
      subcategory: p.subcategory ?? undefined,
    })),
    canonicalCategory,
    canonicalSubcategory,
  };
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const category = typeof params.category === 'string' ? params.category : undefined;
  const subcategory = typeof params.subcategory === 'string' ? params.subcategory : undefined;
  const search = typeof params.search === 'string' ? params.search : undefined;
  const sort = typeof params.sort === 'string' ? params.sort : undefined;
  const { categories, subcategories, products, canonicalCategory, canonicalSubcategory } =
    await getInitialData({ category, subcategory, search, sort });

  // 301 redirect if a formerSlug was used in the URL
  if (canonicalCategory || canonicalSubcategory) {
    const newParams = new URLSearchParams();
    const resolvedCategory = canonicalCategory ?? category;
    const resolvedSubcategory = canonicalSubcategory ?? subcategory;
    if (resolvedCategory) newParams.set("category", resolvedCategory);
    if (resolvedSubcategory) newParams.set("subcategory", resolvedSubcategory);
    if (search) newParams.set("search", search);
    if (sort) newParams.set("sort", sort);
    redirect(`/products?${newParams.toString()}`);
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema({
        name: "Products — Water Tanks, Pipes & Fittings",
        description: "Browse Garud Aqua Solutions' full range of HDPE, LLDPE water tanks, PVC pipes, pipe fittings & water management products.",
        url: "https://www.garudaqua.in/products",
      })) }} />
      {/* Preload LCP images — browser starts fetching immediately, before JS hydration */}
      {products.slice(0, 4).map((product: { id: string; image?: string }, i: number) =>
        product.image ? (
          <link
            key={`preload-${product.id}`}
            rel="preload"
            as="image"
            imageSrcSet={buildPreloadSrcSet(product.image, 50)}
            imageSizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            fetchPriority={i === 0 ? "high" : "auto"}
          />
        ) : null
      )}
      <ProductsPage
        initialCategories={categories}
        initialSubcategories={subcategories}
        initialProducts={products}
        initialTotal={products.length}
        initialSearchParams={{ category, subcategory, search, sort }}
      />
    </>
  );
}