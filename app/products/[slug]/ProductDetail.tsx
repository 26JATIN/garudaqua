"use client";
import "@/app/styles/animations.css";
import { useState, useEffect, useRef, useCallback } from "react";
import NavigationLink from "@/app/components/NavigationLink";
import Image from "next/image";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { TransitionElement } from "../../components/PageTransition";

/** Mirrors server slugify — ensures related product links never use an ObjectId */
function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
function productPath(product: { slug?: string; name: string }): string {
  return product.slug || slugify(product.name);
}

// ===== Type Definitions =====
interface VariantOptionValue {
    name: string;
    displayName: string;
    colorCode: string | null;
    isAvailable: boolean;
    imageUrl?: string | null;
}

interface VariantOption {
    name: string;
    displayName: string;
    type: string;
    required: boolean;
    values: VariantOptionValue[];
}

interface Product {
    id: string;
    name: string;
    slug?: string;
    image?: string;
    images?: string[];
    description?: string;
    category: { id: string; name: string; slug?: string; hasSeoPage?: boolean } | string;
    subcategory?: { id: string; name: string; slug?: string };
    specs?: { label: string; value: string }[];
    hasVariants?: boolean;
    variantOptions?: VariantOption[];
    pricingOptions?: Array<{
        unit: "litre" | "kg" | "piece" | string;
        label: string;
        price?: number | string | null;
        isAvailable?: boolean;
    }>;
    variants?: unknown[];
    guarantee?: string;
    createdAt?: string;
}

// Helper to get category name from Product (handles both string and object formats)
function getCategoryName(category: Product["category"]): string {
    if (typeof category === "string") return category;
    return category?.name || "";
}

function formatPriceValue(price?: number | string | null): string | null {
    if (price === null || price === undefined) return null;
    const numeric = Number(price);
    if (!Number.isFinite(numeric)) return null;
    return new Intl.NumberFormat("en-IN", {
        maximumFractionDigits: numeric % 1 === 0 ? 0 : 2,
    }).format(numeric);
}


