'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { uploadMedia } from '@/app/actions/media-upload';
import {
    Type, Image as ImageIcon, Video, Images,
    Trash2, ArrowUp, ArrowDown, Plus, Loader2, X,
    Heading1, Map as MapIcon, ImagePlus,
    Facebook, Youtube, Instagram, Mail, MapPin, Phone, Globe, Twitter, Linkedin, Hexagon, Link as LinkIcon, Copy
} from 'lucide-react';
import { MediaPicker } from './media/media-picker';

export type BlockType = 'text' | 'image' | 'gallery' | 'video' | 'heading' | 'map' | 'logo' | 'icon-text' | 'icon-link' | 'support-card';

export interface Block {
    id: string;
    type: BlockType;
    content?: string; // for text, icon-text content
    url?: string; // for image, video, icon-text link, icon-link url
    caption?: string; // for image
    images?: string[]; // for gallery
    level?: number; // for heading (1, 2, 3, 4)
    variant?: 'default' | 'slab-quote' | 'slab-impact' | 'slab-clean' | 'invert';
    icon?: string; // for icon-text and icon-link (e.g. 'facebook', 'mail')
    title?: string; // for support-card
    buttonLabel?: string; // for support-card
    buttonLink?: string; // for support-card
}

interface BlockEditorProps {
    initialContent: string;
    onChange: (content: string) => void;
}

