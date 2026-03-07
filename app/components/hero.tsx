"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface HeroSlide {
    id: string;
    image: string;
    mobileImage: string;
    title: string;
    order: number;
    isActive: boolean;
}

interface HeroProps {
    initialSlides?: HeroSlide[];
}

export default function Hero({ initialSlides }: HeroProps) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [slides, setSlides] = useState<HeroSlide[]>(initialSlides || []);
    const [loading, setLoading] = useState(!initialSlides || initialSlides.length === 0);
    const [isPaused, setIsPaused] = useState(false);
    // Track if user has navigated away from the first slide
    const [hasTransitioned, setHasTransitioned] = useState(false);

    const fetchSlides = useCallback(async () => {
        try {
            const res = await fetch("/api/hero-slides");
            if (!res.ok) throw new Error("Failed to fetch slides");
            const data: HeroSlide[] = await res.json();
            setSlides(data);
        } catch {
            // API failed
        } finally {
            setLoading(false);
        }
    }, []);

    // Only fetch client-side if no initial slides were provided
    useEffect(() => {
        if (!initialSlides || initialSlides.length === 0) {
            fetchSlides();
        }
    }, [fetchSlides, initialSlides]);

    // Auto-advance slides
    useEffect(() => {
        if (slides.length <= 1 || isPaused) return;
        const timer = setInterval(() => {
            setHasTransitioned(true);
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [slides.length, isPaused]);

    const goToSlide = (index: number) => {
        setHasTransitioned(true);
        setCurrentSlide(index);
        setIsPaused(true);
        setTimeout(() => setIsPaused(false), 8000);
    };

    if (loading) {
        return (
            <div className="relative w-full h-[80vh] sm:h-[70vh] md:h-[70vh] lg:h-screen overflow-hidden bg-black">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    if (slides.length === 0) return null;

    return (
        <div
            className="relative w-full h-[80vh] sm:h-[70vh] md:h-[70vh] lg:h-screen overflow-hidden bg-black"
        >
            {/* Image Slideshow */}
            <div className="absolute inset-0">
                {!hasTransitioned ? (
                    /* First slide — render as plain HTML for instant SSR paint (no framer-motion needed) */
                    <div className="absolute inset-0" style={{ animation: 'hero-zoom 8s linear forwards' }}>
                        {/* Desktop Image */}
                        <Image
                            src={slides[0].image}
                            alt={slides[0].title || "Garud Aqua"}
                            fill
                            className={`object-cover object-top ${slides[0].mobileImage ? 'hidden sm:block' : ''}`}
                            loading="eager"
                            fetchPriority="high"
                            quality={50}
                            sizes={slides[0].mobileImage
                                ? "(max-width: 640px) 1px, 100vw"
                                : "100vw"}
                        />
                        {/* Mobile Image */}
                        {slides[0].mobileImage && (
                            <Image
                                src={slides[0].mobileImage}
                                alt={slides[0].title || "Garud Aqua"}
                                fill
                                className="sm:hidden object-cover object-center"
                                loading="eager"
                                fetchPriority="high"
                                quality={50}
                                sizes="(min-width: 641px) 1px, 100vw"
                            />
                        )}
                    </div>
                ) : (
                    /* After first transition — use framer-motion for crossfade */
                    <AnimatePresence mode="sync">
                        <motion.div
                            key={currentSlide}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{
                                opacity: { duration: 1.5, ease: [0.4, 0, 0.2, 1] },
                            }}
                            className="absolute inset-0"
                        >
                            {/* Ken Burns zoom effect */}
                            <motion.div
                                className="absolute inset-0"
                                initial={{ scale: 1.0 }}
                                animate={{ scale: 1.08 }}
                                transition={{
                                    duration: 8,
                                    ease: "linear",
                                }}
                            >
                                {/* Desktop Image */}
                                <Image
                                    src={slides[currentSlide].image}
                                    alt={slides[currentSlide].title || "Garud Aqua"}
                                    fill
                                    className={`object-cover object-top ${slides[currentSlide].mobileImage ? 'hidden sm:block' : ''}`}
                                    quality={50}
                                    sizes={slides[currentSlide].mobileImage
                                        ? "(max-width: 640px) 1px, 100vw"
                                        : "100vw"}
                                />
                                {/* Mobile Image */}
                                {slides[currentSlide].mobileImage && (
                                    <Image
                                        src={slides[currentSlide].mobileImage}
                                        alt={slides[currentSlide].title || "Garud Aqua"}
                                        fill
                                        className="sm:hidden object-cover object-center"
                                        quality={50}
                                        sizes="(min-width: 641px) 1px, 100vw"
                                    />
                                )}
                            </motion.div>
                        </motion.div>
                    </AnimatePresence>
                )}
            </div>

            {/* Bottom gradient for indicators visibility */}
            {slides.length > 1 && (
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-black/40 to-transparent pointer-events-none" />
            )}

            {/* Slide Indicators */}
            {slides.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2.5">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className="group relative p-1"
                            aria-label={`Go to slide ${index + 1}`}
                        >
                            <div className="relative h-1 overflow-hidden rounded-full transition-all duration-500"
                                style={{ width: index === currentSlide ? 32 : 8 }}
                            >
                                {/* Background track */}
                                <div className="absolute inset-0 rounded-full bg-white/40" />

                                {/* Active fill with progress animation */}
                                {index === currentSlide && !hasTransitioned ? (
                                    <div
                                        className="absolute inset-0 rounded-full bg-white"
                                        style={{
                                            transformOrigin: "left",
                                            animation: `hero-progress ${isPaused ? 8 : 6}s linear forwards`,
                                        }}
                                    />
                                ) : index === currentSlide ? (
                                    <motion.div
                                        className="absolute inset-0 rounded-full bg-white"
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: 1 }}
                                        transition={{
                                            duration: isPaused ? 8 : 6,
                                            ease: "linear",
                                        }}
                                        style={{ transformOrigin: "left" }}
                                    />
                                ) : null}
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* CSS animations for first slide (no JS needed) */}
            <style>{`
                @keyframes hero-zoom {
                    from { transform: scale(1); }
                    to { transform: scale(1.08); }
                }
                @keyframes hero-progress {
                    from { transform: scaleX(0); }
                    to { transform: scaleX(1); }
                }
            `}</style>
        </div>
    );
}
