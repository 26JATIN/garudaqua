import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidateAndWarm } from "@/lib/revalidate";

export async function GET() {
  try {
    const items = await prisma.galleryItem.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching gallery:", error);
    return NextResponse.json(
      { error: "Failed to fetch gallery" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const item = await prisma.galleryItem.create({
      data: {
        title: body.title,
        description: body.description || "",
        alt: body.alt || "",
        mediaType: body.mediaType || "IMAGE",
        mediaUrl: body.mediaUrl,
        thumbnailUrl: body.thumbnailUrl || "",
        order: body.order || 0,
        isActive: body.isActive ?? true,
        tags: body.tags || [],
      },
    });
    await revalidateAndWarm(["/"]);
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Error creating gallery item:", error);
    return NextResponse.json(
      { error: "Failed to create gallery item" },
      { status: 500 }
    );
  }
}
