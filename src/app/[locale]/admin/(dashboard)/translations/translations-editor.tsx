'use client'

import { useState, useCallback } from 'react'
import { saveTranslationFiles } from '@/app/actions/translations-admin'
import { Button } from '@/components/ui/button'
import { Save, Loader2, ChevronDown, ChevronRight } from 'lucide-react'

interface TranslationsEditorProps {
    initialHu: Record<string, any>
    initialEn: Record<string, any>
}

function flattenObject(obj: Record<string, any>, prefix = ''): Record<string, string> {
    return Object.keys(obj).reduce((acc, key) => {
        const fullKey = prefix ? `${prefix}.${key}` : key
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            Object.assign(acc, flattenObject(obj[key], fullKey))
        } else {
            acc[fullKey] = String(obj[key])
        }
        return acc
    }, {} as Record<string, string>)
}

function setNestedValue(obj: Record<string, any>, keyPath: string, value: string): Record<string, any> {
    const keys = keyPath.split('.')
    const result = { ...obj }
    let current: any = result
    for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] }
        current = current[keys[i]]
    }
    current[keys[keys.length - 1]] = value
    return result
}

function groupBySection(flat: Record<string, string>): Record<string, Record<string, string>> {
    const sections: Record<string, Record<string, string>> = {}
    for (const [key, value] of Object.entries(flat)) {
        const [section, ...rest] = key.split('.')
        if (!sections[section]) sections[section] = {}
        sections[section][rest.join('.')] = value
    }
    return sections
}

export function TranslationsEditor({ initialHu, initialEn }: TranslationsEditorProps) {
    const [hu, setHu] = useState(initialHu)
    const [en, setEn] = useState(initialEn)
    const [isSaving, setIsSaving] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({ common: true })

    const flatHu = flattenObject(hu)
    const flatEn = flattenObject(en)
    const sections = groupBySection(flatHu)

    const handleHuChange = useCallback((key: string, value: string) => {
        setHu(prev => setNestedValue(prev, key, value))
    }, [])

    const handleEnChange = useCallback((key: string, value: string) => {
        setEn(prev => setNestedValue(prev, key, value))
    }, [])

    const toggleSection = (section: string) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }))
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            await saveTranslationFiles(hu, en)
            setShowSuccess(true)
            setTimeout(() => setShowSuccess(false), 3000)
        } catch (e) {
            alert('Hiba a mentés során: ' + String(e))
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="max-w-5xl mx-auto pb-20">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-gray-50/90 backdrop-blur-sm border-b py-4 mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Fordítások szerkesztése</h1>
                    <p className="text-sm text-gray-500 mt-1">UI szövegek (menü, gombok, feliratok) szerkesztése HU/EN nyelven</p>
                </div>
                <div className="flex items-center gap-3">
                    {showSuccess && (
                        <span className="text-green-600 text-sm font-medium bg-green-50 px-3 py-1 rounded-full">
                            Sikeres mentés!
                        </span>
                    )}
                    <Button onClick={handleSave} disabled={isSaving} className="bg-black text-white hover:bg-gray-800 gap-2">
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Mentés
                    </Button>
                </div>
            </div>

            {/* Column headers */}
            <div className="grid grid-cols-[200px_1fr_1fr] gap-3 mb-2 px-4">
                <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Kulcs</div>
                <div className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                    <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded">🇭🇺 Magyar</span>
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">🇬🇧 English</span>
                </div>
            </div>

            {/* Sections */}
            <div className="space-y-3">
                {Object.entries(sections).map(([section, keys]) => (
                    <div key={section} className="bg-white rounded-lg border shadow-sm overflow-hidden">
                        <button
                            type="button"
                            onClick={() => toggleSection(section)}
                            className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-gray-50 transition-colors"
                        >
                            <span className="font-bold text-gray-800 capitalize">{section}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400">{Object.keys(keys).length} szöveg</span>
                                {openSections[section]
                                    ? <ChevronDown className="w-4 h-4 text-gray-400" />
                                    : <ChevronRight className="w-4 h-4 text-gray-400" />
                                }
                            </div>
                        </button>

                        {openSections[section] && (
                            <div className="border-t divide-y">
                                {Object.keys(keys).map((subKey) => {
                                    const fullKey = `${section}.${subKey}`
                                    const huVal = flatHu[fullKey] || ''
                                    const enVal = flatEn[fullKey] || ''
                                    return (
                                        <div key={fullKey} className="grid grid-cols-[200px_1fr_1fr] gap-3 items-start px-4 py-3 hover:bg-gray-50/50">
                                            <div className="text-xs font-mono text-gray-500 pt-2 break-all">{subKey}</div>
                                            <div>
                                                <input
                                                    type="text"
                                                    value={huVal}
                                                    onChange={e => handleHuChange(fullKey, e.target.value)}
                                                    className="w-full text-sm border rounded px-2 py-1.5 focus:ring-2 focus:ring-red-100 focus:border-red-300 outline-none"
                                                />
                                            </div>
                                            <div>
                                                <input
                                                    type="text"
                                                    value={enVal}
                                                    onChange={e => handleEnChange(fullKey, e.target.value)}
                                                    className="w-full text-sm border rounded px-2 py-1.5 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 outline-none"
                                                />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
