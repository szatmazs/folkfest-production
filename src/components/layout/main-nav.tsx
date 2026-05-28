"use client";

import * as React from "react";
import { Link } from "@/i18n/routing";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Facebook, Youtube, Instagram } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { NavbarContext } from "./navbar-shell";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "./language-switcher";

interface MenuItem {
    id: string;
    label: string;
    labelEn?: string | null;
    path: string;
    order: number;
    target: string;
}

interface MainNavProps {
    items: MenuItem[];
    locale: string;
}

export function MainNav({ items, locale }: MainNavProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [mounted, setMounted] = React.useState(false);
    const isScrolled = React.useContext(NavbarContext);
    const t = useTranslations('navigation');

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // Lock body scroll when menu is open
    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    const isEn = locale === 'en';

    const renderLink = (item: MenuItem, className: string) => {
        const label = isEn ? (item.labelEn || item.label) : item.label;

        if (item.path.startsWith('http')) {
            return (
                <a
                    key={item.id}
                    href={item.path}
                    target={item.target === '_blank' ? '_blank' : undefined}
                    rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
                    className={className}
                    onClick={() => setIsOpen(false)}
                >
                    {label}
                </a>
            );
        }

        return (
            <Link
                key={item.id}
                href={item.path as any}
                target={item.target === '_blank' ? '_blank' : undefined}
                rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
                className={className}
                onClick={() => setIsOpen(false)}
            >
                {label}
            </Link>
        );
    };

    return (
        <>
            {/* Desktop Menu */}
            <div className="hidden md:flex gap-4 lg:gap-6 items-center">
                {items.sort((a, b) => a.order - b.order).map((item) => renderLink(item, cn(
                    "text-[13px] font-bold uppercase tracking-wider transition-colors whitespace-nowrap",
                    isScrolled ? "text-gray-900 hover:text-gray-600" : "!text-white hover:text-gray-200 text-shadow-sm"
                )))}
            </div>

            {/* Mobile Menu Toggle & Language Switcher in Header */}
            <div className="flex md:hidden items-center gap-2">
                <LanguageSwitcher currentLocale={locale} />
                <Button variant="ghost" size="icon" className={cn(!isScrolled && "text-white hover:bg-white/10 hover:text-white")} onClick={() => setIsOpen(true)}>
                    <Menu className="h-6 w-6" />
                </Button>
            </div>

            {/* Mobile Menu Overlay */}
            {mounted && isOpen && createPortal(
                <div className="fixed inset-0 z-[100] bg-black/45 backdrop-blur-sm flex flex-col justify-center items-center gap-8 md:hidden animate-in fade-in zoom-in-95 duration-200">

                    {/* Close Button Positioned relatively to viewport */}
                    <div className="absolute top-5 right-4 bg-black/50 backdrop-blur-sm rounded-full">
                        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => setIsOpen(false)}>
                            <X className="h-6 w-6" />
                        </Button>
                    </div>

                    {/* Logo at the top of the mobile menu */}
                    <Link href="/" className="relative h-12 w-48 mb-4 block" onClick={() => setIsOpen(false)}>
                        <Image
                            src="/logo.png"
                            alt="FolkFest Logo"
                            fill
                            className="object-contain object-center brightness-0 invert"
                            priority
                        />
                    </Link>

                    <nav className="flex flex-col items-center gap-6">
                        {items.sort((a, b) => a.order - b.order).map((item) => renderLink(item, "text-2xl font-bold uppercase tracking-wider !text-white hover:!text-white/70 transition-colors whitespace-nowrap"))}
                    </nav>

                    <div className="pt-4 border-t border-white/20 w-1/2 flex flex-col items-center gap-6">
                        <Link href={"/tamogatas" as any} onClick={() => setIsOpen(false)}>
                            <Button variant="default" size="lg" className="uppercase font-bold tracking-widest bg-white !text-black hover:bg-gray-200 w-full md:w-auto">
                                {t('support')}
                            </Button>
                        </Link>

                        <div className="flex gap-4">
                            <a href="https://facebook.com/folkfestassociation" target="_blank" rel="noopener noreferrer" className="p-4 bg-white/10 !text-white rounded-full hover:bg-white hover:!text-black transition-all">
                                <Facebook className="h-6 w-6" />
                                <span className="sr-only">Facebook</span>
                            </a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-4 bg-white/10 !text-white rounded-full hover:bg-white hover:!text-black transition-all">
                                <Instagram className="h-6 w-6" />
                                <span className="sr-only">Instagram</span>
                            </a>
                            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="p-4 bg-white/10 !text-white rounded-full hover:bg-white hover:!text-black transition-all">
                                <Youtube className="h-6 w-6" />
                                <span className="sr-only">YouTube</span>
                            </a>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
