import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const video = await prisma.heroVideo.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        videoUrl: body.videoUrl,
        thumbnailUrl: body.thumbnailUrl,
        order: body.order,
        isActive: body.isActive,
        duration: body.duration,
        linkedProductId: body.linkedProductId || null,
      },
    });
    return NextResponse.json(video);
  } catch (error) {
    console.error("Error updating hero video:", error);
    return NextResponse.json(
      { error: "Failed to update hero video" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.heroVideo.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting hero video:", error);
    return NextResponse.json(
      { error: "Failed to delete hero video" },
      { status: 500 }
    );
  }
}
