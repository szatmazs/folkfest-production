"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Calendar, Info, Music, Ticket, MapPin, Star, ChevronRight, Heart, Phone, Mail, Globe, Users, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { YoutubeBackground } from "./youtube-background";

interface HeroSlide {
    id: string;
    backgroundType: string;
    imageUrl: string | null;
    videoUrl: string | null;
    youtubeUrl: string | null;
    youtubeStart: number | null;
    youtubeEnd: number | null;
    logoUrl?: string | null;
    title?: string | null;
    subtitle?: string | null;
    titleHighlight?: string | null;
    leftButtonLabel?: string | null;
    leftButtonLink?: string | null;
    leftButtonIcon?: string | null;
    rightButtonLabel?: string | null;
    rightButtonLink?: string | null;
    rightButtonIcon?: string | null;
}

interface HeroProps {
    subtitle?: string | null;
    title?: string | null;
    titleHighlight?: string | null;
    leftButtonLabel?: string | null;
    leftButtonLink?: string | null;
    rightButtonLabel?: string | null;
    rightButtonLink?: string | null;
    slides?: HeroSlide[];
    logo?: string | null;
    logoSize?: string | null;
    showTitle?: boolean;
    /** When provided, disables the slider and shows this single static image */
    backgroundImage?: string | null;
}

const DEFAULT_SLIDES: HeroSlide[] = [
    { id: '1', backgroundType: 'image', imageUrl: '/hero-bg.jpg', videoUrl: null, youtubeUrl: null, youtubeStart: null, youtubeEnd: null },
    { id: '2', backgroundType: 'image', imageUrl: '/vineyard-bg.jpg', videoUrl: null, youtubeUrl: null, youtubeStart: null, youtubeEnd: null },
    { id: '3', backgroundType: 'image', imageUrl: '/videok-bg.jpg', videoUrl: null, youtubeUrl: null, youtubeStart: null, youtubeEnd: null }
];

const ICON_MAP: Record<string, React.ReactNode> = {
    'calendar': <Calendar className="w-4 h-4" />,
    'ticket': <Ticket className="w-4 h-4" />,
    'info': <Info className="w-4 h-4" />,
    'music': <Music className="w-4 h-4" />,
    'map-pin': <MapPin className="w-4 h-4" />,
    'star': <Star className="w-4 h-4" />,
    'chevron-right': <ChevronRight className="w-4 h-4" />,
    'heart': <Heart className="w-4 h-4" />,
    'phone': <Phone className="w-4 h-4" />,
    'mail': <Mail className="w-4 h-4" />,
    'globe': <Globe className="w-4 h-4" />,
    'users': <Users className="w-4 h-4" />,
    'play': <Play className="w-4 h-4" />,
};

function SlideIcon({ name }: { name?: string | null }) {
    if (!name || !ICON_MAP[name]) return null;
    return <>{ICON_MAP[name]}</>;
}

