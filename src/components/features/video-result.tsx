"use client";

import { useEffect, useState } from "react";
import { Video } from "lucide-react";

interface VideoResultProps {
    url: string;
    label?: string;
    description?: string;
}

export function VideoResult({ url, label: initialLabel, description }: VideoResultProps) {
    const [label, setLabel] = useState(initialLabel);
    const [isFetching, setIsFetching] = useState(!initialLabel);

    const getYouTubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url?.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const videoId = getYouTubeId(url);

    useEffect(() => {
        if (!label && videoId) {
            fetch(`https://noembed.com/embed?url=${url}`)
                .then(res => res.json())
                .then(data => {
                    if (data.title) {
                        setLabel(data.title);
                    }
                })
                .catch(err => console.error("Failed to fetch video title", err))
                .finally(() => setIsFetching(false));
        } else {
            setIsFetching(false);
        }
    }, [url, label, videoId]);

    const displayLabel = label || "Videó";

    return (
        <div className="py-3">
            <div className="flex items-start gap-3 mb-3">
                <div className="flex-shrink-0 mt-0.5">
                    <Video className="w-5 h-5 text-gray-600" />
                </div>
                <div className="font-bold text-gray-900">
                    {isFetching ? "Betöltés..." : displayLabel}
                </div>
            </div>
            <div className="w-full max-w-lg ml-8">
                {videoId ? (
                    <div className="aspect-video w-full overflow-hidden bg-black">
                        <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${videoId}`}
                            title={displayLabel}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                ) : (
                    <a href={url} target="_blank" className="text-blue-600 hover:underline break-all">
                        {url}
                    </a>
                )}
            </div>
        </div>
    );
}
