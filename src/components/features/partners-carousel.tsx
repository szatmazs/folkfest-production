'use client';

import { useEffect, useState } from 'react';
import { Partner } from '@prisma/client';
import { getPartners } from '@/app/actions/partner-admin';
import { useLocale } from 'next-intl';

export function PartnersCarousel() {
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);
    const locale = useLocale();

    useEffect(() => {
        getPartners()
            .then(data => {
                setPartners(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load partners for carousel:", err);
                setLoading(false);
            });
    }, []);

    if (loading || partners.length === 0) return null;

    const isEn = locale === 'en';
    const title = isEn ? 'Our Sponsors & Partners' : 'Támogatóink és partnereink';

    // Duplicate the partners list so it fills the screen and scrolls infinitely
    const duplicatedPartners = [...partners, ...partners, ...partners, ...partners];

    return (
        <section className="py-8 bg-white border-t border-gray-200 overflow-hidden">
            <div className="container mx-auto px-4 mb-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-center text-gray-400">
                    {title}
                </h3>
            </div>
            
            <div className="relative w-full overflow-hidden flex py-4 bg-white">
                {/* Gradient overlays to fade out the logos on the left and right edges */}
                <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
                
                <div className="carousel-track flex items-center gap-8 md:gap-12">
                    {duplicatedPartners.map((partner, index) => {
                        const content = (
                            <div className="grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100 shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={partner.logoUrl}
                                    alt={partner.name}
                                    className="h-8 md:h-10 w-auto object-contain max-w-[120px]"
                                    title={partner.name}
                                />
                            </div>
                        );

                        if (partner.websiteUrl) {
                            return (
                                <a
                                    key={`${partner.id}-${index}`}
                                    href={partner.websiteUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block"
                                >
                                    {content}
                                </a>
                            );
                        }

                        return <div key={`${partner.id}-${index}`}>{content}</div>;
                    })}
                </div>
            </div>
        </section>
    );
}
