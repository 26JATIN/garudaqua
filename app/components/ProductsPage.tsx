"use client";
import "@/app/styles/animations.css";
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { TransitionElement } from "./PageTransition";


/** Mirrors the server-side slugify so we never fall back to an ObjectId */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
function productPath(product: { slug?: string; name: string }): string {
  return product.slug || slugify(product.name);
}

// ===== Type Definitions =====
interface Category {
    id: string;
    name: string;
    slug?: string;
    image?: string;
    hasSeoPage?: boolean;
}

interface Subcategory {
    id: string;
    name: string;
    slug?: string;
    image?: string;
    category: { id: string; name: string; slug?: string };
}

interface Product {
    id: string;
    name: string;
    slug?: string;
    image?: string;
    images?: string[];
    description?: string;
    category: { id: string; name: string; slug?: string } | string;
    subcategory?: { id: string; name: string; slug?: string };
    createdAt?: string;
}

interface ProductCardProps {
    product: Product;
    index: number;
}

interface ProductsPageProps {
    initialCategories?: Category[];
    initialSubcategories?: Subcategory[];
    initialProducts?: Product[];
    initialTotal?: number;
    initialSearchParams?: {
        category?: string;
        subcategory?: string;
        search?: string;
        sort?: string;
    };
}


// Helper to get category name from Product (handles both string and object formats)
function getCategoryName(category: Product["category"]): string {
    if (typeof category === "string") return category;
    return category?.name || "";
}

