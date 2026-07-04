'use client'

import { useState } from 'react'
import type { Page } from '@prisma/client'
import { createPage, updatePage, autoTranslatePageAction } from '@/app/actions/page-admin'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Save, Loader2, Image as ImageIcon, Upload, Languages, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BlockEditor } from '@/components/admin/block-editor'
import { compressImageClient } from '@/lib/compress-client'

export function PageForm({ page }: { page?: Page }) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [isTranslating, setIsTranslating] = useState<string | null>(null)
    const [showSuccess, setShowSuccess] = useState(false)
    const [activeTab, setActiveTab] = useState<'hu' | 'en'>('hu')

    // Localized fields
    const [title, setTitle] = useState(page?.title || '')
    const [titleEn, setTitleEn] = useState(page?.titleEn || '')
    const [content, setContent] = useState(page?.content || '[]')
    const [contentEn, setContentEn] = useState(page?.contentEn || '[]')
    
    // Non-localized basic fields
    const [slug, setSlug] = useState(page?.slug || '')
    
    // Hero Fields
    const [heroType, setHeroType] = useState(page?.heroType || 'small')
    const [heroTitle, setHeroTitle] = useState(page?.heroTitle || '')
    const [heroTitleEn, setHeroTitleEn] = useState(page?.heroTitleEn || '')
    const [heroSubtitle, setHeroSubtitle] = useState(page?.heroSubtitle || '')
    const [heroSubtitleEn, setHeroSubtitleEn] = useState(page?.heroSubtitleEn || '')
    const [heroButtonLabel, setHeroButtonLabel] = useState(page?.heroButtonLabel || '')
    const [heroButtonLabelEn, setHeroButtonLabelEn] = useState(page?.heroButtonLabelEn || '')
    const [heroButtonLink, setHeroButtonLink] = useState(page?.heroButtonLink || '')
    const [heroLogoSize, setHeroLogoSize] = useState(page?.heroLogoSize || 'medium')
    const [heroShowTitle, setHeroShowTitle] = useState(page?.heroShowTitle ?? true)

    // File states
    const [heroImageFile, setHeroImageFile] = useState<File | null>(null)
    const [heroLogoFile, setHeroLogoFile] = useState<File | null>(null)

    // Previews
    const [heroImagePreview, setHeroImagePreview] = useState<string | null>(page?.heroImage || null)
    const [heroLogoPreview, setHeroLogoPreview] = useState<string | null>(page?.heroLogo || null)

    const handleTranslate = async (field: string, text: string, setter: (val: string) => void, currentEn?: string, originalHu?: string) => {
        if (!text) return
        setIsTranslating(field)
        try {
            const translated = await autoTranslatePageAction(text, currentEn, originalHu)
            setter(translated)
        } catch (error) {
            console.error('Translation failed:', error)
        } finally {
            setIsTranslating(null)
        }
    }

    const handleTranslateAll = async () => {
        setIsTranslating('all')
        try {
            if (title) {
                const t = await autoTranslatePageAction(title, titleEn, page?.title || undefined)
                setTitleEn(t)
            }
            if (heroTitle) {
                const t = await autoTranslatePageAction(heroTitle, heroTitleEn, page?.heroTitle || undefined)
                setHeroTitleEn(t)
            }
            if (heroSubtitle) {
                const t = await autoTranslatePageAction(heroSubtitle, heroSubtitleEn, page?.heroSubtitle || undefined)
                setHeroSubtitleEn(t)
            }
            if (heroButtonLabel) {
                const t = await autoTranslatePageAction(heroButtonLabel, heroButtonLabelEn, page?.heroButtonLabel || undefined)
                setHeroButtonLabelEn(t)
            }
            if (content && content !== '[]') {
                const t = await autoTranslatePageAction(content, contentEn, page?.content || undefined)
                setContentEn(t)
            }
        } catch (error) {
            console.error('Translation failed:', error)
        } finally {
            setIsTranslating(null)
        }
    }

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setTitle(val)
        if (!page) {
            setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)

        const formData = new FormData(e.currentTarget)
        formData.set('content', content)
        formData.set('contentEn', contentEn)
        formData.set('title', title)
        formData.set('titleEn', titleEn)
        formData.set('heroTitle', heroTitle)
        formData.set('heroTitleEn', heroTitleEn)
        formData.set('heroSubtitle', heroSubtitle)
        formData.set('heroSubtitleEn', heroSubtitleEn)
        formData.set('heroButtonLabel', heroButtonLabel)
        formData.set('heroButtonLabelEn', heroButtonLabelEn)
        formData.set('heroType', heroType)
        formData.set('heroButtonLink', heroButtonLink)
        formData.set('heroLogoSize', heroLogoSize)
        formData.set('heroShowTitle', String(heroShowTitle))

        if (heroImageFile) formData.set('heroImage', heroImageFile)
        if (heroLogoFile) formData.set('heroLogo', heroLogoFile)

        try {
            if (page) {
                await updatePage(page.id, formData)
            } else {
                await createPage(formData)
                router.push('/admin/pages')
                return
            }
            setShowSuccess(true)
            setTimeout(() => setShowSuccess(false), 3000)
            router.refresh()
        } catch (error) {
            console.error(error)
            alert('Hiba történt a mentés során')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto pb-20">
            <div className="flex items-center justify-between mb-8 sticky top-4 z-50 bg-white/90 backdrop-blur p-4 rounded-xl border shadow-sm">
                <div className="flex items-center gap-4">
                    <Link href="/hu/admin/pages">
                        <Button variant="ghost" size="icon" type="button">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-800">
                        {page ? 'Oldal Szerkesztése' : 'Új Oldal Létrehozása'}
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

                    {showSuccess && (
                        <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-medium animate-in fade-in slide-in-from-right-2">
                            Sikeres mentés!
                        </div>
                    )}
                    
                    {activeTab === 'en' && (
                        <Button 
                            type="button" 
                            onClick={handleTranslateAll} 
                            disabled={isTranslating !== null}
                            variant="outline"
                            className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                            {isTranslating === 'all' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            Oldal lefordítása
                        </Button>
                    )}

                    <Button type="submit" disabled={isLoading} className="bg-black text-white hover:bg-gray-800 gap-2 min-w-[120px]">
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Mentés
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    <div className={activeTab === 'hu' ? 'space-y-8' : 'hidden'}>
                        <div className="grid gap-6 bg-white p-8 rounded-lg shadow-sm border">
                            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b pb-2">Alapadatok (HU)</h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Oldal Címe</label>
                                    <input
                                        value={title}
                                        onChange={handleTitleChange}
                                        required
                                        className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-100 font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Slug (URL végződés)</label>
                                    <input
                                        name="slug"
                                        value={slug}
                                        onChange={(e) => setSlug(e.target.value)}
                                        required
                                        className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-100 bg-gray-50"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-lg shadow-sm border">
                            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b pb-4 mb-6">Tartalom Blokkok (HU)</h2>
                            <BlockEditor initialContent={content} onChange={setContent} />
                        </div>
                    </div>

                    <div className={activeTab === 'en' ? 'space-y-8 animate-in fade-in slide-in-from-bottom-2' : 'hidden'}>
                        <div className="bg-white p-8 rounded-lg shadow-sm border">
                            <div className="flex justify-between items-center mb-4 border-b pb-2">
                                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Base Data (EN)</h2>
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm" 
                                    className="gap-2 text-blue-600 border-blue-100 hover:bg-blue-50 h-7 text-[10px] uppercase font-bold"
                                    disabled={isTranslating === 'title'}
                                    onClick={() => handleTranslate('title', title, setTitleEn)}
                                >
                                    {isTranslating === 'title' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                    Fordítás magyarból
                                </Button>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Page Title (EN)</label>
                                <input
                                    value={titleEn}
                                    onChange={(e) => setTitleEn(e.target.value)}
                                    className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-100 font-bold"
                                    placeholder="English page title"
                                />
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-lg shadow-sm border">
                            <div className="flex justify-between items-center mb-6 border-b pb-4">
                                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Content Blocks (EN)</h2>
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm" 
                                    className="gap-2 text-blue-600 border-blue-100 hover:bg-blue-50 h-7 text-[10px] uppercase font-bold"
                                    disabled={isTranslating === 'content'}
                                    onClick={() => handleTranslate('content', content, setContentEn, contentEn, page?.content || undefined)}
                                >
                                    {isTranslating === 'content' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                                    Teljes tartalom fordítása
                                </Button>
                            </div>
                            <BlockEditor initialContent={contentEn} onChange={setContentEn} />
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-white p-6 rounded-lg shadow-sm border space-y-6 sticky top-24">
                        <h2 className="text-sm font-bold text-gray-900 border-b pb-2 uppercase tracking-widest">Hero / Fejléc</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Hero Típus</label>
                                <select
                                    value={heroType}
                                    onChange={e => setHeroType(e.target.value)}
                                    className="w-full border rounded px-3 py-2 text-sm"
                                >
                                    <option value="small">Kicsi (Csak háttér és cím)</option>
                                    <option value="large">Nagy (Fesztivál / Landing)</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="heroShowTitle"
                                    checked={heroShowTitle}
                                    onChange={(e) => setHeroShowTitle(e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                                />
                                <label htmlFor="heroShowTitle" className="text-sm font-medium text-gray-700 cursor-pointer">
                                    Cím megjelenítése
                                </label>
                            </div>

                            <div className="space-y-4 bg-gray-50 p-4 rounded-lg border">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Cím (HU)</label>
                                    <input value={heroTitle} onChange={e => setHeroTitle(e.target.value)} className="w-full border rounded px-3 py-1.5 text-sm" placeholder="Opcionális" />
                                    <div className="mt-2 pt-2 border-t">
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="text-[10px] font-bold text-blue-600 uppercase">Title (EN)</label>
                                            <button type="button" onClick={() => handleTranslate('heroTitle', heroTitle, setHeroTitleEn, heroTitleEn, page?.heroTitle || undefined)} className="text-[10px] text-gray-400 hover:text-blue-600">Auto</button>
                                        </div>
                                        <input value={heroTitleEn} onChange={e => setHeroTitleEn(e.target.value)} className="w-full border rounded px-3 py-1.5 text-sm bg-white" placeholder="Opcionális" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Alcím (HU)</label>
                                    <input value={heroSubtitle} onChange={e => setHeroSubtitle(e.target.value)} className="w-full border rounded px-3 py-1.5 text-sm" placeholder="Opcionális" />
                                    <div className="mt-2 pt-2 border-t">
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="text-[10px] font-bold text-blue-600 uppercase">Subtitle (EN)</label>
                                            <button type="button" onClick={() => handleTranslate('heroSubtitle', heroSubtitle, setHeroSubtitleEn, heroSubtitleEn, page?.heroSubtitle || undefined)} className="text-[10px] text-gray-400 hover:text-blue-600">Auto</button>
                                        </div>
                                        <input value={heroSubtitleEn} onChange={e => setHeroSubtitleEn(e.target.value)} className="w-full border rounded px-3 py-1.5 text-sm bg-white" placeholder="Opcionális" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Gomb Szöveg (HU)</label>
                                    <input value={heroButtonLabel} onChange={e => setHeroButtonLabel(e.target.value)} className="w-full border rounded px-3 py-1.5 text-sm" placeholder="pl. Részletek" />
                                    <div className="mt-2 pt-2 border-t">
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="text-[10px] font-bold text-blue-600 uppercase">Button (EN)</label>
                                            <button type="button" onClick={() => handleTranslate('heroBtn', heroButtonLabel, setHeroButtonLabelEn, heroButtonLabelEn, page?.heroButtonLabel || undefined)} className="text-[10px] text-gray-400 hover:text-blue-600">Auto</button>
                                        </div>
                                        <input value={heroButtonLabelEn} onChange={e => setHeroButtonLabelEn(e.target.value)} className="w-full border rounded px-3 py-1.5 text-sm bg-white" />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Gomb Link</label>
                                    <input value={heroButtonLink} onChange={e => setHeroButtonLink(e.target.value)} className="w-full border rounded px-3 py-1.5 text-sm" placeholder="pl. /kapcsolat" />
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Háttérkép</label>
                                    <div className="relative border-2 border-dashed rounded-lg hover:border-blue-400 cursor-pointer bg-gray-50 aspect-video flex flex-col items-center justify-center overflow-hidden">
                                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={async e => {
                                            const file = e.target.files?.[0]
                                            if (file) {
                                                const compressed = await compressImageClient(file)
                                                setHeroImageFile(compressed)
                                                setHeroImagePreview(URL.createObjectURL(compressed))
                                            }
                                        }} />
                                        {heroImagePreview ? (
                                            <img src={heroImagePreview} className="w-full h-full object-cover" alt="Preview" />
                                        ) : (
                                            <div className="text-gray-400 flex flex-col items-center gap-1">
                                                <ImageIcon className="w-6 h-6" />
                                                <span className="text-[10px] uppercase font-bold">Feltöltés</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {heroType === 'large' && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Logó</label>
                                            <div className="relative border-2 border-dashed rounded-lg hover:border-blue-400 cursor-pointer bg-gray-50 h-24 flex flex-col items-center justify-center overflow-hidden">
                                                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={async e => {
                                                    const file = e.target.files?.[0]
                                                    if (file) {
                                                        const compressed = await compressImageClient(file, 800)
                                                        setHeroLogoFile(compressed)
                                                        setHeroLogoPreview(URL.createObjectURL(compressed))
                                                    }
                                                }} />
                                                {heroLogoPreview ? (
                                                    <img src={heroLogoPreview} className="h-full object-contain p-2" alt="Preview" />
                                                ) : (
                                                    <Upload className="w-5 h-5 text-gray-300" />
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Logó Mérete</label>
                                            <div className="flex bg-gray-100 p-1 rounded-md">
                                                {['small', 'medium', 'large'].map((size) => (
                                                    <button
                                                        key={size}
                                                        type="button"
                                                        onClick={() => setHeroLogoSize(size)}
                                                        className={`flex-1 py-1 text-[10px] font-bold rounded transition-all ${heroLogoSize === size ? "bg-white shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                                                    >
                                                        {size.toUpperCase()}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    )
}
