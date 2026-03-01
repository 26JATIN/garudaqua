"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface DashboardStats {
    products: number;
    categories: number;
    blogs: number;
    heroVideos: number;
    enquiries: number;
    newEnquiries: number;
}

const quickLinks = [
    { label: "Add New Product", href: "/admin/products", description: "Create a new water tank or pipe listing" },
    { label: "Manage Categories", href: "/admin/categories", description: "Organize product categories" },
    { label: "Write Blog Post", href: "/admin/blogs", description: "Publish new articles and guides" },
    { label: "Upload Hero Video", href: "/admin/hero-videos", description: "Add videos for homepage carousel" },
    { label: "Manage Gallery", href: "/admin/gallery", description: "Upload product and project images" },
];

const icons: Record<string, React.ReactNode> = {
    box: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
    ),
    grid: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
    ),
    doc: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    ),
    video: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
    ),
    enquiry: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
    ),
};

export default function Dashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);

    useEffect(() => {
        fetch("/api/admin/dashboard")
            .then((res) => res.json())
            .then(setStats)
            .catch(() => {});
    }, []);

    const statCards = [
        { label: "Total Products", value: stats?.products ?? "—", icon: "box", href: "/admin/products" },
        { label: "Categories", value: stats?.categories ?? "—", icon: "grid", href: "/admin/categories" },
        { label: "Blog Posts", value: stats?.blogs ?? "—", icon: "doc", href: "/admin/blogs" },
        { label: "Hero Videos", value: stats?.heroVideos ?? "—", icon: "video", href: "/admin/hero-videos" },
        { label: "Total Enquiries", value: stats?.enquiries ?? "—", icon: "enquiry", href: "/admin/enquiries" },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
                <p className="text-gray-600 mt-1">Welcome to Garud Aqua Solutions admin panel</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {statCards.map((stat) => (
                    <Link
                        key={stat.label}
                        href={stat.href}
                        className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[#0EA5E9] group-hover:scale-110 transition-transform">
                                {icons[stat.icon]}
                            </span>
                            {stat.label === "Total Enquiries" && stats?.newEnquiries ? (
                                <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                                    {stats.newEnquiries} new
                                </span>
                            ) : null}
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                    </Link>
                ))}
            </div>

            {/* Quick Links */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {quickLinks.map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-[#0EA5E9]/30 transition-all group"
                        >
                            <h4 className="font-medium text-gray-900 group-hover:text-[#0EA5E9] transition-colors">
                                {link.label}
                            </h4>
                            <p className="text-sm text-gray-500 mt-1">{link.description}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
