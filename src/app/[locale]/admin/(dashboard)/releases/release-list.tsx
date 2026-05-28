"use client"

import { Release } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash, ExternalLink, Save, Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { deleteReleaseAction } from "@/app/actions/release-admin"
import { saveTranslationFiles, getTranslationFiles } from "@/app/actions/translations-admin"
import { useTransition, useState } from "react"

interface PageStrings {
    huTitle: string
    huSubtitle: string
    enTitle: string
    enSubtitle: string
}

interface ReleaseListProps {
    initialReleases: Release[]
    pageStrings: PageStrings
}

export function ReleaseList({ initialReleases, pageStrings }: ReleaseListProps) {
    const [isPending, startTransition] = useTransition();
    const [isSaving, setIsSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    const [huTitle, setHuTitle] = useState(pageStrings.huTitle)
    const [huSubtitle, setHuSubtitle] = useState(pageStrings.huSubtitle)
    const [enTitle, setEnTitle] = useState(pageStrings.enTitle)
    const [enSubtitle, setEnSubtitle] = useState(pageStrings.enSubtitle)

    const handleDelete = async (id: string) => {
        if (confirm("Biztosan törölni szeretnéd ezt a kiadványt?")) {
            startTransition(async () => {
                await deleteReleaseAction(id);
            });
        }
    }

    const handleSaveStrings = async () => {
        setIsSaving(true)
        try {
            const { hu, en } = await getTranslationFiles()
            const newHu = { ...(hu as any), releases: { ...(hu as any).releases, title: huTitle, subtitle: huSubtitle } }
            const newEn = { ...(en as any), releases: { ...(en as any).releases, title: enTitle, subtitle: enSubtitle } }
            await saveTranslationFiles(newHu, newEn)
            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
        } catch (e) {
            alert('Hiba: ' + String(e))
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">Kiadványok</h1>
                <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all">
                    <Link href="/admin/releases/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Új Kiadvány
                    </Link>
                </Button>
            </div>

            {/* Oldal cím/alcím szerkesztő */}
            <div className="bg-white rounded-xl border shadow-sm p-5 space-y-4">
                <div className="flex items-center justify-between mb-1">
                    <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wider">Oldal cím és alcím</h2>
                    <div className="flex items-center gap-2">
                        {saved && <span className="text-green-600 text-xs font-medium bg-green-50 px-2 py-1 rounded-full">Mentve!</span>}
                        <Button size="sm" onClick={handleSaveStrings} disabled={isSaving} className="bg-black text-white hover:bg-gray-800 gap-1.5 h-8">
                            {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                            Mentés
                        </Button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-base">🇭🇺</span>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Magyar</span>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Cím</label>
                            <input
                                value={huTitle}
                                onChange={e => setHuTitle(e.target.value)}
                                className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-gray-200 outline-none"
                                placeholder="pl. Kiadványok"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Alcím</label>
                            <input
                                value={huSubtitle}
                                onChange={e => setHuSubtitle(e.target.value)}
                                className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-gray-200 outline-none"
                                placeholder="pl. A FolkFest Kulturális Egyesület kiadványai"
                            />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-base">🇬🇧</span>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">English</span>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Title</label>
                            <input
                                value={enTitle}
                                onChange={e => setEnTitle(e.target.value)}
                                className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-300 outline-none"
                                placeholder="e.g. Publications"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Subtitle</label>
                            <input
                                value={enSubtitle}
                                onChange={e => setEnSubtitle(e.target.value)}
                                className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-300 outline-none"
                                placeholder="e.g. Publications of the FolkFest Cultural Association"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3">Borító</th>
                                <th className="px-6 py-3">Előadó & Cím</th>
                                <th className="px-6 py-3">Év</th>
                                <th className="px-6 py-3 text-right">Műveletek</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {initialReleases.map((release) => (
                                <tr key={release.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-gray-50">
                                            <Image
                                                src={release.coverUrl}
                                                alt={release.title}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-gray-900">{release.title}</div>
                                        <div className="text-gray-500 text-xs mt-1 uppercase tracking-wide">{release.artist}</div>
                                        {release.promoLink && (
                                            <a href={release.promoLink} target="_blank" className="inline-flex items-center text-xs text-blue-500 hover:text-blue-700 mt-1 gap-1">
                                                Link <ExternalLink className="w-3 h-3" />
                                            </a>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 font-medium">
                                        {release.year}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="icon" asChild className="h-8 w-8 hover:text-blue-600 hover:bg-blue-50">
                                                <Link href={`/admin/releases/${release.id}`}>
                                                    <Pencil className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => handleDelete(release.id)}
                                                disabled={isPending}
                                            >
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {initialReleases.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                                        Nincs még feltöltött kiadvány.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
