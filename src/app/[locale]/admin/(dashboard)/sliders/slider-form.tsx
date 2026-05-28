"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { saveSlide, autoTranslateSliderAction } from "@/app/actions/slider-admin"
import { uploadMedia } from "@/app/actions/media-upload"
import { Image as ImageIcon, Video, Youtube, UploadCloud, Calendar, Info, Music, Ticket, MapPin, Star, ChevronRight, Heart, Phone, Mail, Globe, Users, Play, ImagePlus, Sparkles, Loader2, ArrowLeft } from "lucide-react"
import { MediaPicker } from "@/components/admin/media/media-picker"
import { cn } from "@/lib/utils"

interface Slide {
    id?: string
    isActive?: boolean
    order?: number
    backgroundType?: string
    imageUrl?: string | null
    videoUrl?: string | null
    youtubeUrl?: string | null
    youtubeStart?: number | null
    youtubeEnd?: number | null
    logoUrl?: string | null
    logoUrlEn?: string | null
    title?: string | null
    subtitle?: string | null
    titleHighlight?: string | null
    leftButtonLabel?: string | null
    leftButtonLink?: string | null
    leftButtonIcon?: string | null
    rightButtonLabel?: string | null
    rightButtonLink?: string | null
    rightButtonIcon?: string | null
}

