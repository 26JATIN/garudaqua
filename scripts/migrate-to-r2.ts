import { prisma } from "../lib/prisma"; // Adjust path as needed, run from root using tsx

async function migrateUrlsToR2() {
    const oldDomain = "res.cloudinary.com";
    const oldDomain2 = "https://res.cloudinary.com/dy5w7n0ng/image/upload"; // Specific path usually found
    const oldDomain3 = "https://res.cloudinary.com/dy5w7n0ng/video/upload";
    const r2Domain = "https://img.garudaqua.in";

    let count = 0;

    console.log("Starting DB URL migration to R2...");

    const replaceUrl = (url: string) => {
        if (!url) return url;
        try {
            if (url.includes(oldDomain)) {
                // Extract everything after upload/vXXX/ or upload/
                const matches = url.match(/\/upload\/(?:v\d+\/)?(.+)$/);
                if (matches && matches[1]) {
                    const key = matches[1];
                    const newUrl = `${r2Domain}/${key}`;
                    count++;
                    return newUrl;
                }
            }
        } catch (e) {
            console.error("Failed to parse URL:", url);
        }
        return url;
    };

    // 1. Products
    const products = await prisma.product.findMany();
    for (const p of products) {
        let changed = false;
        const updates: any = {};

        if (p.image && p.image.includes(oldDomain)) {
            updates.image = replaceUrl(p.image);
            changed = true;
        }

        if (p.images && p.images.some(i => i.includes(oldDomain))) {
            updates.images = p.images.map(replaceUrl);
            changed = true;
        }

        if (p.variantOptions && Array.isArray(p.variantOptions)) {
           const newOptions = p.variantOptions.map((opt: any) => {
              if (opt.values) {
                 opt.values = opt.values.map((v: any) => {
                    if (v.imageUrl && v.imageUrl.includes(oldDomain)) {
                        changed = true;
                        return { ...v, imageUrl: replaceUrl(v.imageUrl) };
                    }
                    return v;
                 });
              }
              return opt;
           });
           if (changed) updates.variantOptions = newOptions;
        }

        if (changed) {
            await prisma.product.update({ where: { id: p.id }, data: updates });
        }
    }

    // 2. Blogs
    const blogs = await prisma.blogPost.findMany();
    for (const b of blogs) {
        if (b.featuredImage && b.featuredImage.includes(oldDomain)) {
            await prisma.blogPost.update({
                where: { id: b.id },
                data: { featuredImage: replaceUrl(b.featuredImage) }
            });
        }
    }

    // 3. Categories
    const categories = await prisma.category.findMany();
    for (const c of categories) {
        let changed = false;
        const updates: any = {};
        if (c.image && c.image.includes(oldDomain)) { updates.image = replaceUrl(c.image); changed = true; }
        if (c.seoHeroImage && c.seoHeroImage.includes(oldDomain)) { updates.seoHeroImage = replaceUrl(c.seoHeroImage); changed = true; }
        if (changed) await prisma.category.update({ where: { id: c.id }, data: updates });
    }

    // 4. Subcategories
    const subcats = await prisma.subcategory.findMany();
    for (const s of subcats) {
        if (s.image && s.image.includes(oldDomain)) {
            await prisma.subcategory.update({
                where: { id: s.id },
                data: { image: replaceUrl(s.image) }
            });
        }
    }

    // 5. Hero Slides
    const slides = await prisma.heroSlide.findMany();
    for (const s of slides) {
        let changed = false;
        const updates: any = {};
        if (s.image && s.image.includes(oldDomain)) { updates.image = replaceUrl(s.image); changed = true; }
        if (s.mobileImage && s.mobileImage.includes(oldDomain)) { updates.mobileImage = replaceUrl(s.mobileImage); changed = true; }
        if (changed) await prisma.heroSlide.update({ where: { id: s.id }, data: updates });
    }

    // 6. Hero Videos
    const videos = await prisma.heroVideo.findMany();
    for (const v of videos) {
        let changed = false;
        const updates: any = {};
        if (v.videoUrl && v.videoUrl.includes(oldDomain)) { updates.videoUrl = replaceUrl(v.videoUrl); changed = true; }
        if (v.thumbnailUrl && v.thumbnailUrl.includes(oldDomain)) { updates.thumbnailUrl = replaceUrl(v.thumbnailUrl); changed = true; }
        if (changed) await prisma.heroVideo.update({ where: { id: v.id }, data: updates });
    }

    // 7. Gallery
    const galleryItems = await prisma.galleryItem.findMany();
    for (const g of galleryItems) {
        let changed = false;
        const updates: any = {};
        if (g.mediaUrl && g.mediaUrl.includes(oldDomain)) { updates.mediaUrl = replaceUrl(g.mediaUrl); changed = true; }
        if (g.thumbnailUrl && g.thumbnailUrl.includes(oldDomain)) { updates.thumbnailUrl = replaceUrl(g.thumbnailUrl); changed = true; }
        if (changed) await prisma.galleryItem.update({ where: { id: g.id }, data: updates });
    }

    console.log(`DB Migration Complete! Rewrote ${count} URLs to R2 domain.`);
}

migrateUrlsToR2()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
