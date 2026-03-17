import { notFound, redirect } from "next/navigation";
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

    // A helper for robust slug paths similar to ProductsPage
    const productPath = (p: { slug?: string; id: string }) => p.slug || p.id;

    return (
        <div className="min-h-screen bg-linear-to-b from-[#F2FBFD] to-white dark:from-[#05151B] dark:to-black">
            {/* Full-view Hero Section */}
            <div className="relative isolate overflow-hidden min-h-[40vh] sm:min-h-[50vh] lg:min-h-[60vh] flex flex-col items-center justify-center pt-24 pb-12 rounded-b-[3rem] shadow-xl">
                {/* Background Image (optimized WebP) */}
                <Image
                    src={categoryFull.seoHeroImage || categoryFull.image || '/placeholder-hero.jpg'}
                    alt={categoryFull.name}
                    fill
                    className="object-cover -z-20"
                    sizes="100vw"
                    priority
                    quality={85}
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-black/50 dark:bg-black/70 -z-10 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.5)_100%)]"></div>

                <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center mt-12 md:mt-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-medium mb-6 shadow-sm">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0EA5E9] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#0EA5E9]"></span>
                        </span>
                        Explore Our Range
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-white tracking-tight leading-tight mb-6 drop-shadow-2xl">
                        {categoryFull.name}
                    </h1>
                    {categoryFull.description && (
                        <p className="text-lg md:text-2xl text-gray-100 leading-relaxed max-w-3xl mx-auto font-light drop-shadow-lg">
                            {categoryFull.description}
                        </p>
                    )}
                </div>
            </div>

            {/* Main Content & Products */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 pt-16 relative">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
                    {/* LEFT COLUMN: SEO Rich Content */}
                    <div className="order-2 lg:order-1 lg:col-span-8 space-y-12">
                        {categoryFull.seoContent ? (
                            <div className="bg-white dark:bg-[#0A0A0A] rounded-[2rem] p-8 sm:p-12 shadow-sm border border-gray-100 dark:border-gray-800/50">
                                <div className="blog-content w-full">
                                    <div dangerouslySetInnerHTML={{ __html: categoryFull.seoContent }} />
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-[#0A0A0A] rounded-[2rem] p-8 sm:p-12 shadow-sm border border-gray-100 dark:border-gray-800/50 flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 bg-[#0EA5E9]/10 text-[#0EA5E9] rounded-2xl flex items-center justify-center mb-4">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Explore {categoryFull.name}</h3>
                                <p className="text-gray-500 dark:text-gray-400">Discover our complete range of premium quality products in this category.</p>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: The Products grid list (Sticky) */}
                    <div className="order-1 lg:order-2 lg:col-span-4">
                        <div className="sticky top-28 bg-gray-50 dark:bg-[#111111] p-6 sm:p-8 rounded-[2rem] border border-gray-200/60 dark:border-gray-800/60">
                            <h2 className="text-2xl font-black text-[#2C2C2C] dark:text-white tracking-tight mb-8 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#0EA5E9]/10 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-[#0EA5E9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                    </svg>
                                </div>
                                Top Products
                            </h2>
                            <div className="grid grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-5">
                                {categoryFull.products.map((product, index) => (
                                    <div key={product.id} className="group relative">
                                        <Link href={`/products/${productPath(product)}`} className="block">
                                            <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl dark:shadow-none dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)] transition-all duration-300 group-hover:-translate-y-1.5 border border-gray-100 dark:border-gray-800/80">
                                                <div className="relative aspect-4/3 overflow-hidden bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                                                    {product.image ? (
                                                        <Image
                                                            src={product.image}
                                                            alt={product.name}
                                                            fill
                                                            className="object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                                        />
                                                    ) : (
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <svg className="w-8 h-8 text-[#0EA5E9] opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                                                        <span className="text-white text-xs font-semibold px-4 py-1.5 bg-[#0EA5E9]/90 backdrop-blur-sm rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                                            View Details
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="p-3 sm:p-4 border-t border-gray-50 dark:border-gray-800/50">
                                                    <h3 className="text-[#2C2C2C] dark:text-gray-100 font-bold text-xs sm:text-sm leading-snug line-clamp-2 group-hover:text-[#0EA5E9] transition-colors">
                                                        {product.name}
                                                    </h3>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                            {categoryFull.products.length === 0 && (
                                <div className="text-center py-10 bg-white dark:bg-gray-900/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                                    <p className="text-gray-500 font-medium">Coming Soon</p>
                                    <p className="text-sm text-gray-400 mt-1">Products are being added.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
        </div>
    );
}
