import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  sendEnquiryConfirmation,
  sendEnquiryNotificationToAdmin,
} from "@/lib/email";

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

    // Send emails asynchronously — don't block the response
    Promise.all([
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
    ]).catch((err) => console.error("Email send error:", err));

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
