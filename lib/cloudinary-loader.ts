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

  const params = [
    "f_auto",          // automatic format (webp/avif)
    `q_${quality || "auto"}`, // automatic quality
    "dpr_auto",        // retina optimization
    `w_${width}`,      // responsive width
    "c_limit",         // don't upscale
  ].join(",");

  return src.replace("/upload/", `/upload/${params}/`);
}