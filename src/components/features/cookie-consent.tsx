"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Cookie, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem("cookie-consent");
        if (!consent) {
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem("cookie-consent", "accepted");
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 left-6 right-6 z-[200] animate-in slide-in-from-bottom-10 fade-in duration-500">
            <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-md border border-gray-100 shadow-2xl rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
                <div className="p-4 bg-gray-50 rounded-2xl shrink-0">
                    <Cookie className="w-8 h-8 text-gray-800" />
                </div>
                
                <div className="flex-1 space-y-2 text-center md:text-left">
                    <h3 className="text-lg font-bold text-gray-900">Sütik és Adatkezelés</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                        Weboldalunk sütiket használ a szolgáltatások működtetése és a felhasználói élmény javítása érdekében. 
                        A böngészés folytatásával elfogadja az <Link href="/adatkezelesi-tajekoztato" className="font-bold underline decoration-black/20 hover:decoration-black transition-all">Adatkezelési Tájékoztatót</Link> és a <Link href="/sutikezeles" className="font-bold underline decoration-black/20 hover:decoration-black transition-all">Sütikezelési Szabályzatot</Link>.
                    </p>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <Button 
                        onClick={handleAccept}
                        className="flex-1 md:flex-none px-10 py-6 rounded-full bg-black text-white font-bold uppercase tracking-widest text-xs hover:bg-gray-800 transition-all shadow-lg hover:shadow-black/20"
                    >
                        Elfogadom
                    </Button>
                    <button 
                        onClick={() => setIsVisible(false)}
                        className="p-3 text-gray-400 hover:text-gray-900 transition-colors hidden md:block"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
