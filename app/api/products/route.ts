import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** 24-char hex = MongoDB ObjectId */
const isObjectId = (s: string) => /^[a-f\d]{24}$/i.test(s);

/** Convert name to slug — mirrors client-side slugify */
function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryParam = searchParams.get("category");
    const subcategoryParam = searchParams.get("subcategory");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const sort = searchParams.get("sort") || "featured";

    const where: Record<string, unknown> = { isActive: true };

    if (categoryParam) {
      if (isObjectId(categoryParam)) {
        where.categoryId = categoryParam;
      } else {
        // Try slug column first, then fall back to deriving slug from name
        const cat = await prisma.category.findFirst({
          where: {
            OR: [
              { slug: categoryParam },
              { name: { equals: categoryParam.replace(/-/g, " "), mode: "insensitive" } },
            ],
          },
          select: { id: true, name: true },
        });
        // If still not found, fetch all and match by slugified name (handles multi-word names)
        if (cat) {
          where.categoryId = cat.id;
        } else {
          const allCats = await prisma.category.findMany({ select: { id: true, name: true } });
          const match = allCats.find((c) => slugify(c.name) === categoryParam);
          if (match) where.categoryId = match.id;
          // If truly no match, leave where without categoryId so no products return
          else where.categoryId = "__no_match__";
        }
      }
    }
    if (subcategoryParam) {
      if (isObjectId(subcategoryParam)) {
        where.subcategoryId = subcategoryParam;
      } else {
        const sub = await prisma.subcategory.findFirst({
          where: {
            OR: [
              { slug: subcategoryParam },
              { name: { equals: subcategoryParam.replace(/-/g, " "), mode: "insensitive" } },
            ],
          },
          select: { id: true, name: true },
        });
        if (sub) {
          where.subcategoryId = sub.id;
        } else {
          const allSubs = await prisma.subcategory.findMany({ select: { id: true, name: true } });
          const match = allSubs.find((s) => slugify(s.name) === subcategoryParam);
          if (match) where.subcategoryId = match.id;
          else where.subcategoryId = "__no_match__";
        }
      }
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const orderBy =
      sort === "latest"
        ? [{ createdAt: "desc" as const }]
        : sort === "name"
          ? [{ name: "asc" as const }]
          : [{ category: { sortOrder: "asc" as const } }, { createdAt: "desc" as const }];

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          category: { select: { id: true, name: true } },
          subcategory: { select: { id: true, name: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    }, {
      headers: {
        "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