export function Hero({
    subtitle,
    title,
    titleHighlight,
    leftButtonLabel,
    leftButtonLink,
    rightButtonLabel,
    rightButtonLink,
    slides,
    logo,
    logoSize = 'medium',
    showTitle = true,
    backgroundImage,
}: HeroProps) {
    // If a static backgroundImage is provided (e.g. from a sub-page with large hero),
    // we use only that single image and disable the auto-rotating slideshow.
    const isStatic = !!backgroundImage;
    const staticSlide: HeroSlide = { id: 'static', backgroundType: 'image', imageUrl: backgroundImage || '/hero-bg.jpg', videoUrl: null, youtubeUrl: null, youtubeStart: null, youtubeEnd: null };
    const activeSlides = isStatic ? [staticSlide] : (slides && slides.length > 0 ? slides : DEFAULT_SLIDES);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

    const touchStartX = useRef<number>(0);
    const touchEndX = useRef<number>(0);

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.targetTouches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.targetTouches[0].clientX;
    };

    const handleTouchEnd = () => {
        if (!touchStartX.current || !touchEndX.current) return;
        const distance = touchStartX.current - touchEndX.current;
        const minSwipeDistance = 50; // min 50px swipe

        if (distance > minSwipeDistance) {
            // Swipe left -> next slide
            setCurrentSlideIndex((prevIndex) => (prevIndex + 1) % activeSlides.length);
        } else if (distance < -minSwipeDistance) {
            // Swipe right -> prev slide
            setCurrentSlideIndex((prevIndex) => (prevIndex - 1 + activeSlides.length) % activeSlides.length);
        }

        // Reset
        touchStartX.current = 0;
        touchEndX.current = 0;
    };

    useEffect(() => {
        // Don't auto-rotate if in static mode or only 1 slide
        if (isStatic || activeSlides.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentSlideIndex((prevIndex) => (prevIndex + 1) % activeSlides.length);
        }, 10000); // Change slide every 10 seconds

        return () => clearInterval(interval);
    }, [activeSlides.length, isStatic]);

    const renderSlideBackground = (slide: HeroSlide, index: number) => {
        const isActive = index === currentSlideIndex;

        if (slide.backgroundType === 'video' && slide.videoUrl) {
            return (
                <video
                    src={slide.videoUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className={cn("w-full h-full object-cover object-center", isActive ? "" : "hidden")}
                />
            );
        }

        if (slide.backgroundType === 'youtube' && slide.youtubeUrl) {
            let embedId = "";
            const match = slide.youtubeUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
            if (match && match[1]) {
                embedId = match[1];
            }

            if (embedId) {
                return (
                    <YoutubeBackground 
                        videoId={embedId} 
                        start={slide.youtubeStart || 0} 
                        end={slide.youtubeEnd || 0} 
                        isActive={isActive} 
                    />
                );
            }
        }

        // Fallback or Image type
        return (
            <Image
                src={slide.imageUrl || "/hero-bg.jpg"}
                alt={`Hero Background ${index + 1}`}
                fill
                className="object-cover object-center grayscale animate-zoom-slow will-change-transform"
                priority={index === 0}
            />
        );
    };

    const currentSlide = activeSlides[currentSlideIndex] || activeSlides[0];

    // Determine values: use slide-specific if provided, else fallback to global.
    // KEY RULE: if a slide has ANY custom text content, it takes full control of that
    // section — null fields mean "show nothing", not "fall back to global".
    const hasSlideContent = !!(currentSlide.title || currentSlide.subtitle || currentSlide.titleHighlight);
    const activeSubtitle = hasSlideContent ? currentSlide.subtitle : subtitle;
    const activeTitle = hasSlideContent ? currentSlide.title : title;
    const activeTitleHighlight = hasSlideContent ? currentSlide.titleHighlight : titleHighlight;
    // Logo: only show if explicitly set (slide-specific or global prop)
    const activeLogo = currentSlide.logoUrl || logo || null;
    
    // Buttons logic: if a slide has ANY custom button fields, it overrides global buttons completely.
    const hasCustomButtons = !!(currentSlide.leftButtonLabel || currentSlide.leftButtonLink || currentSlide.rightButtonLabel || currentSlide.rightButtonLink);

    const activeLeftButtonLabel = hasCustomButtons ? currentSlide.leftButtonLabel : leftButtonLabel;
    const activeLeftButtonLink = hasCustomButtons ? currentSlide.leftButtonLink : leftButtonLink;
    const activeLeftButtonIcon = hasCustomButtons ? currentSlide.leftButtonIcon : null;
    const activeRightButtonLabel = hasCustomButtons ? currentSlide.rightButtonLabel : rightButtonLabel;
    const activeRightButtonLink = hasCustomButtons ? currentSlide.rightButtonLink : rightButtonLink;
    const activeRightButtonIcon = hasCustomButtons ? currentSlide.rightButtonIcon : null;

    return (
        <section 
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="relative w-full h-[100dvh] flex items-center justify-center overflow-hidden bg-black transition-all duration-700"
        >
            {/* Background Slides */}
            {activeSlides.map((slide, index) => (
                <div
                    key={slide.id}
                    className={cn(
                        "absolute inset-0 transition-opacity duration-1000 ease-in-out",
                        index === currentSlideIndex ? "opacity-100 z-0" : "opacity-0 -z-10"
                    )}
                >
                    {renderSlideBackground(slide, index)}
                </div>
            ))}
            
            {/* Dark Overlay for readability */}
            <div className="absolute inset-0 bg-black/50 z-0 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 z-0 pointer-events-none" />

            <div className="container relative z-10 px-4 text-center flex flex-col items-center">
                {activeLogo && (
                    <div className="relative mb-6 opacity-90 transition-all duration-300 flex justify-center items-center">
                        <img
                            src={activeLogo}
                            alt="Hero Logo"
                            className={cn(
                                "object-contain animate-fade-in",
                                logoSize === 'small' ? "h-20 md:h-24 max-w-[180px] md:max-w-[240px]" :
                                logoSize === 'large' ? "h-44 md:h-64 max-w-[400px] md:max-w-[560px]" :
                                "h-32 md:h-40 max-w-[280px] md:max-w-[360px]"
                            )}
                        />
                    </div>
                )}

                <div className="min-h-[160px] md:min-h-[220px] flex flex-col items-center justify-center transition-all duration-500 ease-in-out">
                    {activeSubtitle && (
                        <div className="mb-6 inline-block px-4 py-1 animate-fade-in">
                            <p className="text-xs font-bold uppercase tracking-[0.3em] text-white">
                                {activeSubtitle}
                            </p>
                        </div>
                    )}

                    {(showTitle && activeTitle || activeTitleHighlight) && (
                        <div className="mb-12 text-white leading-none max-w-5xl drop-shadow-lg flex flex-col items-center animate-fade-in">
                            {showTitle && activeTitle && (
                                <h1
                                    className="font-agnes normal-case tracking-normal block text-7xl md:text-9xl mb-2"
                                    style={{ fontFamily: "'Saint Agnes', var(--font-saint-agnes), cursive" }}
                                >
                                    {activeTitle}
                                </h1>
                            )}
                            {activeTitleHighlight && (
                                <span className="text-white font-light uppercase tracking-[0.4em] text-lg md:text-xl block">
                                    {activeTitleHighlight}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center transition-all duration-500">
                    {activeLeftButtonLabel && activeLeftButtonLink && (
                        <Button asChild className="bg-transparent hover:bg-white !text-white hover:!text-black border border-white backdrop-blur-md uppercase font-bold tracking-[0.2em] px-6 h-11 rounded-none transition-all duration-300 opacity-[0.76] hover:opacity-100 text-sm animate-fade-in">
                            <Link href={activeLeftButtonLink} className="flex items-center gap-3">
                                <SlideIcon name={activeLeftButtonIcon} />
                                {activeLeftButtonLabel}
                            </Link>
                        </Button>
                    )}

                    {activeRightButtonLabel && activeRightButtonLink && (
                        <Button asChild className="bg-white hover:bg-transparent !text-black hover:!text-white border border-white uppercase font-bold tracking-[0.2em] px-6 h-11 rounded-none transition-all duration-300 opacity-[0.76] hover:opacity-100 text-sm animate-fade-in">
                            <Link href={activeRightButtonLink} className="flex items-center gap-3">
                                <SlideIcon name={activeRightButtonIcon} />
                                {activeRightButtonLabel}
                            </Link>
                        </Button>
                    )}
                </div>
            </div>

            {/* Navigation Dots */}
            {activeSlides.length > 1 && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
                    {activeSlides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlideIndex(index)}
                            className={cn(
                                "w-2.5 h-2.5 rounded-full transition-all duration-300",
                                index === currentSlideIndex 
                                    ? "bg-white w-8" 
                                    : "bg-white/40 hover:bg-white/80"
                            )}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
