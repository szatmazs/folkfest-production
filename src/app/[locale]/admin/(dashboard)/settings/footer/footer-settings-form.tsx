'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { updateFooterSettings } from '@/app/actions/settings-admin'
import { BlockEditor } from '@/components/admin/block-editor'

interface FooterSettings {
    id: number
    brandContent: string | null
    contactContent: string | null
    socialContent: string | null
    bottomText: string | null
}

interface Props {
    initialSettings: FooterSettings
}

export default function FooterSettingsForm({ initialSettings }: Props) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [brandContent, setBrandContent] = useState(initialSettings.brandContent || '[]')
    const [contactContent, setContactContent] = useState(initialSettings.contactContent || '[]')
    const [socialContent, setSocialContent] = useState(initialSettings.socialContent || '[]')
    const [bottomText, setBottomText] = useState(initialSettings.bottomText || '')

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        setIsLoading(true)

        try {
            const formData = new FormData()
            formData.append('brandContent', brandContent)
            formData.append('contactContent', contactContent)
            formData.append('socialContent', socialContent)
            formData.append('bottomText', bottomText)

            const result = await updateFooterSettings(formData)
            
            if (result.success) {
                alert('Sikeresen mentve!')
                router.refresh()
            }
        } catch (error) {
            console.error('Hiba a mentés során:', error)
            alert('Hiba történt a mentés során.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={onSubmit} className="space-y-12">
            
            <div className="bg-white p-8 rounded-lg shadow-sm border space-y-8">
                <div>
                    <h2 className="text-xl font-bold mb-2">1. Oszlop (Védjegy / Logó / Leírás)</h2>
                    <p className="text-sm text-gray-500 mb-6">Ez a blokk dupla széles, itt jelenik meg a logó és a rövid leírás.</p>
                    <BlockEditor 
                        initialContent={brandContent}
                        onChange={setBrandContent}
                    />
                </div>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm border space-y-8">
                <div>
                    <h2 className="text-xl font-bold mb-2">2. Oszlop (Kapcsolat)</h2>
                    <p className="text-sm text-gray-500 mb-6">Kapcsolati adatok. Használhatsz sortöréseket és formázott szöveget.</p>
                    <BlockEditor 
                        initialContent={contactContent}
                        onChange={setContactContent}
                    />
                </div>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm border space-y-8">
                <div>
                    <h2 className="text-xl font-bold mb-2">3. Oszlop (Közösségi média)</h2>
                    <p className="text-sm text-gray-500 mb-6">Közösségi média linkek. Használhatsz sortöréseket és formázott szöveget.</p>
                    <BlockEditor 
                        initialContent={socialContent}
                        onChange={setSocialContent}
                    />
                </div>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm border space-y-8">
                <div>
                    <h2 className="text-xl font-bold mb-2">Alsó sáv (Copyright szöveg)</h2>
                    <p className="text-sm text-gray-500 mb-6">Az oldal legalján lévő rövid szöveg.</p>
                    <input 
                        type="text" 
                        value={bottomText} 
                        onChange={(e) => setBottomText(e.target.value)} 
                        className="w-full border rounded px-3 py-2 text-sm"
                        placeholder="© 2026 FolkFest Kulturális Egyesület. Minden jog fenntartva."
                    />
                </div>
            </div>

            <div className="flex justify-end sticky bottom-4 bg-white/80 backdrop-blur pb-4 pt-4 border-t px-4">
                <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                    {isLoading ? 'Mentés...' : 'Mentés'}
                </Button>
            </div>
        </form>
    )
}
