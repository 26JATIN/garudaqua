import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

// Function to reliably truncate text to a maximum length without breaking words mid-sentence
function truncateText(text: string, maxLength: number) {
    if (text.length <= maxLength) return text;
    const truncated = text.substring(0, maxLength);
    return truncated.substring(0, Math.min(truncated.length, truncated.lastIndexOf(" "))) + "...";
}

export async function POST(req: Request) {
    try {
        await requireAdmin();
        const { forceAll } = await req.json().catch(() => ({ forceAll: false }));

        let updatedCategoriesCount = 0;
        let updatedSubCategoriesCount = 0;
        let updatedProductsCount = 0;

        // 1. Process Categories
        const categories = await prisma.category.findMany({
            where: forceAll ? {} : { OR: [{ metaTitle: "" }, { metaDesc: "" }] }
        });

        for (const cat of categories) {
            const title = cat.metaTitle || `Buy ${cat.name} Online | Top Quality - Garud Aqua`;
            let srcDesc = cat.description?.trim();
            if (!srcDesc) srcDesc = `Explore our premium range of ${cat.name}. Guaranteed quality & best prices at Garud Aqua Solutions.`;
            const desc = cat.metaDesc || truncateText(srcDesc, 155);
            
            if (title !== cat.metaTitle || desc !== cat.metaDesc) {
                await prisma.category.update({
                    where: { id: cat.id },
                    data: { metaTitle: title, metaDesc: desc }
                });
                updatedCategoriesCount++;
            }
        }

        // 2. Process Subcategories
        const subcategories = await prisma.subcategory.findMany({
            where: forceAll ? {} : { OR: [{ metaTitle: "" }, { metaDesc: "" }] },
            include: { category: true }
        });

        for (const sub of subcategories) {
            const title = sub.metaTitle || `Buy ${sub.name} Online | Best Price - Garud Aqua`;
            let srcDesc = sub.description?.trim();
            if (!srcDesc) srcDesc = `Shop the best quality ${sub.name} in Rajasthan. Browse top-rated products at Garud Aqua Solutions.`;
            const desc = sub.metaDesc || truncateText(srcDesc, 155);
            
            if (title !== sub.metaTitle || desc !== sub.metaDesc) {
                await prisma.subcategory.update({
                    where: { id: sub.id },
                    data: { metaTitle: title, metaDesc: desc }
                });
                updatedSubCategoriesCount++;
            }
        }

        // 3. Process Products
        const products = await prisma.product.findMany({
            where: forceAll ? {} : { OR: [{ metaTitle: "" }, { metaDesc: "" }] },
            include: { category: true, subcategory: true }
        });

        for (const prod of products) {
            const title = prod.metaTitle || `${prod.name} | Garud Aqua Solutions`;
            let srcDesc = prod.description?.trim();
            if (!srcDesc) {
                const catStr = prod.subcategory?.name || prod.category?.name || "Premium Quality";
                srcDesc = `Buy ${prod.name} — ${catStr} from Garud Aqua Solutions. Reliable water management products in Rajasthan.`;
            }
            const desc = prod.metaDesc || truncateText(srcDesc, 155);
            
            if (title !== prod.metaTitle || desc !== prod.metaDesc) {
                await prisma.product.update({
                    where: { id: prod.id },
                    data: { metaTitle: title, metaDesc: desc }
                });
                updatedProductsCount++;
            }
        }

        return NextResponse.json({
            success: true,
            summary: {
                categories: updatedCategoriesCount,
                subcategories: updatedSubCategoriesCount,
                products: updatedProductsCount,
                total: updatedCategoriesCount + updatedSubCategoriesCount + updatedProductsCount
            }
        });

    } catch (error: any) {
        console.error("Meta Tag Generation Error:", error);
        return new NextResponse(
            JSON.stringify({ error: error.message || "Failed to generate Meta Tags" }),
            { status: 500 }
        );
    }
}
