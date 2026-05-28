import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getPreviewText } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { getTranslations } from 'next-intl/server';

export const revalidate = 0;

export default async function ProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const isEn = locale === 'en';
    const projects = await prisma.project.findMany({
        orderBy: { startDate: 'desc' }
    });
    const t = await getTranslations('projects');
    const common = await getTranslations('common');

    return (
        <div className="flex flex-col min-h-screen">
            <PageHeader
                title={t('title')}
                image="/projektek-bg.jpg"
                imagePosition="object-top"
            />
            <section className="bg-white border-b py-20 px-4">
                <div className="container mx-auto max-w-5xl">
                    <div className="grid gap-8">
                        {projects.length > 0 ? (
                            projects.map((project) => {
                                const displayTitle = isEn ? (project.titleEn || project.title) : project.title;
                                const displayDesc = isEn ? (project.descriptionEn || project.description) : project.description;
                                const projectSlug = isEn ? (project.slugEn || project.slug) : project.slug;
                                
                                return (
                                    <div key={project.id} className="group border border-gray-100 hover:border-black transition-all bg-gray-50 p-8 md:p-12 flex flex-col md:flex-row gap-8 items-start">
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-start mb-2">
                                                <div className="inline-block px-3 py-1 bg-black text-white text-xs font-bold uppercase tracking-wider">
                                                    {project.startDate.getFullYear()}
                                                    {project.endDate && project.endDate.getFullYear() !== project.startDate.getFullYear()
                                                        ? `–${project.endDate.getFullYear()}`
                                                        : ''}
                                                </div>
                                            </div>
                                            <Link href={{ pathname: '/projects/[slug]', params: { slug: projectSlug } }} className="block">
                                                <h2 className="text-3xl font-bold uppercase tracking-wide hover:underline">{displayTitle}</h2>
                                            </Link>
                                            <p className="text-gray-600 leading-relaxed line-clamp-3">
                                                {getPreviewText(displayDesc)}
                                            </p>
                                            <div className="pt-4">
                                                <Link href={{ pathname: '/projects/[slug]', params: { slug: projectSlug } }}>
                                                    <Button variant="link" className="p-0 h-auto font-bold uppercase tracking-wider text-black flex items-center gap-2 group-hover:gap-4 transition-all">
                                                        {t('details')} <ArrowRight className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                        <div className="w-full md:w-1/3 flex flex-col gap-4">
                                            <Link href={{ pathname: '/projects/[slug]', params: { slug: projectSlug } }} className="aspect-video bg-gray-200 grayscale group-hover:grayscale-0 transition-all duration-500 overflow-hidden relative block">
                                                {project.mainImage ? (
                                                    <img
                                                        src={project.mainImage}
                                                        alt={displayTitle}
                                                        className="object-cover w-full h-full"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-500">
                                                        {isEn ? "No image" : "Nincs kép"}
                                                    </div>
                                                )}
                                            </Link>
                                            {(() => {
                                                const sponsorLogo = isEn ? (project.sponsorLogoEn || project.sponsorLogo) : project.sponsorLogo;
                                                return sponsorLogo && (
                                                    <div className="h-16 w-full">
                                                        <img
                                                            src={sponsorLogo}
                                                            alt={isEn ? "Sponsor logo" : "Támogatói logó"}
                                                            className="h-full w-full object-contain object-center opacity-70 group-hover:opacity-100 transition-opacity"
                                                        />
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                <p>{common('loading')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
