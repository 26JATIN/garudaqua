import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Build a CDN image URL for use in raw <img> tags.
 * For Next.js <Image>, just pass the src directly — the default optimiser handles it.
 * Returns the original URL as-is (R2 images are served via img.garudaqua.in CDN).
 */
export function cdnImageUrl(src: string, _width?: number, _quality?: number): string {
  return src || "";
}

/**
 * Returns the public CDN URL for an R2 asset.
 * R2 images served via custom domain are already on Cloudflare CDN —
 * no proxy rewrite needed.
 */
export function getCdnUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  return url;
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
