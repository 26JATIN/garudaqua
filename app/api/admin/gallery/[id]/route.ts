import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteCloudinaryByUrl } from "@/lib/cloudinary";
import { revalidateAndWarm } from "@/lib/revalidate";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth-guard";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return unauthorizedResponse();
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.galleryItem.findUnique({ where: { id } });

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

    if (existing?.mediaUrl && existing.mediaUrl !== body.mediaUrl) {
      const resType = existing.mediaType === "VIDEO" ? "video" : "image";
      await deleteCloudinaryByUrl(existing.mediaUrl, resType as "image" | "video");
    }
    if (existing?.thumbnailUrl && existing.thumbnailUrl !== body.thumbnailUrl) {
      await deleteCloudinaryByUrl(existing.thumbnailUrl);
    }

    await revalidateAndWarm(["/", "/api/gallery"]);
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
  const session = await requireAdmin();
  if (!session) return unauthorizedResponse();
  try {
    const { id } = await params;

    const item = await prisma.galleryItem.findUnique({ where: { id } });
    await prisma.galleryItem.delete({ where: { id } });

    if (item?.mediaUrl) {
      const resType = item.mediaType === "VIDEO" ? "video" : "image";
      await deleteCloudinaryByUrl(item.mediaUrl, resType as "image" | "video");
    }
    if (item?.thumbnailUrl) await deleteCloudinaryByUrl(item.thumbnailUrl);

    await revalidateAndWarm(["/", "/api/gallery"]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting gallery item:", error);
    return NextResponse.json(
      { error: "Failed to delete gallery item" },
      { status: 500 }
    );
  }
}
