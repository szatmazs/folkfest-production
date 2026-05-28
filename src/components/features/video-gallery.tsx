"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, ListVideo } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { useTranslations } from "next-intl";
import { Video } from "@prisma/client";

interface VideoGalleryProps {
    videos: Video[];
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

function getEmbedUrl(url: string) {
    if (!url) return ''
    try {
        if (!url.includes('.') && url.length === 11) return `https://www.youtube.com/embed/${url}?autoplay=1`
        const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
        if (urlObj.hostname.includes('youtu.be')) return `https://www.youtube.com/embed/${urlObj.pathname.slice(1)}?autoplay=1`
        if (urlObj.pathname === '/playlist' && urlObj.searchParams.has('list')) {
            return `https://www.youtube.com/embed/videoseries?list=${urlObj.searchParams.get('list')}&autoplay=1`
        }
        if (urlObj.searchParams.has('v')) return `https://www.youtube.com/embed/${urlObj.searchParams.get('v')}?autoplay=1`
        return ''
    } catch { return '' }
}

function getVideoId(url: string): string | null {
    try {
        if (!url.includes('.') && url.length === 11) return url
        const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
        if (urlObj.hostname.includes('youtu.be')) return urlObj.pathname.slice(1)
        if (urlObj.searchParams.has('v')) return urlObj.searchParams.get('v')
        return null
    } catch { return null }
}

export function VideoGallery({ videos }: VideoGalleryProps) {
    const t = useTranslations('videos');
    const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
    const [metaData, setMetaData] = useState<{ [key: string]: { title?: string, thumbnail?: string } }>({});

    useEffect(() => {
        const fetchMeta = async () => {
            const newData: { [key: string]: { title?: string, thumbnail?: string } } = {};
            for (const video of videos) {
                try {
                    const res = await fetch(`https://noembed.com/embed?url=${video.videoUrl}`);
                    if (res.ok) {
                        const data = await res.json();
                        if (!data.error) {
                            newData[video.id] = {
                                title: data.title,
                                thumbnail: data.thumbnail_url
                            };
                        }
                    }
                } catch (e) {
                    console.error("Failed to fetch oEmbed data", e);
                }
            }
            setMetaData(prev => ({ ...prev, ...newData }));
        };
        if (videos.length > 0) fetchMeta();
    }, [videos]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.map((video) => {
                const vidId = getVideoId(video.videoUrl);
                const isPlaylist = video.videoUrl.includes('list=') || video.videoUrl.includes('/playlist');
                let thumbnailUrl = video.thumbnailUrl || metaData[video.id]?.thumbnail;
                if (!thumbnailUrl && vidId) thumbnailUrl = `https://img.youtube.com/vi/${vidId}/maxresdefault.jpg`;

                const rawTitle = video.title;
                const finalTitle = rawTitle || metaData[video.id]?.title || (isPlaylist ? "Playlist" : "Video");
                const displayTitle = decodeHtml(finalTitle);

                return (
                    <div
                        key={video.id}
                        className="group relative aspect-video bg-gray-100 rounded-lg overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all"
                        onClick={() => setSelectedVideo(video)}
                    >
                        {thumbnailUrl ? (
                            <img
                                src={thumbnailUrl}
                                alt={displayTitle}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                onError={(e) => {
                                    if (vidId && e.currentTarget.src.includes('maxresdefault')) {
                                        e.currentTarget.src = `https://img.youtube.com/vi/${vidId}/hqdefault.jpg`
                                    } else {
                                        e.currentTarget.style.display = 'none';
                                    }
                                }}
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-200">
                                {isPlaylist ? <ListVideo className="w-12 h-12 mb-2" /> : <Play className="w-12 h-12 mb-2" />}
                                <span className="text-sm">{isPlaylist ? "Playlist" : "No preview"}</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center pl-1 shadow-lg group-hover:scale-110 transition-transform">
                                {isPlaylist ? <ListVideo className="w-6 h-6 text-black" /> : <Play className="w-6 h-6 text-black fill-black" />}
                            </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                            <h3 className="text-white font-bold truncate">{displayTitle}</h3>
                        </div>
                    </div>
                )
            })}

            <Modal isOpen={!!selectedVideo} onClose={() => setSelectedVideo(null)} className="max-w-5xl w-[90vw]">
                {selectedVideo && (
                    <div className="flex flex-col gap-4">
                        <div className="aspect-video w-full bg-black rounded-lg overflow-hidden shadow-2xl">
                            <iframe
                                src={getEmbedUrl(selectedVideo.videoUrl)}
                                title={decodeHtml(selectedVideo.title || "Video")}
                                className="w-full h-full"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold">
                                {decodeHtml(selectedVideo.title || "Video")}
                            </h3>
                            {selectedVideo.description && (
                                <p className="text-gray-600 leading-relaxed">
                                    {selectedVideo.description}
                                </p>
                            )}
                        </div>
                        <div className="flex justify-end pt-2">
                            <Button variant="outline" onClick={() => setSelectedVideo(null)}>{t('close')}</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}
