'use client'

import { useState, useEffect } from 'react'
import type { Release } from '@prisma/client'
import { createReleaseAction, updateReleaseAction, scrapeReleaseAction, autoTranslateReleaseAction } from '@/app/actions/release-admin'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Save, Loader2, Search, Sparkles, Image as ImageIcon, Download } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export function ReleaseForm({ initialData }: { initialData?: Release | null }) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [isScraping, setIsScraping] = useState(false)
    const [isTranslating, setIsTranslating] = useState(false)
    const [activeTab, setActiveTab] = useState<'hu' | 'en'>('hu')

    // Form State
    const [title, setTitle] = useState(initialData?.title || "")
    const [titleEn, setTitleEn] = useState(initialData?.titleEn || "")
    const [artist, setArtist] = useState(initialData?.artist || "")
    const [year, setYear] = useState(initialData?.year?.toString() || new Date().getFullYear().toString())
    const [coverUrl, setCoverUrl] = useState(initialData?.coverUrl || "")
    const [promoLink, setPromoLink] = useState(initialData?.promoLink || "")

    // Textarea states
    const [tracklistText, setTracklistText] = useState("")
    const [streamingLinksText, setStreamingLinksText] = useState("")

    // Initialize textareas from JSON
    useEffect(() => {
        if (initialData) {
            try {
                const tracks = JSON.parse(initialData.tracklist || "[]")
                if (Array.isArray(tracks)) {
                    setTracklistText(tracks.join("\n"))
                }
            } catch (e) { }

            try {
                const links = JSON.parse(initialData.streamingLinks || "{}")
                const text = Object.entries(links)
                    .map(([key, url]) => `${key}: ${url}`)
                    .join("\n")
                setStreamingLinksText(text)
            } catch (e) { }
        }
    }, [initialData])

    const handleScrape = async () => {
        if (!promoLink) return
        setIsScraping(true)
        const result = await scrapeReleaseAction(promoLink)
        setIsScraping(false)

        if (result.success && result.data) {
            const d = result.data
            setTitle(d.title)
            setArtist(d.artist)
            setYear(d.year.toString())
            setCoverUrl(d.coverUrl)

            if (d.tracklist && d.tracklist.length > 0) {
                setTracklistText(d.tracklist.join("\n"))
            }

            if (d.streamingLinks) {
                const text = Object.entries(d.streamingLinks)
                    .map(([key, url]) => `${key}: ${url}`)
                    .join("\n")
                setStreamingLinksText(text)
            }
        } else {
            alert("Nem sikerült az adatok lekérése.")
        }
    }

    const handleTranslate = async () => {
        if (!title) return
        setIsTranslating(true)
        try {
            const res = await autoTranslateReleaseAction(title)
            setTitleEn(res)
        } catch (e) {
            console.error(e)
        } finally {
            setIsTranslating(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)

        const formData = new FormData(e.currentTarget)
        
        // Serialize textareas to JSON
        const tracks = tracklistText.split("\n").map(t => t.trim()).filter(t => t.length > 0)
        formData.set("tracklist", JSON.stringify(tracks))

        const links: Record<string, string> = {}
        streamingLinksText.split("\n").forEach(line => {
            const parts = line.split(":")
            if (parts.length >= 2) {
                const key = parts[0].trim().toLowerCase()
                const url = parts.slice(1).join(":").trim()
                if (key && url) {
                    links[key] = url
                }
            }
        })
        formData.set("streamingLinks", JSON.stringify(links))
        
        formData.set("title", title)
        formData.set("titleEn", titleEn)
        formData.set("artist", artist)
        formData.set("year", year)
        formData.set("coverUrl", coverUrl)
        formData.set("promoLink", promoLink)

        try {
            if (initialData) {
                await updateReleaseAction(initialData.id, null, formData)
            } else {
                await createReleaseAction(null, formData)
            }
            router.push('/admin/releases')
            router.refresh()
        } catch (error) {
            console.error(error)
            alert('Hiba történt a mentés során')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto pb-20 space-y-8">
            <div className="flex items-center justify-between sticky top-0 bg-gray-50/90 backdrop-blur-sm z-30 py-4 border-b">
                <div className="flex items-center gap-4">
                    <Link href="/hu/admin/releases">
                        <Button variant="ghost" size="icon" type="button">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-800">
                        {initialData ? 'Kiadvány Szerkesztése' : 'Új Kiadvány'}
                    </h1>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="flex bg-white p-1 rounded-lg border shadow-sm mr-4">
                        <button
                            type="button"
                            onClick={() => setActiveTab('hu')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'hu' ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:text-gray-800'}`}
                        >
                            Magyar
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('en')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'en' ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:text-gray-800'}`}
                        >
                            English
                        </button>
                    </div>
                    <Button type="submit" disabled={isLoading} className="bg-black text-white hover:bg-gray-800 gap-2 min-w-[120px]">
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Mentés
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 space-y-4 shadow-sm">
                        <div className="flex items-center gap-2 text-blue-800 font-bold text-xs uppercase tracking-wider">
                            <Search className="w-4 h-4" />
                            Gyors Beolvasás (Landr Promo)
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="url"
                                value={promoLink}
                                onChange={(e) => setPromoLink(e.target.value)}
                                placeholder="https://artists.landr.com/..."
                                className="flex-1 rounded border px-4 py-2 text-sm focus:ring-2 focus:ring-blue-200 outline-none"
                            />
                            <Button
                                type="button"
                                onClick={handleScrape}
                                disabled={isScraping || !promoLink}
                                variant="outline"
                                className="bg-white hover:bg-gray-50 font-bold text-xs uppercase"
                            >
                                {isScraping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                                Beolvasás
                            </Button>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-xl shadow-sm border space-y-8">
                        <div className={activeTab === 'hu' ? 'space-y-6' : 'hidden'}>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Kiadvány Címe (HU)</label>
                                <input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                    className="w-full text-lg font-bold border rounded px-4 py-2.5 focus:ring-2 focus:ring-blue-100 outline-none"
                                    placeholder="Kiadvány címe"
                                />
                            </div>
                        </div>

                        <div className={activeTab === 'en' ? 'space-y-6 animate-in fade-in slide-in-from-bottom-1' : 'hidden'}>
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Release Title (EN)</label>
                                    <button 
                                        type="button" 
                                        onClick={handleTranslate}
                                        disabled={isTranslating || !title}
                                        className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 uppercase"
                                    >
                                        {isTranslating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                        Fordítás magyarból
                                    </button>
                                </div>
                                <input
                                    value={titleEn}
                                    onChange={(e) => setTitleEn(e.target.value)}
                                    className="w-full text-lg font-bold border rounded px-4 py-2.5 focus:ring-2 focus:ring-blue-100 outline-none"
                                    placeholder="English release title"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Előadó</label>
                                <input
                                    value={artist}
                                    onChange={(e) => setArtist(e.target.value)}
                                    required
                                    className="w-full border rounded px-4 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Kiadás Éve</label>
                                <input
                                    type="number"
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
                                    required
                                    className="w-full border rounded px-4 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none font-medium"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-xl shadow-sm border">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 border-b pb-2">Tracklist & Streaming</label>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-gray-500 uppercase">Dallista (Soronként egy dal)</label>
                                <textarea
                                    value={tracklistText}
                                    onChange={(e) => setTracklistText(e.target.value)}
                                    rows={10}
                                    className="w-full border rounded px-4 py-3 text-sm font-mono bg-gray-50 focus:bg-white transition-colors"
                                    placeholder="Track 1&#10;Track 2&#10;..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-gray-500 uppercase">Streaming Linkek (platform: url)</label>
                                <textarea
                                    value={streamingLinksText}
                                    onChange={(e) => setStreamingLinksText(e.target.value)}
                                    rows={10}
                                    className="w-full border rounded px-4 py-3 text-sm font-mono bg-gray-50 focus:bg-white transition-colors"
                                    placeholder="spotify: https://...&#10;apple: https://..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border sticky top-24">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Borítókép</label>
                        <div className="space-y-4">
                            <div className="aspect-square bg-gray-100 rounded-lg border-2 border-dashed flex flex-col items-center justify-center relative overflow-hidden group hover:border-blue-400 transition-colors">
                                {coverUrl ? (
                                    <img src={coverUrl} className="w-full h-full object-cover" alt="Cover" />
                                ) : (
                                    <div className="text-gray-300 text-center space-y-2">
                                        <ImageIcon className="w-10 h-10 mx-auto" />
                                        <span className="text-[10px] font-bold uppercase">Feltöltés</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                                    <input
                                        type="text"
                                        value={coverUrl}
                                        onChange={(e) => setCoverUrl(e.target.value)}
                                        placeholder="Kép URL..."
                                        className="w-full text-xs bg-white rounded px-2 py-1 outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Borítókép URL</label>
                                <input
                                    name="coverUrl"
                                    value={coverUrl}
                                    onChange={(e) => setCoverUrl(e.target.value)}
                                    className="w-full border rounded px-3 py-1.5 text-[10px] font-mono"
                                />
                            </div>
                        </div>
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                            <p className="text-[10px] text-gray-500 leading-relaxed italic">
                                <Sparkles className="w-3 h-3 inline mr-1 text-blue-400" />
                                <strong>Tipp:</strong> Ha Landr linket használsz, a borító automatikusan ide kerül az importálás során.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    )
}
