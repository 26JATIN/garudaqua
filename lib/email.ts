import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendEnquiryConfirmation(
  to: string,
  name: string,
  product: string
) {
  await transporter.sendMail({
    from: `"Garud Aqua Solutions" <${process.env.SMTP_USER}>`,
    to,
    subject: "Thank you for your enquiry — Garud Aqua Solutions",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0EA5E9, #0369A1); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Garud Aqua Solutions</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1f2937;">Thank you, ${name}!</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            We have received your enquiry${product ? ` regarding <strong>${product}</strong>` : ""}.
            Our team will review your requirements and get back to you within 24 hours.
          </p>
          <p style="color: #4b5563; line-height: 1.6;">
            You will receive a call from our team soon. If you have any urgent requirements,
            feel free to call us directly.
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="color: #6b7280; font-size: 14px;">
            Best regards,<br />
            <strong>Garud Aqua Solutions Team</strong>
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendEnquiryNotificationToAdmin(enquiry: {
  name: string;
  email: string;
  phone: string;
  company: string;
  product: string;
  quantity: string;
  message: string;
}) {
  await transporter.sendMail({
    from: `"Garud Aqua Website" <${process.env.SMTP_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `New Enquiry from ${enquiry.name}${enquiry.product ? ` — ${enquiry.product}` : ""}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1f2937; padding: 20px; text-align: center;">
          <h2 style="color: #0EA5E9; margin: 0;">New Product Enquiry</h2>
        </div>
        <div style="padding: 20px; background: #ffffff;">
          <table style="border-collapse: collapse; width: 100%;">
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 10px; font-weight: bold; color: #374151; width: 140px;">Name</td>
              <td style="padding: 10px; color: #4b5563;">${enquiry.name}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 10px; font-weight: bold; color: #374151;">Phone</td>
              <td style="padding: 10px; color: #4b5563;">
                <a href="tel:${enquiry.phone}">${enquiry.phone}</a>
              </td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 10px; font-weight: bold; color: #374151;">Email</td>
              <td style="padding: 10px; color: #4b5563;">
                ${enquiry.email ? `<a href="mailto:${enquiry.email}">${enquiry.email}</a>` : "N/A"}
              </td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 10px; font-weight: bold; color: #374151;">Company</td>
              <td style="padding: 10px; color: #4b5563;">${enquiry.company || "N/A"}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 10px; font-weight: bold; color: #374151;">Product</td>
              <td style="padding: 10px; color: #4b5563;">${enquiry.product || "N/A"}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 10px; font-weight: bold; color: #374151;">Quantity</td>
              <td style="padding: 10px; color: #4b5563;">${enquiry.quantity || "N/A"}</td>
            </tr>
          </table>
          ${enquiry.message ? `<div style="margin-top: 15px; padding: 15px; background: #f3f4f6; border-radius: 8px;"><strong style="color: #374151;">Message:</strong><p style="color: #4b5563; margin: 8px 0 0;">${enquiry.message}</p></div>` : ""}
          <div style="margin-top: 20px; text-align: center;">
            <a href="${process.env.NEXTAUTH_URL}/admin/enquiries" style="display: inline-block; background: #0EA5E9; color: white; padding: 10px 24px; text-decoration: none; border-radius: 6px;">View in Admin Panel</a>
          </div>
        </div>
      </div>
    `,
  });
}
