import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteCloudinaryByUrl } from "@/lib/cloudinary";
import { revalidateAndWarm } from "@/lib/revalidate";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Generates a unique slug. If `base` is already taken by a different product (not `excludeId`), appends -2, -3 … */
async function uniqueSlug(base: string, excludeId: string): Promise<string> {
  let candidate = base;
  let counter = 2;
  while (true) {
    const conflict = await prisma.product.findUnique({ where: { slug: candidate } });
    if (!conflict || conflict.id === excludeId) return candidate;
    candidate = `${base}-${counter++}`;
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Fetch existing product to compare images and current slug
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Regenerate slug if name changed
    const newSlug =
      body.name !== existing.name
        ? await uniqueSlug(slugify(body.name), id)
        : existing.slug;

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        slug: newSlug,
        description: body.description,
        image: body.image,
        images: body.images,
        isActive: body.isActive,
        tags: body.tags,
        hasVariants: body.hasVariants,
        variantOptions: body.variantOptions,
        variants: body.variants,
        specs: body.specs,
        guarantee: body.guarantee ?? "",
        categoryId: body.categoryId,
        subcategoryId: body.subcategoryId || null,
      },
      include: {
        category: { select: { id: true, name: true } },
        subcategory: { select: { id: true, name: true } },
      },
    });

    // Delete old main image from Cloudinary if changed
    if (existing.image && existing.image !== body.image) {
      await deleteCloudinaryByUrl(existing.image);
    }

    // Delete removed gallery images from Cloudinary
    const newImages: string[] = body.images || [];
    const removedImages = (existing.images || []).filter(
      (img: string) => !newImages.includes(img)
    );
    await Promise.all(removedImages.map((img: string) => deleteCloudinaryByUrl(img)));

    // Revalidate both old slug path and new slug path (in case name changed)
    const pathsToRevalidate = ["/products", `/products/${newSlug}`];
    if (existing.slug !== newSlug) pathsToRevalidate.push(`/products/${existing.slug}`);
    await revalidateAndWarm(pathsToRevalidate);

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
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

    // Fetch product to get image URLs and slug before deleting
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await prisma.product.delete({ where: { id } });

    // Delete all images from Cloudinary
    if (product.image) await deleteCloudinaryByUrl(product.image);
    await Promise.all(
      (product.images || []).map((img: string) => deleteCloudinaryByUrl(img))
    );

    await revalidateAndWarm(["/", "/products", `/products/${product.slug}`]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
