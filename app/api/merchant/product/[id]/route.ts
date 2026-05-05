/**
 * GET    /api/merchant/product/[id]  – get sync status for a product
 * POST   /api/merchant/product/[id]  – push one product to Merchant Center
 * DELETE /api/merchant/product/[id]  – remove one product from Merchant Center
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  syncProductToMerchant,
  deleteProductFromMerchant,
} from "@/lib/google-merchant";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth-guard";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const session = await requireAdmin();
  if (!session) return unauthorizedResponse();

  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, name: true } },
      subcategory: { select: { id: true, name: true } },
    },
  });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: product.id,
    name: product.name,
    slug: product.slug,
    isActive: product.isActive,
    merchantOfferId: `online:en:IN:${product.id}`,
  });
}

export async function POST(_req: Request, { params }: Params) {
  const session = await requireAdmin();
  if (!session) return unauthorizedResponse();

  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, name: true } },
      subcategory: { select: { id: true, name: true } },
    },
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const result = await syncProductToMerchant(product);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true, action: result.action, offerId: result.offerId });
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await requireAdmin();
  if (!session) return unauthorizedResponse();

  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    select: { id: true, slug: true },
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const result = await deleteProductFromMerchant(product.id);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
