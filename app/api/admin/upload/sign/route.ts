import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Generate a signed upload URL so the browser can upload directly to Cloudinary
 * without going through our server. This removes file-size restrictions imposed
 * by Vercel's serverless function body limits.
 */
export async function POST(request: Request) {
  try {
    const { folder = "garudaqua", resourceType = "auto" } = await request.json();

    const timestamp = Math.round(Date.now() / 1000);
    const params = { timestamp, folder, resource_type: resourceType };

    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json({
      signature,
      timestamp,
      folder,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      resourceType: params.resource_type,
    });
  } catch (error) {
    console.error("Error generating Cloudinary signature:", error);
    return NextResponse.json(
      { error: "Failed to generate upload signature" },
      { status: 500 }
    );
  }
}
