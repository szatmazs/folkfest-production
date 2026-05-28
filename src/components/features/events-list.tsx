"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, Clock, Facebook } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface Event {
    id: string;
    title: string;
    dateLong: string;
    day: string;
    month: string;
    year: string;
    time: string;
    location: string;
    category: string;
    description: string;
    cover: string | null;
}

interface EventsListProps {
    events: Event[];
}

export function EventsList({ events }: EventsListProps) {
    const t = useTranslations('common');
    const [selectedEvent, setSelectedEvent] = React.useState<Event | null>(null);

    return (
        <div className="container mx-auto max-w-4xl space-y-6">
            {events.map((event) => (
                <div
                    key={event.id}
                    className="bg-white border border-gray-200 p-6 md:p-8 flex flex-col md:flex-row gap-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setSelectedEvent(event)}
                >
                    <div className="flex flex-col items-center justify-center bg-gray-100 p-4 min-w-[100px] text-center shrink-0">
                        <span className="text-3xl font-bold block">{event.day}</span>
                        <span className="text-xs uppercase tracking-widest text-gray-500 block">{event.month}</span>
                        <span className="text-xs font-bold text-gray-400 mt-1 block">{event.year}</span>
                    </div>

                    {event.cover && (
                        <div className="md:w-48 shrink-0">
                            <img src={event.cover} alt={event.title} className="w-full h-32 object-cover rounded shadow-sm" />
                        </div>
                    )}

                    <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wide text-gray-400">
                            <span className="text-black bg-gray-200 px-2 py-0.5">{event.category}</span>
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {event.time}</span>
                        </div>
                        <h3 className="text-2xl font-bold uppercase">{event.title}</h3>
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                            {event.description}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500 pt-2">
                            <MapPin className="h-4 w-4" />
                            {event.location}
                        </div>
                    </div>

                    <div className="flex items-center justify-end">
                        <Button className="w-full md:w-auto bg-black text-white hover:bg-gray-800 uppercase font-bold tracking-wider rounded-none">
                            {t('details')}
                        </Button>
                    </div>
                </div>
            ))}

            <Modal isOpen={!!selectedEvent} onClose={() => setSelectedEvent(null)}>
                {selectedEvent && (
                    <div className="flex flex-col gap-4">
                        {/* Header */}
                        <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
                            <div className="flex flex-col items-center justify-center bg-gray-100 p-2 min-w-[60px] rounded text-center shrink-0">
                                <span className="text-xl font-bold block">{selectedEvent.day}</span>
                                <span className="text-[10px] uppercase tracking-widest text-gray-500 block">{selectedEvent.month}</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg leading-tight">{selectedEvent.title}</h3>
                                <p className="text-sm text-gray-500">{selectedEvent.dateLong} &bull; {selectedEvent.time}</p>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="max-h-[60vh] overflow-y-auto pr-2">
                            {selectedEvent.cover && (
                                <div className="mb-4 rounded-lg overflow-hidden border border-gray-100">
                                    <img src={selectedEvent.cover} alt="Cover" className="w-full h-auto" />
                                </div>
                            )}

                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 bg-gray-50 p-2 rounded">
                                <MapPin className="h-4 w-4" />
                                <span>{selectedEvent.location}</span>
                            </div>

                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {selectedEvent.description}
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <a
                                href={`https://facebook.com/${selectedEvent.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-bold"
                            >
                                <Facebook className="h-3 w-3" />
                                {t('open_on_facebook')}
                            </a>
                            <Button variant="outline" size="sm" onClick={() => setSelectedEvent(null)}>
                                {t('close')}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
