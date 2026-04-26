import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth-guard";
import { extractR2Key, copyR2Object, deleteFromR2 } from "@/lib/r2";

// Utility to delay execution to avoid hitting rate limits
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST() {
  const session = await requireAdmin();
  if (!session) return unauthorizedResponse();

  try {
    // 1. Fetch all products with their categories and subcategories
    const products = await prisma.product.findMany({
      include: {
        category: true,
        subcategory: true,
      },
    });

    let processedCount = 0;
    let errorCount = 0;

    // 2. Process each product
    for (const product of products) {
      try {
        // Build the base name slug
        const catName = product.category?.name || "";
        const subName = product.subcategory?.name || "";
        const baseStr = [catName, subName, product.name].filter(Boolean).join(" ");
        const slugifiedStr = baseStr.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

        // Keep track of any URL changes for this product to update options
        const urlMap: Record<string, string> = {};
        
        // Let's store updates for prisma
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updates: { image?: string; images?: string[]; variantOptions?: any } = {};
        let needsUpdate = false;

        const processImageUrl = async (url: string, suffix: string): Promise<string> => {
          const oldKey = extractR2Key(url);
          if (!oldKey) return url; // Cannot parse, skip

          // Avoid touching images that aren't in our expected folder structure
          if (!oldKey.startsWith("garudaqua/products/")) {
             return url;
          }

          const filename = oldKey.split("/").pop() || "";
          
          // If it's already properly named, skip
          if (filename.startsWith(slugifiedStr + "-")) {
             return url; // Already renamed recently
          }

          // Extract file extension
          const ext = filename.includes(".") ? filename.split(".").pop() : "jpg";
          const shortTimestamp = Math.floor(Date.now() / 1000).toString(36);
          const newKey = `garudaqua/products/${slugifiedStr}-${shortTimestamp}${suffix}.${ext}`;

          try {
             // Delay to prevent rate limiting
             await delay(500);
             
             const newUrl = await copyR2Object(oldKey, newKey);
             
             // Delete the old object
             await deleteFromR2(oldKey).catch((err) =>
               console.warn(`Failed to delete old R2 key ${oldKey}:`, err)
             );
             
             urlMap[url] = newUrl;
             return newUrl;
          } catch (renameErr) {
             console.error(`Failed to rename ${oldKey} to ${newKey}`, renameErr);
             return url; // Fallback to old URL if rename fails
          }
        };

        // Process main image
        if (product.image) {
           const newMainUrl = await processImageUrl(product.image, "");
           if (newMainUrl !== product.image) {
              updates.image = newMainUrl;
              needsUpdate = true;
           }
        }

        // Process image gallery
        if (product.images && product.images.length > 0) {
           const newImages: string[] = [];
           let imagesChanged = false;
           for (let i = 0; i < product.images.length; i++) {
              const url = product.images[i];

              // Check if this image URL is assigned to any variant option
              let variantNameSuffix = "";
              if (product.variantOptions && Array.isArray(product.variantOptions)) {
                  for (const optBase of product.variantOptions) {
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      const opt = optBase as { values?: any[] };
                      if (opt && opt.values && Array.isArray(opt.values)) {
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          const matchedVal = opt.values.find((v: any) => v.imageUrl === url);
                          if (matchedVal) {
                              const vName = (matchedVal.displayName || matchedVal.name).toLowerCase().replace(/[^a-z0-9]+/g, "-");
                              variantNameSuffix = `-${vName}`;
                              break;
                          }
                      }
                  }
              }

              // Use variant name if found, otherwise fallback to index number
              const suffix = variantNameSuffix || `-${i + 1}`;
              
              const newUrl = await processImageUrl(url, suffix);
              newImages.push(newUrl);
              if (newUrl !== url) imagesChanged = true;
           }
           if (imagesChanged) {
              updates.images = newImages;
              needsUpdate = true;
           }
        }

        // Process variant options (replace any old URLs with new URLs)
        if (product.variantOptions && Array.isArray(product.variantOptions)) {
           let variantsChanged = false;
           // eslint-disable-next-line @typescript-eslint/no-explicit-any
           const newVariantOptions = product.variantOptions.map((opt: any) => {
              if (opt.values && Array.isArray(opt.values)) {
                 // eslint-disable-next-line @typescript-eslint/no-explicit-any
                 const newValues = opt.values.map((val: any) => {
                    if (val.imageUrl && urlMap[val.imageUrl]) {
                       variantsChanged = true;
                       return { ...val, imageUrl: urlMap[val.imageUrl] };
                    }
                    return val;
                 });
                 return { ...opt, values: newValues };
              }
              return opt;
           });

           if (variantsChanged) {
              updates.variantOptions = newVariantOptions;
              needsUpdate = true;
           }
        }

        // Update database if anything changed
        if (needsUpdate) {
            await prisma.product.update({
                where: { id: product.id },
                data: updates
            });
            processedCount++;
        }

      } catch (productError) {
        console.error(`Error processing product ${product.id}:`, productError);
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${processedCount} products. Errors: ${errorCount}.`,
      processedCount,
      errorCount
    });

  } catch (error) {
    console.error("Error in auto-rename script:", error);
    return NextResponse.json(
      { error: "Failed to execute rename script" },
      { status: 500 }
    );
  }
}
