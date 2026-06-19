import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { videoSchema } from "@/lib/jsonld";
import { getCdnUrl, getRawCdnUrl } from "@/lib/utils";
import Link from "next/link";

import WatchPlayer from "./WatchPlayer";

export const revalidate = 3600; // Revalidate every hour


async function getVideo(id: string) {
    try {
        const video = await prisma.heroVideo.findUnique({
            where: { id },
            include: { linkedProduct: { select: { slug: true, name: true, image: true } } },
        });
        return video;
    } catch {
        return null;
    }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const id = slug.split('--').pop();
    if (!id) return {};

    const video = await getVideo(id);
    if (!video) return {};

    const thumbnailUrl = video.thumbnailUrl ? getCdnUrl(video.thumbnailUrl) : undefined;

    return {
        title: `${video.title} | Garud Aqua Solutions`,
        description: video.description || `Watch ${video.title} — product showcase by Garud Aqua Solutions.`,
        openGraph: {
            title: video.title,
            description: video.description || `Watch ${video.title} on Garud Aqua Solutions.`,
            type: "video.other",
            url: `https://www.garudaqua.in/watch/${slug}`,
            images: thumbnailUrl ? [{ url: thumbnailUrl, width: 1280, height: 720 }] : [],
            videos: video.videoUrl ? [{ url: getRawCdnUrl(video.videoUrl) || video.videoUrl }] : [],
        },
        twitter: {
            card: "player",
            title: video.title,
            description: video.description || `Watch ${video.title} on Garud Aqua Solutions.`,
            images: thumbnailUrl ? [thumbnailUrl] : [],
        },
    };
}

export default async function WatchPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const id = slug.split('--').pop();
    
    if (!id) notFound();

    const video = await getVideo(id);
    if (!video) notFound();

    const safeThumbnail = video.thumbnailUrl ? getCdnUrl(video.thumbnailUrl) : undefined;
    const videoUrl = getRawCdnUrl(video.videoUrl) || video.videoUrl;

    return (
        <main className="fixed inset-0 z-[100] bg-black text-white overflow-hidden font-sans h-[100dvh] w-full pb-[env(safe-area-inset-bottom)]">
            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(
                        videoSchema({
                            name: video.title,
                            description: video.description || `${video.title} — product showcase by Garud Aqua Solutions`,
                            thumbnailUrl: safeThumbnail,
                            uploadDate: video.createdAt.toISOString(),
                            contentUrl: videoUrl,
                            duration: video.duration ? `PT${video.duration}S` : undefined,
                            watchPageUrl: `https://www.garudaqua.in/watch/${slug}`,
                        })
                    ),
                }}
            />

            <WatchPlayer 
                video={{
                    title: video.title,
                    description: video.description,
                    linkedProduct: video.linkedProduct
                }} 
                videoUrl={videoUrl} 
                safeThumbnail={safeThumbnail} 
            />
        </main>
    );
}
