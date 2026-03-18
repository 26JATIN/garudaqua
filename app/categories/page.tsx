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
    // Fetch all active categories that have an SEO page enabled
    const categories = await prisma.category.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
    });

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0A] flex flex-col">
            {/* Header Section */}
            <div className="relative bg-[#0A0A0A] overflow-hidden pt-6 pb-6 sm:pt-10 sm:pb-8">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                    <div className="absolute inset-0 bg-linear-to-t from-[#0A0A0A] via-transparent to-[#0EA5E9]/10"></div>
                </div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center justify-center px-4 py-1 rounded-full bg-[#0EA5E9]/10 text-[#0EA5E9] font-medium text-xs sm:text-sm mb-2.5 border border-[#0EA5E9]/20 backdrop-blur-sm">
                        Garud Aqua Solutions
                    </div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight mb-1.5 sm:mb-2">
                        Explore Our <span className="text-transparent bg-clip-text bg-linear-to-r from-[#0EA5E9] to-[#38BDF8]">Categories</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-400 max-w-2xl mx-auto px-4">
                        Discover our complete range of premium water storage, transferring, and management solutions designed for lasting durability.
                    </p>
                </div>
            </div>

            {/* Categories Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full -mt-2 sm:-mt-2 relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
                    {categories.map((category) => (
                        <div key={category.id} className="group relative">
                            <Link 
                                href={`/categories/${category.slug}`}
                                className="block h-full"
                            >
                                <div className="bg-white dark:bg-[#111111] rounded-4xl sm:rounded-2xl overflow-hidden shadow-md sm:shadow-sm hover:shadow-xl dark:shadow-none dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)] transition-all duration-300 h-full flex flex-col border border-gray-100/80 dark:border-gray-800/80 group-hover:-translate-y-1.5 group-hover:border-[#0EA5E9]/30 dark:group-hover:border-[#0EA5E9]/50">
                                    <div className="relative aspect-4/3 bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden isolate">
                                        {category.image ? (
                                            <Image
                                                src={category.image}
                                                alt={category.name}
                                                fill
                                                className="object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                                                <svg className="w-8 h-8 sm:w-12 sm:h-12 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                </svg>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </div>
                                    <div className="p-3 sm:p-5 lg:p-6 flex flex-col flex-1 bg-white dark:bg-[#111111] relative">
                                        <h3 className="text-[15px] sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100 mb-1.5 sm:mb-2 group-hover:text-[#0EA5E9] transition-colors leading-tight line-clamp-2 min-h-10 sm:min-h-12.5 lg:min-h-14">
                                            {category.name}
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400 text-[12px] sm:text-sm line-clamp-2 sm:line-clamp-3 mb-3 sm:mb-4 flex-1">
                                            {category.description || "View products in this category."}
                                        </p>
                                        <div className="flex items-center text-[#0EA5E9] text-[11px] sm:text-sm font-semibold mt-auto group-hover:tracking-wider transition-all duration-300 uppercase sm:capitalize tracking-widest sm:tracking-normal w-full justify-between sm:justify-start">
                                            <span>Explore <span className="hidden sm:inline">&nbsp;Collection</span></span>
                                            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:ml-1 transform group-hover:translate-x-1.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>

                {categories.length === 0 && (
                    <div className="text-center py-20 bg-white dark:bg-gray-900/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-800 mx-auto max-w-2xl">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No categories found</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Categories will appear here once they are added.</p>
                    </div>
                )}
            </div>
        </div>
    );
}