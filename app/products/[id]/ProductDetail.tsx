"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ===== Type Definitions =====
interface VariantOptionValue {
    name: string;
    displayName: string;
    colorCode: string | null;
    isAvailable: boolean;
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
    category: { id: string; name: string } | string;
    subcategory?: { id: string; name: string };
    specs?: { label: string; value: string }[];
    hasVariants?: boolean;
    variantOptions?: VariantOption[];
    variants?: unknown[];
    guarantee?: string;
    createdAt?: string;
}

// Helper to get category name from Product (handles both string and object formats)
function getCategoryName(category: Product["category"]): string {
    if (typeof category === "string") return category;
    return category?.name || "";
}


// Mobile swipeable image gallery
function MobileImageGallery({ images, productName }: { images: string[]; productName: string }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [dragOffset, setDragOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const touchStartRef = useRef({ x: 0, y: 0, time: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const isHorizontalSwipeRef = useRef<boolean | null>(null);

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
            if (activeIndex < images.length - 1) setActiveIndex((prev) => prev + 1);
        } else if (dragOffset > threshold || (dragOffset > 30 && velocity > 0.3)) {
            if (activeIndex > 0) setActiveIndex((prev) => prev - 1);
        }
        setDragOffset(0);
        isHorizontalSwipeRef.current = null;
    }, [isDragging, dragOffset, activeIndex, images.length]);

    return (
        <div className="relative">
            <div
                ref={containerRef}
                className="overflow-hidden rounded-3xl shadow-lg dark:shadow-none dark:border dark:border-white/6"
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
                                    alt={`${productName} ${index + 1}`}
                                    fill
                                    className="object-cover"
                                    priority={index === 0}
                                    sizes="100vw"
                                    quality={80}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Dot indicators */}
            {images.length > 1 && (
                <div className="flex justify-center gap-2 mt-3">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveIndex(index)}
                            className={`rounded-full transition-all duration-300 ${
                                activeIndex === index
                                    ? "w-6 h-2 bg-[#0EA5E9]"
                                    : "w-2 h-2 bg-gray-300 dark:bg-gray-600"
                            }`}
                            aria-label={`View image ${index + 1}`}
                        />
                    ))}
                </div>
            )}

            {/* Image counter */}
            {images.length > 1 && (
                <div className="absolute bottom-4 right-5 bg-black/50 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full z-20">
                    {activeIndex + 1} / {images.length}
                </div>
            )}
        </div>
    );
}

