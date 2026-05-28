import Link from "next/link";
import { Facebook, Youtube, Instagram, Mail, MapPin } from "lucide-react";
import Image from "next/image";
import { getFooterSettings } from "@/app/actions/settings-admin";
import { BlockRenderer } from "@/components/features/block-renderer";
import { getTranslations } from 'next-intl/server';

export async function Footer({ locale }: { locale: string }) {
    const settings = await getFooterSettings();
    const t = await getTranslations('footer');
    const isEn = locale === 'en';

    const displayBrandContent = isEn ? (settings.brandContentEn || settings.brandContent) : settings.brandContent;
    const displayContactContent = isEn ? (settings.contactContentEn || settings.contactContent) : settings.contactContent;
    const displaySocialContent = isEn ? (settings.socialContentEn || settings.socialContent) : settings.socialContent;
    const displayBottomText = isEn ? (settings.bottomTextEn || settings.bottomText) : settings.bottomText;

    const hasBrandContent = displayBrandContent && displayBrandContent !== '[]';
    const hasContactContent = displayContactContent && displayContactContent !== '[]';
    const hasSocialContent = displaySocialContent && displaySocialContent !== '[]';

    return (
        <footer className="bg-black text-white py-16">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2 space-y-6 flex flex-col items-center md:items-start text-center md:text-left">
                        {hasBrandContent ? (
                            <div className="prose-invert w-full text-center md:text-left flex flex-col items-center md:items-start">
                                <BlockRenderer content={displayBrandContent!} compact invert />
                            </div>
                        ) : (
                            <>
                                <div className="relative h-12 w-48 invert brightness-0 mx-auto md:mx-0">
                                    <Image
                                        src="/logo.png"
                                        alt="FolkFest Logo"
                                        fill
                                        className="object-contain object-center md:object-left"
                                    />
                                </div>
                                <p className="text-gray-400 max-w-sm text-sm leading-relaxed">
                                    {isEn 
                                        ? "Creating cultural value, preserving traditions and talent management in the Carpathian Basin."
                                        : "Kulturális értékteremtés, hagyományőrzés és tehetséggondozás a Kárpát-medencében."
                                    }
                                </p>
                            </>
                        )}
                    </div>

                    {/* Contact */}
                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
                        <h3 className="text-sm font-bold uppercase tracking-widest mb-6 text-gray-500">{t('contact')}</h3>
                        {hasContactContent ? (
                            <div className="prose-invert w-full text-center md:text-left flex flex-col items-center md:items-start">
                                <BlockRenderer content={displayContactContent!} compact invert />
                            </div>
                        ) : (
                            <ul className="space-y-4 text-sm text-gray-300">
                                <li className="flex flex-col items-center md:items-start gap-3">
                                    <MapPin className="h-5 w-5 shrink-0" />
                                    <span>1024 Budapest,<br />Fillér u. 74.</span>
                                </li>
                                <li className="flex flex-col items-center md:items-start gap-3">
                                    <Mail className="h-5 w-5 shrink-0" />
                                    <a href="mailto:info@folkfest.hu" className="hover:text-white transition-colors decoration-1 underline-offset-4 hover:underline">
                                        info@folkfest.hu
                                    </a>
                                </li>
                            </ul>
                        )}
                    </div>

                    {/* Social */}
                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
                        <h3 className="text-sm font-bold uppercase tracking-widest mb-6 text-gray-500">{t('followUs')}</h3>
                        {hasSocialContent ? (
                            <div className="prose-invert w-full text-center md:text-left flex flex-col items-center md:items-start">
                                <BlockRenderer content={displaySocialContent!} compact invert />
                            </div>
                        ) : (
                            <div className="flex gap-4 justify-center md:justify-start">
                                <a href="https://facebook.com/folkfestassociation" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/20 rounded-full hover:bg-white/40 text-white transition-all">
                                    <Facebook className="h-5 w-5" />
                                    <span className="sr-only">Facebook</span>
                                </a>
                                <a href="https://instagram.com/folkfest_hungary" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/20 rounded-full hover:bg-white/40 text-white transition-all">
                                    <Instagram className="h-5 w-5" />
                                    <span className="sr-only">Instagram</span>
                                </a>
                                <a href="https://youtube.com/@folkfesthungary" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/20 rounded-full hover:bg-white/40 text-white transition-all">
                                    <Youtube className="h-5 w-5" />
                                    <span className="sr-only">YouTube</span>
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 text-center text-xs text-gray-500 uppercase tracking-wider">
                    <p>{displayBottomText || `© ${new Date().getFullYear()} FolkFest Kulturális Egyesület. ${isEn ? "All rights reserved." : "Minden jog fenntartva."}`}</p>
                </div>
            </div>
        </footer>
    );
}
