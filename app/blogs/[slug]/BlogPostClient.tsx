"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";

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

export default function BlogPostClient({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);

    const [blog, setBlog] = useState<Blog | null>(null);
    const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [isNotFound, setNotFound] = useState(false);

    useEffect(() => {
        async function fetchBlog() {
            setLoading(true);
            setNotFound(false);
            try {
                const res = await fetch(`/api/blogs/${slug}`);
                if (res.status === 404) {
                    setNotFound(true);
                    return;
                }
                if (!res.ok) throw new Error("Failed to fetch blog");

                const data = await res.json();
                setBlog(data.blog);
                setRelatedBlogs(data.related || []);
            } catch {
                toast.error("Failed to load article.");
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        }
        fetchBlog();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-linear-to-b from-gray-50 via-white to-gray-50 dark:from-black dark:via-[#050505] dark:to-[#0A0A0A]">
                {/* Back Button */}
                <div className="border-b border-gray-100 dark:border-white/6 sticky top-0 z-50 backdrop-blur-sm bg-white/90 dark:bg-black/90">
                    <div className="container mx-auto px-4 py-4">
                        <Link href="/blogs" className="inline-flex items-center text-[#0369A1] hover:text-[#0EA5E9] transition-colors font-light">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Blog
                        </Link>
                    </div>
                </div>

                <article className="container mx-auto px-4 py-12 max-w-5xl">
                    <div className="bg-white dark:bg-[#0A0A0A] rounded-3xl shadow-xl dark:shadow-none dark:border dark:border-white/6 overflow-hidden animate-pulse">
                        <div className="h-64 sm:h-80 md:h-125 bg-gray-200 dark:bg-white/10" />
                        <div className="p-8 md:p-12 space-y-6">
                            <div className="h-8 bg-gray-200 dark:bg-white/10 rounded-full w-32" />
                            <div className="h-12 bg-gray-200 dark:bg-white/10 rounded w-3/4" />
                            <div className="flex gap-6">
                                <div className="h-5 bg-gray-200 dark:bg-white/10 rounded w-28" />
                                <div className="h-5 bg-gray-200 dark:bg-white/10 rounded w-28" />
                                <div className="h-5 bg-gray-200 dark:bg-white/10 rounded w-24" />
                            </div>
                            <div className="h-24 bg-gray-200 dark:bg-white/10 rounded-2xl" />
                            <div className="space-y-3">
                                <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-full" />
                                <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-full" />
                                <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-5/6" />
                                <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-full" />
                                <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-3/4" />
                            </div>
                        </div>
                    </div>
                </article>
            </div>
        );
    }

    if (isNotFound) {
        notFound();
    }

    if (!blog) {
        return null;
    }

    return (
        <div className="min-h-screen bg-linear-to-b from-gray-50 via-white to-gray-50 dark:from-black dark:via-[#050505] dark:to-[#0A0A0A]">
            {/* Back Button */}
            <div className="border-b border-gray-100 dark:border-white/6 sticky top-0 z-50 backdrop-blur-sm bg-white/90 dark:bg-black/90">
                <div className="container mx-auto px-4 py-4">
                    <Link href="/blogs" className="inline-flex items-center text-[#0369A1] hover:text-[#0EA5E9] transition-colors font-light">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Blog
                    </Link>
                </div>
            </div>

            {/* Article */}
            <article className="container mx-auto px-4 py-12 max-w-5xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-white dark:bg-[#0A0A0A] rounded-3xl shadow-xl dark:shadow-none dark:border dark:border-white/6 overflow-hidden"
                >
                    {/* Featured Image */}
                    {blog.featuredImage && (
                        <div className="relative h-64 sm:h-80 md:h-125 w-full overflow-hidden">
                            <Image
                                src={blog.featuredImage}
                                alt={blog.title}
                                fill
                                className="object-cover"
                                priority
                                sizes="(max-width: 1280px) 100vw, 1280px"
                                quality={85}
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent"></div>
                        </div>
                    )}

                    {/* Content */}
                    <div className="p-8 md:p-12">
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
                            <div className="pt-10 border-t border-gray-200 dark:border-white/6">
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
                    </div>
                </motion.div>

                {/* Related Blogs */}
                {relatedBlogs.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="mt-16"
                    >
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
                                                quality={70}
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
                    </motion.div>
                )}
            </article>
        </div>
    );
}
