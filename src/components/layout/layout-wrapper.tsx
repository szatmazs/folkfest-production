"use client";

import { usePathname } from "next/navigation";

interface LayoutWrapperProps {
    children: React.ReactNode;
    navbar: React.ReactNode;
    footer: React.ReactNode;
}

export function LayoutWrapper({ children, navbar, footer }: LayoutWrapperProps) {
    const pathname = usePathname();
    // Also enable for login page or other auth pages if needed, but for now just admin check
    const isAdmin = pathname?.includes("/admin");

    return (
        <>
            {!isAdmin && navbar}
            <main className={!isAdmin ? "min-h-screen" : ""}>
                {children}
            </main>
            {!isAdmin && footer}
        </>
    );
}
