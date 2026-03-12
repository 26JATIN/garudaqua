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
  // Block any src that isn't from an explicitly trusted host
  try {
    const url = new URL(src);
    if (!ALLOWED_HOSTS.includes(url.hostname)) {
      console.warn(`[cloudinary-loader] Blocked untrusted image host: ${url.hostname}`);
      return "";
    }
  } catch {
    // Relative path — allow through (local /public assets)
    return src;
  }

  const params = [
    `w_${width}`,
    `q_${quality || "auto"}`,
    "f_webp",
    "c_limit",
  ].join(",");

  return src.replace("/upload/", `/upload/${params}/`);
}
