'use client'

import { useState } from 'react'
import { debugFacebookToken } from '@/app/actions/facebook-debug'
import { Button } from '@/components/ui/button'
import { ShieldCheck, ShieldAlert, Clock, Info, ShieldQuestion } from 'lucide-react'

export default function TokenDebugger() {
    const [status, setStatus] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(false)

    async function checkToken() {
        setIsLoading(true)
        const result = await debugFacebookToken()
        setStatus(result)
        setIsLoading(false)
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <ShieldQuestion className="w-5 h-5 text-blue-600" />
                        Facebook Token Ellenőrzés
                    </h2>
                    <p className="text-sm text-gray-500">Ellenőrizd az Access Token érvényességét és lejáratát.</p>
                </div>
                <Button
                    onClick={checkToken}
                    disabled={isLoading}
                    className="bg-blue-600 text-white hover:bg-blue-700"
                >
                    {isLoading ? 'Ellenőrzés...' : 'Token Vizsgálata'}
                </Button>
            </div>

            {status && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    {status.error ? (
                        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-lg text-red-700">
                            <ShieldAlert className="w-5 h-5 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="font-bold">Hiba történt</p>
                                <p className="text-sm">{status.error}</p>
                                {status.code && <p className="text-xs mt-1 opacity-70">Hibakód: {status.code}</p>}
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            <div className={`flex items-start gap-3 p-4 rounded-lg border ${status.isValid ? 'bg-green-50 border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
                                {status.isValid ? <ShieldCheck className="w-5 h-5 mt-0.5" /> : <ShieldAlert className="w-5 h-5 mt-0.5" />}
                                <div>
                                    <p className="font-bold">{status.isValid ? 'Érvényes Token' : 'Lejárt vagy érvénytelen Token'}</p>
                                    <p className="text-sm">Kapcsolódó oldal: <span className="font-semibold">{status.pageName}</span></p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 flex items-center gap-3">
                                    <Clock className="w-5 h-5 text-gray-500" />
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Lejárat Ideje</p>
                                        <p className="text-sm font-semibold">{status.expiresAt || 'Nincs adat'}</p>
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 flex items-center gap-3">
                                    <Info className="w-5 h-5 text-gray-500" />
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Típus / Alkalmazás</p>
                                        <p className="text-sm font-semibold">{status.type || 'Page'} ({status.application || 'Unknown App'})</p>
                                    </div>
                                </div>
                            </div>

                            {status.scopes && (
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-2">Engedélyek (Scopes)</p>
                                    <div className="flex flex-wrap gap-2 text-[11px]">
                                        {status.scopes.map((s: string) => (
                                            <span key={s} className="bg-white border px-2 py-0.5 rounded text-gray-600 font-medium">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
