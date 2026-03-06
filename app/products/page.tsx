import { Suspense } from 'react';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import ProductsPage from "../components/ProductsPage";

export const metadata: Metadata = {
  title: "Products — Water Tanks, Pipes & Fittings",
  description:
    "Browse Garud Aqua Solutions' full range of HDPE water tanks, PVC & CPVC pipes, pipe fittings, agricultural sprayers and water management products available in Rajasthan.",
  alternates: { canonical: "https://garudaqua.in/products" },
  openGraph: {
    url: "https://garudaqua.in/products",
    title: "Products — Water Tanks, Pipes & Fittings | Garud Aqua Solutions",
    description:
      "Browse our full range of HDPE water tanks, PVC pipes, pipe fittings & agricultural water products.",
  },
};

export const revalidate = 60; // ISR: revalidate every 60 seconds

async function getInitialData() {
  const [categories, subcategories, productData] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, name: true, image: true },
    }),
    prisma.subcategory.findMany({
      where: { isActive: true },
      orderBy: [{ category: { sortOrder: 'asc' } }, { order: 'asc' }],
      select: {
        id: true,
        name: true,
        image: true,
        category: { select: { id: true, name: true } },
      },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: [{ category: { sortOrder: 'asc' } }, { createdAt: 'desc' }],
      take: 200,
      select: {
        id: true,
        name: true,
        image: true,
        category: { select: { id: true, name: true } },
        subcategory: { select: { id: true, name: true } },
      },
    }),
  ]);

  // Serialize dates/ObjectIds to plain JSON
  return {
    categories: JSON.parse(JSON.stringify(categories)),
    subcategories: JSON.parse(JSON.stringify(subcategories)),
    products: JSON.parse(JSON.stringify(productData)),
  };
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const { categories, subcategories, products } = await getInitialData();

  // Build preload URLs for the first 2 product images (LCP candidates)
  const preloadImages = products
    .filter((p: { image?: string }) => p.image?.includes('res.cloudinary.com'))
    .slice(0, 2)
    .map((p: { image: string }) =>
      p.image.replace('/upload/', '/upload/w_384,q_75,f_auto,c_limit/')
    );

  return (
    <>
      {/* Preload LCP-candidate product images */}
      {preloadImages.map((src: string) => (
        <link key={src} rel="preload" as="image" href={src} fetchPriority="high" />
      ))}
      <Suspense fallback={
      <div className="min-h-screen pt-4 md:pt-6 lg:pt-8 bg-gray-50 dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-3 mb-6">
            <div className="h-10 w-24 bg-gray-200 dark:bg-gray-800 rounded-lg shimmer"></div>
            <div className="h-10 w-32 bg-gray-200 dark:bg-gray-800 rounded-lg shimmer"></div>
            <div className="h-10 flex-1 bg-gray-200 dark:bg-gray-800 rounded-lg shimmer"></div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden">
                <div className="aspect-4/5 bg-gray-200 dark:bg-gray-800 shimmer"></div>
                <div className="p-3 space-y-2">
                  <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded shimmer"></div>
                  <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-800 rounded shimmer"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    }>
      <ProductsPage
        initialCategories={categories}
        initialSubcategories={subcategories}
        initialProducts={products}
        initialTotal={products.length}
        initialSearchParams={{
          category: typeof params.category === 'string' ? params.category : undefined,
          subcategory: typeof params.subcategory === 'string' ? params.subcategory : undefined,
          search: typeof params.search === 'string' ? params.search : undefined,
          sort: typeof params.sort === 'string' ? params.sort : undefined,
        }}
      />
    </Suspense>
    </>
  );
}