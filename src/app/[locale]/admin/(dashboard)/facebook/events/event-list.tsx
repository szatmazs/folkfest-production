'use client'

import { useState } from 'react'
import { FacebookEvent } from '@prisma/client'
import { toggleEventVisibility, updateEventDetails, syncFacebookData, deleteEvent } from '@/app/actions/facebook-admin'
import { Eye, EyeOff, RefreshCw, Check, Trash2, Calendar, MapPin } from 'lucide-react'

export function FacebookEventList({ events }: { events: FacebookEvent[] }) {
    const [isSyncing, setIsSyncing] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [tempNameEn, setTempNameEn] = useState('')
    const [tempDescriptionEn, setTempDescriptionEn] = useState('')
    const [tempPlaceEn, setTempPlaceEn] = useState('')

    async function handleSync() {
        setIsSyncing(true)
        await syncFacebookData()
        setIsSyncing(false)
    }

    async function handleToggle(id: string) {
        await toggleEventVisibility(id)
    }

    function startEditing(event: FacebookEvent) {
        setEditingId(event.id)
        setTempNameEn(event.nameEn || '')
        setTempDescriptionEn(event.descriptionEn || '')
        setTempPlaceEn(event.placeEn || '')
    }

    async function saveEvent(id: string) {
        await updateEventDetails(id, tempNameEn, tempDescriptionEn, tempPlaceEn)
        setEditingId(null)
    }

    async function handleDelete(id: string) {
        if (!confirm('Biztosan törölni szeretnéd ezt az eseményt?')) return
        await deleteEvent(id)
    }

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleString('hu-HU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <p className="text-gray-600">Összesen: {events.length} esemény</p>
                <button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                    <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Szinkronizálás...' : 'Frissítés Facebookról'}
                </button>
            </div>

            <div className="space-y-4">
                {events.map((event) => (
                    <div key={event.id} className={`flex flex-col gap-4 rounded-lg border bg-white p-4 shadow-sm md:flex-row transition-all ${!event.isVisible ? 'opacity-60 bg-gray-50' : 'hover:shadow-md'}`}>
                        {/* Image Preview */}
                        <div className="h-40 w-full flex-shrink-0 md:w-48 relative group">
                            {event.localCoverPath || event.coverUrl ? (
                                <img
                                    src={event.localCoverPath || event.coverUrl || ''}
                                    alt="Event cover"
                                    className="h-full w-full rounded object-cover border"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-400 rounded">Nincs borítókép</div>
                            )}
                            <div className="absolute top-2 left-2 flex gap-1">
                                {!event.isVisible && <span className="bg-gray-600 text-white text-[10px] px-1.5 py-0.5 rounded shadow">Rejtett</span>}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="mb-3 flex items-center justify-between gap-2 border-b pb-2">
                                <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                                    <Calendar className="h-4 w-4 text-blue-500" />
                                    <span>{formatDate(event.startTime)}</span>
                                    {event.endTime && (
                                        <>
                                            <span>–</span>
                                            <span>{formatDate(event.endTime)}</span>
                                        </>
                                    )}
                                </div>
                                
                                <div className="flex items-center gap-1">
                                    {/* Visibility Toggle */}
                                    <button
                                        onClick={() => handleToggle(event.id)}
                                        className={`rounded p-1.5 transition-colors ${event.isVisible ? 'text-green-600 bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                                        title={event.isVisible ? 'Elrejtés' : 'Megjelenítés'}
                                    >
                                        {event.isVisible ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                                    </button>

                                    {/* Delete Button */}
                                    <button
                                        onClick={() => handleDelete(event.id)}
                                        className="rounded p-1.5 text-red-500 hover:bg-red-50 transition-colors"
                                        title="Törlés"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            {editingId === event.id ? (
                                <div className="space-y-3 bg-gray-50 p-3 rounded-lg border">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Angol Név (EN)</label>
                                        <input
                                            type="text"
                                            className="w-full rounded border px-3 py-1.5 text-sm"
                                            value={tempNameEn}
                                            onChange={(e) => setTempNameEn(e.target.value)}
                                            placeholder="Name in English..."
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block font-mono">Helyszín (HU: {event.place || 'Nincs'})</label>
                                            <input
                                                type="text"
                                                className="w-full rounded border px-3 py-1.5 text-sm"
                                                value={tempPlaceEn}
                                                onChange={(e) => setTempPlaceEn(e.target.value)}
                                                placeholder="Location in English..."
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Description Translation (EN)</label>
                                        <textarea
                                            className="w-full rounded border px-3 py-1.5 text-sm min-h-[100px]"
                                            value={tempDescriptionEn}
                                            onChange={(e) => setTempDescriptionEn(e.target.value)}
                                            placeholder="Esemény leírásának angol fordítása..."
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <button 
                                            onClick={() => setEditingId(null)}
                                            className="px-3 py-1 text-xs font-medium text-gray-500 hover:text-gray-700"
                                        >
                                            Mégse
                                        </button>
                                        <button 
                                            onClick={() => saveEvent(event.id)} 
                                            className="flex items-center gap-1.5 bg-black text-white px-4 py-1 rounded text-xs font-bold hover:bg-gray-800 transition-colors"
                                        >
                                            <Check className="h-3.5 w-3.5" /> Mentés
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    onClick={() => startEditing(event)}
                                    className="cursor-pointer group relative space-y-2"
                                >
                                    <div>
                                        <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors text-lg">
                                            {event.name}
                                        </h3>
                                        {event.nameEn && (
                                            <p className="text-xs text-blue-600 font-medium">EN: {event.nameEn}</p>
                                        )}
                                    </div>

                                    {(event.place || event.placeEn) && (
                                        <div className="flex items-center gap-1 text-sm text-gray-500">
                                            <MapPin className="h-3.5 w-3.5 text-red-400" />
                                            <span>{event.place}</span>
                                            {event.placeEn && <span className="text-xs text-gray-400 font-normal"> (EN: {event.placeEn})</span>}
                                        </div>
                                    )}

                                    <div className="space-y-1">
                                        <p className="line-clamp-3 text-sm text-gray-600 whitespace-pre-line">
                                            {event.description}
                                        </p>
                                        {event.descriptionEn ? (
                                            <p className="line-clamp-2 text-[11px] text-gray-400 italic whitespace-pre-line">
                                                EN: {event.descriptionEn}
                                            </p>
                                        ) : (
                                            <p className="text-[11px] text-red-400 italic flex items-center gap-1">
                                                <RefreshCw className="h-3 w-3" /> Nincs angol fordítás
                                            </p>
                                        )}
                                    </div>
                                    <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-[10px] font-bold uppercase border">Szerkesztés</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
