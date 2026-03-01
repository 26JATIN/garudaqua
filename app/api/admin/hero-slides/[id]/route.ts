import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
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
    await prisma.heroSlide.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting hero slide:", error);
    return NextResponse.json(
      { error: "Failed to delete hero slide" },
      { status: 500 }
    );
  }
}
