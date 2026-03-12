/**
 * ONE-TIME backfill: assigns slugs to every product that has none.
 * Call once with:  POST /api/admin/products/backfill-slugs
 * Protected by the same admin-session check used everywhere else.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth-guard";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function POST() {
  // Admin-only guard
  const session = await requireAdmin();
  if (!session) return unauthorizedResponse();

  // Fetch all products without a slug
  const products = await prisma.product.findMany({
    where: { slug: "" },
    select: { id: true, name: true },
  });

  if (products.length === 0) {
    return NextResponse.json({ message: "All products already have slugs.", updated: 0 });
  }

  let updated = 0;
  const errors: string[] = [];

  for (const product of products) {
    const base = slugify(product.name);
    let candidate = base;
    let suffix = 2;

    // Find a unique slug (increment suffix if collision)
    while (true) {
      const existing = await prisma.product.findUnique({
        where: { slug: candidate },
        select: { id: true },
      });
      if (!existing || existing.id === product.id) break;
      candidate = `${base}-${suffix++}`;
    }

    try {
      await prisma.product.update({
        where: { id: product.id },
        data: { slug: candidate },
      });
      updated++;
    } catch (err) {
      errors.push(`${product.id} (${product.name}): ${String(err)}`);
    }
  }

  return NextResponse.json({
    message: `Backfill complete. ${updated} products updated.`,
    updated,
    errors: errors.length ? errors : undefined,
  });
}
