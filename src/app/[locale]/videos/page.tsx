import { prisma } from "@/lib/prisma";
import { VideoGallery } from "@/components/features/video-gallery";
import { PageHeader } from "@/components/layout/page-header";
import { getTranslations } from 'next-intl/server';

export const revalidate = 0; // Dynamic

export default async function VideosPage() {
    const videos = await prisma.video.findMany({
        orderBy: { publishedAt: 'desc' }
    });

    const t = await getTranslations('videos');
    const common = await getTranslations('common');

    return (
        <main className="min-h-screen bg-gray-50">
            <PageHeader
                title={t('title')}
                image="/videok-bg.jpg"
                imagePosition="object-center"
            />

            <div className="container mx-auto px-4 py-20">
                <VideoGallery videos={videos} />

                {videos.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <p>{common('loading')}</p>
                    </div>
                )}
            </div>
        </main>
    );
}
