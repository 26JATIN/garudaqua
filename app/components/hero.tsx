"use client";
import React, { useState, useEffect, useCallback } from "react";
import Image from 'next/image';

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
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [slides.length, isPaused]);

    const goToSlide = (index: number) => {
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
            {/* ── Image layers ──────────────────────────────────────────────────────
                All slides are ALWAYS in the DOM.
                Slide 0 gets priority + no will-change (already the LCP element,
                promoting it before paint would delay it).
                Slides 1-N get will-change:opacity only after hydration so they
                are ready for the first transition without impacting LCP.
            ─────────────────────────────────────────────────────────────────────── */}
            <div className="absolute inset-0">
                {slides.map((slide, index) => (
                    <div
                        key={slide.id}
                        className="hero-slide"
                        aria-hidden={index !== currentSlide}
                        style={{
                            opacity: index === currentSlide ? 1 : 0,
                            // Defer GPU layer promotion for non-LCP slides so the
                            // compositor does not compete with the LCP image decode.
                            willChange: index === 0 ? 'auto' : 'opacity',
                        }}
                    >
                        <Image
                            src={slide.image}
                            alt={slide.title || "Garud Aqua"}
                            fill
                            // Only slide 0 is LCP — mark it priority; rest are lazy
                            priority={index === 0}
                            fetchPriority={index === 0 ? 'high' : 'low'}
                            loading={index === 0 ? 'eager' : 'lazy'}
                            className={`object-cover object-top ${slide.mobileImage ? 'hidden sm:block' : ''}`}
                            quality={50}
                            sizes={slide.mobileImage
                                ? "(max-width: 640px) 1px, 100vw"
                                : "100vw"}
                        />
                        {slide.mobileImage && (
                            <Image
                                src={slide.mobileImage}
                                alt={slide.title || "Garud Aqua"}
                                fill
                                priority={index === 0}
                                fetchPriority={index === 0 ? 'high' : 'low'}
                                loading={index === 0 ? 'eager' : 'lazy'}
                                className="sm:hidden object-cover object-center"
                                quality={50}
                                sizes="(min-width: 641px) 1px, 100vw"
                            />
                        )}
                    </div>
                ))}
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
                                {index === currentSlide ? (
                                    <div
                                        className="absolute inset-0 rounded-full bg-white"
                                        style={{
                                            transformOrigin: "left",
                                            animation: `hero-progress ${isPaused ? 8 : 6}s linear forwards`,
                                        }}
                                    />
                                ) : null}
                            </div>
                        </button>
                    ))}
                </div>
            )}

            <style>{`
                .hero-slide {
                    position: absolute;
                    inset: 0;
                    transition: opacity 1.4s ease-in-out;
                    backface-visibility: hidden;
                    -webkit-backface-visibility: hidden;
                }
                @keyframes hero-progress {
                    from { transform: scaleX(0); }
                    to   { transform: scaleX(1); }
                }
            `}</style>
        </div>
    );
}
