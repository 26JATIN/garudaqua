import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Add Cloudinary transforms to a URL for optimized delivery.
 * Returns the original URL if it's not a Cloudinary URL.
 */
export function cloudinaryUrl(src: string, width: number, quality: number = 80): string {
  if (!src || !src.includes("res.cloudinary.com")) return src;
  const params = `w_${width},q_${quality},f_auto,c_fill`;
  return src
    .replace("/upload/", `/upload/${params}/`)
    .replace("https://res.cloudinary.com", "/cdn-img");
}

/**
 * Auto-generates a first-frame poster thumbnail URL for a Cloudinary video.
 * Assumes videoUrl is a Cloudinary URL (or our /cdn-img/ proxy).
 */
export function getVideoPosterUrl(videoUrl: string | undefined | null): string | undefined {
  if (!videoUrl) return undefined;
  return videoUrl.replace(/\.(mp4|webm|mov|ogg)$/i, '.jpg');
}