// Loading skeleton UI
function ProductDetailSkeleton() {
    return (
        <div className="min-h-screen bg-linear-to-b from-white via-[#FAFAFA] to-white dark:from-black dark:via-[#050505] dark:to-[#0A0A0A] pt-4 md:pt-6 lg:pt-8 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
function RelatedProductCard({ product: relatedProduct, index, categoryId }: { product: Product; index: number; categoryId: string }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <Link href={`/products/${relatedProduct.id}`}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="relative group cursor-pointer p-2 rounded-2xl md:rounded-3xl"
            >
                {/* Hover spotlight background */}
                <AnimatePresence>
                    {isHovered && (
                        <motion.span
                            className="absolute inset-0 h-full w-full bg-neutral-100 dark:bg-slate-800/70 block rounded-2xl md:rounded-3xl"
                            layoutId={`relatedHoverBg-${relatedProduct.id}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1, transition: { duration: 0.15 } }}
                            exit={{ opacity: 0, transition: { duration: 0.15, delay: 0.1 } }}
                        />
                    )}
                </AnimatePresence>

                {/* Card content */}
                <div className={cn(
                    "relative z-10 bg-white dark:bg-[#0A0A0A] rounded-xl md:rounded-2xl shadow-sm overflow-hidden border border-gray-100 dark:border-white/6 transition-shadow duration-300",
                    isHovered && "shadow-xl"
                )}>
                    <div className="aspect-square relative overflow-hidden bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                        {relatedProduct.image ? (
                            <Image
                                src={relatedProduct.image}
                                alt={relatedProduct.name}
                                fill
                                className={cn(
                                    "object-cover transition-transform duration-700",
                                    isHovered && "scale-110"
                                )}
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
                            "absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 flex items-end justify-center pb-4",
                            isHovered ? "opacity-100" : "opacity-0"
                        )}>
                            <span className="text-white text-sm font-medium">View Details</span>
                        </div>
                    </div>
                    <div className="p-3 md:p-4">
                        <h3 className={cn(
                            "text-sm md:text-base font-light text-[#2C2C2C] dark:text-gray-200 mb-1 md:mb-2 line-clamp-2 transition-colors leading-tight",
                            isHovered && "text-[#0EA5E9]"
                        )}>
                            {relatedProduct.name}
                        </h3>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}

// ===== Main Component =====
export default function ProductDetail({ productId }: { productId: string }) {
    const router = useRouter();
    const [selectedImage, setSelectedImage] = useState(0);
    const [product, setProduct] = useState<Product | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    // Fetch product data
    useEffect(() => {
        async function fetchProduct() {
            setLoading(true);
            setNotFound(false);
            setSelectedImage(0);

            try {
                const res = await fetch(`/api/products/${productId}`);
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
    }, [productId]);

    const handleShare = async () => {
        const url = window.location.href;
        const title = product?.name || "Check out this product";
        const text = `${product?.name} - Garud Aqua Solutions\n${url}`;

        if (navigator.share) {
            try {
                await navigator.share({ title, text, url });
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
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
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
                        <Link href="/products">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-6 py-3 bg-[#0EA5E9] text-white rounded-full hover:bg-[#0369A1] transition-colors font-light shadow-lg"
                            >
                                Browse Products
                            </motion.button>
                        </Link>
                    </motion.div>
                </div>
            </div>
        );
    }

    const categoryName = getCategoryName(product.category);
    const categoryId = typeof product.category === "object" ? product.category.id : "";
    const displayImages = product.images && product.images.length > 0 ? product.images : product.image ? [product.image] : [];

    return (
        <div className="min-h-screen bg-linear-to-b from-white via-[#FAFAFA] to-white dark:from-black dark:via-[#050505] dark:to-[#0A0A0A] pt-4 md:pt-6 lg:pt-8 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb */}
                <motion.nav
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-8"
                >
                    <Link href="/" className="hover:text-[#0EA5E9] transition-colors">Home</Link>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <Link href="/products" className="hover:text-[#0EA5E9] transition-colors">Products</Link>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-[#2C2C2C] dark:text-gray-200 font-light line-clamp-1">{product.name}</span>
                </motion.nav>

                {/* Product Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
                    {/* Images Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-4"
                    >
                        {/* Mobile Swipeable Gallery */}
                        {displayImages.length > 0 && (
                            <div className="lg:hidden">
                                <MobileImageGallery images={displayImages} productName={product.name} />
                            </div>
                        )}

                        {/* Desktop Main Image */}
                        <div className="hidden lg:block bg-white dark:bg-[#0A0A0A] rounded-3xl shadow-lg dark:shadow-none dark:border dark:border-white/6 overflow-hidden">
                            <div className="aspect-square relative">
                                {displayImages.length > 0 ? (
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={selectedImage}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="w-full h-full"
                                        >
                                            <Image
                                                src={displayImages[selectedImage] || displayImages[0]}
                                                alt={product.name}
                                                fill
                                                className="object-cover"
                                                priority
                                                sizes="50vw"
                                                quality={85}
                                            />
                                        </motion.div>
                                    </AnimatePresence>
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                                        <svg className="w-20 h-20 text-[#0EA5E9] opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Desktop Thumbnail Images */}
                        {displayImages.length > 1 && (
                            <div className="hidden lg:grid grid-cols-4 gap-4">
                                {displayImages.map((img, index) => (
                                    <motion.button
                                        key={index}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setSelectedImage(index)}
                                        className={`aspect-square rounded-2xl overflow-hidden transition-all ${
                                            selectedImage === index
                                                ? "ring-4 ring-[#0EA5E9] shadow-lg"
                                                : "ring-2 ring-gray-200 dark:ring-white/6 hover:ring-[#0EA5E9]/50"
                                        }`}
                                    >
                                        <Image
                                            src={img}
                                            alt={`${product.name} ${index + 1}`}
                                            width={200}
                                            height={200}
                                            className="object-cover w-full h-full"
                                            quality={60}
                                        />
                                    </motion.button>
                                ))}
                            </div>
                        )}

                        {/* No-image fallback for mobile */}
                        {displayImages.length === 0 && (
                            <div className="lg:hidden aspect-square rounded-3xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                <svg className="w-20 h-20 text-[#0EA5E9] opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                        )}
                    </motion.div>

                    {/* Product Info Section */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-6"
                    >
                        {/* Category & Share */}
                        <div className="flex items-center justify-between">
                            <div className="inline-flex items-center gap-2">
                                <span className="bg-[#0EA5E9]/10 text-[#0EA5E9] text-sm font-medium px-4 py-2 rounded-full">
                                    {categoryName}
                                </span>
                                {product.subcategory?.name && (
                                    <span className="bg-[#0369A1]/10 text-[#0369A1] text-sm font-medium px-4 py-2 rounded-full">
                                        {product.subcategory.name}
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={handleShare}
                                className="p-2.5 rounded-xl bg-gray-100 dark:bg-white/8 hover:bg-[#0EA5E9]/15 text-gray-600 dark:text-gray-400 hover:text-[#0EA5E9] transition-all duration-200"
                                aria-label="Share product"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                </svg>
                            </button>
                        </div>

                        {/* Product Name */}
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-light text-[#2C2C2C] dark:text-gray-100 leading-tight">
                            {product.name}
                        </h1>

                        {/* Description */}
                        {product.description && (
                            <div>
                                <h3 className="text-lg font-light text-[#2C2C2C] dark:text-gray-100 mb-3">Description</h3>
                                <p className="text-gray-600 dark:text-gray-400 font-light leading-relaxed">
                                    {product.description}
                                </p>
                            </div>
                        )}

                        {/* Available Options */}
                        {product.hasVariants && product.variantOptions && product.variantOptions.length > 0 && (
                            <div className="bg-linear-to-br from-[#FAFAFA] to-white dark:from-[#0A0A0A] dark:to-[#111] rounded-2xl p-6 space-y-5 border border-gray-200 dark:border-white/6">
                                <h3 className="text-lg font-light text-[#2C2C2C] dark:text-gray-100">Available Options</h3>
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
                                                    {availableValues.map((value) => (
                                                        <div key={value.name} className="flex flex-col items-center gap-1.5">
                                                            <div
                                                                className="w-8 h-8 rounded-full ring-2 ring-gray-200 dark:ring-white/10 hover:ring-[#0EA5E9] transition-all cursor-default"
                                                                style={{ backgroundColor: value.colorCode || "#ccc" }}
                                                                title={value.displayName}
                                                            />
                                                            <span className="text-xs text-gray-500 dark:text-gray-400 font-light">
                                                                {value.displayName}
                                                            </span>
                                                        </div>
                                                    ))}
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

                        {/* Specifications */}
                        {product.specs && product.specs.length > 0 && (
                            <div className="bg-linear-to-br from-[#FAFAFA] to-white dark:from-[#0A0A0A] dark:to-[#111] rounded-2xl p-6 space-y-3 border border-gray-200 dark:border-white/6">
                                <h3 className="text-lg font-light text-[#2C2C2C] dark:text-gray-100 mb-4">Specifications</h3>
                                {product.specs.map((spec, i) => (
                                    <div key={i} className="flex justify-between items-center">
                                        <span className="text-gray-600 dark:text-gray-400 font-light">{spec.label}:</span>
                                        <span className="text-[#2C2C2C] dark:text-gray-200 font-medium">{spec.value}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Enquire Button */}
                        <Link href={`/enquire?product=${encodeURIComponent(product.name)}`}>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full py-4 px-8 rounded-full font-light text-lg flex items-center justify-center gap-3 transition-all shadow-lg bg-linear-to-r from-[#0EA5E9] to-[#0369A1] text-white hover:shadow-xl"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Enquire Now
                            </motion.button>
                        </Link>

                        {/* Features */}
                        <div className={`grid grid-cols-2 gap-3 pt-6 ${product.guarantee ? "sm:grid-cols-3" : ""}`}>
                            <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-full bg-[#0EA5E9]/10 flex items-center justify-center shrink-0">
                                    <svg className="w-5 h-5 text-[#0EA5E9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs sm:text-sm font-medium text-[#2C2C2C] dark:text-gray-200">ISI Certified</p>
                                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-light">Quality Assured</p>
                                </div>
                            </div>
                            {product.guarantee && (
                                <div className="flex items-center gap-2.5">
                                    <div className="w-10 h-10 rounded-full bg-[#0EA5E9]/10 flex items-center justify-center shrink-0">
                                        <svg className="w-5 h-5 text-[#0EA5E9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs sm:text-sm font-medium text-[#2C2C2C] dark:text-gray-200">Guarantee</p>
                                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-light">{product.guarantee}</p>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-full bg-[#0EA5E9]/10 flex items-center justify-center shrink-0">
                                    <svg className="w-5 h-5 text-[#0EA5E9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs sm:text-sm font-medium text-[#2C2C2C] dark:text-gray-200">Trusted Brand</p>
                                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-light">A Bond of Trust</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="mt-16"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-light text-[#2C2C2C] dark:text-gray-100 mb-2">
                                    Similar Products
                                </h2>
                                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 font-light">
                                    More from {categoryName}
                                </p>
                            </div>
                            <Link
                                href={`/products?category=${categoryId}`}
                                className="hidden md:flex items-center gap-2 text-sm text-[#0EA5E9] hover:text-[#0369A1] transition-colors font-medium"
                            >
                                View All
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                            {relatedProducts.map((relatedProduct, index) => (
                                <RelatedProductCard key={relatedProduct.id} product={relatedProduct} index={index} categoryId={categoryId} />
                            ))}
                        </div>
                        {/* Mobile View All Button */}
                        <div className="md:hidden mt-6 text-center">
                            <Link
                                href={`/products?category=${categoryId}`}
                                className="inline-flex items-center gap-2 text-sm text-[#0EA5E9] hover:text-[#0369A1] transition-colors font-medium"
                            >
                                View All Similar Products
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
