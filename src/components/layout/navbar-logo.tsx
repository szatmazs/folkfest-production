"use client"
import Image from "next/image"
import { useContext } from "react"
import { NavbarContext } from "./navbar-shell"
import { cn } from "@/lib/utils"

export function NavbarLogo() {
    const isScrolled = useContext(NavbarContext)

    return (
        <div className="relative h-12 w-48">
            <Image
                src="/logo.png"
                alt="FolkFest Logo"
                fill
                className={cn(
                    "object-contain object-left transition-all duration-300",
                    !isScrolled && "brightness-0 invert"
                )}
                priority
            />
        </div>
    )
}
