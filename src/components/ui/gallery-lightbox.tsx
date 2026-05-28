'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface GalleryLightboxProps {
    images: string[]
    label?: string
}

export function GalleryLightbox({ images, label }: GalleryLightboxProps) {
    const [currentIndex, setCurrentIndex] = useState<number | null>(null)

    const isOpen = currentIndex !== null

    const handlePrevious = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation()
        if (currentIndex !== null) {
            setCurrentIndex((prev) => (prev! > 0 ? prev! - 1 : images.length - 1))
        }
    }, [currentIndex, images.length])

    const handleNext = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation()
        if (currentIndex !== null) {
            setCurrentIndex((prev) => (prev! < images.length - 1 ? prev! + 1 : 0))
        }
    }, [currentIndex, images.length])

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return
            if (e.key === 'Escape') setCurrentIndex(null)
            if (e.key === 'ArrowLeft') handlePrevious()
            if (e.key === 'ArrowRight') handleNext()
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, handlePrevious, handleNext])

    // Lock body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    if (!images || images.length === 0) return null

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {images.map((src, idx) => (
                    <div
                        key={idx}
                        className="cursor-zoom-in overflow-hidden rounded-lg group aspect-square relative"
                        onClick={() => setCurrentIndex(idx)}
                    >
                        <img
                            src={src}
                            alt={`${label || 'Galéria'} – ${idx + 1}`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    </div>
                ))}
            </div>

            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 animate-in fade-in duration-200"
                    onClick={() => setCurrentIndex(null)}
                >
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            setCurrentIndex(null)
                        }}
                        className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors p-2 z-50 bg-black/50 rounded-full"
                        aria-label="Bezárás"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    {images.length > 1 && (
                        <>
                            <button
                                onClick={handlePrevious}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors p-2 z-50 bg-black/50 hover:bg-black/70 rounded-full"
                                aria-label="Előző kép"
                            >
                                <ChevronLeft className="w-8 h-8" />
                            </button>
                            <button
                                onClick={handleNext}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors p-2 z-50 bg-black/50 hover:bg-black/70 rounded-full"
                                aria-label="Következő kép"
                            >
                                <ChevronRight className="w-8 h-8" />
                            </button>
                        </>
                    )}

                    <div className="relative w-full h-full flex flex-col items-center justify-center p-4 md:p-12">
                        <img
                            src={images[currentIndex]}
                            alt={`${label || 'Galéria'} – ${currentIndex + 1}`}
                            className="max-w-full max-h-full object-contain select-none"
                            onClick={(e) => e.stopPropagation()}
                            draggable={false}
                        />
                        
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm bg-black/50 px-3 py-1 rounded-full">
                            {currentIndex + 1} / {images.length}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
