import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { id: true, name: true } },
        subcategory: { select: { id: true, name: true } },
      },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const slug = slugify(body.name);

    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug,
        description: body.description || "",
        image: body.image || "",
        images: body.images || [],
        isActive: body.isActive ?? true,
        tags: body.tags || [],
        hasVariants: body.hasVariants || false,
        variantOptions: body.variantOptions || [],
        variants: body.variants || [],
        specs: body.specs || [],
        guarantee: body.guarantee || "",
        categoryId: body.categoryId,
        subcategoryId: body.subcategoryId || null,
      },
      include: {
        category: { select: { id: true, name: true } },
        subcategory: { select: { id: true, name: true } },
      },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
