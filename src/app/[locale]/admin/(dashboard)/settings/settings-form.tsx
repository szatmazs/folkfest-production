'use client';

import { useState } from 'react';
import { updateHomeSettings } from '@/app/actions/settings-admin';
import { HomeSettings } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Save, Loader2, Home, Languages } from 'lucide-react';
import { HomeSection, HomeSectionEditor } from '@/components/admin/home-section-editor';

export default function SettingsForm({ 
    initialSettings 
}: { 
    initialSettings: HomeSettings | null
}) {
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState<string | null>(null)

    const [sections, setSections] = useState<HomeSection[]>(() => {
        if (initialSettings?.sections) {
            try {
                return JSON.parse(initialSettings.sections);
            } catch (e) {
                return [];
            }
        }
        return [];
    });


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true)
        setMessage(null)

        const formData = new FormData(e.currentTarget);
        formData.set('sections', JSON.stringify(sections));

        try {
            const res = await updateHomeSettings(formData)
            if (res.success) {
                setMessage('Beállítások sikeresen mentve!')
            } else {
                setMessage(`Hiba történt a mentés során: ${res.error}`)
            }
            setTimeout(() => setMessage(null), 3000);
        } catch (e: any) {
            setMessage(`Hiba történt a mentés során: ${e.message}`)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-4xl space-y-8 pb-20">
            <div className="flex items-center justify-between sticky top-0 bg-gray-50/90 backdrop-blur-sm z-30 py-4 border-b">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Home className="w-6 h-6 text-blue-600" /> Kezdőlap Beállításai
                    </h1>
                </div>
                
                <div className="flex items-center gap-3">
                    <Button type="submit" disabled={isLoading} className="bg-black text-white hover:bg-gray-900 flex items-center gap-2 min-w-[120px]">
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Mentés
                    </Button>
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded-lg animate-in fade-in slide-in-from-top-2 border ${message.includes('Hiba') ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                    {message}
                </div>
            )}

            <div className="space-y-12">
                {/* Sections Order */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border space-y-6">
                    <div className="flex items-center gap-2 border-b pb-4">
                        <Languages className="w-5 h-5 text-purple-500" />
                        <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider">Blokkok sorrendje</h2>
                    </div>
                    <HomeSectionEditor sections={sections} onChange={setSections} />
                </div>
            </div>
        </form>
    )
}
