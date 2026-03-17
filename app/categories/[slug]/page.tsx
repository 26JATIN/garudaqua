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

    if (!category || !category.hasSeoPage) {
        return {};
    }

    return {
        title: category.metaTitle || `${category.name} | Garud Aqua Solutions`,
        description: category.metaDesc || category.description || `Explore ${category.name} at Garud Aqua Solutions.`
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

    if (!categoryFull.hasSeoPage) {
        redirect(`/products?category=${categoryFull.slug}`);
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 pt-16">
                <div className="grid grid-cols-1 lg:grid-cols-10 gap-16">
                    {/* LEFT COLUMN: SEO Rich Content */}
                    <div className="lg:col-span-6 space-y-12">
                        {categoryFull.seoContent && (
                            <div className="blog-content w-full">
                                <div dangerouslySetInnerHTML={{ __html: categoryFull.seoContent }} />
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: The Products grid list */}
                    <div className="lg:col-span-4 space-y-8">
                        <div>
                            <h2 className="text-2xl font-black text-[#2C2C2C] dark:text-white tracking-tight mb-6 flex items-center gap-3">
                                <svg className="w-6 h-6 text-[#0EA5E9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                </svg>
                                Available Products
                            </h2>
                            <div className="grid grid-cols-2 lg:grid-cols-2 gap-4">
                                {categoryFull.products.map((product, index) => (
                                    <div key={product.id} className="group">
                                        <Link href={`/products/${productPath(product)}`} className="block">
                                            <div className="bg-white dark:bg-[#0A0A0A] rounded-xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                                                <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
                                                    {product.image ? (
                                                        <Image
                                                            src={product.image}
                                                            alt={product.name}
                                                            fill
                                                            className="object-cover transform group-hover:scale-110 transition-transform duration-500"
                                                            sizes="(max-width: 640px) 50vw, 25vw"
                                                        />
                                                    ) : (
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <svg className="w-8 h-8 text-[#0EA5E9] opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="p-3">
                                                    <h3 className="text-[#2C2C2C] dark:text-gray-100 font-medium text-sm line-clamp-2 group-hover:text-[#0EA5E9] transition-colors">
                                                        {product.name}
                                                    </h3>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                            {categoryFull.products.length === 0 && (
                                <p className="text-gray-500 italic">No products available in this category yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
        </div>
    );
}
