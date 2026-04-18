"use client";
import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useAnimateOnView } from "@/lib/useAnimateOnView";

const ScrollGallery = dynamic(() => import("@/components/ui/circular-gallery"), { ssr: false });

interface GalleryItem {
    image: string;
    text: string;
}

interface ApiGalleryItem {
    id: string;
    title: string;
    description: string;
    alt: string;
    mediaType: string;
    mediaUrl: string;
    thumbnailUrl: string;
    order: number;
    isActive: boolean;
    tags: string[];
}

interface ImageGalleryProps {
    initialItems?: GalleryItem[];
}

export default function ImageGallery({ initialItems }: ImageGalleryProps) {
    const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(initialItems || []);
    const [isLoading, setIsLoading] = useState(!initialItems || initialItems.length === 0);
    const [isInView, setIsInView] = useState(false);
    const ref = useAnimateOnView();

    const fetchGallery = useCallback(async () => {
        try {
            const res = await fetch("/api/gallery");
            if (!res.ok) throw new Error("Failed to fetch gallery");
            const data: ApiGalleryItem[] = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                const imageItems = data
                    .filter((item) => item.mediaType === "IMAGE")
                    .map((item) => ({
                        image: item.mediaUrl,
                        text: item.title,
                    }));
                setGalleryItems(imageItems);
            }
        } catch {
            // API failed
        }
    }, []);

    useEffect(() => {
        // Only fetch client-side if no initial data was provided
        if (!initialItems || initialItems.length === 0) {
            async function loadData() {
                setIsLoading(true);
                await fetchGallery();
                setIsLoading(false);
            }
            loadData();
        }
    }, [fetchGallery, initialItems]);

    // Lazy load the WebGL canvas when it gets close to the viewport
    useEffect(() => {
        if (!ref.current) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            { rootMargin: "0px 0px 600px 0px" } // Load 600px before it scrolls into view
        );
        observer.observe(ref.current);
        return () => observer.disconnect();
    }, [ref]);

    if (galleryItems.length === 0) {
        return null;
    }

    return (
        <section ref={ref as React.RefObject<HTMLElement>} className="py-20 lg:py-32 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-linear-to-br from-[#2C2C2C] via-[#1A1A1A] to-black" />

            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#0EA5E9] rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-[#0369A1] rounded-full blur-3xl" />
            </div>

            <div className="max-w-screen-2xl mx-auto px-4 relative z-10">
                {/* Section Header */}
                <div className="animate-on-view text-center mb-12 md:mb-16">
                    <div className="inline-block mb-4 md:mb-6">
                        <div className="text-xs md:text-sm lg:text-base text-[#0EA5E9] font-light tracking-[0.2em] uppercase relative">
                            Product Gallery
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-px bg-linear-to-r from-transparent via-[#0EA5E9] to-transparent" />
                        </div>
                    </div>
                    <h2 className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-light text-white tracking-tight mb-6 md:mb-8">
                        Built to Last
                    </h2>
                    <p className="text-base md:text-xl lg:text-2xl text-gray-300 font-light max-w-4xl mx-auto leading-relaxed px-4">
                        Explore our range of ISI-certified water tanks, pipes, and fittings designed for durability and performance
                    </p>
                </div>

                {/* Circular Gallery */}
                <div className="h-100 sm:h-125 md:h-150 lg:h-175 xl:h-200 w-full">
                    {(isLoading || !isInView) ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="w-12 h-12 border-2 border-[#0EA5E9]/30 border-t-[#0EA5E9] rounded-full animate-spin" />
                        </div>
                    ) : (
                        <ScrollGallery
                            items={galleryItems}
                            textColor="#0EA5E9"
                            borderRadius={0.05}
                        />
                    )}
                </div>

                {/* Bottom hint */}
                <div className="animate-on-view text-center mt-8 md:mt-12" style={{ animationDelay: '0.3s' }}>
                    <p className="text-gray-400 text-sm md:text-base font-light flex items-center justify-center gap-2">
                        <svg className="w-4 h-4 md:w-5 md:h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                        </svg>
                        <span className="hidden md:inline">Drag to explore our products</span>
                        <span className="md:hidden">Swipe to explore</span>
                    </p>
                </div>
            </div>
        </section>
    );
}
