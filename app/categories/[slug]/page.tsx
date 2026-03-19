import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";

export const dynamic = "force-static";

export async function generateMetadata(
    { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
    const { slug } = await params;
    const category = await prisma.category.findFirst({
        where: { slug }
    });

    if (!category) {
        return {};
    }

    const canonicalUrl = `https://garudaqua.in/categories/${slug}`;

    return {
        title: category.metaTitle || `${category.name} | Garud Aqua Solutions`,
        description: category.metaDesc || category.description || `Explore ${category.name} at Garud Aqua Solutions.`,
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            url: canonicalUrl,
            title: category.metaTitle || `${category.name} | Garud Aqua Solutions`,
            description: category.metaDesc || category.description || `Explore ${category.name} at Garud Aqua Solutions.`,
        },
    };
}

export default async function CategorySeoPage(
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;

    const categoryFull = await prisma.category.findFirst({
        where: { slug },
        include: {
            products: {
                where: { isActive: true },
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    image: true,
                    category: { select: { name: true, slug: true } },
                    subcategory: { select: { name: true } },
                }
            }
        }
    });

    if (!categoryFull) {
        notFound();
    }

    const productPath = (p: { slug?: string; id: string }) => p.slug || p.id;
    const heroImageSrc = categoryFull.seoHeroImage || categoryFull.image || "/placeholder-hero.jpg";

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#060606]">
            {/* Hero Section */}
            <div className="relative overflow-hidden min-h-72 sm:min-h-96 lg:min-h-[55vh] flex flex-col justify-end">
                {/* Background image — fully interactive for copy/save */}
                <Image
                    src={heroImageSrc}
                    alt={categoryFull.name}
                    fill
                    className="object-cover object-center"
                    sizes="100vw"
                    priority
                    fetchPriority="high"
                    decoding="sync"
                    quality={85}
                />

                {/* Gradient overlays — pointer-events-none so image stays copyable */}
                <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/40 to-black/10 pointer-events-none" />
                <div className="absolute inset-0 bg-linear-to-r from-black/40 via-transparent to-transparent pointer-events-none" />

                {/* Content overlay — also pointer-events-none, links get pointer-events back */}
                <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12 lg:pb-16 pt-28 sm:pt-36 pointer-events-none">
                    {/* Breadcrumb */}
                    <nav className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm text-gray-300/90 mb-5 sm:mb-6 pointer-events-auto">
                        <Link href="/" className="hover:text-white transition-colors">Home</Link>
                        <svg className="w-3 h-3 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        <Link href="/categories" className="hover:text-white transition-colors">Categories</Link>
                        <svg className="w-3 h-3 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        <span className="text-white font-medium">{categoryFull.name}</span>
                    </nav>

                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.1] mb-3 sm:mb-4 drop-shadow-lg">
                        {categoryFull.name}
                    </h1>
                    {categoryFull.description && (
                        <p className="text-sm sm:text-base md:text-lg text-gray-200/90 max-w-2xl leading-relaxed font-light">
                            {categoryFull.description}
                        </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 mt-5 sm:mt-7 pointer-events-auto">
                        {categoryFull.products.length > 0 && (
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0EA5E9] text-white text-xs sm:text-sm font-semibold shadow-lg shadow-[#0EA5E9]/25">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                                {categoryFull.products.length} {categoryFull.products.length === 1 ? "Product" : "Products"}
                            </div>
                        )}
                        <Link
                            href="/products"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 text-white text-xs sm:text-sm font-medium hover:bg-white/25 transition-colors"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                            All Products
                        </Link>
                    </div>
                </div>
            </div>

            {/* Products Section */}
            {categoryFull.products.length > 0 && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
                    <div className="flex items-center gap-3 mb-6 sm:mb-8">
                        <div className="w-1 h-7 rounded-full bg-linear-to-b from-[#0EA5E9] to-[#0284C7]" />
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
                            Products in {categoryFull.name}
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
                        {categoryFull.products.map((product) => (
                            <Link
                                key={product.id}
                                href={`/products/${productPath(product)}`}
                                className="group bg-white dark:bg-[#111] rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-xl dark:shadow-none transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-white/8 hover:border-[#0EA5E9]/30 flex flex-col"
                            >
                                <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-[#0A0A0A]">
                                    {product.image ? (
                                        <Image
                                            src={product.image}
                                            alt={product.name}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <svg className="w-10 h-10 text-gray-200 dark:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                            </svg>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </div>
                                <div className="p-3 sm:p-4 flex-1 flex flex-col justify-center">
                                    <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-[#0EA5E9] transition-colors line-clamp-2 leading-snug">
                                        {product.name}
                                    </h3>
                                    {product.subcategory && (
                                        <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 mt-1 truncate">
                                            {product.subcategory.name}
                                        </p>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* SEO Content Section */}
            {categoryFull.seoContent && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20 lg:pb-28">
                    <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 lg:p-14 shadow-sm border border-gray-100 dark:border-white/6">
                        <div className="blog-content max-w-4xl mx-auto">
                            <div dangerouslySetInnerHTML={{ __html: categoryFull.seoContent }} />
                        </div>
                    </div>
                </div>
            )}

            {/* No SEO content & no products fallback */}
            {!categoryFull.seoContent && categoryFull.products.length === 0 && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
                    <div className="text-center py-16 bg-white dark:bg-[#111] rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 max-w-xl mx-auto">
                        <div className="w-16 h-16 bg-[#0EA5E9]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-[#0EA5E9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Explore {categoryFull.name}</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Products are being added. Check back soon!</p>
                    </div>
                </div>
            )}
        </div>
    );
}
