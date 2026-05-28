import { MapPin, Mail, Phone, Globe, Clock, Facebook, Instagram, Youtube, Twitter } from "lucide-react";
import { getContactBlocks, getContactSettings } from "@/app/actions/contact-admin";
import { ContactForm } from "./contact-form";
import { PageHeader } from "@/components/layout/page-header";
import { getTranslations } from 'next-intl/server';

const AVAILABLE_ICONS = {
    MapPin: MapPin,
    Mail: Mail,
    Phone: Phone,
    Globe: Globe,
    Clock: Clock,
    Facebook: Facebook,
    Instagram: Instagram,
    Youtube: Youtube,
    Twitter: Twitter,
};

interface PageProps {
    params: Promise<{
        locale: string;
    }>;
}

export default async function ContactPage({ params }: PageProps) {
    const { locale } = await params;
    const isEn = locale === 'en';
    const t = await getTranslations('contact');

    const [blocks, settings] = await Promise.all([
        getContactBlocks(),
        getContactSettings()
    ]);

    const displayHeroTitle = isEn ? settings?.heroTitleEn : settings?.heroTitle;
    const displayHeroSubtitle = isEn ? settings?.heroSubtitleEn : settings?.heroSubtitle;
    const displayFooterInfo = isEn ? settings?.footerInfoEn : settings?.footerInfo;

    return (
        <div className="flex flex-col min-h-screen">
            <PageHeader
                title={displayHeroTitle || (isEn ? "Contact" : "Kapcsolat")}
                subtitle={displayHeroSubtitle || undefined}
                image={settings?.heroImage || "/kapcsolat-bg.jpg"}
                imagePosition="object-center"
            />

            <section className="py-20 px-4">
                <div className="container mx-auto max-w-6xl grid md:grid-cols-2 gap-16">

                    <div className="space-y-12">
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold uppercase tracking-wide">{t('detailsTitle')}</h2>
                            <ul className="space-y-6">
                                {blocks.map((block: any) => {
                                    const Icon = AVAILABLE_ICONS[block.icon as keyof typeof AVAILABLE_ICONS] || Globe;
                                    const displayTitle = isEn ? (block.titleEn || block.title) : block.title;
                                    const displayContent = isEn ? (block.contentEn || block.content) : block.content;

                                    return (
                                        <li key={block.id} className="flex items-start gap-4">
                                            <div className="p-3 bg-gray-100 shrink-0">
                                                <Icon className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="font-bold uppercase tracking-wider text-sm text-gray-500 mb-1">{displayTitle}</p>
                                                <div
                                                    className="text-lg prose-p:my-0 [&_a]:text-inherit [&_a]:no-underline"
                                                    dangerouslySetInnerHTML={{ __html: displayContent }}
                                                />
                                            </div>
                                        </li>
                                    );
                                })}

                                {blocks.length === 0 && (
                                    <>
                                        <li className="flex items-start gap-4">
                                            <div className="p-3 bg-gray-100">
                                                <MapPin className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="font-bold uppercase tracking-wider text-sm text-gray-500 mb-1">{isEn ? "Our Address" : "Címünk"}</p>
                                                <p className="text-lg">1024 Budapest, Fillér u. 74.</p>
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-4">
                                            <div className="p-3 bg-gray-100">
                                                <Mail className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="font-bold uppercase tracking-wider text-sm text-gray-500 mb-1">Email</p>
                                                <a href="mailto:info@folkfest.hu" className="text-lg no-underline text-inherit">info@folkfest.hu</a>
                                            </div>
                                        </li>
                                    </>
                                )}
                            </ul>
                        </div>

                        {displayFooterInfo && (
                            <div className="p-8 bg-gray-50 border border-gray-100">
                                <h3 className="font-bold uppercase tracking-wide mb-4">{t('infoTitle')}</h3>
                                <div
                                    className="prose prose-sm text-gray-600 max-w-none"
                                    dangerouslySetInnerHTML={{ __html: displayFooterInfo }}
                                />
                            </div>
                        )}
                    </div>

                    <ContactForm />

                </div>
            </section>
        </div>
    );
}
