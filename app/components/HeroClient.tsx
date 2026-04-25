"use client";
import React, { useState, useEffect, useCallback } from "react";
import Image, { getImageProps } from 'next/image';

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

const SlideImage = ({ slide, index }: { slide: HeroSlide; index: number }) => {
    const common = {
        style: { width: '100%', height: 'auto' } as const,
        priority: index === 0,
        fetchPriority: index === 0 ? 'high' as const : 'low' as const,
        loading: index === 0 ? 'eager' as const : 'lazy' as const,
    };

    if (!slide.mobileImage) {
        return (
            <Image
                src={slide.image}
                alt={slide.title || "Garud"}
                {...common}
                width={1920}
                height={1080}
                sizes="(max-width: 640px) 640px, (max-width: 1024px) 1024px, 100vw"
                quality={85}
                decoding="async"
                className="w-full h-auto"
            />
        );
    }

    const {
        props: { srcSet: desktopSrcSet, width: desktopWidth, height: desktopHeight },
    } = getImageProps({
        ...common,
        alt: slide.title || "Garud",
        src: slide.image,
        sizes: "(max-width: 640px) 640px, (max-width: 1024px) 1024px, 100vw",
        quality: 85,
        width: 1920,
        height: 1080,
    });

    const {
        props: { srcSet: mobileSrcSet, width: mobileWidth, height: mobileHeight, ...rest },
    } = getImageProps({
        ...common,
        alt: slide.title || "Garud",
        src: slide.mobileImage,
        sizes: "100vw",
        quality: 50,
        width: 1080,
        height: 1920,
    });

    return (
        <picture>
            <source media="(min-width: 641px)" srcSet={desktopSrcSet} width={desktopWidth as number} height={desktopHeight as number} />
            <source media="(max-width: 640px)" srcSet={mobileSrcSet} width={mobileWidth as number} height={mobileHeight as number} />
            <img
                {...rest}
                alt={slide.title || "Garud"}
                decoding="async"
                className="w-full h-auto"
            />
        </picture>
    );
};

export default function HeroClient({ initialSlides }: HeroProps) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [mounted, setMounted] = useState(false);
    const [slides, setSlides] = useState<HeroSlide[]>(initialSlides || []);
    const [loading, setLoading] = useState(!initialSlides || initialSlides.length === 0);
    const [isPaused, setIsPaused] = useState(false);
    const [loadedIndices, setLoadedIndices] = useState<number[]>([0]);

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
        setMounted(true);
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

    // Preload next slide
    useEffect(() => {
        if (slides.length <= 1) return;
        const nextSlide = (currentSlide + 1) % slides.length;
        setLoadedIndices(prev => {
            if (!prev.includes(nextSlide)) {
                return [...prev, nextSlide];
            }
            return prev;
        });
    }, [currentSlide, slides.length]);

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
        setIsPaused(true);
        setTimeout(() => setIsPaused(false), 8000);
    };

    if (loading || !mounted) {
        return null; // The server component placeholder handles the static LCP instantly
    }

    if (slides.length === 0) return null;

    return (
        <div className="absolute inset-0 w-full h-full">
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
                            // Start visible on SSR to prevent the browser from recording a hydration re-paint as the final LCP (which causes Element Render Delay)
                            opacity: index === currentSlide ? 1 : 0,
                            pointerEvents: index === currentSlide ? 'auto' : 'none',
                            zIndex: index === currentSlide ? 1 : 0,
                            // Defer GPU layer promotion for non-LCP slides
                            willChange: index === 0 ? 'auto' : 'opacity',
                            // Explict transition property to bypass React hydration mismatches with shorthand 'none'
                            transitionDuration: index === 0 && currentSlide === 0 ? '0s' : '1.4s',
                            transitionTimingFunction: 'ease-in-out',
                        }}
                    >
                        {/* Slide 0 renders unconditionally to avoid hydration re-paint
                            that causes "Element Render Delay" on LCP.
                            Non-LCP slides are deferred until they're about to be shown. */}
                        {(index === 0 || loadedIndices.includes(index)) && <SlideImage slide={slide} index={index} />}
                    </div>
                ))}
            </div>

            {/* Bottom gradient for indicators visibility */}
            {slides.length > 1 && (
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-black/40 to-transparent pointer-events-none" />
            )}

            {/* Slide Indicators */}
            {slides.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2.5 pointer-events-auto">
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
