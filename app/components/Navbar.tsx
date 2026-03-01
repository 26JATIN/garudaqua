"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useNavbar } from '../context/NavbarContext';
import { useTheme } from '../context/ThemeContext';
import SearchBar from './SearchBar';
import ThemeToggle from './ThemeToggle';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';

export default function Navbar() {
    const { isNavbarHidden } = useNavbar();
    const { isDark } = useTheme();
    const [visible, setVisible] = useState(false);
    const [bottomOffset, setBottomOffset] = useState(0);

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

    // Fix iOS Chrome: bottom bar doesn't reposition when browser chrome hides/shows
    useEffect(() => {
        if (typeof window === 'undefined' || !window.visualViewport) return;

        const viewport = window.visualViewport;

        const handleViewportResize = () => {
            const offset = window.innerHeight - viewport.height;
            setBottomOffset(Math.max(0, offset));
        };

        viewport.addEventListener('resize', handleViewportResize);
        viewport.addEventListener('scroll', handleViewportResize);
        handleViewportResize();

        return () => {
            viewport.removeEventListener('resize', handleViewportResize);
            viewport.removeEventListener('scroll', handleViewportResize);
        };
    }, []);

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
                    <div className="max-w-7xl mx-auto px-6 py-4">
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
                                    <span className="relative h-12 w-180px overflow-hidden block">
                                        <Image
                                            src="/logo/desktop.png"
                                            alt="Garud"
                                            fill
                                            className="absolute inset-0 object-cover transform scale-110"
                                            priority
                                        />
                                    </span>
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
                <div className="px-4 py-3 flex items-center gap-3">
                    {/* Mobile Logo */}
                    <Link href="/" className="shrink-0">
                        <span className="relative h-10 w-10 overflow-hidden block rounded">
                            <Image
                                src="/logo/mobile.png"
                                alt="Garud"
                                fill
                                className="absolute inset-0 object-cover transform scale-140"
                                priority
                            />
                        </span>
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
                className="lg:hidden fixed left-0 right-0 z-100 backdrop-blur-xl backdrop-saturate-200 border-t border-(--navbar-border)"
                style={{
                    bottom: bottomOffset,
                    backgroundColor: "var(--navbar-bg)",
                    WebkitBackdropFilter: "blur(24px) saturate(200%)",
                    backdropFilter: "blur(24px) saturate(200%)",
                    boxShadow: "var(--navbar-shadow)",
                    paddingBottom: "env(safe-area-inset-bottom, 0px)",
                    transform: "translateZ(0)",
                    WebkitTransform: "translateZ(0)",
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
                {/* Scroll Gap 'Apron' - Extends background below the navbar */}
                <div
                    className="absolute top-full left-0 right-0 h-[50vh] -mt-px z-[-1]"
                    style={{
                        backgroundColor: "var(--navbar-bg)",
                        WebkitBackdropFilter: "blur(24px) saturate(200%)",
                        backdropFilter: "blur(24px) saturate(200%)",
                    }}
                />
                <div className="flex items-center justify-around py-2.5">
                    {/* Home */}
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.92 }}>
                        <Link href="/" className="flex flex-col items-center p-2 space-y-1.5">
                            <motion.div
                                className="p-2.5 rounded-2xl bg-(--nav-hover-bg)"
                                whileHover={{ backgroundColor: "rgba(14, 165, 233, 0.15)", scale: 1.08 }}
                                transition={{ duration: 0.3 }}
                            >
                                <svg className="w-5 h-5 text-(--nav-icon-color)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m0 0h1a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                            </motion.div>
                            <span className="text-xs text-(--nav-text-muted) font-medium">Home</span>
                        </Link>
                    </motion.div>

                    {/* Browse */}
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.92 }}>
                        <Link href="/products" className="flex flex-col items-center p-2 space-y-1.5">
                            <motion.div
                                className="p-2.5 rounded-2xl bg-(--nav-hover-bg)"
                                whileHover={{ backgroundColor: "rgba(14, 165, 233, 0.15)", scale: 1.08 }}
                                transition={{ duration: 0.3 }}
                            >
                                <svg className="w-5 h-5 text-(--nav-icon-color)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </motion.div>
                            <span className="text-xs text-(--nav-text-muted) font-medium">Browse</span>
                        </Link>
                    </motion.div>

                    {/* Blog */}
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.92 }}>
                        <Link href="/blogs" className="flex flex-col items-center p-2 space-y-1.5">
                            <motion.div
                                className="p-2.5 rounded-2xl bg-(--nav-hover-bg)"
                                whileHover={{ backgroundColor: "rgba(14, 165, 233, 0.15)", scale: 1.08 }}
                                transition={{ duration: 0.3 }}
                            >
                                <svg className="w-5 h-5 text-(--nav-icon-color)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </motion.div>
                            <span className="text-xs text-(--nav-text-muted) font-medium">Blog</span>
                        </Link>
                    </motion.div>
                </div>
            </motion.div>
        </>
    );
}
