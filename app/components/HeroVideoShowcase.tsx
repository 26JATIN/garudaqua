"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import NavigationLink from "@/app/components/NavigationLink";
import { useAnimateOnView } from "@/lib/useAnimateOnView";
import Link from "next/link";
import { getCdnUrl, getRawCdnUrl } from "@/lib/utils";

interface HeroVideo {
    id: string;
    title: string;
    description: string;
    videoUrl: string;
    thumbnailUrl: string;
    order: number;
    isActive: boolean;
    duration: number;
    linkedProductId: string | null;
}

interface VideoShowcaseProps {
    initialVideos?: HeroVideo[];
}

export default function VideoShowcaseSection({ initialVideos }: VideoShowcaseProps) {
    const [videos, setVideos] = useState<HeroVideo[]>(initialVideos || []);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(!initialVideos || initialVideos.length === 0);
    const videoRefs = useRef<(HTMLDivElement | null)[]>([]);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const ref = useAnimateOnView();

    const fetchVideos = useCallback(async () => {
        try {
            const res = await fetch("/api/hero-videos");
            if (!res.ok) throw new Error("Failed to fetch hero videos");
            const data: HeroVideo[] = await res.json();
            setVideos(data);
        } catch {
            // API failed
        } finally {
            setLoading(false);
        }
    }, []);

    // Only fetch client-side if no initial data was provided
    useEffect(() => {
        if (!initialVideos || initialVideos.length === 0) {
            fetchVideos();
        }
    }, [fetchVideos, initialVideos]);



    const scrollToVideo = useCallback((index: number) => {
        setCurrentIndex(index);
        const container = scrollContainerRef.current;
        const card = videoRefs.current[index];
        if (container && card) {
            const scrollLeft = card.offsetLeft - container.offsetLeft - (container.clientWidth / 2) + (card.clientWidth / 2);
            container.scrollTo({ left: scrollLeft, behavior: "smooth" });
        }
    }, []);

    if (loading) {
        return (
            <section className="py-20 bg-linear-to-b from-gray-50 to-white dark:from-black dark:to-[#0A0A0A]">
                <div className="max-w-screen-2xl mx-auto px-4">
                    <div className="text-center mb-10">
                        <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-32 mx-auto mb-4 animate-pulse" />
                        <div className="h-8 bg-gray-200 dark:bg-white/10 rounded-lg w-64 mx-auto mb-3 animate-pulse" />
                        <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-80 mx-auto animate-pulse" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="rounded-2xl overflow-hidden">
                                <div className="aspect-video bg-gray-200 dark:bg-white/10 animate-pulse" />
                                <div className="p-4 space-y-2">
                                    <div className="h-5 bg-gray-200 dark:bg-white/10 rounded w-2/3 animate-pulse" />
                                    <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-1/2 animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (videos.length === 0) return null;

    return (
        <section ref={ref as React.RefObject<HTMLElement>} className="py-20 bg-linear-to-b from-gray-50 to-white dark:from-black dark:to-[#0A0A0A] overflow-hidden">
            <div className="max-w-screen-2xl mx-auto px-4">
                {/* Section Header */}
                <div className="animate-on-view text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-light text-gray-900 dark:text-gray-100 mb-4">
                        Products in <span className="text-[#0EA5E9]">Action</span>
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        See our water tanks and piping solutions showcased in real-world applications
                    </p>
                </div>

                {/* Video Carousel */}
                <div className="relative">
                    <div ref={scrollContainerRef} className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-8 px-4 md:px-0" style={{ scrollbarWidth: "none" }}>
                        {videos.map((video, index) => (
                            <div
                                key={video.id}
                                ref={(el: HTMLDivElement | null) => { videoRefs.current[index] = el; }}
                                className="animate-on-view shrink-0 snap-center w-70 md:w-80 lg:w-90"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <Link href={`/watch/${video.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')}--${video.id}`} target="_blank" className="block relative bg-black rounded-2xl overflow-hidden shadow-2xl aspect-9/16 group transition-all duration-300 active:scale-95 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/10 dark:hover:shadow-[#0EA5E9]/10 cursor-pointer">
                                    {/* Video Player */}
                                    <video
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        loop
                                        muted
                                        playsInline
                                        preload="metadata"
                                        poster={video.thumbnailUrl ? getCdnUrl(video.thumbnailUrl) : undefined}
                                    >
                                        {video.videoUrl && (
                                            <source src={getRawCdnUrl(video.videoUrl)} />
                                        )}
                                        Your browser does not support the video tag.
                                    </video>

                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-linear-to-b from-black/20 via-transparent to-black/80 pointer-events-none transition-opacity duration-300" />
                                    
                                    {/* Play Icon Overlay (Always Visible) */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
                                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-2xl border border-white/40 transform scale-90 group-hover:scale-100 transition-all duration-500">
                                            <svg className="w-8 h-8 text-white ml-1 drop-shadow-md" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M8 5v14l11-7z" />
                                            </svg>
                                        </div>
                                    </div>



                                    {/* Video Info */}
                                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white pointer-events-none z-20 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                        <h3 className="text-xl font-semibold mb-2 drop-shadow-md">{video.title}</h3>
                                        {video.description && (
                                            <p className="text-sm text-white/90 line-clamp-2 drop-shadow-md">{video.description}</p>
                                        )}
                                    </div>
                                </Link>

                                {/* Video Number */}
                                <div className="text-center mt-4">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {String(index + 1).padStart(2, "0")} / {String(videos.length).padStart(2, "0")}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Navigation Buttons */}
                    {videos.length > 1 && (
                        <>
                            <button
                                onClick={() => scrollToVideo(Math.max(0, currentIndex - 1))}
                                disabled={currentIndex === 0}
                                className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white dark:bg-[#0A0A0A] shadow-lg dark:shadow-white/5 items-center justify-center text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed z-10"
                                aria-label="Previous video"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button
                                onClick={() => scrollToVideo(Math.min(videos.length - 1, currentIndex + 1))}
                                disabled={currentIndex === videos.length - 1}
                                className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white dark:bg-[#0A0A0A] shadow-lg dark:shadow-white/5 items-center justify-center text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed z-10"
                                aria-label="Next video"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </>
                    )}
                </div>

                {/* CTA */}
                <div className="animate-on-view text-center mt-16" style={{ animationDelay: '0.3s' }}>
                    <NavigationLink
                        href="/products"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-linear-to-r from-[#0EA5E9] to-[#0369A1] text-white rounded-full hover:shadow-xl transition-all duration-300 group relative overflow-hidden active:scale-95 transition-[transform] duration-150 after:absolute after:top-0 after:-left-full after:w-full after:h-full after:bg-gradient-to-r after:from-transparent after:via-white/15 after:to-transparent after:transition-[left] after:duration-500 after:ease-out hover:after:left-full"
                    >
                        <span className="font-medium">Browse All Products</span>
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </NavigationLink>
                </div>
            </div>
        </section>
    );
}
