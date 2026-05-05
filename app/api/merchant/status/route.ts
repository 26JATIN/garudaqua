/**
 * GET /api/merchant/status
 * Returns current Merchant Center setup status — checks env vars and lists products.
 */
import { NextResponse } from "next/server";
import { listMerchantProducts } from "@/lib/google-merchant";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth-guard";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return unauthorizedResponse();

  const isConfigured = !!(
    process.env.GOOGLE_MERCHANT_ID &&
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    process.env.GOOGLE_SERVICE_ACCOUNT_KEY
  );

  if (!isConfigured) {
    return NextResponse.json({
      configured: false,
      merchantId: null,
      listedProducts: 0,
      error: "Environment variables not configured.",
    });
  }

  try {
    const result = await listMerchantProducts();
    return NextResponse.json({
      configured: true,
      merchantId: process.env.GOOGLE_MERCHANT_ID,
      listedProducts: result.products?.length ?? 0,
      error: result.error ?? null,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({
      configured: true,
      merchantId: process.env.GOOGLE_MERCHANT_ID,
      listedProducts: 0,
      error: message,
    });
  }
}
