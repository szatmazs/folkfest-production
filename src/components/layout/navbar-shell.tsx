"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export const NavbarContext = React.createContext(false);

export function NavbarShell({ children }: { children: React.ReactNode }) {
    const [isScrolled, setIsScrolled] = React.useState(false)

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }
        // Check initial
        handleScroll()

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <NavbarContext.Provider value={isScrolled}>
            <nav className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
                isScrolled
                    ? "bg-[rgba(255,255,255,0.76)] backdrop-blur-md border-gray-200/50 shadow-sm"
                    : "bg-transparent border-transparent"
            )}>
                {children}
            </nav>
        </NavbarContext.Provider>
    )
}
