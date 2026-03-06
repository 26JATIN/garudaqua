"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cloudinaryUrl } from '@/lib/utils';

interface Suggestion {
    id: string;
    text: string;
    type: 'category' | 'subcategory' | 'product';
    image: string | null;
    category?: string;
    subcategory?: string | null;
    url: string;
}

interface SearchBarProps {
    className?: string;
    placeholder?: string;
}

export default function SearchBar({ className = "", placeholder = "Search for water tanks, pipes..." }: SearchBarProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const router = useRouter();
    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchSuggestions = useCallback(async (query: string) => {
        if (!query.trim()) return;

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        setIsLoading(true);

        const timeoutId = setTimeout(() => {
            abortControllerRef.current?.abort();
            setIsLoading(false);
        }, 5000);

        try {
            const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`, {
                signal: abortControllerRef.current.signal,
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                if (!abortControllerRef.current.signal.aborted) {
                    setSuggestions(data);
                    setIsOpen(data.length > 0);
                }
            }
        } catch (error: unknown) {
            clearTimeout(timeoutId);
            if (error instanceof Error && error.name !== 'AbortError') {
                setSuggestions([]);
                setIsOpen(false);
            }
        } finally {
            if (!abortControllerRef.current?.signal.aborted) {
                setIsLoading(false);
            }
        }
    }, []);

    // Debounced search
    useEffect(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        if (searchQuery.trim().length < 2) {
            setSuggestions([]);
            setIsOpen(false);
            setIsLoading(false);
            return;
        }

        const timeoutId = setTimeout(() => {
            fetchSuggestions(searchQuery.trim());
        }, 300);

        return () => {
            clearTimeout(timeoutId);
            abortControllerRef.current?.abort();
        };
    }, [searchQuery, fetchSuggestions]);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSelectedIndex(-1);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Sync with URL on products page
    useEffect(() => {
        const handleRouteChange = () => {
            if (window.location.pathname === '/products') {
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
            if (window.location.pathname === '/products') {
                const urlParams = new URLSearchParams(window.location.search);
                const searchFromUrl = urlParams.get('search');
                if (searchFromUrl) setSearchQuery(searchFromUrl);
            }
        }, 100);

        return () => window.removeEventListener('popstate', handleRouteChange);
    }, [searchQuery]);

    // Cleanup
    useEffect(() => {
        return () => { abortControllerRef.current?.abort(); };
    }, []);

    // Prevent page scroll when scrolling inside dropdown; dismiss keyboard on scroll start
    useEffect(() => {
        const list = listRef.current;
        if (!list) return;

        let touchStartY = 0;

        const onTouchStart = (e: TouchEvent) => {
            touchStartY = e.touches[0].clientY;
        };

        const onTouchMove = (e: TouchEvent) => {
            const deltaY = e.touches[0].clientY - touchStartY;
            const { scrollTop, scrollHeight, clientHeight } = list;
            const atTop = scrollTop === 0 && deltaY > 0;
            const atBottom = scrollTop + clientHeight >= scrollHeight && deltaY < 0;

            // Dismiss keyboard when user starts scrolling the list
            if (Math.abs(deltaY) > 5 && inputRef.current) {
                inputRef.current.blur();
            }

            // Block the page from scrolling only when list itself can scroll
            if (!atTop && !atBottom) {
                e.stopPropagation();
            }
        };

        list.addEventListener('touchstart', onTouchStart, { passive: true });
        list.addEventListener('touchmove', onTouchMove, { passive: true });
        return () => {
            list.removeEventListener('touchstart', onTouchStart);
            list.removeEventListener('touchmove', onTouchMove);
        };
    }, [isOpen]);

    const handleSearch = (query = searchQuery) => {
        const trimmedQuery = query.trim();
        if (trimmedQuery) {
            router.push(`/products?search=${encodeURIComponent(trimmedQuery)}`);
        } else {
            router.push('/products');
        }
        setIsOpen(false);
        setSelectedIndex(-1);
    };

    const handleSuggestionClick = (suggestion: Suggestion) => {
        router.push(suggestion.url);
        setIsOpen(false);
        setSelectedIndex(-1);
        setSearchQuery('');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen || suggestions.length === 0) {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev => prev < suggestions.length - 1 ? prev + 1 : prev);
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
                    handleSuggestionClick(suggestions[selectedIndex]);
                } else {
                    handleSearch();
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setSelectedIndex(-1);
                break;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'product': return 'Product';
            case 'category': return 'Category';
            case 'subcategory': return 'Subcategory';
            default: return '';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'product':
                return (
                    <svg className="w-3.5 h-3.5 text-[#0EA5E9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                );
            case 'category':
                return (
                    <svg className="w-3.5 h-3.5 text-[#0369A1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                );
            case 'subcategory':
                return (
                    <svg className="w-3.5 h-3.5 text-[#0284C7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                );
            default:
                return null;
        }
    };

    return (
        <div ref={searchRef} className={`relative ${className}`}>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSearch();
                }}
                className="relative"
            >
                <input
                    ref={inputRef}
                    type="text"
                    placeholder={placeholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        if (suggestions.length > 0) setIsOpen(true);
                    }}
                    className="w-full px-6 py-4 text-sm bg-white/60 dark:bg-white/6 backdrop-blur-lg border border-white/30 dark:border-white/10 rounded-2xl focus:bg-white/90 dark:focus:bg-white/12 focus:border-[#0EA5E9]/50 focus:ring-4 focus:ring-[#0EA5E9]/20 outline-none transition-all duration-300 shadow-sm pr-20 placeholder:text-gray-500 dark:placeholder:text-gray-400 dark:text-gray-100 lg:px-6 lg:py-4 sm:px-4 sm:py-3"
                />

                {/* Loading indicator */}
                <AnimatePresence>
                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute right-14 top-1/2 -translate-y-1/2"
                        >
                            <div className="animate-spin w-4 h-4 border-2 border-[#0EA5E9] border-t-transparent rounded-full" />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Clear button */}
                <AnimatePresence>
                    {searchQuery && !isLoading && (
                        <motion.button
                            type="button"
                            onClick={() => {
                                setSearchQuery('');
                                setSuggestions([]);
                                setIsOpen(false);
                            }}
                            className="absolute right-14 top-1/2 -translate-y-1/2 p-2 rounded-xl hover:bg-gray-100/80 dark:hover:bg-white/10 transition-all duration-200"
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
                    aria-label="Search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-[#2C2C2C] text-white hover:bg-[#0EA5E9] transition-all duration-300 shadow-md"
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </motion.button>
            </form>

            {/* Suggestions Dropdown */}
            <AnimatePresence mode="wait">
                {isOpen && (suggestions.length > 0 || isLoading) && searchQuery.trim().length >= 2 && (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                        className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-[#0A0A0A] rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden z-50"
                    >
                        {isLoading ? (
                            <div className="py-2">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse">
                                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                                        <div className="flex-1">
                                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1.5 w-3/4" />
                                            <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <>
                                <div ref={listRef} className="max-h-80 overflow-y-auto overscroll-contain">
                                    {suggestions.map((suggestion, index) => (
                                        <button
                                            key={`${suggestion.type}-${suggestion.id}`}
                                            onClick={() => handleSuggestionClick(suggestion)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-150 ${
                                                selectedIndex === index
                                                    ? 'bg-[#0EA5E9]/10 border-l-4 border-[#0EA5E9]'
                                                    : 'hover:bg-gray-50 dark:hover:bg-white/5 border-l-4 border-transparent'
                                            }`}
                                        >
                                            {/* Thumbnail */}
                                            <div className="shrink-0 w-10 h-10 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                                                {suggestion.image ? (
                                                    <img
                                                        src={cloudinaryUrl(suggestion.image, 80)}
                                                        alt={suggestion.text}
                                                        className="w-full h-full object-cover"
                                                        loading="lazy"
                                                        width={40}
                                                        height={40}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-[#0EA5E9]/10 flex items-center justify-center">
                                                        {getTypeIcon(suggestion.type)}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Text */}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                                                    {suggestion.text}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {getTypeLabel(suggestion.type)}
                                                    {suggestion.category && (
                                                        <> &middot; {suggestion.category}</>
                                                    )}
                                                    {suggestion.subcategory && (
                                                        <> &middot; <span className="text-[#0EA5E9]">{suggestion.subcategory}</span></>
                                                    )}
                                                </p>
                                            </div>

                                            {/* Arrow icon */}
                                            <div className="shrink-0 w-6 h-6 rounded-full bg-[#0EA5E9]/10 flex items-center justify-center">
                                                <svg className="w-3 h-3 text-[#0EA5E9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                </svg>
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                {/* Footer */}
                                <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-2.5 bg-gray-50/50 dark:bg-white/2">
                                    <button
                                        onClick={() => handleSearch()}
                                        className="flex items-center gap-2 text-sm text-[#0EA5E9] hover:text-[#0369A1] transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        Search for &ldquo;{searchQuery}&rdquo;
                                    </button>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
