import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidateAndWarm } from "@/lib/revalidate";

export async function GET() {
  try {
    const videos = await prisma.heroVideo.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json(videos);
  } catch (error) {
    console.error("Error fetching hero videos:", error);
    return NextResponse.json(
      { error: "Failed to fetch hero videos" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const video = await prisma.heroVideo.create({
      data: {
        title: body.title,
        description: body.description || "",
        videoUrl: body.videoUrl,
        thumbnailUrl: body.thumbnailUrl || "",
        order: body.order || 0,
        isActive: body.isActive ?? true,
        duration: body.duration || 0,
        linkedProductId: body.linkedProductId || null,
      },
    });
    await revalidateAndWarm(["/"]);
    return NextResponse.json(video, { status: 201 });
  } catch (error) {
    console.error("Error creating hero video:", error);
    return NextResponse.json(
      { error: "Failed to create hero video" },
      { status: 500 }
    );
  }
}
