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
  
  // If the path starts with a slash, it is a local asset hosted on Vercel.
  // We point Cloudflare Image Resizing to the absolute URL of the main domain.
  if (imagePath.startsWith("/")) {
    return `https://www.garudaqua.in/cdn-cgi/image/${params}/https://www.garudaqua.in${imagePath}`;
  }

  // Otherwise, it's an R2 bucket object, resize from the R2 custom domain
  return `https://img.garudaqua.in/cdn-cgi/image/${params}/${imagePath}`;
}