export function BlockEditor({ initialContent, onChange }: BlockEditorProps) {
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    const lastSentContent = useRef(initialContent);

    useEffect(() => {
        if (isInitialized) return;

        try {
            // Try to parse as JSON blocks
            const parsed = JSON.parse(initialContent);
            if (Array.isArray(parsed)) {
                setBlocks(parsed);
            } else {
                throw new Error('Not an array');
            }
        } catch (e) {
            // Fallback: treat as single text block if content exists
            if (initialContent) {
                setBlocks([{
                    id: crypto.randomUUID(),
                    type: 'text',
                    content: initialContent
                }]);
            }
        }
        setIsInitialized(true);
    }, [initialContent, isInitialized]);

    useEffect(() => {
        if (!isInitialized) return;
        const serialized = JSON.stringify(blocks);
        lastSentContent.current = serialized;
        onChange(serialized);
    }, [blocks, onChange, isInitialized]);

    useEffect(() => {
        // If the parent component changes initialContent externally (e.g. from translation),
        // we update our local blocks state to match it.
        if (isInitialized && initialContent !== lastSentContent.current) {
            try {
                const parsed = JSON.parse(initialContent);
                if (Array.isArray(parsed)) {
                    setBlocks(parsed);
                    lastSentContent.current = initialContent;
                }
            } catch (e) {
                // Ignore parse errors for external updates
            }
        }
    }, [initialContent, isInitialized]);

    const addBlock = (type: BlockType) => {
        const newBlock: Block = {
            id: crypto.randomUUID(),
            type,
            content: '',
            url: '',
            images: [],
            level: type === 'heading' ? 2 : undefined
        };
        setBlocks([...blocks, newBlock]);
    };

    const duplicateBlock = (block: Block) => {
        const newBlock: Block = {
            ...block,
            id: crypto.randomUUID()
        };
        setBlocks([...blocks, newBlock]);
    };

    const removeBlock = (id: string) => {
        if (confirm('Biztosan törölni szeretnéd ezt a blokkot?')) {
            setBlocks(blocks.filter(b => b.id !== id));
        }
    };

    const moveBlock = (index: number, direction: 'up' | 'down') => {
        const newBlocks = [...blocks];
        if (direction === 'up' && index > 0) {
            [newBlocks[index], newBlocks[index - 1]] = [newBlocks[index - 1], newBlocks[index]];
        } else if (direction === 'down' && index < blocks.length - 1) {
            [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
        }
        setBlocks(newBlocks);
    };

    const updateBlock = (id: string, updates: Partial<Block>) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, ...updates } : b));
    };

    if (!isInitialized) return null;

    return (
        <div className="space-y-8">
            <div className="space-y-4">
                {blocks.map((block, index) => (
                    <div key={block.id} className="border rounded-lg bg-gray-50/50 relative group">
                        {/* Block Controls */}
                        <div className="absolute right-2 top-2 flex items-center gap-1 opacity-100 transition-opacity bg-white/90 p-1 rounded border shadow-sm z-20">
                            <Button
                                type="button"
                                variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-black"
                                onClick={() => moveBlock(index, 'up')}
                                disabled={index === 0}
                            >
                                <ArrowUp className="w-4 h-4" />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-black"
                                onClick={() => moveBlock(index, 'down')}
                                disabled={index === blocks.length - 1}
                            >
                                <ArrowDown className="w-4 h-4" />
                            </Button>
                            <div className="w-px h-4 bg-gray-300 mx-1" />
                            <Button
                                type="button"
                                variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                onClick={() => duplicateBlock(block)}
                                title="Blokk másolása"
                            >
                                <Copy className="w-3.5 h-3.5" />
                            </Button>
                            <div className="w-px h-4 bg-gray-300 mx-1" />
                            <Button
                                type="button"
                                variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => removeBlock(block.id)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Block Content */}
                        <div className="p-4 md:p-6 pt-12 md:pt-6">
                            {block.type === 'text' && (
                                <TextBlock
                                    block={block}
                                    onChange={(content) => updateBlock(block.id, { content })}
                                    onVariantChange={(variant) => updateBlock(block.id, { variant })}
                                />
                            )}
                            {block.type === 'image' && (
                                <ImageBlock
                                    block={block}
                                    onChange={(updates) => updateBlock(block.id, updates)}
                                />
                            )}
                            {block.type === 'gallery' && (
                                <GalleryBlock
                                    block={block}
                                    onChange={(images) => updateBlock(block.id, { images })}
                                />
                            )}
                            {block.type === 'video' && (
                                <VideoBlock
                                    block={block}
                                    onChange={(url) => updateBlock(block.id, { url })}
                                />
                            )}
                            {block.type === 'heading' && (
                                <HeadingBlock
                                    block={block}
                                    onChange={(updates) => updateBlock(block.id, updates)}
                                    onVariantChange={(variant) => updateBlock(block.id, { variant })}
                                />
                            )}
                            {block.type === 'map' && (
                                <MapBlock
                                    block={block}
                                    onChange={(url) => updateBlock(block.id, { url })}
                                />
                            )}
                            {block.type === 'logo' && (
                                <LogoBlock
                                    block={block}
                                    onChange={(updates) => updateBlock(block.id, updates)}
                                />
                            )}
                            {block.type === 'icon-text' && (
                                <IconTextBlock
                                    block={block}
                                    onChange={(updates) => updateBlock(block.id, updates)}
                                />
                            )}
                            {block.type === 'icon-link' && (
                                <IconLinkBlock
                                    block={block}
                                    onChange={(updates) => updateBlock(block.id, updates)}
                                />
                            )}
                            {block.type === 'support-card' && (
                                <SupportCardBlock
                                    block={block}
                                    onChange={(updates) => updateBlock(block.id, updates)}
                                />
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Block Widget */}
            <div className="border-t pt-8">
                <p className="text-sm text-gray-500 mb-4 font-medium uppercase tracking-wider text-center">Új blokk hozzáadása</p>
                <div className="flex flex-wrap justify-center gap-4">
                    <Button type="button" variant="outline" onClick={() => addBlock('heading')} className="gap-2 h-auto py-4 px-6 hover:border-black hover:bg-gray-50 transition-all">
                        <Heading1 className="w-5 h-5" />
                        <span className="font-semibold">Címsor</span>
                    </Button>
                    <Button type="button" variant="outline" onClick={() => addBlock('text')} className="gap-2 h-auto py-4 px-6 hover:border-black hover:bg-gray-50 transition-all">
                        <Type className="w-5 h-5" />
                        <span className="font-semibold">Szöveg</span>
                    </Button>
                    <Button type="button" variant="outline" onClick={() => addBlock('image')} className="gap-2 h-auto py-4 px-6 hover:border-black hover:bg-gray-50 transition-all">
                        <ImageIcon className="w-5 h-5" />
                        <span className="font-semibold">Kép</span>
                    </Button>
                    <Button type="button" variant="outline" onClick={() => addBlock('gallery')} className="gap-2 h-auto py-4 px-6 hover:border-black hover:bg-gray-50 transition-all">
                        <Images className="w-5 h-5" />
                        <span className="font-semibold">Galéria</span>
                    </Button>
                    <Button type="button" variant="outline" onClick={() => addBlock('video')} className="gap-2 h-auto py-4 px-6 hover:border-black hover:bg-gray-50 transition-all">
                        <Video className="w-5 h-5" />
                        <span className="font-semibold">Videó</span>
                    </Button>
                    <Button type="button" variant="outline" onClick={() => addBlock('map')} className="gap-2 h-auto py-4 px-6 hover:border-black hover:bg-gray-50 transition-all">
                        <MapIcon className="w-5 h-5" />
                        <span className="font-semibold">Térkép</span>
                    </Button>
                </div>
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                    <Button type="button" variant="outline" onClick={() => addBlock('logo')} className="gap-2 h-auto py-3 px-4 text-xs hover:border-black transition-all">
                        <Hexagon className="w-4 h-4" />
                        <span className="font-semibold">Logó</span>
                    </Button>
                    <Button type="button" variant="outline" onClick={() => addBlock('icon-text')} className="gap-2 h-auto py-3 px-4 text-xs hover:border-black transition-all">
                        <MapPin className="w-4 h-4" />
                        <span className="font-semibold">Ikon + Szöveg</span>
                    </Button>
                    <Button type="button" variant="outline" onClick={() => addBlock('icon-link')} className="gap-2 h-auto py-3 px-4 text-xs hover:border-black transition-all">
                        <LinkIcon className="w-4 h-4" />
                        <span className="font-semibold">Ikon Link</span>
                    </Button>
                    <Button type="button" variant="outline" onClick={() => addBlock('support-card')} className="gap-2 h-auto py-3 px-4 text-xs hover:border-black transition-all">
                        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z'/%3E%3C/svg%3E" alt="Heart" className="w-4 h-4" />
                        <span className="font-semibold">Támogatói Kártya</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}

// Sub-components

function TextBlock({ block, onChange, onVariantChange }: { block: Block; onChange: (content: string) => void; onVariantChange: (variant: Block['variant']) => void }) {
    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 pr-32">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500 uppercase tracking-wider">
                    <Type className="w-4 h-4" /> Szöveg blokk
                </div>
                <VariantSelector current={block.variant || 'default'} onChange={onVariantChange} />
            </div>
            <div
                style={{ fontFamily: 'var(--font-roboto-slab), serif' }}
                className={cn(
                    "transition-all duration-300 rounded-lg",
                    block.variant === 'slab-quote' && "bg-gray-50/80 p-8 border-y border-black/10 italic text-left",
                    block.variant === 'slab-impact' && "bg-[#1a1a1a] text-white p-8 md:p-12 font-black tracking-tight",
                    block.variant === 'slab-clean' && "p-8 md:p-12 border border-gray-100 font-light tracking-widest text-sm text-gray-800"
                )}
            >
                <RichTextEditor content={block.content || ''} onChange={onChange} className={cn(
                    "bg-transparent border-0 shadow-none font-serif",
                    block.variant === 'slab-quote' && "[&_.tiptap]:text-xl [&_.tiptap]:text-gray-800 [&_.tiptap]:text-left",
                    block.variant === 'slab-impact' && "[&_.tiptap]:text-white [&_.tiptap]:bg-transparent [&_.border-b]:bg-gray-700 [&_.border-b]:border-gray-600 [&_button:hover]:bg-gray-700 [&_.tiptap]:text-2xl",
                    block.variant === 'slab-clean' && "[&_.tiptap]:text-gray-800 [&_.tiptap]:uppercase"
                )} />
            </div>
        </div>
    );
}

function VariantSelector({ current, onChange }: { current: Block['variant']; onChange: (v: Block['variant']) => void }) {
    return (
        <div className="flex bg-gray-100 p-1 rounded-md border shadow-inner">
            {[
                { id: 'default', label: 'Alap' },
                { id: 'slab-quote', label: 'Slab Idézet' },
                { id: 'slab-impact', label: 'Slab Hangsúly' },
                { id: 'slab-clean', label: 'Slab Finom' }
            ].map((v) => (
                <button
                    key={v.id}
                    type="button"
                    onClick={() => onChange(v.id as any)}
                    className={cn(
                        "px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-all",
                        current === v.id
                            ? "bg-white text-black shadow-sm"
                            : "text-gray-400 hover:text-gray-600"
                    )}
                >
                    {v.label}
                </button>
            ))}
        </div>
    );
}

function ImageBlock({ block, onChange }: { block: Block; onChange: (updates: Partial<Block>) => void }) {
    const [uploading, setUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const performUpload = async (file: File) => {
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            
            const data = await res.json();
            
            if (data.path) {
                onChange({ url: data.path });
            } else if (data.error) {
                alert(data.error);
            }
        } catch (error: any) {
            console.error('Upload failed:', error);
            alert('Váratlan hiba történt a feltöltés során: ' + (error?.message || 'Ismeretlen hiba'));
        } finally {
            setUploading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        performUpload(file);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            performUpload(file);
        }
    };

    return (
        <div>
            <div className="flex items-center gap-2 mb-4 text-sm font-medium text-gray-500 uppercase tracking-wider">
                <ImageIcon className="w-4 h-4" /> Kép blokk
            </div>

            <div className="grid gap-4">
                {!block.url ? (
                    <div 
                        onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
                        onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }}
                        onDrop={onDrop}
                        className={cn(
                            "border-2 border-dashed rounded-lg p-8 text-center transition-all relative",
                            isDragging ? "border-black bg-gray-100 scale-[1.01]" : "border-gray-300 bg-gray-50 hover:bg-gray-100",
                            isDragging && "[&>*]:pointer-events-none"
                        )}
                    >
                        {uploading ? (
                            <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                        ) : (
                            <>
                                <ImageIcon className={cn("w-8 h-8 mx-auto mb-2", isDragging ? "text-black" : "text-gray-400")} />
                                <div className="text-sm text-gray-500 mb-4 font-medium">Húzd ide a képet vagy kattints a feltöltéshez</div>
                                <div className="flex flex-col gap-2 w-full max-w-[200px] mx-auto">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        id={`upload-${block.id}`}
                                        onChange={handleUpload}
                                    />
                                    <label htmlFor={`upload-${block.id}`} className="w-full">
                                        <Button variant="outline" asChild className="cursor-pointer w-full">
                                            <span>Feltöltés</span>
                                        </Button>
                                    </label>
                                    
                                    <Button 
                                        variant="outline" 
                                        onClick={() => document.getElementById(`media-picker-btn-${block.id}`)?.click()}
                                        className="w-full gap-2"
                                        type="button"
                                    >
                                        <ImagePlus className="w-4 h-4" /> Médiatár
                                    </Button>
                                    
                                    {/* Hidden picker trigger */}
                                    <div className="hidden">
                                        <MediaPickerTrigger 
                                            id={`media-picker-btn-${block.id}`}
                                            onSelect={(url) => onChange({ url })} 
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="relative group rounded-lg overflow-hidden border bg-gray-100 max-w-md">
                        <img src={block.url} alt="Preview" className="w-full h-auto" />
                        <button
                            type="button"
                            onClick={() => onChange({ url: '' })}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-medium">Képaláírás (opcionális)</label>
                    <input
                        type="text"
                        value={block.caption || ''}
                        onChange={(e) => onChange({ caption: e.target.value })}
                        className="w-full border rounded px-3 py-2 text-sm"
                        placeholder="Írd ide a képaláírást..."
                    />
                </div>
            </div>
        </div>
    );
}

function GalleryBlock({ block, onChange }: { block: Block; onChange: (images: string[]) => void }) {
    const [uploading, setUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const images = block.images || [];

    const performUpload = async (files: FileList | File[]) => {
        setUploading(true);
        try {
            const formData = new FormData();
            const fileArray = Array.from(files);
            
            let hasValidFiles = false;
            for (const file of fileArray) {
                if (file.type.startsWith('image/')) {
                    formData.append('file', file);
                    hasValidFiles = true;
                }
            }

            if (!hasValidFiles) return;

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.paths) {
                onChange([...images, ...data.paths]);
            } else if (data.path) {
                onChange([...images, data.path]);
            } else if (data.error) {
                throw new Error(data.error);
            }
        } catch (error: any) {
            console.error('Gallery upload failed:', error);
            alert('Hiba történt a galéria képeinek feltöltése során: ' + (error?.message || 'Ismeretlen hiba'));
        } finally {
            setUploading(false);
        }
    };
    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        performUpload(files);
        e.target.value = '';
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            performUpload(files);
        }
    };

    const removeImage = (index: number) => {
        onChange(images.filter((_, i) => i !== index));
    };

    return (
        <div>
            <div className="flex items-center gap-2 mb-4 text-sm font-medium text-gray-500 uppercase tracking-wider">
                <Images className="w-4 h-4" /> Galéria blokk
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {images.map((img, idx) => (
                    <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border bg-gray-100">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ))}

                <div 
                    onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
                    onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }}
                    onDrop={onDrop}
                    className={cn(
                        "aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-4 transition-all relative",
                        isDragging ? "border-black bg-gray-100 scale-105" : "border-gray-300 bg-gray-50 hover:bg-gray-100",
                        isDragging && "[&>*]:pointer-events-none"
                    )}
                >
                    {uploading ? (
                        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    ) : (
                        <>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                id={`gallery-upload-${block.id}`}
                                onChange={handleUpload}
                            />
                            <div className="flex gap-2">
                                <label htmlFor={`gallery-upload-${block.id}`} className="cursor-pointer flex flex-col items-center">
                                    <Plus className="w-6 h-6 text-gray-400 mb-1" />
                                    <span className="text-[10px] uppercase font-bold text-gray-500">Feltöltés</span>
                                </label>
                                
                                <div className="w-px h-8 bg-gray-300 mx-2 self-center"></div>
                                
                                <button
                                    type="button"
                                    onClick={() => document.getElementById(`media-picker-gallery-${block.id}`)?.click()}
                                    className="flex flex-col items-center text-gray-500 hover:text-black transition-colors"
                                >
                                    <ImagePlus className="w-6 h-6 mb-1" />
                                    <span className="text-[10px] uppercase font-bold">Médiatár</span>
                                </button>

                                <div className="hidden">
                                    <MediaPickerTrigger 
                                        id={`media-picker-gallery-${block.id}`}
                                        onSelectMultiple={(urls) => onChange([...images, ...urls])} 
                                        allowMultiple={true}
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function HeadingBlock({ block, onChange, onVariantChange }: { block: Block; onChange: (updates: Partial<Block>) => void; onVariantChange: (variant: Block['variant']) => void }) {
    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-2 pr-32">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-500 uppercase tracking-wider">
                        <Heading1 className="w-4 h-4" /> Címsor blokk
                    </div>
                    <div className="flex bg-gray-100 p-1 rounded-md">
                        {[1, 2, 3, 4].map((l) => (
                            <button
                                key={l}
                                type="button"
                                onClick={() => onChange({ level: l })}
                                className={cn(
                                    "px-3 py-1 text-xs font-bold rounded transition-all",
                                    (block.level || 2) === l
                                        ? "bg-white text-black shadow-sm"
                                        : "text-gray-400 hover:text-gray-600"
                                )}
                            >
                                H{l}
                            </button>
                        ))}
                    </div>
                </div>
                <VariantSelector current={block.variant || 'default'} onChange={onVariantChange} />
            </div>
            <div
                style={{ fontFamily: 'var(--font-roboto-slab), serif' }}
                className={cn(
                    "transition-all duration-300 rounded-lg p-2 flex flex-col",
                    block.variant === 'slab-quote' && "border-l-4 border-black pl-6 italic text-left",
                    block.variant === 'slab-impact' && "bg-[#1a1a1a] text-white p-6 md:p-10 tracking-tighter uppercase",
                    block.variant === 'slab-clean' && "border-b border-black/10 pb-4 tracking-[0.3em] font-light uppercase text-gray-800"
                )}
            >
                <input
                    type="text"
                    value={block.content || ''}
                    onChange={(e) => onChange({ content: e.target.value })}
                    placeholder="Írd ide a címsort..."
                    className={cn(
                        "w-full focus:outline-none bg-transparent font-bold transition-all font-serif",
                        (!block.variant || block.variant === 'default') && "border-b-2 border-gray-100 focus:border-black py-2",
                        block.variant === 'slab-impact' && "text-white font-black",
                        (block.level || 2) === 1 && "text-3xl md:text-5xl",
                        (block.level || 2) === 2 && "text-2xl md:text-4xl",
                        (block.level || 2) === 3 && "text-xl md:text-2xl",
                        (block.level || 2) === 4 && "text-lg md:text-xl"
                    )}
                />
            </div>
        </div>
    );
}

function MapBlock({ block, onChange }: { block: Block; onChange: (url: string) => void }) {
    return (
        <div>
            <div className="flex items-center gap-2 mb-4 text-sm font-medium text-gray-500 uppercase tracking-wider">
                <MapIcon className="w-4 h-4" /> Térkép blokk
            </div>
            <div className="space-y-4">
                <input
                    type="text"
                    value={block.url || ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Google Maps link (pl. https://goo.gl/maps/... vagy https://www.google.com/maps/...)"
                    className="w-full border rounded px-3 py-2 text-sm"
                />
                <p className="text-xs text-gray-400">
                    Tipp: Keresd meg a helyet a Google Térképen, és másold ide a böngészőből a linket.
                </p>
                {block.url && (
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border flex items-center justify-center">
                        <div className="text-center p-4">
                            <MapIcon className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                            <div className="text-xs text-gray-400 font-medium">Térkép előnézete (mentés után a weboldalon jelenik meg)</div>
                            <div className="text-[10px] text-gray-300 mt-1 break-all max-w-sm">{block.url}</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function VideoBlock({ block, onChange }: { block: Block; onChange: (url: string) => void }) {
    const videoId = block.url ? getYouTubeId(block.url) : null;

    return (
        <div>
            <div className="flex items-center gap-2 mb-4 text-sm font-medium text-gray-500 uppercase tracking-wider">
                <Video className="w-4 h-4" /> Videó blokk
            </div>

            <div className="space-y-4">
                <input
                    type="text"
                    value={block.url || ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="YouTube videó link (pl. https://www.youtube.com/watch?v=...)"
                    className="w-full border rounded px-3 py-2 text-sm"
                />

                {videoId && (
                    <div className="aspect-video bg-black rounded-lg overflow-hidden max-w-lg">
                        <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${videoId}`}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

// Helper
function getYouTubeId(url: string) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url?.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

function LogoBlock({ block, onChange }: { block: Block; onChange: (updates: Partial<Block>) => void }) {
    const [uploading, setUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const performUpload = async (file: File) => {
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            
            const data = await res.json();
            
            if (data.path) {
                onChange({ url: data.path });
            } else if (data.error) {
                alert(data.error);
            }
        } catch (error: any) {
            console.error('Logo upload failed:', error);
            alert('Hiba történt a logó feltöltése során: ' + (error?.message || 'Ismeretlen hiba'));
        } finally {
            setUploading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        performUpload(file);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            performUpload(file);
        }
    };

    return (
        <div>
            <div className="flex items-center gap-2 mb-4 text-sm font-medium text-gray-500 uppercase tracking-wider">
                <Hexagon className="w-4 h-4" /> Logó blokk
            </div>

            <div className="grid gap-4">
                {!block.url ? (
                    <div 
                        onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
                        onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }}
                        onDrop={onDrop}
                        className={cn(
                            "border-2 border-dashed rounded-lg p-8 text-center transition-all relative",
                            isDragging ? "border-black bg-gray-100 scale-[1.01]" : "border-gray-300 bg-gray-50 hover:bg-gray-100",
                            isDragging && "[&>*]:pointer-events-none"
                        )}
                    >
                        {uploading ? (
                            <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                        ) : (
                            <>
                                <Hexagon className={cn("w-8 h-8 mx-auto mb-2", isDragging ? "text-black" : "text-gray-400")} />
                                <div className="text-sm text-gray-500 mb-4 font-medium">Húzd ide a logót (pl. fehér vagy átlátszó PNG)</div>
                                <div className="flex flex-col gap-2 w-full max-w-[200px] mx-auto">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        id={`upload-logo-${block.id}`}
                                        onChange={handleUpload}
                                    />
                                    <label htmlFor={`upload-logo-${block.id}`} className="w-full">
                                        <Button variant="outline" asChild className="cursor-pointer w-full">
                                            <span>Feltöltés</span>
                                        </Button>
                                    </label>
                                    
                                    <Button 
                                        variant="outline" 
                                        onClick={() => document.getElementById(`media-picker-btn-logo-${block.id}`)?.click()}
                                        className="w-full gap-2"
                                        type="button"
                                    >
                                        <ImagePlus className="w-4 h-4" /> Médiatár
                                    </Button>
                                    
                                    <div className="hidden">
                                        <MediaPickerTrigger 
                                            id={`media-picker-btn-logo-${block.id}`}
                                            onSelect={(url) => onChange({ url })} 
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="relative group rounded-lg overflow-hidden border bg-gray-900 max-w-sm p-4">
                        <img 
                            src={block.url} 
                            alt="Preview" 
                            className={cn("w-full h-auto object-contain", block.variant === 'invert' ? 'invert brightness-0' : '')} 
                        />
                        <button
                            type="button"
                            onClick={() => onChange({ url: '' })}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                <div className="flex items-center gap-2 mt-2">
                    <input 
                        type="checkbox" 
                        id={`invert-${block.id}`} 
                        checked={block.variant === 'invert'}
                        onChange={(e) => onChange({ variant: e.target.checked ? 'invert' : 'default' })}
                        className="rounded border-gray-300"
                    />
                    <label htmlFor={`invert-${block.id}`} className="text-sm cursor-pointer">Sötét módhoz invertálás (feketéből fehér lesz)</label>
                </div>
            </div>
        </div>
    );
}

function IconTextBlock({ block, onChange }: { block: Block; onChange: (updates: Partial<Block>) => void }) {
    const icons = ['MapPin', 'Mail', 'Phone', 'Globe'];
    
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4 text-sm font-medium text-gray-500 uppercase tracking-wider">
                <MapPin className="w-4 h-4" /> Ikon + Szöveg (pl. Cím, Email)
            </div>
            
            <div className="flex gap-4 items-start">
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Ikon</label>
                    <select 
                        value={block.icon || 'MapPin'} 
                        onChange={(e) => onChange({ icon: e.target.value })}
                        className="w-full border rounded px-3 py-2 text-sm bg-white"
                    >
                        {icons.map(icon => (
                            <option key={icon} value={icon}>{icon}</option>
                        ))}
                    </select>
                </div>
                
                <div className="flex-1 space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Szöveg (HTML is használható)</label>
                    <textarea
                        value={block.content || ''}
                        onChange={(e) => onChange({ content: e.target.value })}
                        className="w-full border rounded px-3 py-2 text-sm min-h-[80px]"
                        placeholder="pl. 1024 Budapest,<br/>Fillér u. 74."
                    />
                </div>
            </div>
            
            <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase">Link URL (Opcionális)</label>
                <input
                    type="text"
                    value={block.url || ''}
                    onChange={(e) => onChange({ url: e.target.value })}
                    className="w-full border rounded px-3 py-2 text-sm"
                    placeholder="pl. mailto:info@folkfest.hu"
                />
            </div>
        </div>
    );
}

function IconLinkBlock({ block, onChange }: { block: Block; onChange: (updates: Partial<Block>) => void }) {
    const icons = ['Facebook', 'Youtube', 'Instagram', 'Twitter', 'Linkedin'];
    
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4 text-sm font-medium text-gray-500 uppercase tracking-wider">
                <LinkIcon className="w-4 h-4" /> Közösségi Ikon Link
            </div>
            
            <div className="flex gap-4 items-start">
                <div className="space-y-2 w-1/3">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Ikon</label>
                    <select 
                        value={block.icon || 'Facebook'} 
                        onChange={(e) => onChange({ icon: e.target.value })}
                        className="w-full border rounded px-3 py-2 text-sm bg-white"
                    >
                        {icons.map(icon => (
                            <option key={icon} value={icon}>{icon}</option>
                        ))}
                    </select>
                </div>
                
                <div className="flex-1 space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Cél URL</label>
                    <input
                        type="text"
                        value={block.url || ''}
                        onChange={(e) => onChange({ url: e.target.value })}
                        className="w-full border rounded px-3 py-2 text-sm"
                        placeholder="pl. https://facebook.com/..."
                    />
                </div>
            </div>
        </div>
    );
}

function SupportCardBlock({ block, onChange }: { block: Block; onChange: (updates: Partial<Block>) => void }) {
    const [uploading, setUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const performUpload = async (file: File) => {
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            
            const data = await res.json();
            
            if (data.path) {
                onChange({ url: data.path });
            } else if (data.error) {
                alert(data.error);
            }
        } catch (error: any) {
            console.error('Support image upload failed:', error);
            alert('Hiba történt a kép feltöltése során: ' + (error?.message || 'Ismeretlen hiba'));
        } finally {
            setUploading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        performUpload(file);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            performUpload(file);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4 text-sm font-medium text-gray-500 uppercase tracking-wider">
                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z'/%3E%3C/svg%3E" alt="Heart" className="w-4 h-4" /> Támogatói Kártya
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Szolgáltató Logó (Kép)</label>
                        {!block.url ? (
                            <div 
                                onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
                                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
                                onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }}
                                onDrop={onDrop}
                                className={cn(
                                    "border-2 border-dashed rounded-lg p-4 text-center transition-all relative",
                                    isDragging ? "border-black bg-gray-100 scale-[1.01]" : "border-gray-300 bg-gray-50 hover:bg-gray-100",
                                    isDragging && "[&>*]:pointer-events-none"
                                )}
                            >
                                {uploading ? (
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                                ) : (
                                    <>
                                        <div className="flex flex-col gap-2 w-full max-w-[200px] mx-auto">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                id={`upload-support-${block.id}`}
                                                onChange={handleUpload}
                                            />
                                            <label htmlFor={`upload-support-${block.id}`} className="w-full">
                                                <Button variant="outline" asChild className="cursor-pointer w-full text-xs">
                                                    <span>Feltöltés</span>
                                                </Button>
                                            </label>
                                            
                                            <Button 
                                                variant="outline" 
                                                onClick={() => document.getElementById(`media-picker-btn-support-${block.id}`)?.click()}
                                                className="w-full gap-2 text-xs"
                                                type="button"
                                            >
                                                <ImagePlus className="w-4 h-4" /> Médiatár
                                            </Button>
                                            
                                            <div className="hidden">
                                                <MediaPickerTrigger 
                                                    id={`media-picker-btn-support-${block.id}`}
                                                    onSelect={(url) => onChange({ url })} 
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="relative group rounded-lg overflow-hidden border bg-gray-50 p-4 h-32 flex items-center justify-center">
                                <img src={block.url} alt="Preview" className="max-w-full max-h-full object-contain" />
                                <button
                                    type="button"
                                    onClick={() => onChange({ url: '' })}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Cím</label>
                        <input
                            type="text"
                            value={block.title || ''}
                            onChange={(e) => onChange({ title: e.target.value })}
                            className="w-full border rounded px-3 py-2 text-sm font-bold"
                            placeholder="pl. Támogass Patreonon"
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Leírás</label>
                        <textarea
                            value={block.content || ''}
                            onChange={(e) => onChange({ content: e.target.value })}
                            className="w-full border rounded px-3 py-2 text-sm min-h-[80px]"
                            placeholder="Rövid leírás a támogatási módról..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Gomb Felirat</label>
                            <input
                                type="text"
                                value={block.buttonLabel || ''}
                                onChange={(e) => onChange({ buttonLabel: e.target.value })}
                                className="w-full border rounded px-3 py-2 text-sm"
                                placeholder="pl. Támogatom"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Gomb Link (URL)</label>
                            <input
                                type="text"
                                value={block.buttonLink || ''}
                                onChange={(e) => onChange({ buttonLink: e.target.value })}
                                className="w-full border rounded px-3 py-2 text-sm"
                                placeholder="pl. https://patreon.com/..."
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Wrapper to manage MediaPicker state locally inside sub-components
function MediaPickerTrigger({ onSelect, onSelectMultiple, allowMultiple = false, id }: { onSelect?: (url: string) => void, onSelectMultiple?: (urls: string[]) => void, allowMultiple?: boolean, id: string }) {
    const [open, setOpen] = useState(false);
    return (
        <>
            <button type="button" id={id} onClick={() => setOpen(true)}>Open</button>
            <MediaPicker 
                open={open} 
                onOpenChange={setOpen} 
                onSelect={onSelect || (() => {})} 
                onSelectMultiple={onSelectMultiple}
                allowMultiple={allowMultiple}
            />
        </>
    )
}
