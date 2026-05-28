"use client";

import * as React from "react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { NavbarSocial } from "./navbar-social";
import { LanguageSwitcher } from "./language-switcher";
import { NavbarContext } from "./navbar-shell";
import { cn } from "@/lib/utils";

interface NavbarActionsProps {
    locale: string;
    supportLabel: string;
}

export function NavbarActions({ locale, supportLabel }: NavbarActionsProps) {
    const isScrolled = React.useContext(NavbarContext);

    return (
        <div className="hidden md:flex items-center gap-4 lg:gap-6 border-l pl-4 lg:pl-6 transition-colors duration-300" 
             style={{ borderColor: isScrolled ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)' }}>
            
            <Link href={"/tamogatas" as any} className="hidden xl:block">
                <Button 
                    variant="outline" 
                    size="sm" 
                    className={cn(
                        "bg-transparent uppercase font-bold tracking-widest transition-all h-9 px-4 text-[11px]",
                        isScrolled 
                            ? "border-black text-black hover:bg-black hover:text-white" 
                            : "border-white text-white hover:bg-white hover:text-black"
                    )}
                >
                    {supportLabel}
                </Button>
            </Link>
            
            <NavbarSocial />

            <div className={cn("w-px h-6 hidden lg:block transition-colors", isScrolled ? "bg-gray-200" : "bg-white/20")} />
            
            <LanguageSwitcher currentLocale={locale} />
        </div>
    );
}
