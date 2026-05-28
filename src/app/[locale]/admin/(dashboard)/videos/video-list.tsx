'use client'

import { useState } from 'react'
import { Video } from '@prisma/client'
import { createVideo, deleteVideo, updateVideo, getVideoMetadata, toggleVideoFeatured, autoTranslateVideoAction } from '@/app/actions/video-admin'
import { Trash2, Edit2, Plus, X, Video as VideoIcon, DownloadCloud, Star, Sparkles, Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'

function getEmbedUrl(url: string) {
    if (!url) return ''
    try {
        const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)

        if (urlObj.hostname.includes('youtu.be')) {
            return `https://www.youtube.com/embed/${urlObj.pathname.slice(1)}`
        }

        if (urlObj.pathname === '/playlist' && urlObj.searchParams.has('list')) {
            return `https://www.youtube.com/embed/videoseries?list=${urlObj.searchParams.get('list')}`
        }

        if (urlObj.searchParams.has('v')) {
            return `https://www.youtube.com/embed/${urlObj.searchParams.get('v')}`
        }

        return ''
    } catch {
        return ''
    }
}

export default function VideoList({ initialVideos }: { initialVideos: Video[] }) {
    const [videos, setVideos] = useState<Video[]>(initialVideos)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingVideo, setEditingVideo] = useState<Video | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isTranslating, setIsTranslating] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'hu' | 'en'>('hu')

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        titleEn: '',
        videoUrl: '',
        description: '',
        descriptionEn: ''
    })

    const openCreateModal = () => {
        setEditingVideo(null)
        setFormData({ title: '', titleEn: '', videoUrl: '', description: '', descriptionEn: '' })
        setActiveTab('hu')
        setIsModalOpen(true)
    }

    const openEditModal = (video: Video) => {
        setEditingVideo(video)
        setFormData({
            title: video.title || '',
            titleEn: video.titleEn || '',
            videoUrl: video.videoUrl,
            description: video.description || '',
            descriptionEn: video.descriptionEn || ''
        })
        setActiveTab('hu')
        setIsModalOpen(true)
    }

    const handleTranslate = async (field: 'title' | 'description') => {
        const text = field === 'title' ? formData.title : formData.description
        if (!text) return
        
        setIsTranslating(field)
        try {
            const res = await autoTranslateVideoAction(text)
            setFormData(prev => ({
                ...prev,
                [field === 'title' ? 'titleEn' : 'descriptionEn']: res
            }))
        } catch (e) {
            console.error(e)
        } finally {
            setIsTranslating(null)
        }
    }

    const handleAutoFill = async () => {
        if (!formData.videoUrl) return

        setIsLoading(true)
        try {
            const data = await getVideoMetadata(formData.videoUrl)
            if (data.error) {
                alert(data.error)
            } else {
                setFormData(prev => ({
                    ...prev,
                    title: data.title || prev.title,
                    description: data.description || prev.description
                }))
            }
        } catch (e) {
            console.error(e)
        } finally {
            setIsLoading(false)
        }
    }

    const handleToggleFeatured = async (video: Video) => {
        const newVal = !video.featured
        setVideos(prev => prev.map(v => v.id === video.id ? { ...v, featured: newVal } : v))
        try {
            await toggleVideoFeatured(video.id, newVal)
        } catch (e) {
            setVideos(prev => prev.map(v => v.id === video.id ? { ...v, featured: video.featured } : v))
            console.error(e)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        const data = new FormData()
        data.append('title', formData.title)
        data.append('titleEn', formData.titleEn)
        data.append('videoUrl', formData.videoUrl)
        data.append('description', formData.description)
        data.append('descriptionEn', formData.descriptionEn)

        try {
            if (editingVideo) {
                await updateVideo(editingVideo.id, data)
            } else {
                await createVideo(data)
            }
            window.location.reload()
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
            setIsModalOpen(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Biztosan törölni szeretnéd ezt a videót?')) return
        try {
            const res = await deleteVideo(id)
            if (res.success) {
                window.location.reload()
            } else {
                alert('Nem sikerült törölni a videót: ' + res.error)
            }
        } catch (e: any) {
            alert('Hiba történt a törlés során: ' + e.message)
        }
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <VideoIcon className="w-6 h-6 text-red-600" /> Videótár Kezelése
                </h1>
                <Button onClick={openCreateModal} className="flex items-center gap-2 bg-black text-white hover:bg-gray-800 px-6">
                    <Plus className="w-4 h-4" /> Új Videó
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video) => (
                    <div key={video.id} className="bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col group">
                        <div className="aspect-video bg-gray-100 relative">
                            {getEmbedUrl(video.videoUrl) ? (
                                <iframe
                                    src={getEmbedUrl(video.videoUrl)}
                                    className="w-full h-full pointer-events-none"
                                    title={video.title || 'Video'}
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">
                                    <VideoIcon className="w-12 h-12" />
                                </div>
                            )}
                            {video.featured && (
                                <div className="absolute top-3 left-3 bg-yellow-500 text-white p-1.5 rounded-full shadow-lg z-10" title="Kiemelt videó">
                                    <Star className="w-4 h-4 fill-white" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none" />
                        </div>
                        
                        <div className="p-4 flex-grow flex flex-col">
                            <h3 className="font-bold text-lg mb-1 line-clamp-1">{video.title}</h3>
                            {video.titleEn && <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-2">{video.titleEn}</p>}
                            <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-grow">{video.description}</p>

                            <div className="flex justify-end gap-2 pt-4 border-t mt-auto">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleToggleFeatured(video)}
                                    className={video.featured ? "text-yellow-500 border-yellow-500 bg-yellow-50" : "text-gray-400 hover:text-yellow-500"}
                                >
                                    <Star className={video.featured ? "fill-yellow-500 w-4 h-4" : "w-4 h-4"} />
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => openEditModal(video)} className="hover:bg-blue-50">
                                    <Edit2 className="w-4 h-4 text-blue-600" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleDelete(video.id)} className="hover:bg-red-50">
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <div className="p-2">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">{editingVideo ? 'Videó Szerkesztése' : 'Új Videó Hozzáadása'}</h2>
                        <div className="flex bg-gray-100 p-1 rounded-lg border shadow-sm">
                            <button
                                type="button"
                                onClick={() => setActiveTab('hu')}
                                className={`px-4 py-1 rounded-md text-xs font-bold transition-all ${activeTab === 'hu' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                MAGYAR
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('en')}
                                className={`px-4 py-1 rounded-md text-xs font-bold transition-all ${activeTab === 'en' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                ENGLISH
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-gray-50 p-4 rounded-lg border space-y-4">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Alapadatok & YouTube</label>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">YouTube Link</label>
                                <div className="flex gap-2">
                                    <input
                                        type="url"
                                        required
                                        className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                                        value={formData.videoUrl}
                                        onChange={e => setFormData({ ...formData, videoUrl: e.target.value })}
                                        placeholder="https://youtube.com/..."
                                    />
                                    <Button type="button" variant="outline" onClick={handleAutoFill} disabled={isLoading} title="YouTube adatok betöltése">
                                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <DownloadCloud className="w-4 h-4" />}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className={activeTab === 'hu' ? 'space-y-4' : 'hidden'}>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Cím (HU)</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-100 outline-none"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Leírás (HU)</label>
                                <textarea
                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                                    rows={4}
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className={activeTab === 'en' ? 'space-y-4 animate-in fade-in slide-in-from-bottom-2' : 'hidden'}>
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-xs font-bold text-gray-700">Title (EN)</label>
                                    <button 
                                        type="button" 
                                        onClick={() => handleTranslate('title')}
                                        disabled={isTranslating === 'title' || !formData.title}
                                        className="text-[10px] font-bold text-blue-600 uppercase flex items-center gap-1"
                                    >
                                        {isTranslating === 'title' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                        Auto
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    className="w-full border rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-100 outline-none"
                                    value={formData.titleEn}
                                    onChange={e => setFormData({ ...formData, titleEn: e.target.value })}
                                    placeholder="English title"
                                />
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-xs font-bold text-gray-700">Description (EN)</label>
                                    <button 
                                        type="button" 
                                        onClick={() => handleTranslate('description')}
                                        disabled={isTranslating === 'description' || !formData.description}
                                        className="text-[10px] font-bold text-blue-600 uppercase flex items-center gap-1"
                                    >
                                        {isTranslating === 'description' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                        Auto
                                    </button>
                                </div>
                                <textarea
                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                                    rows={4}
                                    value={formData.descriptionEn}
                                    onChange={e => setFormData({ ...formData, descriptionEn: e.target.value })}
                                    placeholder="English description"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t mt-8">
                            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Mégse</Button>
                            <Button type="submit" className="bg-black text-white hover:bg-gray-800 px-8" disabled={isLoading}>
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                Mentés
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    )
}
