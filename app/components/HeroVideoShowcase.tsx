"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";

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
    const [isMuted, setIsMuted] = useState(true);
    const videoRefs = useRef<(HTMLDivElement | null)[]>([]);
    const videoElementRefs = useRef<(HTMLVideoElement | null)[]>([]);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

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

    // Auto-play videos when they come into view
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries: IntersectionObserverEntry[]) => {
                entries.forEach((entry) => {
                    const video = entry.target as HTMLVideoElement;
                    if (entry.isIntersecting) {
                        video.play().catch((err: unknown) => console.log("Auto-play prevented:", err));
                    } else {
                        video.pause();
                    }
                });
            },
            { root: null, rootMargin: "0px", threshold: 0.5 }
        );

        videoElementRefs.current.forEach((video) => {
            if (video) observer.observe(video);
        });

        return () => {
            videoElementRefs.current.forEach((video) => {
                if (video) observer.unobserve(video);
            });
        };
    }, [videos]);

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
                <div className="container mx-auto px-4">
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
        <section className="py-20 bg-linear-to-b from-gray-50 to-white dark:from-black dark:to-[#0A0A0A] overflow-hidden">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-light text-gray-900 dark:text-gray-100 mb-4">
                        Products in <span className="text-[#0EA5E9]">Action</span>
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        See our water tanks and piping solutions showcased in real-world applications
                    </p>
                </motion.div>

                {/* Video Carousel */}
                <div className="relative">
                    <div ref={scrollContainerRef} className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-8 px-4 md:px-0" style={{ scrollbarWidth: "none" }}>
                        {videos.map((video, index) => (
                            <motion.div
                                key={video.id}
                                ref={(el: HTMLDivElement | null) => { videoRefs.current[index] = el; }}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="shrink-0 snap-center w-70 md:w-80 lg:w-90"
                            >
                                <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl aspect-9/16 group">
                                    {/* Video Player */}
                                    <video
                                        ref={(el: HTMLVideoElement | null) => { videoElementRefs.current[index] = el; }}
                                        className="w-full h-full object-cover pointer-events-none"
                                        loop
                                        muted={isMuted}
                                        playsInline
                                        preload="metadata"
                                        poster={video.thumbnailUrl || undefined}
                                    >
                                        {video.videoUrl && (
                                            <source src={video.videoUrl} />
                                        )}
                                        Your browser does not support the video tag.
                                    </video>

                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-linear-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />

                                    {/* Mute toggle */}
                                    <button
                                        onClick={() => setIsMuted(!isMuted)}
                                        className="absolute top-3 right-3 z-20 bg-black/50 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                        aria-label={isMuted ? "Unmute" : "Mute"}
                                    >
                                        {isMuted ? (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                            </svg>
                                        )}
                                    </button>

                                    {/* Video Info */}
                                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white pointer-events-none z-20">
                                        <h3 className="text-xl font-semibold mb-2">{video.title}</h3>
                                        {video.description && (
                                            <p className="text-sm text-white/90 line-clamp-2">{video.description}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Video Number */}
                                <div className="text-center mt-4">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {String(index + 1).padStart(2, "0")} / {String(videos.length).padStart(2, "0")}
                                    </span>
                                </div>
                            </motion.div>
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
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="text-center mt-16"
                >
                    <a
                        href="/products"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-linear-to-r from-[#0EA5E9] to-[#0369A1] text-white rounded-full hover:shadow-xl transition-all duration-300 group"
                    >
                        <span className="font-medium">Browse All Products</span>
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </a>
                </motion.div>
            </div>
        </section>
    );
}
