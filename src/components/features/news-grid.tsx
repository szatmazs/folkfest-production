"use client";

import { useState } from "react";
import { Facebook, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

interface NewsPost {
    id: string | number;
    date: string;
    content: string;
    image?: string | null;
    likes: number | string;
    videoUrl?: string | null;
    link?: string;
    customTitle?: string | null;
}

interface NewsGridProps {
    posts: NewsPost[];
    profilePicture: string;
}

export function NewsGrid({ posts, profilePicture }: NewsGridProps) {
    const [selectedPost, setSelectedPost] = useState<NewsPost | null>(null);

    const getThumbnail = (post: NewsPost) => {
        if (post.videoUrl) {
            const match = post.videoUrl.match(/\/embed\/([^/?]+)/);
            if (match && match[1]) {
                return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
            }
        }
        return post.image || null;
    };

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => {
                    const thumbnail = getThumbnail(post);

                    return (
                        <div
                            key={post.id}
                            onClick={() => setSelectedPost(post)}
                            className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full cursor-pointer group"
                        >
                            {/* Card Header */}
                            <div className="p-4 flex items-center gap-3 border-b border-gray-100 bg-gray-50/50">
                                <div className="h-10 w-10 shrink-0 bg-white rounded-full overflow-hidden border border-gray-200 flex items-center justify-center">
                                    <img src={profilePicture} alt="Profile" className="h-full w-full object-cover" />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-sm text-gray-900 truncate">FolkFest Hungary</p>
                                    <p className="text-xs text-gray-500">{post.date}</p>
                                </div>
                            </div>

                            {/* Image/Video Thumb */}
                            {thumbnail && (
                                <div className="w-full h-48 bg-gray-100 overflow-hidden relative">
                                    <img src={thumbnail} alt="Post content" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                    {post.videoUrl && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                                            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                                                <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-black border-b-8 border-b-transparent ml-1"></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Content */}
                            <div className="p-4 flex flex-col flex-grow">
                                {post.customTitle && (
                                    <h3 className="mb-2 font-bold text-gray-900 line-clamp-2">
                                        {post.customTitle}
                                    </h3>
                                )}
                                <p className={cn(
                                    "text-gray-700 text-sm leading-relaxed mb-4 flex-grow",
                                    thumbnail ? "line-clamp-4" : "line-clamp-10"
                                )}>
                                    {post.content}
                                </p>

                                <div className="pt-4 mt-auto border-t border-gray-50 flex items-center justify-end">
                                    {post.link && (
                                        <span className="text-xs text-gray-400 group-hover:text-gray-600 transition-colors font-medium flex items-center gap-1">
                                            Tovább <ArrowRight className="h-3 w-3" />
                                        </span>
                                    )}
                                </div>
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
                                <img src={profilePicture} alt="Profile" className="h-full w-full object-cover" />
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
                                        Megnyitás Facebookon
                                    </a>
                                )}
                            </div>
                            <Button variant="outline" size="sm" onClick={() => setSelectedPost(null)}>
                                Bezárás
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
}
