import { getNewsPosts } from "@/actions/facebook";
import { NewsGrid } from "@/components/features/news-grid";
import { PageHeader } from "@/components/layout/page-header";
import { getTranslations } from 'next-intl/server';

export const revalidate = 600; // Update every 10 minutes

interface PageProps {
    params: Promise<{
        locale: string;
    }>;
}

export default async function NewsPage({ params }: PageProps) {
    const { locale } = await params;
    const isEn = locale === 'en';
    const t = await getTranslations('navigation');

    const { posts, profilePicture } = await getNewsPosts(1, 100);

    const formattedPosts = posts.map(post => {
        let content = isEn ? (post.messageEn || post.message || "") : (post.message || "");
        const title = post.attachments?.data?.[0]?.title;
        const description = post.attachments?.data?.[0]?.description;
        const link = post.permalink_url;
        let videoUrl = null;

        // Video logic similar to homepage
        const attach = post.attachments?.data?.[0];
        if (attach?.media?.source) {
            const source = attach.media.source;
            if (source.includes("youtube.com") || source.includes("youtu.be")) {
                videoUrl = source.replace(/[?&]autoplay=1/, "");
            }
        }

        // Use page.tsx logic approximately
        if (!videoUrl && link) {
            let cleanLink = link;
            if (cleanLink.includes("youtube.com") || cleanLink.includes("youtu.be")) {
                const match = cleanLink.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
                if (match && match[1]) {
                    videoUrl = `https://www.youtube.com/embed/${match[1]}`;
                }
            }
        }

        const isUrl = /^(http|https):\/\/[^ "]+$/.test(content);
        if ((!content || isUrl) && title) {
            content = description ? `${title}\n\n${description}` : title;
        } else if (!content) {
            content = isEn ? "View post on Facebook" : "Kép megtekintése Facebookon";
        }

        return {
            id: post.id,
            date: new Date(post.created_time).toLocaleDateString(isEn ? "en-US" : "hu-HU", { year: 'numeric', month: 'long', day: 'numeric' }),
            content: content,
            image: post.full_picture || null,
            likes: post.likes?.summary?.total_count || 0,
            videoUrl: videoUrl,
            link: post.permalink_url,
            customTitle: isEn ? (post.customTitleEn || post.customTitle) : post.customTitle
        };
    });

    return (
        <main className="min-h-screen bg-gray-50">
            <PageHeader
                title={isEn ? "News & Updates" : "Hírek és Aktualitások"}
                image="/hirek-bg.jpg"
                imagePosition="object-center"
            />

            <div className="container mx-auto px-4 py-20">
                <NewsGrid posts={formattedPosts} profilePicture={profilePicture || "/logo.png"} />

                {formattedPosts.length === 0 && (
                    <div className="text-center py-20 text-gray-500">
                        {isEn ? "Currently there are no news to display." : "Jelenleg nincsenek megjeleníthető hírek."}
                    </div>
                )}
            </div>
        </main >
    );
}
