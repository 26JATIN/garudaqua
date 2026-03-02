import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(
  file: string,
  folder: string = "garudaqua",
  resourceType: "image" | "video" | "auto" = "auto"
): Promise<{ url: string; publicId: string; duration?: number }> {
  const result = await cloudinary.uploader.upload(file, {
    folder,
    resource_type: resourceType,
  });
  return {
    url: result.secure_url,
    publicId: result.public_id,
    duration: result.duration ? Math.round(result.duration) : undefined,
  };
}

export async function deleteFromCloudinary(
  publicId: string,
  resourceType: "image" | "video" = "image"
) {
  await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
  });
}

/**
 * Extract public ID from a Cloudinary URL.
 * e.g. "https://res.cloudinary.com/xxx/image/upload/v123/garudaqua/abc.jpg" → "garudaqua/abc"
 */
export function extractPublicId(url: string): string | null {
  if (!url || !url.includes("cloudinary.com")) return null;
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/);
  return match ? match[1] : null;
}

/** Delete a Cloudinary asset by its full URL. Silently skips non-Cloudinary URLs. */
export async function deleteCloudinaryByUrl(
  url: string,
  resourceType: "image" | "video" = "image"
) {
  const publicId = extractPublicId(url);
  if (publicId) {
    await deleteFromCloudinary(publicId, resourceType).catch((err) =>
      console.error(`Failed to delete Cloudinary asset ${publicId}:`, err)
    );
  }
}

export default cloudinary;
