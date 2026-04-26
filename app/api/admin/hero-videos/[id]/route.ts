import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteR2ByUrl } from "@/lib/r2";
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
      await deleteR2ByUrl(existing.videoUrl);
    }
    if (existing?.thumbnailUrl && existing.thumbnailUrl !== body.thumbnailUrl) {
      await deleteR2ByUrl(existing.thumbnailUrl);
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

    if (video?.videoUrl) await deleteR2ByUrl(video.videoUrl);
    if (video?.thumbnailUrl) await deleteR2ByUrl(video.thumbnailUrl);

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
