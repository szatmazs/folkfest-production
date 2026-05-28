"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2, GripVertical, CheckCircle, XCircle, Image as ImageIcon, Video, Youtube } from "lucide-react"
import { deleteSlide, reorderSlides } from "@/app/actions/slider-admin"

interface Slide {
    id: string
    isActive: boolean
    order: number
    backgroundType: string
    imageUrl: string | null
    videoUrl: string | null
    youtubeUrl: string | null
    youtubeStart: number | null
    youtubeEnd: number | null
}

export default function SliderList({ initialSlides }: { initialSlides: Slide[] }) {
    const [slides, setSlides] = useState(initialSlides)
    const [isSaving, setIsSaving] = useState(false)
    const router = useRouter()

    const handleDelete = async (id: string) => {
        if (confirm("Biztosan törölni szeretnéd ezt a slide-ot?")) {
            setIsSaving(true)
            const res = await deleteSlide(id)
            setIsSaving(false)
            if (res.success) {
                setSlides(slides.filter(s => s.id !== id))
                router.refresh()
            } else {
                alert(res.error || "Hiba történt")
            }
        }
    }

    const moveSlide = async (index: number, direction: 'up' | 'down') => {
        if (
            (direction === 'up' && index === 0) ||
            (direction === 'down' && index === slides.length - 1)
        ) return;

        const newSlides = [...slides];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        
        // Swap
        [newSlides[index], newSlides[targetIndex]] = [newSlides[targetIndex], newSlides[index]];
        
        // Update order properties
        newSlides.forEach((slide, idx) => slide.order = idx);
        
        setSlides(newSlides);
        setIsSaving(true);
        await reorderSlides(newSlides.map(s => s.id));
        setIsSaving(false);
        router.refresh();
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'video': return <Video className="h-5 w-5 text-blue-500" />
            case 'youtube': return <Youtube className="h-5 w-5 text-red-500" />
            case 'image': 
            default: return <ImageIcon className="h-5 w-5 text-green-500" />
        }
    }

    const getLabel = (slide: Slide) => {
        switch (slide.backgroundType) {
            case 'video': return slide.videoUrl ? 'Feltöltött Videó' : 'Videó (hiányzik)'
            case 'youtube': return slide.youtubeUrl ? `YouTube: ${slide.youtubeUrl}` : 'YouTube (hiányzik)'
            case 'image': 
            default: return slide.imageUrl ? 'Feltöltött Kép' : 'Kép (hiányzik)'
        }
    }

    return (
        <div className="bg-white rounded-lg border shadow-sm">
            <div className="flex flex-row items-center justify-between p-6 border-b">
                <h3 className="text-xl font-semibold">Kezdőlap Sliderek</h3>
                <Button asChild>
                    <Link href="/admin/sliders/new">
                        <Plus className="mr-2 h-4 w-4" /> Új Slide
                    </Link>
                </Button>
            </div>
            <div className="p-6">
                <div className="space-y-4">
                    {slides.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">Nincsenek még slide-ok rögzítve. Használja a fenti gombot egy új slide létrehozásához.</p>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {slides.map((slide, index) => (
                                <div key={slide.id} className="flex items-center justify-between bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="flex flex-col items-center gap-1 opacity-50">
                                            <button 
                                                onClick={() => moveSlide(index, 'up')}
                                                disabled={index === 0 || isSaving}
                                                className="hover:text-blue-600 disabled:opacity-30"
                                            >
                                                ▲
                                            </button>
                                            <button 
                                                onClick={() => moveSlide(index, 'down')}
                                                disabled={index === slides.length - 1 || isSaving}
                                                className="hover:text-blue-600 disabled:opacity-30"
                                            >
                                                ▼
                                            </button>
                                        </div>
                                        <div className="h-12 w-16 bg-gray-100 rounded flex items-center justify-center border overflow-hidden shrink-0">
                                            {slide.backgroundType === 'image' && slide.imageUrl ? (
                                                <img src={slide.imageUrl} alt="Slide" className="h-full w-full object-cover" />
                                            ) : (
                                                getIcon(slide.backgroundType)
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 truncate flex items-center gap-2">
                                                {getLabel(slide)}
                                                {slide.isActive ? 
                                                    <CheckCircle className="h-4 w-4 text-green-500" /> : 
                                                    <XCircle className="h-4 w-4 text-red-500" />
                                                }
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/admin/sliders/${slide.id}`}>
                                                <Edit className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button variant="destructive" size="sm" onClick={() => handleDelete(slide.id)} disabled={isSaving}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
