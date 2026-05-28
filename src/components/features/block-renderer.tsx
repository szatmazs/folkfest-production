"use client";

import { cn } from "@/lib/utils";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { GalleryLightbox } from "@/components/ui/gallery-lightbox";
import { VideoResult } from "@/components/features/video-result";
import { Block } from "@/components/admin/block-editor";
import { Facebook, Youtube, Instagram, Mail, MapPin, Phone, Globe, Twitter, Linkedin, Heart } from "lucide-react";

const IconMap: Record<string, any> = { 
    Facebook, Youtube, Instagram, Mail, MapPin, Phone, Globe, Twitter, Linkedin 
};

interface BlockRendererProps {
    content: string | null;
    className?: string;
    compact?: boolean;
    invert?: boolean;
}

export function BlockRenderer({ content, className, compact = false, invert = false }: BlockRendererProps) {
    if (!content) return null;

    let blocks: Block[] = [];
    try {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
            blocks = parsed;
        } else {
            throw new Error("Not a block array");
        }
    } catch (e) {
        return (
            <div
                className={cn("prose prose-lg max-w-none", invert ? "prose-invert text-gray-300" : "text-gray-700", className)}
                dangerouslySetInnerHTML={{ __html: content }}
            />
        );
    }

    // Group adjacent icon-link blocks and support-card blocks
    const groupedBlocks: (Block | { type: 'icon-link-group', blocks: Block[], id: string } | { type: 'support-card-group', blocks: Block[], id: string })[] = [];
    for (const block of blocks) {
        if (block.type === 'icon-link') {
            const lastGroup = groupedBlocks[groupedBlocks.length - 1];
            if (lastGroup && lastGroup.type === 'icon-link-group') {
                lastGroup.blocks.push(block);
            } else {
                groupedBlocks.push({ type: 'icon-link-group', blocks: [block], id: `group-${block.id}` });
            }
        } else if (block.type === 'support-card') {
            const lastGroup = groupedBlocks[groupedBlocks.length - 1];
            if (lastGroup && lastGroup.type === 'support-card-group') {
                lastGroup.blocks.push(block);
            } else {
                groupedBlocks.push({ type: 'support-card-group', blocks: [block], id: `group-${block.id}` });
            }
        } else {
            groupedBlocks.push(block);
        }
    }

    return (
        <div className={cn(compact ? "space-y-4" : "space-y-12 max-w-4xl mx-auto", className)}>
            {groupedBlocks.map((item) => {
                const block = item as Block;
                switch (item.type) {
                    case "support-card-group":
                        return (
                            <div key={item.id} className="grid grid-cols-1 md:grid-cols-3 gap-8 my-12">
                                {(item as any).blocks.map((b: Block) => (
                                    <div key={b.id} className="flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300">
                                        <div className="h-40 bg-gray-50 flex items-center justify-center p-8 border-b border-gray-100">
                                            {b.url ? (
                                                <img src={b.url} alt="Support Logo" className="max-w-full max-h-full object-contain" />
                                            ) : (
                                                <Heart className="w-12 h-12 text-gray-300" />
                                            )}
                                        </div>
                                        <div className="p-8 flex-1 flex flex-col items-center text-center">
                                            {b.title && <h3 className="text-xl font-bold text-gray-900 mb-4">{b.title}</h3>}
                                            {b.content && <div className="text-gray-600 text-sm mb-8 leading-relaxed flex-1 whitespace-pre-wrap">{b.content}</div>}
                                            {b.buttonLink && b.buttonLabel && (
                                                <a href={b.buttonLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-8 py-3 w-full border-2 border-black bg-transparent text-black font-bold text-sm tracking-wider uppercase hover:bg-black hover:!text-white transition-colors rounded-full">
                                                    {b.buttonLabel}
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    case "icon-link-group":
                        return (
                            <div key={item.id} className="flex flex-wrap gap-4 pt-2">
                                {(item as any).blocks.map((b: Block) => {
                                    const LinkIconComp = b.icon ? IconMap[b.icon] : Facebook;
                                    return (
                                        <a key={b.id} href={b.url || "#"} target="_blank" rel="noopener noreferrer" className={cn("p-3 rounded-full transition-all flex items-center justify-center", invert ? "bg-white/10 hover:bg-white/25 text-white" : "bg-black/5 hover:bg-black hover:text-white text-black")}>
                                            {LinkIconComp && <LinkIconComp className="h-5 w-5" />}
                                        </a>
                                    );
                                })}
                            </div>
                        );
                    case "text":
                        return (
                            <div
                                key={block.id}
                                style={block.variant?.startsWith('slab-') ? { fontFamily: 'var(--font-roboto-slab), serif' } : {}}
                                className={cn(
                                    "prose max-w-none transition-all",
                                    compact ? "" : "prose-lg",
                                    invert ? "prose-invert text-gray-300" : "text-gray-700",
                                    block.variant === 'slab-quote' && cn("italic text-left", compact ? "text-lg py-4 px-4 border-y border-white/10 bg-white/5 text-gray-300" : "text-2xl py-12 px-8 border-y-2 border-black/5 bg-gray-50/30 text-gray-800 leading-relaxed"),
                                    block.variant === 'slab-impact' && cn("font-black tracking-tight shadow-xl", compact ? "bg-white/10 text-white p-6 text-xl prose-invert" : "bg-[#1a1a1a] text-white p-10 md:p-16 text-3xl prose-invert"),
                                    block.variant === 'slab-clean' && cn("font-light uppercase leading-loose border-gray-100", compact ? "text-xs tracking-[0.2em] p-4 border text-gray-400" : "text-sm tracking-[0.4em] p-10 md:p-16 border text-gray-800"),
                                    !block.variant || block.variant === 'default' ? "" : ""
                                )}
                                dangerouslySetInnerHTML={{ __html: block.content || "" }}
                            />
                        );

                    case "logo":
                        if (!block.url) return null;
                        return (
                            <div key={block.id} className={cn("relative h-12 w-48 mx-auto md:mx-0", block.variant === 'invert' ? "invert brightness-0" : "", compact ? "my-2" : "my-6")}>
                                <img
                                    src={block.url}
                                    alt="Logo"
                                    className="h-full w-full object-contain object-center md:object-left"
                                />
                            </div>
                        );

                    case "icon-text":
                        const IconComponent = block.icon ? IconMap[block.icon] : MapPin;
                        const iconTextContent = (
                            <div className={cn("flex items-start gap-3", invert ? "text-gray-300" : "text-gray-700")}>
                                {IconComponent && <IconComponent className={cn("h-5 w-5 shrink-0 mt-0.5", invert ? "text-gray-400" : "text-gray-500")} />}
                                <div className="text-sm leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: block.content || "" }} />
                            </div>
                        );
                        
                        return (
                            <div key={block.id} className={compact ? "my-2" : "my-4"}>
                                {block.url ? (
                                    <a href={block.url} className={cn("transition-colors decoration-1 underline-offset-4 hover:underline block", invert ? "hover:text-white" : "hover:text-black")} target={block.url.startsWith('http') ? "_blank" : "_self"} rel={block.url.startsWith('http') ? "noopener noreferrer" : ""}>
                                        {iconTextContent}
                                    </a>
                                ) : (
                                    iconTextContent
                                )}
                            </div>
                        );

                    case "image":
                        if (!block.url) return null;
                        return (
                            <figure key={block.id} className={compact ? "my-2" : "my-8"}>
                                <ImageLightbox
                                    src={block.url}
                                    alt={block.caption || ""}
                                    className="w-full rounded-xl overflow-hidden shadow-lg border bg-gray-50"
                                />
                                {block.caption && (
                                    <figcaption className="text-center text-sm text-gray-500 mt-3 font-medium italic">
                                        {block.caption}
                                    </figcaption>
                                )}
                            </figure>
                        );

                    case "gallery":
                        if (!block.images || block.images.length === 0) return null;
                        return (
                            <div key={block.id} className="my-12">
                                <GalleryLightbox images={block.images} />
                            </div>
                        );

                    case "video":
                        if (!block.url) return null;
                        return (
                            <div key={block.id} className="my-12">
                                <VideoResult url={block.url} />
                            </div>
                        );

                    case "heading":
                        const level = block.level || 2;
                        const Tag = `h${level}` as any;
                        return (
                            <div
                                key={block.id}
                                style={block.variant?.startsWith('slab-') ? { fontFamily: 'var(--font-roboto-slab), serif' } : {}}
                                className={cn(
                                    "transition-all",
                                    block.variant === 'slab-quote' && "italic border-l-8 border-black pl-8 my-12 text-left",
                                    block.variant === 'slab-impact' && "font-black bg-[#1a1a1a] text-white p-10 md:p-16 my-12 uppercase tracking-tighter shadow-2xl",
                                    block.variant === 'slab-clean' && "font-light border-b border-black/10 pb-6 my-12 uppercase tracking-[0.5em] text-center text-gray-800",
                                    (!block.variant || block.variant === 'default') && cn(
                                        "pt-8 mb-4",
                                        level === 1 && "mb-8",
                                        level >= 3 && "pt-4"
                                    )
                                )}
                            >
                                <Tag className={cn(
                                    "font-extrabold uppercase tracking-tight",
                                    (!block.variant || block.variant === 'default') && cn(
                                        "text-black",
                                        level === 1 && "text-3xl md:text-5xl border-b-8 border-gray-900 pb-6 mb-4 block",
                                        level === 2 && "text-2xl md:text-4xl border-b-4 border-gray-900 pb-4 inline-block",
                                        level === 3 && "text-xl md:text-2xl border-b-2 border-gray-900 pb-2 inline-block",
                                        level === 4 && "text-lg md:text-xl border-b border-gray-900 pb-1 inline-block"
                                    ),
                                    block.variant === 'slab-quote' && "text-2xl md:text-4xl normal-case",
                                    block.variant === 'slab-impact' && "text-3xl md:text-5xl text-white leading-[0.8] font-black",
                                    block.variant === 'slab-clean' && "text-base md:text-lg text-gray-400 font-light"
                                )}>
                                    {block.content}
                                </Tag>
                            </div>
                        );

                    case "map":
                        if (!block.url) return null;

                        let mapUrl = "";
                        let mapQuery = block.url;

                        // Check if it's already an embed URL (copied from Google Maps "Embed" tab)
                        if (block.url.includes("google.com/maps/embed") || block.url.includes("pb=")) {
                            // Extract just the src URL if they pasted the whole iframe tag
                            const srcMatch = block.url.match(/src="([^"]+)"/);
                            mapUrl = srcMatch ? srcMatch[1] : block.url;
                            // Try to extract place name or coordinates from pb= parameter for directions link
                            try {
                                // 1. Try place name from !2s segment (URL-encoded)
                                const placeNameMatch = mapUrl.match(/!2s([^!]+)/);
                                if (placeNameMatch && placeNameMatch[1]) {
                                    mapQuery = decodeURIComponent(placeNameMatch[1]);
                                } else {
                                    // 2. Try coordinates: !3d = latitude, !2d = longitude
                                    const latMatch = mapUrl.match(/!3d(-?\d+\.\d+)/);
                                    const lngMatch = mapUrl.match(/!2d(-?\d+\.\d+)/);
                                    if (latMatch && lngMatch) {
                                        mapQuery = `${latMatch[1]},${lngMatch[1]}`;
                                    }
                                }
                                // 3. Fallback: try ?q= parameter
                                if (mapQuery === block.url) {
                                    const qMatch = mapUrl.match(/[?&]q=([^&]+)/);
                                    if (qMatch && qMatch[1]) {
                                        mapQuery = decodeURIComponent(qMatch[1]);
                                    }
                                }
                            } catch (e) {
                                // Fallback to raw input
                            }
                        } else {
                            // It's a regular share link or address, try to extract query
                            try {
                                // 1. Try to get place name from /place/Name+Here/
                                const placeMatch = block.url.match(/\/place\/([^\/@?]+)/);
                                if (placeMatch && placeMatch[1]) {
                                    mapQuery = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
                                } else {
                                    // 2. Try to get coordinates from /@lat,lng
                                    const coordMatch = block.url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
                                    if (coordMatch && coordMatch[1] && coordMatch[2]) {
                                        mapQuery = `${coordMatch[1]},${coordMatch[2]}`;
                                    }
                                }
                            } catch (e) {
                                // Fallback to raw input
                            }

                            mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`;
                        }

                        const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapQuery)}`;

                        return (
                            <div key={block.id} className="w-screen relative left-1/2 -translate-x-1/2 my-20 h-[500px] bg-gray-100 shadow-inner group overflow-hidden">
                                <div className="absolute inset-0 pointer-events-none border-y border-gray-200 z-10" />
                                <iframe
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    src={mapUrl}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    className="grayscale invert-[0.05] contrast-[1.1] opacity-90 transition-all duration-1000 group-hover:grayscale-0 group-hover:invert-0 group-hover:contrast-100 group-hover:sepia-[0.3] group-hover:hue-rotate-[10deg] group-hover:saturate-[1.2] group-hover:opacity-100"
                                />
                                {/* Warm glow overlay on hover */}
                                <div className="absolute inset-0 pointer-events-none bg-orange-500/0 group-hover:bg-orange-900/5 transition-colors duration-1000 z-5" />

                                {/* Clickable marker pin – opens directions in new tab */}
                                <a
                                    href={directionsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Útvonaltervezés"
                                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-20 group/pin cursor-pointer"
                                >
                                    {/* Pulsing ring at the base */}
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                                        <div className="w-6 h-6 rounded-full bg-gray-400/30 group-hover/pin:bg-red-500/30 animate-ping transition-colors duration-300" />
                                    </div>
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                                        <div className="w-3 h-3 rounded-full bg-gray-500 group-hover/pin:bg-red-600 shadow-lg shadow-gray-400/50 group-hover/pin:shadow-red-500/50 transition-colors duration-300" />
                                    </div>
                                    {/* Teardrop pin shape */}
                                    <div
                                        className="relative drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)] group-hover/pin:drop-shadow-[0_4px_12px_rgba(220,38,38,0.5)] transition-all duration-300 group-hover/pin:scale-110"
                                        style={{
                                            width: '40px',
                                            height: '56px',
                                        }}
                                    >
                                        <svg viewBox="0 0 40 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                                            <path
                                                d="M20 0C8.954 0 0 8.954 0 20c0 14 20 36 20 36s20-22 20-36C40 8.954 31.046 0 20 0z"
                                                className="fill-white group-hover/pin:fill-red-600 transition-colors duration-300"
                                            />
                                            <circle cx="20" cy="20" r="9" className="fill-gray-100 group-hover/pin:fill-white transition-colors duration-300" />
                                            <circle cx="20" cy="20" r="5" className="fill-gray-400 group-hover/pin:fill-red-600 transition-colors duration-300" />
                                        </svg>
                                    </div>
                                </a>

                                <div className="absolute bottom-6 left-6 z-20 bg-white/95 backdrop-blur-md px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-black border border-black/10 shadow-xl transform group-hover:scale-105 transition-all duration-500">
                                    INTERAKTÍV TÉRKÉP
                                </div>
                            </div>
                        );

                    default:
                        return null;
                }
            })}
        </div>
    );
}
