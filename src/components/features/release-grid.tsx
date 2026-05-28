"use client";

import * as React from "react";
import Image from "next/image";
import { Release } from "@prisma/client";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { getIcon } from "./release-icons";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

interface ReleaseGridProps {
    releases: Release[];
}

export function ReleaseGrid({ releases }: ReleaseGridProps) {
    const t = useTranslations('releases');
    const searchParams = useSearchParams();
    const releaseId = searchParams.get('id');
    const [selectedRelease, setSelectedRelease] = React.useState<Release | null>(null);

    useEffect(() => {
        if (releaseId) {
            const found = releases.find(r => r.id === releaseId);
            if (found) setSelectedRelease(found);
        }
    }, [releaseId, releases]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {releases.map((release) => {
                const displayTitle = release.title;
                return (
                    <div
                        key={release.id}
                        className="group bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                        onClick={() => setSelectedRelease(release)}
                    >
                        <div className="relative aspect-square w-full overflow-hidden">
                            <Image
                                src={release.coverUrl}
                                alt={displayTitle}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                        </div>
                        <div className="p-6">
                            <p className="text-gray-500 font-medium text-sm uppercase tracking-wider mb-1">{release.artist}</p>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">{displayTitle}</h3>
                            <div className="flex items-center justify-between">
                                <Badge variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-200">{release.year}</Badge>
                            </div>
                        </div>
                    </div>
                );
            })}

            <Dialog open={!!selectedRelease} onOpenChange={(open) => !open && setSelectedRelease(null)}>
                <DialogContent className="max-w-4xl p-0 overflow-hidden bg-white text-black border-none">
                    {selectedRelease && (
                        <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
                            {/* Left: Cover */}
                            <div className="relative w-full md:w-1/2 min-h-[300px] md:min-h-full bg-neutral-100">
                                <Image
                                    src={selectedRelease.coverUrl}
                                    alt={selectedRelease.title}
                                    fill
                                    className="object-contain p-4"
                                />
                            </div>

                            {/* Right: Info */}
                            <div className="flex-1 p-8 md:p-10 flex flex-col overflow-y-auto">
                                <DialogHeader className="mb-6 text-left">
                                    <p className="text-gray-500 font-bold uppercase tracking-widest text-sm mb-2">{selectedRelease.artist}</p>
                                    <DialogTitle className="text-3xl md:text-4xl font-black text-gray-900 leading-none mb-4">
                                        {selectedRelease.title}
                                    </DialogTitle>
                                    <Badge className="w-fit text-lg px-3 py-1 bg-gray-900 text-white hover:bg-black">{selectedRelease.year}</Badge>
                                </DialogHeader>

                                {/* Streaming Links */}
                                <div className="mb-8">
                                    <h4 className="text-sm font-bold uppercase text-gray-400 mb-4 tracking-wider">{t('streaming')}</h4>
                                    <div className="flex flex-wrap gap-3">
                                        {Object.entries(JSON.parse(selectedRelease.streamingLinks || "{}"))
                                            .sort(([keyA], [keyB]) => {
                                                const priority = ['spotify', 'youtube', 'apple'];
                                                const kA = keyA.toLowerCase();
                                                const kB = keyB.toLowerCase();
                                                const idxA = priority.findIndex(p => kA.includes(p));
                                                const idxB = priority.findIndex(p => kB.includes(p));

                                                if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                                                if (idxA !== -1) return -1;
                                                if (idxB !== -1) return 1;
                                                return keyA.localeCompare(keyB);
                                            })
                                            .map(([key, url]) => {
                                                const Icon = getIcon(key);
                                                return (
                                                    <Button
                                                        key={key}
                                                        asChild
                                                        variant="outline"
                                                        size="icon"
                                                        className="w-12 h-12 rounded-full border-gray-200 text-gray-600 hover:bg-black hover:text-white hover:border-black transition-all"
                                                        title={key.charAt(0).toUpperCase() + key.slice(1)}
                                                    >
                                                        <a href={url as string} target="_blank" rel="noopener noreferrer" className="group">
                                                            <Icon className="w-6 h-6 transition-colors fill-current group-hover:text-white" />
                                                        </a>
                                                    </Button>
                                                );
                                            })}
                                    </div>
                                </div>

                                {/* Tracklist */}
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold uppercase text-gray-400 mb-4 tracking-wider">{t('tracks')}</h4>
                                    <ul className="space-y-3">
                                        {JSON.parse(selectedRelease.tracklist || "[]").map((track: string, index: number) => (
                                            <li key={index} className="flex items-start text-gray-700 group cursor-default">
                                                <span className="w-8 text-gray-400 font-mono text-sm pt-0.5 group-hover:text-black transition-colors">
                                                    {(index + 1).toString().padStart(2, '0')}.
                                                </span>
                                                <span className="font-medium group-hover:text-black transition-colors">{track}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
