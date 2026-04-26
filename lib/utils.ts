import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { cfImageUrl } from "./r2-loader"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Build a Cloudflare-transformed image URL for use in raw <img> tags,
 * CSS background-image, OG meta tags, video posters, etc.
 *
 * For Next.js <Image>, just pass the src directly — the custom loader handles it.
 */
export function cdnImageUrl(src: string, width?: number, quality?: number): string {
  if (!src) return "";
  return cfImageUrl(src, { width, quality: quality ?? 60 });
}

/**
 * Returns a Cloudflare-transformed CDN URL for an R2 asset.
 * Used for video posters, JSON-LD thumbnails, and other non-<Image> contexts.
 */
export function getCdnUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  return cfImageUrl(url, { quality: 75 });
}

/**
 * Returns the manually-uploaded thumbnail URL for a video.
 * R2 does not auto-generate video thumbnails (unlike Cloudinary),
 * so we rely on the manually-provided thumbnailUrl field.
 */
export function getVideoPosterUrl(videoUrl: string | undefined | null): string | undefined {
  if (!videoUrl) return undefined;
  // Return undefined — the caller should use the manual thumbnailUrl instead.
  // This function is kept for backward compatibility.
  return undefined;
}

/**
 * Returns a raw (untransformed) CDN URL.
 * Use for non-image assets like videos where Cloudflare Image
 * Transformations would break the content.
 */
export function getRawCdnUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  return url;
}
