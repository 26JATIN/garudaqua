import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  CopyObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "garudaqua";
const R2_CUSTOM_DOMAIN = process.env.R2_CUSTOM_DOMAIN || "img.garudaqua.in";

export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

/** Build the public URL for an R2 object key. */
export function r2PublicUrl(key: string): string {
  return `https://${R2_CUSTOM_DOMAIN}/${key}`;
}

/**
 * Upload a file buffer to R2.
 * Returns the public URL and the object key.
 */
export async function uploadToR2(
  fileBuffer: Buffer,
  folder: string = "garudaqua",
  fileName: string,
  contentType: string = "application/octet-stream"
): Promise<{ url: string; key: string }> {
  const key = `${folder}/${fileName}`;

  await r2Client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
    })
  );

  return { url: r2PublicUrl(key), key };
}

/** Delete an object from R2 by key. */
export async function deleteFromR2(key: string): Promise<void> {
  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    })
  );
}

/**
 * Extract the R2 object key from a public URL.
 * e.g. "https://img.garudaqua.in/garudaqua/products/water-tank.jpg" → "garudaqua/products/water-tank.jpg"
 */
export function extractR2Key(url: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    // Strip leading slash
    const key = u.pathname.startsWith("/") ? u.pathname.slice(1) : u.pathname;
    return key || null;
  } catch {
    return null;
  }
}

/**
 * Delete an R2 asset by its full public URL.
 * Silently skips non-R2 URLs and invalid keys.
 */
export async function deleteR2ByUrl(url: string): Promise<void> {
  const key = extractR2Key(url);
  if (key) {
    await deleteFromR2(key).catch((err) =>
      console.error(`Failed to delete R2 asset ${key}:`, err)
    );
  }
}

/**
 * Generate a presigned PUT URL for browser-direct uploads.
 * The browser PUTs the file directly to R2, bypassing server body-size limits.
 */
export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(r2Client, command, { expiresIn });
}

/**
 * Copy an object within R2 (used by rename operations).
 * Returns the new public URL.
 */
export async function copyR2Object(
  sourceKey: string,
  destinationKey: string
): Promise<string> {
  await r2Client.send(
    new CopyObjectCommand({
      Bucket: R2_BUCKET_NAME,
      CopySource: `${R2_BUCKET_NAME}/${sourceKey}`,
      Key: destinationKey,
    })
  );
  return r2PublicUrl(destinationKey);
}
