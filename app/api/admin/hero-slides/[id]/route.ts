import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { deleteCloudinaryByUrl } from "@/lib/cloudinary";
import { purgeCloudflareCache } from "@/lib/cloudflare";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.heroSlide.findUnique({ where: { id } });

    const slide = await prisma.heroSlide.update({
      where: { id },
      data: {
        image: body.image,
        mobileImage: body.mobileImage,
        title: body.title,
        order: body.order,
        isActive: body.isActive,
      },
    });

    if (existing?.image && existing.image !== body.image) {
      await deleteCloudinaryByUrl(existing.image);
    }
    if (existing?.mobileImage && existing.mobileImage !== body.mobileImage) {
      await deleteCloudinaryByUrl(existing.mobileImage);
    }

    revalidatePath("/");
    await purgeCloudflareCache(["/"]);
    return NextResponse.json(slide);
  } catch (error) {
    console.error("Error updating hero slide:", error);
    return NextResponse.json(
      { error: "Failed to update hero slide" },
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

    const slide = await prisma.heroSlide.findUnique({ where: { id } });
    await prisma.heroSlide.delete({ where: { id } });

    if (slide?.image) await deleteCloudinaryByUrl(slide.image);
    if (slide?.mobileImage) await deleteCloudinaryByUrl(slide.mobileImage);

    revalidatePath("/");
    await purgeCloudflareCache(["/"]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting hero slide:", error);
    return NextResponse.json(
      { error: "Failed to delete hero slide" },
      { status: 500 }
    );
  }
}
