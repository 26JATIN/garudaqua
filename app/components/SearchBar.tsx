"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchBarProps {
    className?: string;
    placeholder?: string;
}

export default function SearchBar({ className = "", placeholder = "Search for water tanks, pipes..." }: SearchBarProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();
    const searchRef = useRef<HTMLDivElement>(null);

    // Handle clicking outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                // close any open state if needed
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Sync search query with URL when on products page
    useEffect(() => {
        const handleRouteChange = () => {
            const currentPath = window.location.pathname;
            if (currentPath === '/products') {
                const urlParams = new URLSearchParams(window.location.search);
                const searchFromUrl = urlParams.get('search');
                if (searchFromUrl && searchFromUrl !== searchQuery) {
                    setSearchQuery(searchFromUrl);
                } else if (!searchFromUrl && searchQuery) {
                    setSearchQuery('');
                }
            }
        };

        window.addEventListener('popstate', handleRouteChange);
        setTimeout(() => {
            const currentPath = window.location.pathname;
            if (currentPath === '/products') {
                const urlParams = new URLSearchParams(window.location.search);
                const searchFromUrl = urlParams.get('search');
                if (searchFromUrl) {
                    setSearchQuery(searchFromUrl);
                }
            }
        }, 100);

        return () => window.removeEventListener('popstate', handleRouteChange);
    }, [searchQuery]);

    const handleSearch = (query = searchQuery) => {
        const trimmedQuery = query.trim();
        if (trimmedQuery) {
            router.push(`/products?search=${encodeURIComponent(trimmedQuery)}`);
        } else {
            router.push('/products');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch();
        }
    };

    return (
        <div ref={searchRef} className={`relative ${className}`}>
            <motion.form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSearch();
                }}
                className="relative"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
                <motion.input
                    type="text"
                    placeholder={placeholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full px-6 py-4 text-sm bg-white/60 dark:bg-white/6 backdrop-blur-lg border border-white/30 dark:border-white/10 rounded-2xl focus:bg-white/90 dark:focus:bg-white/12 focus:border-[#0EA5E9]/50 focus:ring-4 focus:ring-[#0EA5E9]/20 outline-none transition-all duration-300 shadow-sm pr-20 placeholder:text-gray-500 dark:placeholder:text-gray-400 dark:text-gray-100 lg:px-6 lg:py-4 sm:px-4 sm:py-3"
                    whileFocus={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />

                {/* Clear button */}
                <AnimatePresence>
                    {searchQuery && (
                        <motion.button
                            type="button"
                            onClick={() => {
                                setSearchQuery('');
                                router.push('/products');
                            }}
                            className="absolute right-14 top-1/2 -translate-y-1/2 p-2 rounded-xl hover:bg-gray-100/80 transition-all duration-200"
                            title="Clear search"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </motion.button>
                    )}
                </AnimatePresence>

                {/* Search button */}
                <motion.button
                    type="submit"
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-[#2C2C2C] text-white hover:bg-[#0EA5E9] transition-all duration-300 shadow-md"
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </motion.button>
            </motion.form>
        </div>
    );
}
