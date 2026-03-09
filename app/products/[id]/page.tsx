import { Suspense } from "react";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ProductDetail from "./ProductDetail";
import { productSchema, breadcrumbSchema } from "@/lib/jsonld";

export const revalidate = 60;

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        name: true,
        description: true,
        image: true,
        category: { select: { name: true } },
      },
    });

    if (!product) {
      return { title: "Product Not Found" };
    }

    const title = product.name;
    const categoryName = product.category?.name ?? "Product";
    const description =
      product.description?.slice(0, 155) ||
      `Buy ${product.name} — ${categoryName} from Garud Aqua Solutions. Quality water management products in Rajasthan.`;
    const url = `https://garudaqua.in/products/${id}`;

    return {
      title,
      description,
      alternates: { canonical: url },
      openGraph: {
        url,
        title: `${title} | Garud Aqua Solutions`,
        description,
        images: product.image ? [{ url: product.image, alt: title }] : [],
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

async function getProductData(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true } },
        subcategory: { select: { id: true, name: true } },
      },
    });

    if (!product) return { product: null, related: [] };

    const related = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        isActive: true,
        id: { not: product.id },
      },
      take: 4,
      include: {
        category: { select: { id: true, name: true } },
        subcategory: { select: { id: true, name: true } },
      },
    });

    return {
      product: JSON.parse(JSON.stringify(product)),
      related: JSON.parse(JSON.stringify(related)),
    };
  } catch {
    return { product: null, related: [] };
  }
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { product, related } = await getProductData(id);

  // Preload the main product image for LCP
  const preloadImage = product?.image?.includes('res.cloudinary.com')
    ? product.image.replace('/upload/', '/upload/w_800,q_85,f_auto,c_limit/')
    : null;

  return (
    <>
      {product && (
        <>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema(product)) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema([
            { name: "Home", url: "https://garudaqua.in" },
            { name: "Products", url: "https://garudaqua.in/products" },
            { name: product.name, url: `https://garudaqua.in/products/${id}` },
          ])) }} />
        </>
      )}
      {preloadImage && (
        <link rel="preload" as="image" href={preloadImage} fetchPriority="high" />
      )}
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
          productId={id}
          initialProduct={product}
          initialRelated={related}
        />
      </Suspense>
    </>
  );
}
