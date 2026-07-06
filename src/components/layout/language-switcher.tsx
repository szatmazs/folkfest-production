"use client";

import { usePathname, useRouter } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import * as React from "react";
import { NavbarContext } from "./navbar-shell";
import { useParams } from "next/navigation";
import { getAlternativeSlug } from "@/app/actions/page-admin";

export function LanguageSwitcher({ currentLocale, className }: { currentLocale: string, className?: string }) {
    const pathname = usePathname();
    const router = useRouter();
    const params = useParams();
    const isScrolled = React.useContext(NavbarContext);

    const toggleLanguage = async (newLocale: 'en' | 'hu') => {
        let targetParams = { ...params };

        if (params && params.slug) {
            try {
                const altSlug = await getAlternativeSlug(params.slug as string, newLocale);
                targetParams.slug = altSlug;
            } catch (e) {
                console.error("Failed to get alternative slug:", e);
            }
        }

        // Use next-intl's router.replace which handles the locale prefix automatically
        router.replace(
            // @ts-ignore
            { pathname, params: targetParams },
            { locale: newLocale }
        );
    };

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <button
                onClick={() => toggleLanguage("hu")}
                aria-label="Magyar nyelvű változat"
                className={cn(
                    "text-[10px] font-bold tracking-widest px-2 py-1 rounded transition-all",
                    currentLocale === "hu"
                        ? (isScrolled ? "bg-black text-white" : "bg-white text-black")
                        : (isScrolled ? "text-gray-400 hover:text-black" : "text-white/50 hover:text-white")
                )}
            >
                HU
            </button>
            <div className={cn("w-px h-3", isScrolled ? "bg-gray-200" : "bg-white/20")} />
            <button
                onClick={() => toggleLanguage("en")}
                aria-label="English version"
                className={cn(
                    "text-[10px] font-bold tracking-widest px-2 py-1 rounded transition-all",
                    currentLocale === "en"
                        ? (isScrolled ? "bg-black text-white" : "bg-white text-black")
                        : (isScrolled ? "text-gray-400 hover:text-black" : "text-white/50 hover:text-white")
                )}
            >
                EN
            </button>
        </div>
    );
}
