"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import { useTranslations } from "next-intl";

// Mock Data for 10 Posts
// ... (rest of mock data)
const MOCK_POSTS = Array.from({ length: 10 }).map((_, i) => ({
    id: i,
    date: `2024. december ${15 - i}.`,
    content: i % 2 === 0
        ? "Örömmel jelentjük, hogy a soron következő táncházunk vendége a híres Kerekes Band lesz! Gyertek el minél többen, fergeteges hangulat várható."
        : "Pillanatképek a tegnapi szakmai napról. Köszönjük az előadóknak a színvonalas prezentációkat és a résztvevőknek az aktív közreműködést.",
    image: null,
    videoUrl: null,
    likes: 120 + i * 5,
    link: "#",
    customTitle: null
}));

interface Post {
    id: string | number;
    date: string;
    content: string;
    image?: string | null;
    likes: number | string;
    videoUrl?: string | null;
    link?: string;
    customTitle?: string | null;
}

interface FacebookCarouselProps {
    posts?: Post[];
    profilePicture?: string | null;
}

export function FacebookCarousel({ posts = [], profilePicture }: FacebookCarouselProps) {
    const t = useTranslations('common');
    const rawPosts = (posts.length > 0 ? posts : MOCK_POSTS) as Post[];
    // Quadruple posts to ensure enough content for smooth loop on wide screens
    // Use useMemo to avoid re-creation on render
    const displayPosts = React.useMemo(() => [...rawPosts, ...rawPosts, ...rawPosts, ...rawPosts], [rawPosts]);

    const avatar = profilePicture || "/logo.png"; // Fallback to logo
    const scrollRef = React.useRef<HTMLDivElement>(null);
    const [selectedPost, setSelectedPost] = React.useState<Post | null>(null);
    const [isHovered, setIsHovered] = React.useState(false);
    const [isDragging, setIsDragging] = React.useState(false);
    const [startX, setStartX] = React.useState(0);
    const [scrollLeftState, setScrollLeftState] = React.useState(0);
    const [dragDistance, setDragDistance] = React.useState(0);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!scrollRef.current) return;
        setIsDragging(true);
        setStartX(e.pageX - scrollRef.current.offsetLeft);
        setScrollLeftState(scrollRef.current.scrollLeft);
        setDragDistance(0);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (!scrollRef.current) return;
        setIsDragging(true);
        setStartX(e.touches[0].pageX - scrollRef.current.offsetLeft);
        setScrollLeftState(scrollRef.current.scrollLeft);
        setDragDistance(0);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
        setIsHovered(false);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !scrollRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX) * 1.5; // Scroll speed multiplier
        scrollRef.current.scrollLeft = scrollLeftState - walk;
        setDragDistance(Math.abs(x - startX));
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging || !scrollRef.current) return;
        const x = e.touches[0].pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX) * 1.5;
        scrollRef.current.scrollLeft = scrollLeftState - walk;
        setDragDistance(Math.abs(x - startX));
    };

    React.useEffect(() => {
        let animationFrameId: number;

        const animate = () => {
            if (scrollRef.current && !isHovered && !isDragging) {
                const { scrollLeft, scrollWidth } = scrollRef.current;

                // Move logic
                scrollRef.current.scrollLeft += 0.4; // Speed

                // Infinite Loop reset
                const singleSetWidth = scrollWidth / 4;

                if (scrollLeft >= singleSetWidth) {
                    scrollRef.current.scrollLeft -= singleSetWidth;
                } else if (scrollLeft <= 0) {
                    scrollRef.current.scrollLeft += singleSetWidth;
                }
            }
            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => cancelAnimationFrame(animationFrameId);
    }, [isHovered, isDragging]);

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const scrollAmount = 400;
            if (direction === "left") {
                scrollRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
            } else {
                scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
            }
        }
    };

    const getThumbnail = (post: Post) => {
        if (post.videoUrl) {
            const match = post.videoUrl.match(/\/embed\/([^/?]+)/);
            if (match && match[1]) {
                // Using hqdefault because maxresdefault is not available for all videos
                return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
            }
        }
        return post.image || null;
    };

    return (
        <div
            className="relative group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
        >
            {/* Scroll Buttons - Hover only */}
            <div className="absolute top-1/2 -left-4 md:-left-6 -translate-y-1/2 z-10 hidden md:block opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={(e) => {
                        e.stopPropagation();
                        scroll("left");
                    }}
                    className="rounded-full bg-white shadow-md border-gray-200 hover:bg-gray-100 hover:text-black h-12 w-12"
                >
                    <ArrowLeft className="h-6 w-6" />
                </Button>
            </div>

            <div className="absolute top-1/2 -right-4 md:-right-6 -translate-y-1/2 z-10 hidden md:block opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={(e) => {
                        e.stopPropagation();
                        scroll("right");
                    }}
                    className="rounded-full bg-white shadow-md border-gray-200 hover:bg-gray-100 hover:text-black h-12 w-12"
                >
                    <ArrowRight className="h-6 w-6" />
                </Button>
            </div>

            {/* Carousel Container */}
            <div
                ref={scrollRef}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onTouchMove={handleTouchMove}
                className={cn(
                    "flex gap-6 overflow-x-hidden pb-8 px-4 select-none touch-pan-y",
                    isDragging ? "cursor-grabbing" : "cursor-grab"
                )}
            >
                {displayPosts.map((post, index) => {
                    const thumbnail = getThumbnail(post);
                    return (
                        <div
                            key={`${post.id}-${index}`}
                            onClick={() => {
                                // Only open modal if it wasn't a drag
                                if (dragDistance < 10) {
                                    setSelectedPost(post);
                                }
                            }}
                            className="flex-none w-[85%] sm:w-[45%] md:w-[32%] lg:w-[24%] bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col cursor-pointer"
                        >
                            {/* Card Header */}
                            <div className="p-4 flex items-center gap-3 border-b border-gray-100 bg-gray-50/50 pointer-events-none">
                                <div className="h-10 w-10 shrink-0 bg-white rounded-full overflow-hidden border border-gray-200 flex items-center justify-center">
                                    <img src={avatar} alt="Profile" className="h-full w-full object-cover" />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-sm text-gray-900 truncate">FolkFest Hungary</p>
                                    <p className="text-xs text-gray-500">{post.date}</p>
                                </div>
                            </div>

                            {/* Post Image (if available or video thumbnail) */}
                            {thumbnail && (
                                <div className="w-full h-48 bg-gray-100 overflow-hidden pointer-events-none">
                                    <img src={thumbnail} alt="Post content" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                                </div>
                            )}

                            {/* Content */}
                            <div className="p-4 flex flex-col flex-grow pointer-events-none">
                                {/* Custom Title Display */}
                                {post.customTitle && (
                                    <h3 className="mb-2 font-bold text-gray-900 line-clamp-2">
                                        {post.customTitle}
                                    </h3>
                                )}
                                <p className={cn(
                                    "text-gray-700 text-sm leading-relaxed mb-4 flex-grow",
                                    thumbnail ? "line-clamp-3" : "line-clamp-6"
                                )}>
                                    {post.content}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>


            {/* Post Modal */}
            <Modal isOpen={!!selectedPost} onClose={() => setSelectedPost(null)}>
                {selectedPost && (
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                            <div className="h-10 w-10 shrink-0 bg-white rounded-full overflow-hidden border border-gray-200 flex items-center justify-center">
                                <img src={avatar} alt="Profile" className="h-full w-full object-cover" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">FolkFest Hungary</h3>
                                <p className="text-sm text-gray-500">{selectedPost.date}</p>
                            </div>
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto pr-2">
                            {selectedPost.videoUrl ? (
                                <div className="mb-4 rounded-lg overflow-hidden border border-gray-100 aspect-video">
                                    <iframe
                                        src={selectedPost.videoUrl}
                                        className="w-full h-full"
                                        title="Facebook Video"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                            ) : selectedPost.image && (
                                <div className="mb-4 rounded-lg overflow-hidden border border-gray-100">
                                    <img src={selectedPost.image} alt="Post" className="w-full h-auto" />
                                </div>
                            )}

                            {/* Custom Title in Modal */}
                            {selectedPost.customTitle && (
                                <h2 className="mb-3 text-xl font-bold text-gray-900">
                                    {selectedPost.customTitle}
                                </h2>
                            )}

                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {selectedPost.content}
                            </p>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-2">
                                <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                                    <Facebook className="h-3 w-3" />
                                    {selectedPost.likes} Likes
                                </span>
                                {selectedPost.link && (
                                    <a href={selectedPost.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">
                                        {t('open_on_facebook')}
                                    </a>
                                )}
                            </div>
                            <Button variant="outline" size="sm" onClick={() => setSelectedPost(null)}>
                                {t('close')}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
