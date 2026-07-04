'use client'

import { useState, useEffect } from 'react'
import type { Project, ProjectPartner, ProjectResult, Partner } from '@prisma/client'
import { createProject, updateProject, autoTranslateProjectAction } from '@/app/actions/project-admin'
import { getPartners } from '@/app/actions/partner-admin'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Save, Loader2, Image as ImageIcon, Plus, Trash2, Link as LinkIcon, FileText, Upload, Languages, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { BlockEditor } from '@/components/admin/block-editor'
import Image from 'next/image'
import { compressImageClient } from '@/lib/compress-client'

type ExtendedProject = Project & {
    partners: ProjectPartner[]
    results: ProjectResult[]
}

export function ProjectForm({ project }: { project?: ExtendedProject }) {
    const [isLoading, setIsLoading] = useState(false)
    const [isTranslating, setIsTranslating] = useState<string | null>(null)
    const [showSuccess, setShowSuccess] = useState(false)
    const [preview, setPreview] = useState<string | null>(project?.mainImage || null)
    const [sponsorPreview, setSponsorPreview] = useState<string | null>(project?.sponsorLogo || null)
    const [sponsorPreviewEn, setSponsorPreviewEn] = useState<string | null>(project?.sponsorLogoEn || null)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const router = useRouter()

    const [activeTab, setActiveTab] = useState<'hu' | 'en'>('hu')

    const [availablePartners, setAvailablePartners] = useState<Partner[]>([])

    useEffect(() => {
        getPartners().then(setAvailablePartners)
    }, [])

    const [title, setTitle] = useState(project?.title || '')
    const [titleEn, setTitleEn] = useState(project?.titleEn || '')
    const [description, setDescription] = useState(project?.description || '')
    const [descriptionEn, setDescriptionEn] = useState(project?.descriptionEn || '')
    const [projectData, setProjectData] = useState(project?.projectData || '')
    const [projectDataEn, setProjectDataEn] = useState(project?.contentEn || '')
    
    const [mainImageFile, setMainImageFile] = useState<File | null>(null)
    const [sponsorLogoFile, setSponsorLogoFile] = useState<File | null>(null)
    const [sponsorLogoEnFile, setSponsorLogoEnFile] = useState<File | null>(null)

    const [partners, setPartners] = useState<{ name: string, link: string, country: string, logoUrl: string, file: File | null }[]>(
        project?.partners?.map(p => ({
            name: p.name, link: p.link || '', country: p.country || '', logoUrl: p.logoUrl || '', file: null
        })) || []
    )

    const [results, setResults] = useState<{ type: string, label: string, labelEn: string, content: string, contentEn: string, file: File | null, galleryFiles: File[], galleryPreviews: string[] }[]>(
        project?.results?.map(r => ({
            type: r.type,
            label: r.label || '',
            labelEn: r.labelEn || '',
            content: r.content || '',
            contentEn: r.contentEn || '',
            file: null,
            galleryFiles: [],
            galleryPreviews: r.type === 'gallery' ? (() => { try { return JSON.parse(r.content || '[]') } catch { return [] } })() : []
        })) || []
    )

    const handleTranslate = async (field: string, text: string, setter: (val: string) => void, currentEn?: string, originalHu?: string) => {
        if (!text) return
        setIsTranslating(field)
        try {
            const translated = await autoTranslateProjectAction(text, currentEn, originalHu)
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
                const t = await autoTranslateProjectAction(title, titleEn, project?.title || undefined)
                setTitleEn(t)
            }
            if (projectData) {
                const t = await autoTranslateProjectAction(projectData, projectDataEn, project?.projectData || undefined)
                setProjectDataEn(t)
            }
            if (description && description !== '[]') {
                const t = await autoTranslateProjectAction(description, descriptionEn, project?.description || undefined)
                setDescriptionEn(t)
            }
            
            // Translate results
            const newResults = [...results]
            for (let i = 0; i < newResults.length; i++) {
                const origResult = project?.results?.[i]
                if (newResults[i].label) {
                    newResults[i].labelEn = await autoTranslateProjectAction(newResults[i].label, newResults[i].labelEn, origResult?.label || undefined)
                }
                if (newResults[i].type === 'text' && newResults[i].content) {
                    newResults[i].contentEn = await autoTranslateProjectAction(newResults[i].content, newResults[i].contentEn, origResult?.content || undefined)
                }
            }
            setResults(newResults)
        } catch (error) {
            console.error('Translation failed:', error)
        } finally {
            setIsTranslating(null)
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)

        const formData = new FormData(e.currentTarget)
        formData.set('title', title)
        formData.set('titleEn', titleEn)
        formData.set('description', description)
        formData.set('descriptionEn', descriptionEn)
        formData.set('projectData', projectData)
        formData.set('contentEn', projectDataEn)

        if (mainImageFile) {
            formData.set('image', mainImageFile)
        }

        if (sponsorLogoFile) {
            formData.set('sponsorLogoFile', sponsorLogoFile)
        }

        if (sponsorLogoEnFile) {
            formData.set('sponsorLogoEnFile', sponsorLogoEnFile)
        }

        // Process Partners
        partners.forEach((p, index) => {
            formData.append(`partners[${index}][name]`, p.name)
            formData.append(`partners[${index}][link]`, p.link)
            formData.append(`partners[${index}][country]`, p.country)
            if (p.file) {
                formData.append(`partners[${index}][logo]`, p.file)
            } else if (p.logoUrl) {
                formData.append(`partners[${index}][existingLogo]`, p.logoUrl)
            }
        })

        // Process Results
        results.forEach((r, index) => {
            formData.append(`results[${index}][type]`, r.type)
            formData.append(`results[${index}][label]`, r.label)
            formData.append(`results[${index}][labelEn]`, r.labelEn)

            if (r.type === 'file' && r.file) {
                formData.append(`results[${index}][file]`, r.file)
            } else if (r.type === 'gallery') {
                r.galleryFiles.forEach((f) => {
                    formData.append(`results[${index}][galleryFiles]`, f)
                })
                formData.append(`results[${index}][existingGallery]`, r.content)
            }
            formData.append(`results[${index}][content]`, r.content)
            formData.append(`results[${index}][contentEn]`, r.contentEn)
        })

        try {
            if (project) {
                await updateProject(project.id, formData)
            } else {
                await createProject(formData)
                router.push('/admin/projects')
                return
            }
            setShowSuccess(true)
            setTimeout(() => setShowSuccess(false), 3000)
            router.refresh()
        } catch (error) {
            console.error(error)
            const msg = error instanceof Error ? error.message : 'Ismeretlen hiba történt'
            setErrorMessage(msg)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        } finally {
            setIsLoading(false)
        }
    }

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const compressed = await compressImageClient(file)
            setMainImageFile(compressed)
            const url = URL.createObjectURL(compressed)
            setPreview(url)
        }
    }

    const handleSponsorLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const compressed = await compressImageClient(file, 800)
            setSponsorLogoFile(compressed)
            const url = URL.createObjectURL(compressed)
            setSponsorPreview(url)
        }
    }

    const handleSponsorLogoEnChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const compressed = await compressImageClient(file, 800)
            setSponsorLogoEnFile(compressed)
            const url = URL.createObjectURL(compressed)
            setSponsorPreviewEn(url)
        }
    }

    const addPartner = () => setPartners([...partners, { name: '', link: '', country: '', logoUrl: '', file: null }])
    const removePartner = (index: number) => setPartners(partners.filter((_, i) => i !== index))
    const updatePartner = (index: number, field: string, value: any) => {
        const newPartners = [...partners]
        // @ts-ignore
        newPartners[index][field] = value
        setPartners(newPartners)
    }

    const addResult = () => setResults([...results, { type: 'text', label: '', labelEn: '', content: '', contentEn: '', file: null, galleryFiles: [], galleryPreviews: [] }])
    const removeResult = (index: number) => setResults(results.filter((_, i) => i !== index))
    const updateResult = (index: number, field: string, value: any) => {
        const newResults = [...results]
        // @ts-ignore
        newResults[index][field] = value
        setResults(newResults)
    }

    const addGalleryFiles = async (index: number, files: FileList) => {
        const newFiles = Array.from(files)
        const compressedFiles = await Promise.all(
            newFiles.map(file => compressImageClient(file))
        )
        const newPreviews = compressedFiles.map(f => URL.createObjectURL(f))
        const newResults = [...results]
        newResults[index].galleryFiles = [...newResults[index].galleryFiles, ...compressedFiles]
        newResults[index].galleryPreviews = [...newResults[index].galleryPreviews, ...newPreviews]
        setResults(newResults)
    }

    const removeGalleryImage = (resultIndex: number, imgIndex: number) => {
        const newResults = [...results]
        const r = newResults[resultIndex]
        const allPreviews = r.galleryPreviews
        if (imgIndex < allPreviews.length) {
            const isNew = allPreviews[imgIndex].startsWith('blob:')
            if (isNew) {
                const newFileIndex = allPreviews.slice(0, imgIndex).filter(p => p.startsWith('blob:')).length
                r.galleryFiles = r.galleryFiles.filter((_, i) => i !== newFileIndex)
            } else {
                try {
                    const saved: string[] = JSON.parse(r.content || '[]')
                    const savedIndex = allPreviews.slice(0, imgIndex + 1).filter(p => !p.startsWith('blob:')).length - 1
                    saved.splice(savedIndex, 1)
                    r.content = JSON.stringify(saved)
                } catch {}
            }
            r.galleryPreviews = allPreviews.filter((_, i) => i !== imgIndex)
        }
        setResults(newResults)
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto pb-20 space-y-8">
            {/* Error Message */}
            {errorMessage && (
                <div className="bg-red-50 border-2 border-red-200 p-6 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-red-800 font-bold flex items-center gap-2">
                            <Trash2 className="w-5 h-5" /> Hiba történt a mentés során
                        </h3>
                        <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            className="bg-white"
                            onClick={() => {
                                navigator.clipboard.writeText(errorMessage)
                                alert('Hibaüzenet másolva a vágólapra!')
                            }}
                        >
                            Hibakód másolása
                        </Button>
                    </div>
                    <textarea 
                        readOnly 
                        className="w-full bg-red-100/50 p-4 rounded border border-red-200 font-mono text-xs text-red-900 min-h-[100px]"
                        value={errorMessage}
                    />
                    <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="mt-4 text-red-700 hover:text-red-900"
                        onClick={() => setErrorMessage(null)}
                    >
                        Bezárás
                    </Button>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between sticky top-0 bg-gray-50/90 backdrop-blur-sm z-30 py-4 border-b">
                <div className="flex items-center gap-4">
                    <Link href="/hu/admin/projects">
                        <Button variant="ghost" size="icon" type="button">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-800">
                        {project ? 'Projekt Szerkesztése' : 'Új Projekt Létrehozása'}
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
                            Projekt lefordítása
                        </Button>
                    )}

                    <Button type="submit" disabled={isLoading} className="bg-black text-white hover:bg-gray-800 gap-2 min-w-[120px]">
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Mentés
                    </Button>
                </div>
            </div>

            <div className={activeTab === 'hu' ? 'space-y-8' : 'hidden'}>
                {/* 1. Cím és Támogatói Logó */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-3 bg-white p-6 rounded-lg shadow-sm border">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Projekt Címe (HU)</label>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="w-full text-lg font-bold border rounded px-4 py-3 focus:ring-2 focus:ring-blue-100 outline-none"
                            placeholder="Projekt címe"
                        />
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Támogatói Logó</label>
                        <div className="relative h-[52px] w-full bg-gray-50 border border-dashed rounded flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:border-blue-400">
                            {sponsorPreview ? (
                                <img
                                    src={sponsorPreview}
                                    className="h-full w-full object-contain p-1"
                                    alt="Sponsor Logo"
                                />
                            ) : (
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Upload className="w-4 h-4" />
                                    <span className="text-xs">Feltöltés</span>
                                </div>
                            )}
                            <input
                                type="file"
                                name="sponsorLogoFile"
                                accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={handleSponsorLogoChange}
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Projekt Adatok */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Projekt Adatok (HU)</label>
                    <RichTextEditor content={projectData} onChange={setProjectData} className="min-h-[200px]" />
                </div>

                {/* 3. Leírás */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <label className="block text-sm font-medium text-gray-700 mb-4 font-bold">Fő Tartalom / Leírás (HU)</label>
                    <BlockEditor initialContent={description} onChange={setDescription} />
                </div>
            </div>

            <div className={activeTab === 'en' ? 'space-y-8 animate-in fade-in slide-in-from-bottom-2' : 'hidden'}>
                {/* 1. Cím és Támogatói Logó (EN) */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-3 bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700 font-bold">Project Title (EN)</label>
                            <Button 
                                type="button" 
                                variant="outline" 
                                size="sm" 
                                className="gap-2 text-blue-600 border-blue-100 hover:bg-blue-50"
                                disabled={isTranslating === 'title'}
                                onClick={() => handleTranslate('title', title, setTitleEn, titleEn, project?.title || undefined)}
                            >
                                {isTranslating === 'title' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                Fordítás magyarból
                            </Button>
                        </div>
                        <input
                            value={titleEn}
                            onChange={(e) => setTitleEn(e.target.value)}
                            className="w-full text-lg font-bold border rounded px-4 py-3 focus:ring-2 focus:ring-blue-100 outline-none"
                            placeholder="Project Title"
                        />
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Sponsor Logo (EN)</label>
                        <div className="relative h-[52px] w-full bg-gray-50 border border-dashed rounded flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:border-blue-400">
                            {sponsorPreviewEn ? (
                                <img
                                    src={sponsorPreviewEn}
                                    className="h-full w-full object-contain p-1"
                                    alt="Sponsor Logo (EN)"
                                />
                            ) : (
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Upload className="w-4 h-4" />
                                    <span className="text-xs">Feltöltés</span>
                                </div>
                            )}
                            <input
                                type="file"
                                name="sponsorLogoEnFile"
                                accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={handleSponsorLogoEnChange}
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700 font-bold">Project Details (EN)</label>
                        <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            className="gap-2 text-blue-600 border-blue-100 hover:bg-blue-50"
                            disabled={isTranslating === 'projectDataEn'}
                            onClick={() => handleTranslate('projectDataEn', projectData, setProjectDataEn, projectDataEn, project?.projectData || undefined)}
                        >
                            {isTranslating === 'projectDataEn' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                            Fordítás magyarból
                        </Button>
                    </div>
                    <RichTextEditor content={projectDataEn} onChange={setProjectDataEn} className="min-h-[200px]" />
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex justify-between items-center mb-4">
                        <label className="block text-sm font-medium text-gray-700 font-bold">Main Content / Description (EN)</label>
                        <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            className="gap-2 text-blue-600 border-blue-100 hover:bg-blue-50"
                            disabled={isTranslating === 'description'}
                            onClick={() => handleTranslate('description', description, setDescriptionEn, descriptionEn, project?.description || undefined)}
                        >
                            {isTranslating === 'description' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                            Fordítás magyarból
                        </Button>
                    </div>
                    <BlockEditor initialContent={descriptionEn} onChange={setDescriptionEn} />
                </div>
            </div>

            {/* Partnerek és Eredmények - Ezek közösek */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-bold text-gray-700">Partnerek</label>
                    <div className="flex gap-2 items-center">
                        <select
                            className="border rounded px-2 py-1.5 text-sm w-[200px] outline-none focus:ring-2 focus:ring-blue-100"
                            onChange={(e) => {
                                const p = availablePartners.find(ap => ap.id === e.target.value)
                                if (p) {
                                    setPartners([...partners, {
                                        name: p.name,
                                        link: p.websiteUrl || '',
                                        country: '',
                                        logoUrl: p.logoUrl,
                                        file: null
                                    }])
                                    e.target.value = "" // Reset select
                                }
                            }}
                            defaultValue=""
                        >
                            <option value="" disabled>Válassz listából...</option>
                            {availablePartners.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                        <Button type="button" variant="outline" size="sm" onClick={addPartner} className="gap-2">
                            <Plus className="w-4 h-4" /> Új partner
                        </Button>
                    </div>
                </div>

                <div className="space-y-4">
                    {partners.map((partner, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border rounded bg-gray-50 items-start">
                            <div className="md:col-span-3">
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Logó</label>
                                <div className="relative h-24 w-full bg-white border border-dashed rounded flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:border-blue-400">
                                    {(partner.file || partner.logoUrl) ? (
                                        <img
                                            src={partner.file ? URL.createObjectURL(partner.file) : partner.logoUrl}
                                            className="h-full w-full object-contain p-2"
                                            alt="Logo"
                                        />
                                    ) : (
                                        <span className="text-xs text-center p-2 text-gray-400">Feltöltés</span>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0]
                                            if (file) {
                                                const compressed = await compressImageClient(file, 800)
                                                updatePartner(index, 'file', compressed)
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Név</label>
                                    <input
                                        value={partner.name}
                                        onChange={(e) => updatePartner(index, 'name', e.target.value)}
                                        className="w-full border rounded px-2 py-1.5 text-sm"
                                        placeholder="Partner neve"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Ország</label>
                                    <input
                                        value={partner.country}
                                        onChange={(e) => updatePartner(index, 'country', e.target.value)}
                                        className="w-full border rounded px-2 py-1.5 text-sm"
                                        placeholder="Ország"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Weboldal Link</label>
                                    <input
                                        value={partner.link}
                                        onChange={(e) => updatePartner(index, 'link', e.target.value)}
                                        className="w-full border rounded px-2 py-1.5 text-sm"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-1 flex justify-end">
                                <Button type="button" variant="ghost" size="sm" onClick={() => removePartner(index)} className="text-red-500 hover:text-red-700">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Eredmények */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-bold text-gray-700">Eredmények / Dokumentumok</label>
                    <Button type="button" variant="outline" size="sm" onClick={addResult} className="gap-2">
                        <Plus className="w-4 h-4" /> Eredmény Hozzáadása
                    </Button>
                </div>

                <div className="space-y-4">
                    {results.map((result, index) => (
                        <div key={index} className="p-4 border rounded bg-gray-50 space-y-4">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="w-full md:w-40">
                                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Típus</label>
                                    <select
                                        value={result.type}
                                        onChange={(e) => updateResult(index, 'type', e.target.value)}
                                        className="w-full border rounded px-2 py-1.5 text-sm"
                                    >
                                        <option value="text">Szöveg</option>
                                        <option value="file">Fájl (PDF/stb)</option>
                                        <option value="video">Videó (YouTube)</option>
                                        <option value="gallery">Képgaléria</option>
                                    </select>
                                </div>
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 mb-1 block font-bold">Címke (HU)</label>
                                        <input
                                            value={result.label}
                                            onChange={(e) => updateResult(index, 'label', e.target.value)}
                                            className="w-full border rounded px-2 py-1.5 text-sm"
                                            placeholder="pl. Jelentés 2024"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="text-xs font-semibold text-gray-500 font-bold">Label (EN)</label>
                                            <button 
                                                type="button" 
                                                className="text-[10px] text-blue-600 hover:underline"
                                                onClick={() => handleTranslate(`res-label-${index}`, result.label, (val) => updateResult(index, 'labelEn', val))}
                                            >
                                                Auto-translate
                                            </button>
                                        </div>
                                        <input
                                            value={result.labelEn}
                                            onChange={(e) => updateResult(index, 'labelEn', e.target.value)}
                                            className="w-full border rounded px-2 py-1.5 text-sm"
                                            placeholder="e.g. Report 2024"
                                        />
                                    </div>
                                </div>
                                <Button type="button" variant="ghost" size="sm" onClick={() => removeResult(index)} className="text-red-500 hover:text-red-700">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="pt-2 border-t border-gray-200">
                                {result.type === 'text' ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 mb-1 block">Tartalom (HU)</label>
                                            <input
                                                value={result.content}
                                                onChange={(e) => updateResult(index, 'content', e.target.value)}
                                                className="w-full border rounded px-2 py-1.5 text-sm bg-white"
                                            />
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="text-xs font-semibold text-gray-500">Content (EN)</label>
                                                <button 
                                                    type="button" 
                                                    className="text-[10px] text-blue-600 hover:underline"
                                                    onClick={() => handleTranslate(`res-content-${index}`, result.content, (val) => updateResult(index, 'contentEn', val))}
                                                >
                                                    Auto-translate
                                                </button>
                                            </div>
                                            <input
                                                value={result.contentEn}
                                                onChange={(e) => updateResult(index, 'contentEn', e.target.value)}
                                                className="w-full border rounded px-2 py-1.5 text-sm bg-white"
                                            />
                                        </div>
                                    </div>
                                ) : result.type === 'video' ? (
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 mb-1 block">YouTube Link</label>
                                        <input
                                            value={result.content}
                                            onChange={(e) => updateResult(index, 'content', e.target.value)}
                                            className="w-full border rounded px-2 py-1.5 text-sm bg-white"
                                            placeholder="https://..."
                                        />
                                    </div>
                                ) : result.type === 'gallery' ? (
                                    <div className="space-y-3">
                                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Galéria Képek</label>
                                        {result.galleryPreviews.length > 0 && (
                                            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                                                {result.galleryPreviews.map((src, imgIdx) => (
                                                    <div key={imgIdx} className="relative group aspect-square">
                                                        <img src={src} alt="" className="w-full h-full object-cover rounded border" />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeGalleryImage(index, imgIdx)}
                                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <label className="flex items-center gap-2 cursor-pointer border border-dashed rounded px-3 py-2 text-sm text-gray-500 hover:border-blue-400 bg-white">
                                            <Upload className="w-4 h-4" /> Feltöltés
                                            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && addGalleryFiles(index, e.target.files)} />
                                        </label>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Fájl</label>
                                        <div className="flex items-center gap-4">
                                            <input type="file" onChange={(e) => updateResult(index, 'file', e.target.files?.[0])} className="border rounded px-2 py-1.5 text-sm flex-1 bg-white" />
                                            {result.content && !result.file && <a href={result.content} target="_blank" className="text-xs text-blue-600 underline">Megtekintés</a>}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Kép és Beállítások */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="font-bold mb-4 text-gray-900">Kép és Beállítások</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Kiemelt Kép</label>
                        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative group border-2 border-dashed border-gray-200 hover:border-blue-400 transition-colors">
                            {preview ? (
                                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <ImageIcon className="w-8 h-8 mb-2" />
                                    <span className="text-xs">Feltöltés</span>
                                </div>
                            )}
                            <input type="file" name="image" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kezdő dátum</label>
                                <input
                                    type="date"
                                    name="startDate"
                                    defaultValue={project?.startDate ? new Date(project.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                                    className="w-full border rounded px-3 py-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Befejező dátum</label>
                                <input
                                    type="date"
                                    name="endDate"
                                    defaultValue={project?.endDate ? new Date(project.endDate).toISOString().split('T')[0] : ''}
                                    className="w-full border rounded px-3 py-2 text-sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    )
}
