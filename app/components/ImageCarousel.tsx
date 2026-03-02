"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface ImageItem {
    url: string;
    alt: string;
    isPrimary: boolean;
}

interface ImageCarouselProps {
    images: string | string[] | Array<{ url: string; alt?: string; isPrimary?: boolean }>;
    productName?: string;
    autoPlay?: boolean;
    autoPlayInterval?: number;
    showThumbnails?: boolean;
    showDots?: boolean;
    className?: string;
}

export default function ImageCarousel({
    images,
    productName = "Product",
    autoPlay = false,
    autoPlayInterval = 3000,
    showThumbnails = true,
    showDots = true,
    className = "",
}: ImageCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(autoPlay);
    const [imageLoaded, setImageLoaded] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const imageArray: ImageItem[] = (() => {
        if (Array.isArray(images)) {
            return images
                .filter((img): img is NonNullable<typeof img> => img !== null && img !== undefined)
                .map((img, index) => ({
                    url: typeof img === "string" ? img : img.url,
                    alt: typeof img === "string" ? `${productName} - Image ${index + 1}` : (img.alt || `${productName} - Image ${index + 1}`),
                    isPrimary: typeof img === "object" && img !== null ? !!img.isPrimary : index === 0,
                }));
        } else if (images) {
            return [{ url: images as string, alt: productName, isPrimary: true }];
        }
        return [];
    })();

    useEffect(() => {
        if (isPlaying && imageArray.length > 1) {
            intervalRef.current = setInterval(() => {
                setCurrentIndex((prev) => (prev === imageArray.length - 1 ? 0 : prev + 1));
            }, autoPlayInterval);
        } else if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isPlaying, imageArray.length, autoPlayInterval]);

    useEffect(() => {
        setCurrentIndex(0);
        setImageLoaded(false);
    }, [images]);

    if (imageArray.length === 0) {
        return (
            <div className={`w-full aspect-square bg-linear-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center shadow-inner ${className}`}>
                <div className="text-center text-gray-500">
                    <svg className="mx-auto h-16 w-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm font-medium">No images available</p>
                </div>
            </div>
        );
    }

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? imageArray.length - 1 : prev - 1));
        setImageLoaded(false);
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev === imageArray.length - 1 ? 0 : prev + 1));
        setImageLoaded(false);
    };

    const goToSlide = (index: number) => {
        if (index !== currentIndex) {
            setCurrentIndex(index);
            setImageLoaded(false);
        }
    };

    const toggleAutoPlay = () => setIsPlaying(!isPlaying);

    return (
        <div className={`relative w-full ${className}`}>
            {/* Main Image */}
            <div className="relative w-full aspect-square bg-linear-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden group shadow-lg">
                {!imageLoaded && (
                    <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                )}

                <Image
                    src={imageArray[currentIndex].url}
                    alt={imageArray[currentIndex].alt}
                    fill
                    className={`object-cover transition-all duration-500 ${imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"}`}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    onLoad={() => setImageLoaded(true)}
                    priority={currentIndex === 0}
                />

                {imageArray.length > 1 && (
                    <>
                        <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); goToPrevious(); }}
                            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-[#0EA5E9] hover:text-white text-gray-800 rounded-full p-2.5 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg z-10"
                            aria-label="Previous image"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); goToNext(); }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-[#0EA5E9] hover:text-white text-gray-800 rounded-full p-2.5 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg z-10"
                            aria-label="Next image"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>

                        {/* Auto-play Control */}
                        <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleAutoPlay(); }}
                            className="absolute top-3 left-3 bg-black/60 hover:bg-[#0EA5E9] text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm"
                            aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
                        >
                            {isPlaying ? (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
                            ) : (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                            )}
                        </button>

                        {/* Counter */}
                        <div className="absolute top-3 right-3 bg-black/70 text-white text-sm px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm">
                            <span className="font-medium">{currentIndex + 1}</span>
                            <span className="text-white/70 mx-1">/</span>
                            <span className="text-white/90">{imageArray.length}</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                            <div
                                className="h-full bg-linear-to-r from-[#0EA5E9] to-[#0369A1] transition-all duration-500 ease-out"
                                style={{ width: `${((currentIndex + 1) / imageArray.length) * 100}%` }}
                            />
                        </div>
                    </>
                )}
            </div>

            {/* Thumbnails */}
            {imageArray.length > 1 && showThumbnails && (
                <div className="mt-4">
                    <div className="flex space-x-2 overflow-x-auto pb-2 px-1">
                        {imageArray.map((image, index) => (
                            <button
                                key={index}
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); goToSlide(index); }}
                                className={`relative shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all duration-300 ${
                                    currentIndex === index
                                        ? "ring-3 ring-[#0EA5E9] ring-offset-2 shadow-lg scale-105"
                                        : "ring-2 ring-gray-200 hover:ring-[#0EA5E9]/50 hover:shadow-md"
                                }`}
                            >
                                <Image
                                    src={image.url}
                                    alt={image.alt || `Thumbnail ${index + 1}`}
                                    width={64}
                                    height={64}
                                    className="w-full h-full object-cover"
                                    quality={50}
                                />
                                {currentIndex === index && (
                                    <div className="absolute inset-0 bg-[#0EA5E9]/30 flex items-center justify-center">
                                        <div className="w-5 h-5 bg-[#0EA5E9] rounded-full flex items-center justify-center">
                                            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                            </svg>
                                        </div>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Dots */}
            {imageArray.length > 1 && showDots && (
                <div className="mt-3 flex justify-center space-x-2">
                    {imageArray.map((_, index) => (
                        <button
                            key={index}
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); goToSlide(index); }}
                            className={`relative transition-all duration-300 ${
                                currentIndex === index
                                    ? "w-6 h-2 bg-linear-to-r from-[#0EA5E9] to-[#0369A1] scale-110"
                                    : "w-2 h-2 bg-gray-300 hover:bg-[#0EA5E9]/60 hover:scale-110"
                            } rounded-full`}
                            aria-label={`Go to image ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
