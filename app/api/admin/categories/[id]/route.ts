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

    const existing = await prisma.category.findUnique({ where: { id } });

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        image: body.image,
        sortOrder: body.sortOrder,
        isActive: body.isActive,
      },
    });

    // Delete old image from Cloudinary if changed
    if (existing?.image && existing.image !== body.image) {
      await deleteCloudinaryByUrl(existing.image);
    }

    revalidatePath("/");
    revalidatePath("/products");
    await purgeCloudflareCache(["/", "/products"]);
    return NextResponse.json(category);
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
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

    const category = await prisma.category.findUnique({ where: { id } });
    await prisma.category.delete({ where: { id } });

    if (category?.image) await deleteCloudinaryByUrl(category.image);

    revalidatePath("/");
    revalidatePath("/products");
    await purgeCloudflareCache(["/", "/products"]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
