"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useNavbar } from '../context/NavbarContext';
import SearchBar from './SearchBar';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
    const { isNavbarHidden } = useNavbar();
    const [visible, setVisible] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const ref = useRef<HTMLElement>(null);

    const [categories, setCategories] = useState<any[]>([]);
    const [blogCategories, setBlogCategories] = useState<any[]>([]);
    const [blogMenuOpen, setBlogMenuOpen] = useState(false);
    // Defer API calls so they don't compete with hero LCP image on mobile
    useEffect(() => {
        const load = () => {
            fetch("/api/categories")
                .then(res => res.json())
                .then(data => Array.isArray(data) && setCategories(data))
                .catch(console.error);
            fetch("/api/blog-categories")
                .then(res => res.json())
                .then(data => Array.isArray(data) && setBlogCategories(data))
                .catch(console.error);
        };
        if (typeof requestIdleCallback !== "undefined") {
            requestIdleCallback(load);
        } else {
            setTimeout(load, 1000);
        }
    }, []);

    // Track scroll position for floating effect
    useEffect(() => {
        const handleScroll = () => {
            setVisible(window.scrollY > 100);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);


    // Prevent background scrolling when mobile sidebar is open (Requires HTML tag lock for iOS)
    useEffect(() => {
        if (isSidebarOpen) {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        };
    }, [isSidebarOpen]);

    return (
        <>
            {/* Desktop Navbar - Enhanced Apple Liquid Glass Effect */}
            <nav
                ref={ref}
                className={`fixed inset-x-0 top-0 z-100 hidden lg:block transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${isNavbarHidden ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}
                style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
            >
                <div
                    className="backdrop-blur-xl backdrop-saturate-200 border-b transition-[background-color,border-color,box-shadow] duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
                    style={{
                        backgroundColor: visible ? "var(--navbar-bg-scroll)" : "var(--navbar-bg)",
                        borderBottomColor: visible ? "var(--navbar-border-scroll)" : "var(--navbar-border)",
                        boxShadow: visible ? "var(--navbar-shadow-scroll)" : "var(--navbar-shadow)"
                    }}
                >
                    <div className="max-w-7xl mx-auto px-6 py-1">
                        <div className="flex items-center justify-between">
                            {/* Logo */}
                            <div className="transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98]">
                                <Link
                                    href="/"
                                    className="flex items-center"
                                >
                                    <Image
                                        src="/DesktopLogo.webp"
                                        alt="Garud Aqua"
                                        width={181}
                                        height={80}
                                        className="h-20 w-auto"
                                        priority
                                    />
                                </Link>
                            </div>

                            {/* Center Search Bar */}
                            <div className="flex-1 max-w-xl mx-12 flex items-center gap-2">
                                <div className="flex-1">
                                    <SearchBar />
                                </div>
                                <ThemeToggle />
                            </div>

                            {/* Right Actions */}
                            <div className="flex items-center gap-3">
                                {/* Navigation Links */}
                                <div className="flex items-center gap-2 lg:gap-4 mr-2">
                                    <Link
                                        href="/products"
                                        className="px-4 py-2 text-sm font-medium text-(--nav-text) hover:bg-(--nav-hover-bg) rounded-xl transition-all duration-300"
                                    >
                                        Products
                                    </Link>

                                    {/* Megamenu Dropdown Container */}
                                    <div className="relative group">
                                        <Link
                                            href="/categories"
                                            className="px-4 py-2 text-sm font-medium text-(--nav-text) hover:bg-(--nav-hover-bg) rounded-xl transition-all duration-300 flex items-center gap-1"
                                        >
                                            Categories
                                            <svg className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-all group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </Link>

                                        {/* Dropdown Panel - Classic List Style */}
                                        <div className="absolute top-full mt-8 left-1/2 -translate-x-1/2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] origin-top scale-95 group-hover:scale-100 z-50 w-70">
                                            {/* Invisible hover bridge to prevent mouse leaving */}
                                            <div className="absolute -top-8 left-0 right-0 h-8 bg-transparent"></div>
                                            
                                            <div className="bg-white/95 dark:bg-[#0A0A0A]/95 backdrop-blur-2xl border border-gray-100/80 dark:border-gray-800/80 rounded-2xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] p-2 flex flex-col gap-0.5">
                                                {categories.slice(0, 8).map((cat) => (
                                                    <Link 
                                                        key={cat.id} 
                                                        href={`/categories/${cat.slug}`}
                                                        className="flex items-center gap-3 p-2.5 w-full rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-200 group/item"
                                                    >
                                                        {cat.image ? (
                                                            <div className="w-10 h-10 rounded-lg bg-white dark:bg-[#1A1A1A] border border-gray-100 dark:border-gray-800 overflow-hidden shrink-0 flex items-center justify-center p-1 group-hover/item:border-gray-200 dark:group-hover/item:border-gray-700 transition-colors">
                                                                <Image src={cat.image} alt={cat.name} width={40} height={40} className="w-full h-full object-contain scale-110 group-hover/item:scale-125 transition-transform duration-300" />
                                                            </div>
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-lg bg-[#0EA5E9]/10 text-[#0EA5E9] flex items-center justify-center shrink-0">
                                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zm-10 10a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                                                            </div>
                                                        )}
                                                        <span className="text-[14px] font-semibold text-gray-800 dark:text-gray-200 leading-tight group-hover/item:text-[#0EA5E9] transition-colors truncate">
                                                            {cat.name}
                                                        </span>
                                                    </Link>
                                                ))}
                                                {categories.length > 8 && (
                                                    <Link 
                                                        href="/categories"
                                                        className="flex items-center justify-center gap-2 p-3 mt-1 w-full rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-200 group/item"
                                                    >
                                                        <span className="text-[13px] font-semibold text-gray-500 group-hover/item:text-[#0EA5E9] transition-colors">View all {categories.length} categories &rarr;</span>
                                                    </Link>
                                                )}
                                                {categories.length === 0 && (
                                                    <div className="py-6 flex items-center justify-center">
                                                        <div className="w-6 h-6 border-2 border-[#0EA5E9] border-t-transparent rounded-full animate-spin"></div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Blog Dropdown */}
                                    <div className="relative group">
                                        <Link
                                            href="/blogs"
                                            className="px-4 py-2 text-sm font-medium text-(--nav-text) hover:bg-(--nav-hover-bg) rounded-xl transition-all duration-300 flex items-center gap-1"
                                        >
                                            Blog
                                            <svg className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-all group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </Link>

                                        <div className="absolute top-full mt-8 left-1/2 -translate-x-1/2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] origin-top scale-95 group-hover:scale-100 z-50 w-62.5">
                                            <div className="absolute -top-8 left-0 right-0 h-8 bg-transparent"></div>

                                            <div className="bg-white/95 dark:bg-[#0A0A0A]/95 backdrop-blur-2xl border border-gray-100/80 dark:border-gray-800/80 rounded-2xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] p-2 flex flex-col gap-0.5">
                                                <Link
                                                    href="/blogs"
                                                    className="flex items-center gap-3 p-2.5 w-full rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-200 group/item"
                                                >
                                                    <div className="w-10 h-10 rounded-lg bg-[#0EA5E9]/10 text-[#0EA5E9] flex items-center justify-center shrink-0">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                                                    </div>
                                                    <span className="text-[14px] font-semibold text-gray-800 dark:text-gray-200 leading-tight group-hover/item:text-[#0EA5E9] transition-colors">
                                                        All Articles
                                                    </span>
                                                </Link>
                                                {blogCategories.length > 0 && (
                                                    <div className="mx-2 my-1 border-t border-gray-100 dark:border-gray-800/60"></div>
                                                )}
                                                {blogCategories.map((cat: any) => (
                                                    <Link
                                                        key={cat.id}
                                                        href={`/blogs/category/${cat.slug}`}
                                                        className="flex items-center gap-3 p-2.5 w-full rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-200 group/item"
                                                    >
                                                        <div className="w-10 h-10 rounded-lg bg-orange-500/10 text-orange-500 dark:bg-orange-400/10 dark:text-orange-400 flex items-center justify-center shrink-0">
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                                                        </div>
                                                        <span className="text-[14px] font-semibold text-gray-800 dark:text-gray-200 leading-tight group-hover/item:text-[#0EA5E9] transition-colors truncate">
                                                            {cat.name}
                                                        </span>
                                                    </Link>
                                                ))}
                                                {blogCategories.length === 0 && (
                                                    <div className="py-4 flex items-center justify-center">
                                                        <div className="w-5 h-5 border-2 border-[#0EA5E9] border-t-transparent rounded-full animate-spin"></div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <Link
                                        href="/about"
                                        className="px-4 py-2 text-sm font-medium text-(--nav-text) hover:bg-(--nav-hover-bg) rounded-xl transition-all duration-300"
                                    >
                                        About
                                    </Link>

                                    <Link
                                        href="/contact"
                                        className="px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-black dark:bg-white dark:text-black dark:hover:bg-gray-100 rounded-xl transition-all duration-300 ml-1 shadow-xs"
                                    >
                                        Contact Us
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Top Search Bar - Enhanced Apple Liquid Glass Effect */}
            {/* backdrop-filter must be on a CHILD, not the fixed container itself,
                otherwise iOS Safari breaks position:fixed during scroll */}
            <div
                className={`lg:hidden fixed top-0 left-0 right-0 z-100 transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${isNavbarHidden ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}
                style={{
                    paddingTop: "env(safe-area-inset-top, 0px)",
                    WebkitBackfaceVisibility: 'hidden',
                }}
            >
                {/* Visual background layer with blur */}
                <div
                    className="absolute inset-0 backdrop-blur-xl backdrop-saturate-200 border-b border-(--navbar-border)"
                    style={{
                        backgroundColor: "var(--navbar-bg)",
                        boxShadow: "var(--navbar-shadow)",
                    }}
                />
                <div className="relative px-4 py-2 flex items-center gap-2">
                    {/* Mobile Logo */}
                    <Link href="/" className="shrink-0">
                        <Image
                            src="/MobileLogo.webp"
                            alt="Garud Aqua"
                            width={48}
                            height={48}
                            className="h-12 w-12 object-contain scale-200"
                            priority
                        />
                    </Link>
                    {/* Search Bar */}
                    <div className="flex-1">
                        <SearchBar placeholder="Search water tanks, pipes..." />
                    </div>
                    {/* Hamburger Menu */}
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 -mr-2 text-gray-600 dark:text-gray-300 hover:text-[#0EA5E9] transition-colors"
                        aria-label="Open Menu"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Bottom Navigation - Enhanced Apple Liquid Glass Effect */}
            {/* pointer-events:none on outer container + pointer-events:auto on
                each Link prevents iOS from requiring a "first tap to activate"
                the container before forwarding taps to child links. */}
            <div
                className={`lg:hidden fixed left-0 right-0 z-100 pointer-events-none transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${isNavbarHidden ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}
                style={{ bottom: 0, WebkitBackfaceVisibility: 'hidden' }}
            >
                {/* Visual background layer — no pointer events */}
                <div
                    className="absolute inset-0 backdrop-blur-xl backdrop-saturate-200 border-t border-(--navbar-border)"
                    style={{
                        backgroundColor: "var(--navbar-bg)",
                        boxShadow: "var(--navbar-shadow)",
                    }}
                />
                <div className="relative flex items-center justify-around py-1.5" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
                    {/* Home */}
                    <Link href="/" className="pointer-events-auto flex flex-col items-center px-3 py-1 space-y-0.5 active:scale-[0.92]" style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}>
                        <div className="p-1.5 rounded-xl">
                            <svg className="w-5 h-5 text-(--nav-icon-color)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m0 0h1a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                        </div>
                        <span className="text-[10px] text-(--nav-text-muted) font-medium">Home</span>
                    </Link>

                    {/* Browse */}
                    <Link href="/products" className="pointer-events-auto flex flex-col items-center px-3 py-1 space-y-0.5 active:scale-[0.92]" style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}>
                        <div className="p-1.5 rounded-xl">
                            <svg className="w-5 h-5 text-(--nav-icon-color)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <span className="text-[10px] text-(--nav-text-muted) font-medium">Products</span>
                    </Link>

                    {/* Category */}
                    <Link href="/categories" className="pointer-events-auto flex flex-col items-center px-3 py-1 space-y-0.5 active:scale-[0.92]" style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}>
                        <div className="p-1.5 rounded-xl">
                            <svg className="w-5 h-5 text-(--nav-icon-color)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                        </div>
                        <span className="text-[10px] text-(--nav-text-muted) font-medium">Category</span>
                    </Link>

                    {/* Contact Us */}
                    <Link href="/contact" className="pointer-events-auto flex flex-col items-center px-3 py-1 space-y-0.5 active:scale-[0.92]" style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}>
                        <div className="p-1.5 rounded-xl">
                            <svg className="w-5 h-5 text-(--nav-icon-color)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <span className="text-[10px] text-(--nav-text-muted) font-medium">Contact</span>
                    </Link>
                </div>
            </div>

            {/* Mobile Sidebar Overlay */}
            <div
                className={`lg:hidden fixed inset-0 z-101 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsSidebarOpen(false)}
                style={{ touchAction: 'none' }}
                onTouchMove={(e) => e.preventDefault()}
            />

            {/* Mobile Sidebar Drawer */}
            <div
                className={`lg:hidden fixed top-0 right-0 bottom-0 w-[85vw] max-w-sm bg-white dark:bg-[#0A0A0A] z-102 shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] transform flex flex-col ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
                style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
            >
                <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800/60 bg-gray-50/50 dark:bg-[#111]/50">
                    <div className="flex items-center gap-2">
                        <div className="relative w-12 h-12 shrink-0 flex items-center justify-center -ml-1">
                            <Image
                                src="/MobileLogo.webp"
                                alt="Garud Aqua Solutions"
                                fill
                                className="object-contain scale-[1.4] drop-shadow-sm"
                                loading="lazy"
                            />
                        </div>
                        <h2 className="text-base sm:text-[17px] font-bold text-gray-900 dark:text-white tracking-tight leading-tight">
                            Garud Aqua Solutions
                        </h2>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="p-2 shrink-0 rounded-full text-gray-400 hover:text-red-500 bg-white dark:bg-[#1A1A1A] border border-gray-200/60 dark:border-gray-800 shadow-sm active:scale-95 transition-all"
                        aria-label="Close Menu"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Main Navigation */}
                    <div className="space-y-1">
                        <p className="px-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Explore</p>

                        <Link href="/products" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-4 px-4 py-3 text-gray-700 dark:text-gray-200 font-medium rounded-2xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all group active:scale-[0.98]">
                            <div className="p-2 rounded-xl bg-[#0EA5E9]/10 text-[#0EA5E9] group-hover:scale-110 transition-transform">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                            </div>
                            Products
                        </Link>

                        <Link href="/categories" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-4 px-4 py-3 text-gray-700 dark:text-gray-200 font-medium rounded-2xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all group active:scale-[0.98]">
                            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 dark:bg-indigo-400/10 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                            </div>
                            Categories
                        </Link>

                        {/* Blog Accordion */}
                        <div>
                            <button
                                onClick={() => setBlogMenuOpen(prev => !prev)}
                                className="flex items-center justify-between w-full px-4 py-3 text-gray-700 dark:text-gray-200 font-medium rounded-2xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all active:scale-[0.98]"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600 dark:bg-orange-400/10 dark:text-orange-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                                    </div>
                                    <span>Insights & Blog</span>
                                </div>
                                <svg
                                    className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${blogMenuOpen ? "rotate-180" : ""}`}
                                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            <div
                                className="overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
                                style={{ maxHeight: blogMenuOpen ? `${(blogCategories.length + 1) * 52}px` : "0px", opacity: blogMenuOpen ? 1 : 0 }}
                            >
                                <div className="ml-14 mr-2 mt-1 mb-2 space-y-0.5">
                                    <Link
                                        href="/blogs"
                                        onClick={() => setIsSidebarOpen(false)}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-[#0EA5E9] transition-colors"
                                    >
                                        <svg className="w-4 h-4 text-[#0EA5E9] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                                        All Articles
                                    </Link>
                                    {blogCategories.map((cat: any) => (
                                        <Link
                                            key={cat.id}
                                            href={`/blogs/category/${cat.slug}`}
                                            onClick={() => setIsSidebarOpen(false)}
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-[#0EA5E9] transition-colors"
                                        >
                                            <svg className="w-4 h-4 text-orange-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                                            {cat.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Support & Company */}
                    <div className="space-y-1">
                        <p className="px-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Company</p>

                        <Link href="/about" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-4 px-4 py-3 text-gray-700 dark:text-gray-200 font-medium rounded-2xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all group active:scale-[0.98]">
                            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            About Garud Aqua
                        </Link>

                        <Link href="/contact" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-4 px-4 py-3 text-gray-700 dark:text-gray-200 font-medium rounded-2xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all group active:scale-[0.98]">
                            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 dark:bg-rose-400/10 dark:text-rose-400 group-hover:scale-110 transition-transform">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            </div>
                            Contact Us
                        </Link>

                        <Link href="/enquire" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-4 px-4 py-3 text-gray-700 dark:text-gray-200 font-medium rounded-2xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all group active:scale-[0.98]">
                            <div className="p-2 rounded-xl bg-blue-600/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400 group-hover:scale-110 transition-transform">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            </div>
                            Enquiry
                        </Link>
                    </div>
                </div>

                {/* Footer fixed section */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-800/60 bg-gray-50/30 dark:bg-[#0A0A0A]">
                    <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900/50 rounded-3xl shadow-sm border border-gray-200/60 dark:border-gray-800">
                        <div className="flex flex-col">
                            <span className="text-gray-900 dark:text-gray-100 font-semibold text-sm">Theme Settings</span>
                            <span className="text-gray-500 dark:text-gray-400 text-xs">Switch aesthetics</span>
                        </div>
                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </>
    );
}
