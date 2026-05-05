/**
 * POST /api/merchant/sync
 * Bulk-syncs all active products from MongoDB → Google Merchant Center.
 * Admin-only endpoint.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { batchSyncProducts } from "@/lib/google-merchant";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth-guard";

export async function POST() {
  const session = await requireAdmin();
  if (!session) return unauthorizedResponse();

  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: { select: { id: true, name: true } },
        subcategory: { select: { id: true, name: true } },
      },
    });

    if (products.length === 0) {
      return NextResponse.json({ synced: 0, errors: [] });
    }

    // Process in batches of 1000 (API limit)
    const BATCH_SIZE = 1000;
    const allResults = [];

    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      const chunk = products.slice(i, i + BATCH_SIZE);
      const results = await batchSyncProducts(chunk);
      allResults.push(...results);
    }

    const succeeded = allResults.filter((r) => r.ok).length;
    const errors = allResults
      .filter((r) => !r.ok)
      .map((r) => ({ offerId: r.offerId, error: (r as { ok: false; offerId: string; error: string }).error }));

    return NextResponse.json({
      synced: succeeded,
      total: products.length,
      errors,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[Merchant Sync] Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
