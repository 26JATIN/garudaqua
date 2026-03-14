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
  // Instead of a hardcoded 75, we leverage Cloudinary's powerful auto-quality (q_auto:eco / q_auto:good)
  // or a user-defined lower quality, to satisfy Core Web Vitals constraints.
  let finalQuality = "auto:eco"; // default for max Lighthouse score
  if (quality && quality !== 75) {
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