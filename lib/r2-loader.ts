import type { ImageLoaderProps } from "next/image";

export default function r2Loader({ src, width, quality }: ImageLoaderProps) {
  const params = [
    `width=${width}`,
    `quality=${quality || 75}`,
    `format=webp`,
    `fit=scale-down`
  ].join(",");

  // Extract the relative path if the src is an absolute URL to our current bucket domain.
  // This produces a cleaner /cdn-cgi/image/w=...,q=.../garudaqua/products/... URL.
  let imagePath = src;
  if (src.startsWith("https://img.garudaqua.in/")) {
    imagePath = src.replace("https://img.garudaqua.in/", "");
  } else if (src.startsWith("http://img.garudaqua.in/")) {
    imagePath = src.replace("http://img.garudaqua.in/", "");
  }
  
  // If the path starts with a slash, simply remove it
  if (imagePath.startsWith("/")) {
      imagePath = imagePath.slice(1);
  }

  // Cloudflare's cdn-cgi/image requires the hostname to be the proxied zone
  return `https://img.garudaqua.in/cdn-cgi/image/${params}/${imagePath}`;
}
