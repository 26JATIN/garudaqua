"use client";
import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

// ===== Type Definitions =====
interface Product {
    _id: string;
    name: string;
    image?: string;
    images?: string[];
    description?: string;
    price: number;
    category: string;
    subcategory?: { _id: string; name: string };
    specs?: { label: string; value: string }[];
    createdAt?: string;
}

// ===== STATIC DATA (same as ProductsPage) =====
const staticProducts: Product[] = [
    {
        _id: "p1", name: "500L Overhead Water Tank", image: "/products/tank-500l.png",
        price: 3500, category: "Water Tanks", subcategory: { _id: "sub1", name: "Overhead Tanks" },
        description: "Durable 500-litre overhead water tank made from food-grade, UV-stabilised plastic. Designed for long life with excellent insulation properties. Ideal for residential use.",
        specs: [{ label: "Capacity", value: "500 Litres" }, { label: "Material", value: "Food-grade LLDPE" }, { label: "Colour", value: "Black / White" }, { label: "Warranty", value: "5 Years" }],
        createdAt: "2025-01-15",
    },
    {
        _id: "p2", name: "1000L Overhead Water Tank", image: "/products/tank-1000l.png",
        price: 6500, category: "Water Tanks", subcategory: { _id: "sub1", name: "Overhead Tanks" },
        description: "High-capacity 1000-litre overhead water tank built with multi-layer technology for superior strength. Perfect for families and small commercial setups.",
        specs: [{ label: "Capacity", value: "1000 Litres" }, { label: "Material", value: "Food-grade LLDPE" }, { label: "Colour", value: "Black / White" }, { label: "Warranty", value: "5 Years" }],
        createdAt: "2025-02-10",
    },
    {
        _id: "p3", name: "2000L Overhead Water Tank", image: "/products/tank-2000l.png",
        price: 11000, category: "Water Tanks", subcategory: { _id: "sub1", name: "Overhead Tanks" },
        description: "Premium 2000-litre overhead water tank with triple-layer protection against UV rays and algae. Suitable for large households and commercial applications.",
        specs: [{ label: "Capacity", value: "2000 Litres" }, { label: "Material", value: "Triple-layer LLDPE" }, { label: "Colour", value: "Black" }, { label: "Warranty", value: "5 Years" }],
        createdAt: "2025-03-05",
    },
    {
        _id: "p4", name: "3000L Underground Tank", image: "/products/tank-underground-3000l.png",
        price: 18000, category: "Water Tanks", subcategory: { _id: "sub2", name: "Underground Tanks" },
        description: "Heavy-duty 3000-litre underground water storage tank. Engineered for high compressive strength to withstand soil pressure. Leak-proof and crack-resistant.",
        specs: [{ label: "Capacity", value: "3000 Litres" }, { label: "Material", value: "High-density PE" }, { label: "Type", value: "Underground" }, { label: "Warranty", value: "7 Years" }],
        createdAt: "2025-01-20",
    },
    {
        _id: "p5", name: "5000L Underground Tank", image: "/products/tank-underground-5000l.png",
        price: 28000, category: "Water Tanks", subcategory: { _id: "sub2", name: "Underground Tanks" },
        description: "Large-capacity 5000-litre underground storage tank for commercial and institutional use. Seamless construction ensures zero leakage.",
        specs: [{ label: "Capacity", value: "5000 Litres" }, { label: "Material", value: "High-density PE" }, { label: "Type", value: "Underground" }, { label: "Warranty", value: "7 Years" }],
        createdAt: "2025-02-25",
    },
    {
        _id: "p6", name: "300L Loft Tank", image: "/products/tank-loft-300l.png",
        price: 2200, category: "Water Tanks", subcategory: { _id: "sub3", name: "Loft Tanks" },
        description: "Compact 300-litre loft tank designed for tight spaces. Lightweight yet sturdy, easy to install in lofts and elevated platforms.",
        specs: [{ label: "Capacity", value: "300 Litres" }, { label: "Material", value: "Food-grade LLDPE" }, { label: "Type", value: "Loft / Compact" }, { label: "Warranty", value: "5 Years" }],
        createdAt: "2025-03-12",
    },
    {
        _id: "p7", name: "750L Overhead Water Tank", image: "/products/tank-750l.png",
        price: 4800, category: "Water Tanks", subcategory: { _id: "sub1", name: "Overhead Tanks" },
        description: "Mid-range 750-litre overhead tank offering the perfect balance of capacity and space. Multi-layer construction for durability.",
        specs: [{ label: "Capacity", value: "750 Litres" }, { label: "Material", value: "Food-grade LLDPE" }, { label: "Colour", value: "Black / White" }, { label: "Warranty", value: "5 Years" }],
        createdAt: "2025-04-01",
    },
    {
        _id: "p8", name: "1500L Underground Tank", image: "/products/tank-underground-1500l.png",
        price: 13500, category: "Water Tanks", subcategory: { _id: "sub2", name: "Underground Tanks" },
        description: "Robust 1500-litre underground water tank with reinforced walls. Ideal for residential rainwater harvesting and storage.",
        specs: [{ label: "Capacity", value: "1500 Litres" }, { label: "Material", value: "High-density PE" }, { label: "Type", value: "Underground" }, { label: "Warranty", value: "7 Years" }],
        createdAt: "2025-04-10",
    },
    {
        _id: "p9", name: "500L Loft Tank", image: "/products/tank-loft-500l.png",
        price: 3200, category: "Water Tanks", subcategory: { _id: "sub3", name: "Loft Tanks" },
        description: "Versatile 500-litre loft tank with slim profile. Fits in compact loft spaces while providing ample water storage.",
        specs: [{ label: "Capacity", value: "500 Litres" }, { label: "Material", value: "Food-grade LLDPE" }, { label: "Type", value: "Loft / Compact" }, { label: "Warranty", value: "5 Years" }],
        createdAt: "2025-04-15",
    },
    {
        _id: "p10", name: "1 Inch PVC Pipe (10ft)", image: "/products/pvc-pipe-1inch.png",
        price: 180, category: "Pipes & Fittings", subcategory: { _id: "sub4", name: "PVC Pipes" },
        description: "Standard 1-inch PVC pipe, 10 feet length. Suitable for cold water supply lines. Smooth interior for optimal water flow.",
        specs: [{ label: "Diameter", value: "1 Inch (25mm)" }, { label: "Length", value: "10 ft (3m)" }, { label: "Material", value: "uPVC" }, { label: "Pressure Rating", value: "6 kg/cm²" }],
        createdAt: "2025-01-25",
    },
    {
        _id: "p11", name: "2 Inch PVC Pipe (10ft)", image: "/products/pvc-pipe-2inch.png",
        price: 350, category: "Pipes & Fittings", subcategory: { _id: "sub4", name: "PVC Pipes" },
        description: "Heavy-duty 2-inch PVC pipe for main water supply and drainage. Corrosion-resistant and long-lasting.",
        specs: [{ label: "Diameter", value: "2 Inch (50mm)" }, { label: "Length", value: "10 ft (3m)" }, { label: "Material", value: "uPVC" }, { label: "Pressure Rating", value: "6 kg/cm²" }],
        createdAt: "2025-02-05",
    },
    {
        _id: "p12", name: "3 Inch PVC Pipe (10ft)", image: "/products/pvc-pipe-3inch.png",
        price: 520, category: "Pipes & Fittings", subcategory: { _id: "sub4", name: "PVC Pipes" },
        description: "Large 3-inch PVC pipe for commercial plumbing and agricultural applications. Impact-resistant and easy to install.",
        specs: [{ label: "Diameter", value: "3 Inch (75mm)" }, { label: "Length", value: "10 ft (3m)" }, { label: "Material", value: "uPVC" }, { label: "Pressure Rating", value: "6 kg/cm²" }],
        createdAt: "2025-02-20",
    },
    {
        _id: "p13", name: "1/2 Inch CPVC Pipe (10ft)", image: "/products/cpvc-pipe-half.png",
        price: 280, category: "Pipes & Fittings", subcategory: { _id: "sub5", name: "CPVC Pipes" },
        description: "Premium 1/2-inch CPVC pipe rated for hot and cold water supply. Withstands temperatures up to 93°C. Ideal for residential plumbing.",
        specs: [{ label: "Diameter", value: "1/2 Inch (15mm)" }, { label: "Length", value: "10 ft (3m)" }, { label: "Material", value: "CPVC" }, { label: "Max Temp", value: "93°C" }],
        createdAt: "2025-03-08",
    },
    {
        _id: "p14", name: "3/4 Inch CPVC Pipe (10ft)", image: "/products/cpvc-pipe-3quarter.png",
        price: 380, category: "Pipes & Fittings", subcategory: { _id: "sub5", name: "CPVC Pipes" },
        description: "Reliable 3/4-inch CPVC pipe for hot and cold water distribution. Chemical-resistant and suitable for high-pressure applications.",
        specs: [{ label: "Diameter", value: "3/4 Inch (20mm)" }, { label: "Length", value: "10 ft (3m)" }, { label: "Material", value: "CPVC" }, { label: "Max Temp", value: "93°C" }],
        createdAt: "2025-03-20",
    },
    {
        _id: "p15", name: "1 Inch CPVC Pipe (10ft)", image: "/products/cpvc-pipe-1inch.png",
        price: 450, category: "Pipes & Fittings", subcategory: { _id: "sub5", name: "CPVC Pipes" },
        description: "Professional-grade 1-inch CPVC pipe for main hot water supply lines. Excellent flow capacity and thermal resistance.",
        specs: [{ label: "Diameter", value: "1 Inch (25mm)" }, { label: "Length", value: "10 ft (3m)" }, { label: "Material", value: "CPVC" }, { label: "Max Temp", value: "93°C" }],
        createdAt: "2025-04-05",
    },
];
// ===== END STATIC DATA =====

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

