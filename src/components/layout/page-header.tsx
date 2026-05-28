"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    image?: string | null;
    imagePosition?: string;
    imageClassName?: string;
    titleClassName?: string;
    subtitleClassName?: string;
}

export function PageHeader({
    title,
    subtitle,
    image,
    imagePosition = "object-top",
    imageClassName,
    titleClassName,
    subtitleClassName
}: PageHeaderProps) {
    return (
        <section className="relative w-full h-[50vh] min-h-[400px] flex items-center justify-center -mt-20 overflow-hidden bg-black">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src={image || "/hero-bg.jpg"}
                    alt={title}
                    fill
                    className={cn("object-cover animate-zoom-slow will-change-transform", imagePosition, imageClassName)}
                    quality={90}
                    priority
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/50" />
            </div>

            {/* Content */}
            <div className="relative z-10 text-center px-4 mt-20 flex flex-col items-center">
                {subtitle && (
                    <p className={cn("text-white/80 font-bold tracking-[0.2em] uppercase text-sm md:text-base mb-4 animate-fade-in-up", subtitleClassName)}>
                        {subtitle}
                    </p>
                )}
                <h1 className={cn("text-3xl md:text-5xl font-black uppercase text-white tracking-tight drop-shadow-xl animate-fade-in-up delay-100", titleClassName)}>
                    {title}
                </h1>
            </div>
        </section>
    );
}
