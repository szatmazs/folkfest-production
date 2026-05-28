"use client";

import * as React from "react";
import Image from "next/image";
import { X, ZoomIn, ArrowLeft, ArrowRight } from "lucide-react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Poster {
    id: number;
    year: number;
    src: string;
}

const POSTERS: Poster[] = [
    { id: 2020, year: 2020, src: "/posters/poster-2020.jpg" },
    { id: 2021, year: 2021, src: "/posters/poster-2021.jpg" },
    { id: 2022, year: 2022, src: "/posters/poster-2022.jpg" },
    { id: 2023, year: 2023, src: "/posters/poster-2023.jpg" },
    { id: 2024, year: 2024, src: "/posters/poster-2024.jpg" },
    { id: 2025, year: 2025, src: "/posters/poster-2025.jpg" },
];

interface PosterGalleryProps {
    posters?: Poster[];
}

export function PosterGallery({ posters }: PosterGalleryProps) {
    const [selectedPoster, setSelectedPoster] = React.useState<Poster | null>(null);
    const scrollRef = React.useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = React.useState(false);

    const displayPosters = posters || POSTERS;

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const scrollAmount = 400;
            scrollRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth"
            });
        }
    };

    // Ultra-smooth auto-scroll
    React.useEffect(() => {
        if (isHovered || selectedPoster) return;
        
        const interval = setInterval(() => {
            if (scrollRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
                if (scrollLeft + clientWidth >= scrollWidth - 5) {
                    scrollRef.current.scrollLeft = 0;
                } else {
                    scrollRef.current.scrollLeft += 1;
                }
            }
        }, 30);

        return () => clearInterval(interval);
    }, [isHovered, selectedPoster]);

    // Prevent body scroll when modal is open
    React.useEffect(() => {
        if (selectedPoster) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
    }, [selectedPoster]);

    return (
        <div
            className="w-full h-full relative group/gallery"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Navigation Buttons */}
            <div className="absolute top-1/2 left-4 -translate-y-1/2 z-30 opacity-0 group-hover/gallery:opacity-100 transition-opacity duration-300">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={(e) => { e.stopPropagation(); scroll("left"); }}
                    className="rounded-full bg-white/90 shadow-xl border-gray-200 hover:bg-white !text-black h-10 w-10 flex items-center justify-center transition-all hover:scale-110"
                >
                    <ArrowLeft className="h-5 w-5 !text-black" />
                </Button>
            </div>

            <div className="absolute top-1/2 right-4 -translate-y-1/2 z-30 opacity-0 group-hover/gallery:opacity-100 transition-opacity duration-300">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={(e) => { e.stopPropagation(); scroll("right"); }}
                    className="rounded-full bg-white/90 shadow-xl border-gray-200 hover:bg-white !text-black h-10 w-10 flex items-center justify-center transition-all hover:scale-110"
                >
                    <ArrowRight className="h-5 w-5 !text-black" />
                </Button>
            </div>

            <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto py-4 h-full items-center no-scrollbar"
                style={{ 
                    scrollbarWidth: "none", 
                    msOverflowStyle: "none",
                    WebkitOverflowScrolling: "touch"
                }}
            >
                <style dangerouslySetInnerHTML={{ __html: `
                    .no-scrollbar::-webkit-scrollbar { display: none; }
                `}} />
                {displayPosters.map((poster, index) => (
                    <div
                        key={`${poster.id}-${index}`}
                        className="flex-none relative group/poster cursor-pointer w-[140px] md:w-[200px] aspect-[2/3] rounded-lg overflow-hidden shadow-xl border border-white/10 hover:border-white transition-all transform hover:scale-105 bg-black/20"
                        onClick={() => setSelectedPoster(poster)}
                    >
                        <Image
                            src={poster.src}
                            alt={`Poster ${poster.year}`}
                            fill
                            className="object-cover transition-transform duration-700 group-hover/poster:scale-110"
                            sizes="(max-width: 768px) 140px, 200px"
                            quality={80}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/poster:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <ZoomIn className="text-white w-8 h-8 drop-shadow-md" />
                        </div>
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-4 text-center">
                            <span className="text-white text-sm font-bold tracking-widest">{poster.year}</span>
                        </div>
                    </div>
                ))}
            </div>

            {selectedPoster && createPortal(
                <div
                    className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300 cursor-pointer"
                    onClick={() => setSelectedPoster(null)}
                >
                    <button
                        className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors bg-white/10 rounded-full p-2 z-50"
                        onClick={(e) => { e.stopPropagation(); setSelectedPoster(null); }}
                    >
                        <X className="w-8 h-8" />
                    </button>

                    <div
                        className="relative w-full h-full max-w-5xl max-h-[90vh] flex items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Image
                            src={selectedPoster.src}
                            alt={`Somló FolkFest ${selectedPoster.year}`}
                            fill
                            className="object-contain"
                            priority
                            quality={100}
                            unoptimized
                        />
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
