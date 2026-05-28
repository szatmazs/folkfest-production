"use client";

import * as React from "react";
import Image from "next/image";
import { Video } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Play, ArrowLeft, ArrowRight } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { useLocale } from 'next-intl';
import { cn } from "@/lib/utils";

interface HomeVideoCarouselProps {
    videos: Video[];
}

function getEmbedUrl(url: string) {
    if (!url) return ''
    try {
        if (!url.includes('.') && url.length === 11) return `https://www.youtube.com/embed/${url}?autoplay=1`
        const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
        if (urlObj.pathname === '/playlist' && urlObj.searchParams.has('list')) {
            return `https://www.youtube.com/embed/videoseries?list=${urlObj.searchParams.get('list')}&autoplay=1`
        }
        if (urlObj.hostname.includes('youtu.be')) return `https://www.youtube.com/embed/${urlObj.pathname.slice(1)}?autoplay=1`
        if (urlObj.searchParams.has('v')) return `https://www.youtube.com/embed/${urlObj.searchParams.get('v')}?autoplay=1`
        return ''
    } catch { return '' }
}

function decodeHtml(text: string | null | undefined): string {
    if (!text) return "";
    return text
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
}

export function HomeVideoCarousel({ videos }: HomeVideoCarouselProps) {
    const locale = useLocale();
    const isEn = locale === 'en';
    const [selectedVideo, setSelectedVideo] = React.useState<Video | null>(null);
    const [paused, setPaused] = React.useState(false);

    if (!videos || videos.length === 0) return null;

    // Duplicate items for seamless loop
    const loopVideos = [...videos, ...videos];

    return (
        <div
            className={cn("w-full overflow-hidden relative group/carousel", paused && "carousel-paused")}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            <div className="carousel-track gap-[1px]">
                {loopVideos.map((video, index) => {
                    const displayTitle = decodeHtml(isEn ? (video.titleEn || video.title) : video.title);
                    return (
                        <div
                            key={`${video.id}-${index}`}
                            className="relative flex-none w-[280px] md:w-[400px] aspect-video group/card overflow-hidden bg-black cursor-pointer"
                            onClick={() => setSelectedVideo(video)}
                        >
                            <div className="relative w-full h-full">
                                {video.thumbnailUrl ? (
                                    <Image
                                        src={video.thumbnailUrl}
                                        alt={displayTitle}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover/card:scale-110 opacity-90 group-hover/card:opacity-100 pointer-events-none"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-900 flex items-center justify-center pointer-events-none">
                                        <Play className="w-12 h-12 text-gray-600" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover/card:opacity-90 transition-opacity pointer-events-none" />
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm border-2 border-white/50 rounded-full flex items-center justify-center text-white group-hover/card:bg-white group-hover/card:text-black group-hover/card:border-white transition-all transform scale-90 group-hover/card:scale-100">
                                        <Play className="w-6 h-6 ml-1" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <Modal
                isOpen={!!selectedVideo}
                onClose={() => setSelectedVideo(null)}
                className="max-w-5xl w-[90vw]"
            >
                {selectedVideo && (
                    <div className="flex flex-col gap-4">
                        <div className="aspect-video w-full bg-black rounded-lg overflow-hidden shadow-2xl">
                            <iframe
                                src={getEmbedUrl(selectedVideo.videoUrl)}
                                title={selectedVideo.title || "Video"}
                                className="w-full h-full"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold">{decodeHtml(isEn ? (selectedVideo.titleEn || selectedVideo.title) : (selectedVideo.title || "Videó"))}</h3>
                            {(isEn ? (selectedVideo.descriptionEn || selectedVideo.description) : selectedVideo.description) && (
                                <p className="text-gray-600">{isEn ? (selectedVideo.descriptionEn || selectedVideo.description) : selectedVideo.description}</p>
                            )}
                        </div>
                        <div className="flex justify-end pt-2">
                            <Button variant="outline" onClick={() => setSelectedVideo(null)}>{isEn ? "Close" : "Bezárás"}</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