// ===== Main Component =====
export default function ProductDetail({ productId }: { productId: string }) {
    const router = useRouter();
    const [selectedImage, setSelectedImage] = useState(0);

    const product = staticProducts.find((p) => p._id === productId);

    // Related products from same category, excluding current
    const relatedProducts = product
        ? staticProducts.filter((p) => p.category === product.category && p._id !== product._id).slice(0, 4)
        : [];

    const handleShare = async () => {
        const url = window.location.href;
        const title = product?.name || "Check out this product";
        const text = `${product?.name} - Garud Aqua Solutions${product?.price ? `\n₹${product.price.toLocaleString("en-IN")}` : ""}\n${url}`;

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

    // Product not found
    if (!product) {
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
                                    {product.category}
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

                        {/* Price */}
                        <div className="py-4 border-y border-gray-200 dark:border-white/6">
                            <span className="text-4xl font-light text-[#2C2C2C] dark:text-gray-100">
                                ₹{product.price.toLocaleString("en-IN")}
                            </span>
                        </div>

                        {/* Description */}
                        {product.description && (
                            <div>
                                <h3 className="text-lg font-light text-[#2C2C2C] dark:text-gray-100 mb-3">Description</h3>
                                <p className="text-gray-600 dark:text-gray-400 font-light leading-relaxed">
                                    {product.description}
                                </p>
                            </div>
                        )}

                        {/* Specifications */}
                        {product.specs && product.specs.length > 0 && (
                            <div className="bg-linear-to-br from-[#FAFAFA] to-white dark:from-[#0A0A0A] dark:to-[#111] rounded-2xl p-6 space-y-3 dark:border dark:border-white/6">
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
                        <Link href="/contact">
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

                        {/* Call Button */}
                        <a href="tel:+919876543210">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full py-4 px-8 rounded-full font-light text-lg flex items-center justify-center gap-3 transition-all border-2 border-[#0EA5E9] text-[#0EA5E9] hover:bg-[#0EA5E9]/5"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                Call Us
                            </motion.button>
                        </a>

                        {/* Features */}
                        <div className="grid grid-cols-2 gap-4 pt-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-[#0EA5E9]/10 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-[#0EA5E9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-[#2C2C2C] dark:text-gray-200">ISI Certified</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-light">Quality Assured</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-[#0EA5E9]/10 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-[#0EA5E9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-[#2C2C2C] dark:text-gray-200">Warranty</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-light">Up to 7 Years</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-[#0EA5E9]/10 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-[#0EA5E9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-[#2C2C2C] dark:text-gray-200">Free Delivery</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-light">On All Orders</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-[#0EA5E9]/10 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-[#0EA5E9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-[#2C2C2C] dark:text-gray-200">Trusted Brand</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-light">A Bond of Trust</p>
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
                                    More from {product.subcategory?.name || product.category}
                                </p>
                            </div>
                            <Link
                                href={`/products?category=${encodeURIComponent(product.category)}`}
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
                                <Link key={relatedProduct._id} href={`/products/${relatedProduct._id}`}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                        whileHover={{ y: -8 }}
                                        className="group cursor-pointer"
                                    >
                                        <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl md:rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden border border-gray-100 dark:border-white/6">
                                            <div className="aspect-square relative overflow-hidden bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                                                {relatedProduct.image ? (
                                                    <Image
                                                        src={relatedProduct.image}
                                                        alt={relatedProduct.name}
                                                        fill
                                                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                                                    />
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <svg className="w-12 h-12 text-[#0EA5E9] opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                        </svg>
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                                                    <span className="text-white text-sm font-medium">View Details</span>
                                                </div>
                                            </div>
                                            <div className="p-3 md:p-4">
                                                <h3 className="text-sm md:text-base font-light text-[#2C2C2C] dark:text-gray-200 mb-1 md:mb-2 line-clamp-2 group-hover:text-[#0EA5E9] transition-colors leading-tight">
                                                    {relatedProduct.name}
                                                </h3>
                                                <p className="text-base md:text-lg font-medium text-[#2C2C2C] dark:text-gray-100">
                                                    ₹{relatedProduct.price.toLocaleString("en-IN")}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                </Link>
                            ))}
                        </div>
                        {/* Mobile View All Button */}
                        <div className="md:hidden mt-6 text-center">
                            <Link
                                href={`/products?category=${encodeURIComponent(product.category)}`}
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
