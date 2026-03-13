import { NextResponse } from "next/server";
import { revalidateAndWarm } from "@/lib/revalidate";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth-guard";

export async function POST(req: Request) {
    const session = await requireAdmin();
    if (!session) return unauthorizedResponse();

    try {
        console.log("[Admin] Manual global cache purge requested via API by:", session.user?.email);
        
        // This clears everything: Next.js Layout cache and Cloudflare Purge Everything
        await revalidateAndWarm();

        return NextResponse.json({ message: "Global cache purged successfully from Next.js and Cloudflare" });
    } catch (error: any) {
        console.error("Cache purge failed:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
