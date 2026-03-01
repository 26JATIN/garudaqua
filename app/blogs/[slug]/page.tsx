"use client";

import { use } from "react";
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
const staticBlogs: Blog[] = [
    {
        _id: "b1",
        slug: "how-to-choose-right-water-tank",
        title: "How to Choose the Right Water Tank for Your Home",
        excerpt: "Selecting the perfect water tank involves considering capacity, material, placement, and your family's daily water needs.",
        content: `<h2>Understanding Your Water Needs</h2>
<p>The first step in choosing a water tank is calculating your household's daily water consumption. A family of four typically uses 500-800 litres per day, including cooking, bathing, cleaning, and other household activities.</p>

<h2>Tank Capacity Guide</h2>
<p>For a family of 2-3 members, a <strong>500L to 750L</strong> tank is usually sufficient. Families of 4-6 should consider <strong>1000L to 2000L</strong> tanks, while larger households or those with gardens may need <strong>2000L or more</strong>.</p>

<h2>Material Matters</h2>
<p>Modern water tanks are made from <strong>LLDPE (Linear Low-Density Polyethylene)</strong>, which is food-grade, UV-stabilised, and resistant to algae growth. Look for ISI-certified tanks that meet Bureau of Indian Standards quality requirements.</p>

<h2>Overhead vs Underground</h2>
<p><strong>Overhead tanks</strong> use gravity for water pressure and are easier to maintain. <strong>Underground tanks</strong> save space and keep water naturally cool but require a pump for distribution.</p>

<h2>Key Features to Look For</h2>
<ul>
<li>Multi-layer construction for better insulation</li>
<li>UV protection to prevent degradation</li>
<li>Food-grade certification for safe drinking water</li>
<li>Minimum 5-year warranty from a trusted manufacturer</li>
</ul>`,
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
        excerpt: "Understanding the differences between PVC and CPVC pipes is crucial for making the right plumbing decisions.",
        content: `<h2>What is PVC?</h2>
<p><strong>PVC (Polyvinyl Chloride)</strong> pipes are the most commonly used plastic pipes in plumbing. They are affordable, lightweight, and ideal for cold water supply and drainage applications.</p>

<h2>What is CPVC?</h2>
<p><strong>CPVC (Chlorinated Polyvinyl Chloride)</strong> is a modified version of PVC that can handle higher temperatures — up to <strong>93°C (200°F)</strong>. This makes CPVC the preferred choice for hot water supply lines.</p>

<h2>Key Differences</h2>
<p><strong>Temperature Tolerance:</strong> PVC handles up to 60°C, while CPVC can withstand up to 93°C. For hot water lines from geysers or solar heaters, CPVC is essential.</p>
<p><strong>Cost:</strong> PVC pipes are 20-30% cheaper than CPVC. For cold water lines and drainage, PVC offers excellent value.</p>
<p><strong>Applications:</strong> Use PVC for drainage, rainwater harvesting, and cold water supply. Use CPVC for hot and cold water distribution inside the house.</p>

<h2>Our Recommendation</h2>
<p>For a complete home plumbing system, we recommend using <strong>CPVC for internal water supply</strong> (both hot and cold) and <strong>PVC for external drainage and underground supply lines</strong>.</p>`,
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
        excerpt: "Regular maintenance ensures clean water and extends the lifespan of your tank.",
        content: `<h2>1. Clean Your Tank Every 6 Months</h2>
<p>Drain the tank completely and scrub the interior walls with a mild cleaning solution. Rinse thoroughly before refilling. This prevents sediment buildup and bacterial growth.</p>

<h2>2. Inspect the Lid and Seals</h2>
<p>Ensure the tank lid is always properly sealed. A loose lid allows dust, insects, and debris to contaminate the water. Replace damaged seals immediately.</p>

<h2>3. Check for Leaks Regularly</h2>
<p>Inspect pipe connections, the tank body, and the overflow pipe for any signs of leakage. Even minor leaks can lead to significant water loss and structural damage over time.</p>

<h2>4. Keep the Surrounding Area Clean</h2>
<p>Remove any vegetation or debris near your tank. Overhanging branches can drop leaves and organic matter that promotes algae growth.</p>

<h2>5. Monitor Water Quality</h2>
<p>If you notice any change in water colour, smell, or taste, clean the tank immediately. Consider installing a basic filtration system at the tank outlet for an extra layer of protection.</p>`,
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
        excerpt: "Both underground and overhead tanks have unique advantages. Learn which type suits your needs.",
        content: `<h2>Overhead Water Tanks</h2>
<h3>Pros</h3>
<ul>
<li>Uses gravity for water distribution — no pump needed for basic flow</li>
<li>Easy to inspect and maintain</li>
<li>Lower installation cost</li>
<li>Simple to detect leaks</li>
</ul>
<h3>Cons</h3>
<ul>
<li>Requires strong structural support on the roof</li>
<li>Water temperature rises in summer</li>
<li>Visible and may affect building aesthetics</li>
</ul>

<h2>Underground Water Tanks</h2>
<h3>Pros</h3>
<ul>
<li>Saves rooftop space</li>
<li>Water stays naturally cool</li>
<li>Hidden from view — no aesthetic impact</li>
<li>Can store larger volumes (3000L to 10000L+)</li>
</ul>
<h3>Cons</h3>
<ul>
<li>Requires a pump for water distribution</li>
<li>Harder to inspect and clean</li>
<li>Higher installation cost due to excavation</li>
<li>Risk of contamination from groundwater seepage if not properly sealed</li>
</ul>

<h2>Which Should You Choose?</h2>
<p>For most residential buildings, a combination works best: an <strong>underground tank</strong> as the main storage connected to an <strong>overhead tank</strong> via a pump for daily supply.</p>`,
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
        excerpt: "CPVC pipes are the modern choice for hot and cold water supply. Learn installation best practices.",
        content: `<h2>Why Choose CPVC for Home Plumbing?</h2>
<p>CPVC pipes offer several advantages over traditional metal piping: they don't corrode, don't support bacterial growth, provide better thermal insulation, and are significantly easier and faster to install.</p>

<h2>Sizing Guide</h2>
<p><strong>1/2 inch (15mm):</strong> Individual tap connections — basins, kitchen sinks<br/>
<strong>3/4 inch (20mm):</strong> Branch lines and bathroom connections<br/>
<strong>1 inch (25mm):</strong> Main supply lines from the tank to the building</p>

<h2>Installation Best Practices</h2>
<ul>
<li>Always use CPVC-specific solvent cement — never use PVC adhesive on CPVC</li>
<li>Allow joints to cure for at least 24 hours before running water</li>
<li>Support pipes with clamps every 1 metre to prevent sagging</li>
<li>Leave expansion gaps near hot water sources</li>
</ul>

<h2>Common Mistakes to Avoid</h2>
<ul>
<li>Mixing PVC and CPVC fittings — they are not interchangeable</li>
<li>Using pipes near direct flames or extremely high heat sources</li>
<li>Over-tightening threaded connections, which can crack the pipe</li>
</ul>`,
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
        excerpt: "The material and build quality of your water tank directly impacts the water you consume.",
        content: `<h2>The Hidden Risks of Cheap Tanks</h2>
<p>Low-quality water tanks made from recycled or non-food-grade plastics can leach harmful chemicals into your water supply. These chemicals may not be visible or detectable by taste but can have long-term health effects.</p>

<h2>What Makes a Tank Food-Safe?</h2>
<p>Food-grade tanks are made from <strong>virgin LLDPE or HDPE</strong> resin that meets safety standards for storing consumable water. They are free from heavy metals, BPA, and other toxic compounds.</p>

<h2>Look for ISI Certification</h2>
<p>The <strong>ISI mark (IS 12701)</strong> certifies that a water tank has been tested for material safety, structural integrity, and UV resistance. Always choose ISI-certified tanks from reputable manufacturers.</p>

<h2>Multi-Layer Protection</h2>
<p>Premium tanks feature <strong>triple-layer construction</strong>: an outer layer for UV protection, a middle layer for insulation, and an inner food-grade layer that keeps water clean and safe.</p>

<h2>The Garud Aqua Promise</h2>
<p>All Garud Aqua water tanks are made from 100% virgin food-grade material, ISI-certified, and come with up to 7 years warranty. Because your family's health deserves nothing less.</p>`,
        featuredImage: "/blogs/tank-quality-health.jpg",
        category: "industry-news",
        tags: ["Health", "Quality", "ISI Certification"],
        readTime: 5,
        publishedAt: "2025-01-15",
        author: "Garud Aqua Team",
    },
];
// ===== END STATIC DATA =====

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);

    const blog = staticBlogs.find((b) => b.slug === slug);
    const relatedBlogs = blog
        ? staticBlogs.filter((b) => b.category === blog.category && b._id !== blog._id).slice(0, 3)
        : [];

    if (!blog) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-b from-gray-50 to-white dark:from-black dark:to-[#0A0A0A]">
                <svg className="w-24 h-24 text-gray-300 dark:text-gray-600 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h1 className="text-4xl font-light text-gray-800 dark:text-gray-100 mb-4">Article Not Found</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-8 font-light">The article you&apos;re looking for doesn&apos;t exist</p>
                <Link href="/blogs">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-[#0EA5E9] hover:bg-[#0369A1] text-white rounded-full px-8 py-3 font-light transition-colors"
                    >
                        Back to Blog
                    </motion.button>
                </Link>
            </div>
        );
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
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent"></div>
                        </div>
                    )}

                    {/* Content */}
                    <div className="p-8 md:p-12">
                        {/* Category Badge */}
                        <div className="mb-6">
                            <span className="inline-block px-5 py-2 bg-[#0EA5E9]/10 text-[#0EA5E9] text-sm font-medium rounded-full">
                                {blog.category.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
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
                                    key={relatedBlog._id}
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
