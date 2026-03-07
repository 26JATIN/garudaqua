type ImageLoaderParams = {
  src: string;
  width: number;
  quality?: number;
};

export default function cloudinaryLoader({
  src,
  width,
  quality,
}: ImageLoaderParams): string {
  if (!src.includes("res.cloudinary.com")) {
    return src;
  }

  const params = [
    `w_${width}`,
    `q_${quality || "auto"}`,
    "f_auto",
    "c_limit",
  ].join(",");

  return src.replace("/upload/", `/upload/${params}/`);
}