export default function SliderForm({ slide }: { slide?: Slide }) {
    const router = useRouter()
    const [isSaving, setIsSaving] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState("")

    const [isActive, setIsActive] = useState(slide?.isActive ?? true)
    const [backgroundType, setBackgroundType] = useState(slide?.backgroundType || 'image')
    const [imageUrl, setImageUrl] = useState(slide?.imageUrl || '')
    const [videoUrl, setVideoUrl] = useState(slide?.videoUrl || '')
    const [youtubeUrl, setYoutubeUrl] = useState(slide?.youtubeUrl || '')
    const [youtubeStart, setYoutubeStart] = useState(slide?.youtubeStart || 0)
    const [youtubeEnd, setYoutubeEnd] = useState(slide?.youtubeEnd || 0)

    const [logoUrl, setLogoUrl] = useState(slide?.logoUrl || '')
    const [logoUrlEn, setLogoUrlEn] = useState((slide as any)?.logoUrlEn || '')
    const [title, setTitle] = useState(slide?.title || '')
    const [subtitle, setSubtitle] = useState(slide?.subtitle || '')
    const [titleHighlight, setTitleHighlight] = useState(slide?.titleHighlight || '')
    const [leftButtonLabel, setLeftButtonLabel] = useState(slide?.leftButtonLabel || '')
    const [leftButtonLink, setLeftButtonLink] = useState(slide?.leftButtonLink || '')
    const [leftButtonIcon, setLeftButtonIcon] = useState((slide as any)?.leftButtonIcon || '')
    const [rightButtonLabel, setRightButtonLabel] = useState(slide?.rightButtonLabel || '')
    const [rightButtonLink, setRightButtonLink] = useState(slide?.rightButtonLink || '')
    const [rightButtonIcon, setRightButtonIcon] = useState((slide as any)?.rightButtonIcon || '')

    const [activeTab, setActiveTab] = useState<'hu' | 'en'>('hu')
    const currentLogo = activeTab === 'hu' ? logoUrl : logoUrlEn
    const setCurrentLogo = activeTab === 'hu' ? setLogoUrl : setLogoUrlEn
    const [isTranslating, setIsTranslating] = useState<string | null>(null)

    const [titleEn, setTitleEn] = useState((slide as any)?.titleEn || '')
    const [subtitleEn, setSubtitleEn] = useState((slide as any)?.subtitleEn || '')
    const [titleHighlightEn, setTitleHighlightEn] = useState((slide as any)?.titleHighlightEn || '')
    const [leftButtonLabelEn, setLeftButtonLabelEn] = useState((slide as any)?.leftButtonLabelEn || '')
    const [rightButtonLabelEn, setRightButtonLabelEn] = useState((slide as any)?.rightButtonLabelEn || '')

    const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false)
    const [mediaPickerTarget, setMediaPickerTarget] = useState<'image' | 'video' | 'logo' | null>(null)
    
    const [isDraggingImage, setIsDraggingImage] = useState(false)
    const [isDraggingVideo, setIsDraggingVideo] = useState(false)
    const [isDraggingLogo, setIsDraggingLogo] = useState(false)

    const performFileUpload = async (file: File, type: 'image' | 'video', isLogo: boolean = false) => {
        setIsUploading(true);
        setError("");

        try {
            const formData = new FormData();
            formData.append('file', file);
            
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            const data = await res.json();

            if (data.error || (!data.path && !data.paths)) {
                throw new Error(data.error || 'Feltöltés sikertelen');
            }

            const path = data.path || (data.paths ? data.paths[0] : null);

            if (type === 'image') {
                if (isLogo) {
                    if (activeTab === 'en') {
                        setLogoUrlEn(path);
                    } else {
                        setLogoUrl(path);
                    }
                } else {
                    setImageUrl(path);
                }
            }
            if (type === 'video') setVideoUrl(path);
        } catch (err: any) {
            setError(err.message || "Hiba a feltöltés során.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
        const file = e.target.files?.[0];
        if (!file) return;
        performFileUpload(file, type, e.target.name === 'logoFile');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        setError("")

        const formData = new FormData()
        if (slide?.id) formData.append("id", slide.id)
        formData.append("isActive", isActive.toString())
        formData.append("backgroundType", backgroundType)
        formData.append("imageUrl", imageUrl)
        formData.append("videoUrl", videoUrl)
        formData.append("youtubeUrl", youtubeUrl)
        formData.append("youtubeStart", youtubeStart.toString())
        formData.append("youtubeEnd", youtubeEnd.toString())
        formData.append("logoUrl", logoUrl)
        formData.append("logoUrlEn", logoUrlEn)
        formData.append("title", title)
        formData.append("titleEn", titleEn)
        formData.append("subtitle", subtitle)
        formData.append("subtitleEn", subtitleEn)
        formData.append("titleHighlight", titleHighlight)
        formData.append("titleHighlightEn", titleHighlightEn)
        formData.append("leftButtonLabel", leftButtonLabel)
        formData.append("leftButtonLabelEn", leftButtonLabelEn)
        formData.append("leftButtonLink", leftButtonLink)
        formData.append("leftButtonIcon", leftButtonIcon)
        formData.append("rightButtonLabel", rightButtonLabel)
        formData.append("rightButtonLabelEn", rightButtonLabelEn)
        formData.append("rightButtonLink", rightButtonLink)
        formData.append("rightButtonIcon", rightButtonIcon)

        const res = await saveSlide(formData)
        
        if (res.success) {
            router.push('/admin/sliders')
            router.refresh()
        } else {
            setError(res.error || "Hiba mentés közben")
            setIsSaving(false)
        }
    }

    const handleTranslate = async (field: string, text: string, setter: (val: string) => void) => {
        if (!text) return
        setIsTranslating(field)
        try {
            const translated = await autoTranslateSliderAction(text)
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
                const t = await autoTranslateSliderAction(title)
                setTitleEn(t)
            }
            if (subtitle) {
                const t = await autoTranslateSliderAction(subtitle)
                setSubtitleEn(t)
            }
            if (titleHighlight) {
                const t = await autoTranslateSliderAction(titleHighlight)
                setTitleHighlightEn(t)
            }
            if (leftButtonLabel) {
                const t = await autoTranslateSliderAction(leftButtonLabel)
                setLeftButtonLabelEn(t)
            }
            if (rightButtonLabel) {
                const t = await autoTranslateSliderAction(rightButtonLabel)
                setRightButtonLabelEn(t)
            }
            if (logoUrl && !logoUrlEn) {
                setLogoUrlEn(logoUrl)
            }
        } catch (error) {
            console.error('Translation failed:', error)
        } finally {
            setIsTranslating(null)
        }
    }

    return (
        <div className="max-w-3xl mx-auto bg-white rounded-lg border shadow-sm">
            <form onSubmit={handleSubmit}>
                <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-sm z-30">
                    <h3 className="text-xl font-semibold">{slide?.id ? 'Slider Szerkesztése' : 'Új Slider Létrehozása'}</h3>
                    <div className="flex items-center gap-3">
                        <div className="flex bg-white p-1 rounded-lg border shadow-sm mr-2">
                            <button
                                type="button"
                                onClick={() => setActiveTab('hu')}
                                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${activeTab === 'hu' ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:text-gray-800'}`}
                            >
                                Magyar
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('en')}
                                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${activeTab === 'en' ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:text-gray-800'}`}
                            >
                                English
                            </button>
                        </div>

                        {activeTab === 'en' && (
                            <Button 
                                type="button" 
                                size="sm"
                                onClick={handleTranslateAll} 
                                disabled={isTranslating !== null}
                                variant="outline"
                                className="gap-1.5 text-blue-600 border-blue-200 hover:bg-blue-50"
                            >
                                {isTranslating === 'all' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                                Slide lefordítása
                            </Button>
                        )}
                    </div>
                </div>
                <div className="p-6 space-y-8">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    <MediaPicker 
                        open={isMediaPickerOpen} 
                        onOpenChange={setIsMediaPickerOpen} 
                        onSelect={(url) => {
                            if (mediaPickerTarget === 'image') setImageUrl(url)
                            if (mediaPickerTarget === 'video') setVideoUrl(url)
                            if (mediaPickerTarget === 'logo') setCurrentLogo(url)
                        }} 
                    />

                    <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg border">
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <Label htmlFor="isActive" className="font-medium cursor-pointer">
                            Slide bekapcsolása (megjelenik a kezdőlapon)
                        </Label>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-lg font-medium border-b pb-2">Háttér beállítások</h4>
                        <div className="grid grid-cols-3 gap-4">
                            <button
                                type="button"
                                onClick={() => setBackgroundType('image')}
                                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${backgroundType === 'image' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                            >
                                <ImageIcon className={`h-8 w-8 ${backgroundType === 'image' ? 'text-blue-500' : 'text-gray-400'}`} />
                                <span className="text-sm font-medium">Kép</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setBackgroundType('video')}
                                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${backgroundType === 'video' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                            >
                                <Video className={`h-8 w-8 ${backgroundType === 'video' ? 'text-blue-500' : 'text-gray-400'}`} />
                                <span className="text-sm font-medium">Videó</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setBackgroundType('youtube')}
                                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${backgroundType === 'youtube' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                            >
                                <Youtube className={`h-8 w-8 ${backgroundType === 'youtube' ? 'text-blue-500' : 'text-gray-400'}`} />
                                <span className="text-sm font-medium">YouTube</span>
                            </button>
                        </div>

                        {backgroundType === 'image' && (
                            <div className="space-y-4 pt-4">
                                <Label>Háttérkép</Label>
                                {imageUrl && (
                                    <div 
                                        className={cn(
                                            "h-48 rounded-lg border overflow-hidden relative group transition-all",
                                            isDraggingImage ? "border-blue-500 ring-2 ring-blue-500/20" : "border-gray-200"
                                        )}
                                        onDragOver={(e) => { e.preventDefault(); setIsDraggingImage(true); }}
                                        onDragLeave={() => setIsDraggingImage(false)}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            setIsDraggingImage(false);
                                            const file = e.dataTransfer.files?.[0];
                                            if (file && file.type.startsWith('image/')) performFileUpload(file, 'image');
                                        }}
                                    >
                                        <div className={cn("w-full h-full", isDraggingImage && "pointer-events-none")}>
                                            <img src={imageUrl} alt="Background Preview" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                            <p className="text-white text-sm font-medium">Húzd ide az új képet</p>
                                        </div>
                                    </div>
                                )}
                                <div className="flex gap-4 items-center">
                                    <Input 
                                        value={imageUrl} 
                                        onChange={(e) => setImageUrl(e.target.value)} 
                                        placeholder="/uploads/image.jpg vagy URL" 
                                        className="flex-1"
                                    />
                                    <div className="flex gap-2 shrink-0">
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            onClick={() => { setMediaPickerTarget('image'); setIsMediaPickerOpen(true); }}
                                        >
                                            <ImagePlus className="h-4 w-4 mr-2" />
                                            Médiatár
                                        </Button>
                                        <div className="relative">
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleFileUpload(e, 'image')}
                                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                                disabled={isUploading}
                                            />
                                            <Button type="button" variant="secondary" disabled={isUploading}>
                                                <UploadCloud className="h-4 w-4 mr-2" />
                                                {isUploading ? '...' : 'Feltöltés'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {backgroundType === 'video' && (
                            <div className="space-y-4 pt-4">
                                <Label>Háttérvideó (MP4, WebM)</Label>
                                {videoUrl && (
                                    <div 
                                        className={cn(
                                            "h-48 rounded-lg border overflow-hidden relative bg-black group transition-all",
                                            isDraggingVideo ? "ring-2 ring-blue-500" : ""
                                        )}
                                        onDragOver={(e) => { e.preventDefault(); setIsDraggingVideo(true); }}
                                        onDragLeave={() => setIsDraggingVideo(false)}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            setIsDraggingVideo(false);
                                            const file = e.dataTransfer.files?.[0];
                                            if (file && file.type.startsWith('video/')) performFileUpload(file, 'video');
                                        }}
                                    >
                                        <div className={cn("w-full h-full", isDraggingVideo && "pointer-events-none")}>
                                            <video src={videoUrl} controls className="w-full h-full object-contain" />
                                        </div>
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                            <p className="text-white text-sm font-medium">Húzd ide az új videót</p>
                                        </div>
                                    </div>
                                )}
                                <div className="flex gap-4 items-center">
                                    <Input 
                                        value={videoUrl} 
                                        onChange={(e) => setVideoUrl(e.target.value)} 
                                        placeholder="/uploads/video.mp4 vagy URL" 
                                        className="flex-1"
                                    />
                                    <div className="flex gap-2 shrink-0">
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            onClick={() => { setMediaPickerTarget('video'); setIsMediaPickerOpen(true); }}
                                        >
                                            <ImagePlus className="h-4 w-4 mr-2" />
                                            Médiatár
                                        </Button>
                                        <div className="relative">
                                            <Input
                                                type="file"
                                                accept="video/*"
                                                onChange={(e) => handleFileUpload(e, 'video')}
                                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                                disabled={isUploading}
                                            />
                                            <Button type="button" variant="secondary" disabled={isUploading}>
                                                <UploadCloud className="h-4 w-4 mr-2" />
                                                {isUploading ? '...' : 'Feltöltés'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {backgroundType === 'youtube' && (
                            <div className="space-y-4 pt-4">
                                <Label>YouTube Link vagy Video ID</Label>
                                <Input 
                                    value={youtubeUrl} 
                                    onChange={(e) => setYoutubeUrl(e.target.value)} 
                                    placeholder="https://www.youtube.com/watch?v=..." 
                                />
                                
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <div className="space-y-2">
                                        <Label>Kezdő másodperc</Label>
                                        <Input 
                                            type="number" 
                                            min="0"
                                            value={youtubeStart} 
                                            onChange={(e) => setYoutubeStart(parseInt(e.target.value) || 0)} 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Záró másodperc (0 = végéig)</Label>
                                        <Input 
                                            type="number" 
                                            min="0"
                                            value={youtubeEnd} 
                                            onChange={(e) => setYoutubeEnd(parseInt(e.target.value) || 0)} 
                                        />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500">Tipp: Youtube videók esetén az autoplay policy miatt érdemes képet vagy néma, saját feltöltésű videót használni háttérnek.</p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4 pt-4">
                        <h4 className="text-lg font-medium border-b pb-2">Egyedi Tartalom (Opcionális)</h4>
                        <p className="text-sm text-gray-500 mb-4">Ha üresen hagyod, az általános főoldali beállítások jelennek meg a slide-on.</p>
                        
                        <div className="space-y-4 pb-4">
                            <Label>Egyedi Logó Kép ({activeTab === 'hu' ? 'HU' : 'EN'})</Label>
                            {currentLogo && (
                                <div 
                                    className={cn(
                                        "h-24 w-32 rounded-lg border overflow-hidden relative group bg-gray-800 transition-all",
                                        isDraggingLogo ? "ring-2 ring-blue-500 scale-105" : ""
                                    )}
                                    onDragOver={(e) => { e.preventDefault(); setIsDraggingLogo(true); }}
                                    onDragLeave={() => setIsDraggingLogo(false)}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        setIsDraggingLogo(false);
                                        const file = e.dataTransfer.files?.[0];
                                        if (file && file.type.startsWith('image/')) performFileUpload(file, 'image', true);
                                    }}
                                >
                                    <div className={cn("w-full h-full p-2 flex items-center justify-center", isDraggingLogo && "pointer-events-none")}>
                                        <img src={currentLogo} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
                                    </div>
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                        <p className="text-white text-[10px] font-medium text-center">Húzd ide</p>
                                    </div>
                                </div>
                            )}
                            <div className="flex gap-4 items-center">
                                <Input 
                                    value={currentLogo} 
                                    onChange={(e) => setCurrentLogo(e.target.value)} 
                                    placeholder={activeTab === 'hu' ? "/hero-motif.png vagy URL" : "/hero-motif-en.png vagy URL"} 
                                    className="flex-1"
                                />
                                <div className="flex gap-2 shrink-0">
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        onClick={() => { setMediaPickerTarget('logo'); setIsMediaPickerOpen(true); }}
                                    >
                                        <ImagePlus className="h-4 w-4 mr-2" />
                                        Médiatár
                                    </Button>
                                    <div className="relative">
                                        <Input
                                            type="file"
                                            name="logoFile"
                                            accept="image/*"
                                            onChange={(e) => handleFileUpload(e, 'image')}
                                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                            disabled={isUploading}
                                        />
                                        <Button type="button" variant="secondary" disabled={isUploading}>
                                            <UploadCloud className="h-4 w-4 mr-2" />
                                            {isUploading ? '...' : 'Feltöltés'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Hungarian tab content */}
                        {activeTab === 'hu' && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                <div className="space-y-2">
                                    <Label>Főcím (Nagybetűs cím) (HU)</Label>
                                    <Input 
                                        value={title} 
                                        onChange={(e) => setTitle(e.target.value)} 
                                        placeholder="Pl. Hagyomány" 
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Kiemelt alcím (Cím alatti szöveg) (HU)</Label>
                                        <Input 
                                            value={titleHighlight} 
                                            onChange={(e) => setTitleHighlight(e.target.value)} 
                                            placeholder="Pl. Modern Formában" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Felső kis cím (Logó alatt) (HU)</Label>
                                        <Input 
                                            value={subtitle} 
                                            onChange={(e) => setSubtitle(e.target.value)} 
                                            placeholder="Pl. Kulturális Egyesület" 
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* English tab content */}
                        {activeTab === 'en' && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label>Főcím (Nagybetűs cím) (EN)</Label>
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            size="sm" 
                                            className="h-7 text-[10px] gap-1 py-0 px-2"
                                            disabled={isTranslating === 'title'}
                                            onClick={() => handleTranslate('title', title, setTitleEn)}
                                        >
                                            {isTranslating === 'title' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                                            Fordítás
                                        </Button>
                                    </div>
                                    <Input 
                                        value={titleEn} 
                                        onChange={(e) => setTitleEn(e.target.value)} 
                                        placeholder="e.g. Tradition" 
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <Label>Kiemelt alcím (Cím alatti szöveg) (EN)</Label>
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                size="sm" 
                                                className="h-7 text-[10px] gap-1 py-0 px-2"
                                                disabled={isTranslating === 'titleHighlight'}
                                                onClick={() => handleTranslate('titleHighlight', titleHighlight, setTitleHighlightEn)}
                                            >
                                                {isTranslating === 'titleHighlight' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                                                Fordítás
                                            </Button>
                                        </div>
                                        <Input 
                                            value={titleHighlightEn} 
                                            onChange={(e) => setTitleHighlightEn(e.target.value)} 
                                            placeholder="e.g. In a Modern Way" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <Label>Felső kis cím (Logó alatt) (EN)</Label>
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                size="sm" 
                                                className="h-7 text-[10px] gap-1 py-0 px-2"
                                                disabled={isTranslating === 'subtitle'}
                                                onClick={() => handleTranslate('subtitle', subtitle, setSubtitleEn)}
                                            >
                                                {isTranslating === 'subtitle' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                                                Fordítás
                                            </Button>
                                        </div>
                                        <Input 
                                            value={subtitleEn} 
                                            onChange={(e) => setSubtitleEn(e.target.value)} 
                                            placeholder="e.g. Cultural Association" 
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4 pt-4">
                        <h4 className="text-lg font-medium border-b pb-2">Gombok (Opcionális)</h4>
                        <p className="text-xs text-gray-500">Ha csak egy gomb van kitöltve, az középre kerül.</p>

                        {/* Icon list for reference */}
                        {(() => {
                            const ICONS = [
                                { id: '', label: '(nincs ikon)' },
                                { id: 'calendar', label: 'Naptár' },
                                { id: 'ticket', label: 'Jegy' },
                                { id: 'info', label: 'Info' },
                                { id: 'music', label: 'Zene' },
                                { id: 'map-pin', label: 'Helyszín' },
                                { id: 'star', label: 'Csillag' },
                                { id: 'chevron-right', label: 'Nyíl' },
                                { id: 'heart', label: 'Szív' },
                                { id: 'phone', label: 'Telefon' },
                                { id: 'mail', label: 'Email' },
                                { id: 'globe', label: 'Web' },
                                { id: 'users', label: 'Rólunk' },
                                { id: 'play', label: 'Lejátszás' },
                            ];
                            const iconMap: Record<string, React.ReactNode> = {
                                'calendar': <Calendar className="w-4 h-4" />,
                                'ticket': <Ticket className="w-4 h-4" />,
                                'info': <Info className="w-4 h-4" />,
                                'music': <Music className="w-4 h-4" />,
                                'map-pin': <MapPin className="w-4 h-4" />,
                                'star': <Star className="w-4 h-4" />,
                                'chevron-right': <ChevronRight className="w-4 h-4" />,
                                'heart': <Heart className="w-4 h-4" />,
                                'phone': <Phone className="w-4 h-4" />,
                                'mail': <Mail className="w-4 h-4" />,
                                'globe': <Globe className="w-4 h-4" />,
                                'users': <Users className="w-4 h-4" />,
                                'play': <Play className="w-4 h-4" />,
                            };
                            const IconPicker = ({ value, onChange, label }: { value: string, onChange: (v: string) => void, label: string }) => (
                                <div className="space-y-2">
                                    <Label className="text-blue-600">{label}</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {ICONS.map(icon => (
                                            <button
                                                key={icon.id}
                                                type="button"
                                                title={icon.label}
                                                onClick={() => onChange(icon.id)}
                                                className={`flex items-center justify-center w-9 h-9 rounded border-2 transition-all ${
                                                    value === icon.id
                                                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                                                        : 'border-gray-200 hover:border-gray-400 text-gray-500'
                                                }`}
                                            >
                                                {icon.id ? iconMap[icon.id] : <span className="text-xs text-gray-400">—</span>}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            );
                            return (
                                <div className="grid grid-cols-2 gap-8">
                                    {/* Left Button Block */}
                                    <div className="space-y-4">
                                        {activeTab === 'hu' ? (
                                            <div>
                                                <Label className="text-blue-600">Bal Gomb Felirata (HU)</Label>
                                                <Input 
                                                    value={leftButtonLabel} 
                                                    onChange={(e) => setLeftButtonLabel(e.target.value)} 
                                                    placeholder="Pl. Események" 
                                                    className="mt-1"
                                                />
                                            </div>
                                        ) : (
                                            <div>
                                                <div className="flex justify-between items-center mt-1">
                                                    <Label className="text-blue-600">Bal Gomb Felirata (EN)</Label>
                                                    <Button 
                                                        type="button" 
                                                        variant="outline" 
                                                        size="sm" 
                                                        className="h-7 text-[10px] gap-1 py-0 px-2"
                                                        disabled={isTranslating === 'leftButtonLabel'}
                                                        onClick={() => handleTranslate('leftButtonLabel', leftButtonLabel, setLeftButtonLabelEn)}
                                                    >
                                                        {isTranslating === 'leftButtonLabel' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                                                        Fordítás
                                                    </Button>
                                                </div>
                                                <Input 
                                                    value={leftButtonLabelEn} 
                                                    onChange={(e) => setLeftButtonLabelEn(e.target.value)} 
                                                    placeholder="e.g. Events" 
                                                    className="mt-1"
                                                />
                                            </div>
                                        )}
                                        <div>
                                            <Label className="text-blue-600">Bal Gomb Link</Label>
                                            <Input 
                                                value={leftButtonLink} 
                                                onChange={(e) => setLeftButtonLink(e.target.value)} 
                                                placeholder="Pl. /events" 
                                                className="mt-1"
                                            />
                                        </div>
                                        <IconPicker value={leftButtonIcon} onChange={setLeftButtonIcon} label="Bal Gomb Ikon" />
                                    </div>
                                    
                                    {/* Right Button Block */}
                                    <div className="space-y-4">
                                        {activeTab === 'hu' ? (
                                            <div>
                                                <Label className="text-blue-600">Jobb Gomb Felirata (HU)</Label>
                                                <Input 
                                                    value={rightButtonLabel} 
                                                    onChange={(e) => setRightButtonLabel(e.target.value)} 
                                                    placeholder="Pl. Rólunk" 
                                                    className="mt-1"
                                                />
                                            </div>
                                        ) : (
                                            <div>
                                                <div className="flex justify-between items-center mt-1">
                                                    <Label className="text-blue-600">Jobb Gomb Felirata (EN)</Label>
                                                    <Button 
                                                        type="button" 
                                                        variant="outline" 
                                                        size="sm" 
                                                        className="h-7 text-[10px] gap-1 py-0 px-2"
                                                        disabled={isTranslating === 'rightButtonLabel'}
                                                        onClick={() => handleTranslate('rightButtonLabel', rightButtonLabel, setRightButtonLabelEn)}
                                                    >
                                                        {isTranslating === 'rightButtonLabel' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                                                        Fordítás
                                                    </Button>
                                                </div>
                                                <Input 
                                                    value={rightButtonLabelEn} 
                                                    onChange={(e) => setRightButtonLabelEn(e.target.value)} 
                                                    placeholder="e.g. About Us" 
                                                    className="mt-1"
                                                />
                                            </div>
                                        )}
                                        <div>
                                            <Label className="text-blue-600">Jobb Gomb Link</Label>
                                            <Input 
                                                value={rightButtonLink} 
                                                onChange={(e) => setRightButtonLink(e.target.value)} 
                                                placeholder="Pl. /about" 
                                                className="mt-1"
                                            />
                                        </div>
                                        <IconPicker value={rightButtonIcon} onChange={setRightButtonIcon} label="Jobb Gomb Ikon" />
                                    </div>
                                </div>
                            );
                        })()}
                    </div>

                </div>
                <div className="flex justify-between border-t p-6">
                    <Button variant="ghost" type="button" onClick={() => router.back()}>Mégse</Button>
                    <Button type="submit" disabled={isSaving || isUploading}>
                        {isSaving ? 'Mentés...' : 'Mentés'}
                    </Button>
                </div>
            </form>
        </div>
    )
}
