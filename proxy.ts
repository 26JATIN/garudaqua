import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isAdminApi = req.nextUrl.pathname.startsWith("/api/admin");
  const isAuthApi = req.nextUrl.pathname.startsWith("/api/auth");

  // Protect admin API routes (but not auth routes)
  if (isAdminApi && !isAuthApi && !req.auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/api/admin/:path*"],
};
