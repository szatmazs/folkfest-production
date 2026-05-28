'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
    GripVertical, 
    Eye, 
    EyeOff, 
    ChevronDown, 
    ChevronUp, 
    Type, 
    Link as LinkIcon, 
    Image as ImageIcon,
    Plus,
    Trash2,
    Upload
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MediaPicker } from './media/media-picker';

export type HomeSectionType = 'news' | 'somlo' | 'publications' | 'videos' | 'partners';

export interface HomeSection {
    id: HomeSectionType;
    isVisible: boolean;
    order: number;
    title?: string;
    titleEn?: string;
    buttonLabel?: string;
    buttonLabelEn?: string;
    buttonLink?: string;
    // Somlo specific
    logoUrl?: string;
    backgroundUrl?: string;
    posters?: { src: string; year: number }[];
}

interface HomeSectionEditorProps {
    sections: HomeSection[];
    onChange: (sections: HomeSection[]) => void;
}

export function HomeSectionEditor({ sections, onChange }: HomeSectionEditorProps) {
    const [expandedSection, setExpandedSection] = useState<string | null>(null);
    const [pickerOpen, setPickerOpen] = useState(false);
    const [pickerConfig, setPickerConfig] = useState<{
        type: 'background' | 'logo' | 'posters';
        sectionId: string;
        allowMultiple?: boolean;
    } | null>(null);

    // Language tabs state per section (default to HU)
    const [sectionTabs, setSectionTabs] = useState<Record<string, 'hu' | 'en'>>({});

    const getSectionTab = (id: string) => sectionTabs[id] || 'hu';
    const setSectionTab = (id: string, tab: 'hu' | 'en') => {
        setSectionTabs(prev => ({ ...prev, [id]: tab }));
    };

    const moveSection = (index: number, direction: 'up' | 'down') => {
        const newSections = [...sections];
        if (direction === 'up' && index > 0) {
            [newSections[index], newSections[index - 1]] = [newSections[index - 1], newSections[index]];
        } else if (direction === 'down' && index < sections.length - 1) {
            [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
        }
        // Update order field based on new index
        const ordered = newSections.map((s, i) => ({ ...s, order: i }));
        onChange(ordered);
    };

    const toggleVisibility = (id: string) => {
        onChange(sections.map(s => s.id === id ? { ...s, isVisible: !s.isVisible } : s));
    };

    const updateSection = (id: string, updates: Partial<HomeSection>) => {
        onChange(sections.map(s => s.id === id ? { ...s, ...updates } : s));
    };

    const sectionLabels: Record<HomeSectionType, string> = {
        news: 'Hírek, aktualitások',
        somlo: 'Somló Folkfest',
        publications: 'Kiadványaink',
        videos: 'Videógaléria',
        partners: 'Támogatóink és partnereink'
    };

    return (
        <div className="space-y-4">
            {sections.sort((a, b) => a.order - b.order).map((section, index) => {
                const activeTab = getSectionTab(section.id);
                return (
                    <div key={section.id} className={cn(
                        "border rounded-lg bg-white shadow-sm transition-all",
                        !section.isVisible && "opacity-60 bg-gray-50"
                    )}>
                        {/* Section Header */}
                        <div className="flex items-center gap-4 p-4">
                            <div className="flex flex-col gap-1">
                                <Button 
                                    type="button" variant="ghost" size="icon" className="h-6 w-6"
                                    onClick={() => moveSection(index, 'up')}
                                    disabled={index === 0}
                                >
                                    <ChevronUp className="w-4 h-4" />
                                </Button>
                                <Button 
                                    type="button" variant="ghost" size="icon" className="h-6 w-6"
                                    onClick={() => moveSection(index, 'down')}
                                    disabled={index === sections.length - 1}
                                >
                                    <ChevronDown className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="flex-1 font-semibold text-gray-800 flex items-center gap-2">
                                {sectionLabels[section.id]}
                                {!section.isVisible && <span className="text-xs font-normal text-gray-400 italic">(Rejtett)</span>}
                            </div>

                            <div className="flex items-center gap-2">
                                <Button 
                                    type="button" variant="ghost" size="icon" 
                                    onClick={() => toggleVisibility(section.id)}
                                    title={section.isVisible ? "Elrejtés" : "Megjelenítés"}
                                >
                                    {section.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                                </Button>
                                <Button 
                                    type="button" variant="outline" size="sm"
                                    onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                                >
                                    {expandedSection === section.id ? 'Bezárás' : 'Szerkesztés'}
                                </Button>
                            </div>
                        </div>

                        {/* Section Content */}
                        {expandedSection === section.id && (
                            <div className="p-6 border-t bg-gray-50/50 space-y-6 animate-in slide-in-from-top-2 duration-200">
                                {/* Language tabs inside expanded section */}
                                <div className="flex justify-between items-center bg-gray-100/50 p-1.5 rounded-lg border max-w-xs shadow-sm">
                                    <button
                                        type="button"
                                        onClick={() => setSectionTab(section.id, 'hu')}
                                        className={cn(
                                            "flex-1 py-1 rounded-md text-xs font-bold transition-all",
                                            activeTab === 'hu' ? "bg-white text-black shadow-sm" : "text-gray-400 hover:text-gray-600"
                                        )}
                                    >
                                        MAGYAR
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSectionTab(section.id, 'en')}
                                        className={cn(
                                            "flex-1 py-1 rounded-md text-xs font-bold transition-all",
                                            activeTab === 'en' ? "bg-white text-black shadow-sm" : "text-gray-400 hover:text-gray-600"
                                        )}
                                    >
                                        ENGLISH
                                    </button>
                                </div>

                                {/* Title Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                        <Type className="w-4 h-4" /> Szekció Címe ({activeTab === 'hu' ? 'HU' : 'EN'})
                                    </label>
                                    {activeTab === 'hu' ? (
                                        <textarea 
                                            value={section.title || ''}
                                            onChange={(e) => updateSection(section.id, { title: e.target.value })}
                                            className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none bg-white"
                                            rows={2}
                                        />
                                    ) : (
                                        <textarea 
                                            value={section.titleEn || ''}
                                            onChange={(e) => updateSection(section.id, { titleEn: e.target.value })}
                                            className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none bg-white font-semibold"
                                            rows={2}
                                            placeholder="Section Title in English"
                                        />
                                    )}
                                </div>

                                {/* Button Fields (except for partners) */}
                                {section.id !== 'partners' && (
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                                <Type className="w-4 h-4" /> Gomb Felirata ({activeTab === 'hu' ? 'HU' : 'EN'})
                                            </label>
                                            {activeTab === 'hu' ? (
                                                <input 
                                                    type="text"
                                                    value={section.buttonLabel || ''}
                                                    onChange={(e) => updateSection(section.id, { buttonLabel: e.target.value })}
                                                    className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none bg-white"
                                                />
                                            ) : (
                                                <input 
                                                    type="text"
                                                    value={section.buttonLabelEn || ''}
                                                    onChange={(e) => updateSection(section.id, { buttonLabelEn: e.target.value })}
                                                    className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none bg-white font-semibold"
                                                    placeholder="Button Label in English"
                                                />
                                            )}
                                        </div>
                                        {['somlo', 'publications', 'videos'].includes(section.id) && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                                    <LinkIcon className="w-4 h-4" /> Gomb Hivatkozása (URL)
                                                </label>
                                                <input 
                                                    type="text"
                                                    value={section.buttonLink || ''}
                                                    onChange={(e) => updateSection(section.id, { buttonLink: e.target.value })}
                                                    className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none bg-white"
                                                    placeholder="/oldal-neve"
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}

                            {/* Somlo Specific: Logo & Background */}
                            {section.id === 'somlo' && (
                                <div className="space-y-6 pt-4 border-t">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                                <ImageIcon className="w-4 h-4" /> Háttérkép
                                            </label>
                                            <div 
                                                className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden group border-2 border-dashed border-gray-300 hover:border-blue-400 cursor-pointer"
                                                onClick={() => {
                                                    setPickerConfig({ type: 'background', sectionId: section.id });
                                                    setPickerOpen(true);
                                                }}
                                            >
                                                {section.backgroundUrl ? (
                                                    <img src={section.backgroundUrl} className="w-full h-full object-cover" alt="Background" />
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                                        <ImageIcon className="w-6 h-6 mb-1" />
                                                        <span className="text-xs text-center px-4">Választás a médiatárból</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                                <ImageIcon className="w-4 h-4" /> Logó
                                            </label>
                                            <div 
                                                className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group border-2 border-dashed border-gray-300 hover:border-blue-400 max-w-[200px] cursor-pointer"
                                                onClick={() => {
                                                    setPickerConfig({ type: 'logo', sectionId: section.id });
                                                    setPickerOpen(true);
                                                }}
                                            >
                                                {section.logoUrl ? (
                                                    <img src={section.logoUrl} className="w-full h-full object-contain p-4" alt="Logo" />
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                                        <ImageIcon className="w-6 h-6 mb-1" />
                                                        <span className="text-xs">Választás</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Posters Management */}
                                    <div className="pt-4 border-t">
                                        <label className="block text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                                            <ImageIcon className="w-4 h-4" /> Plakát Slider Elemei
                                        </label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                            {section.posters?.map((poster, pIndex) => (
                                                <div key={pIndex} className="relative aspect-[2/3] group rounded border overflow-hidden bg-white shadow-sm">
                                                    <img src={poster.src} className="w-full h-full object-cover" alt={`Poster ${poster.year}`} />
                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 gap-2">
                                                        <input 
                                                            type="number"
                                                            value={poster.year}
                                                            onChange={(e) => {
                                                                const newPosters = [...(section.posters || [])];
                                                                newPosters[pIndex].year = parseInt(e.target.value);
                                                                updateSection(section.id, { posters: newPosters });
                                                            }}
                                                            className="w-16 text-xs text-center bg-white text-black rounded px-1"
                                                        />
                                                        <button 
                                                            type="button"
                                                            onClick={() => {
                                                                const newPosters = section.posters?.filter((_, i) => i !== pIndex);
                                                                updateSection(section.id, { posters: newPosters });
                                                            }}
                                                            className="text-red-400 hover:text-red-600"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[10px] text-center py-0.5">
                                                        {poster.year}
                                                    </div>
                                                </div>
                                            ))}
                                            <div 
                                                className="flex flex-col items-center justify-center aspect-[2/3] border-2 border-dashed border-gray-300 rounded cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors text-gray-400"
                                                onClick={() => {
                                                    setPickerConfig({ type: 'posters', sectionId: section.id, allowMultiple: true });
                                                    setPickerOpen(true);
                                                }}
                                            >
                                                <Plus className="w-6 h-6 mb-1" />
                                                <span className="text-[10px] text-center px-2">Hozzáadás a médiatárból</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            );
        })}

            <MediaPicker 
                open={pickerOpen}
                onOpenChange={setPickerOpen}
                allowMultiple={pickerConfig?.allowMultiple}
                onSelect={(url) => {
                    if (!pickerConfig) return;
                    if (pickerConfig.type === 'background') {
                        updateSection(pickerConfig.sectionId, { backgroundUrl: url });
                    } else if (pickerConfig.type === 'logo') {
                        updateSection(pickerConfig.sectionId, { logoUrl: url });
                    }
                }}
                onSelectMultiple={(urls) => {
                    if (!pickerConfig || pickerConfig.type !== 'posters') return;
                    const newPosters = urls.map(url => ({
                        src: url,
                        year: new Date().getFullYear()
                    }));
                    const currentPosters = sections.find(s => s.id === pickerConfig.sectionId)?.posters || [];
                    updateSection(pickerConfig.sectionId, { posters: [...currentPosters, ...newPosters] });
                }}
            />
        </div>
    );
}
