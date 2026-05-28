'use client'

import { useState } from 'react'
import { updatePasswordAction } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Save, Loader2, Key } from 'lucide-react'

export default function AccountForm() {
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null)

    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true)
        setMessage(null)
        try {
            await updatePasswordAction(formData)
            setMessage({ text: 'Jelszó sikeresen megváltoztatva!', type: 'success' })
            // Clear inputs
            const form = document.querySelector('form') as HTMLFormElement
            form.reset()
        } catch (e: any) {
            setMessage({ text: e.message || 'Hiba történt a jelszó módosítása során.', type: 'error' })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form action={handleSubmit} className="max-w-2xl">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Key className="w-6 h-6" /> Admin Fiók Beállítások
                </h1>
                <Button type="submit" disabled={isLoading} className="bg-black text-white hover:bg-gray-900 flex items-center gap-2">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Jelszó Frissítése
                </Button>
            </div>

            {message && (
                <div className={`p-4 rounded mb-6 ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                    {message.text}
                </div>
            )}

            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Jelszó Megváltoztatása</h2>
                <div className="grid gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Jelenlegi jelszó</label>
                        <input
                            type="password"
                            name="oldPassword"
                            required
                            className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-black/5 outline-none transition-all"
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 pt-4 border-t">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Új jelszó</label>
                            <input
                                type="password"
                                name="newPassword"
                                required
                                minLength={6}
                                className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-black/5 outline-none transition-all"
                            />
                            <p className="mt-1 text-xs text-gray-500 text-italic">Legalább 6 karakter</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Új jelszó megerősítése</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                required
                                minLength={6}
                                className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-black/5 outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-12 bg-gray-50 p-6 rounded-lg border border-dashed border-gray-300">
                <h3 className="font-semibold text-gray-800 mb-2">További biztonsági javaslatok:</h3>
                <ul className="text-sm text-gray-600 space-y-2 list-disc ml-5">
                    <li>Használj egyedi, hosszú jelszót, amit máshol nem használsz.</li>
                    <li>A jelszó tartalmazzon kis- és nagybetűket, számokat és speciális karaktereket.</li>
                    <li>Éles környezetben tilos a gyári (például .env-ben lévő alapértelmezett) jelszavak használata.</li>
                    <li>Rendszeresen változtasd meg a jelszavadat, ha több ember is hozzáfér az admin felülethez.</li>
                </ul>
            </div>
        </form>
    )
}
