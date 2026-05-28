import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { FileText, Calendar, MapPin, Images } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Hero } from "@/components/layout/hero";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { GalleryLightbox } from "@/components/ui/gallery-lightbox";
import { VideoResult } from "@/components/features/video-result";
import { BlockRenderer } from "@/components/features/block-renderer";
import { getTranslations } from 'next-intl/server';

interface PageProps {
    params: Promise<{
        slug: string;
        locale: string;
    }>;
}

export const revalidate = 0;

async function getPage(slug: string) {
    return await prisma.page.findFirst({
        where: {
            OR: [
                { slug },
                { slugEn: slug }
            ]
        }
    });
}

export async function generateMetadata({ params }: PageProps) {
    const { slug, locale } = await params;
    const isEn = locale === 'en';
    const page = await getPage(slug);

    if (!page) {
        return {
            title: isEn ? "Page not found" : "Az oldal nem található",
        };
    }

    const title = isEn ? (page.titleEn || page.title) : page.title;
    const rawContent = isEn ? (page.contentEn || page.content) : page.content;
    
    // Clean html tags and limit length of description
    const cleanText = rawContent ? rawContent.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim() : "";
    const description = cleanText 
        ? (cleanText.length > 150 ? cleanText.substring(0, 150) + "..." : cleanText)
        : (isEn ? "Read more about this page." : "Tudjon meg többet erről az oldalról.");

    const imageUrl = page.heroImage || "/logo.png";

    return {
        title: `${title} | FolkFest`,
        description,
        openGraph: {
            title: `${title} | FolkFest`,
            description,
            url: `https://folkfest.hu/${locale}/${slug}`,
            images: [
                {
                    url: imageUrl,
                    alt: title,
                }
            ],
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: `${title} | FolkFest`,
            description,
            images: [imageUrl],
        }
    };
}

export default async function DynamicPage({ params }: PageProps) {
    const { slug, locale } = await params;
    const isEn = locale === 'en';
    const page = await getPage(slug);

    if (!page) {
        notFound();
    }

    const isLargeHero = page.heroType === 'large';
    const displayPageTitle = isEn ? (page.titleEn || page.title) : page.title;
    const displayHeroTitle = isEn ? page.heroTitleEn : page.heroTitle;
    const displayHeroSubtitle = isEn ? page.heroSubtitleEn : page.heroSubtitle;
    const displayHeroButtonLabel = isEn ? page.heroButtonLabelEn : page.heroButtonLabel;
    const displayPageContent = isEn ? (page.contentEn || page.content) : page.content;

    return (
        <div className="flex flex-col min-h-screen bg-white">
            {isLargeHero ? (
                <Hero
                    title={displayHeroTitle || displayPageTitle}
                    subtitle={displayHeroSubtitle}
                    backgroundImage={page.heroImage}
                    logo={page.heroLogo}
                    logoSize={page.heroLogoSize}
                    showTitle={page.heroShowTitle}
                    leftButtonLabel={displayHeroButtonLabel}
                    leftButtonLink={page.heroButtonLink}
                />
            ) : (
                <PageHeader
                    title={displayHeroTitle || displayPageTitle}
                    subtitle={displayHeroSubtitle || ""}
                    image={page.heroImage}
                    imagePosition="object-center"
                    imageClassName="grayscale"
                />
            )}

            <div className="container mx-auto px-4 py-20 max-w-4xl">
                {!isLargeHero && !page.heroImage && (
                    <div className="pt-12" />
                )}
                <BlockRenderer content={displayPageContent} />
            </div>
        </div>
    );
}
