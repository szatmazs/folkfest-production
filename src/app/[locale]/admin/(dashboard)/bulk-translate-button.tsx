'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { bulkTranslateAction } from '@/app/actions/bulk-translate'

export function BulkTranslateButton() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [error, setError] = useState<string | null>(null)

    async function handleBulkTranslate() {
        console.log('[BulkTranslateButton] Clicked');
        if (!confirm('Biztosan le szeretnéd fordítani az összes eddigi tartalmat? Ez több percig is eltarthat.')) return
        
        console.log('[BulkTranslateButton] Confirmed, starting action...');
        setStatus('loading')
        try {
            const result = await bulkTranslateAction()
            if (result.success && result.counts) {
                const c = result.counts;
                alert(`Sikeres fordítás!\n\nOldalak: ${c.pages}\nProjektek: ${c.projects}\nProjekt eredmények: ${c.results}\nVideók: ${c.videos}\nFacebook posztok: ${c.posts}\nMenüpontok: ${c.menu}\nBeállítások: ${c.settings}`)
                setStatus('idle')
                window.location.reload()
            } else {
                setStatus('error')
                setError(result.error || 'Ismeretlen hiba')
            }
        } catch (e) {
            setStatus('error')
            setError(String(e))
        }
    }

    return (
        <div className="flex flex-col gap-2">
            <Button 
                onClick={handleBulkTranslate}
                disabled={status === 'loading'}
                variant={status === 'success' ? 'outline' : 'default'}
                className={`gap-2 ${status === 'success' ? 'border-green-500 text-green-600' : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-none'}`}
            >
                {status === 'loading' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : status === 'success' ? (
                    <CheckCircle className="w-4 h-4" />
                ) : (
                    <Sparkles className="w-4 h-4" />
                )}
                {status === 'loading' ? 'Fordítás folyamatban...' : 
                 status === 'success' ? 'Sikeres fordítás!' : 
                 'Összes korábbi tartalom fordítása'}
            </Button>
            
            {status === 'error' && (
                <div className="flex items-center gap-2 text-red-500 text-xs bg-red-50 p-2 rounded border border-red-100">
                    <AlertCircle className="w-3 h-3" />
                    <span>Hiba: {error}</span>
                </div>
            )}
        </div>
    )
}
