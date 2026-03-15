import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { prisma } from "@/lib/prisma";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth-guard";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Helper to extract public ID from a Cloudinary URL
 * Example: https://res.cloudinary.com/demo/image/upload/v12345/garudaqua/products/old-name.jpg
 * Returns: garudaqua/products/old-name
 */
function getPublicIdFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    // URL format: .../upload/v12345/garudaqua/products/filename.jpg
    // or .../upload/garudaqua/products/filename.jpg
    const uploadIndex = url.indexOf("/upload/");
    if (uploadIndex === -1) return null;
    
    // Everything after /upload/
    let afterUpload = url.substring(uploadIndex + 8);
    
    // Remove the version string (e.g. v1234567890/) if it exists
    if (afterUpload.match(/^v\d+\//)) {
      afterUpload = afterUpload.substring(afterUpload.indexOf("/") + 1);
    }
    
    // Remove the file extension
    const lastDotIndex = afterUpload.lastIndexOf(".");
    if (lastDotIndex !== -1) {
      return afterUpload.substring(0, lastDotIndex);
    }
    return afterUpload;
  } catch (e) {
    console.error("Failed to parse public ID from URL", url, e);
    return null;
  }
}

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
        const updates: { image?: string; images?: string[]; variantOptions?: any } = {};
        let needsUpdate = false;

        const processImageUrl = async (url: string, suffix: string): Promise<string> => {
          const oldPublicId = getPublicIdFromUrl(url);
          if (!oldPublicId) return url; // Cannot parse, skip

          // Avoid touching images that aren't in our expected folder structure
          if (!oldPublicId.startsWith("garudaqua/products/")) {
             return url;
          }

          const filename = oldPublicId.split("/").pop() || "";
          
          // If it's already properly named, skip (checking if it matches our slug standard)
          if (filename.startsWith(slugifiedStr + "-")) {
             return url; // Already renamed recently
          }

          const shortTimestamp = Math.floor(Date.now() / 1000).toString(36);
          const newPublicId = `garudaqua/products/${slugifiedStr}-${shortTimestamp}${suffix}`;

          try {
             // Delay to prevent Cloudinary 420 Rate Limiting errors
             await delay(1500); 
             
             // Retry logic for 420 timeouts
             let attempt = 0;
             let maxAttempts = 3;
             
             while (attempt < maxAttempts) {
                 try {
                     const result = await cloudinary.uploader.rename(oldPublicId, newPublicId, { overwrite: true });
                     urlMap[url] = result.secure_url; // Store mapping for variants
                     return result.secure_url;
                 } catch (retryErr: any) {
                     attempt++;
                     if (retryErr && retryErr.http_code === 420 && attempt < maxAttempts) {
                         console.log(`Rate limited (420) on ${oldPublicId}. Retrying in ${attempt * 3} seconds...`);
                         await delay(attempt * 3000); // 3s, 6s...
                     } else {
                         throw retryErr; // Pass error down to the main catch block
                     }
                 }
             }
             return url; // Fallback return if while loop exits unexpectedly
          } catch (renameErr: any) {
             // If the error is a 404 (Resource not found), it means the image doesn't exist in Cloudinary anymore
             if (renameErr && renameErr.http_code === 404) {
                 console.warn(`Cloudinary Resource not found (404) for: ${oldPublicId}. It may have been deleted.`);
                 return url;
             }
             
             console.error(`Failed to rename ${oldPublicId} to ${newPublicId}`, renameErr);
             return url; // Fallback to old URL if rename fails for other reasons
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
                      const opt = optBase as { values?: any[] };
                      if (opt && opt.values && Array.isArray(opt.values)) {
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
           const newVariantOptions = product.variantOptions.map((opt: any) => {
              if (opt.values && Array.isArray(opt.values)) {
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
