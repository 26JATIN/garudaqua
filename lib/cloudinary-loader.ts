type ImageLoaderParams = {
  src: string;
  width: number;
  quality?: number;
};

const ALLOWED_HOSTS = ["res.cloudinary.com"];

export default function cloudinaryLoader({
  src,
  width,
  quality,
}: ImageLoaderParams): string {
  try {
    const url = new URL(src);

    if (!ALLOWED_HOSTS.includes(url.hostname)) {
      console.warn(
        `[cloudinary-loader] Blocked untrusted image host: ${url.hostname}`
      );
      return "";
    }
  } catch {
    return src;
  }

  // Next.js passes quality=75 by default.
  // We leverage Cloudinary's auto-quality instead of fixed values.
  // quality=75 (default) → q_auto:eco (smallest, good for thumbnails)
  // quality=85 → q_auto:good (balanced, ideal for hero/LCP images)
  // other values → passed as-is
  let finalQuality = "auto:eco";
  if (quality === 85) {
    finalQuality = "auto:good";
  } else if (quality && quality !== 75) {
    finalQuality = quality.toString();
  }

  const params = [
    "f_auto",          // automatic format (webp/avif)
    `q_${finalQuality}`, // intelligent auto quality or user-specific override
    `w_${width}`,      // responsive width
    "c_limit",         // don't upscale
  ].join(",");

  return src.replace("/upload/", `/upload/${params}/`);
}