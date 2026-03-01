"use client";
import React, { useState, useEffect, useCallback } from "react";
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

export default function Hero() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [slides, setSlides] = useState<HeroSlide[]>([]);
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        fetchSlides();
    }, [fetchSlides]);

    // Auto-advance slides
    useEffect(() => {
        if (slides.length === 0) return;
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [slides.length]);

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
        <div className="relative w-full h-[80vh] sm:h-[70vh] md:h-[70vh] lg:h-screen overflow-hidden bg-black">
            {/* Full-screen Image Slideshow */}
            <div className="absolute inset-0">
                <AnimatePresence initial={false}>
                    <motion.div
                        key={currentSlide}
                        initial={{
                            opacity: 0,
                        }}
                        animate={{
                            opacity: 1,
                        }}
                        exit={{
                            opacity: 0,
                        }}
                        transition={{
                            duration: 0.8,
                            ease: "easeInOut",
                        }}
                        className="absolute inset-0"
                    >
                        {/* Desktop & Tablet Image - Hidden only on small mobile if mobile version exists */}
                        <Image
                            src={slides[currentSlide].image}
                            alt="Garud"
                            fill
                            className={`object-cover object-center ${slides[currentSlide].mobileImage ? 'hidden sm:block' : ''}`}
                            priority={currentSlide === 0}
                            quality={90}
                        />

                        {/* Mobile Image - Only for small mobile devices */}
                        {slides[currentSlide].mobileImage && (
                            <Image
                                src={slides[currentSlide].mobileImage}
                                alt="Garud Mobile"
                                fill
                                className="sm:hidden object-cover object-center"
                                priority={currentSlide === 0}
                                quality={90}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}