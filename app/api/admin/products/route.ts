import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidateAndWarm } from "@/lib/revalidate";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth-guard";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function normalizePricingOptions(pricingOptions: unknown) {
  if (!Array.isArray(pricingOptions)) return [];

  return pricingOptions
    .map((option) => {
      if (!option || typeof option !== "object") return null;
      const candidate = option as {
        unit?: string;
        label?: string;
        price?: number | string | null;
        isAvailable?: boolean;
      };

      const unit = candidate.unit === "litre" || candidate.unit === "kg" || candidate.unit === "piece"
        ? candidate.unit
        : null;
      if (!unit) return null;

      const numericPrice = candidate.price === null || candidate.price === undefined || String(candidate.price).trim() === ""
        ? null
        : Number(candidate.price);

      return {
        unit,
        label: candidate.label || `Price per ${unit === "piece" ? "Piece" : unit === "kg" ? "Kg" : "Litre"}`,
        price: Number.isFinite(numericPrice as number) ? numericPrice : null,
        isAvailable: candidate.isAvailable !== false,
      };
    })
    .filter(Boolean);
}

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: [
        { category: { sortOrder: "asc" } },
        { createdAt: "desc" },
      ],
      include: {
        category: { select: { id: true, name: true, sortOrder: true } },
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
  const session = await requireAdmin();
  if (!session) return unauthorizedResponse();
  try {
    const body = await request.json();
    const slug = slugify(body.name);

    // If any other product has this slug in their formerSlugs, remove it.
    // Otherwise visiting /products/<slug> would redirect to the wrong (renamed) product.
    await prisma.product.updateMany({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      where: { formerSlugs: { has: slug } } as any,
      data: { formerSlugs: { set: [] } }, // we'll fix this per-document below
    });
    // updateMany can't do per-document array filtering, so do it properly:
    const staleHolders = await prisma.product.findMany({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      where: { formerSlugs: { has: slug } } as any,
      select: { id: true, formerSlugs: true },
    });
    await Promise.all(
      staleHolders.map((p) =>
        prisma.product.update({
          where: { id: p.id },
          data: { formerSlugs: p.formerSlugs.filter((s) => s !== slug) },
        })
      )
    );

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
        pricingOptions: normalizePricingOptions(body.pricingOptions),
        specs: body.specs || [],
        guarantee: body.guarantee || "",
        categoryId: body.categoryId,
        subcategoryId: body.subcategoryId || null,
        metaTitle: body.metaTitle || "",
        metaDesc: body.metaDesc || "",
      },
      include: {
        category: { select: { id: true, name: true } },
        subcategory: { select: { id: true, name: true } },
      },
    });
    await revalidateAndWarm(["/","/products", "/api/products"]);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
