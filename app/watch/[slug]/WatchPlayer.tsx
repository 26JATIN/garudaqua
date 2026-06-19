"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface VideoData {
    title: string;
    description: string;
    linkedProduct: { slug: string; name: string } | null;
}

export default function WatchPlayer({ video, videoUrl, safeThumbnail }: { video: VideoData, videoUrl: string, safeThumbnail: string | undefined }) {
    const [isControlsVisible, setIsControlsVisible] = useState(true);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const resetTimeout = () => {
            setIsControlsVisible(true);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
                setIsControlsVisible(false);
            }, 3000);
        };

        const handleMouseMove = () => resetTimeout();
        const handleTouchStart = () => resetTimeout();

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("touchstart", handleTouchStart);
        
        // Initial timeout
        resetTimeout();

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("touchstart", handleTouchStart);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    return (
        <div 
            className="absolute inset-0 z-0 group"
            style={{ cursor: isControlsVisible ? 'default' : 'none' }}
        >
            <video
                className="w-full h-full object-contain"
                controls
                autoPlay
                playsInline
                preload="metadata"
                poster={safeThumbnail}
            >
                {videoUrl && <source src={videoUrl} />}
                Your browser does not support the video tag.
            </video>

            {/* Top Overlay - YouTube Style */}
            <div 
                className={`absolute inset-0 z-10 pointer-events-none flex flex-col justify-start transition-opacity duration-500 ${isControlsVisible ? 'opacity-100' : 'opacity-0'}`}
            >
                {/* Top Gradient for readability against video */}
                <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none" />
                
                <div className="relative z-20 p-6 lg:p-8 w-full flex flex-col sm:flex-row sm:justify-between items-start gap-4 pointer-events-auto">
                    {/* Title */}
                    <div className="space-y-1 max-w-3xl">
                        <h1 className="text-xl md:text-3xl font-semibold tracking-wide leading-snug text-white drop-shadow-lg">
                            {video.title}
                        </h1>
                    </div>

                    {/* Linked Product CTA */}
                    {video.linkedProduct && (
                        <Link 
                            href={`/products/${video.linkedProduct.slug}`}
                            className="shrink-0 flex items-center gap-3 px-4 py-2.5 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-lg border border-white/20 transition-all duration-300 shadow-xl"
                            target="_blank"
                        >
                            <span className="text-sm font-medium text-white">View {video.linkedProduct.name}</span>
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
