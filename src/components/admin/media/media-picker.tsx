'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Image as ImageIcon, Loader2, Upload, Search, CheckCircle2 } from 'lucide-react'

export interface MediaFile {
    url: string
    name: string
    date: string
    size: number
}

interface MediaPickerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSelect: (url: string) => void
    allowMultiple?: boolean
    onSelectMultiple?: (urls: string[]) => void
}

export function MediaPicker({ open, onOpenChange, onSelect, allowMultiple = false, onSelectMultiple }: MediaPickerProps) {
    const [files, setFiles] = useState<MediaFile[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [search, setSearch] = useState('')
    const [selectedUrls, setSelectedUrls] = useState<string[]>([])

    useEffect(() => {
        if (open) {
            loadMedia()
            setSelectedUrls([]) // reset selection when opened
        }
    }, [open])

    const loadMedia = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/media')
            if (res.ok) {
                const data = await res.json()
                setFiles(data)
            }
        } catch (error) {
            console.error('Failed to load media:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const filteredFiles = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))

    const toggleSelection = (url: string) => {
        if (!allowMultiple) {
            onSelect(url)
            onOpenChange(false)
            return
        }

        setSelectedUrls(prev => 
            prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]
        )
    }

    const handleConfirmMultiple = () => {
        if (onSelectMultiple && selectedUrls.length > 0) {
            onSelectMultiple(selectedUrls)
            onOpenChange(false)
        }
    }

    return (
        <Modal isOpen={open} onClose={() => onOpenChange(false)} className="max-w-5xl w-[90vw] h-[80vh] p-0 overflow-hidden flex flex-col">
            <div className="flex flex-col h-full w-full bg-white">
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <ImageIcon className="w-5 h-5" />
                        Médiatár
                    </h2>
                    
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Keresés..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="pl-9 pr-4 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                            />
                        </div>

                        <div className="relative">
                            <Button 
                                variant="outline" 
                                className="gap-2 border-dashed border-gray-400 hover:border-black hover:bg-black hover:text-white transition-all"
                                disabled={isLoading}
                                asChild
                            >
                                <label className="cursor-pointer">
                                    <Upload className="w-4 h-4" />
                                    Új feltöltés
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        accept="image/*"
                                        multiple
                                        onChange={async (e) => {
                                            const selectedFiles = e.target.files;
                                            if (!selectedFiles || selectedFiles.length === 0) return;
                                            
                                            setIsLoading(true);
                                            const formData = new FormData();
                                            Array.from(selectedFiles).forEach(f => formData.append('file', f));

                                            try {
                                                const res = await fetch('/api/upload', {
                                                    method: 'POST',
                                                    body: formData
                                                });
                                                if (res.ok) {
                                                    const data = await res.json();
                                                    await loadMedia(); // Refresh list
                                                    
                                                    // Auto select new file(s)
                                                    const newUrls = data.paths || [data.path];
                                                    if (allowMultiple) {
                                                        setSelectedUrls(prev => [...prev, ...newUrls]);
                                                    } else {
                                                        onSelect(newUrls[0]);
                                                        onOpenChange(false);
                                                    }
                                                }
                                            } catch (error) {
                                                console.error('Upload failed:', error);
                                            } finally {
                                                setIsLoading(false);
                                            }
                                        }}
                                    />
                                </label>
                            </Button>
                        </div>

                        {allowMultiple && selectedUrls.length > 0 && (
                            <Button onClick={handleConfirmMultiple} className="bg-black text-white hover:bg-gray-800 gap-2">
                                <CheckCircle2 className="w-4 h-4" />
                                Kijelöltek beszúrása ({selectedUrls.length})
                            </Button>
                        )}
                        <Button variant="outline" onClick={() => onOpenChange(false)}>Bezárás</Button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                        </div>
                    ) : filteredFiles.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <ImageIcon className="w-12 h-12 mb-4 opacity-20" />
                            <p>Nincsenek feltöltött fájlok{search ? ' a keresési feltételekkel' : ''}.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {filteredFiles.map((file) => {
                                const isSelected = selectedUrls.includes(file.url)
                                const isImage = file.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)
                                
                                return (
                                    <div 
                                        key={file.url}
                                        onClick={() => toggleSelection(file.url)}
                                        className={`group relative aspect-square bg-gray-100 border rounded-lg overflow-hidden cursor-pointer hover:border-black transition-colors ${
                                            isSelected ? 'ring-2 ring-black border-transparent' : 'border-gray-200'
                                        }`}
                                    >
                                        {isImage ? (
                                            <img 
                                                src={file.url} 
                                                alt={file.name}
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center break-all">
                                                <div className="text-3xl font-bold text-gray-300 mb-2">EXT</div>
                                                <div className="text-xs text-gray-600 line-clamp-2">{file.name}</div>
                                            </div>
                                        )}
                                        
                                        {isSelected && (
                                            <div className="absolute top-2 right-2 bg-black text-white rounded-full p-0.5">
                                                <CheckCircle2 className="w-4 h-4" />
                                            </div>
                                        )}

                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <p className="text-[10px] text-white truncate" title={file.name}>
                                                {file.name}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    )
}
