import { v2 as cloudinary } from "cloudinary";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";


dotenv.config();

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "garudaqua";

const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function downloadArrayBuffer(url: string): Promise<{ buffer: Buffer; contentType: string }> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const contentType = res.headers.get("content-type") || "application/octet-stream";
  return { buffer, contentType };
}

async function uploadToR2(key: string, buffer: Buffer, contentType: string) {
  await r2Client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );
}

async function syncFolder(prefix: string) {
  console.log(`\nSyncing prefix: ${prefix} ...`);
  const assetTypes = ["image", "video"];
  let totalDownloaded = 0;

  for (const assetType of assetTypes) {
    let nextCursor = undefined;
    do {
      const result: any = await cloudinary.api.resources({
        type: "upload",
        prefix: prefix,
        max_results: 100,
        next_cursor: nextCursor,
        resource_type: assetType,
      });

      const resources = result.resources || [];
      console.log(`Found ${resources.length} ${assetType}s in ${prefix}`);

      for (const res of resources) {
        try {
           const key = `${res.public_id}.${res.format}`;
           const url = res.secure_url;
           console.log(`Downloading: ${url} -> ${key}`);
           
           const { buffer, contentType } = await downloadArrayBuffer(url);
           await uploadToR2(key, buffer, contentType);
           
           console.log(`Uploaded to R2: ${key}`);
           totalDownloaded++;
        } catch (err: any) {
           console.error(`Failed to process ${res.public_id}:`, err.message);
        }
      }

      nextCursor = result.next_cursor;
    } while (nextCursor);
  }

  console.log(`\nFinished syncing ${prefix}. Total items migrated: ${totalDownloaded}`);
}

async function startSync() {
  // Sync the garudaqua folder
  await syncFolder("garudaqua");
}

startSync().catch(console.error);
