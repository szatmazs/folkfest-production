'use client';

import { Partner } from '@prisma/client';

export function PartnerGrid({ partners, title }: { partners: Partner[], title?: string }) {
    if (!partners || partners.length === 0) return null;

    return (
        <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
                <h2 className="text-2xl font-bold uppercase tracking-wide text-center text-gray-800 mb-12">
                    {title || "Támogatóink és Partnereink"}
                </h2>
                <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
                    {partners.map((partner) => {
                        const Content = (
                            <div className="grayscale hover:grayscale-0 transition-all duration-300 opacity-80 hover:opacity-100 transform hover:scale-105">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={partner.logoUrl}
                                    alt={partner.name}
                                    className="h-12 md:h-16 w-auto object-contain"
                                    title={partner.name}
                                />
                            </div>
                        );

                        if (partner.websiteUrl) {
                            return (
                                <a
                                    key={partner.id}
                                    href={partner.websiteUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block"
                                >
                                    {Content}
                                </a>
                            );
                        }

                        return <div key={partner.id}>{Content}</div>;
                    })}
                </div>
            </div>
        </section>
    );
}