// Mobile swipeable image gallery
function MobileImageGallery({ images, imageAlts = [], productName, controlledIndex, onIndexChange }: { images: string[]; imageAlts?: string[]; productName: string; controlledIndex?: number; onIndexChange?: (i: number) => void }) {
    const [activeIndex, setActiveIndex] = useState(controlledIndex ?? 0);
    const [dragOffset, setDragOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const touchStartRef = useRef({ x: 0, y: 0, time: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const isHorizontalSwipeRef = useRef<boolean | null>(null);

    // Sync when parent drives the index (e.g., color swatch clicked)
    useEffect(() => {
        if (controlledIndex !== undefined && controlledIndex !== activeIndex) {
            setActiveIndex(controlledIndex);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [controlledIndex]);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        const touch = e.touches[0];
        touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
        isHorizontalSwipeRef.current = null;
        setIsDragging(true);
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!isDragging) return;
        const touch = e.touches[0];
        const diffX = touch.clientX - touchStartRef.current.x;
        const diffY = touch.clientY - touchStartRef.current.y;

        if (isHorizontalSwipeRef.current === null && (Math.abs(diffX) > 5 || Math.abs(diffY) > 5)) {
            isHorizontalSwipeRef.current = Math.abs(diffX) > Math.abs(diffY);
        }

        if (isHorizontalSwipeRef.current) {
            e.preventDefault();
            let offset = diffX;
            if ((activeIndex === 0 && diffX > 0) || (activeIndex === images.length - 1 && diffX < 0)) {
                offset = diffX * 0.3;
            }
            setDragOffset(offset);
        }
    }, [isDragging, activeIndex, images.length]);

    const handleTouchEnd = useCallback(() => {
        if (!isDragging) return;
        setIsDragging(false);
        const threshold = containerRef.current ? containerRef.current.offsetWidth * 0.2 : 80;
        const timeDiff = Date.now() - touchStartRef.current.time;
        const velocity = Math.abs(dragOffset) / timeDiff;

        if (dragOffset < -threshold || (dragOffset < -30 && velocity > 0.3)) {
            if (activeIndex < images.length - 1) {
                const next = activeIndex + 1;
                setActiveIndex(next);
                onIndexChange?.(next);
            }
        } else if (dragOffset > threshold || (dragOffset > 30 && velocity > 0.3)) {
            if (activeIndex > 0) {
                const prev = activeIndex - 1;
                setActiveIndex(prev);
                onIndexChange?.(prev);
            }
        }
        setDragOffset(0);
        isHorizontalSwipeRef.current = null;
    }, [isDragging, dragOffset, activeIndex, images.length, onIndexChange]);

    return (
        <div className="relative">
            <div
                ref={containerRef}
                className="overflow-hidden rounded-3xl shadow-lg dark:shadow-none dark:border dark:border-white/6 relative"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div
                    className="flex"
                    style={{
                        transform: `translateX(calc(-${activeIndex * 100}% + ${dragOffset}px))`,
                        transition: isDragging ? "none" : "transform 0.35s cubic-bezier(0.25, 0.1, 0.25, 1)",
                        willChange: "transform",
                    }}
                >
                    {images.map((img, index) => (
                        <div key={index} className="w-full shrink-0">
                            <div className="aspect-square relative bg-white dark:bg-[#0A0A0A]">
                                <Image
                                    src={img}
                                    alt={imageAlts !== undefined && imageAlts[index] ? imageAlts[index] : `${productName} ${index + 1}`}
                                    fill
                                    className="object-contain"
                                    priority={index === 0}
                                    fetchPriority={index === 0 ? "high" : "auto"}
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    quality={80}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Image counter — inside the overflow container so it overlays the image */}
                {images.length > 1 && (
                    <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full z-20">
                        {activeIndex + 1} / {images.length}
                    </div>
                )}
            </div>

            {/* Thumbnail strip — replaces dots for cleaner mobile UX */}
            {images.length > 1 && (
                <div className="relative mt-3">
                    {/* Fade hints on left/right when strip overflows */}
                    <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-5 bg-gradient-to-r from-white dark:from-black to-transparent z-10 rounded-l-xl" />
                    <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-5 bg-gradient-to-l from-white dark:from-black to-transparent z-10 rounded-r-xl" />
                    <div
                        className="flex gap-2 overflow-x-auto px-1 pb-0.5"
                        style={{ scrollbarWidth: 'none', scrollSnapType: 'x mandatory' }}
                    >
                        {images.map((img, index) => (
                            <button
                                key={index}
                                onClick={() => { setActiveIndex(index); onIndexChange?.(index); }}
                                style={{ scrollSnapAlign: 'center', flexShrink: 0 }}
                                className={`w-14 h-14 rounded-xl overflow-hidden transition-transform duration-200 active:scale-95 bg-white dark:bg-[#0A0A0A] hover:scale-105 ${
                                    activeIndex === index ? 'scale-[1.08]' : ''
                                }`}
                                aria-label={`View image ${index + 1}`}
                            >
                                <img
                                    src={img}
                                    alt={imageAlts?.[index] ?? `${productName} ${index + 1}`}
                                    className="w-full h-full object-contain"
                                    loading={index < 3 ? 'eager' : 'lazy'}
                                />
                            </button>
                        ))}
                    </div>
                </div>
            )}

        </div>
    );
}

// Loading skeleton UI
function ProductDetailSkeleton() {
    return (
        <div className="min-h-screen bg-linear-to-b from-white via-[#FAFAFA] to-white dark:from-black dark:via-[#050505] dark:to-[#0A0A0A] pt-4 md:pt-6 lg:pt-8 pb-20">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb skeleton */}
                <div className="flex items-center space-x-2 mb-8">
                    <div className="h-4 w-12 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                    <div className="h-4 w-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                    <div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                    <div className="h-4 w-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                    <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
                    {/* Image skeleton */}
                    <div className="space-y-4">
                        <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-3xl animate-pulse" />
                        <div className="hidden lg:grid grid-cols-4 gap-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
                            ))}
                        </div>
                    </div>

                    {/* Details skeleton */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
                            <div className="h-8 w-28 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
                        </div>
                        <div className="h-10 w-3/4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                        <div className="space-y-2">
                            <div className="h-5 w-20 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                            <div className="h-4 w-full bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                            <div className="h-4 w-full bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                            <div className="h-4 w-2/3 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                        </div>
                        <div className="rounded-2xl border border-gray-200 dark:border-white/6 p-6 space-y-4 bg-white/70 dark:bg-white/3">
                            <div className="space-y-2">
                                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                                <div className="h-6 w-2/3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="rounded-2xl border border-gray-200 dark:border-white/6 p-4 space-y-3">
                                        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                                        <div className="h-7 w-3/4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                                        <div className="h-4 w-full bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-900 rounded-2xl p-6 space-y-3">
                            <div className="h-5 w-28 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-4" />
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="flex justify-between">
                                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                                    <div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                                </div>
                            ))}
                        </div>
                        <div className="h-14 w-full bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
                    </div>
                </div>
            </div>
        </div>
    );
}

