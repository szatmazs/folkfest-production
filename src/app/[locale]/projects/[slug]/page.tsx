import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { FileText, Calendar, MapPin, Images } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { GalleryLightbox } from "@/components/ui/gallery-lightbox";
import { VideoResult } from "@/components/features/video-result";
import { BlockRenderer } from "@/components/features/block-renderer";
import { getTranslations } from 'next-intl/server';

interface ProjectPageProps {
    params: Promise<{
        slug: string;
        locale: string;
    }>;
}

export const revalidate = 0;

async function getProject(slug: string) {
    return await prisma.project.findFirst({
        where: {
            OR: [
                { slug },
                { slugEn: slug }
            ]
        },
        include: { partners: true, results: true }
    });
}

export async function generateMetadata({ params }: ProjectPageProps) {
    const { slug, locale } = await params;
    const isEn = locale === 'en';
    const project = await getProject(slug);

    if (!project) {
        return {
            title: isEn ? "Project not found" : "A projekt nem található",
        };
    }

    const title = isEn ? (project.titleEn || project.title) : project.title;
    const rawDescription = isEn ? (project.descriptionEn || project.description) : project.description;
    
    // Clean html tags and limit length of description
    const cleanText = rawDescription ? rawDescription.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim() : "";
    const description = cleanText 
        ? (cleanText.length > 150 ? cleanText.substring(0, 150) + "..." : cleanText)
        : (isEn ? "Learn more about this project." : "Ismerje meg közelebbről ezt a projektet.");

    const imageUrl = project.mainImage || "/logo.png";

    return {
        title: `${title} | FolkFest`,
        description,
        openGraph: {
            title: `${title} | FolkFest`,
            description,
            url: `https://folkfest.hu/${locale}/projects/${slug}`,
            images: [
                {
                    url: imageUrl,
                    alt: title,
                }
            ],
            type: "article",
        },
        twitter: {
            card: "summary_large_image",
            title: `${title} | FolkFest`,
            description,
            images: [imageUrl],
        }
    };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
    const { slug, locale } = await params;
    const isEn = locale === 'en';
    const project = await getProject(slug);

    if (!project) {
        notFound();
    }

    const t = await getTranslations('projects');
    const startDate = new Date(project.startDate).toLocaleDateString(isEn ? 'en-US' : 'hu-HU');
    const endDate = project.endDate ? new Date(project.endDate).toLocaleDateString(isEn ? 'en-US' : 'hu-HU') : null;
    const dateDisplay = endDate ? `${startDate} - ${endDate}` : startDate;
    const displayTitle = isEn ? (project.titleEn || project.title) : project.title;
    const displayProjectData = isEn ? (project.contentEn || project.projectData) : project.projectData;
    const displayDescription = isEn ? (project.descriptionEn || project.description) : project.description;

    return (
        <div className="flex flex-col min-h-screen bg-white">
            {project.mainImage ? (
                <PageHeader
                    title={displayTitle}
                    subtitle={dateDisplay}
                    image={project.mainImage}
                    imagePosition="object-center"
                    imageClassName="grayscale"
                    titleClassName="text-2xl md:text-4xl"
                    subtitleClassName="tracking-normal bg-white text-gray-900 px-3 py-1 inline-block font-bold opacity-100"
                />
            ) : (
                <div className="pt-32" />
            )}

            <main className="container mx-auto px-4 py-12 max-w-4xl">
                {!project.mainImage && (
                    <header className="mb-12 text-center md:text-left border-b pb-8">
                        <div className="flex items-center gap-2 text-gray-500 font-medium mb-4 text-sm uppercase tracking-wider">
                            <Calendar className="w-4 h-4" />
                            <span>{dateDisplay}</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold text-black uppercase tracking-tight">
                            {displayTitle}
                        </h1>
                    </header>
                )}

                <div className="space-y-16">
                    {/* 1. Projekt Adatok és Kiemelt Kép */}
                    {(displayProjectData || project.mainImage || project.sponsorLogo || project.sponsorLogoEn) && (
                        <section>
                            {(() => {
                                const sponsorLogo = isEn ? (project.sponsorLogoEn || project.sponsorLogo) : project.sponsorLogo;
                                return sponsorLogo && (
                                    <div className="mb-8 flex justify-start">
                                        <div className="h-16 w-48">
                                            <img 
                                                src={sponsorLogo} 
                                                alt={isEn ? "Sponsor logo" : "Támogatói logó"} 
                                                className="h-full w-full object-contain object-left"
                                            />
                                        </div>
                                    </div>
                                );
                            })()}
                            {(displayProjectData || project.mainImage) && (
                                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-500 mb-6">{isEn ? "Project Details" : "Projekt Adatok"}</h2>
                            )}
                            {displayProjectData && (
                                <div
                                    className="prose prose-lg max-w-none text-gray-800"
                                    dangerouslySetInnerHTML={{ __html: displayProjectData }}
                                />
                            )}
                            {project.mainImage && (
                                <div className="mt-8 flex justify-center">
                                    <div className="w-full max-w-sm">
                                        <ImageLightbox
                                            src={project.mainImage}
                                            alt={displayTitle}
                                            className="shadow-md hover:shadow-xl border bg-gray-50"
                                        />
                                    </div>
                                </div>
                            )}
                        </section>
                    )}

                    {/* 2. Partnerek */}
                    {project.partners && project.partners.length > 0 && (
                        <section className="border-y border-gray-200 py-8">
                            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-500 mb-8 text-center">{t('partners')}</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                {project.partners.map((p: any) => (
                                    <div key={p.id} className="flex flex-col items-center text-center group">
                                        {p.link ? (
                                            <a href={p.link} target="_blank" className="w-full flex flex-col items-center">
                                                <div className="h-24 flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300">
                                                    {p.logoUrl ? (
                                                        <img src={p.logoUrl} alt={p.name} className="max-h-full max-w-full object-contain mix-blend-multiply" />
                                                    ) : (
                                                        <div className="h-16 w-16 bg-white border flex items-center justify-center rounded-full text-xl font-bold text-gray-400">
                                                            {p.name[0]}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="font-bold text-gray-900 leading-tight mb-1 transition-colors">{p.name}</div>
                                            </a>
                                        ) : (
                                            <div className="w-full flex flex-col items-center">
                                                <div className="h-24 flex items-center justify-center mb-4">
                                                    {p.logoUrl ? (
                                                        <img src={p.logoUrl} alt={p.name} className="max-h-full max-w-full object-contain mix-blend-multiply" />
                                                    ) : (
                                                        <div className="h-16 w-16 bg-white border flex items-center justify-center rounded-full text-xl font-bold text-gray-400">
                                                            {p.name[0]}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="font-bold text-gray-900 leading-tight mb-1">{p.name}</div>
                                            </div>
                                        )}
                                        {p.country && <div className="text-xs text-gray-500 flex items-center gap-1 mb-2"><MapPin className="w-3 h-3" /> {p.country}</div>}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* 3. Leírás */}
                    {displayDescription && (
                        <section>
                            <BlockRenderer content={displayDescription} />
                        </section>
                    )}

                    {/* 4. Eredmények */}
                    {project.results && project.results.length > 0 && (
                        <section>
                            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-500 mb-6">{t('results')}</h2>
                            <div className="grid gap-4">
                                {project.results.map((r: any) => {
                                    const displayLabel = isEn ? (r.labelEn || r.label) : r.label;
                                    const displayContent = isEn ? (r.contentEn || r.content) : r.content;

                                    if (r.type === 'video') {
                                        return <VideoResult key={r.id} url={r.content} label={displayLabel} />;
                                    }
                                    if (r.type === 'gallery') {
                                        let images: string[] = []
                                        try { images = JSON.parse(r.content || '[]') } catch {}
                                        if (images.length === 0) return null
                                        return (
                                            <div key={r.id} className="py-3 space-y-3">
                                                <div className="flex items-start gap-3">
                                                    <div className="flex-shrink-0 mt-0.5">
                                                        <Images className="w-5 h-5 text-gray-600" />
                                                    </div>
                                                    <div className="font-bold text-gray-900">{displayLabel || (isEn ? 'Gallery' : 'Képgaléria')}</div>
                                                </div>
                                                <div className="ml-8">
                                                    <GalleryLightbox images={images} label={displayLabel} />
                                                </div>
                                            </div>
                                        )
                                    }
                                    return (
                                        <div key={r.id} className="flex items-start gap-3 py-3">
                                            <div className="flex-shrink-0 mt-0.5">
                                                {r.type === 'file' ? <FileText className="w-5 h-5 text-gray-600" /> : <div className="w-5 h-5 flex items-center justify-center font-bold text-gray-600 text-xs">T</div>}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-bold text-gray-900">{displayLabel || (isEn ? 'Result' : 'Eredmény')}</div>
                                                {r.type === 'file' ? (
                                                    <a href={r.content} target="_blank" className="text-sm hover:underline underline-offset-4 font-medium break-all text-gray-600">
                                                        {isEn ? "View / Download" : "Megtekintés / Letöltés"}
                                                    </a>
                                                ) : (
                                                    <div className="text-sm text-gray-600 whitespace-pre-wrap mt-0.5">{displayContent}</div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}
                </div>
            </main>
        </div>
    );
}
