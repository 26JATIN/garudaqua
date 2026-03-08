import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { purgeCloudflareCache } from "@/lib/cloudflare";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");

    const subcategories = await prisma.subcategory.findMany({
      where: categoryId ? { categoryId } : undefined,
      orderBy: [
        { category: { sortOrder: "asc" } },
        { order: "asc" },
      ],
      include: {
        category: { select: { id: true, name: true, sortOrder: true } },
        _count: { select: { products: true } },
      },
    });
    return NextResponse.json(subcategories);
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    return NextResponse.json(
      { error: "Failed to fetch subcategories" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const subcategory = await prisma.subcategory.create({
      data: {
        name: body.name,
        description: body.description || "",
        image: body.image || "",
        order: body.order || 0,
        isActive: body.isActive ?? true,
        categoryId: body.categoryId,
      },
      include: {
        category: { select: { id: true, name: true } },
      },
    });
    purgeCloudflareCache(["/", "/products"]);
    return NextResponse.json(subcategory, { status: 201 });
  } catch (error) {
    console.error("Error creating subcategory:", error);
    return NextResponse.json(
      { error: "Failed to create subcategory" },
      { status: 500 }
    );
  }
}
