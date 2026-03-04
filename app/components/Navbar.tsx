"use client";
import React, { useState, useRef } from "react";
import Link from "next/link";
import { useNavbar } from '../context/NavbarContext';
import SearchBar from './SearchBar';
import ThemeToggle from './ThemeToggle';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';

export default function Navbar() {
    const { isNavbarHidden } = useNavbar();
    const [visible, setVisible] = useState(false);
    const ref = useRef<HTMLElement>(null);
    const { scrollY } = useScroll();

    // Track scroll position for floating effect
    useMotionValueEvent(scrollY, "change", (latest) => {
        if (latest > 100) {
            setVisible(true);
        } else {
            setVisible(false);
        }
    });

    return (
        <>
            {/* Desktop Navbar - Enhanced Apple Liquid Glass Effect */}
            <motion.nav
                ref={ref}
                className="fixed inset-x-0 top-0 z-100 hidden lg:block"
                animate={{
                    y: isNavbarHidden ? -100 : 0,
                    opacity: isNavbarHidden ? 0 : 1
                }}
                transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 25
                }}
            >
                <motion.div
                    animate={{
                        backgroundColor: visible
                            ? "var(--navbar-bg-scroll)"
                            : "var(--navbar-bg)",
                        borderBottomColor: visible
                            ? "var(--navbar-border-scroll)"
                            : "var(--navbar-border)",
                        boxShadow: visible
                            ? "var(--navbar-shadow-scroll)"
                            : "var(--navbar-shadow)"
                    }}
                    transition={{
                        duration: 0.5,
                        ease: [0.25, 0.1, 0.25, 1]
                    }}
                    className="backdrop-blur-xl backdrop-saturate-200 border-b"
                    style={{
                        WebkitBackdropFilter: "blur(24px) saturate(200%)",
                        backdropFilter: "blur(24px) saturate(200%)"
                    }}
                >
                    <div className="max-w-7xl mx-auto px-6 py-1">
                        <div className="flex items-center justify-between">
                            {/* Logo */}
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Link
                                    href="/"
                                    className="flex items-center"
                                >
                                    <img
                                        src="/DesktopLogo.png"
                                        alt="Garud Aqua"
                                        className="h-20 w-auto"
                                    />
                                </Link>
                            </motion.div>

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
                                <motion.div
                                    className="flex items-center gap-1 mr-2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <Link
                                        href="/products"
                                        className="px-4 py-2 text-sm font-medium text-var(--nav-text) hover:bg-var(--nav-hover-bg) rounded-xl transition-all duration-300"
                                    >
                                        Shop
                                    </Link>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.15 }}
                                >
                                    <Link
                                        href="/blogs"
                                        className="px-4 py-2 text-sm font-medium text-(--nav-text) hover:bg-(--nav-hover-bg) rounded-xl transition-all duration-300"
                                    >
                                        Blog
                                    </Link>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <Link
                                        href="/about"
                                        className="px-4 py-2 text-sm font-medium text-(--nav-text) hover:bg-(--nav-hover-bg) rounded-xl transition-all duration-300"
                                    >
                                        About
                                    </Link>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.nav>

            {/* Mobile Top Search Bar - Enhanced Apple Liquid Glass Effect */}
            <motion.div
                className="lg:hidden fixed top-0 left-0 right-0 z-100 backdrop-blur-xl backdrop-saturate-200 border-b border-(--navbar-border)"
                style={{
                    backgroundColor: "var(--navbar-bg)",
                    WebkitBackdropFilter: "blur(24px) saturate(200%)",
                    backdropFilter: "blur(24px) saturate(200%)",
                    boxShadow: "var(--navbar-shadow)"
                }}
                initial={{ y: -100 }}
                animate={{
                    y: isNavbarHidden ? -100 : 0,
                    opacity: isNavbarHidden ? 0 : 1
                }}
                transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                    duration: 0.4
                }}
            >
                <div className="px-4 py-2 flex items-center gap-2">
                    {/* Mobile Logo */}
                    <Link href="/" className="shrink-0">
                        <img
                            src="/MobileLogo.png"
                            alt="Garud Aqua"
                            className="h-12 w-12 object-contain scale-200"
                        />
                    </Link>
                    {/* Search Bar */}
                    <div className="flex-1">
                        <SearchBar placeholder="Search water tanks, pipes..." />
                    </div>
                    {/* Theme Toggle */}
                    <ThemeToggle />
                </div>
            </motion.div>

            {/* Mobile Bottom Navigation - Enhanced Apple Liquid Glass Effect */}
            <motion.div
                className="lg:hidden fixed bottom-0 left-0 right-0 z-100 backdrop-blur-xl backdrop-saturate-200 border-t border-(--navbar-border)"
                style={{
                    backgroundColor: "var(--navbar-bg)",
                    WebkitBackdropFilter: "blur(24px) saturate(200%)",
                    backdropFilter: "blur(24px) saturate(200%)",
                    boxShadow: "var(--navbar-shadow)",
                    paddingBottom: "env(safe-area-inset-bottom, 0px)",
                }}
                initial={{ y: 100 }}
                animate={{
                    y: isNavbarHidden ? 100 : 0,
                    opacity: isNavbarHidden ? 0 : 1
                }}
                transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                    duration: 0.4
                }}
            >
                <div className="flex items-center justify-around py-1.5">
                    {/* Home */}
                    <motion.div whileTap={{ scale: 0.92 }}>
                        <Link href="/" className="flex flex-col items-center px-3 py-1 space-y-0.5">
                            <div className="p-1.5 rounded-xl">
                                <svg className="w-5 h-5 text-(--nav-icon-color)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m0 0h1a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                            </div>
                            <span className="text-[10px] text-(--nav-text-muted) font-medium">Home</span>
                        </Link>
                    </motion.div>

                    {/* Browse */}
                    <motion.div whileTap={{ scale: 0.92 }}>
                        <Link href="/products" className="flex flex-col items-center px-3 py-1 space-y-0.5">
                            <div className="p-1.5 rounded-xl">
                                <svg className="w-5 h-5 text-(--nav-icon-color)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <span className="text-[10px] text-(--nav-text-muted) font-medium">Browse</span>
                        </Link>
                    </motion.div>

                    {/* Blog */}
                    <motion.div whileTap={{ scale: 0.92 }}>
                        <Link href="/blogs" className="flex flex-col items-center px-3 py-1 space-y-0.5">
                            <div className="p-1.5 rounded-xl">
                                <svg className="w-5 h-5 text-(--nav-icon-color)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <span className="text-[10px] text-(--nav-text-muted) font-medium">Blog</span>
                        </Link>
                    </motion.div>

                    {/* About */}
                    <motion.div whileTap={{ scale: 0.92 }}>
                        <Link href="/about" className="flex flex-col items-center px-3 py-1 space-y-0.5">
                            <div className="p-1.5 rounded-xl">
                                <svg className="w-5 h-5 text-(--nav-icon-color)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <span className="text-[10px] text-(--nav-text-muted) font-medium">About</span>
                        </Link>
                    </motion.div>
                </div>
            </motion.div>
        </>
    );
}
