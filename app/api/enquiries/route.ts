import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  sendEnquiryConfirmation,
  sendEnquiryNotificationToAdmin,
} from "@/lib/email";
import { sendPushNotifications } from "@/lib/webpush";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name?.trim() || !body.phone?.trim()) {
      return NextResponse.json(
        { error: "Name and phone are required" },
        { status: 400 }
      );
    }

    const enquiry = await prisma.enquiry.create({
      data: {
        name: body.name.trim(),
        email: body.email?.trim() || "",
        phone: body.phone.trim(),
        company: body.company?.trim() || "",
        product: body.product?.trim() || "",
        quantity: body.quantity?.trim() || "",
        message: body.message?.trim() || "",
      },
    });

    // Await email attempts so serverless runtimes do not drop in-flight SMTP work.
    const emailResults = await Promise.allSettled([
      body.email
        ? sendEnquiryConfirmation(body.email.trim(), body.name.trim(), body.product || "")
        : Promise.resolve(),
      sendEnquiryNotificationToAdmin({
        name: body.name,
        email: body.email || "",
        phone: body.phone,
        company: body.company || "",
        product: body.product || "",
        quantity: body.quantity || "",
        message: body.message || "",
      }),
    ]);

    emailResults.forEach((result, index) => {
      if (result.status === "rejected") {
        const label = index === 0 ? "customer-confirmation" : "admin-notification";
        console.error(`[email] Failed to send ${label}:`, result.reason);
      }
    });

    // Fire push notifications to all registered admin devices (non-blocking)
    const productLabel = body.product?.trim() ? ` — ${body.product.trim()}` : "";
    sendPushNotifications({
      title: "🔔 New Enquiry Received",
      body: `${body.name.trim()}${productLabel}`,
      url: "/admin/enquiries",
    }).catch((err) => console.error("[push] Failed:", err));

    return NextResponse.json(
      { success: true, id: enquiry.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating enquiry:", error);
    return NextResponse.json(
      { error: "Failed to submit enquiry" },
      { status: 500 }
    );
  }
}

