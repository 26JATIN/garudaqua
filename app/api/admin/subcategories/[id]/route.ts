import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteCloudinaryByUrl } from "@/lib/cloudinary";
import { revalidateAndWarm } from "@/lib/revalidate";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.subcategory.findUnique({ where: { id } });

    const subcategory = await prisma.subcategory.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        image: body.image,
        order: body.order,
        isActive: body.isActive,
        categoryId: body.categoryId,
      },
      include: {
        category: { select: { id: true, name: true } },
      },
    });

    if (existing?.image && existing.image !== body.image) {
      await deleteCloudinaryByUrl(existing.image);
    }

    await revalidateAndWarm(["/", "/products"]);
    return NextResponse.json(subcategory);
  } catch (error) {
    console.error("Error updating subcategory:", error);
    return NextResponse.json(
      { error: "Failed to update subcategory" },
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

    const subcategory = await prisma.subcategory.findUnique({ where: { id } });
    await prisma.subcategory.delete({ where: { id } });

    if (subcategory?.image) await deleteCloudinaryByUrl(subcategory.image);

    await revalidateAndWarm(["/", "/products"]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting subcategory:", error);
    return NextResponse.json(
      { error: "Failed to delete subcategory" },
      { status: 500 }
    );
  }
}
