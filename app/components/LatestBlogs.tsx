import Link from "next/link";
import Image from "next/image";

interface BlogPreview {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    featuredImage: string | null;
    readTime: number;
    publishedAt: string;
    categoryId: string | null;
    blogCategory: { name: string } | null;
}

interface BlogCategory {
    id: string;
    name: string;
    slug: string;
}

interface LatestBlogsProps {
    blogs: BlogPreview[];
    categories: BlogCategory[];
}

export default function LatestBlogs({ blogs, categories }: LatestBlogsProps) {
    return (
        <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-[#060606]">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10 sm:mb-12">
                    <div>
                        <p className="text-sm font-semibold text-[#0369A1] dark:text-[#0EA5E9] uppercase tracking-wider mb-2">From Our Blog</p>
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                            Latest Insights
                        </h2>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                        {categories.slice(0, 4).map((cat) => (
                            <Link
                                key={cat.id}
                                href={`/blogs/category/${cat.slug}`}
                                className="px-3.5 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full hover:border-[#0EA5E9] hover:text-[#0EA5E9] transition-colors"
                            >
                                {cat.name}
                            </Link>
                        ))}
                        <Link
                            href="/blogs"
                            className="px-3.5 py-1.5 text-xs font-semibold text-[#0369A1] dark:text-[#0EA5E9] bg-[#0EA5E9]/10 rounded-full hover:bg-[#0EA5E9] hover:text-white transition-colors"
                        >
                            View All
                        </Link>
                    </div>
                </div>

                {/* Blog Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
                    {blogs.map((blog, index) => (
                        <Link
                            key={blog.id}
                            href={`/blogs/${blog.slug}`}
                            className="group bg-white dark:bg-[#0A0A0A] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl dark:shadow-none transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-white/6 hover:border-[#0EA5E9]/30 flex flex-col h-full"
                        >
                            {/* Image */}
                            {blog.featuredImage ? (
                                <div className="relative h-48 sm:h-52 overflow-hidden">
                                    <Image
                                        src={blog.featuredImage}
                                        alt={blog.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        quality={30}
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </div>
                            ) : (
                                <div className="h-48 sm:h-52 bg-linear-to-br from-[#0EA5E9]/10 to-[#0369A1]/10 flex items-center justify-center">
                                    <svg className="w-12 h-12 text-[#0EA5E9]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                    </svg>
                                </div>
                            )}

                            {/* Content */}
                            <div className="p-5 sm:p-6 flex flex-col flex-1">
                                {blog.blogCategory && (
                                    <span className="inline-block self-start px-3 py-1 bg-[#0EA5E9]/10 text-[#0369A1] dark:text-[#0EA5E9] text-xs font-medium rounded-full mb-3">
                                        {blog.blogCategory.name}
                                    </span>
                                )}
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-[#0EA5E9] transition-colors line-clamp-2 mb-2 leading-snug">
                                    {blog.title}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 font-light flex-1 mb-4">
                                    {blog.excerpt}
                                </p>
                                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-white/6 mt-auto">
                                    <span className="flex items-center gap-1">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {blog.readTime} min read
                                    </span>
                                    <span>
                                        {new Date(blog.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
