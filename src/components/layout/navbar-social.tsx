"use client";

import * as React from "react";
import { Facebook, Youtube, Instagram } from "lucide-react";
import { cn } from "@/lib/utils";
import { NavbarContext } from "./navbar-shell";

export function NavbarSocial() {
    const isScrolled = React.useContext(NavbarContext);

    const socialLinks = [
        {
            name: "Facebook",
            href: "https://facebook.com/folkfestassociation",
            icon: Facebook
        },
        {
            name: "Instagram",
            href: "https://instagram.com/folkfest_hungary",
            icon: Instagram
        },
        {
            name: "YouTube",
            href: "https://youtube.com/@folkfesthungary",
            icon: Youtube
        }
    ];

    return (
        <div className="flex items-center gap-3">
            {socialLinks.map((social) => (
                <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                        "p-2 rounded-full transition-all hover:scale-110 bg-transparent border opacity-[0.76] hover:opacity-100",
                        isScrolled 
                            ? "border-black !border-black text-black !text-black" 
                            : "border-white !border-white text-white !text-white"
                    )}
                >
                    <social.icon className={cn("h-4 w-4", isScrolled ? "text-black !text-black" : "text-white !text-white")} />
                    <span className="sr-only">{social.name}</span>
                </a>
            ))}
        </div>
    );
}
