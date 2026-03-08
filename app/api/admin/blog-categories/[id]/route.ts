import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidateAndWarm } from "@/lib/revalidate";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const category = await prisma.blogCategory.update({
      where: { id },
      data: {
        name: body.name,
        slug: body.slug,
        order: body.order,
        isActive: body.isActive,
      },
    });
    await revalidateAndWarm(["/blogs"]);
    return NextResponse.json(category);
  } catch (error) {
    console.error("Error updating blog category:", error);
    return NextResponse.json(
      { error: "Failed to update blog category" },
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

    // Set posts in this category to have no categoryId
    await prisma.blogPost.updateMany({
      where: { categoryId: id },
      data: { categoryId: null, category: "other" },
    });

    await prisma.blogCategory.delete({ where: { id } });
    await revalidateAndWarm(["/blogs"]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting blog category:", error);
    return NextResponse.json(
      { error: "Failed to delete blog category" },
      { status: 500 }
    );
  }
}
