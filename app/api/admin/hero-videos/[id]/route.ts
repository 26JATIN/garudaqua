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

    const existing = await prisma.heroVideo.findUnique({ where: { id } });

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

    if (existing?.videoUrl && existing.videoUrl !== body.videoUrl) {
      await deleteCloudinaryByUrl(existing.videoUrl, "video");
    }
    if (existing?.thumbnailUrl && existing.thumbnailUrl !== body.thumbnailUrl) {
      await deleteCloudinaryByUrl(existing.thumbnailUrl);
    }

    await revalidateAndWarm(["/", "/api/hero-videos"]);
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
  const session = await requireAdmin();
  if (!session) return unauthorizedResponse();
  try {
    const { id } = await params;

    const video = await prisma.heroVideo.findUnique({ where: { id } });
    await prisma.heroVideo.delete({ where: { id } });

    if (video?.videoUrl) await deleteCloudinaryByUrl(video.videoUrl, "video");
    if (video?.thumbnailUrl) await deleteCloudinaryByUrl(video.thumbnailUrl);

    await revalidateAndWarm(["/", "/api/hero-videos"]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting hero video:", error);
    return NextResponse.json(
      { error: "Failed to delete hero video" },
      { status: 500 }
    );
  }
}
