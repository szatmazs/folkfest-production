'use client'

import { useState } from 'react'
import { FacebookPost } from '@prisma/client'
import { togglePostVisibility, togglePostCarouselVisibility, updatePostTitle, updatePostMessageEn, syncFacebookData, deletePost } from '@/app/actions/facebook-admin'
import { Eye, EyeOff, RefreshCw, Check, LayoutTemplate, Trash2 } from 'lucide-react'

export function FacebookPostList({ posts }: { posts: FacebookPost[] }) {
    const [isSyncing, setIsSyncing] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [tempTitle, setTempTitle] = useState('')
    const [tempTitleEn, setTempTitleEn] = useState('')
    const [tempMessageEn, setTempMessageEn] = useState('')

    async function handleSync() {
        setIsSyncing(true)
        await syncFacebookData()
        setIsSyncing(false)
    }

    async function handleToggle(id: string) {
        await togglePostVisibility(id)
    }

    async function handleCarouselToggle(id: string) {
        await togglePostCarouselVisibility(id)
    }

    function startEditing(post: FacebookPost) {
        setEditingId(post.id)
        setTempTitle(post.customTitle || '')
        setTempTitleEn(post.customTitleEn || '')
        setTempMessageEn(post.messageEn || '')
    }

    async function savePost(id: string) {
        await updatePostTitle(id, tempTitle, tempTitleEn)
        await updatePostMessageEn(id, tempMessageEn)
        setEditingId(null)
    }

    async function handleDelete(id: string) {
        if (!confirm('Biztosan törölni szeretnéd ezt a bejegyzést?')) return
        await deletePost(id)
    }

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('hu-HU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <p className="text-gray-600">Összesen: {posts.length} bejegyzés</p>
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
                {posts.map((post) => (
                    <div key={post.id} className={`flex flex-col gap-4 rounded-lg border bg-white p-4 shadow-sm md:flex-row transition-all ${!post.isVisible ? 'opacity-60 bg-gray-50' : 'hover:shadow-md'}`}>
                        {/* Image Preview */}
                        <div className="h-40 w-full flex-shrink-0 md:w-48 relative group">
                            {post.localImagePath || post.fullPicture ? (
                                <img
                                    src={post.localImagePath || post.fullPicture || ''}
                                    alt="Post"
                                    className="h-full w-full rounded object-cover border"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-400 rounded">Nincs kép</div>
                            )}
                            <div className="absolute top-2 left-2 flex gap-1">
                                {post.showInCarousel && <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded shadow">Carousel</span>}
                                {!post.isVisible && <span className="bg-gray-600 text-white text-[10px] px-1.5 py-0.5 rounded shadow">Rejtett</span>}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="mb-3 flex items-center justify-between gap-2 border-b pb-2">
                                <span className="text-sm font-medium text-gray-500">{formatDate(post.createdTime)}</span>
                                
                                <div className="flex items-center gap-1">
                                    {/* Carousel Toggle */}
                                    <button
                                        onClick={() => handleCarouselToggle(post.id)}
                                        className={`rounded p-1.5 transition-colors ${post.showInCarousel ? 'text-blue-600 bg-blue-50' : 'text-gray-300 hover:bg-gray-100'}`}
                                        title={post.showInCarousel ? 'Elrejtés a Carouselből' : 'Megjelenítés a Carouselben'}
                                    >
                                        <LayoutTemplate className="h-5 w-5" />
                                    </button>

                                    {/* Visibility Toggle */}
                                    <button
                                        onClick={() => handleToggle(post.id)}
                                        className={`rounded p-1.5 transition-colors ${post.isVisible ? 'text-green-600 bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                                        title={post.isVisible ? 'Elrejtés' : 'Megjelenítés'}
                                    >
                                        {post.isVisible ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                                    </button>

                                    {/* Delete Button */}
                                    <button
                                        onClick={() => handleDelete(post.id)}
                                        className="rounded p-1.5 text-red-500 hover:bg-red-50 transition-colors"
                                        title="Törlés"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            {editingId === post.id ? (
                                <div className="space-y-3 bg-gray-50 p-3 rounded-lg border">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Egyedi Cím (HU)</label>
                                            <input
                                                type="text"
                                                className="w-full rounded border px-3 py-1.5 text-sm"
                                                value={tempTitle}
                                                onChange={(e) => setTempTitle(e.target.value)}
                                                placeholder="Cím magyarul..."
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Custom Title (EN)</label>
                                            <input
                                                type="text"
                                                className="w-full rounded border px-3 py-1.5 text-sm"
                                                value={tempTitleEn}
                                                onChange={(e) => setTempTitleEn(e.target.value)}
                                                placeholder="Title in English..."
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Message Translation (EN)</label>
                                        <textarea
                                            className="w-full rounded border px-3 py-1.5 text-sm min-h-[80px]"
                                            value={tempMessageEn}
                                            onChange={(e) => setTempMessageEn(e.target.value)}
                                            placeholder="Üzenet angol fordítása..."
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
                                            onClick={() => savePost(post.id)} 
                                            className="flex items-center gap-1.5 bg-black text-white px-4 py-1 rounded text-xs font-bold hover:bg-gray-800 transition-colors"
                                        >
                                            <Check className="h-3.5 w-3.5" /> Mentés
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    onClick={() => startEditing(post)}
                                    className="cursor-pointer group relative"
                                >
                                    <div className="mb-2">
                                        <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                            {post.customTitle || <span className="italic text-gray-400 font-normal">Nincs egyedi cím...</span>}
                                        </h3>
                                        {post.customTitleEn && (
                                            <p className="text-xs text-blue-600 font-medium">EN: {post.customTitleEn}</p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <p className="line-clamp-2 text-sm text-gray-600">
                                            {post.message}
                                        </p>
                                        {post.messageEn ? (
                                            <p className="line-clamp-1 text-[11px] text-gray-400 italic">
                                                EN: {post.messageEn}
                                            </p>
                                        ) : (
                                            <p className="text-[11px] text-red-400 italic flex items-center gap-1">
                                                <RefreshCw className="h-3 w-3" /> Nincs angol fordítás
                                            </p>
                                        )}
                                    </div>
                                    <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="bg-gray-100 text-gray-500 p-1 rounded text-[10px] font-bold uppercase">Szerkesztés</button>
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
