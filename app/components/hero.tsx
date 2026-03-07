"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
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
    const [prevSlide, setPrevSlide] = useState<number | null>(null);
    const [showPrev, setShowPrev] = useState(false);
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
            setPrevSlide(currentSlide);
            setShowPrev(true);
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [slides.length, isPaused, currentSlide]);

    const goToSlide = (index: number) => {
        setHasTransitioned(true);
        setPrevSlide(currentSlide);
        setShowPrev(true);
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
                {/* First slide — render as plain HTML for instant SSR paint (no crossfade needed) */}
                {/* Always render current image fully opaque, only fade out previous image on top */}
                <div className="absolute inset-0" key={`curr-${currentSlide}`}> 
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
                </div>
                {showPrev && prevSlide !== null && prevSlide !== currentSlide && (
                    <div
                        className="absolute inset-0 hero-fade-out"
                        key={`prev-${prevSlide}`}
                        onAnimationEnd={() => setShowPrev(false)}
                        style={{ background: `url('${slides[prevSlide].image}') center center / cover no-repeat` }}
                    >
                        <Image
                            src={slides[prevSlide].image}
                            alt={slides[prevSlide].title || "Garud Aqua"}
                            fill
                            className={`object-cover object-top ${slides[prevSlide].mobileImage ? 'hidden sm:block' : ''}`}
                            quality={50}
                            sizes={slides[prevSlide].mobileImage
                                ? "(max-width: 640px) 1px, 100vw"
                                : "100vw"}
                        />
                        {slides[prevSlide].mobileImage && (
                            <Image
                                src={slides[prevSlide].mobileImage}
                                alt={slides[prevSlide].title || "Garud Aqua"}
                                fill
                                className="sm:hidden object-cover object-center"
                                quality={50}
                                sizes="(min-width: 641px) 1px, 100vw"
                            />
                        )}
                    </div>
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
                                {index === currentSlide ? (
                                    <div
                                        className="absolute inset-0 rounded-full bg-white hero-progress-bar"
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

            {/* CSS animations for first slide (no JS needed) */}
            <style>{`
                /* No fade-in for current, only fade-out for previous */
                .hero-fade-out {
                    animation: hero-fadeout 1.8s cubic-bezier(0.4,0,0.2,1) both;
                    z-index: 3;
                }
                @keyframes hero-fadein {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes hero-fadeout {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
                @keyframes hero-progress {
                    from { transform: scaleX(0); }
                    to { transform: scaleX(1); }
                }
            `}</style>
        </div>
    );
}