export default function ProductsPage({
    initialCategories,
    initialSubcategories,
    initialProducts,
    initialTotal,
    initialSearchParams,
}: ProductsPageProps) {
    const [selectedCategory, setSelectedCategory] = useState(initialSearchParams?.category || "all");
    const [selectedSubcategory, setSelectedSubcategory] = useState(initialSearchParams?.subcategory || "All");
    const [searchTerm, setSearchTerm] = useState(initialSearchParams?.search || "");
    const [sortBy, setSortBy] = useState(initialSearchParams?.sort || "featured");
    const [viewMode, setViewMode] = useState("grid");

    // API data states
    const hasInitialData = !!(initialCategories && initialSubcategories && initialProducts);
    const [categories, setCategories] = useState<Category[]>(
        initialCategories ? [{ id: "all", name: "All" }, ...initialCategories] : [{ id: "all", name: "All" }]
    );
    const [subcategories, setSubcategories] = useState<Subcategory[]>(initialSubcategories || []);
    // allProducts holds the complete unfiltered list for client-side filtering
    const [allProducts, setAllProducts] = useState<Product[]>(initialProducts || []);
    const [loadingCategories, setLoadingCategories] = useState(!hasInitialData);
    const [, setLoadingSubcategories] = useState(!hasInitialData);
    const [loadingProducts, setLoadingProducts] = useState(!hasInitialData);

    const productsGridRef = useRef<HTMLDivElement>(null);
    const categoryScrollRef = useRef<HTMLDivElement>(null);
    const subcategoryScrollRef = useRef<HTMLDivElement>(null);
    // Fetch categories on mount (skip if server-provided)
    useEffect(() => {
        if (hasInitialData) return;
        async function fetchCategories() {
            try {
                const res = await fetch("/api/categories");
                if (!res.ok) throw new Error("Failed to fetch categories");
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    setCategories([{ id: "all", name: "All" }, ...data]);
                }
            } catch {
                toast.error("Failed to load categories");
            } finally {
                setLoadingCategories(false);
            }
        }
        fetchCategories();
    }, [hasInitialData]);

    // Fetch subcategories on mount (skip if server-provided)
    useEffect(() => {
        if (hasInitialData) return;
        async function fetchSubcategories() {
            try {
                const res = await fetch("/api/subcategories");
                if (!res.ok) throw new Error("Failed to fetch subcategories");
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    setSubcategories(data);
                }
            } catch {
                toast.error("Failed to load subcategories");
            } finally {
                setLoadingSubcategories(false);
            }
        }
        fetchSubcategories();
    }, [hasInitialData]);

    // Fetch all products on mount (skip if server-provided)
    useEffect(() => {
        if (hasInitialData) return;
        async function fetchAllProducts() {
            setLoadingProducts(true);
            try {
                const res = await fetch("/api/products?limit=200");
                if (!res.ok) throw new Error("Failed to fetch products");
                const data = await res.json();
                if (data.products && Array.isArray(data.products)) {
                    setAllProducts(data.products);
                } else if (Array.isArray(data)) {
                    setAllProducts(data);
                }
            } catch {
                toast.error("Failed to load products");
            } finally {
                setLoadingProducts(false);
            }
        }
        fetchAllProducts();
    }, [hasInitialData]);

    // Sync state when URL params change (e.g. browser back/forward)
    useEffect(() => {
        const handlePopState = () => {
            const params = new URLSearchParams(window.location.search);
            setSelectedCategory(params.get("category") || "all");
            setSelectedSubcategory(params.get("subcategory") || "All");
            setSearchTerm(params.get("search") || "");
            setSortBy(params.get("sort") || "featured");
        };
        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, []);

    // Client-side filtering — no API calls needed for category/subcategory/sort changes
    const products = useMemo(() => {
        let filtered = allProducts;

        // Filter by category
        if (selectedCategory !== "all") {
            filtered = filtered.filter((p) => {
                if (typeof p.category === "string") return false;
                const catSlug = p.category.slug || slugify(p.category.name);
                return catSlug === selectedCategory;
            });
        }

        // Filter by subcategory
        if (selectedSubcategory !== "All") {
            filtered = filtered.filter((p) => {
                if (!p.subcategory) return false;
                const subSlug = p.subcategory.slug || slugify(p.subcategory.name);
                return subSlug === selectedSubcategory;
            });
        }

        // Filter by search term
        if (searchTerm.trim()) {
            const term = searchTerm.trim().toLowerCase();
            filtered = filtered.filter((p) =>
                p.name.toLowerCase().includes(term) ||
                (p.description && p.description.toLowerCase().includes(term))
            );
        }

        // Sort
        if (sortBy === "newest") {
            filtered = [...filtered].sort((a, b) =>
                (b.createdAt || "").localeCompare(a.createdAt || "")
            );
        }

        return filtered;
    }, [allProducts, selectedCategory, selectedSubcategory, searchTerm, sortBy]);

    const totalProducts = products.length;

    // Scroll a container left or right
    const scrollByAmount = useCallback((ref: React.RefObject<HTMLDivElement | null>, direction: "left" | "right") => {
        if (ref.current) {
            const amount = direction === "left" ? -300 : 300;
            ref.current.scrollBy({ left: amount, behavior: "smooth" });
        }
    }, []);

    // Scroll selected item to center of its container
    const scrollSelectedToCenter = useCallback((containerRef: React.RefObject<HTMLDivElement | null>, selectedSelector: string) => {
        if (!containerRef.current) return;
        const container = containerRef.current;
        const selectedEl = container.querySelector(selectedSelector);
        if (!selectedEl) return;
        const containerRect = container.getBoundingClientRect();
        const selectedRect = selectedEl.getBoundingClientRect();
        const scrollLeft =
            container.scrollLeft +
            (selectedRect.left - containerRect.left) -
            containerRect.width / 2 +
            selectedRect.width / 2;
        container.scrollTo({ left: scrollLeft, behavior: "smooth" });
    }, []);

    // Auto-scroll category selector
    useEffect(() => {
        const timer = setTimeout(() => {
            scrollSelectedToCenter(categoryScrollRef, '[data-category-selected="true"]');
        }, 100);
        return () => clearTimeout(timer);
    }, [selectedCategory, scrollSelectedToCenter]);

    // Auto-scroll subcategory selector
    useEffect(() => {
        const timer = setTimeout(() => {
            scrollSelectedToCenter(subcategoryScrollRef, '[data-subcategory-selected="true"]');
        }, 100);
        return () => clearTimeout(timer);
    }, [selectedSubcategory, scrollSelectedToCenter]);

    // Filtered subcategories based on selected category (matched by slug)
    const visibleSubcategories = useMemo(() => {
        if (selectedCategory === "all") return subcategories;
        return subcategories.filter((sub) => {
            const catSlug = sub.category.slug || slugify(sub.category.name);
            return catSlug === selectedCategory;
        });
    }, [selectedCategory, subcategories]);

    // Sync URL
    useEffect(() => {
        const params = new URLSearchParams();
        if (selectedCategory !== "all") params.set("category", selectedCategory);
        if (selectedSubcategory !== "All") params.set("subcategory", selectedSubcategory);
        if (searchTerm) params.set("search", searchTerm);
        if (sortBy !== "featured") params.set("sort", sortBy);

        const newUrl = params.toString() ? `/products?${params.toString()}` : "/products";
        const currentUrl = `${window.location.pathname}${window.location.search}`;
        if (newUrl !== currentUrl) {
            window.history.replaceState(window.history.state, "", newUrl);
        }
    }, [selectedCategory, selectedSubcategory, searchTerm, sortBy]);

    // Helper to get category display name from slug
    const getCategoryDisplayName = useCallback((catSlug: string) => {
        if (catSlug === "all") return "All";
        const cat = categories.find((c) => (c.slug || slugify(c.name)) === catSlug);
        return cat?.name || "";
    }, [categories]);

    const handleCategoryClick = useCallback((categorySlug: string) => {
        setSelectedCategory(categorySlug);
        setSelectedSubcategory("All");
    }, []);

    const handleSubcategoryClick = useCallback((subcategorySlug: string) => {
        setSelectedSubcategory(subcategorySlug);
    }, []);

    const clearSearch = useCallback(() => {
        setSearchTerm("");
    }, []);

    // Loading skeleton for products grid
    const ProductsLoadingSkeleton = () => (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-[#0A0A0A] rounded-xl md:rounded-2xl overflow-hidden shadow-sm">
                    <div className="relative aspect-4/5 bg-gray-200 dark:bg-gray-800 animate-pulse" />
                    <div className="p-3 md:p-4 lg:p-6 space-y-2 md:space-y-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-3/4" />
                        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-1/2" />
                        <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-1/3" />
                    </div>
                </div>
            ))}
        </div>
    );

    // Loading skeleton for categories
    const CategoriesLoadingSkeleton = () => (
        <div className="flex gap-3 md:gap-4 lg:gap-6 overflow-x-auto scrollbar-hide py-2 px-1 lg:px-10">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 md:gap-2 min-w-16 md:min-w-19 lg:min-w-20">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
                    <div className="h-3 w-12 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                </div>
            ))}
        </div>
    );

    return (
        <div className="min-h-screen bg-linear-to-b from-white via-[#FAFAFA] to-white dark:from-black dark:via-[#050505] dark:to-black pt-4 md:pt-6 lg:pt-8 pb-6 md:pb-8 lg:pb-12">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                {/* Header */}
                <div
                    className="text-center mb-6 md:mb-8 lg:mb-10"
                >
                    <p className="text-xs md:text-sm text-[#0EA5E9] font-light tracking-widest uppercase mb-1 md:mb-2">
                        {searchTerm ? "Search Results" : "Browse by Category"}
                    </p>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-light text-[#2C2C2C] dark:text-gray-100 tracking-tight mb-3 md:mb-4">
                        {searchTerm ? "Product Search" : "Our Products"}
                    </h1>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 font-light max-w-2xl mx-auto">
                        {searchTerm
                            ? `Found ${totalProducts} ${totalProducts === 1 ? "product" : "products"} matching your search`
                            : "Explore our range of water tanks, pipes & fittings"}
                    </p>

                    {searchTerm && (
                        <div
                            className="mt-6 inline-flex items-center gap-3 bg-white dark:bg-white/10 px-6 py-3 rounded-full shadow-sm"
                        >
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                                Searching for &quot;<span className="font-medium text-[#0EA5E9]">{searchTerm}</span>&quot;
                            </span>
                            <button
                                onClick={clearSearch}
                                className="text-sm text-white bg-[#0EA5E9] hover:bg-[#0369A1] px-4 py-1.5 rounded-full transition-colors font-medium flex items-center gap-1"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Clear Search
                            </button>
                        </div>
                    )}
                </div>

                {/* Category Story Badges */}
                <div
                    className="mb-6 md:mb-8 lg:mb-10"
                >
                    {loadingCategories ? (
                        <CategoriesLoadingSkeleton />
                    ) : (
                        <div className="relative group/scroll">
                            {/* Left Arrow */}
                            <button
                                onClick={() => scrollByAmount(categoryScrollRef, "left")}
                                className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center rounded-full bg-white/90 shadow-md border border-gray-200 text-[#0369A1] hover:bg-[#0EA5E9] hover:text-white hover:border-[#0EA5E9] transition-all duration-200 opacity-0 group-hover/scroll:opacity-100 -translate-x-1"
                                aria-label="Scroll categories left"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>

                            <div ref={categoryScrollRef} className="flex gap-3 md:gap-4 lg:gap-6 overflow-x-auto scrollbar-hide py-2 px-1 lg:px-10">
                                {categories.map((category) => {
                                    const catSlug = category.slug || slugify(category.name);
                                    const isSelected = selectedCategory === catSlug;
                                    return (
                                    <button
                                        key={category.id}
                                        data-category-selected={isSelected ? "true" : undefined}
                                        onClick={() => handleCategoryClick(catSlug)}
                                        className="flex flex-col items-center gap-1.5 md:gap-2 min-w-16 md:min-w-19 lg:min-w-20 group transition-transform duration-200 hover:scale-105 hover:-translate-y-0.5 active:scale-95"
                                    >
                                        <div
                                            className={`relative rounded-full p-0.75 transition-all duration-300 ${
                                                isSelected
                                                    ? "bg-linear-to-tr from-[#0EA5E9] via-[#38BDF8] to-[#0369A1]"
                                                    : "bg-linear-to-tr from-gray-200 to-gray-300 group-hover:from-[#0EA5E9]/50 group-hover:to-[#0369A1]/50"
                                            }`}
                                        >
                                            <div className="bg-white dark:bg-gray-900 rounded-full p-0.75">
                                                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden bg-linear-to-br from-[#FAFAFA] to-[#F5F5F5] dark:from-gray-800 dark:to-gray-900 flex items-center justify-center shadow-sm">
                                                    {category.image ? (
                                                        <Image src={category.image} alt={category.name} className="w-full h-full object-cover" loading="lazy" width={64} height={64} quality={50} />
                                                    ) : (
                                                        <svg className="w-6 h-6 md:w-7 md:h-7 text-[#0EA5E9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                                        </svg>
                                                    )}
                                                </div>
                                            </div>

                                            {selectedCategory === category.id && (
                                                <div
                                                    className="absolute -inset-0.5 rounded-full animate-pulse"
                                                    style={{
                                                        background: "linear-gradient(135deg, #0EA5E9, #0369A1)",
                                                        filter: "blur(4px)",
                                                        opacity: 0.4,
                                                    }}
                                                />
                                            )}
                                        </div>

                                        <span
                                            className={`text-[10px] md:text-xs font-light tracking-wide transition-colors duration-300 text-center ${
                                                isSelected
                                                    ? "text-[#0EA5E9] font-medium"
                                                    : "text-[#2C2C2C] dark:text-gray-100 group-hover:text-[#0EA5E9]"
                                            }`}
                                        >
                                            {category.name}
                                        </span>
                                    </button>
                                    );
                                })}
                            </div>

                            {/* Right Arrow */}
                            <button
                                onClick={() => scrollByAmount(categoryScrollRef, "right")}
                                className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center rounded-full bg-white/90 shadow-md border border-gray-200 text-[#0369A1] hover:bg-[#0EA5E9] hover:text-white hover:border-[#0EA5E9] transition-all duration-200 opacity-0 group-hover/scroll:opacity-100 translate-x-1"
                                aria-label="Scroll categories right"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>

                {/* Subcategory Filters */}
                {visibleSubcategories.length > 0 && (
                    <div
                        className="mb-6 md:mb-8 lg:mb-10"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-[#0EA5E9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                <h2 className="text-base md:text-lg font-medium text-[#2C2C2C] dark:text-gray-100">
                                    Browse Types
                                    {selectedCategory !== "all" && (
                                        <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                                            in {getCategoryDisplayName(selectedCategory)}
                                        </span>
                                    )}
                                </h2>
                            </div>
                            {selectedSubcategory !== "All" && (
                                <button
                                    onClick={() => handleSubcategoryClick("All")}
                                    className="text-xs md:text-sm text-[#0EA5E9] hover:text-[#0369A1] font-medium transition-colors flex items-center gap-1"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Clear
                                </button>
                            )}
                        </div>

                        <div className="relative group/scroll">
                            <button
                                onClick={() => scrollByAmount(subcategoryScrollRef, "left")}
                                className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center rounded-full bg-white/90 shadow-md border border-gray-200 text-[#0369A1] hover:bg-[#0EA5E9] hover:text-white hover:border-[#0EA5E9] transition-all duration-200 opacity-0 group-hover/scroll:opacity-100 -translate-x-1"
                                aria-label="Scroll subcategories left"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>

                            <div ref={subcategoryScrollRef} className="flex gap-3 md:gap-4 lg:gap-5 overflow-x-auto scrollbar-hide py-2 px-1 lg:px-10">
                                {/* All badge */}
                                <button
                                    onClick={() => handleSubcategoryClick("All")}
                                    data-subcategory-selected={selectedSubcategory === "All" ? "true" : undefined}
                                    className="flex flex-col items-center gap-1.5 md:gap-2 min-w-17.5 md:min-w-20 lg:min-w-22.5 group transition-transform duration-200 hover:scale-105 hover:-translate-y-0.5 active:scale-95"
                                >
                                    <div
                                        className={`relative rounded-full p-0.75 transition-all duration-300 ${
                                            selectedSubcategory === "All"
                                                ? "bg-linear-to-tr from-[#0EA5E9] via-[#38BDF8] to-[#0369A1]"
                                                : "bg-linear-to-tr from-gray-200 to-gray-300 group-hover:from-[#0EA5E9]/50 group-hover:to-[#0369A1]/50"
                                        }`}
                                    >
                                        <div className="bg-white dark:bg-gray-900 rounded-full p-0.75">
                                            <div className="w-16 h-16 md:w-18 md:h-18 lg:w-20 lg:h-20 rounded-full overflow-hidden bg-linear-to-br from-[#FAFAFA] to-[#F5F5F5] dark:from-gray-800 dark:to-gray-900 flex items-center justify-center shadow-sm">
                                                <svg className="w-7 h-7 md:w-8 md:h-8 text-[#0EA5E9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                                </svg>
                                            </div>
                                        </div>
                                        {selectedSubcategory === "All" && (
                                            <div
                                                className="absolute -inset-0.5 rounded-full animate-pulse"
                                                style={{ background: "linear-gradient(135deg, #0EA5E9, #0369A1)", filter: "blur(4px)", opacity: 0.4 }}
                                            />
                                        )}
                                    </div>
                                    <span
                                        className={`text-[10px] md:text-xs font-light tracking-wide transition-colors duration-300 text-center ${
                                            selectedSubcategory === "All"
                                                ? "text-[#0EA5E9] font-medium"
                                                : "text-[#2C2C2C] dark:text-gray-100 group-hover:text-[#0EA5E9]"
                                        }`}
                                    >
                                        All
                                    </span>
                                </button>
                                {/* Subcategory badges */}
                                {visibleSubcategories.map((subcategory) => {
                                    const subSlug = subcategory.slug || slugify(subcategory.name);
                                    const isSubSelected = selectedSubcategory === subSlug;
                                    return (
                                    <button
                                        key={subcategory.id}
                                        data-subcategory-selected={isSubSelected ? "true" : undefined}
                                        onClick={() => handleSubcategoryClick(subSlug)}
                                        className="flex flex-col items-center gap-1.5 md:gap-2 min-w-17.5 md:min-w-20 lg:min-w-22.5 group transition-transform duration-200 hover:scale-105 hover:-translate-y-0.5 active:scale-95"
                                    >
                                        <div
                                            className={`relative rounded-full p-0.75 transition-all duration-300 ${
                                                isSubSelected
                                                    ? "bg-linear-to-tr from-[#0EA5E9] via-[#38BDF8] to-[#0369A1]"
                                                    : "bg-linear-to-tr from-gray-200 to-gray-300 group-hover:from-[#0EA5E9]/50 group-hover:to-[#0369A1]/50"
                                            }`}
                                        >
                                            <div className="bg-white dark:bg-gray-900 rounded-full p-0.75">
                                                <div className="w-16 h-16 md:w-18 md:h-18 lg:w-20 lg:h-20 rounded-full overflow-hidden bg-linear-to-br from-[#FAFAFA] to-[#F5F5F5] dark:from-gray-800 dark:to-gray-900 flex items-center justify-center shadow-sm">
                                                    {subcategory.image ? (
                                                        <Image src={subcategory.image} alt={subcategory.name} className="w-full h-full object-cover" loading="lazy" width={80} height={80} quality={50} />
                                                    ) : (
                                                        <svg className="w-7 h-7 md:w-8 md:h-8 text-[#0EA5E9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                        </svg>
                                                    )}
                                                </div>
                                            </div>
                                            {isSubSelected && (
                                                <div
                                                    className="absolute -inset-0.5 rounded-full animate-pulse"
                                                    style={{ background: "linear-gradient(135deg, #0EA5E9, #0369A1)", filter: "blur(4px)", opacity: 0.4 }}
                                                />
                                            )}
                                        </div>
                                        <span
                                            className={`text-[10px] md:text-xs font-light tracking-wide transition-colors duration-300 text-center line-clamp-2 leading-tight max-w-17.5 md:max-w-20 lg:max-w-22.5 ${
                                                isSubSelected
                                                    ? "text-[#0EA5E9] font-medium"
                                                    : "text-[#2C2C2C] dark:text-gray-100 group-hover:text-[#0EA5E9]"
                                            }`}
                                        >
                                            {subcategory.name}
                                        </span>
                                    </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => scrollByAmount(subcategoryScrollRef, "right")}
                                className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center rounded-full bg-white/90 shadow-md border border-gray-200 text-[#0369A1] hover:bg-[#0EA5E9] hover:text-white hover:border-[#0EA5E9] transition-all duration-200 opacity-0 group-hover/scroll:opacity-100 translate-x-1"
                                aria-label="Scroll subcategories right"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* Filter & Sort Bar */}
                <div
                    ref={productsGridRef}
                    className="mb-6 md:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 bg-white dark:bg-[#0A0A0A] rounded-xl md:rounded-2xl p-3 md:p-4 shadow-sm border border-gray-100 dark:border-white/6"
                >
                    <div className="flex items-center gap-2 sm:gap-3">
                        <svg className="w-4 h-4 md:w-5 md:h-5 text-[#0EA5E9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <span className="text-xs md:text-sm font-medium text-[#2C2C2C] dark:text-gray-200">
                            {totalProducts} {totalProducts === 1 ? "Product" : "Products"}
                            {selectedCategory !== "all" && (
                                <span className="hidden sm:inline"> in {getCategoryDisplayName(selectedCategory)}</span>
                            )}
                        </span>
                        
                        {/* Info Button - Show only when category is selected and has SEO page */}
                        {selectedCategory !== "all" && (
                            (() => {
                                const selectedCat = categories.find(
                                    c => (c.slug || slugify(c.name)) === selectedCategory
                                );
                                if (selectedCat && selectedCat.hasSeoPage) {
                                    return (
                                        <Link
                                            href={`/categories/${selectedCat.slug || slugify(selectedCat.name)}`}
                                            className="ml-2 inline-flex items-center justify-center w-6 h-6 md:w-7 md:h-7 rounded-full bg-[#0EA5E9]/10 hover:bg-[#0EA5E9]/20 text-[#0EA5E9] transition-colors duration-200"
                                            title={`View ${selectedCat.name} category details`}
                                            aria-label={`View ${selectedCat.name} details`}
                                        >
                                            <svg className="w-4 h-4 md:w-4.5 md:h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </Link>
                                    );
                                }
                                return null;
                            })()
                        )}
                    </div>

                    <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-initial min-w-0">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                aria-label="Sort products by"
                                className="w-full sm:w-auto appearance-none bg-gray-50 dark:bg-white/6 border border-gray-200 dark:border-white/10 rounded-lg md:rounded-xl px-3 md:px-4 py-2 md:py-2.5 pr-8 md:pr-10 text-xs md:text-sm font-light text-[#2C2C2C] dark:text-gray-200 hover:border-[#0EA5E9] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/20 focus:border-[#0EA5E9] transition-all cursor-pointer"
                            >
                                <option value="featured">Featured</option>
                                <option value="newest">Newest</option>
                            </select>
                            <svg className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>

                        <div className="flex items-center gap-0.5 md:gap-1 bg-gray-50 dark:bg-white/6 rounded-lg md:rounded-xl p-0.5 md:p-1">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`p-2.5 md:p-2.5 rounded-md md:rounded-lg transition-all ${
                                    viewMode === "grid" ? "bg-white dark:bg-white/10 text-[#0EA5E9] shadow-sm" : "text-gray-400 hover:text-gray-600"
                                }`}
                                title="Grid View"
                                aria-label="Grid view"
                            >
                                <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={`p-2.5 md:p-2.5 rounded-md md:rounded-lg transition-all ${
                                    viewMode === "list" ? "bg-white dark:bg-white/10 text-[#0EA5E9] shadow-sm" : "text-gray-400 hover:text-gray-600"
                                }`}
                                title="List View"
                                aria-label="List view"
                            >
                                <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Products Grid/List */}
                {loadingProducts && products.length === 0 ? (
                    <ProductsLoadingSkeleton />
                ) : products.length === 0 ? (
                    <div
                        className="flex flex-col items-center justify-center h-64 text-center"
                    >
                        <svg className="w-20 h-20 text-[#0EA5E9] opacity-40 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p className="text-xl text-[#2C2C2C] dark:text-gray-100 font-light">
                            {searchTerm || selectedCategory !== "all" ? "No products found" : "No products available"}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">
                            {searchTerm
                                ? "Try adjusting your search terms"
                                : selectedCategory !== "all"
                                  ? "Try selecting a different category"
                                  : "Check back soon for new items"}
                        </p>
                    </div>
                ) : (
                    <div className={`relative ${loadingProducts ? "opacity-50 pointer-events-none" : ""} transition-opacity duration-200`}>
                        <div
                            className={
                                    viewMode === "grid"
                                        ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8"
                                        : "space-y-4"
                                }
                            >
                                {products.map((product, index) =>
                                    viewMode === "grid" ? (
                                        <ProductCard key={product.id} product={product} index={index} />
                                    ) : (
                                        <ProductListItem key={product.id} product={product} index={index} />
                                    )
                                )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ===== Grid Product Card =====
function ProductCard({ product, index }: ProductCardProps) {
    const categoryName = getCategoryName(product.category);
    const productHref = `/products/${productPath(product)}`;

    return (
        <div
            className="group h-full"
        >
            <Link href={productHref} className="block h-full">
                <TransitionElement name={`product-${product.slug}`} className="h-full">
                    <div className="bg-white dark:bg-[#0A0A0A] rounded-xl md:rounded-2xl overflow-hidden shadow-sm h-full flex flex-col card-interactive">
                        <div className="relative w-full aspect-4/5 overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
                            {product.image ? (
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    className="object-cover transform group-hover:scale-110 transition-transform duration-700"
                                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                    quality={50}
                                    priority={index < 4}
                                    fetchPriority={index < 4 ? "high" : "auto"}
                                    decoding={index < 4 ? "sync" : "async"}
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <svg className="w-12 h-12 text-[#0EA5E9] opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                            )}
                            <div className="absolute top-2 left-2 md:top-3 md:left-3 flex flex-col gap-1 z-10">
                                <span className="bg-white/90 backdrop-blur-sm text-[#0EA5E9] text-[10px] md:text-xs px-2 py-1 rounded-full font-medium shadow-sm">
                                    {categoryName}
                                </span>
                                {product.subcategory?.name && (
                                    <span className="bg-[#0EA5E9]/90 backdrop-blur-sm text-white text-[10px] md:text-xs px-2 py-1 rounded-full font-medium shadow-sm">
                                        {product.subcategory.name}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="p-3 md:p-4 lg:p-6 flex flex-col flex-1 relative bg-white dark:bg-[#0A0A0A]">
                            <h3 className="text-[#2C2C2C] dark:text-gray-100 font-medium text-[13px] sm:text-sm md:text-base lg:text-lg mb-2 md:mb-3 group-hover:text-[#0EA5E9] transition-colors leading-tight line-clamp-2 min-h-10 md:min-h-12 lg:min-h-14 flex items-start">
                                {product.name}
                            </h3>
                            <div className="mt-auto pt-2 flex items-center text-[#0369A1] dark:text-[#0EA5E9] text-xs font-semibold uppercase tracking-wider group-hover:tracking-widest transition-all duration-300">
                                View Details
                                <svg className="w-3.5 h-3.5 ml-1 transform group-hover:translate-x-1.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </TransitionElement>
            </Link>
        </div>
    );
}

// ===== List Product Item =====
function ProductListItem({ product, index = 0 }: ProductCardProps) {
    const categoryName = getCategoryName(product.category);
    const productHref = `/products/${productPath(product)}`;
    return (
        <div
            className="group"
        >
            <Link href={productHref} className="block w-full">
                <TransitionElement name={`product-${product.slug}`}>
                    <div className="bg-white dark:bg-[#0A0A0A] rounded-xl border border-gray-100 dark:border-white/6 overflow-hidden shadow-sm flex flex-col sm:flex-row card-interactive">
                        <div className="flex gap-3 md:gap-4 lg:gap-6 w-full p-3 md:p-4 lg:p-6">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 xl:w-48 xl:h-48 shrink-0 relative bg-gray-100 dark:bg-gray-800 rounded-lg md:rounded-xl overflow-hidden">
                                {product.image ? (
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                        sizes="(max-width: 640px) 64px, 192px"
                                        quality={70}
                                        priority={index < 4}
                                        fetchPriority={index < 4 ? "high" : "auto"}
                                        decoding={index < 4 ? "sync" : "async"}
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <svg className="w-8 h-8 text-[#0EA5E9] opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 flex flex-col justify-center min-w-0">
                                <div className="flex items-center gap-2 mb-1 sm:mb-2">
                                    <p className="text-[10px] sm:text-xs text-[#0EA5E9] font-medium tracking-wide uppercase">
                                        {categoryName}
                                    </p>
                                    {product.subcategory?.name && (
                                        <>
                                            <span className="text-gray-300">•</span>
                                            <p className="text-[10px] sm:text-xs text-[#0369A1] font-medium tracking-wide uppercase">
                                                {product.subcategory.name}
                                            </p>
                                        </>
                                    )}
                                </div>
                                <h3 className="text-sm sm:text-base md:text-lg lg:text-xl text-[#2C2C2C] dark:text-gray-100 font-light mb-1 sm:mb-2 md:mb-3 group-hover:text-[#0EA5E9] transition-colors line-clamp-2">
                                    {product.name}
                                </h3>
                            </div>
                        </div>
                    </div>
                </TransitionElement>
            </Link>
        </div>
    );
}
