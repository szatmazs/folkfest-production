"use client";

import * as React from "react";
import Image from "next/image";
import { Release } from "@prisma/client";
import { getIcon } from "./release-icons";
import Link from "next/link";
import { useLocale } from 'next-intl';
import { cn } from "@/lib/utils";

interface ReleaseCarouselProps {
    releases: Release[];
}

export function ReleaseCarousel({ releases }: ReleaseCarouselProps) {
    const locale = useLocale();
    const isEn = locale === 'en';
    const [paused, setPaused] = React.useState(false);

    if (!releases || releases.length === 0) return null;

    // Duplicate items for seamless CSS loop
    const loopReleases = [...releases, ...releases];

    return (
        <div
            className={cn("w-full overflow-hidden relative", paused && "carousel-paused")}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            <div className="carousel-track-fast gap-4 px-4 py-4">
                {loopReleases.map((release, index) => {
                    const displayTitle = isEn ? (release.titleEn || release.title) : release.title;
                    return (
                        <div
                            key={`${release.id}-${index}`}
                            className="relative flex-none w-[240px] md:w-[280px] aspect-square group/card rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500"
                        >
                            {/* Cover Image */}
                            <Image
                                src={release.coverUrl}
                                alt={displayTitle}
                                fill
                                className="object-cover transition-transform duration-700 group-hover/card:scale-110 pointer-events-none"
                            />

                            {/* Overlay Content (Revealed on Hover) */}
                            <div className="absolute inset-0 bg-white/90 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center p-6 text-center">

                                {/* Artist & Title */}
                                <div className="mb-6">
                                    <Link
                                        href={`/kiadvanyok?id=${release.id}`}
                                        className="block hover:opacity-80 transition-opacity"
                                    >
                                        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">{release.artist}</p>
                                        <h3 className="text-xl font-black text-gray-900 leading-tight mb-2 line-clamp-2">{displayTitle}</h3>
                                    </Link>
                                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 font-medium text-xs rounded-full">
                                        {release.year}
                                    </span>
                                </div>

                                {/* Streaming Icons */}
                                <div className="flex justify-center gap-3">
                                    {Object.entries(JSON.parse(release.streamingLinks || "{}"))
                                        .sort(([keyA], [keyB]) => {
                                            const priority = ['spotify', 'youtube', 'apple'];
                                            const idxA = priority.findIndex(p => keyA.toLowerCase().includes(p));
                                            const idxB = priority.findIndex(p => keyB.toLowerCase().includes(p));
                                            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                                            if (idxA !== -1) return -1;
                                            if (idxB !== -1) return 1;
                                            return 0;
                                        })
                                        .slice(0, 3)
                                        .map(([key, url]) => {
                                            const Icon = getIcon(key);
                                            return (
                                                <a
                                                    key={key}
                                                    href={url as string}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-black hover:text-white hover:border-black transition-all duration-300 shadow-sm hover:scale-110 group"
                                                    title={key}
                                                >
                                                    <Icon className="w-5 h-5 transition-colors fill-current group-hover:text-white" />
                                                </a>
                                            );
                                        })}
                                </div>

                                {/* Details Link */}
                                <Link
                                    href={`/kiadvanyok?id=${release.id}`}
                                    className="absolute bottom-6 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
                                >
                                    {isEn ? "Details" : "Részletek"}
                                </Link>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}
