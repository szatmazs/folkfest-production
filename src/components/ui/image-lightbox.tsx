'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import Image from 'next/image'

interface ImageLightboxProps {
    src: string
    alt: string
    className?: string
}

export function ImageLightbox({ src, alt, className }: ImageLightboxProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <div
                className={`cursor-pointer overflow-hidden rounded-lg group ${className}`}
                onClick={() => setIsOpen(true)}
            >
                <img
                    src={src}
                    alt={alt}
                    className="w-full h-auto block transition-transform duration-300 group-hover:scale-105"
                />
            </div>

            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-200"
                    onClick={() => setIsOpen(false)}
                >
                    <button
                        onClick={() => setIsOpen(false)}
                        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors p-2"
                    >
                        <X className="w-8 h-8" />
                    </button>

                    <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center">
                        <img
                            src={src}
                            alt={alt}
                            className="max-w-full max-h-full object-contain"
                            onClick={e => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </>
    )
}
