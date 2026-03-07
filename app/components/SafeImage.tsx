"use client";
import Image from "next/image";
import { useState, useCallback } from "react";

interface SafeImageProps {
    src: string | null | undefined | { url?: string; src?: string; toString?: () => string };
    alt: string;
    fill?: boolean;
    width?: number;
    height?: number;
    className?: string;
    priority?: boolean;
    loading?: "lazy" | "eager";
    fallbackSrc?: string;
    quality?: number;
    sizes?: string;
}

export default function SafeImage({
    src,
    alt,
    fill = false,
    width,
    height,
    className = "",
    priority = false,
    loading = "lazy",
    fallbackSrc = "/product-placeholder.svg",
    quality = 60,
    sizes,
}: SafeImageProps) {
    const [error, setError] = useState(false);

    const normalizedSrc = useCallback((): string | null => {
        if (!src) return null;
        if (typeof src === "string") return src;
        if (typeof src === "object") {
            if ("url" in src && src.url) return String(src.url);
            if ("src" in src && src.src) return String(src.src);
            if (src.toString && src.toString() !== "[object Object]") return src.toString();
        }
        return null;
    }, [src])();

    const handleError = useCallback(() => {
        if (!error) setError(true);
    }, [error]);

    // Fallback
    if (!normalizedSrc || error) {
        return (
            <img
                src={fallbackSrc}
                alt={alt}
                className={className}
                style={fill ? { objectFit: "cover", width: "100%", height: "100%" } : undefined}
                loading="lazy"
            />
        );
    }

    // Use next/image for all valid sources
    if (fill) {
        return (
            <Image
                src={normalizedSrc}
                alt={alt}
                fill
                className={className}
                sizes={sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
                priority={priority}
                loading={priority ? undefined : loading}
                quality={quality}
                onError={handleError}
            />
        );
    }

    return (
        <Image
            src={normalizedSrc}
            alt={alt}
            width={width || 400}
            height={height || 400}
            className={className}
            priority={priority}
            loading={priority ? undefined : loading}
            quality={quality}
            onError={handleError}
        />
    );
}
