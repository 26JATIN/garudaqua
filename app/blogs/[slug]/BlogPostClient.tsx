"use client";

import Link from "next/link";
import Image from "next/image";

// ===== Type Definitions =====
interface Blog {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    featuredImage?: string;
    category: string;
    categoryName?: string;
    tags: string[];
    readTime: number;
    publishedAt: string;
    author: string;
    isPublished: boolean;
}

export default function BlogPostClient({
    blog,
    relatedBlogs = [],
    categories = []
}: {
    blog: Blog;
    relatedBlogs?: Blog[];
    categories?: { name: string; slug: string }[];
}) {
    if (!blog) {
        return null;
    }

    return (
        <div className="min-h-screen bg-white dark:bg-[#050505] pt-0.5 lg:pt-4.25">
            {/* Article */}
            <article className="w-full pb-16">
                {/* Hero / Header Section: Contains Image + Overlay Buttons */}
                <div className="relative w-full">
                    {/* Featured Image */}
                    {blog.featuredImage && (
                        <div className="w-full bg-gray-50 dark:bg-gray-900">
                            <Image
                                src={blog.featuredImage}
                                alt={blog.title}
                                width={1920}
                                height={1080}
                                sizes="100vw"
                                style={{ width: '100%', height: 'auto' }}
                                priority
                                fetchPriority="high"
                                decoding="sync"
                            />
                        </div>
                    )}
                </div>

                {/* Content Container (Sits perfectly below the image now) */}
                <div className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 ${blog.featuredImage ? 'pt-8 sm:pt-12 relative z-10' : 'pt-16 sm:pt-24'}`}>
                    <div className="bg-white/0">
                        {/* Action Buttons (Back & Share) */}
                        <div className="flex items-center justify-between mb-8">
                            <Link
                                href="/blogs"
                                className="inline-flex items-center px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-gray-50 hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 hover:text-[#0EA5E9] dark:hover:text-[#0EA5E9] transition-all font-medium border border-gray-200 dark:border-white/10 group text-sm"
                            >
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back to Articles
                            </Link>

                            <button
                                onClick={() => {
                                    if (navigator.share) {
                                        navigator.share({ title: blog.title, url: window.location.href }).catch(() => { });
                                    } else {
                                        navigator.clipboard.writeText(window.location.href);
                                        alert("Link copied to clipboard!");
                                    }
                                }}
                                className="inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gray-50 hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400 transition-all border border-gray-200 dark:border-white/10 hover:text-[#0EA5E9] dark:hover:text-[#0EA5E9]"
                                aria-label="Share article"
                                title="Share article"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                </svg>
                            </button>
                        </div>
                        {/* Category Badge */}
                        <div className="mb-6">
                            <span className="inline-block px-5 py-2 bg-[#0EA5E9]/10 text-[#0EA5E9] text-sm font-medium rounded-full">
                                {blog.categoryName || blog.category.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl md:text-5xl font-light tracking-wide mb-8 text-gray-900 dark:text-gray-100 leading-tight">
                            {blog.title}
                        </h1>

                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center gap-6 text-gray-600 dark:text-gray-400 mb-10 pb-8 border-b border-gray-200 dark:border-white/6">
                            <div className="flex items-center gap-2 font-light">
                                <svg className="w-5 h-5 text-[#0EA5E9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span>{blog.author}</span>
                            </div>
                            <div className="flex items-center gap-2 font-light">
                                <svg className="w-5 h-5 text-[#0EA5E9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>
                                    {new Date(blog.publishedAt).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 font-light">
                                <svg className="w-5 h-5 text-[#0EA5E9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{blog.readTime} min read</span>
                            </div>
                        </div>

                        {/* Excerpt */}
                        <div className="text-xl text-gray-700 dark:text-gray-300 mb-10 font-light italic bg-[#0EA5E9]/5 dark:bg-[#0EA5E9]/8 p-8 rounded-2xl border-l-4 border-[#0EA5E9] leading-relaxed">
                            {blog.excerpt}
                        </div>

                        {/* Content */}
                        <div
                            className="blog-content max-w-none mb-10 font-light leading-relaxed text-gray-800 dark:text-gray-200"
                            dangerouslySetInnerHTML={{ __html: blog.content }}
                        />

                        {/* Tags */}
                        {blog.tags.length > 0 && (
                            <div className="pt-10 border-t border-gray-200 dark:border-white/6 mb-10">
                                <h3 className="text-lg font-light mb-5 text-gray-900 dark:text-gray-100">Related Topics</h3>
                                <div className="flex flex-wrap gap-3">
                                    {blog.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-50 dark:bg-white/6 text-gray-700 dark:text-gray-300 rounded-full hover:bg-[#0EA5E9]/10 hover:text-[#0EA5E9] transition-all font-light border border-gray-200 dark:border-white/6"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Internal Navigation CTA */}
                        <div className="pt-8 pb-4 border-t border-gray-200 dark:border-white/6 mt-8">
                            <h3 className="text-xl font-light mb-4 text-gray-900 dark:text-gray-100">Explore Our Range</h3>
                            <p className="text-gray-600 dark:text-gray-400 font-light mb-6">
                                Looking for high-quality water management solutions? Discover our extensive range of durable products designed for everyday needs.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link href="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-[#0EA5E9] hover:bg-[#0284C7] text-white rounded-full font-medium transition-colors shadow-xs">
                                    View All Products
                                </Link>
                                {categories.map(category => (
                                    <Link key={category.slug} href={`/categories/${category.slug}`} className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-900 dark:text-white rounded-full font-medium transition-colors border border-gray-200 dark:border-transparent">
                                        {category.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Blogs */}
                {relatedBlogs.length > 0 && (
                    <div className="mt-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 animate-fadeIn">
                        <h2 className="text-3xl font-light tracking-wide mb-8 text-gray-900 dark:text-gray-100">You May Also Like</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {relatedBlogs.map((relatedBlog) => (
                                <Link
                                    key={relatedBlog.id}
                                    href={`/blogs/${relatedBlog.slug}`}
                                    className="group bg-white dark:bg-[#0A0A0A] rounded-2xl shadow-md dark:shadow-none dark:border dark:border-white/6 overflow-hidden hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1"
                                >
                                    {relatedBlog.featuredImage ? (
                                        <div className="relative h-44 w-full overflow-hidden">
                                            <Image
                                                src={relatedBlog.featuredImage}
                                                alt={relatedBlog.title}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                                                sizes="(max-width: 768px) 100vw, 33vw"
                                                quality={50}
                                            />
                                            <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                        </div>
                                    ) : (
                                        <div className="h-44 bg-linear-to-br from-[#0EA5E9]/20 via-[#0369A1]/10 to-[#0EA5E9]/20 flex items-center justify-center">
                                            <svg className="w-12 h-12 text-[#0EA5E9]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                    )}
                                    <div className="p-5">
                                        <h3 className="font-light text-lg mb-2 group-hover:text-[#0EA5E9] transition-colors line-clamp-2 tracking-wide dark:text-gray-100">
                                            {relatedBlog.title}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-3 font-light leading-relaxed">
                                            {relatedBlog.excerpt}
                                        </p>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span className="flex items-center gap-1.5 font-light">
                                                <svg className="w-3.5 h-3.5 text-[#0EA5E9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {relatedBlog.readTime} min
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </article>
        </div>
    );
}
