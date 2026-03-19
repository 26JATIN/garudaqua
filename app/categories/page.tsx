import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-static";

export const metadata: Metadata = {
    title: "All Categories | Garud Aqua Solutions",
    description: "Browse all our high-quality water management products, from overhead water tanks to agriculture sprayer tanks and CPVC pipes.",
    alternates: {
        canonical: "https://garudaqua.in/categories",
    },
    openGraph: {
        url: "https://garudaqua.in/categories",
        title: "All Categories | Garud Aqua Solutions",
        description: "Browse all our high-quality water management products, from overhead water tanks to agriculture sprayer tanks and CPVC pipes.",
    },
};

export default async function CategoriesIndexPage() {
    const categories = await prisma.category.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        include: {
            _count: {
                select: { products: { where: { isActive: true } } },
            },
        },
    });

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#060606]">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-linear-to-br from-[#0c1a2e] via-[#0f2440] to-[#0a1628]">
                {/* Decorative elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-0 right-0 w-125 h-125 bg-[#0EA5E9]/8 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
                    <div className="absolute bottom-0 left-0 w-100 h-100 bg-[#0EA5E9]/6 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4" />
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-28 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0EA5E9]/10 border border-[#0EA5E9]/20 backdrop-blur-sm mb-6">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#0EA5E9] animate-pulse" />
                        <span className="text-[#38BDF8] text-sm font-medium tracking-wide">Garud Aqua Solutions</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-4 sm:mb-6">
                        Explore Our{" "}
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-[#38BDF8] via-[#0EA5E9] to-[#0284C7]">
                            Categories
                        </span>
                    </h1>
                    <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed font-light">
                        Discover our complete range of premium water storage, transferring, and management solutions designed for lasting durability.
                    </p>
                    <div className="flex items-center justify-center gap-6 mt-8 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-[#0EA5E9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-400">Premium Quality</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-[#0EA5E9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-400">Since 2014</span>
                        </div>
                        <div className="hidden sm:flex items-center gap-2">
                            <svg className="w-4 h-4 text-[#0EA5E9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-400">ISI Certified</span>
                        </div>
                    </div>
                </div>

                {/* Bottom wave/curve */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
                        <path d="M0 60L1440 60L1440 30C1440 30 1200 0 720 0C240 0 0 30 0 30L0 60Z" className="fill-gray-50 dark:fill-[#060606]" />
                    </svg>
                </div>
            </div>

            {/* Categories Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 md:py-20">
                {/* Section label */}
                <div className="flex items-center justify-between mb-8 sm:mb-12">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-8 rounded-full bg-linear-to-b from-[#0EA5E9] to-[#0284C7]" />
                        <div>
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
                                All Categories
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {categories.length} categories available
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 lg:gap-8">
                    {categories.map((category, index) => (
                        <Link
                            key={category.id}
                            href={`/categories/${category.slug}`}
                            className="group relative bg-white dark:bg-[#111111] rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl dark:shadow-none transition-all duration-500 hover:-translate-y-2 border border-gray-100 dark:border-white/8 hover:border-[#0EA5E9]/30 dark:hover:border-[#0EA5E9]/40 flex flex-col"
                        >
                            {/* Image */}
                            <div className="relative aspect-4/3 overflow-hidden bg-linear-to-br from-gray-100 to-gray-50 dark:from-[#0A0A0A] dark:to-[#111]">
                                {category.image ? (
                                    <Image
                                        src={category.image}
                                        alt={category.name}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                        priority={index < 4}
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <svg className="w-16 h-16 text-gray-200 dark:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                    </div>
                                )}
                                {/* Gradient overlay */}
                                <div className="absolute inset-0 bg-linear-to-t from-black/50 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                {/* Product count badge */}
                                {category._count.products > 0 && (
                                    <div className="absolute top-3 right-3 px-2.5 py-1 bg-white/90 dark:bg-black/70 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-700 dark:text-gray-200 shadow-sm border border-white/20">
                                        {category._count.products} {category._count.products === 1 ? "Product" : "Products"}
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-5 sm:p-6 flex flex-col flex-1">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-[#0EA5E9] transition-colors duration-300 mb-2 line-clamp-2">
                                    {category.name}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-1 font-light leading-relaxed">
                                    {category.description || "View products in this category."}
                                </p>

                                {/* CTA */}
                                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/6 mt-auto">
                                    <span className="text-sm font-medium text-[#0EA5E9] group-hover:text-[#0284C7] transition-colors">
                                        Explore Collection
                                    </span>
                                    <div className="w-8 h-8 rounded-full bg-[#0EA5E9]/10 group-hover:bg-[#0EA5E9] flex items-center justify-center transition-all duration-300">
                                        <svg className="w-4 h-4 text-[#0EA5E9] group-hover:text-white transition-colors duration-300 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {categories.length === 0 && (
                    <div className="text-center py-24 bg-white dark:bg-[#111] rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 mx-auto max-w-2xl">
                        <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800/50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                            <svg className="w-10 h-10 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No categories found</h3>
                        <p className="text-gray-500 dark:text-gray-400">Categories will appear here once they are added.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