// ===== Related Product Card with hover spotlight =====
function RelatedProductCard({ product: relatedProduct }: { product: Product; index: number; categoryId: string }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <NavigationLink href={`/products/${productPath(relatedProduct)}`} className="block h-full">
            <div
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="relative group cursor-pointer p-2 rounded-2xl md:rounded-3xl h-full"
            >
                {/* Hover spotlight background */}
                {isHovered && (
                    <span
                        className="absolute inset-0 h-full w-full bg-neutral-100 dark:bg-slate-800/70 block rounded-2xl md:rounded-3xl transition-opacity duration-150 opacity-100"
                    />
                )}

                {/* Card content */}
                <div className={cn(
                    "relative z-10 bg-white dark:bg-[#0A0A0A] rounded-2xl sm:rounded-3xl shadow-sm overflow-hidden border border-gray-100 dark:border-white/6 transition-all duration-500 ease-out h-full flex flex-col",
                    isHovered && "shadow-xl scale-[1.03]"
                )}>
                    <div className="aspect-square relative overflow-hidden bg-gray-50 dark:bg-[#0A0A0A] flex items-center justify-center">
                        {relatedProduct.image ? (
                            <Image
                                src={relatedProduct.image}
                                alt={relatedProduct.name}
                                fill
                                className="object-cover object-top transition-transform duration-500"
                                sizes="(max-width: 768px) 50vw, 25vw"
                                quality={70}
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <svg className="w-12 h-12 text-[#0EA5E9] opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                        )}
                        <div className={cn(
                            "absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent transition-opacity duration-300 flex items-end justify-center pb-4",
                            isHovered ? "opacity-100" : "opacity-0"
                        )}>
                        </div>
                    </div>
                    <div className="p-3 md:p-4 flex-1 flex items-center">
                        <h3 className={cn(
                            "text-sm md:text-base font-light text-[#2C2C2C] dark:text-gray-200 line-clamp-2 transition-colors leading-tight",
                            isHovered && "text-[#0EA5E9]"
                        )}>
                            {relatedProduct.name}
                        </h3>
                    </div>
                </div>
            </div>
        </NavigationLink>
    );
}

// ===== Main Component =====
interface ProductDetailProps {
    productSlug: string;
    initialProduct?: Product | null;
    initialRelated?: Product[];
}

export default function ProductDetail({ productSlug, initialProduct, initialRelated }: ProductDetailProps) {
    const hasInitialData = !!(initialProduct);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);

    // Bidirectional image ↔ variant sync
    // When an image is selected (thumbnail click or swipe), also auto-select the
    // variant (color swatch) whose imageUrl maps to that image.
    const handleImageSelect = (index: number, product_ref?: typeof product) => {
        const p = product_ref ?? product;
        setActiveImageIndex(index);
        if (!p || !p.hasVariants || !p.variantOptions) return;
        const img = (p.images && p.images.length > 0 ? p.images : p.image ? [p.image] : [])[index];
        if (!img) return;
        for (const option of p.variantOptions) {
            const matched = option.values?.find(v => v.imageUrl === img);
            if (matched) {
                setSelectedColor(matched.name);
                return; // Only update for the first matching option (color)
            }
        }
        // No specific variant maps to this image — clear color selection
        setSelectedColor(null);
    };
    const [product, setProduct] = useState<Product | null>(initialProduct ?? null);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>(initialRelated ?? []);
    const [loading, setLoading] = useState(!hasInitialData);
    const [notFound, setNotFound] = useState(false);

    // Scroll to top on mount (App Router preserves scroll on navigation)
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, [productSlug]);

    // Fetch product data (skip if server-prefetched)
    useEffect(() => {
        if (hasInitialData) return;

        async function fetchProduct() {
            setLoading(true);
            setNotFound(false);
            setActiveImageIndex(0);
            setSelectedColor(null);

            try {
                const res = await fetch(`/api/products/${productSlug}`);
                if (!res.ok) {
                    setNotFound(true);
                    return;
                }
                const data = await res.json();

                if (data.product) {
                    setProduct(data.product);
                    if (data.related && Array.isArray(data.related)) {
                        setRelatedProducts(data.related);
                    }
                } else {
                    setNotFound(true);
                }
            } catch {
                setNotFound(true);
                toast.error("Failed to load product details");
            } finally {
                setLoading(false);
            }
        }

        fetchProduct();
    }, [productSlug, hasInitialData]);

    const handleShare = async () => {
        const url = window.location.href;
        const title = product?.name || "Check out this product";
        const text = `${product?.name} - Garud Aqua Solutions\n${url}`;

        if (navigator.share) {
            try {
                await navigator.share({ title, text });
                return;
            } catch (err: unknown) {
                if (err instanceof Error && err.name === "AbortError") return;
            }
        }

        try {
            await navigator.clipboard.writeText(url);
            toast.success("Link copied to clipboard!");
        } catch {
            const textArea = document.createElement("textarea");
            textArea.value = url;
            textArea.style.position = "fixed";
            textArea.style.opacity = "0";
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
            toast.success("Link copied to clipboard!");
        }
    };

    // Loading state
    if (loading) {
        return <ProductDetailSkeleton />;
    }

    // Product not found
    if (notFound || !product) {
        return (
            <div className="min-h-screen pt-4 md:pt-6 lg:pt-8 bg-linear-to-b from-white to-[#FAFAFA] dark:from-black dark:to-[#0A0A0A]">
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div
                        className="text-center py-20"
                    >
                        <div className="bg-red-50 dark:bg-red-500/10 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-light text-gray-900 dark:text-gray-100 mb-3">Product Not Found</h3>
                        <p className="text-gray-600 dark:text-gray-400 font-light mb-6">
                            The product you&apos;re looking for doesn&apos;t exist or has been removed.
                        </p>
                        <NavigationLink href="/products">
                            <button
                                className="px-6 py-3 bg-[#0EA5E9] text-white rounded-full hover:bg-[#0369A1] hover:scale-105 active:scale-95 transition-all duration-200 font-light shadow-lg"
                            >
                                Browse Products
                            </button>
                        </NavigationLink>
                    </div>
                </div>
            </div>
        );
    }

    const categoryName = getCategoryName(product.category);
    const categoryId = typeof product.category === "object" ? product.category.id : "";
    const categorySlug = typeof product.category === "object"
        ? (product.category.slug || slugify(product.category.name))
        : slugify(categoryName);
    const displayImages = product.images && product.images.length > 0 ? product.images : product.image ? [product.image] : [];
    const pricingMetaByUnit = {
        litre: { label: "Price per Litre", hint: "Best for storage tanks and liquid products" },
        kg: { label: "Price per Kg", hint: "Best for bulk weight-based orders" },
        piece: { label: "Price per Piece", hint: "Best for single-item purchases" },
    } as const;
    const normalizedPricingOptions = (product.pricingOptions || []).filter(
        (option): option is NonNullable<Product["pricingOptions"]>[number] =>
            !!option &&
            (option.unit === "litre" || option.unit === "kg" || option.unit === "piece")
    );
    const visiblePricingOptions = normalizedPricingOptions.filter((option) => option.isAvailable !== false);
    const visiblePricedOptions = visiblePricingOptions.filter((option) => Number.isFinite(Number(option.price)));
    const primaryPricingOption = visiblePricedOptions[0] || visiblePricingOptions[0] || null;

    // Pre-calculate image alt tags based on variant mapping
    const imageAlts = displayImages.map((img, idx) => {
        let variantHint = "";
        if (product.hasVariants && product.variantOptions) {
            for (const option of product.variantOptions) {
                // Find if any value explicitly links to this image URL
                const matchedValue = option.values?.find(v => v.imageUrl === img);
                if (matchedValue) {
                    variantHint = ` in ${matchedValue.displayName || matchedValue.name} color`;
                    break; // Use the first matching variant hint
                }
            }
        }
        return `${product.name}${variantHint} - Image ${idx + 1}`;
    });

    return (
        <div className="min-h-screen bg-linear-to-b from-white via-[#FAFAFA] to-white dark:from-black dark:via-[#050505] dark:to-[#0A0A0A] pt-4 md:pt-6 lg:pt-8 pb-20">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb */}
                <nav className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-8">
                    <NavigationLink href="/" className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-all font-medium border border-transparent dark:border-white/5 shadow-xs">
                        Home
                    </NavigationLink>
                    <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <NavigationLink href="/products" className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-all font-medium border border-transparent dark:border-white/5 shadow-xs">
                        Products
                    </NavigationLink>
                    {categoryName && categorySlug && (
                        <>
                            <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <NavigationLink href={`/categories/${categorySlug}`} className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-all font-medium border border-transparent dark:border-white/5 shadow-xs">
                                {categoryName}
                            </NavigationLink>
                        </>
                    )}
                    <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-[#0EA5E9]/10 text-[#0EA5E9] font-semibold border border-[#0EA5E9]/20 shadow-xs">
                        {product.name}
                    </span>
                </nav>

                {/* Product Details */}
                <div className="grid grid-cols-1 md:grid-cols-[44%_1fr] gap-8 md:gap-10 lg:gap-16 xl:gap-20 mb-16">
                    {/* Images Section */}
                    <TransitionElement
                        name={`product-${productSlug}`}
                        className=""
                    >
                        {/* ── Mobile: swipeable gallery ───────────────────── */}
                        {displayImages.length > 0 && (
                            <div className="md:hidden w-full">
                                <MobileImageGallery
                                    images={displayImages}
                                    imageAlts={imageAlts}
                                    productName={product.name}
                                    controlledIndex={activeImageIndex}
                                    onIndexChange={(idx) => handleImageSelect(idx)}
                                />
                            </div>
                        )}
                        {displayImages.length === 0 && (
                            <div className="md:hidden aspect-square rounded-3xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                <svg className="w-20 h-20 text-[#0EA5E9] opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                        )}

                        {/* ── Desktop: vertical thumbnail rail + main image ─ */}
                        <div
                            className="hidden md:flex gap-3 xl:gap-4 items-start md:sticky md:self-start"
                            style={{ top: 'max(7rem, calc(50svh - 50%))' }}
                        >
                            {/* Vertical thumbnail strip */}
                            {displayImages.length > 1 && (
                                <div className="flex flex-col gap-2.5 w-[72px] xl:w-[84px] shrink-0">
                                    {displayImages.slice(0, 6).map((img, index) => {
                                        const isActive = activeImageIndex === index;
                                        // Last visible slot: show +N overlay if more images exist beyond 6
                                        const isLastSlot = index === 5 && displayImages.length > 6;
                                        const overflowCount = displayImages.length - 6;
                                        return (
                                            <button
                                                key={index}
                                                onClick={() => handleImageSelect(index)}
                                                className={`relative aspect-square w-full rounded-xl xl:rounded-2xl overflow-hidden transition-transform duration-200 hover:scale-105 active:scale-95 shrink-0 bg-white dark:bg-[#0A0A0A] ${
                                                    isActive ? 'scale-[1.08]' : ''
                                                }`}
                                            >
                                                <Image
                                                    src={img}
                                                    alt={imageAlts[index] || `${product.name} ${index + 1}`}
                                                    width={84}
                                                    height={84}
                                                    className="object-contain w-full h-full"
                                                    quality={55}
                                                />
                                                {/* +N overlay on the 6th thumbnail */}
                                                {isLastSlot && (
                                                    <div className="absolute inset-0 bg-black/55 flex items-center justify-center rounded-xl xl:rounded-2xl">
                                                        <span className="text-white text-sm font-semibold leading-none">+{overflowCount}</span>
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Main large image */}
                            <div className="flex-1 relative aspect-square rounded-3xl overflow-hidden bg-white dark:bg-[#0A0A0A] border border-gray-100 dark:border-white/6 shadow-sm">
                                {displayImages.length > 0 ? (
                                    <Image
                                        src={displayImages[activeImageIndex]}
                                        alt={imageAlts[activeImageIndex] || product.name}
                                        fill
                                        className="object-contain transition-opacity duration-300"
                                        priority
                                        sizes="(min-width: 1280px) 45vw, (min-width: 1024px) 52vw, 100vw"
                                        quality={85}
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <svg className="w-24 h-24 text-[#0EA5E9] opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                    </div>
                                )}
                                {/* Image counter badge */}
                                {displayImages.length > 1 && (
                                    <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full">
                                        {activeImageIndex + 1} / {displayImages.length}
                                    </div>
                                )}
                            </div>
                        </div>
                    </TransitionElement>

                    {/* Product Info Section */}
                    <div className="space-y-6">
                        {/* Category badges */}
                        <div className="flex items-center flex-wrap gap-2">
                            <span className="bg-[#0EA5E9]/10 text-[#0EA5E9] text-sm font-medium px-4 py-1.5 rounded-full inline-flex items-center gap-2">
                                {categoryName}
                                {typeof product.category === 'object' && product.category.hasSeoPage && (
                                    <NavigationLink
                                        href={`/categories/${categorySlug}`}
                                        className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#0EA5E9]/20 hover:bg-[#0EA5E9]/30 transition-colors"
                                        title="View Category Details"
                                    >
                                        <span className="text-xs font-bold font-serif leading-none">i</span>
                                    </NavigationLink>
                                )}
                            </span>
                            {product.subcategory?.name && (
                                <span className="bg-[#0369A1]/10 text-[#0369A1] text-sm font-medium px-4 py-1.5 rounded-full">
                                    {product.subcategory.name}
                                </span>
                            )}
                        </div>

                        {/* Product Name */}
                        <h1 className="text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-semibold text-[#2C2C2C] dark:text-gray-100 leading-tight tracking-tight">
                            {product.name}
                        </h1>

                        {/* Description */}
                        {product.description && (
                            <div className="border-t border-gray-100 dark:border-white/6 pt-5">
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-[15px]">
                                    {product.description}
                                </p>
                            </div>
                        )}


                        {/* Available Options */}
                        {product.hasVariants && product.variantOptions && product.variantOptions.length > 0 && (
                            <div className="bg-linear-to-br from-[#FAFAFA] to-white dark:from-[#0A0A0A] dark:to-[#111] rounded-2xl p-6 space-y-5 border border-gray-200 dark:border-white/6">
                                <h2 className="text-lg font-light text-[#2C2C2C] dark:text-gray-100">Available Options</h2>
                                {product.variantOptions.map((option) => {
                                    const availableValues = option.values.filter((v) => v.isAvailable);
                                    if (availableValues.length === 0) return null;
                                    return (
                                        <div key={option.name} className="space-y-3">
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                {option.displayName}
                                            </p>
                                            {option.type === "color" ? (
                                                <div className="flex flex-wrap gap-4">
                                                    {availableValues.map((value) => {
                                                        const isSelected = selectedColor === value.name;
                                                        const hasImage = !!(value.imageUrl);
                                                        const handleColorClick = () => {
                                                            setSelectedColor(value.name);
                                                            if (hasImage) {
                                                                const imgIndex = displayImages.indexOf(value.imageUrl!);
                                                                if (imgIndex !== -1) {
                                                                    setActiveImageIndex(imgIndex);
                                                                }
                                                            }
                                                        };
                                                        return (
                                                            <div key={value.name} className="flex flex-col items-center gap-1.5">
                                                                <button
                                                                    type="button"
                                                                    onClick={handleColorClick}
                                                                    className={`w-8 h-8 rounded-full transition-all ${
                                                                        isSelected
                                                                            ? "ring-2 ring-offset-2 ring-[#0EA5E9] dark:ring-offset-[#111]"
                                                                            : "ring-2 ring-gray-200 dark:ring-white/10 hover:ring-[#0EA5E9]"
                                                                    } ${hasImage ? "cursor-pointer" : "cursor-default"}`}
                                                                    style={{ backgroundColor: value.colorCode || "#ccc" }}
                                                                    title={value.displayName}
                                                                />
                                                                <span className="text-xs text-gray-500 dark:text-gray-400 font-light">
                                                                    {value.displayName}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="flex flex-wrap gap-2">
                                                    {availableValues.map((value) => (
                                                        <span
                                                            key={value.name}
                                                            className="px-3 py-1.5 rounded-full text-sm font-light bg-[#0EA5E9]/10 text-[#0EA5E9]"
                                                        >
                                                            {value.displayName}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                                                {/* Pricing */}
                        {primaryPricingOption && (
                            <section
                                aria-labelledby="product-pricing-heading"
                                className="rounded-2xl border border-[#0EA5E9]/15 dark:border-[#0EA5E9]/25 bg-linear-to-r from-[#0EA5E9]/10 to-[#F4FAFF] dark:from-[#0EA5E9]/15 dark:to-[#111] p-5"
                            >
                                <div className="flex flex-col gap-1.5">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0EA5E9]">Pricing</p>
                                        <h2 id="product-pricing-heading" className="text-base md:text-lg font-medium text-[#1f2937] dark:text-gray-100 mt-1">
                                            Starting from
                                        </h2>
                                    </div>
                                    <p className="text-2xl md:text-3xl font-semibold text-[#1f2937] dark:text-gray-100 leading-tight">
                                        ₹{formatPriceValue(primaryPricingOption.price) || "___"}
                                        <span className="text-base md:text-lg font-medium text-gray-500 dark:text-gray-400"> / {primaryPricingOption.unit}</span>
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Exact quote on enquiry.
                                    </p>
                                </div>
                            </section>
                        )}


                        {/* Specifications */}
                        {product.specs && product.specs.length > 0 && (
                            <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-white/6">
                                <div className="px-5 py-3.5 bg-gray-50 dark:bg-white/3 border-b border-gray-200 dark:border-white/6">
                                    <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Specifications</h2>
                                </div>
                                <div className="divide-y divide-gray-100 dark:divide-white/5">
                                    {product.specs.map((spec, i) => (
                                        <div
                                            key={i}
                                            className={`flex justify-between items-center px-5 py-3 ${
                                                i % 2 === 1 ? "bg-gray-50/60 dark:bg-white/[0.02]" : ""
                                            }`}
                                        >
                                            <span className="text-[13px] text-gray-500 dark:text-gray-400 font-medium">{spec.label}</span>
                                            <span className="text-[13px] text-[#2C2C2C] dark:text-gray-200 font-semibold text-right max-w-[60%]">{spec.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* CTA Row: Enquire + Share */}
                        <div className="flex gap-3 pt-1">
                            <NavigationLink href={`/enquire?product=${encodeURIComponent(product.name)}`} className="flex-1">
                                <button className="w-full h-14 rounded-2xl font-medium text-base flex items-center justify-center gap-2.5 transition-all duration-200 shadow-lg shadow-[#0EA5E9]/25 bg-linear-to-r from-[#0EA5E9] to-[#0369A1] text-white hover:shadow-xl hover:shadow-[#0EA5E9]/30 hover:scale-[1.02] active:scale-[0.98]">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    Enquire Now
                                </button>
                            </NavigationLink>
                            <button
                                onClick={handleShare}
                                className="h-14 w-14 shrink-0 rounded-2xl bg-gray-100 dark:bg-white/8 hover:bg-[#0EA5E9]/10 text-gray-500 dark:text-gray-400 hover:text-[#0EA5E9] transition-all duration-200 flex items-center justify-center"
                                aria-label="Share product"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                </svg>
                            </button>
                        </div>

                        {/* Trust badges strip */}
                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 dark:border-white/6">
                            <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gray-50/70 dark:bg-white/[0.03]">
                                <div className="w-8 h-8 rounded-full bg-[#0EA5E9]/10 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-[#0EA5E9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p className="text-[11px] font-semibold text-[#2C2C2C] dark:text-gray-200 text-center">ISI Certified</p>
                                <p className="text-[10px] text-gray-400 font-light text-center">Quality Assured</p>
                            </div>
                            {product.guarantee ? (
                                <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gray-50/70 dark:bg-white/[0.03]">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    </div>
                                    <p className="text-[11px] font-semibold text-[#2C2C2C] dark:text-gray-200 text-center">Guarantee</p>
                                    <p className="text-[10px] text-gray-400 font-light text-center">{product.guarantee}</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gray-50/70 dark:bg-white/[0.03]">
                                    <div className="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <p className="text-[11px] font-semibold text-[#2C2C2C] dark:text-gray-200 text-center">Fast Supply</p>
                                    <p className="text-[10px] text-gray-400 font-light text-center">Quick Delivery</p>
                                </div>
                            )}
                            <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gray-50/70 dark:bg-white/[0.03]">
                                <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </div>
                                <p className="text-[11px] font-semibold text-[#2C2C2C] dark:text-gray-200 text-center">Trusted Brand</p>
                                <p className="text-[10px] text-gray-400 font-light text-center">Since Inception</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div
                        className="mt-16"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-light text-[#2C2C2C] dark:text-gray-100 mb-2">
                                    Explore more on {categoryName}
                                </h2>
                            </div>
                            <NavigationLink
                                href={`/categories/${categorySlug}`}
                                className="hidden md:flex items-center gap-2 text-sm text-[#0EA5E9] hover:text-[#0369A1] transition-colors font-medium"
                            >
                                View All
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </NavigationLink>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                            {relatedProducts.map((relatedProduct, index) => (
                                <RelatedProductCard key={relatedProduct.id} product={relatedProduct} index={index} categoryId={categoryId} />
                            ))}
                        </div>
                        {/* Mobile View All Button */}
                        <div className="md:hidden mt-6 text-center">
                            <NavigationLink
                                href={`/categories/${categorySlug}`}
                                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full hover:border-[#0EA5E9] hover:text-[#0EA5E9] transition-colors"
                            >
                                Explore All {categoryName}
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </NavigationLink>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
