"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

// ===== Type Definitions =====
interface Blog {
    _id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    featuredImage?: string;
    category: string;
    tags: string[];
    readTime: number;
    publishedAt: string;
    author: string;
}

// ===== STATIC DATA =====
const CATEGORIES = [
    { value: "all", label: "All Articles" },
    { value: "water-tank-guide", label: "Water Tank Guide" },
    { value: "plumbing-tips", label: "Plumbing Tips" },
    { value: "maintenance", label: "Maintenance" },
    { value: "industry-news", label: "Industry News" },
];

const staticBlogs: Blog[] = [
    {
        _id: "b1",
        slug: "how-to-choose-right-water-tank",
        title: "How to Choose the Right Water Tank for Your Home",
        excerpt: "Selecting the perfect water tank involves considering capacity, material, placement, and your family's daily water needs. This comprehensive guide walks you through every factor.",
        content: "",
        featuredImage: "/blogs/choose-water-tank.jpg",
        category: "water-tank-guide",
        tags: ["Water Tanks", "Buying Guide", "Home"],
        readTime: 6,
        publishedAt: "2025-03-15",
        author: "Garud Aqua Team",
    },
    {
        _id: "b2",
        slug: "pvc-vs-cpvc-pipes-comparison",
        title: "PVC vs CPVC Pipes: Which One Should You Use?",
        excerpt: "Understanding the differences between PVC and CPVC pipes is crucial for making the right plumbing decisions. Learn about temperature tolerance, cost, and best applications.",
        content: "",
        featuredImage: "/blogs/pvc-vs-cpvc.jpg",
        category: "plumbing-tips",
        tags: ["PVC Pipes", "CPVC Pipes", "Comparison"],
        readTime: 5,
        publishedAt: "2025-03-01",
        author: "Garud Aqua Team",
    },
    {
        _id: "b3",
        slug: "water-tank-maintenance-tips",
        title: "5 Essential Tips to Maintain Your Water Tank",
        excerpt: "Regular maintenance ensures clean water and extends the lifespan of your tank. Follow these simple yet effective maintenance practices for a healthier home.",
        content: "",
        featuredImage: "/blogs/tank-maintenance.jpg",
        category: "maintenance",
        tags: ["Maintenance", "Water Tanks", "Cleaning"],
        readTime: 4,
        publishedAt: "2025-02-20",
        author: "Garud Aqua Team",
    },
    {
        _id: "b4",
        slug: "underground-vs-overhead-tanks",
        title: "Underground vs Overhead Water Tanks: Pros & Cons",
        excerpt: "Both underground and overhead tanks have unique advantages. Learn which type suits your property layout, water pressure needs, and budget.",
        content: "",
        featuredImage: "/blogs/underground-vs-overhead.jpg",
        category: "water-tank-guide",
        tags: ["Underground Tanks", "Overhead Tanks", "Comparison"],
        readTime: 7,
        publishedAt: "2025-02-10",
        author: "Garud Aqua Team",
    },
    {
        _id: "b5",
        slug: "complete-guide-cpvc-plumbing",
        title: "A Complete Guide to Home Plumbing with CPVC Pipes",
        excerpt: "CPVC pipes are the modern choice for hot and cold water supply. This guide covers installation best practices, fitting types, and why professionals recommend CPVC.",
        content: "",
        featuredImage: "/blogs/cpvc-plumbing.jpg",
        category: "plumbing-tips",
        tags: ["CPVC Pipes", "Plumbing", "Installation"],
        readTime: 8,
        publishedAt: "2025-01-28",
        author: "Garud Aqua Team",
    },
    {
        _id: "b6",
        slug: "water-tank-quality-family-health",
        title: "Why Water Tank Quality Matters for Your Family's Health",
        excerpt: "The material and build quality of your water tank directly impacts the water you consume. Understand why investing in food-grade, ISI-certified tanks is essential.",
        content: "",
        featuredImage: "/blogs/tank-quality-health.jpg",
        category: "industry-news",
        tags: ["Health", "Quality", "ISI Certification"],
        readTime: 5,
        publishedAt: "2025-01-15",
        author: "Garud Aqua Team",
    },
];
// ===== END STATIC DATA =====

