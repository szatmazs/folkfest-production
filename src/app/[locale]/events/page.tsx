import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, Clock } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";

import { getFacebookEvents } from "@/actions/facebook";
import { EventsList } from "@/components/features/events-list";

interface PageProps {
    params: Promise<{
        locale: string;
    }>;
}

export default async function EventsPage({ params }: PageProps) {
    const { locale } = await params;
    const isEn = locale === 'en';

    const fbEvents = await getFacebookEvents();

    const events = fbEvents.map(event => {
        const startDate = new Date(event.start_time);
        const displayTitle = isEn ? (event.nameEn || event.name) : event.name;
        const displayDescription = isEn ? (event.descriptionEn || event.description) : event.description;
        const displayPlace = isEn ? (event.placeEn?.name || event.place?.name) : event.place?.name;

        return {
            id: event.id,
            title: displayTitle,
            // Format: "2025. Január 15."
            dateLong: startDate.toLocaleDateString(isEn ? "en-US" : "hu-HU", { year: 'numeric', month: 'long', day: 'numeric' }),
            // Day for the box: "15"
            day: startDate.toLocaleDateString(isEn ? "en-US" : "hu-HU", { day: 'numeric' }).replace(/\./g, ''),
            // Month for the box: "JAN"
            month: startDate.toLocaleDateString(isEn ? "en-US" : "hu-HU", { month: 'short' }).toUpperCase().replace(/\./g, ''),
            // Year for the box
            year: startDate.getFullYear().toString(),
            time: startDate.toLocaleTimeString(isEn ? "en-US" : "hu-HU", { hour: '2-digit', minute: '2-digit' }),
            location: displayPlace || (isEn ? "Online / To be confirmed" : "Online / Pontosítás alatt"),
            category: isEn ? "Event" : "Esemény", 
            description: displayDescription || (isEn ? "No description provided." : "Nincs leírás megadva."),
            cover: event.cover?.source || null // FacebookEvent interface uses cover object with source
        };
    });

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <PageHeader 
                title={isEn ? "Event Calendar" : "Eseménynaptár"} 
                image="/esemenyek-bg.jpg" 
                imagePosition="object-center" 
            />

            <section className="py-12 px-4">
                <EventsList events={events} />
            </section>
        </div>
    );
}
