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
  const params = `w_${width},q_${quality},f_webp,c_fill`;
  return src.replace("/upload/", `/upload/${params}/`);
}

/**
 * Force WebP/Auto-format for all Cloudinary images within an HTML string.
 */
export function optimizeHtml(html: string): string {
  if (!html) return html;
  // Look for Cloudinary URLs in src attributes
  return html.replace(
    /src="https:\/\/res\.cloudinary\.com\/[^"]+\/upload\/([^"]+)"/g,
    (match, path) => {
      // Skip if already optimized or if it's a specialized path
      if (path.includes("f_auto") || path.includes("f_webp") || path.startsWith("v")) {
        // If it starts with 'v' but doesn't have f_auto, we can still optimize
        if (!path.includes("f_auto") && !path.includes("f_webp")) {
           return match.replace("/upload/", "/upload/f_auto,f_webp,q_auto/");
        }
        return match;
      }
      return match.replace("/upload/", "/upload/f_auto,f_webp,q_auto/");
    }
  );
}