export default function BlogsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [category, setCategory] = useState("all");

    const filteredBlogs = useMemo(() => {
        let result = [...staticBlogs];

        if (category !== "all") {
            result = result.filter((b) => b.category === category);
        }

        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            result = result.filter(
                (b) =>
                    b.title.toLowerCase().includes(term) ||
                    b.excerpt.toLowerCase().includes(term) ||
                    b.tags.some((t) => t.toLowerCase().includes(term))
            );
        }

        return result;
    }, [category, searchTerm]);

    return (
        <div className="min-h-screen bg-linear-to-b from-gray-50 via-white to-gray-50 dark:from-black dark:via-[#050505] dark:to-[#0A0A0A]">
            {/* Hero Section */}
            <div className="relative bg-linear-to-br from-[#2C2C2C] via-[#3A3A3A] to-[#2C2C2C] text-white py-24 overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-[#0EA5E9] rounded-full filter blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#0EA5E9] rounded-full filter blur-3xl"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-12"
                    >
                        <h1 className="text-5xl md:text-6xl font-light tracking-wide mb-6">
                            Our <span className="text-[#0EA5E9] font-normal">Blog</span>
                        </h1>
                        <p className="text-xl font-light text-gray-300 max-w-2xl mx-auto leading-relaxed">
                            Expert tips, guides, and insights on water tanks, pipes & plumbing solutions
                        </p>
                    </motion.div>

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
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mb-12"
                >
                    <div className="flex flex-wrap gap-3 justify-center">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.value}
                                onClick={() => setCategory(cat.value)}
                                className={`px-6 py-3 rounded-full font-light transition-all duration-300 ${
                                    category === cat.value
                                        ? "bg-[#0EA5E9] text-white shadow-lg scale-105"
                                        : "bg-white dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/15 hover:shadow-md border border-gray-200 dark:border-white/6"
                                }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Blog Grid */}
                {filteredBlogs.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-[#0A0A0A] rounded-3xl shadow-sm dark:border dark:border-white/6">
                        <svg className="w-20 h-20 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-500 dark:text-gray-400 text-lg font-light">No articles found</p>
                        <p className="text-gray-400 dark:text-gray-500 text-sm mt-2 font-light">Try adjusting your search or filter</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredBlogs.map((blog, index) => (
                            <motion.div
                                key={blog._id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                                <Link
                                    href={`/blogs/${blog.slug}`}
                                    className="group bg-white dark:bg-[#0A0A0A] rounded-3xl shadow-md dark:shadow-none dark:border dark:border-white/6 overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 block"
                                >
                                    {/* Featured Image */}
                                    {blog.featuredImage ? (
                                        <div className="relative h-56 w-full overflow-hidden">
                                            <Image
                                                src={blog.featuredImage}
                                                alt={blog.title}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-700"
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
                                    <div className="p-6">
                                        {/* Category Badge */}
                                        <div className="mb-3">
                                            <span className="inline-block px-4 py-1.5 bg-[#0EA5E9]/10 text-[#0EA5E9] text-xs font-medium rounded-full">
                                                {blog.category.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                                            </span>
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-xl font-normal mb-3 text-gray-900 dark:text-gray-100 group-hover:text-[#0EA5E9] transition-colors line-clamp-2 tracking-wide">
                                            {blog.title}
                                        </h3>

                                        {/* Excerpt */}
                                        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 font-light leading-relaxed text-sm">
                                            {blog.excerpt}
                                        </p>

                                        {/* Meta Info */}
                                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-100 dark:border-white/6">
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
                                                {new Date(blog.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
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
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
