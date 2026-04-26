import type { ImageLoaderProps } from "next/image";

/**
 * Cloudflare Image Transformation URL builder.
 * Used by next/image custom loader AND by raw <img> / CSS background helpers.
 *
 * Routing rules:
 *   - R2 bucket images (img.garudaqua.in)  → img.garudaqua.in/cdn-cgi/image/…
 *   - Local /public assets (e.g. logos)    → www.garudaqua.in/cdn-cgi/image/…
 */

const R2_DOMAIN = "img.garudaqua.in";
const MAIN_DOMAIN = "www.garudaqua.in";

/** Core builder — generates a full Cloudflare Image Transformation URL. */
export function cfImageUrl(
  src: string,
  opts: { width?: number; quality?: number; format?: string; fit?: string } = {}
): string {
  const { width, quality = 75, format = "webp", fit = "scale-down" } = opts;

  const parts: string[] = [
    `quality=${quality}`,
    `format=${format}`,
    `fit=${fit}`,
  ];
  if (width) parts.unshift(`width=${width}`);

  const params = parts.join(",");

  // Strip known R2 domain prefix to get the relative object key.
  let imagePath = src;
  if (src.startsWith(`https://${R2_DOMAIN}/`)) {
    imagePath = src.replace(`https://${R2_DOMAIN}/`, "");
  } else if (src.startsWith(`http://${R2_DOMAIN}/`)) {
    imagePath = src.replace(`http://${R2_DOMAIN}/`, "");
  }

  // Local assets hosted on Vercel (/public folder)
  if (imagePath.startsWith("/")) {
    return `https://${MAIN_DOMAIN}/cdn-cgi/image/${params}/https://${MAIN_DOMAIN}${imagePath}`;
  }

  // R2 bucket objects
  return `https://${R2_DOMAIN}/cdn-cgi/image/${params}/${imagePath}`;
}

/** next/image custom loader — called automatically by every <Image> component. */
export default function r2Loader({ src, width, quality }: ImageLoaderProps) {
  return cfImageUrl(src, { width, quality: quality || 75 });
}
