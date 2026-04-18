import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/push/subscribe — save a push subscription
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { endpoint, keys } = body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ error: "Invalid subscription data" }, { status: 400 });
    }

    await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: { p256dh: keys.p256dh, auth: keys.auth },
      create: { endpoint, p256dh: keys.p256dh, auth: keys.auth },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[push/subscribe] Error:", error);
    return NextResponse.json({ error: "Failed to save subscription" }, { status: 500 });
  }
}

// DELETE /api/push/subscribe — remove a push subscription
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json({ error: "Missing endpoint" }, { status: 400 });
    }

    await prisma.pushSubscription.deleteMany({ where: { endpoint } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[push/subscribe] Delete error:", error);
    return NextResponse.json({ error: "Failed to remove subscription" }, { status: 500 });
  }
}
