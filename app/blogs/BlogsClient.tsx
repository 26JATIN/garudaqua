"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import NavigationLink from "@/app/components/NavigationLink";
import Image from "next/image";
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
    categoryId: string | null;
    tags: string[];
    readTime: number;
    publishedAt: string;
    author: string;
    isPublished: boolean;
}

interface BlogCategory {
    id: string;
    name: string;
    slug: string;
}

interface BlogsClientProps {
    initialCategories?: BlogCategory[];
    initialBlogs?: Blog[];
    initialTotal?: number;
    initialTotalPages?: number;
    initialCategory?: string;
}

export default function BlogsClient({
    initialCategories,
    initialBlogs,
    initialTotalPages,
    initialCategory,
}: BlogsClientProps) {
    const hasInitialData = !!(initialBlogs && initialCategories);
    const isInitialMount = useRef(true);

    const [searchTerm, setSearchTerm] = useState("");
    const [category, setCategory] = useState(initialCategory || "all");
    const [blogs, setBlogs] = useState<Blog[]>(initialBlogs ?? []);
    const [categories, setCategories] = useState<BlogCategory[]>(initialCategories ?? []);
    const [loading, setLoading] = useState(!hasInitialData);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(initialTotalPages ?? 1);

    useEffect(() => {
        if (hasInitialData) return; // skip if we already have server data
        fetch("/api/blog-categories")
            .then((res) => res.ok ? res.json() : [])
            .then((data) => setCategories(Array.isArray(data) ? data : []))
            .catch(() => setCategories([]));
    }, [hasInitialData]);

    const fetchBlogs = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (category !== "all") params.set("category", category);
            if (searchTerm.trim()) params.set("search", searchTerm.trim());
            params.set("page", String(page));
            params.set("limit", "10");

            const res = await fetch(`/api/blogs?${params.toString()}`);
            if (!res.ok) throw new Error("Failed to fetch blogs");

            const data = await res.json();
            setBlogs(data.blogs);
            setTotalPages(data.totalPages);
        } catch {
            toast.error("Failed to load blogs.");
        } finally {
            setLoading(false);
        }
    }, [category, searchTerm, page]);

    useEffect(() => {
        // Skip the very first fetch if we have server-prefetched data
        if (isInitialMount.current && hasInitialData) {
            isInitialMount.current = false;
            return;
        }
        isInitialMount.current = false;
        fetchBlogs();
    }, [fetchBlogs, hasInitialData]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setPage(1);
    }, [category, searchTerm]);

    const getCategoryName = (blog: Blog) => {
        if (blog.categoryId) {
            const cat = categories.find((c) => c.id === blog.categoryId);
            if (cat) return cat.name;
        }
        return blog.category.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    };

    return (
        <div className="min-h-screen bg-linear-to-b from-gray-50 via-white to-gray-50 dark:from-black dark:via-[#050505] dark:to-[#0A0A0A] md:py-4">
            {/* Hero Section */}
            <div className="relative bg-linear-to-br from-[#2C2C2C] via-[#3A3A3A] to-[#2C2C2C] text-white py-24 overflow-hidden">
                <div className="absolute inset-0 opacity-5" aria-hidden="true">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-[#2C2C2C] rounded-full filter blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#2C2C2C] rounded-full filter blur-3xl"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div
                        className="text-center mb-12"
                    >
                        <h1 className="text-5xl md:text-6xl font-normal tracking-wide mb-6 text-white">
                            Our <span className="text-[#7DD3FC]">Blog</span>
                        </h1>
                        <p className="text-xl font-light text-gray-300 max-w-2xl mx-auto leading-relaxed">
                            Expert tips, guides, and insights on water tanks, pipes & plumbing solutions
                        </p>
                    </div>

                    {/* Search Bar */}
                    <form
                        onSubmit={(e) => e.preventDefault()}
                        className="max-w-2xl mx-auto"
                    >
                        <div className="relative">
                            <svg className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search articles, tips, guides..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-14 pr-6 py-5 text-gray-900 dark:text-gray-100 bg-white/95 dark:bg-white/10 backdrop-blur-sm rounded-full shadow-2xl focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] transition-all font-light dark:placeholder-gray-500"
                            />
                        </div>
                    </form>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16">
                {/* Category Filter */}
                <div className="mb-12">
                    <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-2 md:flex-wrap md:justify-center md:overflow-x-visible md:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        <NavigationLink
                            href="/blogs"
                            onClick={(e) => { e.preventDefault(); setCategory("all"); }}
                            className={`shrink-0 snap-start whitespace-nowrap px-5 py-2.5 md:px-6 md:py-3 rounded-full font-light transition-all duration-300 ${
                                category === "all"
                                    ? "bg-[#0369A1] text-white shadow-lg md:scale-105"
                                    : "bg-white dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/15 hover:shadow-md border border-gray-200 dark:border-white/6"
                            }`}
                        >
                            All Articles
                        </NavigationLink>
                        {categories.map((cat) => (
                            <NavigationLink
                                key={cat.id}
                                href={`/blogs/category/${cat.slug}`}
                                onClick={(e) => { e.preventDefault(); setCategory(cat.slug); }}
                                className={`shrink-0 snap-start whitespace-nowrap px-5 py-2.5 md:px-6 md:py-3 rounded-full font-light transition-all duration-300 ${
                                    category === cat.slug
                                        ? "bg-[#0369A1] text-white shadow-lg md:scale-105"
                                        : "bg-white dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/15 hover:shadow-md border border-gray-200 dark:border-white/6"
                                }`}
                            >
                                {cat.name}
                            </NavigationLink>
                        ))}
                    </div>
                </div>

                {/* Blog Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="bg-white dark:bg-[#0A0A0A] rounded-3xl shadow-md dark:shadow-none dark:border dark:border-white/6 overflow-hidden animate-pulse">
                                <div className="h-56 bg-gray-200 dark:bg-white/10" />
                                <div className="p-6 space-y-3">
                                    <div className="h-5 bg-gray-200 dark:bg-white/10 rounded-full w-24" />
                                    <div className="h-6 bg-gray-200 dark:bg-white/10 rounded w-full" />
                                    <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-full" />
                                    <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-3/4" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : blogs.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-[#0A0A0A] rounded-3xl shadow-sm dark:border dark:border-white/6">
                        <svg className="w-20 h-20 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-500 dark:text-gray-400 text-lg font-light">No articles found</p>
                        <p className="text-gray-400 dark:text-gray-500 text-sm mt-2 font-light">Try adjusting your search or filter</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {blogs.map((blog, index) => (
                            <div key={blog.id}>
                                <NavigationLink
                                    href={`/blogs/${blog.slug}`}
                                    className="group bg-white dark:bg-[#0A0A0A] rounded-3xl shadow-md dark:shadow-none dark:border dark:border-white/6 overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 flex flex-col h-full"
                                >
                                    {/* Featured Image */}
                                    {blog.featuredImage ? (
                                        <div className="relative h-56 w-full overflow-hidden">
                                            <Image
                                                src={blog.featuredImage}
                                                alt={blog.title}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                quality={30}
                                                priority={index < 3}
                                                fetchPriority={index < 3 ? "high" : "auto"}
                                                decoding={index < 3 ? "sync" : "async"}
                                                loading={index < 3 ? undefined : "lazy"}
                                            />
                                            <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                        </div>
                                    ) : (
                                        <div className="h-56 bg-linear-to-br from-[#0EA5E9]/20 via-[#0369A1]/10 to-[#0EA5E9]/20 flex items-center justify-center">
                                            <svg className="w-16 h-16 text-[#0EA5E9]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                    )}

                                    {/* Content */}
                                    <div className="p-6 flex flex-col flex-1">
                                        {/* Category Badge */}
                                        <div className="mb-3">
                                            <span className="inline-block px-4 py-1.5 bg-[#0EA5E9]/10 text-[#0369A1] dark:text-[#0EA5E9] text-xs font-medium rounded-full">
                                                {getCategoryName(blog)}
                                            </span>
                                        </div>

                                        {/* Title */}
                                        <h2 className="text-xl font-normal mb-3 text-gray-900 dark:text-gray-100 group-hover:text-[#0369A1] dark:group-hover:text-[#0EA5E9] transition-colors line-clamp-2 tracking-wide">
                                            {blog.title}
                                        </h2>

                                        {/* Excerpt */}
                                        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 font-light leading-relaxed text-sm">
                                            {blog.excerpt}
                                        </p>

                                        {/* Meta Info */}
                                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-100 dark:border-white/6 mt-auto">
                                            <div className="flex items-center gap-4 font-light">
                                                <span className="flex items-center gap-1.5">
                                                    <svg className="w-4 h-4 text-[#0EA5E9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    {blog.readTime} min
                                                </span>
                                            </div>
                                            <span className="flex items-center gap-1.5 text-xs font-light">
                                                <svg className="w-3.5 h-3.5 text-[#0EA5E9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span suppressHydrationWarning>{new Date(blog.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                                            </span>
                                        </div>

                                        {/* Tags */}
                                        {blog.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-4">
                                                {blog.tags.slice(0, 3).map((tag, i) => (
                                                    <span
                                                        key={i}
                                                        className="inline-flex items-center gap-1 px-3 py-1 bg-gray-50 dark:bg-white/6 text-gray-600 dark:text-gray-400 text-xs rounded-full font-light border border-gray-200 dark:border-white/6"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </NavigationLink>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="flex justify-center items-center gap-3 mt-12">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-5 py-2.5 rounded-full font-light transition-all duration-300 bg-white dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/15 border border-gray-200 dark:border-white/6 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-600 dark:text-gray-400 font-light">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-5 py-2.5 rounded-full font-light transition-all duration-300 bg-white dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/15 border border-gray-200 dark:border-white/6 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
