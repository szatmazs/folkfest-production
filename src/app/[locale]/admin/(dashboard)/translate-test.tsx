'use client'

import { useState } from 'react'
import { autoTranslateSettingsAction } from '@/app/actions/settings-admin'

export function TranslateTest() {
    const [text, setText] = useState('Hírek')
    const [result, setResult] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleTest() {
        setLoading(true)
        setError(null)
        try {
            console.log('[TranslateTest] Sending text:', text)
            const res = await autoTranslateSettingsAction(text)
            console.log('[TranslateTest] Received result:', res)
            setResult(res)
        } catch (e) {
            setError(String(e))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-4 border rounded bg-gray-50 space-y-4">
            <h3 className="font-bold">Fordítás Teszt (DeepL)</h3>
            <div className="flex gap-2">
                <input 
                    type="text" 
                    value={text} 
                    onChange={(e) => setText(e.target.value)}
                    className="border px-2 py-1 rounded flex-1"
                />
                <button 
                    onClick={handleTest}
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-1 rounded disabled:opacity-50"
                >
                    {loading ? 'Fordítás...' : 'Teszt'}
                </button>
            </div>
            {result && <div className="text-sm">Eredmény: <span className="font-bold">{result}</span></div>}
            {error && <div className="text-sm text-red-600 font-mono">Hiba: {error}</div>}
            <p className="text-xs text-gray-500">Nézd meg a böngésző konzolját (F12) is a részletekért.</p>
        </div>
    )
}
