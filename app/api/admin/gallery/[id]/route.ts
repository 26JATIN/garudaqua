import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const item = await prisma.galleryItem.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        alt: body.alt,
        mediaType: body.mediaType,
        mediaUrl: body.mediaUrl,
        thumbnailUrl: body.thumbnailUrl,
        order: body.order,
        isActive: body.isActive,
        tags: body.tags,
      },
    });
    return NextResponse.json(item);
  } catch (error) {
    console.error("Error updating gallery item:", error);
    return NextResponse.json(
      { error: "Failed to update gallery item" },
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
    await prisma.galleryItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting gallery item:", error);
    return NextResponse.json(
      { error: "Failed to delete gallery item" },
      { status: 500 }
    );
  }
}
